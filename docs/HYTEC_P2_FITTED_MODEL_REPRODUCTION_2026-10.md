# P2 — Independent reproduction of published HyTEC TCP/NTCP fits (2026-10-08)

**Status: scientific cross-check, NOT patient-specific continuous TCP/NTCP feature, NOT independent clinical commissioning.**

The calculations below transcribe formulas and parameter tables from the source papers and compare them with *selected quoted points*. These models do not imply a right to interpolate/extrapolate beyond their clinical samples. The figures' **95% profile-likelihood parameter confidence intervals cannot be independently substituted at endpoints to recreate the fitted curve's 95% confidence band** (covariances, fitting data and construction method would be required).

Independent executable source-labelled fixtures: [`tests/hytecFittedModelsIndependent.test.ts`](../tests/hytecFittedModelsIndependent.test.ts).

## 1. Grimm et al. 2021: severe head/neck major-vessel bleeding (NTCP)

**Original:** `HyTEC_12_Grimm_2021_Carotid_blowout_tolerance.pdf`, PDF p.7 section 6 formula, p.8 Table 2, p.8 section 8.

HyTEC **pooled** data: n=238; endpoint grade 3–5 bleeding event (BE), *not* necessarily proven radiation-induced carotid blowout; axis is current **SBRT major-vessel Dmax, five-fraction-equivalent Gy**, without spatially added earlier conventional RT doses. Authors describe a nominal prior course near 70 Gy as a cohort limitation.

\[
NTCP(D)=\frac{1}{1+(TD_{50}/D)^{4\gamma_{50}}}.
\]

- `TD50=45.7 Gy (95% CI 39.6–64.9)`; `γ50=1.1817 (0.65–1.8)`.
- At **Dmax 20 Gy** => **1.9723%** (HFC ≈2%).
- At **Dmax 30 Gy** => **12.0308%** (HFC ≈12%).
- Reproduction **matches both HFC risk points** within 0.04 percentage points. Distinct D0.5cc <20 Gy is an author guidance objective, not the same fitted Dmax risk curve.

## 2. Vargo et al. 2021: recurrent head/neck SBRT local control (TCP)

**Original:** `HyTEC_11_Vargo_2021_Head-neck_reirradiation_TCP.pdf`, PDF p.6 mathematical methods, p.7 Table 4 and Fig.2. Dose axis: **5-fraction-equivalent total dose** calculated by LQ with nominal α/β=10 Gy; endpoint changes by follow-up duration.

\[
TCP(D)=\frac{1}{1+\exp[-4\gamma_{50}(D/D_{50}-1)]}.
\]

| Time | D50 (95% CI), Gy | γ50 (95% CI) | Source dose, 5fx equiv. | Model result | HFC rounded |
|---|---|---|---:|---:|---:|
| 1 year | 25.5 (3.0, upper unbounded) | 0.17 (−0.09–0.45) | 25.6 | 50.067% | ≈50% |
| 1 year | same | same | 40.7 | 59.997% | ≈60% |
| 2 years | 45.1 (39.1–71.5) | 0.56 (0.27–0.85) | 45.1 | 50.000% | ≈50% |
| 3 years | 49.8 (43.7–72.8) | 0.94 (0.49–1.43) | 26.8 | 14.975% | ≈15% |
| 3 years | same | same | 44.4 | 39.946% | ≈40% |
| 3 years | same | same | 49.8 | 50.000% | ≈50% |

The independently evaluated logistic function **reproduces 6/6 selected HFC point estimates** to better than 0.07 pp. **Important:** 1-year pooled response fit is not statistically significant; the source discusses model P=.096 and median-split P=.0685. Not enough to claim a validated early-time patient-specific TCP.

## 3. Stumpf et al. 2021: adrenal-metastasis local control (Poisson TCP)

**Original:** `HyTEC_18_Stumpf_2021_Adrenal_TCP.pdf`, PDF p.7 Eq.1/Fig.1, p.8 Discussion; separate Figure 2 is **overall survival**, with different fit coefficients and must not be mixed with local control.

For one-year local control with `D50(EQD2_10)=34.6 Gy (27.1–45.4)`, `γ50=0.4996 (0.248–0.814)`:

\[
TCP(D)=2^{-\exp\left[\frac{2\gamma_{50}}{\ln 2}\left(1-\frac{D}{D_{50}}\right)\right]},
\quad D=EQD2_{10}.
\]

- From `BED10=116.4 Gy`, conversion gives `EQD2(α/β=10)=116.4/1.2=97.0 Gy`.
- Eq.1 at 97.0 Gy predicts **94.9809%** (≈95%). The source text describes **greater than 95%** at *approximately* 116.4 Gy10, therefore exact model reproduction yields essentially the intended boundary. HFC retains original inequality symbol `>`, not an invented extra significant figure.
- Extrapolation, GTV dose coverage and patient histology require clinical context; **NOT** a universal dose prescription.

## 4. Royce et al. 2021: prostate five-year biochemical FFBR — CRITICAL OPEN DISCREPANCY

**Original:** `HyTEC_19_Royce_2021_Prostate_TCP.pdf`, visually checked original **PDF p.6 Eq.2/Table 3 and p.7 Figure 1** against publisher/AAPM PDF `https://www.aapm.org/pubs/protected_files/HyTEC/21/HyTEC_19_TCP_Prostate.pdf`.

The printed formula is:

\[
TCP(D)=2^{-\exp\left[e\gamma(1-D/D_{50})\right]},\quad D=EQD2_{1.5};
\]

the symbol `e` is Euler's number, **not** an exponent invented by the HFC code. Table 3 lists low/intermediate `D50=20.6 Gy (18.9–22.3)`, `γ=0.15 (0.13–0.17)`, high-risk `D50=84.2 Gy (81.4–86.8)`, `γ=4.50 (2.82–6.53)`.

| Risk subgroup | EQD2_1.5, Gy | Article quoted | Calculated from printed Eq.2/Table 3 | Difference, percentage points |
|---|---:|---:|---:|---:|
| Low / intermediate | 71 | ≈90% | **77.44%** | **−12.56** |
| Low / intermediate | 90 | ≈95% | **83.90%** | **−11.10** |
| High | 97 | ≈90% | **89.77%** | −0.23 |
| High | 102 | ≈95% | **94.91%** | −0.09 |

**Diagnostic:** high-risk values are reproduced from exactly the same printed Eq.2, so a gross transcription/implementation error in that formula is unlikely. Low/intermediate model *published parameters cannot reproduce the text/figure estimates*. This is a **source-level contradiction pending resolution**, **not** a proven error in the HFC transcribed endpoint values. HFC has no continuous Royce TCP calculator, only point estimates derived from the authors' own narrative, so no patient-specific prediction is silently computed from either parameter set.

**Independent subsequent literature (NOT among the original 69 local files):**
- **Quan Chen (2025)**, *In Regard to Royce et al*, IJROBP 123:909, DOI [10.1016/j.ijrobp.2025.06.3898](https://doi.org/10.1016/j.ijrobp.2025.06.3898). Public metadata/abstract opening explicitly raises a possible discrepancy in low/intermediate risk model parameters.
- **Mavroidis, Royce & Chen (2025)**, *In Reply to Chen*, IJROBP 123:909–910, DOI [10.1016/j.ijrobp.2025.06.3899](https://doi.org/10.1016/j.ijrobp.2025.06.3899), PMID 40998484. Reply **exists**, but its substantive full text was **not accessible**, thus no claim is made whether it corrects Table 3, Eq.2, or original model predictions. Acquire reply text and check for formal corrigendum before deciding.
- Independently, EQD2=71 Gy is below the article's observational domain ~80 Gy, previously tagged `extrapolated=true`; EQD2=90 Gy is *within* overall plotted data dose range but its reported 95% still fails this exact formula/parameter crosscheck.

**Action:** both low/intermediate HFC points now have explicit source-discrepancy `notes`, and the OutcomeModel carries an applicability warning; a bilingual UI warning will be/has been added. **Do NOT silently replace 90/95% with 77/84%, nor change parameters without the 2025 author reply and a medical physicist review.**

## Status summary

| Fit | Independently executable source equation? | HFC anchors reproduced? | Clinical validation? |
|---|---|---|---|
| Grimm five-fraction pooled BE | yes | 2/2 | No, heterogeneous reirradiation cases |
| Vargo 1/2/3-year HN local control | yes | 6/6 | No, 1-year fit weak; target-volume confounders |
| Stumpf adrenal 1-year LC | yes | ~95% at BED10 116.4 | No, model/CI remain cohort-bound |
| Royce high-risk 5-year FFBR | yes | 2/2 | No, small/highly selected cohort |
| Royce low/intermediate 5-year FFBR | yes | **0/2 — discrepancy ~11–13 pp** | **BLOCKED pending 2025 reply review** |

Completing point reproduction does not reconstruct patient-level likelihoods, study selection, statistical goodness-of-fit or *95% confidence bands*. Such validation is beyond this regression pass; the full P2 remains open.

