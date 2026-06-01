# LLM 핸드북 — 집필 브리프 (새 세션 진입점)

> 새 세션에서 이 핸드북 집필을 이어갈 때 **가장 먼저 읽는 단일 진입점**.

## 0. 먼저 읽을 파일 (필수)

| 파일 | 용도 |
|---|---|
| [`handbook-toc.md`](./handbook-toc.md) | 목차 (37챕터) · 분량 · 작성 가이드 |
| [`chapter-rubric.md`](./chapter-rubric.md) | 매 챕터 합격선 (A 객관 7 / B 질적 7) + `/goal` 템플릿 |
| [`04_1_LSTM의_세_가지_한계.md`](./04_1_LSTM의_세_가지_한계.md) | **기준 챕터 (개념형)** — 톤·깊이 견본 |
| [`/CLAUDE.md`](/CLAUDE.md) | 전 핸드북 공통 스타일 |
| [`docs/handbook-conventions.md`](/docs/handbook-conventions.md) | 표기 규칙 |

## 1. 한 줄 미션

사이토 고키 1권을 읽은 ML 엔지니어에게, "LSTM으로 충분했는데 왜 Transformer인가"를 정면으로 답하며 **Mini LLM을 끝까지 만드는** 책.

## 2. 절대 가드레일

- **직교 (사이토 1권)**: 역전파·SGD 등 재설명 **금지**. "1권에서 본 그 최적화다"로만.
- **직교 (사이토 2권)**: RNN·LSTM·seq2seq는 Part 2·3에서 설정, 이후 전제 처리.
- **코드 계층**: Part 0~4 = NumPy/개념 스케치. Part 5~7 = PyTorch. **섞지 않는다.**
- **전환 논리**: 개념 설명으로 끝내지 않고 "그래서 다음 장에서 이 문제를 X로 해결한다"로 서사 유지.
- **도메인**: 제품명 0건. 캐릭터레벨 텍스트 생성이 관통 예제.
- **톤**: 평서체 `~다`. 중심 비유 1개 + 한계. 기준 챕터(04_1)의 결.

## 3. 전체 양산 커맨드 (새 세션에서 이거 하나)

```
/goal projects/semi-handbook의 "LLM 핸드북"을 toc대로 완성한다.
[준비] 첫 턴에 content/llm/writing-brief.md 와 §0 링크 파일(handbook-toc.md,
  chapter-rubric.md, 기준 챕터 04_1, /CLAUDE.md, docs/handbook-conventions.md)을 읽어
  컨텍스트를 잡는다.
[작성] writing-brief.md §5 권장순서대로 미집필 챕터를 하나씩 쓴다. 각 챕터는
  handbook-toc.md 방향을 출발점, chapter-rubric.md를 합격선, 기준 챕터(04_1)를
  톤 견본으로 삼는다.
[매 턴 출력] (1) rubric A1~A7 체크표(사이토 1권 재설명·코드 계층 위반은 grep으로,
  분량은 줄 수로) (2) 적대적 비평가가 본 B1~B7 잔여 약점(심각도).
[완료] writing-brief.md §4의 모든 미집필 챕터가 각각: 파일 존재 · A1~A7 통과
  · B 잔여약점 심각도 '중' 이상 0개.
[코드 게이트] 코드 든 챕터(Part 5~7)는 "⚠️ 코드 미검증 — 검증 레포 실행 필요" 표시.
```

> Part 단위로 좁히려면 `[완료]`를 `Part 2(2.1~2.5)만`처럼 변경. `/goal`로 진행 확인, `/goal clear`로 중단.

## 4. 챕터별 방향 (한 메시지)

| 챕터 | 한 메시지 / 담길 핵심 | 코드 |
|---|---|---|
| 0.1 세 자료의 지도 | 사이토·카파시가 어디서 멈추나, 이 책이 채우는 빈틈 | |
| 0.2 이 책이 답할 질문 | "LSTM으로 충분했는데 왜 Transformer인가" | |
| 0.3 환경 설정 | PyTorch 설치, 캐릭터레벨 데이터셋 로드 | 코드 |
| 1.1 토큰이란 무엇인가 | 문자·단어·BPE — 분리 방식이 왜 다른가 | |
| 1.2 어휘와 인덱스 | stoi·itos, 텍스트를 정수로 | 코드(NumPy) |
| 1.3 임베딩 | 정수를 벡터로, 무엇이 학습되는가 | 코드(NumPy) |
| 1.4 Word2Vec의 직관 | 의미가 방향이 된다 — skip-gram | 코드(NumPy) |
| 2.1 순서 정보의 문제 | MLP는 순서를 모른다 | |
| 2.2 RNN의 구조 | hidden state가 기억이다 | 코드(NumPy) |
| 2.3 LSTM의 등장 | 게이트가 기억을 선택적으로 관리한다 | |
| 2.4 LSTM 구현 | 셀 하나를 NumPy로 | 코드(NumPy) |
| 2.5 언어 모델로서의 LSTM | 다음 토큰 예측·생성 | 코드(NumPy) |
| 3.1 seq2seq의 병목 | 하나의 벡터 압축이 왜 한계인가 | |
| 3.2 Bahdanau Attention | "어느 입력에 집중할 것인가" | |
| 3.3 Query·Key·Value | 검색 엔진의 비유 | |
| 3.4 Attention 구현 | 스코어·소프트맥스·가중합 NumPy | 코드(NumPy) |
| **4.1 LSTM의 세 가지 한계** | **순차·장거리·병렬화 — 하나의 뿌리** | ✅ 완성 (기준) |
| 4.2 병렬화가 왜 결정적인가 | 스케일이 성능을 결정하는 시대 | |
| 4.3 Self-Attention의 직관 | Attention을 입력 전체에 — 거리가 항상 1 | |
| 4.4 "Attention Is All You Need" | 2017년의 도박 — 무엇을 버렸나 | |
| 5.1 Scaled Dot-Product Attention | 왜 √d_k로 나누나 | 코드(PyTorch) |
| 5.2 Multi-Head Attention | 여러 시각으로 동시에 보다 | 코드(PyTorch) |
| 5.3 Positional Encoding | 순서 정보를 어떻게 주입하나 | 코드(PyTorch) |
| 5.4 Feed-Forward Layer | 비선형성의 자리, 왜 필요한가 | 코드(PyTorch) |
| 5.5 Residual·Layer Norm | 깊은 네트워크를 안정화하는 두 장치 | 코드(PyTorch) |
| 5.6 Transformer 블록 완성 | 조각을 한 블록으로 합치다 | 코드(PyTorch) |
| 5.7 Encoder vs Decoder | GPT가 Decoder만 쓰는 이유 | |
| 6.1 GPT 아키텍처 개요 | Decoder-only의 선택과 이유 | |
| 6.2 Causal Self-Attention | 미래 토큰을 가리는 마스킹 | 코드(PyTorch) |
| 6.3 Mini GPT 전체 구현 | 조각들을 하나의 모델로 | 코드(PyTorch) |
| 6.4 텍스트 생성 | 토큰 하나씩 샘플링 — temperature | 코드(PyTorch) |
| 6.5 처음부터 끝까지 | 데이터 로드→학습→생성 전체 흐름 | 코드(PyTorch) |
| 7.1 손실과 Perplexity | 언어 모델을 어떻게 평가하나 | |
| 7.2 학습 루프 | Optimizer·스케줄러·그래디언트 클리핑 | 코드(PyTorch) |
| 7.3 하이퍼파라미터 실험 | 크기·깊이·헤드 수가 성능에 미치는 영향 | 코드(PyTorch) |
| 7.4 스케일의 법칙 | Chinchilla — 더 크면 더 나은가의 답 | |
| 에필로그 | RLHF와 ChatGPT — nanoGPT에서 대화 모델로 | |

## 5. 권장 작성 순서

1. **전환부 먼저** — Part 4 나머지(4.2·4.3·4.4). 이 책의 심장을 닫아야 흐름이 보인다.
2. **Transformer 쌓기** — Part 5 (5.1~5.7). 조각별로 PyTorch 코드형.
3. **NLP 기초 설정** — Part 1·2·3. 빠르게 설정하는 속도로.
4. **Mini LLM** — Part 6. Part 5 코드를 조립.
5. **학습·실험** — Part 7.
6. **도입·에필로그 마지막** — Part 0과 에필로그는 전체를 조망한 뒤 써야 잘 나온다.

## 6. 하지 말 것

- 사이토 1권 내용(역전파·SGD) 재설명
- NumPy 챕터에서 PyTorch, PyTorch 챕터에서 NumPy 혼용
- 개념 설명으로 끝내기(→ 전환 논리로 다음 장에 이어붙이기)
- 검증 안 된 코드를 "확정 코드"처럼 제시
