### 02_09 (Overlay 측정 방법) — [PASS]

**SVG 코드 검증: dbo_grating_mark_cross_section.svg**
- **ViewBox/크기**: `viewBox="0 0 900 400"` → 스펙(900x400) 일치.
- **색상**: Current `#4169E1`, Reference `#FF8C00`, +1 `#32CD32`, -1 `#FF6347` → 스펙 일치.
- **구조 완전성**: OVL=0 패널과 OVL≠0 패널 모두 존재.
- **대칭성(Panel 1)**: 격자 위치 `x=60` 동일. 회절광 대칭(폭, 길이, 좌표). I+1 = I-1 확인.
- **비대칭성(Panel 2)**: 현재 층 격자 `x=72` (12px 이동). 회절광 비대칭(두께 차이). I+1 > I-1.
- **공식**: `OVL = (d/2) × (ΔI_A − ΔI_B) / (ΔI_A + ΔI_B)` 정확히 표기됨.
- **화살표**: Manual polygon 사용. 방향(벡터)과 Tip 위치 정확함.

**SVG 코드 검증: diffraction_principle.svg**
- **ViewBox/크기**: `viewBox="0 0 600 450"` → 스펙(600x450) 일치.
- **요소 겹침**: 입사광(300, 195)과 격자(y=210) 사이 갭 있으나 화살표 팁(300, 210)이 격자에 닿음. 문제 없음.
- **회절광 각도**: +1차(우측)와 -1차(좌측)의 각도가 대칭적임 (좌표 계산상).
- **텍스트**: `sinθ = mλ/P` 등 물리 공식 포함됨.
- **색상**: 입사광 `#FFD700`, +1 `#4169E1`, -1 `#FF6347` → 스펙 일치.

**PNG 시각 검증: box_in_box_microscope.png**
- **이미지 품질**: 현미경 질감(Grainy)과 Grayscale 표현 적절.
- **구조**: Outer Box(Dark) vs Inner Box(Light) 명확함.
- **Offset**: Inner box가 중심에서 약간 벗어난 Overlay error 상황 표현됨.
- **라벨**: L, R, T, B 화살표 및 텍스트 명확.
- **공식**: `OVL_x = (L-R)/2` 하단 표기 확인.

**PNG 시각 검증: sampling_map_comparison.png**
- **구성**: 좌측 Fixed Grid vs 우측 AI-Optimized 비교 구조 명확.
- **데이터 표현**: 좌측은 균일 분포, 우측은 Edge(붉은색) 집중 분포로 Overlay variation 대응 전략을 잘 시각화함.
- **Heatmap**: 하단에 Information Gain Heatmap 배치되어 전략의 근거를 뒷받침함.
- **전문성**: Infographic 스타일로 깔끔하게 제작됨.

**판정 사유:** 모든 이미지가 스펙의 기술적 요구사항(격자 구조, 회절 비대칭성, 수식, 샘플링 전략)을 정확히 반영하고 있으며, SVG 코드 상의 좌표 및 논리적 오류가 발견되지 않음.
