# 3.4 Attention 구현 — 스코어·소프트맥스·가중합을 NumPy로

## 이 챕터에서 배우는 것

- Q·K·V 연산을 NumPy 세 줄로 직접 구현하기
- 같은 연산이 cross-attention이든 self-attention이든 그대로 쓰인다는 것
- 이 NumPy 스케치에 *빠진 것*들 — √d_k, 마스크, 멀티헤드
- 여기가 NumPy 원리에서 PyTorch 구현으로 넘어가는 경계다

> 이 장은 Part 1~4의 마지막 코드다. 여기까지가 NumPy 스케치, 다음 Part 5부터가 PyTorch 구현이다.

---

## 추상을 세 줄로

3.3에서 Attention을 Query·Key·Value로 추상했다. 그 연산은 NumPy로 옮기면 정말로 세 줄이다.

```python
import numpy as np

def softmax(scores):
    scores = scores - scores.max(axis=-1, keepdims=True)
    e = np.exp(scores)
    return e / e.sum(axis=-1, keepdims=True)

def attention(Q, K, V):
    scores = Q @ K.T            # 1) 점수: 모든 query–key 쌍의 관련도 (Tq, Tk)
    weights = softmax(scores)   # 2) 가중치: 행마다 합이 1
    return weights @ V          # 3) 가중합: Value 들을 섞는다 (Tq, d_v)
```

3.3의 검색 엔진이 이 세 줄이다. `Q @ K.T`가 질의-색인 매칭, `softmax`가 관련도를 가중치로, `weights @ V`가 내용물의 가중 혼합. 3.2의 형광펜도, 3.3의 부드러운 lookup도 결국 이 세 연산이다.

## 같은 연산, 다른 입력

이 함수의 힘은 Q·K·V가 *어디서 오든* 똑같이 돈다는 데 있다.

```python
# cross-attention (3.2 의 Bahdanau): Q 는 디코더, K·V 는 인코더
ctx = attention(decoder_state, encoder_states, encoder_states)

# self-attention (4.3 에서 볼 것): Q·K·V 가 모두 같은 시퀀스
ctx = attention(seq, seq, seq)
```

함수는 한 글자도 바뀌지 않았다. 입력을 어디서 가져오느냐만 다르다. 3.3에서 "Q·K·V가 어디서 오든 상관없다"고 한 추상의 위력이, 이 두 호출의 동일함으로 증명된다. self-attention은 새로운 *연산*이 아니라, 같은 연산에 *같은 시퀀스를 세 번 넣는 것*이다.

## 이 스케치에 빠진 것들

이 NumPy 버전은 원리를 보여주지만, 실전 Transformer의 Attention은 아니다. 세 가지가 빠져 있다.

- **스케일링**: 점수를 √d_k로 나누는 보정이 없다. 차원이 커지면 점수가 폭주해 softmax가 망가진다(5.1에서 해결).
- **마스크**: 특정 자리를 가리는 장치가 없다. GPT가 미래를 못 보게 막으려면 필요하다(6.2에서 추가).
- **멀티헤드**: 한 점수표뿐이라 한 종류의 관계만 본다. 여러 시각이 필요하다(5.2에서 확장).

이 셋을 더하고 PyTorch로 다시 쓰는 게 Part 5의 일이다. 왜 NumPy로 더 안 가고 PyTorch로 갈아타나. 지금까지는 *연산의 모양*을 이해하는 게 목적이었고, NumPy가 그걸 가장 투명하게 보여줬다. 하지만 이제부터는 *학습되는 모델*을 만들어야 한다 — 자동 미분, GPU, 검증된 레이어가 필요하다. 원리를 손에 쥐었으니, 도구를 바꿀 때다.

> ⚙️ **NumPy → PyTorch, 경계는 여기다**: 이 책의 코드는 두 층이다. Part 1~4는 NumPy로 *원리를 스케치*했고, Part 5~7은 PyTorch로 *모델을 구현*한다. 둘을 섞지 않은 건, 원리를 볼 때는 군더더기 없는 NumPy가, 모델을 굴릴 때는 PyTorch가 맞기 때문이다. 같은 Attention을 두 번 — NumPy로 한 번(여기), PyTorch로 한 번(5.1) — 만나는 셈이다.

이걸로 Part 3이 닫힌다. 우리는 Attention을 손에 쥐었다. 그런데 이 Attention은 여전히 순차적 LSTM 위에 얹힌 보조 장치다. 만약 Attention이 이렇게 강력하다면, 질문이 떠오른다 — *LSTM을 굳이 남겨둘 이유가 있을까?* 그 도발적인 질문이 이 책의 심장, Part 4의 출발점이다.

---

## 핵심 정리

- **Attention은 NumPy 세 줄이다.** `Q @ K.T` → `softmax` → `@ V`. 점수·가중치·가중합이 그대로 코드가 된다.
- **같은 연산이 cross든 self든 그대로 돈다.** 함수는 안 바뀌고 입력 출처만 다르다. self-attention은 같은 시퀀스를 세 번 넣는 것이다.
- **이 스케치엔 셋이 빠졌다.** √d_k 스케일링(5.1), 마스크(6.2), 멀티헤드(5.2). Part 5에서 더해진다.
- **여기가 NumPy와 PyTorch의 경계다.** 원리는 NumPy로 스케치했고, 학습되는 모델은 PyTorch로 구현한다. 같은 Attention을 두 층에서 만난다.
- **Part 4의 질문이 섰다.** Attention이 이토록 강력하다면, 순차적 LSTM을 남겨둘 이유가 있을까. 그 질문이 심장으로 이끈다.

---

*다음 챕터: 4.1 LSTM의 세 가지 한계 — 순차 계산·장거리 의존·병렬화 불가*
