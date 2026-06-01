# LLM 핸드북 — 목차 (초안)

**대상 독자**: 사이토 고키 『밑바닥부터 시작하는 딥러닝 1권』을 읽은 ML 엔지니어
**목표**: "RNN으로 충분했는데 왜 Transformer인가"를 정면으로 답하며, Mini LLM을 끝까지 만들기
**분량**: 약 200페이지 (37챕터 · 개념형 4–5p / 코드형 6–7p)
**언어**: 한국어 (기술 용어 영어 병기)
**코드 전략**: NumPy(원리 챕터) → PyTorch(구현 챕터). 사이토 1권 지식(역전파·SGD)은 전제, 재설명 없음.
**관통 예제**: 캐릭터 레벨 텍스트 생성 Mini LLM (nanoGPT 스타일)

> 컨셉: **"RNN으로 충분했다. 그런데 왜 Transformer인가."**
> 사이토 2권이 LSTM+Attention에서 멈추고, 카파시가 그 사이를 건너뛰어 Transformer를 시작하는 그 공백을 정면으로 채운다.

---

## Part 0: 들어가며
- 0.1 세 자료의 지도 — 사이토 1·2권, 카파시가 각각 어디에 서는지, 이 책이 채우는 빈틈
- 0.2 이 책이 답할 질문 — "LSTM으로 충분했는데 왜 Transformer인가"
- 0.3 환경 설정 — Python, PyTorch, 캐릭터 레벨 데이터셋 준비

## Part 1: 텍스트를 수로
사이토 1권에 없던 NLP 첫 관문. MLP·CNN과 다른 텍스트의 성격.
- 1.1 토큰이란 무엇인가 — 문자·단어·BPE, 왜 분리 방식이 다른가
- 1.2 어휘와 인덱스 — 텍스트를 정수로 변환하기
- 1.3 임베딩 — 정수를 벡터로, 무엇이 학습되는가
- 1.4 Word2Vec의 직관 — 의미가 방향이 된다 (NumPy)

## Part 2: 순서를 기억하는 기계
"이게 당연한 해답이었다" — RNN과 LSTM의 구조와 한계의 씨앗.
- 2.1 순서 정보의 문제 — MLP가 텍스트를 못 다루는 이유
- 2.2 RNN의 구조 — hidden state가 기억이다
- 2.3 LSTM의 등장 — 게이트로 기억을 관리하다
- 2.4 LSTM 구현 (NumPy)
- 2.5 언어 모델로서의 LSTM — 다음 토큰 예측과 생성

## Part 3: Attention의 등장
seq2seq의 병목을 발견하고, Attention이라는 해법을 만나다.
- 3.1 seq2seq의 병목 — 하나의 벡터로 압축하는 것의 한계
- 3.2 Bahdanau Attention — "어느 입력에 집중할 것인가"
- 3.3 Query · Key · Value — 검색 엔진의 비유
- 3.4 Attention 구현 (NumPy)

## ★Part 4: 전환점 (무게중심 1)
이 책의 심장. LSTM+Attention이 충분했는데 왜 버렸나.
- 4.1 LSTM의 세 가지 한계 — 순차 계산·장거리 의존·병렬화 불가  *(기준 챕터, 작성 완료)*
- 4.2 병렬화가 왜 결정적인가 — 스케일의 문제
- 4.3 Self-Attention의 직관 — Attention을 입력 전체에 적용하면
- 4.4 "Attention Is All You Need" — 2017년의 도박

## ★Part 5: Transformer 블록 쌓기 (무게중심 2)
조각을 하나씩 만들어 하나의 블록으로. PyTorch로 구현.
- 5.1 Scaled Dot-Product Attention — 왜 스케일링하나
- 5.2 Multi-Head Attention — 여러 시각으로 보다
- 5.3 Positional Encoding — 순서 정보를 주입하다
- 5.4 Feed-Forward Layer — 비선형성의 자리
- 5.5 Residual Connection · Layer Norm — 깊은 네트워크를 안정화하다
- 5.6 Transformer 블록 완성 — 조각을 합치다
- 5.7 Encoder vs Decoder — 왜 GPT는 Decoder만 쓰나

## Part 6: Mini LLM 만들기
nanoGPT add-up. Part 4·5에서 쌓은 논리 위에서 GPT를 구현한다.
- 6.1 GPT 아키텍처 개요 — Decoder-only의 선택
- 6.2 Causal Self-Attention — 미래를 가리다 (마스킹)
- 6.3 Mini GPT 전체 구현 (PyTorch)
- 6.4 텍스트 생성 — 토큰 하나씩 샘플링
- 6.5 처음부터 끝까지 — 데이터 로드부터 생성까지

## Part 7: 학습과 실험
만든 모델을 학습시키고 뜯어본다.
- 7.1 손실 함수와 Perplexity — 언어 모델의 평가
- 7.2 학습 루프 — Optimizer · 스케줄러 · 그래디언트 클리핑
- 7.3 하이퍼파라미터 실험 — 크기·깊이·헤드 수 바꿔보기
- 7.4 스케일의 법칙 — 더 크면 더 나은가

## 에필로그
- RLHF와 ChatGPT — nanoGPT에서 대화 모델로, 다음 여정

---

## 작성 가이드 (이 핸드북 특유)

상위 스타일은 `/CLAUDE.md`, 세부 표기는 `docs/handbook-conventions.md`. 아래는 이 책만의 추가 가드레일.

- **직교 (사이토 1권)**: 역전파·SGD·드롭아웃 등 사이토 1권 내용 재설명 **금지**. "1권에서 본 그 최적화다"로 한 줄 연결만.
- **직교 (사이토 2권)**: Part 2·3은 2권과 겹치므로 *빠르게 설정*하는 속도로. 자족적이되 분량을 아낌.
- **전환 논리 유지**: 개념 설명으로 끝내지 않고, "그래서 이게 4.3의 문제를 이렇게 해결한다" 식으로 서사를 이어붙인다.
- **코드 계층**: 원리 챕터(Part 1~4) = NumPy/개념 스케치. 구현 챕터(Part 5~7) = PyTorch. 섞지 않는다.
- **도메인**: 제품명 0건. 반도체 도메인 강제 없음 — 캐릭터레벨 텍스트 생성이 관통 예제.
- **품질 합격선**: 매 챕터는 `chapter-rubric.md`(A 객관 가드 + B 질적 기준) 통과. 기준 챕터 = `04_1_LSTM의_세_가지_한계.md`.

## 예상 분량

| 묶음 | Part | 챕터 | 페이지(예상) |
|---|---|---|---|
| 도입·NLP 기초 | 0~1 | 7 | ~30p |
| RNN·Attention 설정 | 2~3 | 9 | ~45p |
| **심장 (전환+Transformer)** | **4~5** | **11** | **~70p** |
| Mini LLM·실험 | 6~7+에필 | 10 | ~55p |
| **합계** | | **37** | **~200p** |
