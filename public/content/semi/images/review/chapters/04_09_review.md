### tool_using_agent_architecture.svg — [수정 필요]

**SVG 코드 검증:**
- **화살표 연결 (심각):**
  - Agent → SQL Tool: Line `x2=220`, Target `x=220`. Arrow `refX=5`. Tip extends to `215` (Left direction). **Penetrates box by 5px.**
  - Agent → Wafer Map: Line `x2=220`. Target `x=220`. **Penetrates box by 5px.**
  - Agent → FDC Tool: Line `x2=580`. Target `x=580`. Tip extends to `585`. **Penetrates box by 5px.**
  - Agent → RAG Tool: Line `x2=580`. Target `x=580`. **Penetrates box by 5px.**
  - Output Arrow: Line `y2=408`. Target `y=415`. Tip extends 5px to `413`. **Gap of 2px.** (Does not touch).
- **텍스트 정렬:** 일관됨 (Top y=147, Bottom y=247, Center y=327).
- **색상:** 스펙 일치.

**판정 사유:** 4개의 주요 화살표가 대상 박스 내부로 5px 관통하고 있으며, Output 화살표는 2px 떠 있음. SVG marker 로직 오류.

---

### onpremise_vs_cloud_llm.svg — [수정 필요]

**SVG 코드 검증:**
- **텍스트 정렬 (하단 공통 한계 박스):**
  - 섹션 1 (할루시네이션): 영역 `x=60~220` (중심 `140`). 텍스트 `x=120`. **20px 좌측 치우침.**
  - 섹션 4 (인간 검토): 영역 `x=580~740` (중심 `660`). 텍스트 `x=670`. **10px 우측 치우침.**
  - 중앙 섹션들(2, 3)은 중심 `310`, `490`으로 정확함.
- **구조 완전성:** 스펙의 모든 요소 포함됨.
- **보안 경계:** 중앙 x=400 대칭 구조 정확함.

**판정 사유:** 하단 "공통 한계" 박스 내의 텍스트가 각 구획의 중앙에 정렬되지 않음 (최대 20px 오차).

