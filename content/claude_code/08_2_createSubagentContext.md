# 8.2 createSubagentContext — 자식 에이전트의 격리와 캐시 공유

---

## 이 챕터에서 배우는 것

- **부모 에이전트가 자식한테 무엇을 건네주는가** — 한 함수가 전체 계약을 정의
- 기본은 격리, **공유는 명시적 opt-in** — 멀티 에이전트 안전성의 핵심 원리
- 프롬프트 캐시 공유가 fork 비용을 어떻게 극적으로 줄이는지 — `CacheSafeParams` 5형제
- **PPID=1 좀비**가 되지 않는 법 — `setAppStateForTasks` 가 항상 root에 도달해야 하는 이유
- **Abort 신호의 단방향 전파** — 부모가 멈추면 자식도 멈추지만, 자식이 멈춰도 부모는 안 멈춤

---

## 사용자 경험에서 출발

8.1에서 — `AgentTool.call()` 안에서 `query()` 가 자기 자신을 부른다는 사실을 봤다. 근데 그냥 다시 부르면 안 된다.

생각해보자. 부모 Claude가 **"인증 코드 어디 있지?"** 하고 Explore 에이전트를 띄웠다. Explore 에이전트가 일을 하다가 **Ctrl+C** 를 받으면 어떻게 되어야 할까?

- **Explore만** 멈춰야 할까, 부모도 같이 멈춰야 할까?
- Explore가 읽은 파일들이 부모의 파일 캐시에도 보여야 할까?
- Explore가 진행 메시지를 부모의 UI에 띄울 수 있어야 할까?
- Explore가 띄운 **백그라운드 bash 작업**은 누가 추적하고 누가 죽이지?

이런 질문들이 수십 가지다. 그리고 답은 각각 다르다. 어떤 건 공유해야 하고, 어떤 건 격리해야 한다. 틀리면 — 부모-자식이 서로 상태를 망친다. 또는 **PPID=1 좀비 프로세스**가 남는다.

이 챕터에서 — Claude Code가 이 수십 가지 질문에 어떻게 답하는지 본다. 답은 한 함수: **`createSubagentContext`**.

---

## 본문

### 한 함수, 모든 답

`utils/forkedAgent.ts:345` 에 있는 함수 한 개. 시그니처가 전체 계약이다.

:::tabs

```typescript
export function createSubagentContext(
  parentContext: ToolUseContext,
  overrides?: SubagentContextOverrides,
): ToolUseContext
```

```python
# Python 등가 — 시그니처가 전체 계약
def create_subagent_context(
    parent_context: ToolUseContext,
    overrides: SubagentContextOverrides | None = None,
) -> ToolUseContext: ...
```

:::

부모 컨텍스트를 받고 — 자식 컨텍스트를 만든다. 둘 다 같은 `ToolUseContext` 타입. 자식이 자기가 자식인지도 모른다 — 그저 평범한 컨텍스트. 8.1의 재귀가 가능한 이유가 바로 이것. **자식 query 루프는 자기가 부모와 무엇을 공유하는지 알 필요가 없다**.

핵심 원리는 한 줄로 요약된다 — **함수 docstring에 그대로** 들어 있다.

:::tabs

```typescript
/**
 * By default, ALL mutable state is isolated to prevent interference:
 * - readFileState: cloned from parent
 * - abortController: new controller linked to parent (parent abort propagates)
 * - getAppState: wrapped to set shouldAvoidPermissionPrompts
 * - All mutation callbacks (setAppState, etc.): no-op
 * - Fresh collections: nestedMemoryAttachmentTriggers, toolDecisions
 *
 * Callers can:
 * - Override specific fields via the overrides parameter
 * - Explicitly opt-in to sharing specific callbacks (shareSetAppState, etc.)
 */
// (축약: 3개 @example 블록 생략 — Full isolation / Custom options /
//        Interactive subagent 사용 패턴. forkedAgent.ts:306-344)
```

**기본은 격리. 공유는 명시적 opt-in**. 안전한 기본값(**fail-safe defaults**) 디자인의 교과서적 적용. 3.3의 `buildTool` 의 fail-closed 정신과 같은 핏줄.

### 각 필드의 기본 결정

함수의 본문이 조용하고 단호하다. 필드별로 정확히 어떻게 결정하는지 보자.

**1. 변경 가능한 상태 — 기본은 클론**

```typescript
return {
  readFileState: cloneFileStateCache(
    overrides?.readFileState ?? parentContext.readFileState,
  ),
  nestedMemoryAttachmentTriggers: new Set<string>(),  // ← fresh
  loadedNestedMemoryPaths: new Set<string>(),
  dynamicSkillDirTriggers: new Set<string>(),
  discoveredSkillNames: new Set<string>(),
  toolDecisions: undefined,
  // contentReplacementState: clone of parent (or override) — fresh가 아님!
  // 이유는 *cache hit* 때문 (아래 박스)
  contentReplacementState:
    overrides?.contentReplacementState ??
    (parentContext.contentReplacementState
      ? cloneContentReplacementState(parentContext.contentReplacementState)
      : undefined),
```

```python
# Python 등가 — 변경 가능한 상태는 클론, Set은 fresh
read_file_state = clone_file_state_cache(
    (overrides.read_file_state if overrides else None)
    or parent_context.read_file_state
)
# Set들은 fresh — 자식의 트리거가 부모와 섞이면 텔레메트리 망가짐
nested_memory_attachment_triggers: set[str] = set()
loaded_nested_memory_paths: set[str] = set()
dynamic_skill_dir_triggers: set[str] = set()
discovered_skill_names: set[str] = set()
tool_decisions = None

# contentReplacementState는 fresh가 아닌 clone — cache hit 때문!
content_replacement_state = (
    (overrides.content_replacement_state if overrides else None)
    or (
        clone_content_replacement_state(parent_context.content_replacement_state)
        if parent_context.content_replacement_state else None
    )
)
```

:::

`readFileState` 가 클론 되는 게 흥미롭다. 자식은 **부모가 fork 시점까지 읽은 파일들을** 그대로 본다. 그런데 자식이 새로 읽는 파일들은 부모한테 안 흘러간다. **부모는 fork 시점의 스냅샷을 자식한테 준다, 그 후로는 분리**. `cloneFileStateCache` (`fileStateCache.ts:122-126`) 의 본문은 진짜 분리 — `createFileStateCacheWithSizeLimit(cache.max, cache.maxSize)` 로 **size limit 까지 함께 보존**하고 (자식이 부모와 **동일한 LRU policy**: 부모가 1000 슬롯이면 자식도 1000 슬롯), `cloned.load(cache.dump())` 로 **전체 dump → 새 LRUCache 로 load**. **얕은 복사가 아닌 진짜 분리**.

다른 Set들은 **fresh**. 자식의 메모리 트리거, 스킬 발견 같은 건 부모와 섞이면 안 된다. 텔레메트리가 망가짐.

> ⚙️ **`contentReplacementState` 는 fresh 가 아니라 clone — 왜?** 코멘트 verbatim (`forkedAgent.ts:388-403`): **"Clone by default (not fresh): cache-sharing forks process parent messages containing parent tool_use_ids. A fresh state would see them as unseen and make divergent replacement decisions → wire prefix differs → cache miss. A clone makes identical decisions → cache hit. For non-forking subagents the parent UUIDs never match — clone is a harmless no-op."** **fresh 가 아니라 clone 인 이유가 cache hit 때문**. 자식이 **부모와 동일한 replacement 결정**을 내려야 wire prefix 가 같고, 그래야 **prompt cache 가 맞는다**. 7.4 의 cache 공유 정신과 같은 뿌리 — **격리와 cache 공유가 같은 메커니즘으로 만난다**.

**2. AbortController — 링크된 자식**

:::tabs

```typescript
const abortController =
  overrides?.abortController ??
  (overrides?.shareAbortController
    ? parentContext.abortController       // ← opt-in: 같은 컨트롤러
    : createChildAbortController(parentContext.abortController))
```

```python
# Python 등가 — 3가지 분기: override / opt-in 공유 / 링크된 자식 (기본)
if overrides and overrides.abort_event:
    abort_event = overrides.abort_event
elif overrides and overrides.share_abort_controller:
    abort_event = parent_context.abort_event   # opt-in: 같은 이벤트
else:
    abort_event = create_child_abort_event(parent_context.abort_event)
```

:::

`createChildAbortController` 는 진짜 멋지다. 새 컨트롤러를 만들지만 — **부모의 abort가 자식한테 전파**되도록 리스너를 단다.

:::tabs

```typescript
// abortController.ts:68 (축약)
export function createChildAbortController(parent: AbortController): AbortController {
  const child = createAbortController()
  
  if (parent.signal.aborted) {
    child.abort(parent.signal.reason)  // 이미 멈췄으면 즉시 (이유까지 propagate)
    return child
  }
  
  // 양방향 WeakRef — 부모↔자식 어느 쪽도 강참조 만들지 않음 (GC 안전)
  const weakChild = new WeakRef(child)
  const weakParent = new WeakRef(parent)
  // propagateAbort/removeAbortHandler 는 *module-scope 함수* — bind 만으로 closure
  // allocation 회피 (성능 최적화)
  const handler = propagateAbort.bind(weakParent, weakChild)
  parent.signal.addEventListener('abort', handler, { once: true })
  
  // Auto-cleanup — 자식이 abort 되면 부모의 listener 도 제거 (dead handler 누적 방지)
  child.signal.addEventListener(
    'abort',
    removeAbortHandler.bind(weakParent, new WeakRef(handler)),
    { once: true },
  )
  return child
}
```

```python
# Python 등가 — 새 이벤트 + 부모 abort 단방향 전파 (WeakRef로 GC 안전)
import asyncio
import weakref

def create_child_abort_event(parent: asyncio.Event) -> asyncio.Event:
    child = asyncio.Event()

    if parent.is_set():
        child.set()  # 이미 멈췄으면 즉시
        return child

    # WeakRef — 양방향 어느 쪽도 강참조 만들지 않음
    weak_child = weakref.ref(child)

    async def propagate() -> None:
        await parent.wait()
        if (c := weak_child()) is not None:
            c.set()

    asyncio.create_task(propagate())
    return child
    # 부모 → 자식 단방향. 자식이 멈춰도 부모는 안 멈춤
```

:::

단방향 전파다. **부모가 멈추면 자식도 멈춘다. 자식이 멈춰도 부모는 안 멈춘다**. 사용자가 Ctrl+C를 부모한테 누르면 — 모든 자식이 연쇄적으로 멈춘다. Explore 에이전트가 자기 일이 끝나서 자기를 abort해도 — 부모는 신경 안 쓴다. 그리고 abort 되면 단순한 **abort 신호**가 아니라 **`parent.signal.reason` 까지 propagate** — 왜 멈췄는지의 이유가 함께 흐른다 (사용자 Ctrl+C / 타임아웃 / 권한 거부).

`WeakRef` 가 두 곳에 깔끔하게 적용됐다. **양방향**: (a) `weakChild` — 부모가 자식을 강하게 들고 있으면 자식이 GC 안 됨, (b) `weakParent` — handler closure 가 부모를 강하게 들고 있으면 부모가 자식 죽기 전에는 GC 안 됨. **양쪽 다 weak** 라서 어느 쪽이 먼저 사라져도 다른 쪽이 안 잡혀 있다. 그리고 자식이 abort 되면 **auto-cleanup** listener 가 발동해서 **부모의 listener 도 제거** — long-running 부모에 **dead handler 가 누적**되지 않게.

**3. setAppState 외 5개의 mutation 콜백 — 기본은 no-op, opt-in으로 공유**

:::tabs

```typescript
// (축약: 실제는 setAppState 외에도 setInProgressToolUseIDs, setResponseLength,
//  pushApiMetricsEntry, updateFileHistoryState 등 4개 더 — 모두 no-op
//  (또는 share flag 분기). + localDenialTracking (조건부 share) +
//  updateAttributionState (*항상* 공유 — 아래 ⚙️ 박스))
setAppState: overrides?.shareSetAppState
  ? parentContext.setAppState
  : () => {},
```

```python
# Python 등가 — 기본 no-op, opt-in으로만 공유
set_app_state = (
    parent_context.set_app_state
    if overrides and overrides.share_set_app_state
    else lambda _: None
)
```

:::

자식이 부모의 React 상태를 건드릴 일이 거의 없다. 그래서 기본은 빈 함수. 하지만 **in-process teammate** 같은 인터랙티브 자식은 부모와 같은 화면을 공유한다 — 그 경우 `shareSetAppState: true` 로 명시적으로 공유.

> ⚙️ **`updateAttributionState` 는 항상 공유 — 유일한 예외** (`forkedAgent.ts:432-435`). 다른 mutation 콜백 5개는 다 no-op 인데 이 하나만 **always shared**. 코멘트 verbatim: **"Attribution is scoped and functional (prev => next) — safe to share even when setAppState is stubbed. Concurrent calls compose via React's state queue."** **함수형 업데이트는 race-free** — `prev => next` 형태라서 동시 호출이 React 의 state queue 로 자연스럽게 합쳐진다. **fail-safe defaults** 의 예외 케이스 디자인 — 예외가 있으면 그 사연을 코드에 적는다는 정신.

여기서 **놀라운 디테일**이 나온다.

:::tabs

```typescript
// Task registration/kill must always reach the root store, even when
// setAppState is a no-op — otherwise async agents' background bash tasks
// are never registered and never killed (PPID=1 zombie).
setAppStateForTasks:
  parentContext.setAppStateForTasks ?? parentContext.setAppState,
```

```python
# Python 등가 — task 등록은 항상 root에 도달해야 함 (PPID=1 좀비 방지)
set_app_state_for_tasks = (
    parent_context.set_app_state_for_tasks or parent_context.set_app_state
)
# setAppState가 no-op이어도 — bash 작업 추적/킬은 root만 가능
```

:::

**심지어 setAppState가 no-op이어도** — `setAppStateForTasks` 는 항상 root store에 도달해야 한다. 왜? 자식 에이전트가 백그라운드 bash 작업을 띄웠다고 하자. 자식이 끝나면 그 bash 작업의 PPID는 **init(1)** 이 된다 — 고아 프로세스. 누가 추적하고 죽이지? **root AppState**다. 그래서 어떤 경우에도 task 등록만은 root에 도달해야 한다. 안 그러면 — **PPID=1 좀비**. 이 코멘트 한 줄이 과거에 누가 디버깅 며칠 했다는 사연이다.

**4. UI 콜백 — 모두 undefined**

:::tabs

```typescript
addNotification: undefined,
setToolJSX: undefined,
setStreamMode: undefined,
setSDKStatus: undefined,
openMessageSelector: undefined,
```

자식이 부모의 **UI를 그릴 수 없다**. 5.1의 React/Ink 트리는 부모의 것. 자식이 거기에 jsx를 꽂으면 프레임이 깨진다. 그래서 **모두 undefined**. 자식의 도구 결과는 최종 발화로만 부모한테 전달된다 — 8.1에서 본 결과만 받는 패턴.

> ⚙️ **`getAppState` 가 wrap 되어 `shouldAvoidPermissionPrompts: true` 자동 주입** (`forkedAgent.ts:358-374`). 자식이 비-인터랙티브면 (즉 `shareAbortController: false` — 기본값) — `getAppState()` 호출이 자동으로 `shouldAvoidPermissionPrompts: true` 를 주입한 state 를 반환한다. **자식이 권한 prompt 를 띄울 수 없음** (UI가 없으니까). 권한 검사기가 **prompt 대신 거절 (deny)** 하도록 강제. 단 `shareAbortController: true` 면 (**인터랙티브 in-process teammate**) wrapping 안 함 — 그 경우는 부모와 같은 화면을 공유하니까 prompt 가능. **자식이 말 없이 거절될 수 있게 하는 안전 장치** — 멀티 에이전트가 대기 상태로 멈춰 있지 않게. UI 콜백이 모두 undefined 인 것과 짝을 이룬다.

**5. agentId — 항상 새로 + depth 카운터**

```typescript
agentId: overrides?.agentId ?? createAgentId(),
queryTracking: {
  chainId: randomUUID(),
  depth: (parentContext.queryTracking?.depth ?? -1) + 1,
},
```

```python
# Python 등가 — ID는 항상 새로, depth는 +1 (무한 재귀 방지)
import uuid

agent_id = (overrides.agent_id if overrides else None) or create_agent_id()
parent_depth = (
    parent_context.query_tracking.get("depth", -1)
    if parent_context.query_tracking else -1
)
query_tracking = {
    "chain_id": str(uuid.uuid4()),
    "depth": parent_depth + 1,
}
```

:::

각 자식은 **자기만의 ID**. 그리고 깊이 카운터 — 부모의 depth + 1. 텔레메트리가 얼마나 깊이 들어갔는지 추적할 수 있다. 자식이 자식을 부르면 depth가 2, 그게 또 자식을 부르면 3 — 무한 재귀를 막는 안전장치.

### 캐시 공유 — `CacheSafeParams` 5형제

8.1의 재귀가 비싸 보였을 거다. 매번 자식 에이전트를 띄울 때마다 시스템 프롬프트 + 도구 스키마 + 대화 전체를 처음부터 보내야 한다면 — 자식 한 번 띄우는 데 **20-50K 토큰** 쉽게 든다. 멀티 에이전트가 경제적으로 불가능해진다.

답: **프롬프트 캐시 공유**. Anthropic API의 **prompt cache**는 접두사가 같으면 그 부분을 캐시에서 읽는다. 가격이 1/10 이하. 자식이 부모와 접두사가 같은 요청을 보내면 — 부모가 만든 캐시를 자식이 무료로 쓴다.

근데 **"접두사가 같다"** 가 까다롭다. **5가지가 정확히 같아야** 캐시가 맞는다.

:::tabs

```typescript
// forkedAgent.ts:57
export type CacheSafeParams = {
  systemPrompt: SystemPrompt           // 시스템 프롬프트
  userContext: { [k: string]: string } // 메시지 앞에 붙는 user 컨텍스트
  systemContext: { [k: string]: string } // 시스템 프롬프트 뒤에 붙는 컨텍스트
  toolUseContext: ToolUseContext       // 도구, 모델, thinking config
  forkContextMessages: Message[]       // 부모의 메시지 접두사
}
```

이 5형제가 완전히 같으면 — 자식의 첫 API 호출이 부모의 캐시를 그대로 재사용. 비용이 극적으로 떨어진다.

함수의 코멘트가 위험한 함정까지 친절하게 설명한다.

```typescript
/**
 * CAUTION: setting [maxOutputTokens] changes both max_tokens AND budget_tokens
 * (via clamping in claude.ts). If the fork uses cacheSafeParams to share the
 * parent's prompt cache, a different budget_tokens will invalidate the cache
 * — thinking config is part of the cache key. Only set this when cache
 * sharing is not a goal (e.g., compact summaries).
 */
maxOutputTokens?: number
```

**"max_tokens를 바꾸면 thinking budget도 같이 바뀌고, 그러면 캐시 키가 깨진다"**. 컴팩션(7.4)은 캐시 공유가 목표가 아니라서 괜찮지만, **성능 fork**는 절대 건드리면 안 된다.

`runForkedAgent` 가 이 5형제를 그대로 받아서 `query()` 에 넘긴다.

```typescript
// forkedAgent.ts:489 (축약: 11 파라미터 중 핵심 2개만 발췌. 실제는 sidechain
//   transcript 기록 + cache hit usage 추적 + tengu_fork_agent_query telemetry +
//   ~120 줄. forkedAgent.ts:489-608)
export async function runForkedAgent({
  promptMessages,
  cacheSafeParams,  // ← 5형제 한 묶음
  // …
}: ForkedAgentParams): Promise<ForkedAgentResult> {
  const { systemPrompt, userContext, systemContext, toolUseContext, forkContextMessages } = cacheSafeParams
  
  // 격리된 컨텍스트 생성 (부모 상태 변경 방지)
  const isolatedToolUseContext = createSubagentContext(toolUseContext, overrides)
  
  // 부모 메시지 + 새 프롬프트 = 자식 메시지
  const initialMessages = [...forkContextMessages, ...promptMessages]
  
  try {
    // query() 호출 — 5형제는 *부모와 동일*, 컨텍스트만 *격리*
    for await (const message of query({
      messages: initialMessages,
      systemPrompt,        // ← 부모 그대로
      userContext,         // ← 부모 그대로
      systemContext,       // ← 부모 그대로
      canUseTool,
      toolUseContext: isolatedToolUseContext,  // ← 격리됨
      querySource,
      // …
    })) { /* … */ }
  } finally {
    // 클론한 readFileState + 메시지 배열 즉시 정리 (메모리 누수 방지)
    isolatedToolUseContext.readFileState.clear()
    initialMessages.length = 0
  }
}
```

```python
# Python 등가 — 5형제는 부모 그대로, 컨텍스트만 격리
async def run_forked_agent(
    *,
    prompt_messages: list[dict],
    cache_safe_params: CacheSafeParams,
    overrides: SubagentContextOverrides | None = None,
):
    # 격리된 컨텍스트 (부모 상태 변경 방지)
    isolated_ctx = create_subagent_context(
        cache_safe_params.tool_use_context, overrides
    )

    # 부모 메시지 접두사 + 새 프롬프트
    initial_messages = [
        *cache_safe_params.fork_context_messages,
        *prompt_messages,
    ]

    try:
        async for message in query(
            messages=initial_messages,
            system_prompt=cache_safe_params.system_prompt,    # 부모 그대로
            user_context=cache_safe_params.user_context,      # 부모 그대로
            system_context=cache_safe_params.system_context,  # 부모 그대로
            tool_use_context=isolated_ctx,                    # 격리됨
        ):
            ...  # cache hit!
    finally:
        # 클론 즉시 정리 — N개 클론이 동시에 살아있지 않게
        isolated_ctx.read_file_state.clear()
        initial_messages.clear()
```

:::

우아하다. **공유는 cache-key 정체성을 위해, 격리는 상태 안전성을 위해**. 두 목적이 한 함수에서 만난다.

> ⚙️ **`finally` 의 짧은 lifetime** (`forkedAgent.ts:599-604`). `try/finally` 의 cleanup 두 줄이 작지만 중요. **클론한 `readFileState` 가 자식 query 가 끝나면 즉시 비워진다** — 부모는 자기 readFileState 를 그대로 유지. 즉 **클론의 lifetime 이 짧다**. 자식이 fork 시점의 스냅샷을 잠깐 갖다 쓰고 사라진다 — 기억은 잠깐. 멀티 에이전트 워크로드에서 **N개의 클론**이 동시에 살아있지 않게 하는 안전 장치. `initialMessages.length = 0` 도 같은 정신 — 큰 부모 메시지 배열의 복사본을 즉시 해제.

### 두 가지 fork 경로

Claude Code에는 두 가지 자식 에이전트 패턴이 있다.

| 패턴 | 진입점 | 캐시 공유? | 메시지 |
|---|---|---|---|
| **새 에이전트** | `runAgent` (8.1의 AgentTool) | ❌ 새 시스템 프롬프트 | **fresh** (자식이 자기 prompt만) |
| **포크** | `runForkedAgent` (이 챕터) | ✅ CacheSafeParams 5형제 | 부모 메시지 접두사 + 추가 |

새 에이전트 (`runAgent`)는 8.1에서 봤다. Explore, Plan 같은 — 자기 시스템 프롬프트를 갖는 전문가. 캐시 안 공유. 프롬프트가 다르니까 애초에 캐시 키가 다르다.

포크 (`runForkedAgent`)는 이 챕터에서 봤다. 부모와 같은 시스템 프롬프트로 부모 대화에 이어서 일을 한다. 7.4의 컴팩션, 세션 메모리 추출, /btw 같은 **post-turn 작업**들이 다 이 패턴.

기획서의 8.3 **Coordinator Mode**도 결국 이 두 패턴을 오케스트레이션하는 것 — 다음 챕터.

---

## Python으로 옮기면

핵심만 압축해서:

```python
from __future__ import annotations
import asyncio
import copy
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable, Protocol


# ─── 컨텍스트 (8.1과 같은 형태) ────────────────
@dataclass
class ToolUseContext:
    options: dict
    messages: list
    read_file_state: dict[str, str]  # 파일 캐시
    nested_memory_triggers: set[str] = field(default_factory=set)
    abort_event: asyncio.Event = field(default_factory=asyncio.Event)
    set_app_state: Callable[[dict], None] = lambda _: None
    set_app_state_for_tasks: Callable[[dict], None] = lambda _: None
    add_notification: Callable | None = None  # UI 콜백
    set_tool_jsx: Callable | None = None
    agent_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    query_depth: int = 0


# ─── 5형제 cache key ────────────────
@dataclass
class CacheSafeParams:
    """이 5개가 *완전히 같으면* prompt cache가 맞는다."""
    system_prompt: str
    user_context: dict[str, str]
    system_context: dict[str, str]
    tool_use_context: ToolUseContext
    fork_context_messages: list[dict]


# ─── opt-in 공유 플래그 ────────────────
@dataclass
class SubagentContextOverrides:
    options: dict | None = None
    agent_id: str | None = None
    messages: list | None = None
    
    # *명시적 opt-in*
    share_set_app_state: bool = False
    share_set_response_length: bool = False
    share_abort: bool = False


# ─── *한 함수 — 전체 계약* ────────────────
def create_subagent_context(
    parent: ToolUseContext,
    overrides: SubagentContextOverrides | None = None,
) -> ToolUseContext:
    """기본은 *격리*, 공유는 *명시적 opt-in*."""
    overrides = overrides or SubagentContextOverrides()
    
    # ── 1. AbortEvent — 새 이벤트 + 부모 이벤트 *링크*
    if overrides.share_abort:
        child_abort = parent.abort_event
    else:
        child_abort = asyncio.Event()
        # 부모 abort → 자식 abort (단방향)
        async def _propagate() -> None:
            await parent.abort_event.wait()
            child_abort.set()
        asyncio.create_task(_propagate())
    
    # ── 2. setAppState — 기본 no-op, opt-in 공유
    set_app_state = (
        parent.set_app_state if overrides.share_set_app_state 
        else lambda _: None
    )
    
    # ── 3. *PPID=1 좀비 방지* — task 등록은 *항상* root에 도달
    set_app_state_for_tasks = (
        parent.set_app_state_for_tasks or parent.set_app_state
    )
    
    return ToolUseContext(
        # 변경 가능한 상태 — *클론*
        read_file_state=copy.deepcopy(parent.read_file_state),
        nested_memory_triggers=set(),  # ← fresh
        
        # AbortEvent — 링크된 자식
        abort_event=child_abort,
        
        # AppState
        set_app_state=set_app_state,
        set_app_state_for_tasks=set_app_state_for_tasks,
        
        # UI 콜백 — *모두 None* (자식은 부모 UI 못 그림)
        add_notification=None,
        set_tool_jsx=None,
        
        # 옵션/메시지 — overrides 우선
        options=overrides.options or parent.options,
        messages=overrides.messages or parent.messages,
        
        # ID는 *항상 새로*, depth 카운터 +1
        agent_id=overrides.agent_id or str(uuid.uuid4()),
        query_depth=parent.query_depth + 1,
    )


# ─── fork 실행기 ────────────────
async def run_forked_agent(
    *,
    prompt_messages: list[dict],
    cache_safe_params: CacheSafeParams,
    overrides: SubagentContextOverrides | None = None,
) -> dict[str, Any]:
    """*5형제는 부모 그대로*, 컨텍스트만 격리."""
    
    # 1. 격리된 자식 컨텍스트
    isolated_ctx = create_subagent_context(
        cache_safe_params.tool_use_context,
        overrides,
    )
    
    # 2. 부모 메시지 접두사 + 새 프롬프트
    initial_messages = [
        *cache_safe_params.fork_context_messages,
        *prompt_messages,
    ]
    
    # 3. query() — 5형제는 *부모와 동일* (cache hit!)
    output_messages = []
    async for msg in query(
        messages=initial_messages,
        system_prompt=cache_safe_params.system_prompt,
        user_context=cache_safe_params.user_context,
        system_context=cache_safe_params.system_context,
        tool_use_context=isolated_ctx,
    ):
        output_messages.append(msg)
    
    # 4. clone된 캐시 정리
    isolated_ctx.read_file_state.clear()
    
    return {"messages": output_messages}
```

핵심 셋이 다 있다.

1. **`create_subagent_context` 한 함수가 전체 계약**. 부모의 어떤 필드가 자식한테 흘러가고, 어떤 게 격리되는지 한 곳에서 결정.
2. **링크된 abort + 단방향 전파** — 부모가 죽으면 자식 죽음, 자식이 죽어도 부모 안 죽음.
3. **`set_app_state_for_tasks` 의 PPID=1 좀비 방지**. 텍스트로는 그저 콜백이지만, 실제로는 시스템 안전성. 한 줄 잘못 쓰면 좀비 프로세스가 쌓인다.

> 💡 **`copy.deepcopy` vs `dict(parent.read_file_state)`.** Python에서 얕은 복사(`dict(...)`)는 키만 복제하고 값은 공유. 자식이 값을 변경하면 부모도 보인다. 깊은 복사가 진짜 분리. Claude Code의 `cloneFileStateCache` 도 **전체 dump → 새 LRUCache로 load** 하는 진짜 분리.

---

## 핵심 정리

- **`createSubagentContext` 는 멀티 에이전트의 전체 계약** — 부모가 자식한테 무엇을 건네주고 무엇을 막는지 한 함수에서 결정. 8.1의 재귀가 안전해지는 이유.
- **기본은 격리, 공유는 명시적 opt-in**. **fail-safe defaults** 패턴. 잘못 짜면 부모-자식이 서로 상태를 망친다.
- **변경 가능한 상태는 클론**: `readFileState` (LRU dump-load), `nestedMemoryTriggers`, `discoveredSkillNames`, `contentReplacementState`. 자식이 새로 한 일은 부모한테 안 흘러간다.
- **AbortController는 링크된 자식**: 새 컨트롤러를 만들고 부모의 abort 신호를 단방향으로 자식한테 전파. **부모가 멈추면 자식도 멈춤, 자식이 멈춰도 부모는 안 멈춤**. `WeakRef` 로 GC 친화적.
- **3가지 opt-in 플래그**: `shareSetAppState`, `shareSetResponseLength`, `shareAbortController`. 인터랙티브 in-process teammate 같은 예외 케이스 한정. 나머지는 기본 격리.
- **`setAppStateForTasks` 는 항상 root에 도달해야 한다** — **PPID=1 좀비 방지**. 자식이 띄운 백그라운드 bash 작업을 root만 추적/킬 가능. 한 줄 사연이 과거 디버깅 며칠.
- **`CacheSafeParams` 5형제** = `systemPrompt`, `userContext`, `systemContext`, `toolUseContext`, `forkContextMessages`. 이 5개가 부모와 완전히 같으면 — 자식 첫 API 호출이 **부모의 prompt cache를 무료로 재사용**. 멀티 에이전트가 경제적으로 가능해지는 비밀.
- 함정: `maxOutputTokens` 를 바꾸면 **thinking budget**도 같이 바뀌어 캐시 키 깨짐. 컴팩션(7.4)은 캐시 공유가 목표가 아니라서 OK. 성능 fork는 절대 건드리지 말 것.
- **두 가지 fork 패턴**: **`runAgent`** (새 에이전트, 자기 시스템 프롬프트, 캐시 안 공유 — 8.1) vs **`runForkedAgent`** (부모 대화 이어서, 캐시 공유 — 컴팩션/세션 메모리/post-turn). 8.3의 Coordinator Mode가 둘을 오케스트레이션.

