# 8.4 에이전트 팀 — 격리 대신 공유로 협력하는 팀원들

---

## 이 챕터에서 배우는 것

- **서브에이전트 위에 올린 두 번째 확장** — 8.1~8.2 의 공통 기반 위에 8.3 코디네이터 모드와 _완전히 다른 디자인_ 의 에이전트 팀이 같은 저장소에 공존한다는 사실
- **AsyncLocalStorage 기반 in-process 격리** — 같은 Node.js 프로세스 안에서 동시 실행되는 팀원들이 어떻게 서로의 컨텍스트를 침범하지 않는가
- **팀 lead 와 메일박스** — 코디네이터 모드의 `<task-notification>` XML 과 정반대로 _팀원끼리 peer DM_ 이 가능한 통신 모델
- **팀 메모리(team memory) 와 secret guard** — 팀원들이 메모리를 공유하는 위험과 그 위험을 막는 방어선
- **두 빌드 게이트의 분리** — `agentSwarmsEnabled` (런타임) + `feature('TEAMMEM')` (빌드 타임) 으로 부분 활성화가 가능한 이유

---

## 같은 기반 위에 두 가지 확장이 올라가 있다

8.1 과 8.2 에서 우리는 서브에이전트의 _공통 기반_ 을 봤다. **`AgentTool` 의 재귀 호출** (8.1) — 도구로 위장한 LLM 이 자기 자신을 다시 부른다. **`createSubagentContext`** (8.2) — 자식 에이전트가 부모와 컨텍스트를 분리해 격리된다. 이게 멀티 에이전트의 _기본 메커니즘_ 이다.

8.3 에서 이 기반 위에 _첫 번째 확장_ 이 올라간다. **코디네이터 모드** — 시스템 프롬프트 한 장으로 메인 Claude 의 정체성을 _작성자에서 관리자로_ 전환. 메인이 워커를 fork-join 으로 조율하고 `<task-notification>` user 메시지로 결과를 받는다. _위계 기반_ 의 협업 디자인.

같은 기반 위에 _두 번째 확장_ 이 또 있다. **에이전트 팀**. `tasks/InProcessTeammateTask/`, `utils/swarm/`, `services/teamMemorySync/`, `tools/TeamCreateTool/`, `components/teams/` ... 152 파일에 걸쳐 있는 별도 클러스터. 8.3 과는 _완전히 다른 디자인 결정_ 들로 채워져 있다.

**왜 두 가지 시도가 다 있는가**. 코디네이터 모드는 _부모-자식 관계_ — 메인이 워커를 부리는 계층 구조 시도. 에이전트 팀은 _peer 관계_ — 팀원들이 서로 메시지를 주고받으며 공동 작업하는 시도. 한 시도는 위계, 다른 시도는 동등. 한 시도는 격리, 다른 시도는 공유. **같은 서브에이전트 기반 위에 시도된 두 갈래의 협업 디자인**이 _같은 코드베이스에 흔적으로 남아 있고_ — 그중 하나 (peer 모델) 가 **2026-02-05 외부 experimental 출시**, **2026-03-09 Anthropic 자체 PR 리뷰 (Claude Code Review) 프로덕션 적용**으로 _채택된 디자인_ 이 되었다.

이 챕터에서 — 다섯 가지 축으로 두 확장을 비교한다.

```
| 축              | 코디네이터 모드 (8.3)              | 에이전트 팀 (8.4)                   |
|----------------|-----------------------------------|-------------------------------------|
| 게이트          | feature('COORDINATOR_MODE') + env | agentSwarmsEnabled() + env/CLI + GB |
| 실행 모델       | out-of-process (LocalAgentTask)   | in-process (AsyncLocalStorage)      |
| 정체성          | 부모-자식, 익명 워커               | agent@team, 명시적 팀 lead          |
| 통신            | <task-notification> user XML      | Mailbox + Stop 훅 idle notification |
| 메모리          | 자식 컨텍스트 격리 (8.2)           | 팀 공유 메모리 + secret guard       |
```

> 💡 **출시 상태 (2026-05 기준)**: 에이전트 팀은 **2026-02-05 Claude Code v2.1.32 + Opus 4.6 와 함께 experimental 로 외부 출시**됐다. 외부 사용자도 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 환경 변수나 settings.json 으로 활성화 가능 (`agentSwarmsEnabled` 의 외부 옵트인 경로). 더 나아가 **2026-03-09 Anthropic 이 _Claude Code Review_ 를 출시** — 에이전트 팀을 자기 PR 리뷰에 적용한 _프로덕션 애플리케이션_ 으로, 내부 코드 리뷰 coverage 가 **16% → 54%** 로 약 3 배 상승했다. 8.3 의 코디네이터 모드가 _외부 미출시_ 인 것과 대조 — Anthropic 이 두 디자인을 시도해본 결과 _peer 모델_ 이 채택됐다. 메모리 동기화 게이트 (`feature('TEAMMEM')`) 만 별도로 빌드 시점에 결정되어 일부 외부 빌드에서 dead-code-eliminated 될 수 있다.

---

## 본문

### 게이트 — 켜는 조건부터 다르다

8.3 에서 코디네이터 모드의 토글은 _환경 변수 한 줄_ 이었다. `CLAUDE_CODE_COORDINATOR_MODE=1`. 에이전트 팀의 토글은 _훨씬 까다롭다_ (`utils/agentSwarmsEnabled.ts:24`):

:::tabs

```typescript
export function isAgentSwarmsEnabled(): boolean {
  // Ant: always on
  if (process.env.USER_TYPE === 'ant') {
    return true
  }

  // External: require opt-in via env var or --agent-teams flag
  if (
    !isEnvTruthy(process.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS) &&
    !isAgentTeamsFlagSet()
  ) {
    return false
  }

  // Killswitch — always respected for external users
  if (!getFeatureValue_CACHED_MAY_BE_STALE('tengu_amber_flint', true)) {
    return false
  }

  return true
}
```

```python
# Python 등가 — 세 단계 게이트
def is_agent_swarms_enabled() -> bool:
    # 1단계: Ant 빌드는 무조건 on
    if os.environ.get("USER_TYPE") == "ant":
        return True

    # 2단계: 외부 사용자는 env 또는 CLI 플래그로 옵트인
    if (
        not is_env_truthy(os.environ.get("CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS"))
        and not is_agent_teams_flag_set()
    ):
        return False

    # 3단계: GrowthBook 킬스위치 — Anthropic 이 원격으로 꺼버릴 수 있음
    if not get_feature_value_cached_may_be_stale("tengu_amber_flint", True):
        return False

    return True
```

:::

세 단계 게이트다. **사내 빌드(ant)** — 무조건 on. **외부 사용자** — `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 환경 변수 **또는** `--agent-teams` CLI 플래그로 옵트인해야 함. 그리고 마지막 — GrowthBook 의 `tengu_amber_flint` 가 true 여야 함.

세 번째 단계가 진짜 핵심이다. **GrowthBook 킬스위치**. Anthropic 이 _원격으로_ 이 기능을 꺼버릴 수 있다. 사용자가 환경 변수를 켜도, 플래그를 줘도 — Anthropic 의 결정 한 번이면 기능이 죽는다. 코디네이터 모드의 build-time feature flag 와 다른 종류의 게이트 — _런타임에 원격으로 제어 가능_ 한 **점진 rollout 게이트**. 2026-02 외부 experimental 출시 시점부터 이 게이트가 _누구한테 언제 활성화_ 를 조정하는 인프라로 쓰였다.

그리고 **메모리 동기화** 만 따로 또 다른 게이트가 있다. `teamMemSecretGuard.ts:19` 의 `feature('TEAMMEM')` — _빌드 시점 게이트_. 팀 자체는 켤 수 있어도 _메모리 공유 기능만 부분적으로_ 빠질 수 있다는 뜻이다. **이중 게이트, 부분 활성화**. 어디까지 활성화할지 두 개의 노브로 따로 돌릴 수 있다.

> 💡 **GrowthBook 게이트의 의미.** 8.1 에서 본 `tengu_amber_stoat` 같은 _색상+동물_ 코드네임의 GrowthBook 게이트들은 _기능 자체의 살아있는 죽음 스위치_ 다. 빌드 후에도 Anthropic 의 결정 한 번으로 끌 수 있다. _점진 공개 기능_ 을 외부에 노출할 때의 안전 장치 — 문제가 터지면 즉시 차단.

코디네이터 모드는 _켜기 쉽다_ — 사용자가 결정하면 끝. 에이전트 팀은 _켜기 까다롭다_ — 두 단계 옵트인 + 원격 킬스위치. 디자인 의도가 보인다 — **상용 출시를 염두에 둔 신중한 rollout 디자인**. 실제로 2026-02-05 외부 experimental 출시 시 이 단계적 게이트 구조가 그대로 _점진 공개_ 의 도구로 쓰였고, 2026-03-09 Claude Code Review 프로덕션 채택 시점에도 같은 인프라가 _누구한테 언제 활성화_ 를 결정했다.

### 실행 모델 — 같은 프로세스 안에서 격리

8.2 에서 본 `createSubagentContext` 는 자식 에이전트가 _부모와 컨텍스트를 분리_ 해서 격리되도록 한다. AbortController 도 분리, attribution state 도 분리, app state 도 분리. **두 에이전트가 서로의 상태를 침범하지 않는다**.

그런데 8.2 의 격리는 _out-of-process_ 가 아니다 — 같은 Node.js 프로세스 안의 _객체 분리_ 다. 실제 워커도 `LocalAgentTask` 로 같은 프로세스에서 실행되거나, 별도 자식 프로세스로 spawn 되거나 — 8.1 의 `runAgent` 는 두 가지 다 지원했다.

에이전트 팀은 _완전히 다른 격리 메커니즘_ 을 쓴다. **AsyncLocalStorage** (`utils/teammateContext.ts:41`):

:::tabs

```typescript
import { AsyncLocalStorage } from 'async_hooks'

export type TeammateContext = {
  agentId: string                    // "researcher@my-team"
  agentName: string                  // "researcher"
  teamName: string
  color?: string
  planModeRequired: boolean
  parentSessionId: string             // Leader's session ID
  isInProcess: true
  abortController: AbortController
}

const teammateContextStorage = new AsyncLocalStorage<TeammateContext>()

export function runWithTeammateContext<T>(
  context: TeammateContext,
  fn: () => T,
): T {
  return teammateContextStorage.run(context, fn)
}

export function getTeammateContext(): TeammateContext | undefined {
  return teammateContextStorage.getStore()
}
```

```python
# Python 등가 — contextvars 로 비동기 작업별 격리
from contextvars import ContextVar
from dataclasses import dataclass
from typing import Literal

@dataclass
class TeammateContext:
    agent_id: str                      # "researcher@my-team"
    agent_name: str                    # "researcher"
    team_name: str
    color: str | None
    plan_mode_required: bool
    parent_session_id: str             # Leader's session ID
    is_in_process: Literal[True]
    abort_event: asyncio.Event

# Node 의 AsyncLocalStorage 와 등가 — 비동기 작업별로 격리된 변수
_teammate_context: ContextVar[TeammateContext | None] = ContextVar(
    "teammate_context", default=None,
)

async def run_with_teammate_context(
    context: TeammateContext,
    fn: Callable[[], Awaitable[T]],
) -> T:
    token = _teammate_context.set(context)
    try:
        return await fn()
    finally:
        _teammate_context.reset(token)

def get_teammate_context() -> TeammateContext | None:
    return _teammate_context.get()
```

:::

**`AsyncLocalStorage`** 는 Node.js 의 비동기 작업별 격리 메커니즘이다. 한 프로세스 안에서 동시에 실행되는 N 개의 async 작업이 _각자 자기만의 store_ 를 가진다. `.run(context, fn)` 으로 들어간 callstack 안에서는 — 어떤 `await` 를 거치든, 어떤 `setTimeout` 을 건너든 — `getStore()` 가 그 context 를 그대로 돌려준다. 다른 작업의 context 와 섞이지 않는다.

> 💡 **AsyncLocalStorage 는 비동기판 thread-local.** 일반적인 모듈 변수는 _전역 공유_ 다. 두 동시 작업이 같은 변수를 쓰면 race condition. AsyncLocalStorage 는 _async 컨텍스트 트리_ 를 따라 분기된 변수 — 같은 프로세스 안의 N 팀원이 각자 자기 정체성을 들고 동시에 일할 수 있다. Python 의 `contextvars` 가 같은 디자인 (PEP 567, 2018).

이게 _진짜로_ in-process 다. 자식 프로세스 spawn 없음 (코디네이터 모드의 `LocalAgentTask` 와 대비). 같은 메모리 공간, 같은 V8 인스턴스, 같은 `process.env`. **격리는 _AsyncLocalStorage 만이_ 보장**한다.

추가로 — 정체성 해상도가 우선순위 사다리로 작동한다 (`utils/teammate.ts:88`):

```typescript
export function getAgentId(): string | undefined {
  const inProcessCtx = getTeammateContext()      // 1. AsyncLocalStorage
  if (inProcessCtx) return inProcessCtx.agentId
  return dynamicTeamContext?.agentId             // 2. 런타임 동적 컨텍스트 (tmux)
                                                  // 3. 환경 변수 (fallback)
}
```

세 단계 — in-process 컨텍스트가 최우선, 그 다음이 _tmux 기반 팀원_ (별도 프로세스, CLI 인자로 `--agent-id` 전달), 마지막이 환경 변수. **에이전트 팀은 in-process 뿐 아니라 tmux 기반 out-of-process 도 같이 지원**한다. 한 디자인이 두 가지 실행 모델을 다 커버. 정체성 해상도가 일관성 있게 작동.

8.2 의 격리가 _객체 분리_ 라면, 여기는 _async 컨텍스트 격리_ 다. 같은 코드 경로가 N 명의 팀원에게 호출되는데 — 각자 자기 `agentId`, 자기 `teamName`, 자기 `abortController` 를 본다. **모듈은 한 벌, 실행 컨텍스트는 N 벌**.

### 정체성 — 팀의 lead 라는 역할

코디네이터 모드의 정체성은 단순했다. **메인 = 코디네이터**, **워커 = 익명 워커** (`agent-a1b` 같은 ID, 사용자한테는 거의 안 보임). 일회용 — 끝나면 사라진다.

에이전트 팀은 _이름과 역할_ 이 있다. `agentId: "researcher@my-team"` (`tasks/InProcessTeammateTask/types.ts:14`):

```typescript
export type TeammateIdentity = {
  agentId: string                  // "researcher@my-team"
  agentName: string                // "researcher"
  teamName: string                 // "my-team"
  color?: string
  planModeRequired: boolean
  parentSessionId: string          // Leader's session ID
}
```

`agent@team` 형식 — **Slack/Discord 핸들과 같은 컨벤션**. 사람이 부르고, 사람이 기억하고, 사람이 메시지를 보내는 이름. 8.2 의 자식 에이전트가 한 번 쓰고 버려지는 thread 였다면, 팀원은 _세션이 지속되는 동안 식별 가능한 동료_ 다.

그리고 _명시적 lead_ 라는 개념이 있다 (`utils/teammate.ts:171`):

```typescript
export function isTeamLead(
  teamContext: { leadAgentId: string } | undefined,
): boolean {
  if (!teamContext?.leadAgentId) return false

  const myAgentId = getAgentId()
  const leadAgentId = teamContext.leadAgentId

  // 내 agent ID == lead ID 면 내가 lead
  if (myAgentId === leadAgentId) return true

  // 역호환: 내가 agent ID 가 없고 팀 컨텍스트가 있으면
  // 팀을 만든 원래 세션 — 내가 lead
  if (!myAgentId) return true

  return false
}
```

**팀에는 _공식적으로 한 명의 lead_ 가 있다**. 코디네이터 모드의 메인 Claude 와 비슷해 보이지만 다르다. 메인 Claude 는 시스템 프롬프트 한 장으로 _정체성을 바꾼_ 같은 Claude. lead 는 _팀 멤버 중 한 명_ — `teamFile.members` 배열에 들어 있고, 다른 멤버들과 같은 식으로 메시지를 받는다.

lead 의 _유일한 다른 점_ 은 `teammateInit.ts:86` 에서 보인다:

```typescript
// 이 에이전트가 lead 면 idle notification hook 건너뜀
if (agentId === leadAgentId) {
  logForDebugging(
    '[TeammateInit] This agent is the team leader - skipping idle notification hook',
  )
  return
}
```

**lead 는 다른 lead 에게 idle 알림을 보내지 않는다** (자기 자신한테 보내는 게 무의미하니까). 그 외에는 — lead 도 일반 팀원과 같은 도구, 같은 권한, 같은 통신 채널을 쓴다. **위계가 약한 디자인**. 코디네이터 모드의 _"메인은 작성자가 아니라 관리자"_ 같은 강한 역할 분리가 없다.

> 💡 **왜 lead 라는 역할이 따로 있는가.** 통신의 _허브_ 가 필요해서다. 다음 섹션의 메일박스를 보면 — 팀원이 idle 상태가 되면 _누구한테_ 알릴지가 필요하다. _고정된 한 명_ 한테 알리는 게 N×N broadcast 보다 단순하다. lead 가 _합성 책임자_ 가 아니라 _수신 허브_ 라는 점이 코디네이터 모드와 결정적으로 다르다.

### 통신 — Mailbox 와 Stop 훅 의 만남

코디네이터 모드의 통신 핵심은 `<task-notification>` XML. _user-role 메시지로 포장_ 되어 메인 Claude 의 다음 턴에 도착. **모델한테는 그냥 user 메시지로 보임** — 학습된 패턴 그대로.

에이전트 팀의 통신은 _완전히 다른 디자인_ 이다. **Mailbox** + **Stop 훅 idle notification**.

먼저 mailbox. `utils/teammateMailbox.ts` — 1184 줄. 디스크 기반의 메시지 큐. 각 팀원이 자기 메일박스 파일을 가지고, 다른 팀원/lead 가 거기 메시지를 _append_ 한다. 인터페이스는 `writeToMailbox(recipient, message)` 같은 단순한 형태.

핵심은 _누가 누구한테 보내는가_ 다. 코디네이터 모드는 _워커끼리 직접 통신 불가_ — `SendMessage` 가 코디네이터 전용. 에이전트 팀은 _peer DM 가능_. 팀원 A 가 팀원 B 한테 직접 메시지를 보낼 수 있다. `teammateInit.ts:111` 의 `getLastPeerDmSummary(messages)` 가 그 증거 — _peer DM_ 이라는 용어가 인프라에 명시적으로 박혀 있다.

**팀원끼리 협업할 수 있다**. researcher 가 implementer 한테 "이 파일의 함수를 확인해줘" 라고 직접 보내고, implementer 가 reviewer 한테 "내가 짠 거 봐줘" 라고 보낸다. lead 는 _전체 진행 상황_ 을 보고받지만 모든 메시지를 거치지는 않는다. **분산 협업**.

그리고 **Stop 훅** 과의 만남. 팀원이 작업을 마치고 idle 상태가 되면 — 그 사실을 어떻게 알릴까? 답: **세션 종료 시 자동으로 발화하는 Stop 훅 안에서 lead 메일박스에 idle 알림 작성** (`teammateInit.ts:98`):

```typescript
addFunctionHook(
  setAppState,
  sessionId,
  'Stop',
  '',
  async (messages, _signal) => {
    // 팀 설정에서 이 팀원을 idle 로 마크
    void setMemberActive(teamName, agentName, false)

    // lead 메일박스에 idle 알림 보내기
    const notification = createIdleNotification(agentName, {
      idleReason: 'available',
      summary: getLastPeerDmSummary(messages),
    })
    await writeToMailbox(leadAgentName, {
      from: agentName,
      text: jsonStringify(notification),
      timestamp: new Date().toISOString(),
      color: getTeammateColor(),
    })
    return true
  },
  ...
)
```

**6장 (Hook 시스템) 의 메커니즘이 8.4 의 통신 인프라로 재사용된다**. 같은 코드가 다른 맥락에서 새로운 의미. Stop 훅은 _원래_ 세션 종료 시 임의 동작 실행을 위한 훅 — 여기서는 _팀원의 work-cycle 끝을 lead 한테 알리는 신호_ 가 된다.

> 💡 **메일박스가 디스크 기반인 이유.** in-process 팀원만 있으면 메모리 큐로 충분하다. 그런데 _tmux 기반 out-of-process 팀원_ 도 같이 지원해야 한다. 별도 프로세스끼리 어떻게 메시지 주고받나? **파일 시스템 — 모두가 합의하는 공통 매체**. 1.1 의 `~/.claude/ide/` 잠금 파일 패턴, 7.5 의 IDE Bridge 의 lockfile 발견 패턴, 그리고 여기 mailbox 가 같은 디자인 철학. **rendezvous as filesystem**.

그리고 lead 가 _polling 없이_ 기다리는 메커니즘이 있다 (`utils/teammate.ts:238`):

```typescript
export function waitForTeammatesToBecomeIdle(
  setAppState: (f: (prev: AppState) => AppState) => void,
  appState: AppState,
): Promise<void> {
  // ... 작업 중인 팀원들 찾기 ...

  return new Promise<void>(resolve => {
    let remaining = workingTaskIds.length

    const onIdle = (): void => {
      remaining--
      if (remaining === 0) resolve()
    }

    setAppState(prev => {
      const newTasks = { ...prev.tasks }
      for (const taskId of workingTaskIds) {
        const task = newTasks[taskId]
        if (task && task.type === 'in_process_teammate') {
          if (task.isIdle) {
            onIdle()  // 이미 idle 이면 즉시 호출
          } else {
            newTasks[taskId] = {
              ...task,
              onIdleCallbacks: [...(task.onIdleCallbacks ?? []), onIdle],
            }
          }
        }
      }
      return { ...prev, tasks: newTasks }
    })
  })
}
```

**`onIdleCallbacks` 배열에 콜백을 등록**. 각 팀원이 idle 상태가 되면 자기 콜백들을 호출. lead 는 `Promise` 하나를 기다리면 _모든 팀원이 idle_ 이 될 때 resolve. _polling 없음_, _busy-wait 없음_. 이벤트 기반 fan-in.

`onIdleCallbacks` 등록 _직전에_ `task.isIdle` 을 다시 체크하는 race 처리도 있다 — 콜백 등록 중에 팀원이 이미 idle 이 됐을 가능성. 정확하게 _at-least-once_ 가 아니라 _exactly-once_ 통지를 보장하는 디자인.

> 🔬 코디네이터 모드의 `<task-notification>` 과 비교하면 — 코디네이터의 user 메시지는 _다음 턴에 도착_ (LLM 의 발화 사이클에 묶임). 메일박스는 _세션 종료 즉시 디스크에 append_ — LLM 사이클과 독립. **LLM 의 학습된 user→assistant 패턴을 영리하게 재사용한 코디네이터** vs **OS 와 파일시스템의 메시지 큐를 직설적으로 활용한 에이전트 팀**. 같은 문제에 두 가지 답.

### 공유 메모리 — 협력의 진짜 비용

8.2 의 핵심은 _격리_ 였다. 자식 에이전트의 attribution state, abort controller, app state — 모두 부모와 분리. **자식이 부모를 침범하지 않는다**.

에이전트 팀의 메모리 디자인은 정반대다. **공유**. `services/teamMemorySync/`, `memdir/teamMemPrompts.ts`, `memdir/teamMemPaths.ts`, `utils/teamMemoryOps.ts`. 팀 전체가 _같은 메모리 파일들_ 을 읽고 쓴다.

위치도 다르다. 개인 메모리는 `~/.claude/projects/<project>/memory/`. 팀 메모리는 _프로젝트 폴더 안의 별도 경로_ — `isTeamMemPath()` 가 판별한다. **Git 으로 추적될 수 있는 위치**. 팀원들이 _저장소를 공유하기 때문에_ — 메모리도 공유된다.

이게 진짜 _협업_ 이다. researcher 가 "이 코드베이스의 인증은 jwt-strategy.ts 에 집중돼 있다" 를 메모리에 기록 → implementer 가 다음 턴에 그 메모리를 읽고 작업 시작. **에이전트 간 사전 지식 전달**. 코디네이터 모드의 _자식 컨텍스트 격리_ 와 정반대 디자인 결정.

그런데 _공유_ 의 대가가 있다. **민감 정보 누출**. 팀 메모리는 _저장소 협업자 모두에게 공유되는_ 파일이다. 누가 실수로 API 키를 메모리에 적으면 — Git 에 커밋되고, 모든 협업자가 본다. 이걸 막는 게 `services/teamMemorySync/teamMemSecretGuard.ts:15`:

:::tabs

```typescript
export function checkTeamMemSecrets(
  filePath: string,
  content: string,
): string | null {
  if (feature('TEAMMEM')) {
    const { isTeamMemPath } =
      require('../../memdir/teamMemPaths.js') as typeof import('../../memdir/teamMemPaths.js')
    const { scanForSecrets } =
      require('./secretScanner.js') as typeof import('./secretScanner.js')

    if (!isTeamMemPath(filePath)) return null

    const matches = scanForSecrets(content)
    if (matches.length === 0) return null

    const labels = matches.map(m => m.label).join(', ')
    return (
      `Content contains potential secrets (${labels}) and cannot be written to team memory. ` +
      'Team memory is shared with all repository collaborators. ' +
      'Remove the sensitive content and try again.'
    )
  }
  return null
}
```

```python
# Python 등가 — 팀 메모리 쓰기 시 secret 스캔
def check_team_mem_secrets(
    file_path: str,
    content: str,
) -> str | None:
    """Returns 에러 메시지 (차단) 또는 None (통과)."""
    if not feature("TEAMMEM"):
        return None  # 빌드 시점에 기능 꺼짐 — 통과

    if not is_team_mem_path(file_path):
        return None  # 팀 메모리 경로 아님 — 통과

    matches = scan_for_secrets(content)
    if not matches:
        return None  # 의심되는 secret 없음 — 통과

    labels = ", ".join(m.label for m in matches)
    return (
        f"Content contains potential secrets ({labels}) "
        "and cannot be written to team memory. "
        "Team memory is shared with all repository collaborators. "
        "Remove the sensitive content and try again."
    )
```

:::

**`FileWriteTool` 과 `FileEditTool` 의 `validateInput` 단계에서 호출된다**. 도구의 입력 검증 단계 — _실제 쓰기가 일어나기 전에_ 차단. 3장에서 본 도구의 input 검증 메커니즘이 _보안 방어선_ 으로 재사용. 모델이 메모리에 secret 을 쓰려고 시도 → 도구가 거부 → 모델한테 에러 메시지 반환.

세 가지 디자인 디테일이 모두 _공유의 비용_ 을 의식한다:

1. **빌드 시점 게이트**: `feature('TEAMMEM')` 가 false 면 secretScanner 코드 자체가 번들에 없다. 외부 빌드에서 secret 스캐닝을 _안 하는_ 게 아니라 _할 코드가 없다_. dead-code-elimination 으로 attack surface 자체를 줄임.

2. **동적 `require`**: `secretScanner` 와 `isTeamMemPath` 가 _함수 호출 시점에_ require. 모듈 로드 시 정적 import 대비 — 호출되지 않는 경로면 secretScanner 의 정규식 컴파일도 일어나지 않음. _lazy 평가_.

3. **명시적 에러 메시지**: 모델이 secret 을 쓰려고 시도하면 — _왜 차단됐는지_ 친절하게 설명. "Team memory is shared with all repository collaborators." — 모델이 _상황을 이해하고 행동을 수정_ 할 수 있도록. 단순 거부가 아닌 _맥락 있는 교정_.

8.2 의 `weakref.ref(parent)` 가 _메모리 누수 방지_ 를 위한 방어선이었다면, 여기는 _보안 누수 방지_ 를 위한 방어선. **공유의 강점만큼 명확한 위험 — 그 위험을 방어선으로 격리**.

> ⚠️ **메모리 캡과 OOM 사례**: `tasks/InProcessTeammateTask/types.ts:101` 의 `TEAMMATE_MESSAGES_UI_CAP = 50` 도 같은 _공유의 비용_ 이야기. 코멘트가 솔직하다 — _"BQ analysis (round 9, 2026-03-20) showed ~20MB RSS per agent at 500+ turn sessions and ~125MB per concurrent agent in swarm bursts. Whale session 9a990de8 launched 292 agents in 2 minutes and reached 36.8GB."_ **292 에이전트 → 36.8GB**. 캡이 없으면 OOM. 같은 프로세스에서 동시 실행되는 N 팀원의 메시지가 모두 같은 AppState 에 누적되기 때문. 디자인 결정마다 _실제 사고_ 가 뒷받침되어 있다.

---

## Python으로 옮기면

에이전트 팀의 in-process 격리 + 메일박스 + lead idle 추적을 한 묶음으로:

```python
from __future__ import annotations
import asyncio
import json
from contextvars import ContextVar
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Awaitable, Callable, Literal


# ─── 1. 팀원 컨텍스트 (AsyncLocalStorage 등가) ────────────────
@dataclass
class TeammateContext:
    """팀원 한 명의 실행 컨텍스트. AsyncLocalStorage / contextvars 로 격리."""
    agent_id: str                          # "researcher@my-team"
    agent_name: str                        # "researcher"
    team_name: str                         # "my-team"
    color: str | None
    plan_mode_required: bool
    parent_session_id: str                  # Lead's session ID
    abort_event: asyncio.Event
    is_in_process: Literal[True] = True


# 비동기 작업별 격리된 변수 — Node 의 AsyncLocalStorage 와 같은 디자인
_teammate_context: ContextVar[TeammateContext | None] = ContextVar(
    "teammate_context", default=None,
)


async def run_with_teammate_context(
    context: TeammateContext,
    fn: Callable[[], Awaitable[Any]],
) -> Any:
    """주어진 컨텍스트로 fn 을 실행. 같은 프로세스 안의 다른 팀원과 격리."""
    token = _teammate_context.set(context)
    try:
        return await fn()
    finally:
        _teammate_context.reset(token)


def get_teammate_context() -> TeammateContext | None:
    """현재 실행 컨텍스트의 팀원 정체성. 없으면 None (lead 또는 단독)."""
    return _teammate_context.get()


# ─── 2. 메일박스 (디스크 기반) ────────────────
@dataclass
class MailboxMessage:
    sender: str                            # 보낸 팀원 이름
    text: str                              # JSON 직렬화된 본문
    timestamp: str                         # ISO 8601
    color: str | None = None


def mailbox_path(recipient_name: str, team_name: str) -> Path:
    """팀원 메일박스 파일 경로. 디스크 기반 — out-of-process 팀원도 같이 쓸 수 있도록."""
    return Path.home() / ".claude" / "teams" / team_name / f"{recipient_name}.jsonl"


async def write_to_mailbox(
    recipient_name: str,
    team_name: str,
    message: MailboxMessage,
) -> None:
    """메일박스에 메시지 append. jsonl 포맷으로 한 줄씩 누적."""
    path = mailbox_path(recipient_name, team_name)
    path.parent.mkdir(parents=True, exist_ok=True)
    line = json.dumps({
        "from": message.sender,
        "text": message.text,
        "timestamp": message.timestamp,
        "color": message.color,
    })
    # append-only — 동시 쓰기는 OS 의 atomic append 에 의존
    with path.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


# ─── 3. Idle 알림과 Stop 훅 ────────────────
@dataclass
class IdleNotification:
    agent_name: str
    idle_reason: str                       # "available" | "shutdown" | "error"
    summary: str | None = None


def create_idle_notification(
    agent_name: str,
    idle_reason: str,
    summary: str | None = None,
) -> IdleNotification:
    return IdleNotification(agent_name, idle_reason, summary)


async def register_teammate_stop_hook(
    session_id: str,
    team_name: str,
    agent_name: str,
    lead_agent_name: str,
    hooks: HooksRegistry,
) -> None:
    """팀원의 Stop 훅 — 세션 종료 시 lead 한테 idle 알림 자동 전송.
    
    6장의 훅 메커니즘을 통신 인프라로 재사용. Stop 훅은 _원래_ 세션 종료시
    임의 동작 실행을 위한 훅이지만, 여기서는 _팀원의 work-cycle 끝을 
    lead 한테 알리는 신호_ 가 된다.
    """
    async def on_stop(messages: list[dict]) -> bool:
        # 자기 자신이 lead 면 알림 건너뜀
        if agent_name == lead_agent_name:
            return True

        # idle 알림 작성 — 마지막 peer DM 요약 첨부
        notification = create_idle_notification(
            agent_name=agent_name,
            idle_reason="available",
            summary=get_last_peer_dm_summary(messages),
        )
        await write_to_mailbox(
            recipient_name=lead_agent_name,
            team_name=team_name,
            message=MailboxMessage(
                sender=agent_name,
                text=json.dumps(notification.__dict__),
                timestamp=datetime.now().isoformat(),
                color=(get_teammate_context() or _no_color()).color,
            ),
        )
        return True  # Stop 훅 진행 허용
    
    hooks.register(session_id, "Stop", on_stop)


# ─── 4. Lead 의 idle 대기 (polling 없는 fan-in) ────────────────
@dataclass
class TeammateTaskState:
    agent_id: str
    is_idle: bool = False
    on_idle_callbacks: list[Callable[[], None]] = field(default_factory=list)


class TeamCoordinator:
    """Lead 의 팀원 상태 추적 + idle 대기."""
    
    def __init__(self) -> None:
        self.tasks: dict[str, TeammateTaskState] = {}
    
    async def wait_for_teammates_to_become_idle(self) -> None:
        """모든 작업 중인 팀원이 idle 이 될 때까지 _polling 없이_ 대기.
        
        race 처리: 콜백 등록 시점에 이미 idle 이면 즉시 호출.
        이걸 안 하면 _이미 끝난 팀원_ 에 등록된 콜백이 영원히 안 불려서 deadlock.
        """
        working = [t for t in self.tasks.values() if not t.is_idle]
        
        if not working:
            return  # 모두 이미 idle
        
        future: asyncio.Future[None] = asyncio.Future()
        remaining = len(working)
        
        def on_idle() -> None:
            nonlocal remaining
            remaining -= 1
            if remaining == 0:
                future.set_result(None)
        
        for task in working:
            if task.is_idle:
                # race: 콜백 등록 직전에 이미 idle 이 됐다면 즉시 호출
                on_idle()
            else:
                task.on_idle_callbacks.append(on_idle)
        
        await future
    
    def mark_idle(self, agent_id: str) -> None:
        """팀원이 idle 상태가 됐을 때 — 등록된 콜백들 발화."""
        task = self.tasks.get(agent_id)
        if not task or task.is_idle:
            return
        task.is_idle = True
        # 콜백 호출 — *이벤트 기반 fan-in*
        for cb in task.on_idle_callbacks:
            cb()
        task.on_idle_callbacks.clear()


# ─── 5. 팀 메모리 secret guard ────────────────
def check_team_mem_secrets(
    file_path: str,
    content: str,
    feature_enabled: bool,
) -> str | None:
    """팀 메모리 파일에 쓰기 전 secret 스캔. 차단 시 에러 메시지, 통과 시 None.
    
    *공유의 강점만큼 명확한 위험* — 한 팀원이 메모리에 키를 쓰면 모든 협업자가 본다.
    빌드 시점 게이트가 꺼지면 코드 자체가 dead-code-eliminated — 외부 빌드에서
    attack surface 를 줄임.
    """
    if not feature_enabled:
        return None  # 빌드 시점에 꺼짐
    
    if not is_team_mem_path(file_path):
        return None  # 팀 메모리 경로 아님
    
    matches = scan_for_secrets(content)
    if not matches:
        return None  # 의심 secret 없음
    
    labels = ", ".join(m.label for m in matches)
    return (
        f"Content contains potential secrets ({labels}) "
        "and cannot be written to team memory. "
        "Team memory is shared with all repository collaborators. "
        "Remove the sensitive content and try again."
    )


# ─── 6. 사용 예 — 팀원 한 명 spawn ────────────────
async def spawn_in_process_teammate(
    agent_name: str,
    team_name: str,
    prompt: str,
    lead_session_id: str,
    coordinator: TeamCoordinator,
) -> None:
    """팀원 한 명을 *같은 프로세스* 에서 실행. AsyncLocalStorage 로 격리."""
    
    context = TeammateContext(
        agent_id=f"{agent_name}@{team_name}",
        agent_name=agent_name,
        team_name=team_name,
        color=None,
        plan_mode_required=False,
        parent_session_id=lead_session_id,
        abort_event=asyncio.Event(),
    )
    
    coordinator.tasks[context.agent_id] = TeammateTaskState(
        agent_id=context.agent_id,
    )
    
    async def teammate_work() -> None:
        try:
            # 이 안에서 호출되는 *모든 함수* 에서 get_teammate_context() 가
            # 이 팀원의 정체성을 돌려준다 — 다른 팀원과 섞이지 않는다
            await run_agent_query(prompt=prompt, abort=context.abort_event)
        finally:
            coordinator.mark_idle(context.agent_id)
    
    # 격리된 컨텍스트에서 실행 — 같은 프로세스 안의 다른 팀원과 분리
    asyncio.create_task(
        run_with_teammate_context(context, teammate_work)
    )
```

핵심 다섯이 다 있다:

1. **`ContextVar` 기반 격리** — Node 의 `AsyncLocalStorage` 와 같은 디자인. 같은 프로세스 안의 N 팀원이 _자기 정체성_ 을 들고 동시에 일한다.
2. **디스크 메일박스** — _jsonl_ append-only. in-process 팀원과 out-of-process tmux 팀원이 같은 매체로 통신할 수 있는 _공통 기반_.
3. **Stop 훅 + idle 알림** — 6장의 훅 메커니즘이 통신 인프라로 재사용. 팀원의 work-cycle 끝이 _자동으로_ lead 한테 알려진다.
4. **콜백 기반 fan-in** — polling 없는 _이벤트 기반_ idle 대기. race 처리 (등록 직전 isIdle 재체크) 까지 포함.
5. **Secret guard** — 도구 입력 검증 단계에서 _공유의 위험_ 을 차단. 빌드 게이트로 attack surface 줄임.

8.3 의 fork-join 패턴이 _대화 모델에 자연스럽게 매핑_ 됐다면, 여기는 _OS 와 파일시스템과 훅 시스템이 멀티 에이전트 인프라로 재사용_ 된 사례. 같은 코드베이스 안에 _같은 문제에 대한 두 가지 디자인 답_ 이 공존한다.

> 💡 **두 시도, 한 선택.** Anthropic 이 _정답을 미리 안 게 아니라_ 두 디자인을 _시도해본 결과_ 가 같은 코드베이스에 남아 있다. 코디네이터 모드는 _간단하고 모델 친화적_ 이지만 _peer 협업이 어려움_ → 외부 출시 안 됨 (저장소에 디자인 흔적만 남음). 에이전트 팀은 _peer 협업 자연스럽고 강력_, _공유의 비용 (메모리, secret, OOM) 이 있지만 secret guard / 메시지 캡 같은 방어선으로 감당 가능_ → **2026-02-05 외부 experimental 출시**, **2026-03-09 Claude Code Review 로 프로덕션 채택**. **AI 엔지니어로서 우리가 배울 것**: 멀티 에이전트는 _하나의 정답_ 이 아니라 _협업 구조의 선택_ 이라는 점, 그리고 _Anthropic 같은 회사도 두 디자인을 동시에 시도해보고_ 한쪽을 선택한다는 디자인 프로세스의 흔적.

---

## 핵심 정리

- **서브에이전트 기반 위의 두 갈래 시도 — 그중 _peer 모델이 채택_ 됨**. 8.1~8.2 의 공통 기반 (`AgentTool` 재귀 + `createSubagentContext` 컨텍스트 분리) 위에, 8.3 코디네이터 모드 (위계) 와 8.4 에이전트 팀 (peer) 두 디자인이 시도됐고 — **peer 모델이 2026-02-05 외부 experimental 출시, 2026-03-09 Claude Code Review 프로덕션 적용**으로 채택됐다. 코디네이터 모드는 외부 미출시 (저장소에 디자인 흔적만 남음).
- **게이트가 세 단계 — experimental rollout 의 인프라**. `agentSwarmsEnabled()` 는 ant 빌드 자동 on / 외부는 env+CLI 옵트인 / GrowthBook `tengu_amber_flint` 킬스위치 통과. 2026-02-05 외부 experimental 출시 시점부터 이 게이트 구조가 _점진 공개_ 의 도구로 쓰임 — Anthropic 이 _누구한테 언제 활성화_ 를 GrowthBook 한 줄로 조정. 메모리 동기화만 별도 빌드 게이트 `feature('TEAMMEM')`. **이중 게이트 + 부분 활성화**.
- **AsyncLocalStorage 기반 in-process 격리**. Node 의 _비동기판 thread-local_. 같은 프로세스의 N 팀원이 _자기 정체성을 들고 동시 실행_. Python 의 `contextvars` 와 같은 디자인. 모듈은 한 벌, 실행 컨텍스트는 N 벌.
- **정체성과 lead**. `agent@team` 형식 — Slack/Discord 핸들과 같은 컨벤션. _명시적 팀 lead_ 는 통신 허브이지 _코디네이터처럼 강한 역할 분리는 아님_. 다른 점은 _자기 자신한테 idle 알림 안 보낸다_ 정도.
- **Mailbox + Stop 훅 통신**. 코디네이터 모드의 `<task-notification>` user 메시지와 정반대 — _peer DM 가능_, _LLM 사이클과 독립_ 한 디스크 기반 메시지 큐. 팀원이 Stop 훅에서 lead 메일박스에 자동 idle 알림. **6장의 훅 메커니즘이 통신 인프라로 재사용**.
- **Polling 없는 fan-in**. `onIdleCallbacks` 배열 + 등록 직전 isIdle 재체크로 _exactly-once_ 통지. lead 가 `Promise` 하나로 _모든 팀원이 idle 될 때_ 깨어남.
- **공유 메모리와 secret guard**. 팀 메모리는 _저장소 협업자 모두에게 공유_. 한 팀원이 키를 쓰면 모든 협업자가 봄. 도구의 `validateInput` 단계에서 secretScanner 가 차단. **공유의 강점만큼 명확한 위험을 방어선으로 격리**.
- **메모리 캡과 OOM 사례**. `TEAMMATE_MESSAGES_UI_CAP = 50` 코멘트에 솔직한 실패담 — _292 에이전트 2분 안에 → 36.8GB_. 같은 프로세스 N 팀원의 메시지 누적이 OOM 의 원인. 디자인 결정마다 _실제 사고_ 가 뒷받침.
- **AI 엔지니어에게 이것이 중요한 이유**. 멀티 에이전트 시스템은 _하나의 정답_ 이 아니라 _협업 구조의 선택_. **위계 vs peer**, **격리 vs 공유**, **LLM 사이클 통신 vs OS-level 통신** — 세 가지 축에서 디자인이 갈린다. Anthropic 의 실증으로 — _Claude Code Review_ 가 PR 리뷰에 에이전트 팀을 적용해 **내부 코드 리뷰 coverage 16% → 54%** (약 3 배) 로 끌어올렸다. _peer 협업 모델_ 이 _복잡한 실무 워크플로_ 에서 실제 효과가 있다는 검증. 우리가 멀티 에이전트를 짤 때 _어떤 협업 구조가 우리 문제에 맞는지_ 를 먼저 결정해야 한다.
- **Part 8 (멀티 에이전트) 끝**. **공통 기반**으로 8.1 도구로 위장한 LLM (`AgentTool` 재귀) + 8.2 자식 에이전트 컨텍스트 분리 (격리와 캐시 공유) — 서브에이전트의 _재귀 안전성 + 캐시 공유 + 같은 query 루프 재사용_. 그 위에 **두 가지 시도**: 8.3 코디네이터 모드 (위계 기반, 시스템 프롬프트로 정체성 전환) 와 8.4 에이전트 팀 (peer 기반, in-process 격리 + 공유 메모리). _부모-자식 위계_ 와 _peer 팀_ 두 디자인이 같은 코드베이스에 남아 있고, 그중 **peer 모델이 2026-02 외부 experimental 출시 + 2026-03 Claude Code Review 프로덕션 적용**으로 채택됐다. Anthropic 도 _두 디자인을 시도해보고 한쪽을 선택_ 한다는 디자인 프로세스의 흔적.
