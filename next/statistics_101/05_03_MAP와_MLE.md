# 5.3 MAP와 MLE — 너의 모델 학습은 이미 베이지안이다

## 이 챕터에서 배우는 것

- MLE와 MAP의 정확한 관계
- "정규화를 쓰는 순간 이미 베이지안이다"라는 명제의 증명
- 완전 베이즈와 MAP의 차이 — 점추정 vs 분포 전체
- 왜 대부분의 딥러닝이 암묵적 MAP인지

---

## MLE, MAP, 완전 베이즈: 한 줄에 놓기

4.4에서 이 테이블을 봤다. 이제 완전히 이해할 때다.

$$\hat{\theta}_{\text{MLE}} = \arg\max_\theta P(\text{data} \mid \theta)$$

→ "이 데이터를 가장 잘 설명하는 $\theta$ 하나를 찾아라." 사전 지식 없이, 데이터만으로.

$$\hat{\theta}_{\text{MAP}} = \arg\max_\theta P(\text{data} \mid \theta) \cdot P(\theta)$$

→ "데이터도 잘 설명하면서 사전 지식과도 부합하는 $\theta$ 하나를 찾아라." 두 기준의 균형.

$$P(\theta \mid \text{data}) = \frac{P(\text{data} \mid \theta) \cdot P(\theta)}{P(\text{data})} \quad \text{(완전 베이즈)}$$

→ "$\theta$가 가질 수 있는 **모든 값의 확률분포**를 구하라." 점 하나가 아니라 분포 전체.

세 가지의 차이:

- **MLE**: 우도만 최대화. 사전분포 없음. → OLS, 정규화 없는 로지스틱 회귀.
- **MAP**: 우도 × 사전분포를 최대화. 사후분포의 **꼭대기**만 찾음. → Ridge, Lasso, weight decay가 있는 딥러닝.
- **완전 베이즈**: 사후분포 **전체**를 계산. 예측할 때 사후분포를 적분으로 합산. → 베이지안 신경망, 가우시안 프로세스.

### MLE는 MAP의 특수한 경우

사전분포를 $P(\theta) = \text{const}$ (균등분포)로 놓으면:

$$\hat{\theta}_{\text{MAP}} = \arg\max_\theta P(\text{data} \mid \theta) \cdot \text{const} = \arg\max_\theta P(\text{data} \mid \theta) = \hat{\theta}_{\text{MLE}}$$

**MLE = 균등 사전분포를 가진 MAP.** "아무 사전 지식도 쓰지 않겠다"는 것도 하나의 사전분포 선택이다.

---

## "너의 모델 학습은 이미 베이지안이다"

이 챕터의 제목을 증명하자.

PyTorch로 신경망을 학습한다고 하자:

```python
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)
```

`weight_decay=1e-2`는 L2 정규화를 적용한다. 4.4에서 봤듯이:

- L2 정규화 = 가우시안 사전분포를 가진 MAP
- weight_decay = $\lambda$ = $\sigma^2 / \tau^2$

즉, `weight_decay`를 0이 아닌 값으로 설정하는 순간, 가중치에 $N(0, \tau^2)$ 사전분포를 부여하고 MAP 추정을 수행하는 것이다.

Dropout도 암묵적 사전분포로 해석할 수 있고, data augmentation도 사전 지식의 반영이다 ("이미지를 뒤집어도 고양이는 고양이다"라는 사전 지식).

**정규화, Dropout, data augmentation을 쓰는 거의 모든 딥러닝 학습은 암묵적 MAP다.**

| ML 기법 | 베이지안 해석 |
|---------|-------------|
| weight_decay (L2) | 가우시안 사전 $N(0, \tau^2)$ |
| L1 정규화 | 라플라스 사전 |
| Dropout | 가중치에 대한 베르누이 마스크 사전 |
| Data augmentation | 변환 불변성이라는 사전 지식 |
| Early stopping | 사전분포 + 제한된 최적화 (암묵적 정규화) |
| Batch normalization | 은닉층 분포에 대한 정규성 사전 |

---

## MAP의 한계: 점추정의 문제

MAP는 사후분포의 꼭대기(mode)만 찾는다. 분포 전체를 쓰지 않는다. 이것의 문제:

**1. 불확실성을 무시한다.** MAP는 "가장 가능한 θ"만 알려주지, "θ가 얼마나 불확실한지"는 모른다. 사후분포가 뾰족하면(불확실성 낮음) 점추정으로 충분하지만, 납작하면(불확실성 높음) 점추정은 위험하다.

**2. 비대칭 사후분포에서 mode ≠ mean.** 사후분포가 skewed되어 있으면, mode(MAP)와 mean(베이즈 추정의 MSE 최적)이 다르다. 1.1에서 배운 평균 vs 최빈값 문제의 재현이다.

### 완전 베이즈의 예측

MAP:
$$\hat{y} = f(\hat{\theta}_{\text{MAP}}, x)$$

완전 베이즈:
$$P(y \mid x, \text{data}) = \int P(y \mid x, \theta) \cdot P(\theta \mid \text{data}) \, d\theta$$

완전 베이즈는 가능한 모든 $\theta$에 대해 예측을 합산하고, 각 $\theta$의 사후확률로 가중한다. 사후분포가 넓으면(불확실하면) 예측의 불확실성도 자동으로 커진다.

이 적분이 대부분의 경우 해석적으로 풀리지 않기 때문에, 5.4에서 배울 MCMC 같은 수치적 방법이 필요하다.

---

## 실무에서의 위치

| | 계산 비용 | 불확실성 정량화 | 실무 빈도 |
|--|---------|--------------|---------|
| MLE | 낮음 | 없음 (SE로 근사 가능) | sklearn 기본 |
| MAP | 낮음 (MLE와 동일) | 없음 | weight_decay, L1/L2 |
| 완전 베이즈 | 높음 (MCMC, VI) | 있음 | 특수 상황 |

대부분의 ML 실무: MLE 또는 MAP. 불확실성이 정말 중요한 경우(의료, 자율주행, 금융 리스크)에만 완전 베이즈를 고려한다.

하지만 베이지안 프레임워크를 **이해**하는 것은 MAP만 쓰더라도 가치가 있다. "왜 이 정규화가 작동하는가?", "λ를 바꾸면 무엇이 달라지는가?"에 원리적으로 답할 수 있게 되니까.

---

## Python으로 확인하기

```python
import numpy as np
from scipy import stats
from sklearn.linear_model import LinearRegression, Ridge, Lasso

np.random.seed(42)

# MLE vs MAP 비교
n = 20  # 데이터가 적은 상황
X = np.random.normal(0, 1, (n, 5))
true_beta = np.array([3, 0, 0, 0, 0])  # 피처 1개만 관련
y = X @ true_beta + np.random.normal(0, 1, n)

models = {
    'MLE (OLS)':     LinearRegression(),
    'MAP-Gaussian':  Ridge(alpha=1.0),
    'MAP-Laplace':   Lasso(alpha=0.3),
}

print(f"진짜 β: {true_beta}")
print(f"n = {n} (데이터 부족 상황)\n")

for name, model in models.items():
    model.fit(X, y)
    coefs = model.coef_.round(3)
    n_zero = (np.abs(model.coef_) < 1e-6).sum()
    print(f"{name:<16}: β = {coefs}, 0인 계수: {n_zero}")

# 사전분포의 영향: λ에 따른 변화
print(f"\n=== λ(=σ²/τ²)가 커질수록 → 사전에 끌려감 ===")
for alpha in [0.001, 0.1, 1, 10, 100]:
    model = Ridge(alpha=alpha).fit(X, y)
    print(f"  λ={alpha:<6}: β₁={model.coef_[0]:.3f} "
          f"(사전 평균 0으로 수축)")
```

<!-- [OUTPUT:
진짜 β: [3 0 0 0 0]
n = 20 (데이터 부족 상황)

MLE (OLS)       : β = [ 2.872  0.425 -0.307  0.198 -0.543], 0인 계수: 0
MAP-Gaussian    : β = [ 2.563  0.301 -0.224  0.149 -0.382], 0인 계수: 0
MAP-Laplace     : β = [ 2.443  0.053 -0.     0.    -0.119], 0인 계수: 2

=== λ(=σ²/τ²)가 커질수록 → 사전에 끌려감 ===
  λ=0.001 : β₁=2.871 (사전 평균 0으로 수축)
  λ=0.1   : β₁=2.777 (사전 평균 0으로 수축)
  λ=1     : β₁=2.563 (사전 평균 0으로 수축)
  λ=10    : β₁=1.727 (사전 평균 0으로 수축)
  λ=100   : β₁=0.467 (사전 평균 0으로 수축)
] -->

---

## 핵심 정리

- **MLE = 균등 사전의 MAP.** "사전 지식 안 쓴다"도 하나의 사전분포 선택이다.
- **weight_decay, L1, Dropout, augmentation을 쓰는 순간 이미 MAP다.** 대부분의 딥러닝 학습은 암묵적 베이지안.
- **MAP는 사후분포의 꼭대기만 찾는다.** 불확실성 정량화가 필요하면 완전 베이즈. 대부분의 실무에서는 MAP로 충분.
- **λ를 키우면 사전분포(= 0)에 끌려간다.** λ = 0이면 MLE, λ → ∞이면 모든 계수 → 0.
- **베이지안을 이해하면 정규화를 이해한다.** 쓰지 않더라도 아는 것의 가치.

---

<!-- [PREV: 5.2 사전분포, 우도, 사후분포 — 베이즈 정리 재방문] -->
<!-- [NEXT: 5.4 MCMC 맛보기 — 사후분포를 직접 샘플링하기] -->
