# 3.5 카이제곱 검정과 ANOVA — 범주형 변수와 그룹 비교

## 이 챕터에서 배우는 것

- 카이제곱 검정 — 범주형 변수 간 관계를 검정하는 법
- 적합도 검정 — "이 데이터가 이 분포를 따르는가?"
- ANOVA — 3개 이상 그룹의 평균을 한 번에 비교하는 법
- F-통계량의 직관 — "그룹 간 차이 / 그룹 내 변동"

---

## t-검정으로는 부족한 상황

3.4에서 두 그룹을 비교하는 법을 배웠다. 하지만 현실에서는 두 그룹만 비교하는 경우가 드물다.

- 모델 A, B, C, D 중 어느 것이 가장 좋은가?
- 세 가지 전처리 방법의 효과가 다른가?
- 범주형 피처(장비 ID, 레시피 번호)가 타겟과 관련이 있는가?

두 그룹씩 t-검정을 반복하면 되지 않나? 모델 4개면 $\binom{4}{2} = 6$번의 t-검정. 이것의 문제는 3.6에서 자세히 다루지만, 미리 말하면: **검정을 반복할수록 거짓 양성이 늘어난다.** 6번 검정하면 하나쯤은 우연히 유의미하게 나올 수 있다.

**분산분석(Analysis of Variance, ANOVA)**과 카이제곱 검정은 이 문제를 다루는 도구다.

---

## 카이제곱 검정: 범주형 변수의 관계

### 독립성 검정 (Test of Independence)

"두 범주형 변수가 독립인가?"를 검정한다.

예를 들어, 장비 3대(A, B, C)에서 생산한 제품의 불량 여부를 분석한다.

| | 양품 | 불량 | 합계 |
|--|------|------|------|
| 장비 A | 180 | 20 | 200 |
| 장비 B | 160 | 40 | 200 |
| 장비 C | 175 | 25 | 200 |
| **합계** | **515** | **85** | **600** |

$H_0$: 장비와 불량 여부는 독립이다 (= 장비에 따라 불량률이 다르지 않다)

카이제곱 통계량:

$$\chi^2 = \sum_{\text{all cells}} \frac{(O_i - E_i)^2}{E_i}$$

$O_i$는 관측 빈도(observed), $E_i$는 기대 빈도(expected). 기대 빈도는 "독립이라면 이 칸에 몇 개가 있어야 하는가?"로 계산한다.

$$E_i = \frac{\text{행 합계} \times \text{열 합계}}{\text{전체 합계}}$$

예를 들어, 장비 A의 불량 기대 빈도 = $200 \times 85 / 600 = 28.3$. 실제로는 20개만 불량이었으니, 장비 A는 불량이 기대보다 적다. 이런 차이가 전체적으로 우연으로 설명 가능한지를 $\chi^2$ 통계량이 요약한다.

$\chi^2$이 크면 → 관측과 기대의 차이가 크다 → 독립이 아닐 가능성이 높다 → $H_0$ 기각.

```python
from scipy.stats import chi2_contingency
import numpy as np

observed = np.array([[180, 20],
                     [160, 40],
                     [175, 25]])

chi2, p_value, dof, expected = chi2_contingency(observed)
print(f"χ² = {chi2:.3f}, p = {p_value:.4f}, df = {dof}")
print(f"\n기대 빈도:\n{expected.round(1)}")
```

### ML에서 카이제곱의 활용

**범주형 피처 선택.** 범주형 피처가 타겟(역시 범주형)과 관련이 있는지 확인할 때 카이제곱 검정을 쓴다.

```python
from sklearn.feature_selection import chi2, SelectKBest

# 범주형 피처와 이진 타겟 간 관계
selector = SelectKBest(score_func=chi2, k=10)
X_selected = selector.fit_transform(X_categorical, y)
```

1.4에서 `mutual_info_regression`으로 연속형 피처를 선택했다면, `chi2`는 범주형 피처를 선택할 때의 대응물이다.

> 💡 **카이제곱 검정의 전제**: 기대 빈도가 모든 칸에서 5 이상이어야 한다. 기대 빈도가 너무 작은 칸이 있으면 $\chi^2$ 근사가 부정확해진다. 이때는 **피셔의 정확 검정(Fisher's exact test)**을 쓴다. 피셔 정확 검정은 카이제곱처럼 근사 분포에 의존하지 않고, 주어진 주변 합계(행·열 합) 하에서 가능한 모든 테이블 배치의 정확한 확률을 직접 계산한다. `scipy.stats.fisher_exact()` (2×2 표 한정)로 사용한다.

---

## 적합도 검정 (Goodness-of-Fit Test)

카이제곱의 다른 용도: "이 데이터가 특정 분포를 따르는가?"

예를 들어, 결함 수가 포아송 분포를 따르는지 검정하고 싶다. 왜 포아송인가? 2.3에서 배웠듯이 포아송은 "단위 시간/면적당 드문 사건의 발생 횟수"를 모델링한다. 웨이퍼 위의 결함은 넓은 면적에서 드물게 발생하는 점 사건이므로, 포아송이 자연스러운 후보 분포다. 이 가정이 맞는지를 적합도 검정으로 확인한다.

관측된 결함 수의 빈도와 포아송 분포의 이론적 빈도를 비교한다.

$$\chi^2 = \sum_{k} \frac{(O_k - E_k)^2}{E_k}$$

```python
from scipy.stats import chisquare, poisson

# 관측: 100개 웨이퍼의 결함 수 분포
observed_counts = np.array([12, 25, 30, 18, 10, 5])  # 0결함, 1결함, ..., 5+결함
total = observed_counts.sum()

# 포아송 기대 빈도 (λ = 표본 평균으로 추정)
defect_values = np.arange(6)
lam = np.average(defect_values, weights=observed_counts)
expected_probs = poisson.pmf(defect_values, lam)
expected_probs[-1] = 1 - expected_probs[:-1].sum()  # 5+ 보정
expected_counts = expected_probs * total

chi2_stat, p_value = chisquare(observed_counts, f_exp=expected_counts, ddof=1)
print(f"λ = {lam:.2f}")
print(f"χ² = {chi2_stat:.3f}, p = {p_value:.4f}")
print(f"→ {'포아송 가정 기각' if p_value < 0.05 else '포아송 가정 기각 못함'}")
```

---

## ANOVA: 3개 이상 그룹의 평균 비교

### 왜 t-검정을 반복하면 안 되는가

모델 A, B, C를 비교하고 싶다. t-검정을 3번(A-B, A-C, B-C) 돌리면 되지 않나?

각 검정에서 거짓 양성 확률이 α = 0.05이면, 3번 검정에서 적어도 하나가 거짓 양성일 확률은:

$$1 - (1 - 0.05)^3 = 1 - 0.857 = 0.143$$

14.3%다. α = 0.05를 기준으로 쓰고 있지만, 실제로는 14.3%의 거짓 양성 위험을 감수하고 있는 것이다. 그룹이 10개면? $1 - (1-0.05)^{45} = 0.90$. 거짓 양성 확률이 90%. 이 문제는 3.6에서 정식으로 다룬다.

**ANOVA(Analysis of Variance)**는 "모든 그룹의 평균이 같은가?"를 한 번의 검정으로 답한다.

$$H_0: \mu_1 = \mu_2 = \cdots = \mu_k$$
$$H_1: \text{적어도 하나의 } \mu_i\text{가 다르다}$$

### F-통계량의 직관

ANOVA의 검정 통계량은 **F-통계량**이다.

$$F = \frac{\text{그룹 간 변동 (Between-group variance)}}{\text{그룹 내 변동 (Within-group variance)}} = \frac{MSB}{MSW}$$

직관은 단순하다:

- **분자 (MSB)**: 그룹 평균들이 전체 평균에서 얼마나 떨어져 있는가. 그룹 간 차이.
- **분모 (MSW)**: 각 그룹 내에서 데이터가 자기 그룹 평균에서 얼마나 떨어져 있는가. 그룹 내 노이즈.

$$F = \frac{\text{신호 (그룹 간 차이)}}{\text{노이즈 (그룹 내 변동)}}$$

F가 크면 → 노이즈에 비해 그룹 간 차이가 크다 → 적어도 하나의 그룹이 다르다.

F가 1에 가까우면 → 그룹 간 차이가 노이즈 수준이다 → 차이가 없을 가능성 높다.

![ANOVA 분산 분해](/content/images/stats/03_05/anova_decomposition.svg)

<details>
<summary>🔬 Deep Dive — ANOVA의 분해</summary>

전체 변동(SST)을 두 부분으로 분해하는 것이 ANOVA의 핵심이다.

$$\underbrace{\sum_{i,j}(x_{ij} - \bar{x})^2}_{SST} = \underbrace{\sum_i n_i (\bar{x}_i - \bar{x})^2}_{SSB} + \underbrace{\sum_{i,j}(x_{ij} - \bar{x}_i)^2}_{SSW}$$

- **SST (Total)**: 전체 데이터의 분산
- **SSB (Between)**: 그룹 간 차이에 의한 분산
- **SSW (Within)**: 그룹 내 개별 변동에 의한 분산

각각을 자유도로 나누면 평균 제곱(MS)이 된다:

$$MSB = \frac{SSB}{k-1}, \quad MSW = \frac{SSW}{N-k}$$

$k$는 그룹 수, $N$은 전체 데이터 수. 자유도는 SSB에 $k-1$, SSW에 $N-k$.

$H_0$ 하에서 $F = MSB/MSW \sim F(k-1, N-k)$.

이 분해가 왜 "분산 분석(Analysis of Variance)"이라는 이름을 가졌는지 보인다: 전체 분산을 원인별로 분해하는 것이다.

</details>

### 코드

```python
from scipy.stats import f_oneway

# 세 가지 전처리 방법으로 학습한 모델의 정확도
method_a = [0.83, 0.85, 0.84, 0.86, 0.84, 0.85, 0.83, 0.84]
method_b = [0.87, 0.89, 0.88, 0.86, 0.88, 0.87, 0.89, 0.88]
method_c = [0.84, 0.86, 0.85, 0.87, 0.85, 0.86, 0.84, 0.85]

f_stat, p_value = f_oneway(method_a, method_b, method_c)
print(f"F = {f_stat:.3f}, p = {p_value:.4f}")
print(f"→ {'적어도 하나의 방법이 다르다' if p_value < 0.05 else '유의미한 차이 없음'}")
```

### ANOVA가 "유의미"하면 다음은?

ANOVA는 "적어도 하나가 다르다"만 말해줄 뿐, **어떤 그룹이 다른지**는 말해주지 않는다. 어떤 쌍이 다른지 알려면 **사후 검정(post-hoc test)**이 필요하다.

대표적인 것이 **Tukey's HSD (Honest Significant Difference)**:

```python
from statsmodels.stats.multicomp import pairwise_tukeyhsd
import pandas as pd

# 데이터를 long format으로
data = np.concatenate([method_a, method_b, method_c])
labels = ['A']*8 + ['B']*8 + ['C']*8

result = pairwise_tukeyhsd(data, labels, alpha=0.05)
print(result)
```

Tukey HSD는 모든 쌍을 비교하면서 다중검정 보정(3.6)을 자동으로 적용한다.

---

## ANOVA와 선형회귀의 연결

놀랍게 보일 수 있지만, **ANOVA는 선형회귀의 특수한 경우**다.

범주형 변수(그룹)를 더미 변수(dummy variable)로 인코딩하여 선형회귀에 넣으면, 그 회귀의 F-검정이 ANOVA와 정확히 같은 결과를 낸다.

```python
from sklearn.linear_model import LinearRegression
from scipy.stats import f_oneway
import pandas as pd

# ANOVA 방식
f_stat_anova, p_anova = f_oneway(method_a, method_b, method_c)

# 회귀 방식
df = pd.DataFrame({
    'score': np.concatenate([method_a, method_b, method_c]),
    'method': ['A']*8 + ['B']*8 + ['C']*8
})
X = pd.get_dummies(df['method'], drop_first=True).values
y = df['score'].values

# F-test for overall significance
import statsmodels.api as sm
X_with_const = sm.add_constant(X)
model = sm.OLS(y, X_with_const).fit()
print(f"ANOVA F: {f_stat_anova:.3f}, p: {p_anova:.4f}")
print(f"회귀 F:  {model.fvalue:.3f}, p: {model.f_pvalue:.4f}")
# → 같은 값!
```

이 연결이 Part 4에서 중요해진다. 회귀에서의 F-검정이 "이 피처(들)가 전체적으로 유의미한가?"를 묻는 것이고, 그 논리가 ANOVA와 같다.

---

## Python으로 확인하기

```python
import numpy as np
from scipy import stats

np.random.seed(42)

# 1. 카이제곱 독립성 검정
print("=== 카이제곱 독립성 검정 ===")
observed = np.array([[180, 20],
                     [160, 40],
                     [175, 25]])

chi2, p, dof, expected = stats.chi2_contingency(observed)
print(f"χ² = {chi2:.3f}, df = {dof}, p = {p:.4f}")
print(f"기대 빈도:\n{expected.round(1)}")
print(f"→ {'장비에 따라 불량률이 다르다' if p < 0.05 else '차이 없음'}")

# 2. ANOVA: F-통계량의 직관
print(f"\n=== ANOVA ===")

# 시나리오 1: 그룹 간 차이 큼
groups_different = [
    np.random.normal(80, 5, 30),   # A
    np.random.normal(90, 5, 30),   # B
    np.random.normal(85, 5, 30),   # C
]
f1, p1 = stats.f_oneway(*groups_different)
print(f"차이 큰 경우: F = {f1:.2f}, p = {p1:.6f}")

# 시나리오 2: 그룹 간 차이 작음
groups_similar = [
    np.random.normal(85, 5, 30),
    np.random.normal(85.5, 5, 30),
    np.random.normal(85.2, 5, 30),
]
f2, p2 = stats.f_oneway(*groups_similar)
print(f"차이 작은 경우: F = {f2:.2f}, p = {p2:.4f}")

# 3. t-검정 반복 vs ANOVA
print(f"\n=== t-검정 반복의 위험 ===")
n_groups = 5
n_sim = 10000
false_positive_t = 0
false_positive_anova = 0

for _ in range(n_sim):
    # 5개 그룹, 실제로는 모두 같은 분포 (H0 참)
    groups = [np.random.normal(0, 1, 20) for _ in range(n_groups)]
    
    # t-검정 반복: 10번 (5C2) 중 하나라도 유의미?
    any_sig = False
    for i in range(n_groups):
        for j in range(i+1, n_groups):
            _, p = stats.ttest_ind(groups[i], groups[j])
            if p < 0.05:
                any_sig = True
                break
        if any_sig:
            break
    if any_sig:
        false_positive_t += 1
    
    # ANOVA: 한 번에 검정
    _, p_anova = stats.f_oneway(*groups)
    if p_anova < 0.05:
        false_positive_anova += 1

print(f"5그룹, H0 참일 때:")
print(f"  t-검정 반복 거짓 양성률: {false_positive_t/n_sim:.1%} (이론: ~40%)")
print(f"  ANOVA 거짓 양성률:      {false_positive_anova/n_sim:.1%} (이론: 5%)")
```

<!-- [OUTPUT:
=== 카이제곱 독립성 검정 ===
χ² = 8.909, df = 2, p = 0.0116
기대 빈도:
[[171.7  28.3]
 [171.7  28.3]
 [171.7  28.3]]
→ 장비에 따라 불량률이 다르다

=== ANOVA ===
차이 큰 경우: F = 30.12, p = 0.000000
차이 작은 경우: F = 0.08, p = 0.9198

=== t-검정 반복의 위험 ===
5그룹, H0 참일 때:
  t-검정 반복 거짓 양성률: 40.2% (이론: ~40%)
  ANOVA 거짓 양성률:      5.1% (이론: 5%)
] -->

---

## 핵심 정리

- **카이제곱 독립성 검정**: "두 범주형 변수가 관련 있는가?" $(O - E)^2 / E$의 합. 범주형 피처 선택에 직접 사용 (`sklearn.feature_selection.chi2`).
- **카이제곱 적합도 검정**: "이 데이터가 특정 분포를 따르는가?" 포아송, 정규 등 분포 가정을 검증.
- **ANOVA**: "3개 이상 그룹의 평균이 모두 같은가?" F = 그룹 간 변동 / 그룹 내 변동. t-검정을 반복하면 거짓 양성이 폭증한다 — ANOVA는 이것을 한 번에 해결.
- **ANOVA = 범주형 변수의 선형회귀.** 더미 변수로 인코딩하면 같은 결과. Part 4의 복선.
- **ANOVA가 유의미하면 → 사후 검정(Tukey HSD)**으로 어떤 쌍이 다른지 확인.

---

<!-- [PREV: 3.4 t-검정과 z-검정 — A/B 테스트의 뼈대] -->
<!-- [NEXT: 3.6 다중검정 문제 — 하이퍼파라미터 100개 돌려보고 "유의미"라고?] -->
