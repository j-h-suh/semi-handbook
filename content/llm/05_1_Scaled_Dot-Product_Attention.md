# 5.1 Scaled Dot-Product Attention — 왜 √d_k로 나누나

## 이 챕터에서 배우는 것

- 4.3의 Self-Attention 직관을 실제로 굴러가는 PyTorch 함수로 옮기기
- 점수(score)가 query·key의 내적이라는 것, 그리고 그 점수가 차원이 커지면 왜 폭주하는가
- √d_k로 나누는 한 줄이 *무엇을* 막아주는가 — 분산을 1로 되돌린다는 의미
- 마스크(mask) 자리를 미리 뚫어두는 이유 — 6.2의 causal attention을 향한 포석

---

## 직관을 코드로 내린다

Part 4까지는 *왜*를 쌓았다. 여기서부터는 *어떻게*를 짓는다. 코드도 NumPy 스케치에서 실제 PyTorch 구현으로 바뀐다.

4.3에서 본 Self-Attention의 계산을 다시 한 문장으로 줄이면 이렇다. 각 토큰이 query를 내고, 모든 토큰의 key와 맞대어 점수를 매기고, softmax로 가중치를 만들어 value를 가중합한다. 이 책 전체에서 가장 많이 등장할 식이 그래서 이것이다.

$$\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$$

여기서 $Q$는 query 행렬, $K$는 key 행렬, $V$는 value 행렬, $d_k$는 query와 key의 차원이다. 분자 $QK^\top$는 모든 query–key 쌍의 내적, 즉 4.3에서 말한 T×T 점수표다. 나머지는 그 점수표를 확률로 바꿔 value를 섞는 과정이다.

이 식에서 유일하게 "왜?"가 붙는 자리가 분모의 $\sqrt{d_k}$다. 나머지는 4.3의 직관 그대로다. 이 장은 사실상 그 분모 하나를 해명하는 데 바친다.

## 점수는 내적이다

query와 key는 같은 차원 $d_k$의 벡터다. 둘의 **내적(dot product)** — 대응하는 원소를 곱해 모두 더한 값 — 이 그 둘의 "맞음 정도"를 잰다. 방향이 비슷한 두 벡터는 내적이 크고, 직각이면 0에 가깝다.

토큰이 T개면 query도 T개, key도 T개다. 모든 query를 모든 key와 맞대면 T×T개의 점수가 나오고, 이건 행렬 곱 한 번으로 떨어진다.

```python
# q: (T, d_k)  k: (T, d_k)  →  scores: (T, T)
scores = q @ k.transpose(-2, -1)   # i행 j열 = i번 query · j번 key
```

`scores[i][j]`는 "i번 토큰이 j번 토큰에 얼마나 끌리는가"다. 4.3의 회의실에서, i가 j를 향해 던지는 시선의 세기라고 봐도 좋다.

## 차원이 커지면 점수가 폭주한다

문제는 이 점수의 *크기*가 차원 $d_k$에 따라 달라진다는 데 있다.

내적은 $d_k$개 곱의 합이다. 항이 많아질수록 합의 들쭉날쭉함, 즉 **분산(variance)** — 값이 평균에서 퍼진 정도 — 이 커진다. query와 key의 각 원소가 평균 0, 분산 1로 독립이라 가정하면, 내적의 분산은 정확히 $d_k$가 된다. $d_k$가 64면 점수의 표준편차가 8쯤, 512면 23쯤으로 커진다.

ML 엔지니어라면 이 상황이 낯익다. 1권에서 가중치를 √(fan-in)으로 나눠 초기화하던 그 정신과 같다 — 차원이 커질수록 부풀어 오르는 분산을, 표준편차로 나눠 도로 1 근처로 눌러앉히는 것.

왜 점수가 큰 게 문제일까. 다음 단계가 softmax이기 때문이다.

> 💡 **softmax는 큰 값에 가혹하다**: softmax는 입력 중 가장 큰 값에 확률을 몰아준다. 입력들의 격차가 크면 — 점수가 폭주하면 — 거의 1과 0으로 갈리는 *뾰족한* 분포가 된다. 한 토큰에만 100% 집중하고 나머지는 0%. 이렇게 saturation에 빠지면 학습 신호(gradient)가 거의 흐르지 않아, 모델이 "집중을 조절하는 법"을 배우지 못한다.

즉 점수가 폭주하면 Attention이 학습 초반부터 한 곳에 못 박혀 굳어버린다. 차원을 키울수록 이 현상이 심해진다. 표현력을 위해 $d_k$를 키우고 싶은데, 키우면 학습이 망가지는 역설이다.

## √d_k 한 줄이 하는 일

해법은 점수표를 softmax에 넣기 전에 $\sqrt{d_k}$로 나누는 것이다. 분산이 $d_k$였으니, 표준편차 $\sqrt{d_k}$로 나누면 분산이 다시 1로 돌아온다. 점수가 적당한 범위에 머물러 softmax가 *뾰족하지도 밋밋하지도 않은*, 학습 가능한 분포를 낸다.

이게 식 $\dfrac{QK^\top}{\sqrt{d_k}}$의 분모가 거기 있는 이유다. 거창한 이론이 아니라, 분산을 1로 되돌리는 정규화 한 번이다.

> ⚠️ **비유의 한계 — temperature와 헷갈리지 말 것**: "점수를 나눠 분포를 누른다"는 게 6.4에서 볼 생성 temperature와 닮아 보인다. 하지만 다르다. √d_k는 차원에서 *자동으로* 정해지는 분산 정규화 상수이지, 우리가 조절하는 손잡이가 아니다. temperature는 생성 단계에서 사람이 돌리는 다이얼이고, √d_k는 구조가 강제하는 보정이다. 같은 "나누기"지만 목적과 출처가 다르다.

## 마스크 자리를 미리 뚫어둔다

한 가지를 더 끼워 둔다. 점수표의 일부 자리를 *가리는* 기능이다. 지금은 쓰지 않지만, 6.2에서 "미래 토큰을 못 보게 막는" causal mask로 반드시 필요해진다. 가린 자리의 점수를 $-\infty$로 두면, softmax를 통과한 뒤 그 자리의 가중치가 정확히 0이 된다.

이제 전체를 하나의 함수로 묶는다.

```python
import math
import torch
import torch.nn.functional as F


def scaled_dot_product_attention(q, k, v, mask=None):
    """Scaled Dot-Product Attention 한 번.

    Args:
        q: query, shape (..., T, d_k)
        k: key,   shape (..., T, d_k)
        v: value, shape (..., T, d_v)
        mask: 가릴 자리는 0, 살릴 자리는 1. shape (..., T, T) 또는 broadcast 가능.

    Returns:
        out:     가중합 결과, shape (..., T, d_v)
        weights: Attention 가중치, shape (..., T, T)
    """
    d_k = q.size(-1)
    # 1) 모든 query–key 쌍의 점수, 그리고 √d_k 로 분산 정규화
    scores = q @ k.transpose(-2, -1) / math.sqrt(d_k)   # (..., T, T)
    # 2) 가릴 자리는 -inf → softmax 후 0
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float("-inf"))
    # 3) 행 방향 softmax → 각 토큰이 나눠 줄 가중치
    weights = F.softmax(scores, dim=-1)                  # (..., T, T)
    # 4) 가중치로 value 를 가중합
    out = weights @ v                                    # (..., T, d_v)
    return out, weights
```

함수 하나에 4.3의 직관이 전부 들어 있다. `q @ k.transpose`가 점수표, `/ math.sqrt(d_k)`가 이 장의 주인공, `F.softmax`가 가중치, `weights @ v`가 가중합이다. 앞의 `...`은 batch나 head 차원이 앞에 더 붙어도 그대로 돌아가게 열어둔 자리다 — 5.2에서 head 차원이 여기 들어온다.

<details>
<summary>🔬 Deep Dive — 내적의 분산이 왜 정확히 d_k인가</summary>

query 벡터 $q$와 key 벡터 $k$의 각 원소가 서로 독립이고 평균 0, 분산 1이라 하자. 내적은 $q \cdot k = \sum_{i=1}^{d_k} q_i k_i$다.

각 항 $q_i k_i$는 독립인 두 변수의 곱이라 평균이 $0 \times 0 = 0$, 분산이 $\mathrm{Var}(q_i)\mathrm{Var}(k_i) = 1$이다. 독립인 $d_k$개 항을 더하면 분산은 더해지므로, 합의 분산은 $d_k \times 1 = d_k$다.

따라서 표준편차는 $\sqrt{d_k}$. 이 값으로 나누면 분산이 1로 돌아온다. √d_k라는 정확히 그 수가 분모에 오는 이유다 — 임의의 상수가 아니라 분산 계산에서 떨어지는 값이다.
</details>

이 함수는 Attention의 *심장*이지만, 아직 한쪽 눈으로만 보는 셈이다. 한 번의 Attention은 한 종류의 관계 — 이를테면 문법적 호응 — 만 포착한다. 실제 Transformer는 여러 개의 Attention을 동시에 굴려 각자 다른 시각을 맡긴다. 그 multi-head 구조가 다음 장이다.

> ✅ **코드 검증됨 — `playground/handbook/llm` 프로브 통과.** 이 장의 `scaled_dot_product_attention`은 검증 레포에서 실행 확인했다(probe_1_forward). 텐서 shape·broadcast·마스크 동작 정상.

---

## 핵심 정리

- **Attention의 점수는 query·key 내적이다.** 모든 쌍의 내적이 T×T 점수표가 되고, 이건 행렬 곱 한 번으로 떨어진다 — 4.3의 직관을 그대로 코드로 내린 것.
- **차원이 커지면 점수의 분산이 d_k만큼 커진다.** 점수가 폭주하면 softmax가 한 곳에 못 박힌 뾰족한 분포가 되어, 학습 신호가 끊긴다.
- **√d_k로 나누는 건 분산을 1로 되돌리는 정규화다.** 1권의 √(fan-in) 초기화와 같은 정신이며, 임의의 상수가 아니라 분산 계산에서 나오는 값이다.
- **temperature와 혼동하지 말 것.** √d_k는 구조가 강제하는 보정이고, temperature(6.4)는 사람이 돌리는 생성 다이얼이다.
- **마스크 자리는 미리 뚫어둔다.** 지금은 안 쓰지만, 6.2의 causal mask가 이 자리를 쓴다 — 가린 점수를 −∞로 두면 softmax 후 가중치가 0이 된다.

---

*다음 챕터: 5.2 Multi-Head Attention — 여러 시각으로 보다*
