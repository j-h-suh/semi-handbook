# 8.1 AgentTool — 도구이면서 LLM을 호출하는 재귀

---

## 이 챕터에서 배우는 것

- Claude Code 안의 가장 이상한 도구 — **도구의 모습을 한 LLM 호출**
- 2.1의 에이전트 루프가 자기 자신을 부른다 — 그래서 멀티 에이전트가 가능해진다는 사실
- 5개의 외부 빌드 내장 에이전트 (+ ant-only `verification`) — `general-purpose`, `statusline-setup`, `Explore`, `Plan`, `claude-code-guide` (+ `verification`)
- 각 에이전트가 자기만의 시스템 프롬프트, 도구 화이트리스트/블랙리스트, 모델 선택을 갖는다
- 읽기 전용 에이전트(Explore/Plan)가 컨텍스트를 어떻게 다이어트 하는지 — **주당 ~15 Gtok 절약**

---

## 사용자 경험에서 출발

큰 코드베이스에서 **"인증 관련 코드 어디 있지?"** 같은 질문을 던지면 — Claude가 평소처럼 **Grep, Glob, Read** 를 직접 부르지 않는다. 대신 이런 게 뜬다.

```
● Agent (Explore)  ⎿  Searching codebase…

  • src/auth/middleware.ts
  • src/auth/oauth/provider.ts
  • src/auth/session/store.ts
```

**Explore** 라는 부하 에이전트가 자기 일을 한다. 30~60초쯤 뒤에 완성된 보고서를 들고 돌아온다. 메인 Claude는 결과만 받아 자기 컨텍스트에 끼워 넣는다 — **Grep 출력의 노이즈 없이**.

잠깐 — 이거 어떻게 가능하지? Claude가 **다른 Claude를 부르는** 것이다. 그것도 도구를 부르는 것처럼. 그런데 Tool 인터페이스는 함수다 (3.2). **함수가 어떻게 LLM 호출이 되지?**

이 챕터에서 — 그 트릭을 본다. 답: **AgentTool은 다른 모든 도구와 똑같이 생겼지만 `call()` 메서드가 2.1의 에이전트 루프를 자기 자신으로 부른다**. 재귀. 그게 전부.

---

## 본문

### **도구의 모습을 한 LLM**

`tools/AgentTool/AgentTool.tsx` — **1,398줄짜리 Tool 정의**. 다른 도구처럼 `buildTool({...})` 로 만들어진다. 같은 인터페이스, 같은 47개 필드 (3.2). 모델이 보기에는 그냥 평범한 도구. 입력 스키마는:

```typescript
// (축약: 실제 inputSchema 는 baseInputSchema 위에 multi-agent params (name, team_name, mode)
//        + isolation + cwd 를 더한 fullInputSchema. KAIROS feature 에 따라 cwd omit,
//        BACKGROUND_TASKS 비활성화 시 run_in_background 도 omit — AgentTool.tsx:90-125)
const baseInputSchema = lazySchema(() => z.object({
  description: z.string().describe('A short (3-5 word) description of the task'),
  prompt: z.string().describe('The task for the agent to perform'),
  subagent_type: z.string().optional().describe('The type of specialized agent…'),
  model: z.enum(['sonnet', 'opus', 'haiku']).optional(),
  run_in_background: z.boolean().optional(),
}))
```

`description`, `prompt`, `subagent_type`. 모델은 **"어느 종류의 에이전트한테 무엇을 시킬지"** 만 말한다. 입력만 보면 완전히 평범한 함수 호출.

근데 `call()` 안에서는…

```typescript
// runAgent.ts:248 — 함수 정의 시작
// query() 실제 호출은 line 748 — 사이에 ~500 줄의 setup
// (컨텍스트, 도구 풀, 권한 모드, 시스템 프롬프트, gitStatus 드롭, claudeMd 드롭,
//  worktree, fork 처리, sessionStart 등). createSubagentContext 는 8.2 에서.
export async function* runAgent({...}): AsyncGenerator<Message, void> {
  // ... ~500 줄의 setup ...
  
  for await (const message of query({       // ← 2.1의 에이전트 루프! (line 748)
    messages: initialMessages,
    systemPrompt: agentSystemPrompt,
    userContext: resolvedUserContext,
    systemContext: resolvedSystemContext,
    canUseTool,
    toolUseContext: agentToolUseContext,
    querySource,
    maxTurns: maxTurns ?? agentDefinition.maxTurns,
  })) {
    // ... 메시지 yield ...
  }
}
```

**그렇다. `query()` 가 다시 불린다**. 2.1의 에이전트 루프가 자기 자신을 호출한다. 부모 Claude의 한 도구 호출이 **자식 Claude의 전체 세션**을 그 도구의 응답으로 만들어낸다. Tool result로 돌아오는 텍스트가 — 자식 Claude의 최종 발화.

이게 왜 강력하지?

1. **모델은 변경 안 됨**. 새 클래스 만들 필요 없음. **같은 query 함수, 같은 루프, 같은 메시지 형식**. 그저 입력만 다르다.
2. **도구 인터페이스가 자연스럽게 재귀**된다. 자식 에이전트도 자기만의 도구 세트를 받는다 — 그 안에 또 **AgentTool**이 있을 수도 있다 (보통은 막지만).
3. **모델한테 자연스럽다**. LLM은 **"도구를 부른다"** 는 개념을 학습으로 안다. **"다른 LLM을 부른다"** 는 새 개념을 가르칠 필요가 없다.

> 💡 **진짜 비유.** Python에서 자기 자신을 부르는 함수를 재귀 함수라고 한다. AgentTool은 그것의 에이전트 버전. 재귀 에이전트. `query()` 가 자기 자신을 부르고, 부른 자식이 또 자식을 부를 수 있다 (제한 있음). **이게 멀티 에이전트 아키텍처의 전부 다 — 그 외엔 다 디테일**.

### 5(+1)개의 내장 에이전트

`builtInAgents.ts:22`. 플래그 게이트로 빌드별로 다르게 들어가는 에이전트 정의들.

```typescript
// (축약: CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS env var 분기 — SDK 사용자가 빈
//  슬레이트 원할 때 [] 반환. COORDINATOR_MODE 분기 — 8.3 떡밥. 등 생략)
export function getBuiltInAgents(): AgentDefinition[] {
  // … env/feature 게이트 …
  
  const agents: AgentDefinition[] = [
    GENERAL_PURPOSE_AGENT,    // 만능 - 모든 도구            ← 항상
    STATUSLINE_SETUP_AGENT,   // 상태줄 설정 도우미             ← 항상
  ]
  
  if (areExplorePlanAgentsEnabled()) {                      // ← tengu_amber_stoat (default true)
    agents.push(EXPLORE_AGENT, PLAN_AGENT)  // 읽기 전용 탐색/설계
  }
  
  if (isNonSdkEntrypoint) {                                 // ← 비-SDK 진입점만
    agents.push(CLAUDE_CODE_GUIDE_AGENT)    // 사용법 안내
  }
  
  if (feature('VERIFICATION_AGENT') && /* tengu_hive_evidence (default FALSE) */) {
    agents.push(VERIFICATION_AGENT)         // 답변 검증       ← ant-only (사실상)
  }
  
  return agents
}
```

즉 **외부 CLI 표준 빌드는 5개** (`general-purpose`, `statusline-setup`, `Explore`, `Plan`, `claude-code-guide`). `verification` 은 두 게이트가 모두 켜져야 들어오기 때문에 사실상 **ant-only**.

각 정의가 5가지 차원에서 다르다 — 시스템 프롬프트 / 도구 / 모델 / CLAUDE.md / 권한 모드.

| 에이전트 | 시스템 프롬프트 | 도구 | 모델 | CLAUDE.md | 권한 모드 |
|---|---|---|---|---|---|
| `general-purpose` | 만능 (코드 탐색/분석) | allowlist `['*']` (literal "`*`") | (intentionally omitted — `getDefaultSubagentModel()`) | 포함 | 부모 상속 |
| `Explore` | 읽기 전용 빠른 탐색 | `disallowedTools: [Agent, ExitPlanMode, Edit, Write, NotebookEdit]` | ant: `'inherit'` / 외부: **`'haiku'`** | 생략 | 부모 상속 |
| `Plan` | 읽기 전용 아키텍트 | Explore와 같음 | `'inherit'` (메인과 같은) | 생략 (단, Read 로 직접 접근 가능) | 부모 상속 |
| `claude-code-guide` | Claude Code/SDK/API 사용법 | allowlist `[GLOB, GREP, FILE_READ, WEB_FETCH, WEB_SEARCH]` (5개) | **`'haiku'`** | 포함 | **`'dontAsk'`** |
| `statusline-setup` | 상태줄 설정만 | allowlist **`['Read', 'Edit']`** (단 2개) | **`'sonnet'`** | 포함 | 부모 상속 |
| `verification` (ant-only) | 답변 사실 확인 | Explore와 같은 5개 denylist | **`'inherit'`** | 포함 | 부모 상속 |

`general-purpose` 만 **모델 omit** 이라는 점을 주목 — 나머지 5개 모두 명시적으로 모델을 박았다. **모델 선택이 암묵적인 경우는 만능 에이전트 단 하나뿐** — 나머지는 역할에 맞는 모델을 강제로 정해 준다 (탐색은 빠른 haiku, 코드 작성은 sonnet, 검증/계획은 부모 상속).

가장 흥미로운 둘이 **Explore**와 **Plan**이다. 자세히 보자.

### 읽기 전용 에이전트의 컨텍스트 다이어트

`built-in/exploreAgent.ts` — 일부러 모델한테 조심성을 주는 패턴이 가득.

```typescript
// exploreAgent.ts:26-36 (verbatim)
=== CRITICAL: READ-ONLY MODE - NO FILE MODIFICATIONS ===
This is a READ-ONLY exploration task. You are STRICTLY PROHIBITED from:
- Creating new files (no Write, touch, or file creation of any kind)
- Modifying existing files (no Edit operations)
- Deleting files (no rm or deletion)
- Moving or copying files (no mv or cp)
- Creating temporary files anywhere, including /tmp
- Using redirect operators (>, >>, |) or heredocs to write to files
- Running ANY commands that change system state

Your role is EXCLUSIVELY to search and analyze existing code. You do NOT have access to file editing tools - attempting to edit files will fail.
```

**대문자, CRITICAL, STRICTLY PROHIBITED**. **이걸 지키는 진짜 메커니즘은 그 다음에 있다**.

```typescript
export const EXPLORE_AGENT: BuiltInAgentDefinition = {
  agentType: 'Explore',
  disallowedTools: [
    AGENT_TOOL_NAME,           // 자식 에이전트가 또 자식을 부르는 거 막음
    EXIT_PLAN_MODE_TOOL_NAME,
    FILE_EDIT_TOOL_NAME,       // ← 진짜 차단
    FILE_WRITE_TOOL_NAME,
    NOTEBOOK_EDIT_TOOL_NAME,
  ],
  model: process.env.USER_TYPE === 'ant' ? 'inherit' : 'haiku',
  omitClaudeMd: true,
  // …
}
```

**`disallowedTools` 는 프롬프트 방어가 아니라 진짜 차단**. `availableTools` 어셈블 단계에서 이 도구들이 애초에 모델한테 안 보인다. 모델이 유혹받을 일조차 없다. 시스템 프롬프트의 강한 어조는 이중 방어 — 모델이 어떻게든 시도해도 (Bash로 redirect 같은 것) 거기서도 막힐 수 있게.

> ⚙️ **`verification` 은 3중 방어** (`verificationAgent.ts:139-151`). `disallowedTools` (진짜 차단) + 시스템 프롬프트 (이중 방어) + **별도의 `criticalSystemReminder_EXPERIMENTAL` 필드** (삼중 방어). 그 reminder verbatim: **"CRITICAL: This is a VERIFICATION-ONLY task. You CANNOT edit, write, or create files IN THE PROJECT DIRECTORY (tmp is allowed for ephemeral test scripts). You MUST end with VERDICT: PASS, VERDICT: FAIL, or VERDICT: PARTIAL."** — 역할과 출력 형식을 동시에 못박는다. 단일 system reminder 가 별도의 필드로 분리된 사실은 — 일반 시스템 프롬프트와 다른 우선순위로 주입할 수 있게 디자인된 것.

가장 깊은 디테일은 `runAgent.ts:385-393` 의 코멘트:

```typescript
// Read-only agents (Explore, Plan) don't act on commit/PR/lint rules from
// CLAUDE.md — the main agent has full context and interprets their output.
// Dropping claudeMd here saves ~5-15 Gtok/week across 34M+ Explore spawns.
// Explicit override.userContext from callers is preserved untouched.
// Kill-switch defaults true; flip tengu_slim_subagent_claudemd=false to revert.
const shouldOmitClaudeMd =
  agentDefinition.omitClaudeMd &&
  !override?.userContext &&
  getFeatureValue_CACHED_MAY_BE_STALE('tengu_slim_subagent_claudemd', true)
```

**주당 5-15 Giga-token 절약**. Explore 에이전트가 주당 3,400만 번 띄워진다는 사실이 코멘트에 들어 있다. 한 번에 CLAUDE.md(보통 2-5KB)를 생략하는 것만으로 — **Gtok 단위**의 토큰이 떨어진다. **그런데 kill-switch가 같이 박혀 있다** — `tengu_slim_subagent_claudemd` GrowthBook 게이트가 **기본 true** 지만, **언제든 flip 해서 fallback 할 수 있게** 무장. 5-15 Gtok/week 절약은 기본값에 의존. 프로덕션이 언제든 되돌릴 수 있게 디자인된 모범 사례.

같은 정신이 **gitStatus**에도 적용된다.

```typescript
// runAgent.ts:400-410
// Explore/Plan are read-only search agents — the parent-session-start
// gitStatus (up to 40KB, explicitly labeled stale) is dead weight. If they
// need git info they run `git status` themselves and get fresh data.
// Saves ~1-3 Gtok/week fleet-wide.
const { gitStatus: _omittedGitStatus, ...systemContextNoGit } = baseSystemContext
const resolvedSystemContext =
  agentDefinition.agentType === 'Explore' ||
  agentDefinition.agentType === 'Plan'
    ? systemContextNoGit
    : baseSystemContext
```

40KB의 `gitStatus` 가 — 읽기 전용 에이전트한테는 죽은 데이터. 필요하면 자기가 `git status` 부르면 된다. **주당 1-3 Gtok 추가 절약**. **단, 이건 `omitClaudeMd: true` 모든 에이전트가 아니라 명시적 화이트리스트** — `agentType === 'Explore' || agentType === 'Plan'` 두 에이전트에만 적용. CLAUDE.md 드롭은 더 일반적인 플래그 기반, gitStatus 드롭은 타입 화이트리스트 — 서로 다른 게이트 메커니즘이 우연이 아니라 안전 장치.

핵심 교훈: **에이전트는 자기에 맞는 컨텍스트만 받아야 한다**. 모든 자식이 부모의 풀 컨텍스트를 받으면 — **모든 비용이 N배**가 된다. 작은 에이전트는 작게 띄운다.

> 💡 **Plan 의 완전 차단이 아닌 CLAUDE.md 처리** (`planAgent.ts:88-89`). Plan 의 `omitClaudeMd: true` 옆 코멘트가 솔직: **"Plan is read-only and can Read CLAUDE.md directly if it needs conventions. Dropping it from context saves tokens without blocking access."** — 즉 완전 차단이 아니라 기본 컨텍스트에서 빼는 것. 모델이 필요하면 **Read tool 로 직접** 가져올 수 있음. **비용 절약과 접근성의 트레이드오프** — 기본은 빠지지만 의지가 있으면 접근 가능. 좋은 fallback 디자인.

### 모델한테 도구를 어떻게 설명하는가

`prompt.ts:66` — `getPrompt` 함수가 AgentTool의 **description**을 동적으로 생성한다.

```
Launch a new agent to handle complex, multi-step tasks autonomously.

The Agent tool launches specialized agents (subprocesses) that autonomously
handle complex tasks. Each agent type has specific capabilities and tools
available to it.

Available agent types and the tools they have access to:
- general-purpose: General-purpose agent for researching complex questions… (Tools: *)
- Explore: Fast agent specialized for exploring codebases… (Tools: All tools except Agent, ExitPlanMode, Edit, Write, NotebookEdit)
- Plan: Software architect agent for designing implementation plans… (Tools: All tools except Agent, ExitPlanMode, Edit, Write, NotebookEdit)
- claude-code-guide: Use this agent when the user asks questions…

When using the Agent tool, specify a subagent_type parameter…
```

각 에이전트의 `whenToUse` 와 `disallowedTools` 가 그대로 모델한테 노출된다. 모델은 5개의 옵션을 보고 가장 맞는 걸 고른다.

> ⚙️ **`(Tools: *)` 는 literal 한 글자** (`prompt.ts:15-37`). `general-purpose.tools = ['*']` 가 전부 의미할 것 같지만 — 실제 `getToolsDescription` 의 allowlist 분기는 **그저 `tools.join(', ')`**. 즉 `'*'` 가 join 결과가 문자 한 글자. **모델은 그 한 글자를 보고 전부 라고 추론한다**. 우연히 전부를 의미하게 되는 명명 컨벤션 — 코드는 그저 join 만 함.

> ⚙️ **에이전트 리스트가 attachment 로 빠진 사연** (`prompt.ts:48-64`). `shouldInjectAgentListInMessages()` 함수의 코멘트가 사연을 기록: **"The dynamic agent list was ~10.2% of fleet cache_creation tokens: MCP async connect, /reload-plugins, or permission-mode changes mutate the list → description changes → full tool-schema cache bust."** **fleet cache_creation 의 10.2%** 가 동적 에이전트 리스트 때문이었다 — MCP 서버가 async connect 되거나 plugin 이 reload 될 때마다 리스트가 바뀌고, 그 description 변화가 **전체 tool-schema 캐시**를 무효화. 그래서 attachment 로 분리해서 **tool description 을 정적으로 유지**. 프로덕션 단단함의 또 한 조각 — 7.4의 캐시 공유 정신과 같다.

가장 멋진 부분은 프롬프트 작성 가이드다.

```
## Writing the prompt

Brief the agent like a smart colleague who just walked into the room — 
it hasn't seen this conversation, doesn't know what you've tried, 
doesn't understand why this task matters.
- Explain what you're trying to accomplish and why.
- Describe what you've already learned or ruled out.
- Give enough context about the surrounding problem that the agent can 
  make judgment calls rather than just following a narrow instruction.
- If you need a short response, say so ("report in under 200 words").
- Lookups: hand over the exact command. Investigations: hand over the 
  question — prescribed steps become dead weight when the premise is wrong.

Terse command-style prompts produce shallow, generic work.

**Never delegate understanding.** Don't write "based on your findings, 
fix the bug" or "based on the research, implement it." Those phrases push 
synthesis onto the agent instead of doing it yourself. Write prompts that 
prove you understood: include file paths, line numbers, what specifically 
to change.
```

스마트 콜리그 비유. **"옆 자리 동료가 방금 회의실에 들어왔다"** 라는 멘탈 모델을 모델한테 심어준다. 그리고 **"Never delegate understanding"** 이라는 강한 경고 — 결정은 너(부모)가 해야 한다, 자식한테 떠넘기지 마라.

이것도 프롬프트 엔지니어링의 교과서적 사례다. 추상적 규칙(**"좋은 위임을 해라"**) 대신 구체적인 멘탈 모델(콜리그 + 회의실).

---

## Python으로 옮기면

핵심만 압축해서:

```python
from __future__ import annotations
import asyncio
from dataclasses import dataclass, field
from typing import Any, AsyncGenerator, Callable


# ─── 에이전트 정의 ────────────────
@dataclass
class AgentDefinition:
    agent_type: str
    when_to_use: str
    get_system_prompt: Callable[[], str]
    tools: list[str] | None = None  # 화이트리스트
    disallowed_tools: list[str] = field(default_factory=list)
    model: str = "default"  # "haiku" | "sonnet" | "opus" | "inherit" | "default"
    omit_claude_md: bool = False


# ─── 에이전트 루프 (2.1의 query) ────────────────
async def query(
    *,
    messages: list[dict],
    system_prompt: str,
    user_context: dict,
    available_tools: list[Any],
    canusetool: Callable,
    max_turns: int = 50,
) -> AsyncGenerator[dict, None]:
    """2.1의 에이전트 루프 — 실제 구현은 9.2에서."""
    # … LLM 호출 → tool_use 발견 → 권한 체크 → 도구 실행 → 결과 추가 → 반복 …
    yield ...


# ─── AgentTool — *재귀의 진입점* ────────────────
class AgentTool:
    """Tool의 *모습*을 한 *재귀 호출*."""
    
    name = "Agent"
    input_schema = {
        "description": "A short (3-5 word) description of the task",
        "prompt": "The task for the agent to perform",
        "subagent_type": "Which built-in agent to use",
    }
    
    def __init__(self, agents: list[AgentDefinition]) -> None:
        self.agents_by_type = {a.agent_type: a for a in agents}
    
    def description(self) -> str:
        """모델한테 *에이전트 메뉴*를 보여준다."""
        lines = ["Launch a new agent to handle complex, multi-step tasks.", ""]
        lines.append("Available agent types:")
        for agent in self.agents_by_type.values():
            tools_desc = (
                ", ".join(agent.tools) if agent.tools 
                else f"All except {', '.join(agent.disallowed_tools)}"
                if agent.disallowed_tools
                else "All"
            )
            lines.append(f"- {agent.agent_type}: {agent.when_to_use} (Tools: {tools_desc})")
        return "\n".join(lines)
    
    async def call(
        self,
        *,
        description: str,
        prompt: str,
        subagent_type: str = "general-purpose",
        parent_context: Any,  # ToolUseContext
    ) -> str:
        """*핵심* — 자식 에이전트의 query 루프를 호출."""
        agent_def = self.agents_by_type[subagent_type]
        
        # 1. 시스템 프롬프트 — 에이전트 정의에서
        system_prompt = agent_def.get_system_prompt()
        
        # 2. 도구 — 부모의 풀 도구 세트에서 화이트/블랙리스트 필터
        available_tools = self._resolve_tools(agent_def, parent_context.tools)
        
        # 3. 컨텍스트 다이어트 — 읽기 전용 에이전트는 CLAUDE.md/git 생략
        user_context = parent_context.user_context.copy()
        if agent_def.omit_claude_md:
            user_context.pop("claude_md", None)
            user_context.pop("git_status", None)
        
        # 4. 자식 컨텍스트는 *부모와 분리*된 메시지/파일 캐시
        initial_messages = [{"role": "user", "content": prompt}]
        
        # 5. *재귀* — query() 가 자기 자신을 부른다
        final_response = ""
        async for msg in query(
            messages=initial_messages,
            system_prompt=system_prompt,
            user_context=user_context,
            available_tools=available_tools,
            canusetool=parent_context.canusetool,
            max_turns=50,
        ):
            if msg.get("role") == "assistant":
                final_response = msg.get("content", "")
        
        # 6. 자식의 *최종 발화*가 부모의 *도구 결과*가 된다
        return final_response
    
    def _resolve_tools(
        self, 
        agent_def: AgentDefinition, 
        parent_tools: list[Any],
    ) -> list[Any]:
        """화이트리스트가 있으면 거기서, 없으면 블랙리스트로 필터."""
        if agent_def.tools and "*" not in agent_def.tools:
            return [t for t in parent_tools if t.name in agent_def.tools]
        if agent_def.disallowed_tools:
            return [t for t in parent_tools if t.name not in agent_def.disallowed_tools]
        return parent_tools


# ─── 6개 내장 에이전트 ────────────────
GENERAL_PURPOSE = AgentDefinition(
    agent_type="general-purpose",
    when_to_use="만능 — 복잡한 다단계 태스크",
    get_system_prompt=lambda: "You are a helpful coding agent…",
    tools=["*"],
)

EXPLORE = AgentDefinition(
    agent_type="Explore",
    when_to_use="빠른 코드베이스 탐색",
    get_system_prompt=lambda: "READ-ONLY exploration. STRICTLY no edits.",
    disallowed_tools=["Agent", "Edit", "Write", "NotebookEdit"],  # ← 진짜 차단
    model="haiku",
    omit_claude_md=True,  # ← 토큰 다이어트
)
```

핵심 셋이 다 있다.

1. **`call()` 안에서 `query()` 를 부른다** — 재귀. 그 외는 다 디테일.
2. **`disallowed_tools` 는 프롬프트가 아닌 진짜 필터**. 모델이 그 도구들을 애초에 못 본다.
3. **`omit_claude_md` 같은 다이어트 플래그** — 에이전트는 자기에 맞는 컨텍스트만. 모든 자식이 풀 컨텍스트면 비용이 N배.

> 💡 **`AsyncGenerator[dict, None]`.** 2.2에서 본 비동기 제너레이터. AgentTool도 메시지를 스트리밍으로 내놓는다. 자식 에이전트의 진행 메시지가 부모의 UI에 실시간으로 흐를 수 있는 이유. 부모는 최종 결과만 받지만, 사용자는 과정을 볼 수 있다.

---

## 핵심 정리

- **AgentTool은 도구의 모습을 한 LLM 호출**. 다른 모든 도구처럼 `buildTool({...})` 로 만들어지고 같은 47개 필드를 갖지만, `call()` 안에서 **2.1의 `query()` 를 자기 자신으로 부른다**. **이게 멀티 에이전트의 전부** — 그 외엔 다 디테일.
- 모델한테 자연스럽다 — **"도구를 부른다"** 는 학습된 개념을 그대로 쓴다. **"다른 LLM을 부른다"** 는 새 패러다임이 아님.
- **5(+1)개의 내장 에이전트**가 5차원으로 다르다 — 시스템 프롬프트, 도구 화이트/블랙리스트, 모델, CLAUDE.md 포함 여부, 권한 모드. **외부 CLI 표준 빌드**: `general-purpose` (만능, 모델 omit), `statusline-setup` (설정만, **`['Read', 'Edit']`** 단 2개 도구, sonnet), `Explore` (빠른 탐색, 외부 **haiku**), `Plan` (아키텍트, **inherit**), `claude-code-guide` (사용법, **haiku**, `dontAsk` 권한 모드). +ant-only `verification` (검증, **inherit**, 3중 방어).
- 읽기 전용 에이전트의 컨텍스트 다이어트: Explore/Plan은 `omit_claude_md: true` 로 CLAUDE.md를 생략. **주당 5-15 Gtok 절약** (Explore는 주당 3,400만 번 띄워짐). gitStatus(40KB)도 **추가 1-3 Gtok 절약**. **에이전트는 자기에 맞는 컨텍스트만** — 모든 자식이 풀 컨텍스트면 비용이 N배.
- **`disallowedTools` 는 프롬프트 방어가 아니라 진짜 차단**. `availableTools` 어셈블 단계에서 빠진다. 모델이 유혹받을 일조차 없다. 시스템 프롬프트의 **대문자 CRITICAL**은 이중 방어.
- 프롬프트 작성 가이드가 모델한테 멘탈 모델을 준다 — **"Brief the agent like a smart colleague who just walked into the room"**. 추상적 규칙 대신 구체적 비유. **"Never delegate understanding"** — 결정은 부모가 해야 한다.
- 다음(8.2)에서 **`createSubagentContext`** — 부모의 어떤 상태가 자식한테 흘러가고, 어떤 게 격리되는지. 그리고 prompt cache 공유를 통해 자식 띄우는 비용을 극적으로 줄이는 트릭.

---

*다음 챕터: 8.2 createSubagentContext — 자식 에이전트의 격리와 캐시 공유*
