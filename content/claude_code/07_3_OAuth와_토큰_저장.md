# 7.3 OAuth와 토큰 저장 — CLI에서 브라우저 인증을 받는 법

---

## 이 챕터에서 배우는 것

- **CLI 도구**가 **브라우저 OAuth**를 받아내는 근본적으로 이상한 문제와 그 해법
- `ClaudeAuthProvider`가 **MCP SDK와 Claude Code 저장소** 사이의 어댑터인 이유
- 플랫폼별 보안 저장소 — macOS Keychain → 플레인텍스트 fallback의 한 인터페이스
- 프로덕션 단단함: stale-while-error 캐시, 토큰 redaction, CSRF state, 4096B stdin 버퍼 사고

---

## 사용자 경험에서 출발

7.2에서 GitHub MCP 서버를 추가했다고 하자. 첫 호출 — 바로 죽는다. `needs-auth` 상태. Claude Code가 알려준다:

```
This MCP server requires authentication.
Run /mcp auth github to authorize.
```

`/mcp auth github` 을 친다. 마법처럼 브라우저가 열린다. GitHub 로그인 페이지. 권한 동의 버튼. 누른다. 브라우저에 **"Authentication successful — you can close this tab"** 가 뜬다. 터미널로 돌아와 보면 — 연결이 이미 됐다. 다시 같은 명령. 이번엔 동작.

잠깐, 이상한데. **CLI 도구가 어떻게 브라우저 응답을 받지?** 브라우저는 HTTP로 콜백을 받는다. CLI는 HTTP 서버가 아니다. 그리고 두 번째 — 토큰은 어디에 저장되지? 다음에 `claude`를 띄울 때 기억해야 한다. 평문 파일이면 누가 훔칠 수 있고, 브라우저에 저장하면 의미가 없다.

이 챕터에서 — 이 두 문제를 푼 두 메커니즘을 본다.

---

## 본문

### 문제 1 — **CLI에서 브라우저 콜백을 받는 법**

답: **CLI가 잠깐 HTTP 서버가 된다**. RFC 8252 §7.3 — **Native Apps 용 OAuth**는 루프백 리다이렉션을 허용한다 (실제 출처: `oauthPort.ts:18` JSDoc **"loopback redirect URIs match any port as long as the path matches"**). `oauthPort.ts`:

:::tabs

```typescript
// Windows dynamic port range 49152-65535 is reserved
const REDIRECT_PORT_RANGE =
  getPlatform() === 'windows'
    ? { min: 39152, max: 49151 }
    : { min: 49152, max: 65535 }
const REDIRECT_PORT_FALLBACK = 3118

export async function findAvailablePort(): Promise<number> {
  // (축약: 함수 시작 부분에 getMcpOAuthCallbackPort() env var 분기 +
  //  for 루프 실패 시 fallback 3118 시도 분기 생략)
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const port = min + Math.floor(Math.random() * range)
    try {
      await new Promise<void>((resolve, reject) => {
        const testServer = createServer()
        testServer.once('error', reject)
        testServer.listen(port, () => testServer.close(() => resolve()))
      })
      return port
    } catch {
      continue
    }
  }
  // … fallback 3118
}
```

```python
# Python 등가 — 랜덤 임시 포트 잡기 (포트 fishing 방지)
import random
import socket
import sys

# Windows의 49152-65535는 OS 예약 — 충돌 회피
REDIRECT_PORT_RANGE = (
    (39152, 49151) if sys.platform == "win32"
    else (49152, 65535)
)
REDIRECT_PORT_FALLBACK = 3118

def find_available_port() -> int:
    """다른 프로세스의 fishing 서버가 인증 코드 가로채는 걸 막는다."""
    min_port, max_port = REDIRECT_PORT_RANGE
    for _ in range(100):
        port = random.randint(min_port, max_port)
        with socket.socket() as test_socket:
            try:
                test_socket.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    return REDIRECT_PORT_FALLBACK  # 모든 포트가 막혔을 때 마지막 수단
```

:::

세 가지 디테일이 우연이 아니다.

1. **랜덤 포트 선택**. 고정 포트가 아니라 매번 다른 포트. 이유: 다른 프로세스가 같은 포트에 **fishing 서버**를 띄워서 인증 코드를 가로채는 걸 막기 위해. 49152-65535는 OS가 정한 임시 포트 범위.
2. **Windows 회피 범위**(39152-49151). Windows의 49152-65535는 예약되어 있어서 충돌 우려.
3. **Fallback 3118**. 모든 포트가 막혔다면 — 정말 마지막 수단. 코멘트가 정직: "If random selection failed, try the fallback port".

> ⚙️ **콜백 포트는 3단계 오버라이드.** 챕터의 **"랜덤 포트"** 메시지가 맞지만, 정확히는 기본값. 실제 결정 순서는 (a) **`serverConfig.oauth?.callbackPort`** — 서버별 config 에 박힌 고정 포트 (`auth.ts:961`), (b) **`MCP_OAUTH_CALLBACK_PORT`** env var (`oauthPort.ts:27-30, 38-41`), (c) 둘 다 없으면 random. **고정 포트로 강제할 수 있는 escape hatch가 두 개나 있다** — Docker 컨테이너에서 포트 매핑이 필요한 경우, 기업 방화벽 정책, 디버깅 등을 위한 현실의 인정. 보안 권고가 하드 룰이 아니라 기본값이라는 정확화.

흐름은 이렇다. 콜백 포트 한 번 잡고 → `http://localhost:{port}/callback` 을 redirect URI로 인증 URL 만들고 → 로컬 HTTP 서버 띄우고 (`server.listen(port, '127.0.0.1', ...)` — **명시적으로 IPv4**: IPv6 `::` 바인딩 회피 + LAN 의 다른 호스트에서 접근 못 하게) → `openBrowser(authUrl)` → 사용자가 브라우저에서 동의 → 브라우저가 `localhost:{port}/callback?code=...` 로 리다이렉트 → 로컬 서버가 그 요청을 받아서 `code` 추출 → 코드 → 토큰 교환 → 서버 종료. **CLI가 2~3초간 웹 서버였다가 사라진다**.

> 💡 **localhost 가 안 닿는 환경 — 수동 callback URL 분기.** SSH 세션, 컨테이너, WSL 등에서 **사용자의 브라우저는 localhost 에 도달할 수 없는** 케이스가 있다. `auth.ts:1056-1097` 의 `options?.onWaitingForCallback` 콜백이 그 escape hatch — **사용자가 콜백 URL 을 수동으로 붙여넣게** 한다. **CLI=잠깐 HTTP 서버** 패턴이 작동 안 하는 환경에 대한 솔직한 fallback. 여기서도 같은 state 검증으로 CSRF 방어.

### 문제 2 — 토큰 저장

저장소 인터페이스가 한 줄이다 (`secureStorage/index.ts:9-17` verbatim):

:::tabs

```typescript
export function getSecureStorage(): SecureStorage {
  if (process.platform === 'darwin') {
    return createFallbackStorage(macOsKeychainStorage, plainTextStorage)
  }
  // TODO: add libsecret support for Linux
  return plainTextStorage
}
```

```python
# Python 등가 — 플랫폼별 토큰 저장소 분기
import platform
from pathlib import Path

def get_secure_storage():
    """OS에 따라 적절한 토큰 저장소를 반환한다."""
    if platform.system() == "Darwin":
        try:
            import keyring  # macOS Keychain 접근
            return KeyringStorage()
        except ImportError:
            pass
    # Linux/Windows 또는 keyring 없음 → 평문 파일 fallback
    return PlainTextStorage(Path.home() / ".claude" / "credentials.json")
```

:::

세 가지 구현이 같은 인터페이스(`SecureStorage`)를 만족한다.

| 구현 | 어디 저장 | 보안 |
|---|---|---|
| `macOsKeychainStorage` | macOS Keychain (system) | OS 수준 암호화 + 사용자 인증 |
| `plainTextStorage` | `~/.claude/.credentials.json` | `chmod 0o600` (사용자만 읽기) |
| `createFallbackStorage(primary, secondary)` | 1순위 시도, 실패 시 2순위 | 컴포지트 |

플레인텍스트 저장소가 사용될 때 — 경고를 동반한다:

:::tabs

```typescript
return {
  success: true,
  warning: 'Warning: Storing credentials in plaintext.',
}
```

이 경고는 사용자 UI 가 아니라 **telemetry 이벤트로 빠진다** — `cli/handlers/auth.ts:82-87` 에서 `logEvent('tengu_oauth_storage_warning', { warning })` 으로 발행. **Anthropic 쪽이** 어느 사용자가 plaintext 로 떨어졌는지 집계할 수는 있지만 사용자 본인은 모른다. 게다가 7.3 의 본 케이스인 **MCP `saveTokens` (`auth.ts:1730`) 는 `storage.update(updatedData)` 만 호출하고 반환값을 버린다** — warning 이 capture 조차 안 됨. 즉 **plaintext fallback 은 조용히 일어난다**. **정직한 fallback**과 조용한 약화 사이의 디자인 결정 — **현실에서는 후자에 가깝다**. 좋은 의도의 인터페이스(`{ success, warning? }`)이지만 호출자가 warning 을 살리지 않으면 무력화된다는 일반 교훈.

### 어댑터 — `ClaudeAuthProvider`

MCP SDK는 자기가 OAuth를 처리하기 위한 추상 인터페이스를 갖는다 — `OAuthClientProvider`. 이건 SDK가 호출자에게 묻는다: "**토큰을 어디서 읽지? 어디에 저장하지? state는 어떻게 만들지?**". `ClaudeAuthProvider` 가 그 질문들에 **Claude Code 식**으로 답한다 (`auth.ts:1376`).

```typescript
// (축약: 생성자, clientMetadata, clientInformation, codeVerifier,
//  redirectToAuthorization, invalidateCredentials, xaaRefresh 등 다수 메서드 생략.
//  실제 클래스는 1376-2360 라인에 걸쳐 있음 — 약 984 줄. 2362-2466 은 클래스 밖 독립 함수들)
export class ClaudeAuthProvider implements OAuthClientProvider {
  // …

  async state(): Promise<string> {
    if (!this._state) {
      this._state = randomBytes(32).toString('base64url')  // ← CSRF 방지
      // (축약: logMCPDebug 호출 생략)
    }
    return this._state
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    const storage = getSecureStorage()
    // (축약: 실제는 200+ 줄. XAA silent refresh 분기, refresh-in-progress
    //  중복 방지, expiresAt 임계값 체크, MCP SDK _commonHeaders 가 매 요청마다
    //  부르는 핫 패스라서 캐시 의존성 강함 — auth.ts:1540-1700 참고)
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    const storage = getSecureStorage()
    const existingData = storage.read() || {}
    const serverKey = getServerKey(this.serverName, this.serverConfig)
    // (축약: this._pendingStepUpScope = undefined, logMCPDebug 3 줄 생략)
    const updatedData: SecureStorageData = {
      ...existingData,
      mcpOAuth: {
        ...existingData.mcpOAuth,
        [serverKey]: {
          ...existingData.mcpOAuth?.[serverKey],  // ← 기존 필드 보존 (clientId 등)
          serverName: this.serverName,
          serverUrl: this.serverConfig.url,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
          scope: tokens.scope,
        },
      },
    }
    storage.update(updatedData)  // ← 반환값 버림 (warning capture 안 됨, 위 단락 참고)
  }
}
```

```python
# Python 등가 — MCP SDK ↔ secure storage 어댑터
import secrets
import time

class ClaudeAuthProvider:
    """SDK가 묻고("토큰 어디서?") 우리가 답한다 — 어댑터 패턴."""

    def __init__(self, server_name: str, server_config: dict) -> None:
        self.server_name = server_name
        self.server_config = server_config
        self._state: str | None = None

    def state(self) -> str:
        if self._state is None:
            self._state = secrets.token_urlsafe(32)  # CSRF 방지
        return self._state

    def tokens(self) -> dict | None:
        storage = get_secure_storage()
        # (실제는 XAA silent refresh 분기, 30초 TTL 캐시 — auth.ts:1540-1700)
        ...

    def save_tokens(self, tokens: dict) -> None:
        storage = get_secure_storage()
        existing = storage.read() or {}
        server_key = get_server_key(self.server_name, self.server_config)

        mcp_oauth = existing.setdefault("mcp_oauth", {})
        mcp_oauth[server_key] = {
            **mcp_oauth.get(server_key, {}),  # 기존 필드 보존 (client_id 등)
            "server_name": self.server_name,
            "server_url": self.server_config["url"],
            "access_token": tokens["access_token"],
            "refresh_token": tokens.get("refresh_token"),
            "expires_at": int(time.time() * 1000)
            + tokens.get("expires_in", 3600) * 1000,
            "scope": tokens.get("scope"),
        }
        storage.update(existing)  # 반환값 버림 — warning capture 안 됨
```

:::

이게 어댑터 패턴의 교과서적 사용이다. MCP SDK는 **OAuth 표준 흐름**을 알고, Claude Code는 플랫폼별 저장소를 알고. 둘이 직접 만날 일이 없다 — `ClaudeAuthProvider`가 통역한다.

### 프로덕션 단단함 조각들

이 파일이 2466줄이나 되는 건 **교과서 OAuth**가 아니라 **실제로 작동하는 OAuth**를 짜야 했기 때문. 코드를 읽다 만난 보석 몇 개:

**1. 민감 파라미터 redaction** (`auth.ts:100-106` verbatim):
```typescript
const SENSITIVE_OAUTH_PARAMS = [
  'state', 'nonce', 'code_challenge', 'code_verifier', 'code',
]
```
URL 을 로그에 찍기 전에 이 5개 를 `[REDACTED]` 로 교체. **로그에서 인증 코드가 새는 사고를 막는다**. 5개의 동기는 세 가지: (a) `state`/`nonce` → CSRF/session fixation 방어용 무작위 값, (b) `code_challenge`/`code_verifier` → PKCE 의 비밀 — 노출되면 공격자가 PKCE 를 통과 가능, (c) `code` → 인증 코드 자체 (한 번 쓸 수 있는 자격증명).

**2. Stale-while-error** (`macOsKeychainStorage.ts:50-56` verbatim):
```typescript
// Stale-while-error: if we had a value before and the refresh failed,
// keep serving the stale value rather than caching null. Since #23192
// clears the upstream memoize on every API request (macOS path), a
// single transient `security` spawn failure would otherwise poison the
// cache and surface as "Not logged in" across all subsystems …
```
키체인 명령어(`security` CLI)가 일시적으로 실패해도 — 이전 값을 계속 서빙. 깜빡 로그아웃되는 사고를 막는다.

**3. 4096B stdin 버퍼 사고** (`macOsKeychainStorage.ts:16-24` verbatim 코멘트):
```typescript
// `security -i` reads stdin with a 4096-byte fgets() buffer (BUFSIZ on darwin).
// A command line longer than this is truncated mid-argument …
const SECURITY_STDIN_LINE_LIMIT = 4096 - 64
```
darwin의 `security` CLI가 **4096바이트 stdin 버퍼**를 갖는다는 사실을 알아내기 위해 — 누군가는 디버깅에 며칠을 갈았을 것이다. 토큰 데이터가 4032바이트를 넘으면 조용히 잘려서 키체인이 깨지는 사고. 이슈 #30337 (`macOsKeychainStorage.ts:21` 코멘트에서 직접 참조).

**4. Slack의 비표준 에러 코드** (`auth.ts:147-151` verbatim, 코멘트는 축약):
```typescript
// Slack uses non-standard error codes (invalid_refresh_token observed live …)
// where RFC 6749 specifies invalid_grant. We normalize those …
const NONSTANDARD_INVALID_GRANT_ALIASES = new Set([
  'invalid_refresh_token', 'expired_refresh_token', 'token_expired',
])
```
표준이 있어도 모든 서버가 안 따른다. Claude Code가 **Slack의 3가지 사투리** 를 외워서 RFC 6749 의 표준 `invalid_grant` 으로 정규화한다 — 그래야 SDK 의 `OAUTH_ERRORS['invalid_grant'] → InvalidGrantError` 매핑이 발동하고 토큰 무효화가 정상 작동.

**5. 키체인 prefetch — 시작 시간 65ms → 0ms** (`keychainPrefetch.ts`):
이건 7.3 의 진짜 보석이다. macOS startup 에서 두 개의 키체인 항목 (`Claude Code-credentials` + `Claude Code` legacy API key) 를 sequential 로 읽으면 ~65ms (각 spawn 32-33ms). `keychainPrefetch.ts` 가 `main.tsx` 모듈 평가 맨 위에서 두 spawn 을 **parallel** 로 띄운다. `main.tsx` import 평가가 끝날 때쯤이면 — 둘 다 이미 캐시. **65ms → 거의 0ms**. **왜 여기에 저렇게 import 가 적은지**까지 67줄짜리 docstring 으로 적혀 있다 — execa 한 번 import 하면 cross-spawn 체인 ~58ms 가 추가로 사라지기 때문. 프로덕션 단단함의 정점 — 모든 줄이 측정에서 나왔다.

**6. `tokens()` 가 7.2% CPU 를 잡아먹은 사연** (`auth.ts:1541-1547` 코멘트):
**"spawnSync was 7.2% of total CPU after PR #19436"**. MCP SDK 의 `_commonHeaders` 가 매 요청마다 `tokens()` 를 부른다 — 30-40 회/초. 캐시 없이 매번 `security find-generic-password` 를 spawn 하면 — 전체 CPU 의 7.2% 가 그 한 줄에서 사라진다. 30초 TTL 캐시가 추가되면서 해결. 문서가 그 자리에서 사연을 기록한다. 두 번째 정점.

---

## Python으로 옮기면

핵심 두 메커니즘만 압축해서:

```python
from __future__ import annotations
import http.server
import secrets
import socketserver
import webbrowser
from pathlib import Path
from typing import Protocol


# ─── 추상 인터페이스 ────────────────
class SecureStorage(Protocol):
    name: str
    def read(self) -> dict | None: ...
    def update(self, data: dict) -> dict: ...
    def delete(self) -> bool: ...


class KeyringStorage:
    """OS 키체인 (macOS Keychain / Windows Credential Locker / GNOME Keyring)."""
    name = "keyring"
    
    def read(self) -> dict | None:
        import keyring  # lazy
        raw = keyring.get_password("claude-code", "credentials")
        return _json_loads(raw) if raw else None
    
    def update(self, data: dict) -> dict:
        import keyring
        keyring.set_password("claude-code", "credentials", _json_dumps(data))
        return {"success": True}


class PlainTextStorage:
    name = "plaintext"
    
    def __init__(self, path: Path) -> None:
        self.path = path
    
    def read(self) -> dict | None:
        if not self.path.exists():
            return None
        return _json_loads(self.path.read_text(encoding="utf-8"))
    
    def update(self, data: dict) -> dict:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(_json_dumps(data), encoding="utf-8")
        self.path.chmod(0o600)
        return {
            "success": True,
            "warning": "Warning: Storing credentials in plaintext.",
        }


def get_secure_storage() -> SecureStorage:
    """플랫폼에 맞는 저장소 + 자동 fallback."""
    import sys
    plain = PlainTextStorage(Path.home() / ".claude" / ".credentials.json")
    if sys.platform == "darwin":
        return _FallbackStorage(KeyringStorage(), plain)
    return plain


# ─── 콜백 포트 + 로컬 서버 ────────────────
def find_available_port() -> int:
    """랜덤 임시 포트 선택 (포트 fishing 방지)."""
    import random, socket
    for _ in range(100):
        port = random.randint(49152, 65535)
        with socket.socket() as s:
            try:
                s.bind(("localhost", port))
                return port
            except OSError:
                continue
    return 3118  # fallback


def receive_oauth_code(port: int, expected_state: str) -> str:
    """잠깐 HTTP 서버가 되어 code를 받는다."""
    captured_code: dict[str, str] = {}
    
    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            from urllib.parse import urlparse, parse_qs
            params = parse_qs(urlparse(self.path).query)
            
            if params.get("state", [""])[0] != expected_state:
                self.send_error(400, "state mismatch")  # CSRF 방지
                return
            
            captured_code["code"] = params.get("code", [""])[0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b"<h1>Authentication successful</h1><p>You can close this tab.</p>")
    
    with socketserver.TCPServer(("localhost", port), Handler) as httpd:
        httpd.handle_request()  # 한 번만 받고 닫는다
    
    return captured_code["code"]


# ─── 어댑터 ────────────────
class ClaudeAuthProvider:
    """MCP SDK ↔ secure storage 사이의 통역."""
    
    def __init__(self, server_name: str, server_url: str) -> None:
        self.server_name = server_name
        self.server_url = server_url
        self._state: str | None = None
        self._storage = get_secure_storage()
    
    def state(self) -> str:
        if self._state is None:
            self._state = secrets.token_urlsafe(32)  # CSRF
        return self._state
    
    def tokens(self) -> dict | None:
        data = self._storage.read() or {}
        return data.get("mcp_oauth", {}).get(self.server_name)
    
    def save_tokens(self, tokens: dict) -> None:
        import time
        data = self._storage.read() or {}
        mcp_oauth = data.setdefault("mcp_oauth", {})
        mcp_oauth[self.server_name] = {
            "server_name": self.server_name,
            "server_url": self.server_url,
            "access_token": tokens["access_token"],
            "refresh_token": tokens.get("refresh_token"),
            "expires_at": int(time.time() * 1000) + (tokens.get("expires_in", 3600) * 1000),
            "scope": tokens.get("scope"),
        }
        self._storage.update(data)
```

핵심 셋이 다 있다.

1. **Protocol 인터페이스 + 플랫폼별 구현** — 호출자는 플랫폼을 모른다.
2. **`socketserver.TCPServer.handle_request()`** — 딱 한 번만 받고 닫는 로컬 서버. CLI가 2초간 웹 서버다.
3. **`secrets.token_urlsafe(32)`** — Python의 `secrets` 모듈이 OAuth state 생성에 표준 사용. `random` 쓰면 **안 된다** (예측 가능).

> 💡 **`keyring` 라이브러리.** Python에는 `keyring` 패키지(PyPI)가 플랫폼별 시크릿 저장소를 한 인터페이스로 추상화해 둔 게 있다. 내부적으로 macOS Security framework, Windows Credential Locker, GNOME libsecret을 호출. Claude Code의 `secureStorage/` 디렉토리가 바로 이걸 직접 짠 것. 어떤 의미에서는 Claude Code가 자기만의 mini-`keyring`을 만든 셈.

---

## 핵심 정리

- **CLI가 OAuth를 받는 법**: **수 초간 자기가 HTTP 서버**가 된다. 기본은 랜덤 포트(49152-65535)를 잡고 `http://localhost:{port}/callback` 를 redirect URI로 사용. RFC 8252 §7.3 **Native App OAuth** 표준.
- 랜덤 포트는 기본값이고 보안 결정 — 다른 프로세스가 **fishing 서버**로 인증 코드를 가로채는 걸 막는다. 단 **고정 포트 escape hatch** 가 두 개 (`serverConfig.oauth?.callbackPort` + `MCP_OAUTH_CALLBACK_PORT` env var). `server.listen` 은 **명시적으로 `127.0.0.1`** — IPv6/LAN 노출 회피.
- **저장소는 추상 인터페이스 + 플랫폼별 구현**. macOS Keychain → `.credentials.json` (`chmod 0o600`) fallback. 플레인텍스트로 떨어지면 warning 객체를 발행하지만 — **MCP saveTokens 는 그 warning 을 버린다** + main login 은 telemetry 로만 보낸다. 즉 사용자에게는 조용히 떨어진다. 인터페이스의 좋은 의도가 호출자 쪽에서 무력화된 사례.
- **`ClaudeAuthProvider implements OAuthClientProvider`**: MCP SDK의 추상 인터페이스(**"토큰 어디서 읽지/저장하지?"**)에 Claude Code 저장소가 어댑터로 답한다. SDK와 저장소는 직접 만나지 않는다. 클래스 자체는 1376-2360 라인에 걸쳐 약 984 줄 (2362-2466 은 클래스 밖 독립 함수들).
- 프로덕션 단단함 **6 조각** — (1) **민감 파라미터 redaction** (state/nonce/code/code_challenge/code_verifier 5개), (2) **stale-while-error** 캐시 (transient 키체인 실패가 깜빡 로그아웃 안 되도록), (3) **4096B stdin 버퍼 회피** (#30337의 사연), (4) **Slack의 비표준 에러 정규화** (3개 alias → `invalid_grant`), (5) **`keychainPrefetch.ts` — startup 65ms → 0ms** (모듈 평가와 **parallel** 로 두 개의 `security` spawn), (6) **`tokens()` 캐시 — 7.2% CPU 회수** (MCP SDK `_commonHeaders` 의 30-40 회/초 호출). 2466 줄(클래스 984줄 + 독립 함수 106줄)이 그냥 있는 게 아니다.
- **CSRF 보호**: `randomBytes(32).toString('base64url')` 로 OAuth state 생성. Python에서는 `secrets.token_urlsafe(32)`. **`random` 쓰면 안 된다** — 예측 가능.

