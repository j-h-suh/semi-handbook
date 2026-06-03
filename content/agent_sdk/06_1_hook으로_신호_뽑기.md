# 6.1 hook으로 신호 뽑기 — 로그·트레이스·감사

## 이 챕터에서 배우는 것

- 에이전트 루프를 *열어보지 않고도* 무슨 일이 벌어지는지 보는 법 — hook
- hook으로 뽑는 세 가지 운영 신호 — 로그, 트레이스, 감사
- 5.5의 `audit`을 PostToolUse hook에 얹어 어긋남을 *즉시* 잡는 법
- hook은 *관측*하고 도구는 *행동*한다는 역할 분리
- hook에 비즈니스 로직을 넣지 말아야 하는 이유

---

## 잘 굴러가는지 어떻게 보나

여기까지 우리는 능력을 주고(Part 2) 상태를 되돌릴 수 있게(Part 4·5) 만들었다. 이제 이 에이전트가 운영에 들어간다. 그러면 새 질문이 생긴다 — **지금 안에서 무슨 일이 벌어지고 있나?** 어떤 도구가 언제 불렸고, 머지가 어느 노드에서 일어났고, 두 축은 여전히 맞물려 있나.

답을 에이전트 루프 *안*에서 찾으려 들면 안 된다. 그건 엔진의 영역이다. 대신 우리는 루프 *바깥*에서 신호를 뽑는다. 그 도구가 **hook**이다.

## hook은 라인 사이의 계측기

반도체 팹에는 **인라인 계측(inline metrology)** — 공정과 공정 *사이*에서 wafer를 측정하는 단계 — 이 있다. 식각이 끝나면 다음 공정으로 가기 전에 두께를 잰다. 계측은 wafer를 *바꾸지 않는다*. 그저 지나가는 것을 읽어 기록할 뿐이다.

hook이 정확히 그 계측기다. 에이전트 루프는 멈추지 않고 도는 생산 라인이고, hook은 그 라인의 정해진 지점 — 도구가 실행되기 *직전*(PreToolUse)과 *직후*(PostToolUse) — 에 끼인 계측기다. 라인을 뜯어고치지 않고, 그 지점을 지나는 것을 읽어 신호로 내보낸다.

> 🔬 **Deep Dive — hook은 안에서 언제·어떻게 불리나?**
>
> SDK가 도구 호출 전후로 어느 시점에 hook을 발화하고 그 반환을 어떻게 처리하는지 — 그 *내부 발화 메커니즘*은 엔진의 일이다. 자매서 『클로드 핸드북』의 hook 부분에 있다. 이 책은 hook을 *어디에 걸어 무슨 신호를 뽑을지*만 정한다. hook을 만들지 않고, 쓴다.

> 💡 **비유의 한계 — 계측기는 라인을 멈출 수도 있다**: 인라인 계측은 보통 측정만 한다. hook은 한 발 더 나아가 도구를 막을 수도 있다. 다만 그 *막는* 쓰임(권한)은 2.1의 `can_use_tool`이 맡았고, 6장의 hook은 *보는* 쓰임에 집중한다. 같은 지점이라도 우리는 계측기로 쓴다.

## 세 가지 신호 — 로그·트레이스·감사

hook에서 뽑는 신호는 셋이다.

- **로그(log)** — 무엇이 일어났나. "node B에서 lot_id로 merge 호출."
- **트레이스(trace)** — 언제·어디서·얼마나. 어느 노드에서, 몇 ms 걸려.
- **감사(audit)** — 정합이 맞나. 5.5의 그 `audit`.

PreToolUse hook에 로그와 트레이스를 건다.

```python
async def on_pre_tool(input_data: dict, tool_use_id: str, context) -> dict:
    logger.info(f"tool={input_data['tool_name']} args={input_data['tool_input']} "
                f"node={store.get_current()}")
    tracer.start(tool_use_id, tool=input_data["tool_name"])
    return {}   # 관측만 한다 — 흐름을 바꾸지 않으면 빈 dict
```

뽑은 신호는 어디에 모으나. 작게는 구조화 로그(JSON 라인)로 충분하고, 크게는 표준 관측 백엔드로 보낸다. *어디로 보내든* 핵심은 같다 — 에이전트 코드는 그대로 두고, 신호만 옆으로 흘려보낸다.

## 감사를 상시로 — 5.5를 잇다

5.5에서 우리는 `audit`을 만들며 "6장에서 hook과 엮어 상시 관측으로 끌어올린다"고 했다. 이제 잇는다. 데이터를 바꾸는 도구가 돌고 난 *직후*(PostToolUse)에 `audit`을 돌리면, 두 축의 어긋남을 월말 결산이 아니라 *그 자리에서* 잡는다.

```python
async def on_post_tool(input_data: dict, tool_use_id: str, context) -> dict:
    tracer.end(tool_use_id)
    if input_data["tool_name"].endswith("merge_tables"):   # 상태를 바꾼 직후
        problems = audit(store)                              # 5.5의 감사
        if problems:
            logger.error(f"정합 경보: {problems}")
    return {}

options = ClaudeAgentOptions(
    hooks={
        "PreToolUse": [HookMatcher(hooks=[on_pre_tool])],
        "PostToolUse": [HookMatcher(hooks=[on_post_tool])],
    },
)
```

이제 머지가 일어날 때마다 "node 하나에 session 하나가 맞물려 있나"가 자동으로 확인된다. wafer 수율 갈래가 수십 개로 불어나도, 어긋남이 생기는 *순간* 경보가 뜬다. 5.5가 "감사관을 세워 둔다"고 한 그 감사관이, hook 위에서 24시간 근무를 시작한다.

## hook으로 하지 말 것

계측기를 라인으로 착각하면 사고가 난다.

- **비즈니스 로직을 넣지 마라.** 머지를 *하는* 건 도구(2.2)다. hook은 머지를 *보는* 것뿐이다. hook에서 데이터를 바꾸면, 그 변경은 이벤트 통로를 우회해 되돌림이 깨진다.
- **hook이 에이전트를 죽이게 두지 마라.** 로그 백엔드가 잠깐 죽었다고 분석이 멈추면 안 된다. 관측은 본 흐름보다 *약하게* 붙어야 한다 — hook 안의 예외는 삼키고 따로 기록한다.
- **hook은 관측, 도구는 행동.** 이 한 줄을 지키면 나머지는 따라온다.

다음 챕터는 또 하나의 운영 신호 — 이 에이전트가 *얼마를 쓰고 있나* — 를 같은 자리에서 뽑는다.

> ✅ **검증됨 (검증 레포)**: `HookMatcher(hooks=[cb])`와 `hooks={"PreToolUse": […], "PostToolUse": […]}` 배선, 콜백 시그니처 `(input_data, tool_use_id, context)`, `{}` 반환 규약을 실측했다(`probes/hook_probe.py`, Bedrock opus-4-8). 도구 호출 턴에서 **Pre가 도구 직전·Post가 직후**에 발동하고, `input_data`에 `tool_name`·`tool_input`이 담기며, `{}`를 돌려줘도 도구가 정상 실행돼 merge 이벤트가 적혔다(관측만, 흐름 무방해). 단 `input_data`·`context`는 실측상 **dict**로 전달된다(위 `input_data["tool_name"]` 접근은 그대로 유효).

---

## 핵심 정리

- **hook은 루프를 안 열고 신호를 뽑는 계측기다.** 팹의 인라인 계측처럼, 도구 실행 전후 정해진 지점에서 지나가는 것을 읽어 내보낸다 — 라인을 바꾸지 않고.
- **세 신호를 뽑는다 — 로그·트레이스·감사.** 무엇이·언제·어디서 일어났는지, 그리고 두 축이 맞물려 있는지.
- **5.5의 `audit`을 PostToolUse에 얹어 상시화한다.** 머지 직후마다 정합을 확인해, 어긋남을 결산이 아니라 그 순간 잡는다.
- **hook은 관측, 도구는 행동.** hook에 비즈니스 로직을 넣지 말고, hook의 실패가 본 흐름을 죽이게 두지 마라.

---

*다음 챕터: 6.2 비용과 토큰 — 크레딧 추적*
