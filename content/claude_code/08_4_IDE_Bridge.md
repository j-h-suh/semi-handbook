# 8.4 IDE Bridge — VS Code 확장과 파일시스템 랑데부로 통신

---

## 이 챕터에서 배우는 것

- **IDE 통합이 새 서브시스템이 아니라 7.2의 MCP 클라이언트를 그대로 재사용**한다는 사실
- 파일시스템 랑데부 — 네트워크 브로드캐스트가 아니라 로크파일로 프로세스끼리 만나는 패턴
- 2단계 필터 + 1회 사전 정리 — workspace 매칭(NFC 정규화), PID 조상 걷기(lazy), cleanup 에서의 포트 응답 검사
- **매크로 OS 사고**: NFD(macOS 파일시스템) vs NFC(VS Code) Unicode 정규화 차이 때문에 한글 경로가 매칭 실패하던 버그

---

## 사용자 경험에서 출발

VS Code의 내장 터미널에서 `claude`를 친다. 몇 초 뒤 상단에 **"Connected to VS Code"** 같은 표시가 뜬다. 이제부터 — Claude가 내가 편집 중인 파일을 안다. 커서 위치도 안다. 내가 선택한 텍스트도 볼 수 있다. 파일을 Edit하면 **VS Code의 diff 뷰어**가 바로 뜬다. 타입 에러가 있으면 Claude가 **VS Code의 LSP 진단**을 직접 읽는다.

잠깐, 이거 어떻게 가능하지? `claude`는 터미널 프로세스다. VS Code는 **GUI 프로세스**. 두 별개의 프로세스가 어떻게 자동으로 서로를 찾지? 아무도 IP를 설정한 적이 없다. 포트도 설정한 적이 없다.

이 챕터에서 — 두 프로세스가 서로를 찾는 가장 오래된 트릭을 본다. 그리고 일단 찾은 뒤에는 이미 우리가 본 인프라를 그대로 쓴다.

---

## 본문

### 발견은 파일시스템 랑데부

답: **로크파일**. 잘 알려진 디렉토리(`~/.claude/ide/`)에 IDE 확장이 자기를 광고하는 작은 파일을 쓴다. Claude Code는 그 디렉토리를 폴링한다. 이게 전부.

IDE 확장 쪽에서 먼저 이렇게 한다 (VS Code 확장이 설치되면 자동으로):

```
~/.claude/ide/49532.lock  ← 파일명이 포트번호
```

파일 내용은 JSON이다:

```json
{
  "workspaceFolders": ["/Users/jenghun/projects/playground"],
  "pid": 87412,
  "ideName": "VS Code",
  "transport": "sse",
  "runningInWindows": false,
  "authToken": "eyJhbG…"
}
```

**7가지 정보**가 이 한 파일 안에 다 있다.

| 필드 | 역할 |
|---|---|
| 파일명(`49532.lock`) | IDE 확장이 열고 있는 **MCP 서버 포트** |
| `workspaceFolders` | IDE가 열어둔 프로젝트 경로들 — **cwd 매칭**에 사용 |
| `pid` | IDE 프로세스 ID — **PID 조상 확인**에 사용 |
| `ideName` | "VS Code", "Cursor", "WebStorm"… |
| `transport` | `ws`(WebSocket) 또는 `sse`(Server-Sent Events) |
| `runningInWindows` | WSL 내 Claude ↔ Windows VS Code 경로 변환 플래그 |
| `authToken` | MCP 연결 시 헤더에 실어 보내는 인증 토큰 |

**이 디자인의 아름다움**: 네트워크 브로드캐스트도, 서비스 디스커버리 데몬도, ZeroConf도 필요 없다. 파일시스템 하나. 가장 오래되고 가장 이식성 좋은 IPC 채널. 게다가 `~/.claude/ide/` 는 **이미 Claude Code가 접근하는** 디렉토리. **0 추가 의존성**.

하위 호환성 디테일도 챙긴다. `readIdeLockfile` (`ide.ts:359-372`) 의 `try/catch` 는 JSON 파싱 실패 시 **과거 line-delimited 형식** (`content.split('\n')`) 으로 폴백. JSON 형식이 깨져도 워크스페이스 정보는 살아남음. **옛 IDE 확장 버전**과의 호환성을 위해 코드 한 분기를 남겨 둔 것.

> ⚙️ **WSL ↔ Windows 로크파일 경로 가산** (`ide.ts:462-515`). WSL 환경의 Claude Code 는 `~/.claude/ide` 외에도 (a) Windows USERPROFILE 의 `.claude/ide` (`powershell.exe` 로 해결), (b) `/mnt/c/Users/<user>/.claude/ide` 모든 사용자 디렉토리까지 검색 경로에 추가. **Windows VS Code 가 만든 lockfile 을 WSL 안의 Claude Code 가 발견** 할 수 있게 함. 0 추가 의존성 디자인이 **WSL/Windows boundary** 를 어떻게 우아하게 건너는지의 정수 — **파일시스템 랑데부의 진가는 boundary 횡단**. 네트워크 디스커버리는 NAT/방화벽에 막히지만 공유 파일시스템 위치는 boundary 를 그대로 지나간다.

### 폴링 루프 — 30초, 1초 간격

`utils/ide.ts:626` — `findAvailableIDE`.

```typescript
let currentIDESearch: AbortController | null = null    // ← module-level

export async function findAvailableIDE(): Promise<DetectedIDEInfo | null> {
  // *재호출 시 이전 폴링 abort* — 동시에 두 폴링 루프 안 도는 디자인
  if (currentIDESearch) currentIDESearch.abort()
  currentIDESearch = createAbortController()
  const signal = currentIDESearch.signal
  
  // *cleanup 은 폴링 루프 진입 *전* 한 번* — 폴링 도중에는 다시 안 부름
  await cleanupStaleIdeLockfiles()
  
  const startTime = Date.now()
  while (Date.now() - startTime < 30_000 && !signal.aborted) {
    // 스크롤 드레인 중엔 양보 — 이벤트 루프 충돌 방지
    if (getIsScrollDraining()) {
      await sleep(1000, signal)
      continue
    }
    const ides = await detectIDEs(false)
    if (ides.length === 1) {   // ← *정확히 하나*
      return ides[0]!
    }
    await sleep(1000, signal)
  }
  return null
}
```

30초동안 1초 간격으로 폴링. 왜 30초? — 확장이 느리게 시작할 수도 있고, 사용자가 `claude` 를 먼저 띄우고 나중에 VS Code를 열 수도 있다. 그래서 여유를 둔다. 30초 뒤에도 못 찾으면 포기.

**`ides.length === 1` 조건이 엄격하다**. 정확히 하나여야 매칭. 여러 개면 사용자가 `/ide` 로 직접 선택. 잘못 매칭하면 — **다른 IDE의 컨텍스트**로 넘어간다 (예: 두 개의 VS Code 윈도우가 같은 프로젝트를 열어 놓은 경우).

스크롤 드레인 가드가 재밌다. `detectIDEs()` 는 **로크파일 읽고 + `ps` 명령 실행한다 — 5.3의 가상 스크롤이 프레임을 그리고 있는 동안**에 이 I/O가 **이벤트 루프를 점유하면 스크롤이 뚝뚝 끊긴다**. 그래서 스크롤 드레인 중엔 한 턴 양보.

**module-level `currentIDESearch` AbortController 도 같은 정신 — 동시에 두 폴링 루프가 안 돈다**. 사용자가 `/ide` 를 수동 실행하거나 cwd 를 바꾸면 **이전 30초 폴링이 즉시 abort**. 8.2의 `createChildAbortController` 와 같은 **signal propagation** 정신.

### 2단계 필터 + 1회 사전 정리

per-poll 검출 (`detectIDEs`) 안에는 체가 둘이고, 그 앞에 `findAvailableIDE` 시작 시 한 번 실행되는 스테일 정리가 있다.

```
findAvailableIDE() {
  await cleanupStaleIdeLockfiles()       // ← *0단계: 한 번* — 죽은 PID + 응답 없는 포트 정리
  while (30초 미만) {
    if (scrollDraining) sleep(1초); continue
    ides = await detectIDEs(false) {
      // *1단계: workspace 매칭* (NFC 정규화)
      // *2단계: PID 조상 걷기* (lazy + memoized)
    }
    if (ides.length === 1) return ides[0]
    sleep(1초)
  }
}
```

**0단계: 스테일 로크파일 정리** (`cleanupStaleIdeLockfiles`, `ide.ts:522`)

폴링 진입 전 한 번. **죽은 PID** (`isProcessRunning` 으로 검사) 또는 (WSL/no-PID 케이스에서) 응답 없는 포트 (`checkIdeConnection`, 500ms TCP 연결 — `ide.ts:402`) 의 로크파일을 삭제. IDE 가 크래시 해서 로크파일을 못 지운 경우 쌓이는 걸 막는다. 가비지 컬렉션의 파일시스템 버전. 폴링 도중에는 다시 안 부름 — 30초 동안 새로 들어온 좀비는 다음 `findAvailableIDE` 호출에서 정리.

**1단계: Workspace 매칭** (`ide.ts:704`, 축약)
```typescript
// ide.ts:704 (축약 — WSL distro/path 변환 + Windows 드라이브 문자 정규화 ~50줄 생략)
isValid = lockfileInfo.workspaceFolders.some(idePath => {
  const resolvedPath = resolve(localPath).normalize('NFC')
  return cwd === resolvedPath || 
         cwd.startsWith(resolvedPath + pathSeparator)
})
```

현재 `cwd` 가 IDE의 `workspaceFolders` 중 하나 안에 있는지. 이게 기본 매칭. 그런데 **`.normalize('NFC')` 가 결정적**이다.

**매크로 OS 사고** — 코멘트가 설명한다:

```typescript
// macOS returns NFD paths (decomposed Unicode), while IDEs like 
// VS Code report NFC paths (composed Unicode). Without normalization,
// paths containing accented/CJK characters fail to match.
const cwd = getOriginalCwd().normalize('NFC')
```

macOS 파일시스템(HFS+)은 유니코드를 분해 형식(NFD)으로 저장. "김"은 ㄱ + ㅣ + ㅁ 세 개의 코드포인트. VS Code는 결합 형식(NFC)로 경로를 보고한다 — "김" 한 개의 코드포인트. **같은 한글이지만 바이트가 다르다**. 정규화 없으면 한글/중국어/일본어/아랍어 프로젝트에서 IDE 매칭이 영원히 실패. 한 줄 `.normalize('NFC')` 가 **전 세계 비영어권 사용자의 IDE 통합을 살렸다**.

**2단계: PID 조상 걷기** (`ide.ts:770`, **지원 터미널 + 비-WSL 한정**)

워크스페이스가 매칭되어도 — **그게 내가 있는 IDE인지** 확신할 수 없다. **두 개의 VS Code 윈도우**가 같은 프로젝트를 열어 놓으면 둘 다 매칭된다. 그럼 내 터미널은 어느 윈도우에 속하지?

답: 내 프로세스의 조상 체인에 IDE의 PID가 있어야 한다.

```typescript
const needsAncestryCheck = getPlatform() !== 'wsl' && isSupportedTerminal()
// ... 워크스페이스 매칭 통과 후 ...
if (needsAncestryCheck) {
  if (process.ppid !== lockfileInfo.pid) {
    const ancestors = await getAncestors()
    if (!ancestors.has(lockfileInfo.pid)) {
      continue  // 내 조상이 아닌 IDE — skip
    }
  }
}
```

`getAncestors()` 는 `ps` 를 최대 10번 반복해서 부모의 부모의 부모의… PID들을 수집. Claude Code 터미널의 조상 체인 안에 **IDE의 PID가 있어야 내 IDE**. 없으면 — 다른 IDE 윈도우의 로크파일이다. 무시. **WSL 에서는 PID 조상 체크 자체를 안 함** — WSL 안의 `ps` 는 Windows 측 IDE 프로세스를 못 보고 PPID 도 **커널 boundary** 를 못 건넌다.

이게 진짜 잘 짠 부분: 워크스페이스 매칭이 통과한 후에만 `ps` 호출. 이전에는 모든 로크파일에 대해 `ps` 를 돌렸는데 — **CPU 프로파일**에서 `findAvailableIDE` 폴링이 부하 주범으로 떴다. 순서를 뒤집어서 **대부분의 로크파일은 workspace 필터에서 탈락**해 `ps` 까지 안 온다.

> ⚙️ **CPU 프로파일이 만든 두 최적화** (`ide.ts:681-689`). 같은 함수 안에 측정 기반 최적화 둘. (a) **parallel readlock**: `Promise.all(lockfiles.map(readIdeLockfile))` — 코멘트 verbatim **"findAvailableIDE() polls this every 1s for up to 30s; serial I/O here was showing up as ~500ms self-time in CPU profiles."** 직렬 I/O 가 **500ms self-time** 으로 잡혀서 병렬화. (b) **lazy + once-per-call memoize**: `getAncestors = makeAncestorPidLookup()` — **closure 만 만들고 즉시 실행 안 함**. workspace 매칭이 통과한 **첫 번째 lockfile** 에서야 `ps` 한 번, 결과를 **`detectIDEs` 한 호출의 끝까지 메모이즈**. 정상 케이스 (모든 lockfile 이 workspace 에서 탈락) → `ps` **0번**. 매칭 통과 시 → `ps` 최대 10번, 같은 호출 안의 다음 lockfile 은 재계산 안 함. 코멘트: **"with the workspace-check-first ordering below, this often never fires at all"**.

### 일단 찾으면 — **그냥 MCP 서버**

2단계 필터를 통과한 `DetectedIDEInfo` 가 어떻게 쓰이는지가 가장 흥미롭다. `useIDEIntegration.tsx`:

```typescript
// useIDEIntegration.tsx (축약 — autoConnectEnabled 6중 분기 + prev?.ide 가드 생략)
const autoConnectEnabled = (
  globalConfig.autoConnectIde ||
  autoConnectIdeFlag ||
  isSupportedTerminal() ||
  process.env.CLAUDE_CODE_SSE_PORT ||      // ← tmux/screen 우회
  ideToInstallExtension ||
  isEnvTruthy(process.env.CLAUDE_CODE_AUTO_CONNECT_IDE)
) && !isEnvDefinedFalsy(process.env.CLAUDE_CODE_AUTO_CONNECT_IDE)
if (!autoConnectEnabled) return

setDynamicMcpConfig(prev => {
  if (prev?.ide) return prev               // ← 이미 있으면 덮어쓰지 않음
  return {
    ...prev,
    ide: {
      type: ide.url.startsWith('ws:') ? 'ws-ide' : 'sse-ide',  // ← 7.2!
      url: ide.url,
      ideName: ide.name,
      authToken: ide.authToken,
      ideRunningInWindows: ide.ideRunningInWindows,
      scope: 'dynamic' as const,
    },
  }
})
```

**이게 전부다**. 발견된 IDE를 **MCP 서버 설정으로 변환**. `type: 'sse-ide'` 또는 `'ws-ide'` — 7.2에서 본 8가지 전송 방식 중 두 개. 그 다음부터는 **7.2의 MCP 클라이언트 코드가 알아서 한다**.

숨은 디테일 도 흥미롭다. `CLAUDE_CODE_SSE_PORT` 환경 변수 분기는 **tmux/screen 우회용** — 터미널 멀티플렉서가 `TERM_PROGRAM` 을 덮어 써서 터미널 검출이 깨지지만 IDE 확장의 포트 환경 변수는 상속되어 살아남는다. 그리고 `prev?.ide` 가 이미 있으면 덮어쓰지 않음 — 사용자가 `/ide` 로 수동 선택한 것을 자동 발견이 침범 못 하도록.

- `connectToServer` 가 SSE/WS 채널 연다 (`authToken` 헤더 같이)
- `fetchToolsForClient` 가 `tools/list` MCP 요청 보낸다
- IDE 확장이 자기 도구들을 **Claude Code Tool 형식**으로 반환 — 그런데 모두 받아들이지는 않는다. `services/mcp/client.ts:568`:

```typescript
const ALLOWED_IDE_TOOLS = ['mcp__ide__executeCode', 'mcp__ide__getDiagnostics']
function isIncludedMcpTool(tool: Tool): boolean {
  return (
    !tool.name.startsWith('mcp__ide__') || ALLOWED_IDE_TOOLS.includes(tool.name)
  )
}
```

**IDE 도구는 2개만 하드 화이트리스트**:
  - `mcp__ide__getDiagnostics` — VS Code 의 LSP 타입 에러 / 진단 가져오기
  - `mcp__ide__executeCode` — Jupyter 셀 실행

IDE 확장이 수십 개를 노출해도 `mcp__ide__*` 접두사인 한 이 둘이 아니면 전부 필터 탈락. **이게 또 다른 우아함** — IDE 확장은 마음대로 진화해도 Claude Code 의 권한 표면이 안정. 다른 MCP 서버는 모든 도구를 받아들이지만 **내장 IDE 만은 예외** — 워낙 자주 쓰는 채널이라 기본 표면을 좁게 유지.

- 6.4의 권한 매칭은 `mcp__ide__getDiagnostics` / `mcp__ide__executeCode` 풀네임으로 자동 작동
- 3.2의 Tool 인터페이스를 통해 8.1의 `query` 루프가 호출한다

**IDE 통합은 새로운 서브시스템이 아니다**. 7.2의 MCP 인프라 + 8.1의 query 루프 + 6.4의 권한 매처가 이미 존재한다. IDE Bridge는 그저 발견 메커니즘(로크파일 + 폴링)만 덧붙인다. **추상화의 힘** — 일단 "외부 도구는 MCP 서버다" 라는 추상을 세우면, **IDE도 그냥 MCP 서버**로 잡힌다.

---

## Python으로 옮기면

핵심만 압축해서:

```python
from __future__ import annotations
import asyncio
import json
import os
import socket
import time
import unicodedata
from pathlib import Path
from dataclasses import dataclass


@dataclass
class IdeLockfileInfo:
    port: int
    workspace_folders: list[str]
    pid: int | None
    ide_name: str | None
    transport: str  # "ws" or "sse"
    auth_token: str | None


# ─── 로크파일 읽기 ────────────────
def read_ide_lockfile(path: Path) -> IdeLockfileInfo | None:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    
    # 파일명에서 포트 추출
    port = int(path.stem)  # "49532.lock" → 49532
    
    return IdeLockfileInfo(
        port=port,
        workspace_folders=data.get("workspaceFolders", []),
        pid=data.get("pid"),
        ide_name=data.get("ideName"),
        transport=data.get("transport", "sse"),
        auth_token=data.get("authToken"),
    )


# ─── 프로세스 조상 체인 ────────────────
async def get_ancestor_pids(start_pid: int, max_depth: int = 10) -> set[int]:
    """부모의 부모의 … PID들을 수집."""
    ancestors: set[int] = set()
    pid = start_pid
    for _ in range(max_depth):
        if pid <= 1:
            break
        ancestors.add(pid)
        # macOS/Linux: ps -o ppid= -p <pid>
        try:
            proc = await asyncio.create_subprocess_exec(
                "ps", "-o", "ppid=", "-p", str(pid),
                stdout=asyncio.subprocess.PIPE,
            )
            stdout, _ = await proc.communicate()
            pid = int(stdout.decode().strip())
        except (ValueError, OSError):
            break
    return ancestors


# ─── 포트 응답 확인 ────────────────
def check_port_open(host: str, port: int, timeout_sec: float = 0.5) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout_sec):
            return True
    except OSError:
        return False


# ─── 4단계 필터로 IDE 찾기 ────────────────
async def detect_ides(cwd: Path) -> list[IdeLockfileInfo]:
    ide_dir = Path.home() / ".claude" / "ide"
    if not ide_dir.exists():
        return []
    
    # *macOS NFD vs IDE NFC 사고 회피*
    cwd_normalized = unicodedata.normalize("NFC", str(cwd.resolve()))
    
    matched: list[IdeLockfileInfo] = []
    for lockfile_path in sorted(
        ide_dir.glob("*.lock"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    ):
        info = read_ide_lockfile(lockfile_path)
        if not info:
            continue
        
        # 1. Workspace 매칭 (NFC 정규화)
        is_within_workspace = any(
            cwd_normalized == unicodedata.normalize("NFC", str(Path(folder).resolve()))
            or cwd_normalized.startswith(
                unicodedata.normalize("NFC", str(Path(folder).resolve())) + os.sep
            )
            for folder in info.workspace_folders
        )
        if not is_within_workspace:
            continue
        
        # 2. PID 조상 걷기 (매칭 *이후에* — 비싼 작업을 뒤로)
        if info.pid:
            ancestors = await get_ancestor_pids(os.getppid())
            if info.pid not in ancestors and os.getppid() != info.pid:
                continue
        
        # 3. 포트 응답 확인
        if not check_port_open("localhost", info.port):
            continue
        
        matched.append(info)
    
    return matched


# ─── 폴링 루프 — 30초 / 1초 ────────────────
async def find_available_ide(cwd: Path) -> IdeLockfileInfo | None:
    """30초 동안 1초 간격으로 *정확히 하나*의 IDE를 찾는다."""
    start = time.monotonic()
    while time.monotonic() - start < 30.0:
        ides = await detect_ides(cwd)
        if len(ides) == 1:
            return ides[0]
        await asyncio.sleep(1.0)
    return None


# ─── 일단 찾으면 — MCP 서버로 변환 (7.2 재사용) ────────────────
def ide_to_mcp_config(ide: IdeLockfileInfo) -> dict:
    """IDE를 *MCP 서버 설정*으로 — 7.2의 코드가 나머지를 담당."""
    scheme = "ws" if ide.transport == "ws" else "http"
    path = "/sse" if ide.transport == "sse" else ""
    return {
        "type": "ws-ide" if ide.transport == "ws" else "sse-ide",
        "url": f"{scheme}://localhost:{ide.port}{path}",
        "ideName": ide.ide_name,
        "authToken": ide.auth_token,
    }
```

핵심 셋이 다 있다.

1. **로크파일 = 파일시스템 랑데부**. `~/.claude/ide/*.lock` 하나로 발견 완료. 네트워크 브로드캐스트도, mDNS도, 서비스 디스커버리 데몬도 없음.
2. **4단계 필터에 순서가 중요**. 싼 workspace 매칭 먼저, 비싼 `ps` 조상 걷기를 뒤로. **CPU 프로파일에서 배운 교훈**.
3. **IDE → MCP 서버 변환**. 일단 찾으면 7.2의 인프라를 그대로 재사용. IDE Bridge는 발견 메커니즘일 뿐 새 서브시스템이 아니다.

> 💡 **`unicodedata.normalize('NFC', ...)`.** 한글/CJK 파일명을 다루는 Python 프로젝트는 이 함수를 반드시 알아야 한다. macOS는 파일명을 NFD로 저장, 대부분의 애플리케이션(브라우저, VS Code, 터미널)은 NFC. 같은 "김"이지만 바이트가 다른 두 형태. 정규화 없으면 등가 비교가 실패한다. Claude Code의 IDE 통합이 한글 프로젝트에서 작동하는 이유가 이 한 줄.

---

## 핵심 정리

- **IDE Bridge는 새 서브시스템이 아니다** — 7.2의 MCP 클라이언트(`sse-ide`/`ws-ide` 전송)를 그대로 재사용. IDE Bridge가 추가하는 건 발견 메커니즘뿐.
- **발견은 파일시스템 랑데부**: IDE 확장이 `~/.claude/ide/{port}.lock` 에 JSON 메타데이터를 쓴다 (port, pid, workspaceFolders, transport, authToken …). Claude Code가 그 디렉토리를 폴링한다. 네트워크 브로드캐스트 없음, ZeroConf 없음. 0 추가 의존성.
- 폴링 루프: **30초 동안 1초 간격**. 정확히 한 개의 매칭 IDE를 찾을 때까지. 여러 개면 사용자가 `/ide` 로 직접 선택. 스크롤 드레인 중엔 양보 (5.3의 가상 스크롤 프레임과 충돌 방지).
- **2단계 필터 + 1회 사전 정리**: 폴링 진입 전 한 번 `cleanupStaleIdeLockfiles` (죽은 PID + 응답 없는 포트의 lockfile 삭제). 이후 매 폴링마다 `detectIDEs` 안에서 ① `cwd ⊂ workspaceFolders` (NFC 정규화), ② **PID 조상 걷기** (`ps` 최대 10번, **지원 터미널 + 비-WSL 한정**, lazy + once-per-call memoize). `checkIdeConnection` 은 **cleanup 안에서만** 호출 — 매 폴링 부담 없음. **순서는 CPU 프로파일에서 배움** (workspace-check-first 로 `ps` 호출이 대부분 0회).
- **NFC vs NFD 사고**: macOS 파일시스템은 NFD(분해 형식), VS Code는 NFC(결합 형식). `.normalize('NFC')` 한 줄이 **한글/중국어/일본어 프로젝트의 IDE 통합을 살렸다**. **유니코드는 무서운 영역**.
- **PID 조상 걷기**: 두 개의 VS Code 윈도우가 같은 프로젝트를 열어도 — **내 터미널이 속한 IDE**를 정확히 찾기 위해 `process.ppid → ppid → ppid …` 10레벨까지 걸어 올라간다. `ps` 호출이 비싸서 워크스페이스 매칭이 통과한 후에만 실행.
- **일단 찾으면** — `DetectedIDEInfo → MCP 서버 설정` 변환만 하면 끝. 7.2의 `connectToServer` → `fetchToolsForClient` 가 이미 존재하는 파이프라인에서 자동. **그런데 IDE 도구는 2개만 하드 화이트리스트** (`ALLOWED_IDE_TOOLS = ['mcp__ide__executeCode', 'mcp__ide__getDiagnostics']`) — IDE 확장이 더 노출해도 필터 탈락. **권한 표면 안정성**. **추상화의 힘** — "외부 도구는 MCP 서버" 가 한 번 정해지면 **IDE 도 그저 MCP 서버**, 다만 그 도구 집합만 좁게 고정.
- **Part 8 (멀티 에이전트와 IDE 브리지) 완료**. 8.1 재귀, 8.2 격리, 8.3 조율, 8.4 발견. 모두 같은 원리: **새 추상을 발명하지 말고 있는 추상을 재사용**. AgentTool은 `query()` 재귀. CoordinatorMode는 프롬프트 변경. IDE Bridge는 로크파일 + MCP. **승부처는 기존 조각의 조합**이다.

---

*다음 챕터: 9.1 설계 — 미니 에이전트의 골격 한 장 그리기*
