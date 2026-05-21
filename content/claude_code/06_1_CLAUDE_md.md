# 6.1 CLAUDE.md는 어떻게 시스템 프롬프트가 되는가 — 사실은 시스템 프롬프트가 아니다

---

## 이 챕터에서 배우는 것

- 프로젝트 루트의 `CLAUDE.md`를 Claude가 어떻게 보는지
- 놀라운 사실 — CLAUDE.md는 시스템 프롬프트에 들어가지 않는다. 그러면 어디에?
- **메타 사용자 메시지** + `<system-reminder>` 태그라는 영리한 우회
- 4단계 메모리 계층 (Managed → User → Project → Local) 과 어떻게 합쳐지는지
- 왜 이런 우회를 했나 — 시스템 프롬프트는 **공유 자산**이라는 사실

---

## 사용자 경험에서 출발

프로젝트 루트에 `CLAUDE.md`를 만든다.

```markdown
# 우리 프로젝트의 컨벤션

- 모든 함수에 타입 힌트를 붙인다
- 테스트는 pytest를 사용한다
- 커밋 메시지는 한국어로
```

`claude`를 친다. 놀랍게도 — Claude가 알고 있다. 함수를 만들어달라고 하면 타입 힌트를 붙인다. 테스트를 짜달라고 하면 pytest를 쓴다. 커밋을 시키면 한국어로 한다.

분명히 이 파일을 읽었다. 그런데 언제? 첫 메시지를 보내기도 전에, 도구 호출도 없이 — 어떻게 알았는가? 자연스러운 답: "시스템 프롬프트에 박혀 있겠지".

**틀렸다.** 그게 이 챕터의 놀라움이다. CLAUDE.md는 시스템 프롬프트가 아니다. 더 영리한 자리에 들어간다.

---

## 본문

### 첫 추적: `getUserContext()`

`src/context.ts`의 155줄.

:::tabs

```typescript
// (축약: 진단 로깅, setCachedClaudeMdContent, --bare 모드 분기 등 생략)
export const getUserContext = memoize(
  async (): Promise<{[k: string]: string}> => {
    const claudeMd = shouldDisableClaudeMd
      ? null
      : getClaudeMds(filterInjectedMemoryFiles(await getMemoryFiles()))
    
    return {
      ...(claudeMd && { claudeMd }),
      currentDate: `Today's date is ${getLocalISODate()}.`,
    }
  },
)
```

```python
# Python 등가 — CLAUDE.md를 읽어서 키-값 dict로 돌려주기
from pathlib import Path
from datetime import date

async def get_user_context(cwd: Path) -> dict[str, str]:
    """CLAUDE.md + 현재 날짜를 사용자 컨텍스트로 조합한다."""
    context = {"currentDate": f"Today's date is {date.today().isoformat()}."}

    claude_md = cwd / "CLAUDE.md"
    if claude_md.exists():
        context["claudeMd"] = claude_md.read_text(encoding="utf-8")

    return context
```

:::

"사용자 컨텍스트"라는 이름이다. 시스템 컨텍스트가 아니다. 이 이름이 모든 것을 말해준다. CLAUDE.md는 사용자 쪽 정보로 분류된다.

함수가 돌려주는 건 단순한 **키-값 dict**다 — `{ claudeMd: "...전체 내용...", currentDate: "Today's date is 2026-04-07." }`. 누가 이 dict를 받아서 **진짜로 LLM에 보낼지**를 추적해보자.

### 놀라움: `prependUserContext` — 유저 메시지로 들어간다

`src/utils/api.ts` 449줄.

:::tabs

```typescript
// (축약: NODE_ENV='test' early-return 생략. content 의 \n 을 가독성 위해 줄바꿈으로 표현)
export function prependUserContext(
  messages: Message[],
  context: { [k: string]: string },
): Message[] {
  if (Object.entries(context).length === 0) {
    return messages
  }

  return [
    createUserMessage({
      content: `<system-reminder>
As you answer the user's questions, you can use the following context:
${Object.entries(context)
  .map(([key, value]) => `# ${key}\n${value}`)
  .join('\n')}

      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.
</system-reminder>
`,
      isMeta: true,
    }),
    ...messages,
  ]
}
```

```python
# Python 등가 — CLAUDE.md 내용을 user 메시지로 주입
def prepend_user_context(messages: list[dict], context: dict[str, str]) -> list[dict]:
    """컨텍스트를 <system-reminder> 태그로 감싸서 첫 user 메시지로 삽입."""
    if not context:
        return messages

    sections = "\n".join(f"# {key}\n{value}" for key, value in context.items())
    reminder = f"""<system-reminder>
As you answer the user's questions, you can use the following context:
{sections}

IMPORTANT: this context may or may not be relevant to your tasks.
</system-reminder>"""

    meta_message = {"role": "user", "content": reminder, "is_meta": True}
    return [meta_message, *messages]
    # ⭐ system role이 아니라 user role로 들어간다!
```

:::

세 줄에 걸쳐 충격이 있다.

**(1) `createUserMessage`** — 사용자 메시지로 만든다. **system role이 아니다**. **user role**이다. LLM 입장에서는 사용자가 말한 것처럼 보인다.

**(2) `<system-reminder>` 태그로 감싼다** — "이건 사용자가 말한 게 아니라 시스템이 말하는 것"이라고 LLM에게 문자열로 알린다. XML 태그 한 쌍이 **role 구분을 흉내낸다**.

**(3) `isMeta: true`** — 메시지에 메타 플래그를 단다. 5장에서 본 메시지 렌더링 코드는 이 플래그를 보고 **UI에 표시하지 않는다**. 사용자는 자기 화면에서 이 메시지를 못 본다. 하지만 LLM의 message history에는 분명히 들어 있다. `components/Messages.tsx:144` 의 한 줄이 직접 증거 — `return !msg.isMeta;` (코멘트: **"Real user input only — drop meta/tick messages."**).

이 셋이 합쳐지면 — **LLM은 사용자가 시스템 리마인더를 던진 것처럼 인식**하지만, **사용자는 그런 메시지를 보낸 적도 본 적도 없다**. 완벽한 우회다. 

여기서 잠깐. "사용자 메시지인데 사용자가 보낸 게 아니다"라는 말이 이상하면 — 이 챕터를 읽는 지금 당신에게 일어나는 일을 보자. 당신이 보낸 message에 `<system-reminder>` 태그가 종종 끼어 있는 걸 본 적이 있을 것이다. 그게 정확히 이 메커니즘이다. 사용자처럼 보이지만 코드가 만든 메시지.

### API 호출 시점에 조립된다

여기서 자연스러운 질문이 하나 나온다. **그 메타 메시지는 메시지 히스토리에 영구 저장되는가, 아니면 매번 새로 만들어지는가?** 후자다.

자리는 `query.ts:660`, 2장에서 본 `queryLoop` 의 **API 호출 직전**이다.

:::tabs

```typescript
for await (const message of deps.callModel({
  messages: prependUserContext(messagesForQuery, userContext),
  systemPrompt: fullSystemPrompt,
  ...
}))
```

```python
# Python 등가 — queryLoop의 API 호출 직전, 매 턴마다 즉석 조립
async for message in deps.call_model(
    system_prompt=full_system_prompt,
    messages=prepend_user_context(messages_for_query, user_context),
    # ...
):
    ...  # 응답 메시지 처리
```

:::

`messagesForQuery` — 누적된 진짜 사용자/어시스턴트 히스토리. 메타 메시지는 여기 들어가지 않는다. `prependUserContext` 가 호출되는 그 순간에 메타 메시지를 앞에 끼워 넣어 새 배열을 만든다. **호출이 끝나면 그 배열은 사라진다.** 다음 턴에는 — 새 호출, 새 메타 메시지, 새 배열.

Anthropic Messages API의 호출 모양으로 풀면 이렇다.

```
callModel({
  systemPrompt: <시스템 프롬프트>,        ← system 슬롯 (별도 파라미터)
  messages: [
    { role: 'user', content: '<system-reminder>...claudeMd...</system-reminder>', isMeta: true },  ← prepend (매 턴 새로)
    { role: 'user', content: '실제 사용자 메시지 1' },
    { role: 'assistant', content: '응답 1' },
    { role: 'user', content: '실제 사용자 메시지 2' },
    ...
  ]
})
```

세 영역이 슬롯/위치별로 갈라져 있다.

- **`systemPrompt`** — API의 system 파라미터. 메시지 배열과 **별개 슬롯**.
- **메시지 배열 맨 앞 메타 메시지** — `prependUserContext` 가 매 턴마다 즉석으로 끼워 넣는 자리. CLAUDE.md, currentDate 등이 여기 산다.
- **그 뒤 진짜 히스토리** — 사용자/어시스턴트가 실제로 주고받은 메시지들. AppState 가 영구 보관하는 부분.

매 턴마다 첫 번째와 두 번째는 새로 조립되고 세 번째만 누적된다. 이게 왜 중요한가 — 사용자가 세션 중간에 `CLAUDE.md` 를 고치면 (예: "테스트는 pytest 대신 unittest"로 바꾸면) 다음 턴에 `getUserContext()` 가 (memoize 캐시 만료 후) 새 내용을 읽고, `prependUserContext` 가 그걸 메시지 배열 첫 자리에 끼워 넣는다. **히스토리에 박혀버린 게 아니라 매번 그 자리에 다시 끼워 넣는 식**이라 변경이 즉시 반영된다.

이 "매번 그 자리에 끼워 넣는" 구조가 다음 섹션의 답을 깔아둔다. 시스템 프롬프트에 박지 않고 굳이 메시지 영역에 prepend 한 진짜 이유 — 그건 단순한 캐시 효율 문제가 아니다.

### 왜 시스템 프롬프트에 안 넣었나

짧은 답: **시스템 프롬프트는 인프라가 모든 사용자에게 공유하는 캐시 자산이기 때문**이다. 사용자별로 다른 CLAUDE.md를 거기 넣으면 그 공유가 깨진다.

큰 그림으로 보면 시스템 프롬프트와 메시지 영역이 서로 다른 캐시 계층이다.

```
┌─ 시스템 프롬프트 (Anthropic이 관리하는 인프라 자산) ─┐
│  ★ boundary 앞 → 전 세계 사용자 공유 캐시           │
│  ☆ boundary 뒤 → 자기 세션 안에서만 캐시            │
├─ 메시지 영역 (사용자의 대화) ────────────────────────┤
│  ☆ 메타 메시지 (CLAUDE.md, 날짜 등)                 │
│  ☆ 진짜 user/assistant 히스토리                    │
└──────────────────────────────────────────────────────┘
```

별 ★ 자리가 핵심이다. **시스템 프롬프트 boundary 앞**의 캐시는 Anthropic 인프라 차원에서 *모든 사용자*가 공유한다. 누군가 한 번 만들면 다른 모든 사용자가 거의 무료(0.1배)로 hit — 도구 정의처럼 모두에게 같은 콘텐츠를 거기 두면 cold start 비용을 인프라가 한 번만 지불하고 끝. 도구 정의가 수만 토큰임을 생각하면 어마어마한 절약이다.

반면 ☆ 자리는 한 organization 안에서만 캐시가 공유된다. 메시지 prefix가 사용자별로 다르니 실질적으로는 자기 대화 안에서만 hit.

CLAUDE.md는 사용자/프로젝트별로 다르다. ★ 자리에 넣으면 사용자별로 prefix가 갈라져서 *공유 효과가 사라진다* — 인프라 차원의 자산이 사용자별로 단편화. 그래서 ☆ 자리(메시지 영역)에 prepend된다. 어차피 CLAUDE.md는 자기 대화 안에서만 의미 있는 콘텐츠라 손해 없다. **공유 자산은 깨끗하게, 사용자 콘텐츠는 자기 영역에**. 두 마리 토끼.

여기까지가 큰 그림. 이제 어떻게 ★/☆가 구분되는지, 디테일을 보자.

prompt caching은 Anthropic 서버에서 관리한다. 클라이언트는 API 요청에 `cache_control` 마커를 박아서 "이 prefix는 이런 범위로 공유돼도 된다"고 선언할 뿐이다 (`getCacheControl`, `claude.ts:358`). 선언 가능한 스코프는 두 가지.

| 스코프 | 누가 공유하나 |
|---|---|
| `global` (1P only) | Anthropic 인프라 전체 (모든 사용자) — 위 ★ |
| `org` (기본) | 같은 organization (API 키) — 위 ☆ |

`scope` 필드는 `'global'`일 때만 박힌다. 기본이 `org`, `global`은 명시적 옵트인. 한 가지 주의 — **스코프는 "캐시되나/안 되나"가 아니라 "캐시를 누가 공유하나"**다. `org` 마커도 캐시는 한다, 다만 같은 organization 안에서만. 그리고 **마커는 누적**이다. 한 API 요청에 여러 개(최대 4개) 박을 수 있고, 각각 별개의 캐시 항목을 만든다. Claude Code는 시스템 프롬프트 boundary 앞에 `global` 마커, 메시지 영역 끝에 `org` 마커 — 두 개를 동시에 박는다.

그러면 boundary는 어떻게 콘텐츠를 가르는가. `SYSTEM_PROMPT_DYNAMIC_BOUNDARY`라는 마커가 시스템 프롬프트를 두 영역으로 갈라낸다 (`utils/api.ts:321` `splitSysPromptPrefix`).

- **boundary 앞** — 도구 정의, 안전 룰처럼 **모든 세션에서 같은 정적 콘텐츠**. `cacheScope='global'`로 박힌다(위 그림의 ★).
- **boundary 뒤** — 활성화된 도구 목록, skill 명령처럼 **사용자/세션마다 다른 콘텐츠**. 글로벌 마커는 안 박힌다 — 사용자마다 다르면 해시가 갈라져서 글로벌 캐시가 무의미해지니까. 다만 메시지 영역 `org` 마커가 그 뒤에서 prefix 전체를 한 캐시 단위로 묶어서 자기 세션 안에서는 캐시된다.

| 위치 | 글로벌 마커 ★ | org 마커 ☆ |
|---|---|---|
| 시스템 프롬프트 boundary 앞 | ✅ | ✅ |
| 시스템 프롬프트 boundary 뒤 | ❌ | ✅ |
| 메시지 배열 맨 앞 메타 메시지 (CLAUDE.md) | ❌ | ✅ |

CLAUDE.md를 boundary 앞(★)에 못 넣는 이유는 큰 그림의 "사용자별로 단편화"를 코드 차원에서 풀어보면 세 가지로 정리된다.

1. **글로벌 캐시 단편화** — CLAUDE.md가 사용자/프로젝트별로 다르니 prefix 해시가 사용자 수만큼 갈라진다. ★의 가치(전 세계 공유)가 사라진다.
2. **org 캐시도 의미 없어진다** — 같은 조직 안에서도 프로젝트별로 다르니, 같은 회사 개발자끼리도 시스템 프롬프트 전체가 사용자별로 갈라져버린다.
3. **인프라-사용자 책임 경계가 흐려진다** — 시스템 프롬프트는 Anthropic이 관리하는 공유 자산. 사용자의 가변 콘텐츠를 거기 섞으면 책임이 뒤섞인다.

대신 메시지 영역(☆)에 prepend된다. 메시지 영역 끝에 박힌 `org` 마커(`addCacheBreakpoints`, `claude.ts:3063` — *"Exactly one message-level cache_control marker per request"*)가 prefix 전체를 한 캐시 단위로 묶기 때문에, **메타 메시지(CLAUDE.md 포함)도 두 번째 턴부터 캐시 hit**. 손해가 없다.

<details>
<summary>🔬 Deep Dive — 1P/3P가 만드는 캐시 위계 차이</summary>

> `shouldUseGlobalCacheScope` (`betas.ts:227`)는 `getAPIProvider() === 'firstParty'`일 때만 true다. 글로벌 캐시는 Anthropic 직접 호출(1P) 한정. AWS Bedrock / Google Vertex / Azure Foundry(3P)는 백엔드가 별개라 Anthropic이 자기 인프라의 공유 캐시에 접근시킬 수 없다. 3P에서는 boundary가 의미 없고, 시스템 프롬프트 전체가 `org` 스코프로 떨어진다. **같은 코드가 백엔드에 따라 다른 캐시 위계를 탄다.** 7.1에서 본 1P/3P 분기가 캐시 계층에도 그대로 반영되는 셈.

</details>

### 4단계 메모리 계층

CLAUDE.md는 한 파일이 아니다. 4가지 종류의 파일을 합쳐서 만든다. `claudemd.ts:790`의 `getMemoryFiles()`가 이걸 한다.

```
1. Managed   ← 회사/팀이 강제한 정책 (관리 설정)
2. User      ← ~/.claude/CLAUDE.md (사용자 개인 글로벌)
3. Project   ← <repo>/CLAUDE.md (프로젝트, git에 들어감)
4. Local     ← <repo>/CLAUDE.local.md (개인용, gitignore)
```

위에서 아래로 겹쳐서 적용된다. Managed → User → Project → Local 순. Managed는 항상 먼저, Local은 마지막. 같은 디렉토리에서는 — 부모 → 자식 순으로 **루트부터 CWD까지 전부** 합친다.

> 💡 **AutoMem / TeamMem 은 별도 시스템.** 위 4단계는 **지시문(Instructions)** 분류이고, `claudemd.ts:1077-1086` 의 `isInstructionsMemoryType` 함수가 정확히 이 4종류 (`User, Project, Local, Managed`) 만 인정한다. 추가로 두 종류가 더 있다 — **AutoMem** (사용자 자동 메모리, 대화 사이에 지속) 과 **TeamMem** (팀 공유 메모리, feature flag 뒤). `claudemd.ts:1043-1045` 의 코멘트가 직접 명시: **"AutoMem/TeamMem are intentionally excluded — they're a separate memory system, not 'instructions' in the `CLAUDE.md`/rules sense."** 둘 다 같은 메시지 배열로 prepend되지만 지시문이 아니라 메모리. 이 챕터는 4단계 지시문에만 집중한다.

```
/home/user/CLAUDE.md            ← User 글로벌
/home/user/projects/CLAUDE.md   ← 그 프로젝트
/home/user/projects/api/CLAUDE.md  ← 더 깊은 디렉토리
```

CWD가 `/home/user/projects/api`라면 — 세 파일이 다 합쳐진다.

### 합쳐진 모양 — 진짜 형식

`getClaudeMds()` (1153줄) 가 이 파일들을 어떤 형식으로 합치는지 보자.

:::tabs

```typescript
// (축약: feature('TEAMMEM') 분기 생략 — flag 뒤에서 TeamMem 케이스가 추가됨)
const description =
  file.type === 'Project'
    ? ' (project instructions, checked into the codebase)'
    : file.type === 'Local'
      ? " (user's private project instructions, not checked in)"
      : file.type === 'AutoMem'
        ? " (user's auto-memory, persists across conversations)"
        : " (user's private global instructions for all projects)"  // ← 기본 = User 및 Managed

memories.push(`Contents of ${file.path}${description}:\n\n${content}`)
```

```python
# Python 등가 — 파일 종류별 설명 라벨링
match file.type:
    case "Project":
        description = " (project instructions, checked into the codebase)"
    case "Local":
        description = " (user's private project instructions, not checked in)"
    case "AutoMem":
        description = " (user's auto-memory, persists across conversations)"
    case _:  # 기본 = User 및 Managed
        description = " (user's private global instructions for all projects)"

memories.append(f"Contents of {file.path}{description}:\n\n{content}")
```

:::

각 파일이 경로 + 종류 설명과 함께 들어간다. LLM이 "이건 어떤 파일인가"를 알 수 있도록.

```
Contents of /home/user/.claude/CLAUDE.md (user's private global instructions for all projects):

[CLAUDE.md 내용]

Contents of /home/user/projects/api/CLAUDE.md (project instructions, checked into the codebase):

[CLAUDE.md 내용]
```

그리고 그 위에 지시문이 박힌다.

```
Codebase and user instructions are shown below. Be sure to adhere to these instructions. IMPORTANT: These instructions OVERRIDE any default behavior and you MUST follow them exactly as written.
```

LLM에게 "이걸 따라야 한다, 기본 동작보다 우선이다"라고 명시한다. **override**라는 단어가 핵심 — 시스템 프롬프트의 일반 지침과 충돌하면, CLAUDE.md가 이긴다. 

### 모든 게 합쳐지는 자리

다 정리하면 — Claude가 매 턴마다 보는 메시지 배열은 이렇게 생겼다.

```
[
  {
    role: "user",
    content: "<system-reminder>
              ...
              # claudeMd
              Contents of /.../CLAUDE.md (...): ...
              Contents of /.../CLAUDE.md (...): ...
              # currentDate
              Today's date is 2026-04-07.
              ...
              </system-reminder>",
    isMeta: true,                          ← UI에 안 보임
  },
  { role: "user", content: "안녕" },        ← 진짜 사용자 메시지
  { role: "assistant", content: "..." },
  ...
]
```

**메타 메시지 한 개가 모든 진짜 메시지 위에 떠 있다.** UI에는 안 보이지만 LLM은 본다. 매 턴마다. CLAUDE.md를 수정해도 — 다음 턴부터는 새 내용이 그 자리에 들어간다. 시스템 프롬프트는 고정된 채로.

---

## Python으로 옮기면

같은 패턴을 Python으로 옮기면 이렇게 생겼다.

```python
from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal


MemoryType = Literal["Managed", "User", "Project", "Local"]


@dataclass
class MemoryFile:
    path: Path
    type: MemoryType
    content: str


# ─── 1단계: 4가지 종류 파일 모으기 ────────────────
def get_memory_files(cwd: Path) -> list[MemoryFile]:
    """Managed → User → Project → Local 순서로 수집."""
    result: list[MemoryFile] = []
    
    # User 글로벌
    user_md = Path.home() / ".claude" / "CLAUDE.md"
    if user_md.exists():
        result.append(MemoryFile(user_md, "User", user_md.read_text()))
    
    # 루트부터 CWD까지 모든 CLAUDE.md
    current = cwd
    dirs: list[Path] = []
    while current != current.parent:
        dirs.append(current)
        current = current.parent
    
    for d in reversed(dirs):
        project_md = d / "CLAUDE.md"
        if project_md.exists():
            result.append(MemoryFile(project_md, "Project", project_md.read_text()))
        
        local_md = d / "CLAUDE.local.md"
        if local_md.exists():
            result.append(MemoryFile(local_md, "Local", local_md.read_text()))
    
    return result


# ─── 2단계: 하나의 문자열로 합치기 ────────────────
MEMORY_INSTRUCTION = (
    "Codebase and user instructions are shown below. "
    "Be sure to adhere to these instructions. "
    "IMPORTANT: These instructions OVERRIDE any default behavior "
    "and you MUST follow them exactly as written."
)


def get_claude_mds(files: list[MemoryFile]) -> str:
    descriptions = {
        "Managed": " (managed by your organization)",
        "User": " (user's private global instructions for all projects)",
        "Project": " (project instructions, checked into the codebase)",
        "Local": " (user's private project instructions, not checked in)",
    }
    
    memories = [
        f"Contents of {f.path}{descriptions[f.type]}:\n\n{f.content.strip()}"
        for f in files
    ]
    
    return f"{MEMORY_INSTRUCTION}\n\n" + "\n\n".join(memories)


# ─── 3단계: 메타 사용자 메시지로 prepend ────────────────
def prepend_user_context(
    messages: list[dict],
    context: dict[str, str],
) -> list[dict]:
    """LLM에 보낼 메시지 배열의 맨 앞에 메타 메시지 하나를 끼워 넣는다."""
    if not context:
        return messages
    
    body = "\n".join(f"# {k}\n{v}" for k, v in context.items())
    
    return [
        {
            "role": "user",  # ← 시스템이 아니라 사용자 역할
            "content": (
                "<system-reminder>\n"
                "As you answer the user's questions, you can use the following context:\n"
                f"{body}\n\n"
                "IMPORTANT: this context may or may not be relevant to your tasks. "
                "You should not respond to this context unless it is highly relevant.\n"
                "</system-reminder>\n"
            ),
            "is_meta": True,  # ← UI에 안 보임
        },
        *messages,
    ]


# ─── 사용 ────────────────
memory_files = get_memory_files(Path.cwd())
claude_md = get_claude_mds(memory_files)

messages = [{"role": "user", "content": "안녕"}]
final_messages = prepend_user_context(
    messages,
    {"claudeMd": claude_md, "currentDate": "2026-04-07"},
)

# LLM에 보낼 때:
# final_messages[0] = 메타 메시지 (CLAUDE.md 들어 있음, isMeta=True)
# final_messages[1] = 진짜 사용자 메시지 ("안녕")
```

핵심 셋이 다 있다.

1. **`get_memory_files`** — 4단계 계층 수집.
2. **`get_claude_mds`** — 경로 + 설명 annotation 붙여서 한 문자열로.
3. **`prepend_user_context`** — 사용자 역할에 `<system-reminder>` 태그로 감싸서 메시지 배열 맨 앞에.

진짜 Claude Code는 여기에 **git status**, 현재 날짜, **managed rules**, **.claude/rules/** 디렉토리, **nested `CLAUDE.md`**, **@-include 직접 지시문** 등이 더해진 게 1,480줄이다. 본질은 위 50줄.

> 💡 **`<system-reminder>` 태그가 우리도 쓰는 패턴.** 이 책을 쓰는 지금 — 당신이 본 메시지에 `<system-reminder>` 태그가 종종 있는 것을 봤을 것이다. **Task tools 알림**, 현재 디렉토리, 시간 변경, **`MEMORY.md` 내용** 등. 정확히 같은 메커니즘이다. 코드가 사용자 역할로 끼워넣은 메시지. CLAUDE.md만 그런 게 아니라 — **클라이언트가 LLM에게 상황을 알리는 모든 것**이 이 패턴을 쓴다. `src/` 안에 `<system-reminder>` 를 쓰는 파일이 **22개** — `FileReadTool`, `AgentTool/prompt.ts`, `attachments.ts`, `messages.ts`, `sideQuestion.ts`, `brief.ts`, `ultraplan.tsx`, `memdir/memoryAge.ts`, `constants/prompts.ts` 등. **하나의 메커니즘이 시스템 지시문, 컨텍스트 알림, 메모리 주입, 도구 결과 메타데이터를 다 처리한다**.

---

## 핵심 정리

- **CLAUDE.md는 시스템 프롬프트가 아니다.** 메타 사용자 메시지로 변환되어 메시지 배열의 맨 앞에 prepend된다 — `<system-reminder>` 태그로 감싸고 `isMeta: true` 플래그.
- 왜 시스템 프롬프트에 안 넣었나: **시스템 프롬프트의 캐시는 자기 대화 밖까지 공유되도록 설계됐기 때문**. `global` 마커는 모든 Claude Code 사용자가, `org` 마커는 같은 조직이 공유한다. 사용자/프로젝트별로 다른 CLAUDE.md를 거기 넣으면 공유 자산이 단편화. 대신 메시지 영역의 `org` 마커가 prefix 전체를 커버해서 **두 번째 턴부터 캐시 hit** — 손해 없다.
- 4단계 계층: **Managed → User → Project → Local**. 위에서 아래로 겹쳐서 적용. CWD에서 루트까지 **모든 디렉토리의 `CLAUDE.md`**가 합쳐진다.
- 각 파일은 경로 + 종류 설명과 함께 박힌다 (`"(project instructions, checked into the codebase)"` 식). LLM이 어떤 종류의 지침인지 구분할 수 있도록.
- 합쳐진 메시지의 첫 줄은 **`MEMORY_INSTRUCTION_PROMPT`** — **"This OVERRIDES any default behavior and you MUST follow them"**. 시스템 프롬프트의 일반 지침과 충돌하면 CLAUDE.md가 이긴다.
- `<system-reminder>` 태그는 CLAUDE.md만 쓰는 게 아니라 **클라이언트가 LLM에게 상황을 알리는 모든 것**에 쓰이는 일반 패턴. 5장의 메시지 시스템과 6장의 컨텍스트 주입의 접점.
- 다음 챕터(6.2): 메타 메시지가 어디 사는지 — **AppState** 안의 메시지 배열. 5.2에서 본 그 store에 모든 게 다 모인다.

