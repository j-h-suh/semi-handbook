# mini-claude

Claude Code 핸드북 Part 9~10의 동반 코드. ~500~570줄의 미니 클로드로 진짜 Claude Code 의 99% 사용 시나리오를 구현한다.

## 셋업

```bash
$ uv sync                                # 처음만
$ export ANTHROPIC_API_KEY=sk-ant-...    # 한 번만
```

## 실행

```bash
$ uv run mini-claude
```

## 챕터 매핑

| 챕터 | 채우는 조각 |
|---|---|
| 9.1 | 설계 + 스캐폴드 (스텁만) |
| 9.2 | `agent.py`, `messages.py` (핵심 루프) |
| 9.3 | `tools/{base,read,write,bash,edit}.py` (4개 도구) |
| 9.4 | `permissions.py` (fail-closed 권한) |
| 9.5 | `streaming.py`, `tools/agent.py` (스트리밍 + 서브 에이전트) |
| 10.1 | 사용자 정의 슬래시 명령 |
| 10.2 | 스킬 시스템 |
| 10.4 | MCP 서버 (클라이언트/서버 양쪽) |
