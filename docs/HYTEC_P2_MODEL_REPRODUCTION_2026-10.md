# HyTEC P2 — independent reproduction of published fitted TCP/NTCP equations
**Date:** 2026-10-08 · **Status:** primary-document equation/parameter consistency audit, **not** a new clinical calculator or a fit validation with patient-level outcomes. Evidence release remains `draft`.

Related: [73-row evidence ledger](HYTEC_P2_RECORD_LEVEL_LEDGER_2026-10.md) · [discrepancy register](HYTEC_DISCREPANCY_REGISTER.csv) · [executable regression test](../tests/hytecPublishedFitReproduction.test.ts).

## Methods / boundaries

For each selected source, transcribe the **equation and parameterization actually printed by the source** (different Poisson/logistic variants are not interchangeable); recompute independently in JavaScript `number` arithmetic; compare to *source* narrative/figures and the *unchanged* HFC discrete points. Use EQD2/BED with **that source's α/β** and keep target metric distinct from normal tissue metric.

**95% parameter CIs in source tables are not 95% confidence bands for TCP/NTCP**. They cannot be converted into rigorous outcome intervals by independently combining parameter CI endpoints; joint covariance/profile-likelihood and original sample data/fit would be necessary. The code below is a **test oracle**, not a patient-specific treatment planning API.

## A. Vargo et al. 2021 — head/neck SBRT reirradiation LC

Primary local file `HyTEC_11_Vargo_2021_Head-neck_reirradiation_TCP.pdf`, **PDF pp. 6–7 Table 4/Results**. Source uses **5-fraction equivalent total dose, α/β=10 Gy**, not raw BED or delivered physical dose across unlike schedules.

Form: `TCP = 1/[1+exp(-4*γ50*(D5eq/D50 - 1))]` (source's reported logistic dose-response convention).

| 5fx eq dose | Follow-up | Source Table 4 fit | Recomputed model | HFC discrete point | Difference |
|---|---|---|---:|---:|---:|
| 25.6 Gy | 1 year | D50 25.5 Gy, γ50 0.17 | 50.067% | ≈50% | +0.067 pp |
| 40.7 Gy | 1 year | same | 59.997% | ≈60% | −0.003 pp |
| 45.1 Gy | 2 years | D50 45.1 Gy, γ50 0.56 | 50.000% | ≈50% | 0 pp |
| 26.8 Gy | 3 years | D50 49.8 Gy, γ50 0.94 | 14.975% | ≈15% | −0.025 pp |
| 44.4 Gy | 3 years | same | 39.946% | ≈40% | −0.054 pp |
| 49.8 Gy | 3 years | same | 50.000% | ≈50% | 0 pp |

Table 4 additionally quotes D50(2y) 45.1 (95% CI **39.1–71.5**) Gy, γ50(2y) 0.56 (0.27–0.85); D50(3y) 49.8 (43.7–72.8) Gy, γ50(3y) 0.94 (0.49–1.43). At 1 year, statistical evidence for dose dependence was **not significant** (Table 4 and main text; `P≈0.096` dose-response fit versus model without dose effect). Reproducing two 1y estimates therefore does not establish predictive utility.

**Result:** all 6/6 HFC points agree with printed fitted-parameter equation to within **0.07 percentage points**. **No HFC dose/probability modified.**

## B. Grimm et al. 2021 — pooled major-vessel reirradiation Dmax / bleeding

Primary local file `HyTEC_12_Grimm_2021_Carotid_blowout_tolerance.pdf`, **PDF pp. 7–8, equation and Table 2**. Only the **HyTEC pooled Dmax** model is compared here; *not* the `D0.5cc` or `D1cc` model and *not* actual cumulative prior RT distribution.

Source: pooled **238 vessels**, TD50 = **45.7 Gy** (95% CI **39.6–64.9**), γ50 = **1.1817** (95% CI **0.65–1.8**). Source log-logistic dose form:
`NTCP = 1/[1 + (TD50/Dmax)^(4*γ50)]`.

| 5fx SBRT major-vessel Dmax | Formula | HFC approximate risk | Diff |
|---|---:|---:|---:|
| 20 Gy | 1.9723% | ≈2% | −0.0277 pp |
| 30 Gy | 12.0308% | ≈12% | +0.0308 pp |

**Result:** 2/2 values numerically reproduced, with correct `Dmax` metric. The source discusses reported bleeding events including confounding by recurrent tumour/necrosis, pooled grouped-cohort medians, prior conventional radiation nominally near 70 Gy; therefore **these are not individualized carotid blowout predictions**. The published `D0.5cc<20 Gy` objective is a distinct recommendation and was not mathematically derived from this Dmax fit.

## C. Stumpf et al. 2021 — adrenal metastases 1-year LC

Primary local file `HyTEC_18_Stumpf_2021_Adrenal_TCP.pdf`, **PDF p. 7, Figure 1 and equation (1)**; published full text via DOI `10.1016/j.ijrobp.2020.05.062`.

Source Poisson variant:
`TCP = (1/2)^exp[(2*γ50/ln(2))*(1 - EQD2_10/D50)]`.

The Figure 1 **1-year local control** parameters (not Figure 2 survival parameters!): `D50=34.6 Gy EQD2_10` (95% CI **27.1–45.4**); `γ50=0.4996` (95% CI **0.248–0.814**). The source uses **GTV-encompassing EQD2_10** (estimated from published Rx+IDL) rather than generic Rx dose.

At `BED10=116.4 Gy`, `EQD2_10=116.4/(1+2/10)=97.0 Gy`, fitted `TCP=94.9809%` versus printed approximately 95% / slightly over 95% recommendation. **Difference ≈0.019 pp**, consistent with source rounding. The HFC point retains `>95%` exactly as the author's qualitative threshold and does **not** activate this continuous model for arbitrary patient plans.

## D. Royce et al. 2021 — prostate SBRT 5-year FFBR: UNRESOLVED PRIMARY-SOURCE INCONSISTENCY

Primary local file `HyTEC_19_Royce_2021_Prostate_TCP.pdf`, **PDF pp. 6–7, Table 3, equation (2), Figure 1, Figure 1 caption**, DOI **10.1016/j.ijrobp.2020.08.014**. The same source is publicly available in the AAPM HyTEC PDF and PubMed Central; the equation and Table 3 were independently visually inspected from the AAPM original, not guessed from PDF text extraction.

Article Poisson formula **as printed**:
`TCP = 2^(-exp[e * γ * (1 - EQD2_1.5/D50)])`, where **e=Euler's number**, not dose.

Table 3 gives:
- low/intermediate: **D50=20.6 (18.9–22.3) Gy**, **γ=0.15 (0.13–0.17)**;
- high-risk: **D50=84.2 (81.4–86.8) Gy**, **γ=4.50 (2.82–6.53)**.

| Cohort, EqD2_1.5 | Direct substitution of source Table 3 and eq (2) | Source Results/Figure 1 & HFC | Source self-consistency |
|---|---:|---:|---|
| Low/intermediate, 71 Gy | **77.4443%** | ≈90% | **NO**, Δ−12.5557 pp |
| Low/intermediate, 90 Gy | **83.9045%** | ≈95% | **NO**, Δ−11.0955 pp |
| High-risk, 97 Gy | **89.7669%** | ≈90% | YES, Δ−0.2331 pp |
| High-risk, 102 Gy | **94.9127%** | ≈95% | YES, Δ−0.0873 pp |

The high-risk agreement **confirms correct reading of the Poisson formula** in the numerical audit. For low/intermediate risk, independent calculation does not reproduce the printed 90/95% and is visibly inconsistent with Figure 1's illustrated curve. Algebraic inverse substitution of `D50=20.6` would require `γ≈0.2833` at 71 Gy and `γ≈0.2843` at 90 Gy, whereas Table 3 prints `γ=0.15`. **This is an internal-consistency diagnostic, NOT permission to silently assign γ=0.284 or allege a specific typo without source confirmation.**

Additional clinical limitation: Figure 1 explicitly states **no included EQD2 doses below about 80 Gy**, so the 71 Gy 90% entry must be flagged as **extrapolated** regardless of the parameter mismatch. This marker was added during the preceding P2 pass. The low/intermediate 90 Gy value is inside the broad source prescription range but still **fails the printed formula crosscheck**. High-risk fit derived from only **85 patients in 3 cohorts** in the figure.

**Decision (scientific safety):**
1. **Do not replace** HFC's 71/90 Gy and 90/95% values: they match the published *text and Figure 1*, but are not source-equation reproducible in low/intermediate risk.
2. **Do not declare low/intermediate Royce fitted TCP independently validated**. P2 discrepancy remains blocking until author clarification, source erratum, original analysis dataset or equivalent proof establishes which of the equation / Table 3 / curve is authoritative.
3. **Do not derive confidence bands** by guessing parameter covariance or use `γ≈0.284` as an alternative clinical fitted coefficient.
4. **2025 scientific correspondence exists:** Quan Chen, *In Regard to Royce et al.*, IJROBP 123(3):909, DOI **10.1016/j.ijrobp.2025.06.3898**, PMID **40998485**, specifically raises a *possible discrepancy in the low/intermediate model parameters* (accessible publisher abstract). Authors Panayiotis Mavroidis, Trevor Royce and Ronald Chen published *In Reply to Chen*, IJROBP 123(3):909–910, DOI **10.1016/j.ijrobp.2025.06.3899**, PMID **40998484**. **The reply's full text is not currently available in this reviewed source batch/publicly accessible snippets**. Do not assert an author-confirmed parameter correction or closure until that response is read from a legitimate primary copy. DOI/PMID links: https://pubmed.ncbi.nlm.nih.gov/40998485/ and https://pubmed.ncbi.nlm.nih.gov/40998484/ .
5. Version-control the numerical contradiction itself (positive assertion that published numbers are inconsistent) in regression tests so no unreviewed update can silently erase it.

## Audit matrix / completeness

| Model family | Published fit parameters and equation independently used | Reproduced HFC/printed points | Verdict |
|---|---|---|---|
| Soltys spinal 2y (previous P2 pass) | D50 19.44 Gy 3fx-eq, γ50 .8140, α/β6; supplemental logit | 8/8 to ≤1.70 pp | source text rounds some points to 90% |
| Vargo H&N 1/2/3y LC | D50+γ50 for 3 follow-ups, 5fx-eq α/β10 | **6/6, ≤0.07 pp** | numerically reproduced; 1y fit not significant |
| Grimm pooled vessel 5fx Dmax | TD50+γ50 log-logistic | **2/2, ≤0.031 pp** | numerically reproduced; risk confounding |
| Stumpf adrenal 1y LC | Poisson on EQD2_10 with source's gamma50 convention | **1/1, ≈0.019 pp** | reproduced, qualifier rounding |
| Royce prostate high-risk 5y | Source Poisson D50+γ | **2/2, ≤0.234 pp** | reproduced, 85 selected patients |
| Royce prostate low/intermediate 5y | Source Poisson D50+γ | **0/2, >11 pp** | **BLOCKING source inconsistency** |

**This is model-output reproduction from published rounded parameters, not model re-fitting to independently extracted clinical outcomes.** Confidence bands, patient-level DVHs, covariates, low/intermediate Royce discrepancy, 20-paper comprehensive HyTEC audit and 103-evidence full review are still outstanding. No dose coefficients or HFC mathematical engines were modified by this pass.
