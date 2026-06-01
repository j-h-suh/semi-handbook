# 5.6 Transformer 블록 완성 — 조각을 한 블록으로 합치다

## 이 챕터에서 배우는 것

- 흩어진 부품을 하나의 Transformer 블록으로 조립하는 법
- 블록이 입력과 같은 모양을 내보내는 것이 왜 "쌓을 수 있음"의 조건인가
- 잔차 스트림(residual stream) — 블록을 관통하는 하나의 흐름이라는 관점
- 블록을 N번 쌓으면 무엇이 깊어지는가

---

## 두 일꾼, 두 번의 잔차

5.5까지 부품이 다 모였다. 이제 한 블록으로 합친다. Transformer 블록은 의외로 단순하다. *두 개의 서브층*을 차례로 통과시키되, 각각을 5.5의 Residual·Layer Norm으로 감싼다.

1. 첫 번째 서브층: Multi-Head Attention (5.2) — 토큰들이 서로 대화한다.
2. 두 번째 서브층: Feed-Forward (5.4) — 각 토큰이 혼자 생각한다.

각 서브층은 Pre-LN 방식(5.5)으로 감싼다. 정규화 → 서브층 → 잔차 더하기. 식으로 적으면 블록 전체가 네 줄이다.

$$a = x + \text{MHA}(\text{LN}(x))$$
$$y = a + \text{FFN}(\text{LN}(a))$$

"대화(Attention) → 사고(FFN)"라는 5.4의 분업이, 그대로 한 블록의 뼈대가 된다.

```python
import torch.nn as nn

from multihead import MultiHeadAttention   # 5.2
from feedforward import FeedForward        # 5.4


class TransformerBlock(nn.Module):
    """Attention 서브층 + FFN 서브층. 각각 Pre-LN + 잔차."""

    def __init__(self, d_model: int, num_heads: int, dropout: float = 0.1):
        super().__init__()
        self.norm1 = nn.LayerNorm(d_model)
        self.attn = MultiHeadAttention(d_model, num_heads)
        self.norm2 = nn.LayerNorm(d_model)
        self.ffn = FeedForward(d_model, dropout=dropout)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        # 1) Attention 서브층 (Pre-LN + 잔차)
        x = x + self.dropout(self.attn(self.norm1(x), mask))
        # 2) FFN 서브층 (Pre-LN + 잔차)
        x = x + self.dropout(self.ffn(self.norm2(x)))
        return x
```

`forward`가 단 두 줄인 데 주목하자. 5.1부터 5.5까지 쌓은 모든 논의가 이 두 줄로 응축된다. 그리고 `mask` 인자가 Attention에 그대로 흘러 들어가는 것도 봐 두자 — 지금은 `None`이지만, 6.2에서 이 자리에 causal mask가 들어온다.

## 모양을 보존한다, 그래서 쌓인다

블록의 입력과 출력을 보자. 입력이 `(B, T, d_model)`이면 출력도 `(B, T, d_model)`이다. 잔차 연결이 `x + ...` 형태라 차원이 보존되고, 두 서브층 모두 들어온 모양 그대로 내보낸다.

이 *모양 보존*이 핵심이다. 한 블록의 출력이 다음 블록의 입력으로 그대로 들어갈 수 있다는 뜻이니까. 레고 블록의 위아래 돌기가 맞물리듯, 같은 인터페이스라서 몇 개든 이어 붙는다.

```python
class TransformerStack(nn.Module):
    """같은 모양의 블록 N개를 그냥 쌓는다."""

    def __init__(self, d_model: int, num_heads: int, num_layers: int):
        super().__init__()
        self.layers = nn.ModuleList(
            [TransformerBlock(d_model, num_heads) for _ in range(num_layers)]
        )

    def forward(self, x, mask=None):
        for layer in self.layers:   # 한 블록의 출력이 다음 블록의 입력
            x = layer(x, mask)
        return x
```

블록을 리스트에 담아 차례로 통과시키는 게 전부다. `num_layers`만 바꾸면 6층이든 24층이든 된다. GPT-3가 96층을 쌓은 것도 원리상 이 `for` 루프의 반복 횟수일 뿐이다.

## 잔차 스트림 — 관통하는 하나의 흐름

블록이 `x = x + ...`를 반복한다는 사실에서, 강력한 관점 하나가 나온다. 입력 $x$가 모든 블록을 *관통하는 하나의 흐름*이라는 그림이다. 이걸 **잔차 스트림(residual stream)** — 입력에서 출력까지 이어지는, 각 블록이 읽고 더해 쓰는 공통의 통로 — 이라 부른다.

비유하자면 블록들이 *돌려 보는 하나의 초안*이다. 각 블록은 현재 초안(스트림)을 읽고, 5.5의 diff처럼 "이만큼 바꾸자"는 변화량을 계산해, 초안에 덧쓴다. 다음 블록은 갱신된 초안을 받아 또 자기 의견을 더한다. 최종 초안이 모델의 출력이다.

> 💡 **읽기와 쓰기의 분리**: 잔차 스트림 관점에서 Attention과 FFN은 스트림에서 정보를 *읽어* 무언가를 계산하고, 그 결과를 스트림에 *더해 쓴다*. 스트림 자체는 지워지지 않고 계속 흐른다. 이 관점은 학습된 모델을 해석할 때 특히 쓸모 있다 — "몇 번 블록이 스트림에 무엇을 써넣었나"를 추적할 수 있기 때문이다.

> ⚠️ **초안 비유의 한계**: "돌려 보는 초안"은 블록 사이의 *순차적* 갱신을 잘 그리지만, 한 블록 *안에서는* 모든 토큰 위치가 동시에 처리된다는 걸 가린다. 순차성은 블록과 블록 사이에만 있고, 토큰 방향으로는 여전히 완전 병렬이다 — 4.2에서 사수한 그 병렬성이다.

## N번 쌓으면 무엇이 깊어지나

블록을 여러 층 쌓으면, 각 층이 표현을 조금씩 더 정제한다. 정밀한 규칙은 없지만 느슨한 경향은 있다 — 앞쪽 층은 가까운 토큰 관계나 표면적 패턴을, 뒤쪽 층은 더 추상적이고 긴 범위의 의미를 다루는 쪽으로 분화하곤 한다. 한 번에 다 푸는 게 아니라, 층을 거치며 점진적으로 의미를 쌓아 올린다.

블록 하나가 완성됐고, 쌓는 법도 안다. 그런데 우리가 방금 만든 건 정확히 어떤 블록일까 — 인코더 블록인가, 디코더 블록인가? 둘은 무엇이 다르고, 왜 GPT는 그중 디코더만 쓸까. 다음 장에서 그 갈림길을 본다.

> ⚠️ **코드 미검증 — 검증 레포 실행 필요.** 이 장의 `TransformerBlock`·`TransformerStack`을 포함한 Part 5~7 코드는 본문 설명용이다. 서브층 순서, dropout·LayerNorm 배치, mask 전달은 실제 실행으로 확정한다.

---

## 핵심 정리

- **블록은 두 서브층이다.** Attention(대화) → FFN(사고). 각각을 Pre-LN과 잔차로 감싸면, `forward`가 단 두 줄로 응축된다.
- **블록은 입력과 같은 모양을 낸다.** `(B, T, d_model)`이 보존되므로, 한 블록의 출력이 다음 블록의 입력이 된다 — 이것이 깊이 쌓을 수 있는 조건이다.
- **잔차 스트림은 관통하는 하나의 흐름이다.** 블록들이 돌려 보는 초안처럼, 각 블록이 스트림을 읽고 변화량을 더해 쓴다. 학습된 모델 해석의 강력한 관점이다.
- **순차성은 블록 사이에만 있다.** 한 블록 안에서는 모든 토큰이 동시에 처리된다 — 4.2의 병렬성은 깊이를 쌓아도 유지된다.
- **이제 갈림길이다.** 같은 블록도 마스크와 연결 방식에 따라 인코더가 되고 디코더가 된다. 5.7에서 GPT가 디코더만 쓰는 이유를 본다.

---

*다음 챕터: 5.7 Encoder vs Decoder — 왜 GPT는 Decoder만 쓰나*
