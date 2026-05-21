"""vLLM 어댑터 — Anthropic SDK 호환 인터페이스 + OpenAI 호환 백엔드.

vLLM 은 *OpenAI 호환* (``/v1/chat/completions``) 엔드포인트가 안정적. _Anthropic 호환_
모드도 있지만 실험적이라 mini 는 OpenAI 호환만 다룬다.

핵심 디자인: ``agent.py`` 가 호출하는 *Anthropic SDK 인터페이스* (``client.messages.stream(...)``)
를 OpenAI 위에 흉내. ``agent.py`` 는 *백엔드 무지* — 어느 family 인지 모르고 같은 코드로 호출.

세 변환:
1. ``_convert_messages`` — Anthropic content blocks → OpenAI content + tool_calls + tool 결과
2. ``_convert_tools`` — Anthropic tool 스키마 → OpenAI function 스키마
3. 응답 — OpenAI tool_calls (조각 누적) → Anthropic tool_use block

흘리는 이벤트는 *text delta 만* — ``agent.py`` 가 그것만 보므로 (line 70~75 참조).
tool_use 는 stream 끝나고 ``get_final_message()`` 의 누적 응답에 들어간다.
"""
from __future__ import annotations
import json
from dataclasses import dataclass, field
from typing import Any, AsyncIterator, Literal

from pydantic import BaseModel


# ─── Anthropic-호환 응답 블록 (Pydantic — agent.py 가 .model_dump() 호출) ──


class TextBlock(BaseModel):
    type: Literal["text"] = "text"
    text: str


class ToolUseBlock(BaseModel):
    type: Literal["tool_use"] = "tool_use"
    id: str
    name: str
    input: dict[str, Any]


class VLLMResponse(BaseModel):
    """Anthropic ``Message`` 객체의 *기하학적 압축*. agent.py 가 보는 필드만 채움.

    ``response.content`` (블록 리스트) 와 ``response.stop_reason`` (문자열) 만 쓰임.
    """

    role: Literal["assistant"] = "assistant"
    content: list[TextBlock | ToolUseBlock]
    stop_reason: str  # "end_turn" | "tool_use" | "max_tokens" | ...
    model: str


# ─── stream 이벤트 — agent.py 가 보는 형태만 흉내 ────────────────


@dataclass
class _TextDelta:
    type: Literal["text_delta"] = "text_delta"
    text: str = ""


@dataclass
class _ContentBlockDelta:
    type: Literal["content_block_delta"] = "content_block_delta"
    delta: _TextDelta = field(default_factory=_TextDelta)


# ─── tool_call 누적 (OpenAI 의 chunk 가 조각으로 옴) ────────────────


@dataclass
class _ToolCallAcc:
    id: str = ""
    name: str = ""
    arguments: str = ""


# ─── 변환 함수 — 순수 함수, 단위 테스트 가능 ────────────────


def _convert_tools(tools: list[dict] | None) -> list[dict] | None:
    """Anthropic tool 스키마 → OpenAI function 스키마.

    Anthropic: ``{"name": "Read", "description": "...", "input_schema": {...}}``
    OpenAI:    ``{"type": "function", "function": {"name", "description", "parameters"}}``
    """
    if not tools:
        return None
    return [
        {
            "type": "function",
            "function": {
                "name": t["name"],
                "description": t.get("description", ""),
                "parameters": t.get("input_schema", {}),
            },
        }
        for t in tools
    ]


def _convert_messages(
    system: str | None, messages: list[dict]
) -> list[dict]:
    """Anthropic messages → OpenAI messages.

    - Anthropic ``system=`` 별도 인자 → OpenAI ``{"role": "system", ...}`` 첫 메시지
    - ``content`` 가 문자열이면 그대로
    - ``content`` 가 블록 리스트면 *블록별 변환*:
      * ``{"type": "text", "text": ...}`` → 텍스트 누적
      * ``{"type": "tool_use", "id", "name", "input"}`` → ``role=assistant`` + ``tool_calls``
      * ``{"type": "tool_result", "tool_use_id", "content"}`` → ``role=tool`` 메시지
    """
    out: list[dict] = []
    if system:
        out.append({"role": "system", "content": system})

    for msg in messages:
        role = msg.get("role")
        content = msg.get("content")

        # 단순 문자열 — 그대로
        if isinstance(content, str):
            out.append({"role": role, "content": content})
            continue

        # 블록 리스트 — 블록별 분리
        if not isinstance(content, list):
            continue

        # assistant 의 tool_use 블록은 *한 메시지의 tool_calls* 로 합침
        if role == "assistant":
            text_parts: list[str] = []
            tool_calls: list[dict] = []
            for block in content:
                btype = block.get("type")
                if btype == "text":
                    text_parts.append(block.get("text", ""))
                elif btype == "tool_use":
                    tool_calls.append({
                        "id": block["id"],
                        "type": "function",
                        "function": {
                            "name": block["name"],
                            "arguments": json.dumps(block.get("input", {})),
                        },
                    })
            assistant_msg: dict[str, Any] = {"role": "assistant"}
            if text_parts:
                assistant_msg["content"] = "".join(text_parts)
            else:
                # OpenAI 는 content=None 도 허용 (tool_calls 만 있을 때)
                assistant_msg["content"] = None
            if tool_calls:
                assistant_msg["tool_calls"] = tool_calls
            out.append(assistant_msg)
            continue

        # user 의 블록 — tool_result 가 섞여 있을 수 있음
        if role == "user":
            text_parts = []
            for block in content:
                btype = block.get("type")
                if btype == "text":
                    text_parts.append(block.get("text", ""))
                elif btype == "tool_result":
                    # OpenAI 의 tool 메시지 — 별도 entry
                    tool_content = block.get("content", "")
                    if isinstance(tool_content, list):
                        # 블록 리스트면 텍스트만 합쳐서
                        tool_content = "".join(
                            b.get("text", "") for b in tool_content
                            if isinstance(b, dict) and b.get("type") == "text"
                        )
                    out.append({
                        "role": "tool",
                        "tool_call_id": block["tool_use_id"],
                        "content": str(tool_content),
                    })
            if text_parts:
                out.append({"role": "user", "content": "".join(text_parts)})
            continue

    return out


def _map_finish_reason(openai_reason: str | None) -> str:
    """OpenAI finish_reason → Anthropic stop_reason."""
    mapping = {
        "stop": "end_turn",
        "tool_calls": "tool_use",
        "length": "max_tokens",
        "content_filter": "stop_sequence",
    }
    return mapping.get(openai_reason or "", openai_reason or "end_turn")


# ─── stream context — async with client.messages.stream(...) as stream ──


class _VLLMStreamContext:
    """async context manager + async iterator.

    agent.py 사용 패턴:

        async with client.messages.stream(...) as stream:
            async for event in stream:
                ...
            response = await stream.get_final_message()
    """

    def __init__(
        self,
        openai: Any,
        model: str,
        max_tokens: int,
        system: str | None,
        messages: list[dict],
        tools: list[dict] | None,
    ) -> None:
        self._openai = openai
        self._model = model
        self._max_tokens = max_tokens
        self._messages = _convert_messages(system, messages)
        self._tools = _convert_tools(tools)
        self._raw_stream: Any = None
        self._final: VLLMResponse | None = None

    async def __aenter__(self) -> "_VLLMStreamContext":
        kwargs: dict[str, Any] = {
            "model": self._model,
            "messages": self._messages,
            "max_tokens": self._max_tokens,
            "stream": True,
        }
        if self._tools:
            kwargs["tools"] = self._tools
        self._raw_stream = await self._openai.chat.completions.create(**kwargs)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        # OpenAI stream 은 close 메서드가 없음 — iterator 가 끝나면 자동 정리
        return None

    def __aiter__(self) -> AsyncIterator[_ContentBlockDelta]:
        return self._iterate()

    async def _iterate(self) -> AsyncIterator[_ContentBlockDelta]:
        accumulated_text = ""
        tool_calls: dict[int, _ToolCallAcc] = {}
        finish_reason: str | None = None

        async for chunk in self._raw_stream:
            if not chunk.choices:
                continue
            choice = chunk.choices[0]
            delta = choice.delta

            # text delta — agent.py 가 보는 유일한 이벤트
            if delta.content:
                accumulated_text += delta.content
                yield _ContentBlockDelta(delta=_TextDelta(text=delta.content))

            # tool_calls delta — 누적만 (이벤트로 흘리지 않음)
            if delta.tool_calls:
                for tc in delta.tool_calls:
                    idx = tc.index
                    if idx not in tool_calls:
                        tool_calls[idx] = _ToolCallAcc()
                    acc = tool_calls[idx]
                    if tc.id:
                        acc.id = tc.id
                    if tc.function:
                        if tc.function.name:
                            acc.name = tc.function.name
                        if tc.function.arguments:
                            acc.arguments += tc.function.arguments

            if choice.finish_reason:
                finish_reason = choice.finish_reason

        # stream 끝났음 — final response 조립
        content_blocks: list[TextBlock | ToolUseBlock] = []
        if accumulated_text:
            content_blocks.append(TextBlock(text=accumulated_text))
        for idx in sorted(tool_calls.keys()):
            acc = tool_calls[idx]
            try:
                tool_input = json.loads(acc.arguments) if acc.arguments else {}
            except json.JSONDecodeError:
                # 모델이 부분적 JSON 을 만든 경우 — _raw_arguments 로 보존
                tool_input = {"_raw_arguments": acc.arguments}
            content_blocks.append(
                ToolUseBlock(
                    id=acc.id or f"toolu_{idx}",
                    name=acc.name or "(unknown)",
                    input=tool_input,
                )
            )

        self._final = VLLMResponse(
            content=content_blocks,
            stop_reason=_map_finish_reason(finish_reason),
            model=self._model,
        )

    async def get_final_message(self) -> VLLMResponse:
        """``__aexit__`` 직전에 호출되는 게 정석 — async for 다 소비한 후."""
        if self._final is None:
            raise RuntimeError(
                "stream 을 끝까지 소비한 후 get_final_message() 를 호출해야 한다."
            )
        return self._final


# ─── public 어댑터 클래스 ────────────────


class _VLLMMessages:
    """``client.messages.stream(...)`` 한 메서드만 제공.

    agent.py 가 그것만 호출하므로 *최소 인터페이스*. ``create`` 등은 IN 안 함.
    """

    def __init__(self, openai: Any) -> None:
        self._openai = openai

    def stream(
        self,
        *,
        model: str,
        max_tokens: int,
        system: str | None = None,
        messages: list[dict],
        tools: list[dict] | None = None,
        **_extra: Any,
    ) -> _VLLMStreamContext:
        """Anthropic ``client.messages.stream(...)`` 시그니처 그대로.

        ``**_extra`` 로 *추가 인자 무시* — Anthropic SDK 의 다른 인자가 와도 안 깨짐.
        """
        return _VLLMStreamContext(
            openai=self._openai,
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=messages,
            tools=tools,
        )


class VLLMClient:
    """Anthropic SDK 호환 인터페이스 + OpenAI 호환 백엔드.

    agent.py 의 ``client.messages.stream(...)`` 호출이 *그대로* 작동한다.
    Anthropic 가족 (Vertex 포함) 과 *구조적 타이핑* 으로 호환.
    """

    def __init__(self, base_url: str, api_key: str = "dummy") -> None:
        from openai import AsyncOpenAI

        self._openai = AsyncOpenAI(base_url=base_url, api_key=api_key)
        self._messages = _VLLMMessages(self._openai)

    @property
    def messages(self) -> _VLLMMessages:
        return self._messages
