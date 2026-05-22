"""API 클라이언트 팩토리 — 07_1 의 mini 단순화.

진짜 Claude Code (07_1) 는 4 가지 백엔드 (Anthropic / Bedrock / Vertex / Foundry) 를
환경변수 한 글자로 분기. mini 는 사용자의 실제 환경 (Anthropic API 없음, GCP 여유,
vLLM 서빙) 에 맞춰 *2 가지만* — Vertex + vLLM.

핵심 디자인:
1. **구조적 타이핑** — 호출자 (agent.py) 가 ``client.messages.stream(...)`` 만 부르면
   되도록. Anthropic SDK 가족 (Vertex 포함) 은 같은 인터페이스, vLLM 은 어댑터.
2. **Lazy import** — 안 쓰는 백엔드 SDK 는 *디스크에 안 닿음*. ``if provider == ...``
   안에서만 import.
3. **호출자 무지** — agent.py 는 ``make_client()`` 가 무엇을 돌려주든 신경 안 씀.

OUT (사용자 환경에 안 맞음):
- Bedrock (AWS) — 사용자 계정 없음
- Foundry (Azure) — 사용자 환경 없음
- Anthropic 직접 — API 키 없음 (다만 명시적 provider=anthropic 안전망 유지)
"""

from __future__ import annotations
import os
from typing import Any


__all__ = ["make_client", "get_default_model"]


def make_client() -> Any:
    """환경변수로 분기. provider 별 클라이언트 인스턴스를 돌려준다.

    환경변수:
        MINI_LLM_PROVIDER: ``vertex`` (기본) | ``vllm`` | ``anthropic``

    Vertex 추가 환경변수:
        VERTEX_PROJECT_ID (또는 GCLOUD_PROJECT / GOOGLE_CLOUD_PROJECT)
        VERTEX_LOCATION (또는 CLOUD_ML_REGION — Anthropic SDK 표준.
            기본: global — Vertex 가 region 자동 라우팅. us-east5/europe-west1 등 명시도 가능)
        GOOGLE_APPLICATION_CREDENTIALS: service account JSON 경로

    vLLM 추가 환경변수:
        VLLM_BASE_URL (기본: http://localhost:8000/v1)
        VLLM_API_KEY (기본: dummy — vLLM 은 보통 key 검증 안 함)

    Anthropic 직접 (안전망):
        ANTHROPIC_API_KEY
    """
    provider = os.environ.get("MINI_LLM_PROVIDER", "vertex").lower().strip()

    if provider == "vertex":
        # ── Lazy import — anthropic SDK 0.40+ 는 Vertex 헬퍼 내장
        from anthropic import AsyncAnthropicVertex

        project_id = (
            os.environ.get("VERTEX_PROJECT_ID")
            or os.environ.get("GCLOUD_PROJECT")
            or os.environ.get("GOOGLE_CLOUD_PROJECT")
        )
        if not project_id:
            raise RuntimeError(
                "Vertex 사용 시 VERTEX_PROJECT_ID (또는 GCLOUD_PROJECT / "
                "GOOGLE_CLOUD_PROJECT) 환경변수 필수.\n"
                "GOOGLE_APPLICATION_CREDENTIALS 도 함께 설정해야 인증 가능."
            )
        region = (
            os.environ.get("VERTEX_LOCATION")
            or os.environ.get("CLOUD_ML_REGION")
            or "global"
        )
        return AsyncAnthropicVertex(project_id=project_id, region=region)

    if provider == "vllm":
        # ── Lazy import — openai SDK 는 vLLM 어댑터에서만 필요
        from .vllm_adapter import VLLMClient

        return VLLMClient(
            base_url=os.environ.get("VLLM_BASE_URL", "http://localhost:8000/v1"),
            api_key=os.environ.get("VLLM_API_KEY", "dummy"),
        )

    if provider == "anthropic":
        # ── 안전망 — 사용자가 ANTHROPIC_API_KEY 를 명시적으로 설정한 경우
        from anthropic import AsyncAnthropic

        return AsyncAnthropic()

    raise ValueError(
        f"Unknown MINI_LLM_PROVIDER: {provider!r}. "
        "지원: vertex (기본) | vllm | anthropic"
    )


def get_default_model() -> str:
    """provider 별 default model id. MINI_LLM_MODEL 환경변수가 우선.

    Vertex 의 Anthropic Claude 모델 ID 는 두 가지 형식:
    - *alias* (``claude-opus-4-7``) — Vertex 가 자동으로 최신 stable 버전으로
    - *명시 버전* (``claude-opus-4-1@20250805``) — 특정 release 고정

    학습자 환경의 Model Garden 에서 *enable 한 정확한 ID* 를 ``MINI_LLM_MODEL`` 로
    설정하는 게 안전. 미설정 시 *alias* 로 fallback — Model Garden 에서 해당 alias 가
    활성화되어 있어야 작동.

    vLLM 은 사용자가 띄운 모델에 의존하므로 *명시 필수*.
    """
    if env := os.environ.get("MINI_LLM_MODEL"):
        return env

    provider = os.environ.get("MINI_LLM_PROVIDER", "vertex").lower().strip()

    if provider == "vertex":
        # alias 형식 — Vertex Model Garden 에서 enable 되어 있으면 자동 라우팅
        return "claude-opus-4-7"

    if provider == "anthropic":
        return "claude-opus-4-6"

    if provider == "vllm":
        raise RuntimeError(
            "vLLM 사용 시 MINI_LLM_MODEL 환경변수 필수.\n"
            "예: MINI_LLM_MODEL=meta-llama/Llama-3.1-70B-Instruct\n"
            "(또는 vLLM 서버에 올라간 정확한 모델 이름)"
        )

    raise ValueError(f"Unknown provider for default model: {provider!r}")
