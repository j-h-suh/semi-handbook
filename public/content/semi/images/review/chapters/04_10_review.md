### smile_system_architecture.svg — [수정 필요]

**SVG 코드 검증:**
- **화살표 연결 (심각):**
  - MLflow → VM Server (모델 배포) 화살표: `line x1="610" y1="410" x2="610" y2="195"`
    - VM Server rect: `y=158`, `height=65` (bottom `223`).
    - 화살표 끝점 `y=195`는 VM Server 박스 내부 깊숙이 위치함 (28px 관통). 테두리에 닿아야 함 (`y=223`).
  - APC → Scanner (피드백) 화살표: `path d="... 80,295"`
    - Scanner rect: `y=92`, `height=40` (bottom `132`).
    - 화살표 끝점 `y=295`는 Scanner보다 160px 이상 아래 허공을 가리킴 (MES 아래쪽). 위치 오류.
- **화살표 간격 (미세):**
  - 대부분의 화살표(Kafka→Feature, Feature→VM 등)가 대상 박스와 2px 간격이 있어 완벽히 닿지 않음 (marker refX 고려 필요).
- **텍스트 정렬:** 레이어별 타이틀 정렬은 양호함.

**판정 사유:** 
화살표가 대상 객체를 관통하거나(VM Server), 엉뚱한 허공을 가리키는(Scanner 피드백) 심각한 좌표 오류 존재.

---

### smile_development_roadmap.svg — [수정 필요]

**SVG 코드 검증:**
- **요소 겹침 (심각):**
  - Phase 1 카드와 Phase 2 카드 겹침 발생.
  - Phase 1 Content: `rect x="35" width="250"` → 끝점 x=285.
  - Phase 2 Start: `x=240`.
  - **45px 겹침 발생.**
- **내용 가림:**
  - Phase 1 내부 구분선: `line x1="50" x2="270"`.
  - Phase 2 카드가 `x=240`부터 시작하므로, Phase 1의 선 오른쪽 30px이 Phase 2 카드에 의해 가려짐.
  - 텍스트나 아이콘이 가려질 위험 높음. SVG 렌더링 순서상 뒤에 나오는 Phase 2가 위로 올라옴.

**판정 사유:** 
Phase 카드 간 과도한 겹침(45px)으로 인해 이전 단계의 콘텐츠(구분선 등)가 가려지는 레이아웃 오류.

---

### smile_dashboard_mockup.png — [통과]

**PNG 시각 검증:**
- **텍스트 가독성:** 모든 레이블(RMSE, PSI, Threshold 등) 선명함.
- **데이터 정확성:**
  - RMSE: 0.423nm (스펙 ~0.42nm 일치), Green status.
  - Data Drift: 모든 바 < 0.2 (Threshold), PSI 값 정확함.
  - APC: 94%, 2 clampings, CD 3σ = 1.2nm (스펙 일치).
- **디자인:** 어두운 테마, Grafana 스타일, 그리드 레이아웃 준수.

**판정 사유:** 
스펙의 모든 데이터 수치와 디자인 요구사항을 완벽하게 반영함.
