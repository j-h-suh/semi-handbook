# 8.3 Coordinator Mode — 메인이 여러 워커를 fork-join으로 조율

---

## 이 챕터에서 배우는 것

- **Coordinator Mode** — Claude를 작성자가 아닌 관리자로 바꾸는 모드
- 시스템 프롬프트 한 장으로 전체 워크플로가 바뀌는 사실 — 모델/엔진 변경 없음
- 4단계 워크플로: Research(병렬) → Synthesis(당신) → Implementation(워커) → Verification(워커)
- `<task-notification>` **XML 메시지** — 비동기 워커 결과가 **user-role 메시지**로 돌아오는 와이어 포맷
- **Continue vs Spawn** 결정의 6가지 상황 — 컨텍스트 오버랩이 결정 기준
- **"Never delegate understanding"** — 코디네이터의 유일한 책임

---

## 사용자 경험에서 출발

복잡한 태스크가 있다고 하자. **"인증 모듈에 NPE가 있는 것 같은데, 찾아서 고쳐주고 테스트도 통과시켜줘"**. 평소의 Claude Code는 자기가 직접 한다 — Grep, Read, Edit, Bash 차례차례. 순차적. 두 시간 걸린다.

`CLAUDE_CODE_COORDINATOR_MODE=1` 을 켜고 같은 명령을 던지면 — 완전히 다르게 움직인다.

```
You: Let me investigate first.
  ● Agent({ description: "Investigate auth bug",   subagent_type: "worker", … })
  ● Agent({ description: "Research auth tests",    subagent_type: "worker", … })
  
  Investigating from two angles — I'll report back with findings.

[2분 후]

[user]: <task-notification>
  <task-id>agent-a1b</task-id>
  <status>completed</status>
  <result>Found null pointer in src/auth/validate.ts:42…</result>
</task-notification>

You: Found the bug — null pointer in validate.ts:42.
  ● SendMessage({ to: "agent-a1b", message: "Fix the null pointer at line 42…" })
  
  Fix is in progress.
```

워커 두 개를 동시에 띄운다. 둘 다 비동기로 일을 한다. 메인 Claude는 기다리지 않고 사용자한테 **"띄웠다"** 라고 말하고 턴을 끝낸다. 한참 뒤 — **user 메시지 형식의 알림**이 도착한다. 메인이 그걸 보고 합성해서 다음 단계 워커한테 지시를 던진다.

**잠깐 — 메인 Claude가 전혀 다른 사람이 됐는데?** 도구를 직접 안 부른다. 지시만 한다. **완료 메시지를 user처럼** 받는다. 이게 어떻게 가능하지?

이 챕터에서 — 시스템 프롬프트 한 장과 작은 규칙 몇 개가 어떻게 멀티 에이전트 오케스트레이션을 만드는지 본다.

---

## 본문

### 모드 토글 — 환경 변수 한 줄

`coordinator/coordinatorMode.ts:36` — 모드 진입의 모든 조건.

:::tabs

```typescript
export function isCoordinatorMode(): boolean {
  if (feature('COORDINATOR_MODE')) {
    return isEnvTruthy(process.env.CLAUDE_CODE_COORDINATOR_MODE)
  }
  return false
}
```

```python
# Python 등가 — 환경 변수 한 줄로 모드 토글
def is_coordinator_mode() -> bool:
    if feature("COORDINATOR_MODE"):
        return is_env_truthy(os.environ.get("CLAUDE_CODE_COORDINATOR_MODE"))
    return False
```

:::

환경 변수 한 줄. 7.1의 4-SDK 추상화와 같은 정신 — 외부 토글, 내부는 아무것도 안 바뀜. 같은 query 루프, 같은 메시지 형식, 같은 도구 인터페이스. 그런데 모델한테 보이는 시스템 프롬프트와 도구 세트가 완전히 달라진다.

그리고 토글이 한 층 더 있다. `CLAUDE_CODE_SIMPLE=1` 을 같이 켜면 — 워커가 가질 수 있는 도구가 **Bash, Read, Edit 셋**으로 줄어든다. 풀 모드는 `ASYNC_AGENT_ALLOWED_TOOLS` 의 표준 셋 + MCP + 스킬. 단순 모드는 최소 셋. **2단계 dimming** — 코디네이터로 갈지 + 워커한테 얼마나 많이 줄지 두 노브를 따로 돌릴 수 있다.

Resume 케이스도 친절하다.

:::tabs

```typescript
// matchSessionMode — 재개 시 모드 일치 강제 (축약)
export function matchSessionMode(
  sessionMode: 'coordinator' | 'normal' | undefined,
): string | undefined {
  if (!sessionMode) return undefined            // 옛 세션 — no-op
  
  const currentIsCoordinator = isCoordinatorMode()
  const sessionIsCoordinator = sessionMode === 'coordinator'
  if (currentIsCoordinator === sessionIsCoordinator) return undefined
  
  // 환경 변수를 *플립* — isCoordinatorMode()는 캐시 없이 라이브로 읽음
  if (sessionIsCoordinator) {
    process.env.CLAUDE_CODE_COORDINATOR_MODE = '1'
  } else {
    delete process.env.CLAUDE_CODE_COORDINATOR_MODE
  }
  logEvent('tengu_coordinator_mode_switched', { to: sessionMode })
  return sessionIsCoordinator
    ? 'Entered coordinator mode to match resumed session.'
    : 'Exited coordinator mode to match resumed session.'
}
```

```python
# Python 등가 — 재개 시 세션 모드 일치 강제
from typing import Literal

def match_session_mode(
    session_mode: Literal["coordinator", "normal"] | None,
) -> str | None:
    if not session_mode:
        return None  # 옛 세션 — no-op

    current_is_coordinator = is_coordinator_mode()
    session_is_coordinator = session_mode == "coordinator"
    if current_is_coordinator == session_is_coordinator:
        return None

    # 환경 변수를 플립 — is_coordinator_mode()는 캐시 없이 라이브로 읽음
    if session_is_coordinator:
        os.environ["CLAUDE_CODE_COORDINATOR_MODE"] = "1"
    else:
        os.environ.pop("CLAUDE_CODE_COORDINATOR_MODE", None)
    log_event("tengu_coordinator_mode_switched", {"to": session_mode})
    return (
        "Entered coordinator mode to match resumed session."
        if session_is_coordinator
        else "Exited coordinator mode to match resumed session."
    )
```

:::

세션이 코디네이터로 시작했으면 재개도 코디네이터로. 모드를 섞으면 메시지 형식이 호환 안 됨 — `<task-notification>` 메시지를 일반 모드 모델이 보면 사용자 메시지로 오해한다. `isCoordinatorMode()` 가 캐시 없이 라이브로 환경 변수를 읽기 때문에 — 플립 한 줄로 즉시 모드가 바뀐다.

### 시스템 프롬프트 — 모델한테 새 정체성

`getCoordinatorSystemPrompt()` 가 만드는 프롬프트는 놀랍게 길고 구체적이다 — 250줄에 가까운 한 장. 역할/도구/4단계 워크플로/검증 기준/실패 처리/Stop 사용법/Continue mechanics/Prompt tips/Example session까지 전부 한 시스템 프롬프트에 들어 있다. 첫 줄이 모든 걸 정한다.

```
You are Claude Code, an AI assistant that orchestrates software 
engineering tasks across multiple workers.

## 1. Your Role

You are a **coordinator**. Your job is to:
- Help the user achieve their goal
- Direct workers to research, implement and verify code changes
- Synthesize results and communicate with the user
- Answer questions directly when possible — don't delegate work that 
  you can handle without tools
```

**"코디네이터"** 라는 단어 한 개. 역할이 바뀐다. 평소의 Claude는 **작성자(writer)** — 자기 손으로 코드를 짠다. 코디네이터는 관리자 — 워커를 보내고, 결과를 종합하고, 사용자한테 보고한다. **같은 모델, 다른 정체성**.

이어지는 경고문이 진짜 핵심이다.

```
Every message you send is to the user. Worker results and system 
notifications are internal signals, not conversation partners — 
never thank or acknowledge them. Summarize new information for 
the user as it arrives.
```

**"워커한테 고맙다고 말하지 마"**. 왜? 모델이 대화 본능으로 워커를 대화 상대처럼 다루면 — 토큰 낭비에 사용자 혼동. 코디네이터는 오직 사용자한테만 말한다.

### 4단계 워크플로

```
| Phase          | Who              | Purpose |
|----------------|------------------|---------|
| Research       | Workers (병렬)   | 코드베이스 조사, 파일 찾기, 문제 파악 |
| Synthesis      | **You** (코디)   | 결과 읽기, 문제 이해, **구현 스펙 작성** |
| Implementation | Workers          | 스펙대로 변경, 커밋 |
| Verification   | Workers          | 변경이 작동하는지 테스트 |
```

4단계 중 1단계만 코디네이터가 한다. 나머지 셋은 워커. 그 1단계가 **Synthesis** — 코디네이터의 유일한 책임.

검증 셀이 단순해 보이지만 — 시스템 프롬프트의 별도 섹션 "What Real Verification Looks Like" 가 이걸 강화한다. **"테스트 통과 확인"** 이 아니라 **코드가 작동함을 증명**. **rubber-stamp** (찍어 통과) 금지. 피처 플래그를 켠 상태로 테스트, 타입체크 에러는 조사, 의심스러우면 파고들기. 검증이 약하면 전체가 무너진다.

이게 **분기와 합류(fork-join)** — 여러 작업을 동시에 띄웠다가(fork) 결과가 모두 모이길 기다렸다(join) 합치는 병렬 패턴 — 의 본질이다. **Fork** — 여러 워커를 동시에 띄운다. **Join** — 결과들이 돌아오기를 기다린다 (비동기). **Synthesis** — join된 결과들을 합쳐서 **다음 fork의 입력**을 만든다.

동시성 규칙도 구체적이다.

```
### Concurrency

**Parallelism is your superpower. Workers are async. Launch independent 
workers concurrently whenever possible — don't serialize work that can 
run simultaneously and look for opportunities to fan out. When doing 
research, cover multiple angles. To launch workers in parallel, make 
multiple tool calls in a single message.**

- Read-only tasks (research) — run in parallel freely
- Write-heavy tasks (implementation) — one at a time per set of files
- Verification can sometimes run alongside implementation on different file areas
```

읽기 전용은 제한 없이 병렬. 쓰기는 파일 단위로 직렬화 (race condition 방지). 검증은 겹치지 않는 파일 영역에서 구현과 동시 실행 가능. **데이터베이스 트랜잭션 격리 수준의 직관**을 코디네이터한테 가르친다. 마지막 한 줄이 진짜 핵심 — **"한 메시지 안에 여러 도구 호출을 넣어라"**. fork-join에서 fork가 시간순이 아니라 공간순. 어시스턴트의 한 응답에 `Agent({...})`를 **N개 나란히** 박으면 — N개 워커가 동시에 출발한다.

### `<task-notification>` — 결과의 와이어 포맷

비동기 워커가 끝나면 — 어떻게 코디네이터한테 알리지? 답: **user-role 메시지의 모습으로**. `LocalAgentTask.tsx:252` (실제 코드는 `${TASK_NOTIFICATION_TAG}` 등 상수를 쓰지만, 렌더링 결과를 보여주면):

:::tabs

```typescript
const message = `<task-notification>
<task-id>${taskId}</task-id>${toolUseIdLine}    // <tool-use-id>...</tool-use-id> (옵션)
<output-file>${outputPath}</output-file>
<status>${status}</status>            // completed | failed | killed
<summary>${summary}</summary>
${resultSection}                       // <result>...</result>
${usageSection}                        // <usage>...</usage>
${worktreeSection}                     // <worktree>...</worktree>
</task-notification>`

enqueuePendingNotification({ value: message, mode: 'task-notification' })
```

```python
# Python 등가 — 비동기 워커 결과의 와이어 포맷 (user-role 메시지로 모습)
message = (
    f"<task-notification>\n"
    f"<task-id>{task_id}</task-id>{tool_use_id_line}\n"
    f"<output-file>{output_path}</output-file>\n"
    f"<status>{status}</status>\n"  # completed | failed | killed
    f"<summary>{summary}</summary>\n"
    f"{result_section}\n"            # <result>...</result>
    f"{usage_section}\n"             # <usage>...</usage>
    f"{worktree_section}\n"          # <worktree>...</worktree>
    f"</task-notification>"
)

enqueue_pending_notification({"value": message, "mode": "task-notification"})
```

:::

**XML로 포장된 user 메시지**. 코디네이터의 다음 턴이 시작될 때 — `messageQueueManager` 의 통합 `commandQueue` 에서 빠져 코디네이터의 컨텍스트에 **user 메시지로** 들어간다. 작은 디테일이 디자인을 살린다 — `enqueuePendingNotification` 은 priority **`'later'`** 로 enqueue한다. 사용자 입력은 `'next'`, 워커 알림은 `'later'`. **사용자 인풋과 워커 알림이 같은 큐에 있지만 사용자가 항상 우선**. 알림이 사용자를 방해하지 않는 디자인.

**이게 진짜 우아하다**. 모델한테는 **"다음 user 메시지는 워커 결과다"** 라고 가르칠 필요가 없다 — **그냥 이미 user 메시지**. LLM이 학습된 **user→assistant 패턴**을 그대로 쓴다. 비동기 분산 시스템이 대화 모델에 자연스럽게 매핑된 사례.

시스템 프롬프트의 경고가 친절하다.

```
Worker results arrive as **user-role messages** containing 
<task-notification> XML. They look like user messages but are not. 
Distinguish them by the <task-notification> opening tag.
```

### 코디네이터의 오케스트레이션 도구

코디네이터는 대부분의 도구를 안 쓴다. 자기가 작성자가 아니니까. 대신 오케스트레이션 도구 셋(+1 조건부)에 의존한다.

```
- **Agent**          — 새 워커 띄우기 (8.1)
- **SendMessage**    — 기존 워커 이어가기 (`to`: agent ID)
- **TaskStop**       — 잘못된 방향의 워커 중단
- **subscribe_pr_activity / unsubscribe_pr_activity** (조건부)
                     — GitHub PR 이벤트(리뷰 코멘트, CI 결과)를
                       user 메시지로 받음. 코디네이터가 직접 호출 —
                       워커한테 위임하지 말라고 명시.
```

`SendMessage` 가 진짜 흥미로운 도구다. 워커를 처음부터 다시 띄우지 않고 같은 워커한테 후속 지시를 보낸다. 워커는 자기 컨텍스트를 그대로 들고 있다 (8.2의 컨텍스트 보존). 같은 파일들이 메모리에 있고, 자기가 뭘 했는지 안다 — 재시작 비용 없이 일을 이어간다.

**그런데 잠깐 — 워커한테는 `SendMessage` 가 없다**. `coordinatorMode.ts:29` 의 `INTERNAL_WORKER_TOOLS` 셋이 `TEAM_CREATE / TEAM_DELETE / SEND_MESSAGE / SYNTHETIC_OUTPUT` 4개를 워커 도구 목록에서 필터링. `getCoordinatorUserContext()` 가 워커가 가질 수 있는 도구 목록을 **user context로 주입**할 때 이 4개를 빼고 보낸다. 결과: **`SendMessage`는 코디네이터 전용**. 워커는 다른 워커한테 메시지 못 보낸다.

**이게 fork-join의 핵심 메커니즘**이다. **모든 join이 코디네이터로 일원화**된다. 워커끼리 직접 대화하면 — 코디네이터는 합성할 게 없다. 워커 간 통신을 원천 차단해서 코디네이터를 유일한 종합 지점으로 강제한다. 동시에 `getCoordinatorUserContext()` 는 코디네이터한테 워커가 할 수 있는 일의 정확한 목록(+ MCP 서버, 스크래치패드 디렉토리)도 같이 알려준다 — 코디네이터가 지시를 만들 때 워커의 능력을 안다.

**Continue vs Spawn 의사 결정 표**가 진짜 디테일하다.

```
| 상황                          | 어떻게               | 이유                         |
|-------------------------------|----------------------|------------------------------|
| 조사한 파일이 곧 편집할 파일  | **Continue**         | 워커가 이미 컨텍스트 + 명확한 plan |
| 조사는 넓고 구현은 좁음       | **Spawn fresh**      | 탐색 노이즈 안 끌고 옴       |
| 실패 수정 / 작업 확장          | **Continue**         | 에러 컨텍스트 + 시도 이력    |
| 다른 워커가 짠 코드를 검증    | **Spawn fresh**      | 검증자는 **fresh eyes**       |
| 구현 접근 방식이 완전히 틀림  | **Spawn fresh**      | 잘못된 컨텍스트가 재시도 오염 |
| 완전히 무관한 태스크          | **Spawn fresh**      | 재사용할 컨텍스트 없음       |

**"기본값은 없다. 컨텍스트 오버랩이 결정 기준이다."**
```

이 표가 프로덕션에서 배운 직관의 정수다. 7.4의 컨텍스트 압축에서 본 것과 같은 컨텍스트 위생 원리. **나쁜 컨텍스트가 좋은 새 컨텍스트보다 비싸다**. 잘못된 방향의 컨텍스트를 끌고 가는 것보다 처음부터 다시 시작하는 게 나을 때가 있다. 검증자는 반드시 새 워커 — 확증 편향 회피.

### **"Never delegate understanding"**

코디네이터 시스템 프롬프트의 가장 강한 한 줄.

```
### Always synthesize — your most important job

When workers report research findings, **you must understand them 
before directing follow-up work**. Read the findings. Identify the 
approach. Then write a prompt that proves you understood by including 
specific file paths, line numbers, and exactly what to change.

Never write "based on your findings" or "based on the research." 
These phrases delegate understanding to the worker instead of doing 
it yourself. You never hand off understanding to another worker.
```

절대 이해를 위임하지 마. 8.1에서도 봤지만 — 코디네이터 모드에서는 더 강하게 반복된다. 왜? **이해가 워커한테 흩어지면 합성이 안 된다**. 워커 A가 "이런 걸 발견했다", 워커 B가 "저런 걸 발견했다" — 그것들을 연결하는 건 코디네이터의 유일한 일. 그걸 다음 워커한테 **"based on…"** 으로 떠넘기면 — 코디네이터는 라우터에 불과해진다. 의미가 사라진다.

명시적으로 **나쁜 예 vs 좋은 예**까지 보여준다.

```
// Anti-pattern — lazy delegation (둘 다 *나쁨*: continue든 spawn이든)
Agent({ prompt: "Based on your findings, fix the auth bug", … })
Agent({ prompt: "The worker found an issue in the auth module. 
  Please fix it.", … })

// Good — synthesized spec
Agent({ prompt: "Fix the null pointer in src/auth/validate.ts:42. 
  The user field on Session (src/auth/types.ts:15) is undefined when 
  sessions expire but the token remains cached. Add a null check 
  before user.id access — if null, return 401 with 'Session expired'. 
  Commit and report the hash.", … })
```

두 번째 anti-pattern이 더 은밀하다. **"the worker found an issue"** — 코디네이터가 워커가 뭘 찾았는지 읽지 않고 다른 워커한테 알아서 찾아 고치라고 떠넘기는 것. 첫 번째는 명시적 게으름, 두 번째는 위장된 게으름 — 둘 다 같은 죄. 좋은 스펙은 파일 경로 + 줄 번호 + 정확한 변경 + 완료 기준. 워커가 **fresh든 continued든** — 이 스펙만 있으면 일이 된다.

---

## Python으로 옮기면

Coordinator의 fork-join 패턴을 압축해서:

```python
from __future__ import annotations
import asyncio
from dataclasses import dataclass, field
from typing import Any


# ─── 워커 결과 (XML 대신 dataclass) ────────────────
@dataclass
class TaskNotification:
    task_id: str
    status: str  # completed | failed | killed
    summary: str
    result: str | None = None
    usage: dict | None = None
    
    def to_user_message(self) -> dict:
        """*user-role 메시지*로 포장 — 모델이 학습된 패턴 그대로 사용."""
        xml = f"""<task-notification>
<task-id>{self.task_id}</task-id>
<status>{self.status}</status>
<summary>{self.summary}</summary>
<result>{self.result or ''}</result>
</task-notification>"""
        return {"role": "user", "content": xml}


# ─── 태스크 추적 ────────────────
@dataclass
class CoordinatorState:
    pending_workers: dict[str, asyncio.Task] = field(default_factory=dict)
    completed_notifications: list[TaskNotification] = field(default_factory=list)


# ─── 코디네이터 시스템 프롬프트 (요약) ────────────────
COORDINATOR_PROMPT = """You are a coordinator. Your job is to:
- Direct workers to research, implement, verify
- Synthesize results
- Communicate with the user

Worker results arrive as user-role <task-notification> messages.
Never thank workers — they are not conversation partners.

Phases: Research (workers, parallel) → Synthesis (you) 
        → Implementation (workers) → Verification (workers).

NEVER write "based on your findings" — that delegates understanding.
ALWAYS synthesize by writing prompts with specific file paths, 
line numbers, and exact changes.

Continue vs spawn fresh: high context overlap → continue, 
low overlap → spawn fresh. Verification → ALWAYS spawn fresh.
"""


# ─── 도구: spawn worker (8.1의 AgentTool) ────────────────
async def spawn_worker(
    *,
    description: str,
    prompt: str,
    state: CoordinatorState,
) -> str:
    """비동기로 워커 띄움. *기다리지 않고* task_id 반환."""
    task_id = f"agent-{len(state.pending_workers):03d}"
    
    async def _run_worker() -> None:
        # 8.1의 runAgent 호출 — query() 재귀
        result = await run_agent_query(prompt=prompt, max_turns=50)
        
        # *결과를 user 메시지로 포장*해서 코디네이터의 큐에 enqueue
        notification = TaskNotification(
            task_id=task_id,
            status="completed",
            summary=f'Agent "{description}" completed',
            result=result,
        )
        state.completed_notifications.append(notification)
    
    state.pending_workers[task_id] = asyncio.create_task(_run_worker())
    return task_id


# ─── 도구: continue worker (SendMessage) ────────────────
async def send_message(
    *,
    to: str,  # agent ID
    message: str,
    state: CoordinatorState,
) -> str:
    """기존 워커한테 후속 지시 — *컨텍스트 보존*."""
    # 워커의 큐에 새 user 메시지 enqueue
    # (실제는 워커가 자기 query 루프 다음 턴에 받음)
    return f"Sent to {to}"


# ─── 코디네이터 루프 (요약) ────────────────
async def coordinator_loop(user_request: str) -> None:
    state = CoordinatorState()
    messages: list[dict] = [{"role": "user", "content": user_request}]
    
    while True:
        # 1. 코디네이터 한 턴 — 시스템 프롬프트는 *코디네이터용*
        assistant_msg = await call_llm(
            system_prompt=COORDINATOR_PROMPT,
            messages=messages,
            tools=[spawn_worker, send_message, task_stop],
        )
        messages.append(assistant_msg)
        
        # 2. 도구 호출 처리 (워커 spawn 등)
        for tool_call in assistant_msg.get("tool_uses", []):
            result = await dispatch_tool(tool_call, state)
            messages.append({"role": "tool_result", "content": result})
        
        # 3. *비동기 결과 join* — 새로 도착한 task_notification들을 user 메시지로
        while state.completed_notifications:
            notification = state.completed_notifications.pop(0)
            messages.append(notification.to_user_message())
        
        # 4. 사용자 입력 대기 (또는 새 알림이 들어오면 깨어남)
        if not state.pending_workers and not assistant_msg.get("tool_uses"):
            break  # 사용자 다음 입력 대기
        
        await asyncio.sleep(0.1)  # 비동기 양보
```

핵심 셋이 다 있다.

1. **`COORDINATOR_PROMPT` 한 줄**이 모델 정체성을 바꾼다. 같은 모델, 다른 역할. **"never delegate understanding"** 의 한 문장이 코디네이터의 유일한 책임을 정의.
2. **워커는 비동기 `asyncio.Task`** — `spawn_worker` 가 **기다리지 않고 task_id 반환**. 코디네이터는 자기 턴을 끝내고, **다음 턴에 결과를 user 메시지로** 받는다. 대화 모델 ↔ 비동기 시스템의 자연스런 매핑.
3. **`<task-notification>` XML이 user-role 메시지로 들어옴** — 모델한테 **"다음 user는 결과다"** 를 설명할 필요가 없다. 학습된 user→assistant 패턴이 그대로 작동.

> 💡 **Fork-join 패턴.** 병렬 컴퓨팅의 클래식 패턴. **Fork** — N개의 작업을 동시에 띄운다. **Join** — 결과들이 모두 돌아올 때까지 기다린다. Coordinator Mode가 **대화형 LLM의 fork-join** — fork는 `Agent` 호출들, join은 **다음 턴에 user 메시지로 들어오는 알림**. 동기 join 대신 **비동기 enqueue** 라서 코디네이터는 기다리는 동안 사용자와 대화까지 할 수 있다.

---

## 핵심 정리

- **Coordinator Mode = 시스템 프롬프트 한 장 + 도구 세트 변경**. 모델/엔진/query 루프 전부 그대로. `CLAUDE_CODE_COORDINATOR_MODE=1` 환경 변수로 토글.
- 역할이 바뀐다: 평소 Claude는 작성자, 코디네이터는 관리자. 직접 도구를 부르지 않고 워커한테 지시. **같은 모델, 다른 정체성**.
- **4단계 워크플로**: Research(워커 병렬) → **Synthesis(코디네이터)** → Implementation(워커) → Verification(워커). 4단계 중 1단계만 코디네이터가 한다.
- 동시성 규칙은 DB 트랜잭션 격리와 같은 직관: 읽기 전용은 제한 없이 병렬, 쓰기는 파일 단위 직렬화, 검증은 겹치지 않는 파일 영역에서 동시 가능.
- **`<task-notification>` XML** = 워커 결과의 와이어 포맷. **user-role 메시지**로 포장되어 코디네이터의 다음 턴에 도착. **모델한테 새 패턴을 가르칠 필요 없음 — 학습된 user→assistant 패턴이 그대로 작동**. 비동기 분산 시스템이 대화 모델에 자연스럽게 매핑된 우아한 사례.
- **오케스트레이션 도구 3개 + 1**: `Agent`(spawn), `SendMessage`(continue, 컨텍스트 보존), `TaskStop`(잘못된 워커 중단), 그리고 조건부로 `subscribe_pr_activity / unsubscribe_pr_activity`(GitHub PR 이벤트). `SendMessage`는 코디네이터 전용 — `INTERNAL_WORKER_TOOLS` 가 워커 도구 목록에서 빼내서 **모든 join이 코디네이터로 일원화**.
- **Continue vs Spawn 의사 결정 표** — 6가지 상황, 결정 기준은 컨텍스트 오버랩. 검증은 **반드시 fresh** (확증 편향 회피). **"기본값은 없다"**.
- **`Never delegate understanding`** — 코디네이터의 유일한 책임이 합성. 워커한테 **"based on your findings, fix it"** 같은 말 금지. 이해가 워커들한테 흩어지면 코디네이터는 라우터로 전락. 의미가 사라진다.
- **Fork-join 패턴**의 LLM 버전 — Fork는 `Agent` 병렬 호출, Join은 **다음 턴의 user 메시지**. 비동기라 코디네이터는 기다리는 동안 사용자와도 대화 가능.

