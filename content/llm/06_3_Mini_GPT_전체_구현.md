# 6.3 Mini GPT 전체 구현 — 조각들을 하나의 모델로

## 이 챕터에서 배우는 것

- Part 5·6의 부품을 `MiniGPT` 클래스 하나로 조립하기
- forward 흐름 — ids에서 logit까지, 그리고 손실까지
- 임베딩과 출력층을 묶는 weight tying
- 이 작은 모델이 GPT와 *구조적으로 같다*는 것

---

## 지도를 클래스로

6.1의 지도를 이제 코드로 짓는다. 부품은 다 있다 — 임베딩(1.3), 위치 임베딩(5.3), Transformer 블록(5.6), causal mask(6.2), 최종 Layer Norm(5.5), 출력층(2.5). 이들을 하나의 `nn.Module`로 엮으면 끝이다.

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

from block import TransformerBlock     # 5.6
from mask import causal_mask           # 6.2


class MiniGPT(nn.Module):
    def __init__(self, vocab_size, n_embd, n_head, n_layer, block_size):
        super().__init__()
        self.block_size = block_size
        self.tok_emb = nn.Embedding(vocab_size, n_embd)        # 토큰 임베딩 (1.3)
        self.pos_emb = nn.Embedding(block_size, n_embd)        # 위치 임베딩 (5.3, 학습형)
        self.blocks = nn.ModuleList(
            [TransformerBlock(n_embd, n_head) for _ in range(n_layer)]
        )
        self.ln_f = nn.LayerNorm(n_embd)                       # 최종 정규화 (5.5)
        self.lm_head = nn.Linear(n_embd, vocab_size, bias=False)   # 출력 투영 (2.5)
        self.lm_head.weight = self.tok_emb.weight              # weight tying

    def forward(self, idx, targets=None):
        B, T = idx.shape
        pos = torch.arange(T, device=idx.device)
        # 1) 토큰 의미 + 위치를 한 벡터에 싣는다
        x = self.tok_emb(idx) + self.pos_emb(pos)              # (B, T, n_embd)
        # 2) causal mask 를 끼운 채 블록을 통과
        mask = causal_mask(T).to(idx.device)
        for block in self.blocks:
            x = block(x, mask)
        # 3) 정규화 후 어휘 크기 logit 으로 투영
        x = self.ln_f(x)
        logits = self.lm_head(x)                               # (B, T, vocab_size)
        if targets is None:
            return logits, None
        # 4) 다음 토큰 분류의 교차 엔트로피 (1권의 그 손실)
        loss = F.cross_entropy(
            logits.view(-1, logits.size(-1)), targets.view(-1)
        )
        return logits, loss
```

이 한 클래스가 Mini GPT 전부다. `__init__`이 6.1 지도의 층층을 그대로 선언하고, `forward`가 그 지도를 위에서 아래로 흐른다.

## forward를 따라간다

흐름을 한 줄씩 짚어 보자.

- **임베딩 + 위치**: `tok_emb(idx)`가 각 토큰 ID를 의미 벡터로 바꾸고, `pos_emb(pos)`가 위치 벡터를 더한다. 5.3에서 본 "내용과 위치를 한 벡터에 싣기"다. 여기서는 사인 인코딩 대신 *학습되는* 위치 임베딩을 썼다 — 단순함을 위해서다.
- **블록 통과**: `block_size`만큼의 시퀀스가 N개 블록을 차례로 지난다. 각 블록은 causal mask를 받아, 미래를 가린 self-attention과 FFN을 수행한다(5.6 + 6.2).
- **출력**: 최종 Layer Norm 뒤, `lm_head`가 각 위치의 벡터를 어휘 크기 logit으로 편다. `(B, T, vocab_size)` — 모든 위치에서 동시에 다음 토큰 점수가 나온다.
- **손실**: 타깃이 주어지면, 1권에서 본 그 교차 엔트로피로 예측과 정답을 맞춘다. `view`로 `(B, T)`를 펴서 한 번에 계산한다.

## 임베딩과 출력층을 묶는다

코드에 눈에 띄는 한 줄이 있다.

```python
self.lm_head.weight = self.tok_emb.weight    # weight tying
```

입력 임베딩 행렬과 출력 투영 행렬을 *같은 가중치*로 묶었다. 이를 **weight tying(가중치 묶기)**이라 한다. 직관은 이렇다 — "토큰을 벡터로 바꾸는 사전"과 "벡터를 토큰 점수로 바꾸는 사전"은 사실 같은 사전의 양방향이다. 둘을 묶으면 파라미터가 줄고, 대개 성능도 더 낫다.

> ⚙️ **GPT-3와 구조가 같다**: 이 `MiniGPT`는 `n_layer`, `n_embd` 같은 숫자만 작을 뿐, GPT-3와 *구조적으로 동일*하다. 6.1에서 말한 그대로다. 진짜 GPT 구현은 dropout 위치, 가중치 초기화, 효율화 같은 디테일이 더 붙지만, 뼈대는 이 한 클래스가 다 담고 있다. 50줄 남짓이 언어 모델의 본체라는 게, GPT의 단순함을 다시 증명한다.

> ⚠️ **"Mini"를 잊지 말 것**: 구조가 같다고 능력이 같은 건 아니다. 이 모델을 작은 텍스트로 학습하면 그럴듯한 글자 시퀀스를 흉내 내는 정도다. GPT-3의 능력은 이 구조에 *막대한 규모와 데이터*가 더해져 창발한 것이다. 우리가 만든 건 *메커니즘*이지 *능력*이 아니다 — 그리고 메커니즘을 끝까지 이해하는 게 이 책의 목표다.

모델이 섰다. 이제 이 모델로 텍스트를 *만들* 차례다. logit에서 다음 토큰을 뽑아 이어 붙이는 생성이 다음 장이다.

> ⚠️ **코드 미검증 — 검증 레포 실행 필요.** 이 장의 `MiniGPT`를 포함한 Part 5~7 코드는 본문 설명용이다. 모듈 import 경로, weight tying의 shape 정합, `view` 차원은 실제 실행으로 확정한다.

---

## 핵심 정리

- **Mini GPT는 한 클래스다.** 임베딩·위치·블록 더미·최종 LayerNorm·출력층을 `nn.Module`로 엮으면, 6.1의 지도가 그대로 코드가 된다.
- **forward는 지도를 위에서 아래로 흐른다.** ids → 토큰+위치 임베딩 → causal 블록 ×N → LayerNorm → 어휘 logit → (타깃 있으면) 교차 엔트로피.
- **weight tying이 입력·출력 사전을 묶는다.** 토큰↔벡터 변환의 양방향을 같은 가중치로 두어, 파라미터를 줄이고 성능을 높인다.
- **GPT-3와 구조가 같다.** 50줄 남짓이 언어 모델의 본체다. 숫자만 다를 뿐 뼈대는 동일하다.
- **구조 ≠ 능력.** 이 작은 모델은 메커니즘을 보여줄 뿐이다. GPT의 능력은 같은 구조에 규모가 더해져 창발한다.

---

*다음 챕터: 6.4 텍스트 생성 — 토큰 하나씩 샘플링*
