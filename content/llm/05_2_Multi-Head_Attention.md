# 5.2 Multi-Head Attention — 여러 시각으로 동시에 보다

## 이 챕터에서 배우는 것

- 한 번의 Attention이 왜 "한 가지 관계"밖에 못 보는가
- head를 여러 개 두어 서로 다른 관계를 동시에 잡는다는 발상
- 차원을 쪼개 head에 나눠 주는 이유 — 비용을 늘리지 않고 시각만 늘린다
- query·key·value가 *어디서 오는가* — 5.1이 미뤘던 학습 가능한 투영(projection)

---

## 한 눈으로는 부족하다

5.1에서 만든 `scaled_dot_product_attention`은 점수표를 하나 만든다. 그 점수표는 토큰 사이의 *한 종류*의 관계를 담는다. 그런데 언어의 관계는 한 종류가 아니다.

"그 고양이가 어제 잡은 쥐를 오늘 다시 놓쳤다"라는 문장을 보자. "놓쳤다"는 주어 "고양이"와 문법적으로 호응하고, 목적어 "쥐"와 의미적으로 엮이며, "어제"·"오늘"과 시간적으로 묶인다. 한 장의 점수표에 이 세 관계를 다 욱여넣으면, 서로 평균 내며 뭉개진다.

해법은 단순하다. 점수표를 *여러 장* 두는 것. 각 장이 서로 다른 관계에 특화되게 한다. 이것이 **멀티헤드 어텐션(Multi-Head Attention)** — 여러 개의 Attention을 병렬로 굴려, 각 head가 서로 다른 시각으로 같은 시퀀스를 보게 하는 구조다.

> 💡 **head 하나 = 시각 하나**: 학습이 끝난 Transformer를 열어 보면, 어떤 head는 바로 앞 단어에, 어떤 head는 문장의 동사에, 어떤 head는 짝이 되는 괄호에 집중하도록 *스스로* 분화돼 있다. 우리가 "너는 문법을 봐"라고 지정하지 않아도, 여러 head를 주면 각자 다른 역할로 갈라진다.

## query·key·value는 어디서 오나

5.1에서 미뤄둔 질문을 여기서 푼다. Q·K·V는 대체 어디서 오는가.

입력은 토큰당 하나의 벡터다(1.3의 임베딩, 그리고 5.3에서 더할 위치 정보). 이 입력 벡터 하나에 *서로 다른 세 개의 학습 가능한 행렬*을 곱해 query·key·value를 만든다.

$$Q = XW^Q, \quad K = XW^K, \quad V = XW^V$$

여기서 $X$는 입력(토큰 × 차원), $W^Q, W^K, W^V$는 학습되는 투영 행렬이다. 같은 입력에서 출발하지만, 세 행렬이 각각 "질문용 표현", "색인용 표현", "내용용 표현"으로 변형한다. 4.3에서 "문장이 자기 자신을 색인이자 질의로 쓴다"고 한 그 분화가, 바로 이 세 행렬에서 일어난다.

멀티헤드에서는 head마다 이 $W^Q, W^K, W^V$를 따로 둔다. head가 8개면 투영 행렬 묶음도 8벌이다. 그래서 head마다 입력을 다르게 변형하고, 다른 점수표를 만든다.

## 차원을 쪼개 나눠 준다

head를 8개로 늘리면 계산이 8배가 될까. 그러면 곤란하다. Transformer의 생명인 효율이 무너진다.

영리한 절충이 있다. 전체 차원 $d_{model}$을 head 수 $h$로 *쪼개서* 나눠 준다. $d_{model}=512$이고 head가 8개면, 각 head는 $512/8 = 64$차원만 맡는다. head가 많아져도 head 하나가 작아지니, 전체 계산량은 거의 그대로다. 시각의 *수*는 늘리되 비용은 묶어 두는 거래다.

```python
import torch
import torch.nn as nn

from attention import scaled_dot_product_attention   # 5.1 의 함수


class MultiHeadAttention(nn.Module):
    """여러 head 로 동시에 Attention 을 수행한다."""

    def __init__(self, d_model: int, num_heads: int):
        super().__init__()
        assert d_model % num_heads == 0, "d_model 은 head 수로 나누어떨어져야 한다"
        self.num_heads = num_heads
        self.d_head = d_model // num_heads          # head 하나가 맡는 차원
        # Q·K·V 투영을 head 전체에 대해 한 번에. 출력 투영까지 네 개.
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

    def _split_heads(self, x):
        # (B, T, d_model) → (B, num_heads, T, d_head)
        B, T, _ = x.shape
        x = x.view(B, T, self.num_heads, self.d_head)
        return x.transpose(1, 2)

    def forward(self, x, mask=None):
        # 1) 입력을 Q·K·V 로 투영
        q, k, v = self.W_q(x), self.W_k(x), self.W_v(x)
        # 2) head 차원으로 쪼갠다 — head 들이 batch 처럼 병렬 처리된다
        q, k, v = self._split_heads(q), self._split_heads(k), self._split_heads(v)
        # 3) 각 head 가 독립적으로 5.1 의 Attention 을 수행
        out, _ = scaled_dot_product_attention(q, k, v, mask)   # (B, H, T, d_head)
        # 4) head 들을 다시 합친다 (B, T, d_model)
        B, _, T, _ = out.shape
        out = out.transpose(1, 2).contiguous().view(B, T, self.num_heads * self.d_head)
        # 5) 합쳐진 결과를 한 번 더 투영해 섞는다
        return self.W_o(out)
```

5.1에서 `scaled_dot_product_attention`의 앞에 열어둔 `...` 자리를 기억하는가. 거기에 batch `B`와 head `H`가 들어왔다. head를 batch처럼 취급해 *모든 head가 한 번에* 계산된다 — 시각을 늘렸는데도 순차 처리가 늘지 않는다. Transformer의 병렬성이 여기서도 지켜진다.

마지막 `W_o`가 하나 더 있는 데 주목하자. head들이 따로 본 결과를 그냥 이어 붙이기만 하면 서로 대화하지 못한다. `W_o`가 이어 붙인 결과를 한 번 더 섞어, head들이 본 것을 통합한다.

> ⚙️ **head 수는 하이퍼파라미터다**: head를 몇 개 둘지는 정답이 없다. 원 논문은 $d_{model}=512$에 head 8개($d_{head}=64$)를 썼다. head가 너무 많으면 head 하나가 너무 작아져 표현이 빈약해지고, 너무 적으면 시각이 부족하다. 이 균형은 7.3에서 직접 바꿔 보며 감을 잡는다.

## 한 블록을 향해

이제 우리는 시퀀스를 여러 시각으로 동시에 보는 한 덩어리를 가졌다. 입력을 받아, 여러 head로 Attention을 걸고, 통합해 같은 모양으로 내보낸다.

하지만 이 덩어리에는 아직 치명적인 구멍이 있다. 4.4에서 예고한 그 구멍 — **순서 정보가 없다.** `MultiHeadAttention`에 "나는 학생이다"를 넣든 "학생이다 나는"을 넣든, 토큰 집합이 같으면 출력도 사실상 같다. 점수표 어디에도 "누가 몇 번째인가"가 없기 때문이다.

다음 장에서 이 구멍을 메운다. 위치마다 고유한 신호를 만들어 입력에 더하는 법 — Positional Encoding이다.

> ⚠️ **코드 미검증 — 검증 레포 실행 필요.** 이 장의 `MultiHeadAttention`을 포함한 Part 5~7 코드는 본문 설명용이다. `view`/`transpose`/`contiguous`의 shape 흐름과 head 분할·복원은 실제 실행으로 확정한다.

---

## 핵심 정리

- **한 head는 한 종류의 관계만 본다.** 문법·의미·시간 같은 여러 관계를 한 점수표에 욱여넣으면 뭉개진다. head를 여러 장 두어 각자 다른 시각을 맡긴다.
- **Q·K·V는 입력에 세 학습 행렬을 곱해 만든다.** 같은 입력을 질문용·색인용·내용용으로 변형하는 $W^Q, W^K, W^V$가, 4.3에서 말한 "자기 자신을 색인이자 질의로" 쓰는 분화의 정체다.
- **차원을 head 수로 쪼개 나눠 비용을 묶는다.** head가 많아져도 head 하나가 작아지니, 시각의 수만 늘고 계산량은 거의 그대로다.
- **모든 head가 batch처럼 병렬 계산된다.** 5.1의 함수 앞에 열어둔 차원에 head가 들어와, 시각을 늘려도 순차성이 늘지 않는다.
- **아직 순서 정보가 없다.** 토큰 집합이 같으면 출력이 같다는 구멍이 남아 있고, 5.3의 Positional Encoding이 이를 메운다.

---

*다음 챕터: 5.3 Positional Encoding — 순서 정보를 어떻게 주입하나*
