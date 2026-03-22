export interface GlossaryEntry {
    term: string;
    abbr?: string;
    definition: string;
    chapters: string[];
    category: string;
}

const glossary: GlossaryEntry[] = [
    // ===== 공정 =====
    { term: '웨이퍼', abbr: 'Wafer', definition: '반도체 소자를 만드는 원판형 실리콘 기판. 직경 300 mm(12인치)가 현재 표준.', chapters: ['1.1', '1.2'], category: '공정' },
    { term: '팹', abbr: 'Fab', definition: '반도체 제조 공장(Fabrication Facility). 클린룸 환경에서 웨이퍼를 가공.', chapters: ['1.1', '1.3'], category: '공정' },
    { term: '파운드리', abbr: 'Foundry', definition: '칩 설계 없이 제조만 전문으로 하는 기업. TSMC, 삼성 파운드리 등.', chapters: ['1.1'], category: '공정' },
    { term: '팹리스', abbr: 'Fabless', definition: '팹 없이 칩을 설계만 하는 기업. Qualcomm, NVIDIA 등.', chapters: ['1.1'], category: '공정' },
    { term: '잉곳', abbr: 'Ingot', definition: '단결정 실리콘 원기둥. 초크랄스키(CZ)법으로 성장시킨 후 슬라이싱하여 웨이퍼를 얻는다.', chapters: ['1.2'], category: '공정' },
    { term: '클린룸', abbr: 'Clean Room', definition: '파티클을 극도로 제어한 무진 공간. 반도체 팹의 핵심 환경.', chapters: ['1.3'], category: '공정' },
    { term: '산화', abbr: 'Oxidation', definition: '실리콘 표면에 SiO₂(산화막)를 형성하는 공정. 게이트 절연막, 소자 분리에 사용.', chapters: ['1.4'], category: '공정' },
    { term: '증착', abbr: 'Deposition', definition: '기판 위에 박막을 형성하는 공정. CVD(화학기상증착), PVD(물리기상증착), ALD(원자층증착) 등.', chapters: ['1.4', '1.5'], category: '공정' },
    { term: 'CVD', abbr: 'Chemical Vapor Deposition', definition: '화학 기상 증착. 가스 반응으로 기판에 박막을 형성.', chapters: ['1.5'], category: '공정' },
    { term: 'ALD', abbr: 'Atomic Layer Deposition', definition: '원자층 증착. 한 번에 원자 1층씩 증착하여 극도로 균일한 박막 형성.', chapters: ['1.5'], category: '공정' },
    { term: 'PVD', abbr: 'Physical Vapor Deposition', definition: '물리 기상 증착. 스퍼터링 등으로 금속 박막을 증착.', chapters: ['1.5'], category: '공정' },
    { term: '식각', abbr: 'Etching', definition: '원하지 않는 부분의 재료를 제거하는 공정. 건식(플라즈마)과 습식(화학 용액)으로 구분.', chapters: ['1.6'], category: '공정' },
    { term: '플라즈마', abbr: 'Plasma', definition: '이온화된 기체. 건식 식각과 PECVD에서 반응성 이온을 생성하는 핵심 매체.', chapters: ['1.6'], category: '공정' },
    { term: 'CMP', abbr: 'Chemical Mechanical Planarization', definition: '화학적·기계적 연마로 웨이퍼 표면을 평탄화하는 공정.', chapters: ['1.7'], category: '공정' },
    { term: '이온 주입', abbr: 'Ion Implantation', definition: '불순물 이온을 가속하여 반도체에 주입하는 도핑 공정.', chapters: ['1.8'], category: '공정' },
    { term: '어닐링', abbr: 'Annealing', definition: '이온 주입 후 결정 格子를 복구하고 불순물을 활성화하는 열처리 공정.', chapters: ['1.8'], category: '공정' },
    { term: 'BEOL', abbr: 'Back-End-Of-Line', definition: '트랜지스터 형성 후 금속 배선과 비아를 만드는 후공정.', chapters: ['1.9'], category: '공정' },
    { term: 'FEOL', abbr: 'Front-End-Of-Line', definition: '트랜지스터를 형성하는 전공정(산화, 이온주입, 게이트 형성).', chapters: ['1.9'], category: '공정' },
    { term: '비아', abbr: 'Via', definition: '서로 다른 금속 배선층을 수직으로 연결하는 구멍/플러그.', chapters: ['1.9'], category: '공정' },
    { term: '세정', abbr: 'Cleaning', definition: '웨이퍼 표면의 파티클, 유기물, 금속 오염을 제거하는 공정. SC-1/SC-2 용액 사용.', chapters: ['1.3'], category: '공정' },
    { term: '패키징', abbr: 'Packaging', definition: '완성된 칩을 외부와 연결하고 보호하는 후공정. 와이어 본딩, 플립칩 등.', chapters: ['1.10'], category: '공정' },
    { term: '트랜지스터', abbr: 'MOSFET', definition: '반도체의 기본 스위칭 소자. 게이트 전압으로 소스-드레인 간 전류를 제어.', chapters: ['1.1', '1.9'], category: '공정' },

    // ===== 리소그래피 =====
    { term: '포토리소그래피', abbr: 'Photolithography', definition: '빛을 이용해 마스크의 패턴을 웨이퍼의 포토레지스트에 전사하는 핵심 공정.', chapters: ['2.1'], category: '리소그래피' },
    { term: '포토레지스트', abbr: 'Photoresist, PR', definition: '빛에 반응하는 감광성 고분자. 노광 후 현상하여 패턴을 형성.', chapters: ['2.2'], category: '리소그래피' },
    { term: 'EUV', abbr: 'Extreme Ultraviolet', definition: '극자외선(13.5 nm 파장). 7 nm 이하 노드의 핵심 리소그래피 광원.', chapters: ['2.3', '2.12', '5.1'], category: '리소그래피' },
    { term: 'ArF', definition: '불화아르곤 엑시머 레이저(193 nm 파장). 현재 DUV 리소의 주력 광원.', chapters: ['2.3'], category: '리소그래피' },
    { term: 'KrF', definition: '크립톤 플루오라이드 엑시머 레이저(248 nm 파장). 성숙 노드에서 사용.', chapters: ['2.3'], category: '리소그래피' },
    { term: 'NA', abbr: 'Numerical Aperture', definition: '개구수. 렌즈가 빛을 모으는 능력의 척도. NA가 클수록 해상도가 높아진다.', chapters: ['2.6'], category: '리소그래피' },
    { term: 'DOF', abbr: 'Depth of Focus', definition: '초점 심도. 허용 가능한 포커스 범위. NA가 올라가면 DOF가 줄어든다.', chapters: ['2.6'], category: '리소그래피' },
    { term: '프로세스 윈도우', abbr: 'Process Window', definition: 'Dose와 Focus의 허용 범위. 이 안에서만 CD 스펙을 만족한다.', chapters: ['2.6'], category: '리소그래피' },
    { term: 'OPC', abbr: 'Optical Proximity Correction', definition: '광근접보정. 광학 왜곡을 보상하기 위해 마스크 패턴을 미리 변형하는 기법.', chapters: ['2.7'], category: '리소그래피' },
    { term: 'RET', abbr: 'Resolution Enhancement Technology', definition: '해상도 향상 기술. OPC, PSM, OAI 등의 총칭.', chapters: ['2.7'], category: '리소그래피' },
    { term: 'ILT', abbr: 'Inverse Lithography Technology', definition: '역리소그래피. 원하는 웨이퍼 패턴에서 역으로 최적 마스크를 계산하는 기법.', chapters: ['2.7'], category: '리소그래피' },
    { term: 'PSM', abbr: 'Phase Shift Mask', definition: '위상 반전 마스크. 인접 패턴에 위상차를 주어 해상도를 향상시키는 기법.', chapters: ['2.7', '2.8'], category: '리소그래피' },
    { term: 'OAI', abbr: 'Off-Axis Illumination', definition: '비축 조명. 회절차수를 최적으로 포착하기 위해 조명 형태를 변형하는 기법.', chapters: ['2.7'], category: '리소그래피' },
    { term: '마스크', abbr: 'Reticle', definition: '회로 패턴이 새겨진 석영 판. 빛이 통과하여 웨이퍼에 패턴을 전사.', chapters: ['2.8'], category: '리소그래피' },
    { term: '펠리클', abbr: 'Pellicle', definition: '마스크 표면 보호용 얇은 필름. 파티클이 패턴면에 닿는 것을 방지.', chapters: ['2.8', '2.12'], category: '리소그래피' },
    { term: 'Overlay', definition: '오버레이. 연속된 리소 레이어 간의 정렬 오차. 서브 나노미터 제어가 필요.', chapters: ['2.9', '2.10'], category: '리소그래피' },
    { term: 'CPE', abbr: 'Corrections Per Exposure', definition: '노광 필드별 독립 보정. 고차 Overlay 변동을 흡수.', chapters: ['2.10'], category: '리소그래피' },
    { term: 'CD', abbr: 'Critical Dimension', definition: '핵심 치수(선폭). 패턴의 실제 폭. CD 균일도(CDU)가 수율을 좌우.', chapters: ['2.11'], category: '리소그래피' },
    { term: 'CDU', abbr: 'CD Uniformity', definition: 'CD 균일도. 웨이퍼 내/간, 필드 내/간, 로트 간 변동을 계층적으로 분해하여 관리.', chapters: ['2.11'], category: '리소그래피' },
    { term: 'MEEF', abbr: 'Mask Error Enhancement Factor', definition: '마스크 오차가 웨이퍼에서 얼마나 증폭되는지 나타내는 계수.', chapters: ['2.7'], category: '리소그래피' },
    { term: 'CD-SAXS', abbr: 'Small-Angle X-ray Scattering', definition: 'X선 소각 산란 기반 CD 측정. 3D 패턴 프로파일을 비파괴로 계측.', chapters: ['2.12'], category: '리소그래피' },
    { term: '확률적 결함', abbr: 'Stochastic Defect', definition: 'EUV 광자 수 부족으로 발생하는 통계적 패턴 결함. Shot Noise에 의한 랜덤 변동.', chapters: ['2.12'], category: '리소그래피' },
    { term: '멀티패터닝', abbr: 'Multi-Patterning', definition: 'EUV 이전에 미세 피치를 달성하기 위해 여러 번 노광하는 기법. LELE, SADP 등.', chapters: ['2.13'], category: '리소그래피' },
    { term: 'SADP', abbr: 'Self-Aligned Double Patterning', definition: '자기 정렬 이중 패터닝. 스페이서를 이용해 피치를 절반으로 줄이는 기법.', chapters: ['2.13'], category: '리소그래피' },
    { term: 'High-NA', definition: 'NA 0.55의 차세대 EUV 시스템. 비등방(Anamorphic) 광학계 사용.', chapters: ['5.1'], category: '리소그래피' },
    { term: 'DSA', abbr: 'Directed Self-Assembly', definition: '블록 공폴리머의 자기 조립을 이용한 차세대 패터닝 기술.', chapters: ['5.1'], category: '리소그래피' },
    { term: 'NIL', abbr: 'Nanoimprint Lithography', definition: '나노임프린트. 몰드로 물리적 압착하여 패턴을 전사. 광학 불필요.', chapters: ['5.1'], category: '리소그래피' },
    { term: '회절', abbr: 'Diffraction', definition: '빛이 패턴 가장자리에서 퍼지는 현상. 리소그래피 해상도의 근본적 제한 요인.', chapters: ['2.6', '2.7'], category: '리소그래피' },
    { term: '보성 곡선', abbr: 'Bossung Curve', definition: 'Focus에 따른 CD 변화를 보여주는 곡선. 프로세스 윈도우 분석의 핵심 도구.', chapters: ['2.6'], category: '리소그래피' },

    // ===== 수율/계측 =====
    { term: '수율', abbr: 'Yield', definition: '웨이퍼에서 양품 칩의 비율. 반도체 비즈니스의 핵심 지표.', chapters: ['3.1'], category: '수율/계측' },
    { term: 'SPC', abbr: 'Statistical Process Control', definition: '통계적 공정 관리. 관리도로 공정 안정성을 실시간 감시.', chapters: ['3.2'], category: '수율/계측' },
    { term: 'FDC', abbr: 'Fault Detection & Classification', definition: '장비 센서 데이터로 이상을 자동 탐지하고 분류하는 시스템.', chapters: ['3.3'], category: '수율/계측' },
    { term: 'APC', abbr: 'Advanced Process Control', definition: '고급 공정 제어. R2R(Run-to-Run) 피드백/피드포워드로 공정을 실시간 보정.', chapters: ['3.5'], category: '수율/계측' },
    { term: 'VM', abbr: 'Virtual Metrology', definition: '가상 계측. 실측 없이 FDC 데이터로 공정 결과를 예측하는 ML 모델.', chapters: ['3.4'], category: '수율/계측' },
    { term: 'R2R', abbr: 'Run-to-Run', definition: '웨이퍼(또는 Lot) 단위로 공정 조건을 피드백 보정하는 제어 방식.', chapters: ['3.5'], category: '수율/계측' },
    { term: 'CD-SEM', definition: '주사 전자 현미경 기반 선폭(CD) 측정 장비.', chapters: ['3.6'], category: '수율/계측' },
    { term: 'OCD', abbr: 'Optical Critical Dimension', definition: '광학 기반 CD 측정. 산란광 분석으로 비파괴 고속 측정.', chapters: ['3.6'], category: '수율/계측' },
    { term: 'ADC', abbr: 'Automatic Defect Classification', definition: '자동 결함 분류. SEM 이미지에서 결함 유형을 자동 판별.', chapters: ['3.7'], category: '수율/계측' },
    { term: '웨이퍼맵', abbr: 'Wafer Map', definition: '웨이퍼 내 다이별 결함/계측 분포를 2D로 시각화한 맵. 공간 패턴으로 원인 분석.', chapters: ['3.7'], category: '수율/계측' },
    { term: 'ADI', abbr: 'After Develop Inspection', definition: '현상 후 검사. 리소 패턴의 결함을 식각 전에 조기 탐지.', chapters: ['3.7'], category: '수율/계측' },
    { term: 'AEI', abbr: 'After Etch Inspection', definition: '식각 후 검사. 최종 패턴의 결함 검출.', chapters: ['3.7'], category: '수율/계측' },

    // ===== AI/ML =====
    { term: 'XGBoost', definition: 'Gradient Boosted Decision Trees. 반도체 VM/FDC에서 가장 많이 쓰이는 ML 알고리즘.', chapters: ['4.2'], category: 'AI/ML' },
    { term: 'SHAP', abbr: 'SHapley Additive exPlanations', definition: '피처의 기여도를 정량적으로 분해하는 모델 해석 기법.', chapters: ['4.2', '4.4'], category: 'AI/ML' },
    { term: '피처 엔지니어링', abbr: 'Feature Engineering', definition: '도메인 지식 기반으로 ML 입력 피처를 설계하는 과정. Focus², Dose×두께 등.', chapters: ['4.2'], category: 'AI/ML' },
    { term: '시간 기반 분할', abbr: 'Temporal Split', definition: '학습/검증 데이터를 시간 순서로 분할하여 데이터 누수를 방지하는 방법.', chapters: ['4.3'], category: 'AI/ML' },
    { term: 'RI', abbr: 'Reliability Index', definition: '신뢰 지수. VM 예측의 신뢰도를 0~1로 정량화. RI > 0.7이면 예측 신뢰.', chapters: ['4.3'], category: 'AI/ML' },
    { term: '이상 탐지', abbr: 'Anomaly Detection', definition: '정상에서 벗어난 데이터를 자동 감지. Autoencoder, Isolation Forest 등 사용.', chapters: ['3.3', '4.6'], category: 'AI/ML' },
    { term: 'MLOps', definition: 'ML 모델의 학습→배포→모니터링→재학습 전체 생명주기 관리 체계.', chapters: ['4.5'], category: 'AI/ML' },
    { term: 'CNN', abbr: 'Convolutional Neural Network', definition: '합성곱 신경망. 웨이퍼맵 패턴 분류, OPC 가속 등에 사용.', chapters: ['4.6'], category: 'AI/ML' },
    { term: 'LSTM', abbr: 'Long Short-Term Memory', definition: '장단기 기억 네트워크. FDC Trace의 시계열 패턴 학습에 사용.', chapters: ['4.6'], category: 'AI/ML' },
    { term: '전이 학습', abbr: 'Transfer Learning', definition: '한 팹/장비에서 학습한 모델을 다른 팹/장비에 적응시키는 기법.', chapters: ['4.7'], category: 'AI/ML' },
    { term: 'Federated Learning', definition: '연합 학습. 데이터를 공유하지 않고 모델 파라미터만 교환하여 학습.', chapters: ['4.7'], category: 'AI/ML' },
    { term: 'RL', abbr: 'Reinforcement Learning', definition: '강화 학습. 에이전트가 환경과 상호작용하며 보상을 최대화하는 정책을 학습.', chapters: ['4.8'], category: 'AI/ML' },
    { term: 'Bayesian Optimization', abbr: 'BO', definition: '베이지안 최적화. 서로게이트 모델(GP)과 획득 함수로 효율적 전역 최적화.', chapters: ['4.8'], category: 'AI/ML' },
    { term: 'LLM', abbr: 'Large Language Model', definition: '대규모 언어 모델. GPT 등. 반도체에서는 엔지니어 어시스턴트로 활용.', chapters: ['4.9'], category: 'AI/ML' },
    { term: 'SMILE', definition: 'Smart Manufacturing Intelligence & Learning Engine. 반도체 AI 통합 파이프라인.', chapters: ['4.10'], category: 'AI/ML' },
    { term: '디지털 트윈', abbr: 'Digital Twin', definition: '실제 팹/장비의 가상 복제본. 물리+ML 모델로 시뮬레이션과 최적화.', chapters: ['5.2'], category: 'AI/ML' },
    { term: 'Foundation Model', definition: '대규모 사전학습 모델. 반도체 Foundation Model은 여러 팹 데이터로 사전학습 후 소량 적응.', chapters: ['5.2'], category: 'AI/ML' },
    { term: '데이터 드리프트', abbr: 'Data Drift', definition: '시간에 따라 입력 데이터의 분포가 변하는 현상. 모델 재학습 트리거.', chapters: ['4.5'], category: 'AI/ML' },

    // ===== 장비/기업 =====
    { term: 'ASML', definition: '네덜란드 반도체 노광장비 기업. EUV 스캐너 독점 공급.', chapters: ['2.4', '2.12'], category: '장비/기업' },
    { term: '스캐너', abbr: 'Scanner', definition: '스텝 앤 스캔(Step & Scan) 방식의 노광 장비. 슬릿으로 마스크를 주사하며 노광.', chapters: ['2.4'], category: '장비/기업' },
    { term: 'KLA', definition: '반도체 검사/계측 장비 기업. 결함 검사와 패턴 인식 분야 선도.', chapters: ['3.7', '5.3'], category: '장비/기업' },
    { term: 'TSMC', definition: '대만 파운드리 기업. 세계 최대 반도체 위탁 생산.', chapters: ['1.1', '5.3'], category: '장비/기업' },
    { term: 'cuLitho', definition: 'NVIDIA의 GPU 기반 OPC/리소 시뮬레이션 가속 플랫폼. 40배 이상 속도 향상.', chapters: ['2.7', '5.2'], category: '장비/기업' },
    { term: 'Applied Materials', abbr: 'AMAT', definition: '세계 최대 반도체 장비 기업. 식각, 증착, CMP 장비 공급.', chapters: ['5.3'], category: '장비/기업' },
];

export default glossary;
