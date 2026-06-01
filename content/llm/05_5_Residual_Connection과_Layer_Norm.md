# 5.5 Residual Connection · Layer Norm — 깊은 네트워크를 안정화하는 두 장치

## 이 챕터에서 배우는 것

- 왜 깊이 쌓을수록 학습이 어려워지는가 — 신호가 흩어진다는 것
- Residual Connection이 신호에 지름길을 내주는 방식 — "변화량만 배운다"
- Layer Norm이 매 층의 음량을 표준 레벨로 맞추는 방식, 그리고 Batch Norm과의 차이
- Pre-LN vs Post-LN — 어디에 정규화를 두느냐가 깊은 모델의 안정성을 가른다

---

## 깊이의 대가

5.4까지 블록의 두 일꾼 — Attention과 FFN — 을 갖췄다. 원리상 이 둘을 번갈아 쌓으면 Transformer다. 그런데 6번, 12번, 24번 쌓는 순간 문제가 터진다.

입력 신호가 그 많은 변형을 차례로 통과하면서, 점점 흩어지거나 폭주한다. 깊은 네트워크가 학습이 잘 안 되는 그 고질병 — 1권에서 깊은 모델의 학습이 까다로웠던 그 맥락 — 이 여기서도 그대로 나타난다. Transformer는 이 깊이를 두 가지 단순한 장치로 떠받친다.

## Residual: 변화량만 배운다

첫 번째는 **잔차 연결(Residual Connection)** — 어떤 층의 출력에 그 층의 입력을 *그대로 더해주는* 연결이다. 식으로는 한 줄이다.

$$y = x + \text{Sublayer}(x)$$

`Sublayer`는 Attention이거나 FFN이다. 핵심은 입력 $x$가 층을 *우회해* 출력에 직접 더해진다는 것. 이게 두 가지를 동시에 준다.

첫째, 층의 부담이 줄어든다. 층은 이제 $x$를 *처음부터 다시 만들* 필요가 없다. $x$에 더할 *변화량*만 계산하면 된다. ML 엔지니어에게 익숙한 그림으로, 이건 **diff(패치)와 같다.** 원본 파일을 통째로 다시 쓰는 대신, 바뀐 줄만 담은 diff를 얹는다. 원본은 지름길로 보존되고, 층은 "무엇을 바꿀지"에만 집중한다.

둘째, 신호에 고속도로가 생긴다. 입력이 모든 층을 우회로로 가로지를 수 있으니, 깊이 쌓아도 신호가 끝까지 살아 흐른다.

> 💡 **이미지에서 빌려온 장치**: Residual은 원래 이미지 인식의 ResNet에서 깊은 CNN을 학습시키려 도입됐다. 152층짜리 네트워크가 학습되기 시작한 게 이 단순한 더하기 덕이었다. Transformer는 그 아이디어를 시퀀스로 가져왔다. 도메인은 달라도 "깊이의 병"은 같고, 처방도 같았다.

> ⚠️ **diff 비유의 한계**: diff는 "원본 + 변화량"이라는 그림을 잘 주지만, Residual의 더 깊은 효용은 *신호가 흐르는 경로*에 있다. 학습 신호가 우회로를 따라 깊은 층까지 곧장 닿는 덕에 깊이가 가능해진다 — diff 비유만으로는 이 흐름의 측면이 안 보인다.

## Layer Norm: 매 층의 음량을 맞춘다

두 번째는 **레이어 정규화(Layer Norm)** — 각 토큰 벡터를 그 *자신의 차원들*에 대해 평균 0, 분산 1로 맞춘 뒤, 학습되는 두 파라미터로 다시 크기·위치를 조정하는 장치다.

비유하자면 매 층 입구에 달린 *오토게인(자동 음량 조절)*이다. 앞 층에서 신호가 너무 커졌든 작아졌든, 일정한 표준 레벨로 맞춰 다음 층에 넘긴다. 덕분에 층마다 입력 분포가 들쭉날쭉하지 않아 학습이 안정된다.

여기서 1권에서 본 Batch Norm과의 차이를 분명히 하자. Batch Norm은 *배치 안의 여러 샘플*을 가로질러 통계를 낸다. Layer Norm은 *한 토큰 벡터 안*에서 통계를 낸다. 이 차이가 시퀀스에서 결정적이다 — 문장마다 길이가 다르고 배치 구성이 달라도, Layer Norm은 토큰 하나만 보면 되니 그런 변동에 흔들리지 않는다. 그래서 Transformer는 Batch Norm이 아니라 Layer Norm을 쓴다.

## 어디에 둘 것인가 — Pre-LN vs Post-LN

Residual과 Layer Norm을 *어떤 순서로* 배치하느냐에 두 유파가 있다.

- **Post-LN** (원 Transformer): 입력을 Sublayer에 통과시키고, Residual로 더한 뒤, *마지막에* 정규화한다. `LayerNorm(x + Sublayer(x))`.
- **Pre-LN** (대부분의 현대 GPT): *먼저* 정규화하고 Sublayer에 통과시킨 뒤 Residual로 더한다. `x + Sublayer(LayerNorm(x))`.

Pre-LN이 깊은 모델에서 더 안정적으로 학습된다고 알려져, GPT 계열 대부분이 이쪽을 쓴다. 이 책의 Mini GPT(Part 6)도 Pre-LN을 따른다.

```python
import torch.nn as nn


class ResidualNorm(nn.Module):
    """Pre-LN 방식: 정규화 → Sublayer → 잔차 더하기."""

    def __init__(self, d_model: int, dropout: float = 0.1):
        super().__init__()
        self.norm = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, sublayer):
        # sublayer 는 Attention 또는 FFN 을 감싼 함수
        # 먼저 정규화한 입력을 sublayer 에 주고, 결과를 원본 x 에 더한다
        return x + self.dropout(sublayer(self.norm(x)))
```

`forward`가 `sublayer`를 인자로 받는 데 주목하자. 이 래퍼 하나로 Attention이든 FFN이든 똑같이 감쌀 수 있다. 5.6에서 이 패턴이 블록을 조립하는 골격이 된다.

## 부품은 다 모였다

이제 Transformer 블록을 이루는 모든 조각이 우리 손에 있다.

- 토큰을 여러 시각으로 섞는 **Multi-Head Attention** (5.2)
- 위치별로 비선형 변형하는 **Feed-Forward** (5.4)
- 깊이를 떠받치는 **Residual · Layer Norm** (이 장)
- 입구에서 순서를 싣는 **Positional Encoding** (5.3)

흩어진 부품을 하나의 블록으로 조립하고, 그 블록을 쌓아 인코더와 디코더를 만들 차례다. 다음 장에서 조각을 합친다.

> ⚠️ **코드 미검증 — 검증 레포 실행 필요.** 이 장의 `ResidualNorm`을 포함한 Part 5~7 코드는 본문 설명용이다. Pre-LN 배치와 dropout 위치, LayerNorm 차원은 실제 실행으로 확정한다.

---

## 핵심 정리

- **깊이는 공짜가 아니다.** 여러 층을 통과하며 신호가 흩어지거나 폭주한다 — 깊은 네트워크 학습의 고질병이 Transformer에도 그대로 온다.
- **Residual은 변화량만 배우게 한다.** $y = x + \text{Sublayer}(x)$로 입력이 층을 우회한다. diff처럼 원본을 보존하고, 동시에 신호가 흐르는 고속도로를 낸다.
- **Layer Norm은 매 층의 음량을 표준 레벨로 맞춘다.** 한 토큰 벡터 안에서 정규화하므로, 배치·길이 변동에 흔들리지 않는다 — Batch Norm을 안 쓰는 이유.
- **Pre-LN이 깊은 모델에 유리하다.** 정규화를 Sublayer 앞에 두는 배치가 더 안정적이라, 현대 GPT 대부분과 이 책의 Mini GPT가 채택한다.
- **이제 블록을 조립한다.** Attention·FFN·Residual·Norm·Positional Encoding이 다 모였다. 5.6에서 한 블록으로 합친다.

---

*다음 챕터: 5.6 Transformer 블록 완성 — 조각을 한 블록으로 합치다*
