# 반도체 포토리소그래피 핸드북 — 목차 (초안)

**대상 독자**: CS/AI 배경 엔지니어 (반도체 도메인 신규 진입) **목표**: SMILE 플랫폼 개발에 필요한 반도체 도메인 지식 습득 **분량**: 약 200페이지 (챕터당 4-5페이지 × 약 45챕터) **언어**: 한국어 (기술 용어 영어 병기)

---

## Part 1: 반도체 제조 기초

반도체가 뭔지, 어떻게 만드는지 전체 그림을 잡는다.

1.1 반도체란 무엇인가 — 트랜지스터에서 칩까지 1.2 웨이퍼 제조 공정 개요 — 모래에서 실리콘 웨이퍼까지 1.3 팹(Fab) 공정 흐름 — 전공정 8대 공정 요약 1.4 산화(Oxidation)와 증착(Deposition) 1.5 식각(Etching)과 세정(Cleaning) 1.6 이온 주입(Ion Implantation)과 확산(Diffusion) 1.7 CMP와 금속 배선(Metallization) 1.8 후공정 개요 — 패키징, 테스트, 출하 1.9 공정 노드와 무어의 법칙 — 7nm, 5nm, 3nm의 의미 1.10 반도체 산업 구조 — 파운드리, 팹리스, IDM

## Part 2: 포토리소그래피 심화

우리가 집중하는 영역. 가장 중요한 Part.

2.1 포토리소그래피란 — 빛으로 회로를 새기는 원리 2.2 노광 시스템(Exposure System) — 스테퍼와 스캐너 2.3 광원의 진화 — g-line → i-line → KrF → ArF → EUV 2.4 마스크(Reticle)와 펠리클(Pellicle) 2.5 포토레지스트(PR) — 도포, 노광, 현상 2.6 해상도와 DOF — Rayleigh 방정식 2.7 OPC와 RET — 광근접 효과 보정 2.8 Overlay란 — 층간 정렬의 중요성 2.9 Overlay 측정 방법 — DBO, IBO 2.10 Overlay 에러 모델 — Translation, Rotation, Magnification 2.11 CD(Critical Dimension) — 선폭 제어의 핵심 2.12 CD 측정 — CD-SEM, Scatterometry(OCD) 2.13 멀티 패터닝 — SADP, SAQP, LELE 2.14 EUV 리소그래피 — 원리, 장비, 과제

## Part 3: 수율 공학과 결함 분석

왜 수율이 중요하고, 어떻게 관리하는지.

3.1 수율(Yield)이란 — 정의, 계산, 비즈니스 임팩트 3.2 수율 모델 — Poisson, Murphy, Negative Binomial 3.3 결함(Defect)의 분류 — 랜덤 vs 체계적(Systematic) 3.4 결함 검사 장비 — KLA, AMAT Inspection 3.5 웨이퍼 맵(Wafer Map) 패턴 분석 3.6 SPC(통계적 공정 제어) — 관리도, Cp/Cpk 3.7 FDC(Fault Detection & Classification) 3.8 계측(Metrology) 개요 — Inline vs Offline 3.9 샘플링 전략 — 전수 검사 vs 샘플링의 트레이드오프

## Part 4: AI와 반도체 제조

CS/AI 엔지니어가 가장 친숙하게 느낄 Part.

4.1 왜 반도체 제조에 AI가 필요한가 4.2 Virtual Metrology(VM) — 실측 없이 예측하는 기술 4.3 VM 모델링 — 입력 변수, 피처 엔지니어링, 모델 선택 4.4 APC(Advanced Process Control) — Run-to-Run 제어 4.5 이상 탐지(Anomaly Detection) — 공정 이탈 조기 발견 4.6 웨이퍼 맵 패턴 분류 — CNN, GAN 활용 4.7 Overlay 예측과 보정 — AI 기반 접근 4.8 Sampling Optimization — 어디를 측정할 것인가 4.9 GenAI와 LLM의 반도체 적용 — 최신 트렌드 4.10 데이터 챌린지 — 클래스 불균형, 드리프트, 보안

## Part 5: 실무 레퍼런스

현장에서 바로 쓸 수 있는 참고 자료.

5.1 주요 장비 벤더 — ASML, TEL, KLA, AMAT 5.2 핵심 약어 사전 — 100개 필수 용어 5.3 논문 읽기 가이드 — SPIE, IEEE, SEMI 학회 소개 5.4 추천 학습 자료 — 교과서, 온라인 코스, 블로그

---

## 작성 가이드

- 1 Heartbeat = 1 챕터 (4-5페이지)
- 각 챕터 시작에 "이 챕터에서 배우는 것" 요약
- 수식은 최소화, 직관적 설명 우선
- 가능하면 실제 사례나 숫자 포함
- AI 엔지니어가 "왜 이게 내 일과 관련 있는지" 알 수 있게 연결

## 예상 소요

- 총 47챕터 × 5분 = 약 4시간 (연속 실행 시)
- 현실적으로 에러/재시도 포함하면 6-8시간
- 밤 10시에 시작하면 아침 6시쯤 완료 예상