# P2.7 — HyTEC Milano optic pathways: RION probit / клинические Dmax-пределы

**Дата:** 2026-10-08. **Статус:** source-level mathematical reproduction and applicability audit, NOT a patient-level validated NTCP calculator; HFC evidence remains `draft`.

## Primary source and provenance

Milano MT, Grimm J, Soltys SG et al. *Single- and Multi-Fraction Stereotactic Radiosurgery Dose Tolerances of the Optic Pathways.* `Int J Radiat Oncol Biol Phys`, **110(1):87–99**, DOI **10.1016/j.ijrobp.2018.01.053**. User-provided primary-library file is `HyTEC_07_Milano_2021_Optic_pathways_tolerance.pdf` but its current Files text index returned **no readable content** and raw-byte copy unavailable during this pass. For independent verification used **public AAPM author PDF** `https://www.aapm.org/pubs/protected_files/HyTEC/HyTEC_06_NTCP_Optic_20180116.pdf` (**Article in Press**, file PDF pp6–7 and **p9 Table 3**), checked visually for Table 3, and public paper text via **PMC9479557 / PubMed PMID29534899 / original journal**. The AAPM file's pagination is **not** automatically the pagination of the user-uploaded final PDF: retain this provenance distinction.

The source pools **34 studies / 1,578 patients** (only ~6% prior irradiation); studied endpoint **radiation-induced optic neuropathy (RION)** involving visual fields/acuity. Prior irradiation was associated with approximately **tenfold crude higher RION risk**, and the source explicitly states inadequate evidence to construct an individual **reirradiation NTCP model or dose recommendations**. This tenfold association **is not a numeric patient-specific dose-adjustment factor**.

## Distinct source curves — DO NOT CONFLATE

The paper derives two types of 1% RION-risk Dmax values. They must be described **as different fitted source-model populations**:

| Risk = 1% at RION in never-previously-irradiated optic structures | Total EQD2 (α/β=1.6 Gy) | 1 fraction | 3 fractions | 5 fractions |
|---|---:|---:|---:|---:|
| **All-study pooled model** (Table 3 top) | **46.0 Gy** | **12.1 Gy** | **20.0 Gy** | **25.1 Gy** |
| **1-fraction SRS-only fit** (Table 3 bottom) | **32.2 Gy** | **10.0 Gy** | — | — |
| **Authors' clinical recommended Dmax** (section 8) | Not a unique EQD2 row | **10 Gy** | **20 Gy** | **25 Gy** |

Thus the pooled modeled one-fraction threshold **12.1 Gy is NOT the recommended 1-fraction maximum**, which is **10 Gy**, corresponding to a separate source model and conservative author judgment. HFC already retains `hytec-optic-dmax-1fx-10gy`, `hytec-optic-dmax-3fx-20gy`, `hytec-optic-dmax-5fx-25gy`. Dmax is a maximum-dose/point metric, **not OAR mean dose or volumetric D0.5cc threshold**.

**Table 3 other pooled 1–5fx fitted levels:** 2% = 59.1 Gy EQD2_1.6 (13.8 Gy/1fx; 23.0 Gy/3fx; 28.9 Gy/5fx); 5% = 79.0 Gy EQD2_1.6 (16.1 Gy/1fx; 26.9 Gy/3fx; 33.9 Gy/5fx). They are **source-model predictions, not recommended planning limits**, and not added to HFC clinical constraints.

## Mathematical reproduction

Primary Eq. (probit) and its published all-study fitted parameters (AAPM PDF p6):

`NTCP = Phi(z); z = (EQD2_1.6 / TD50 - 1) * gamma50 * sqrt(2*pi)`

`TD50 = 157.3 Gy EQD2_1.6` (author-quoted param 95% CI 157.2–157.4); `gamma50 = 1.31` (95% CI 1.30–1.32). Dose conversion uses LQ:

`EQD2_1.6 = D * [(D/n)+1.6]/(2+1.6)`, where D is total Gy and n is number of fractions.

Independent numerical evaluation (normal cumulative distribution, ~10^-7 approximation error):

| Regimen / source condition | EQD2_1.6 | Recomputed pooled fitted risk |
|---|---:|---:|
| 10 Gy in 1fx | 32.222 Gy | **0.4513%** (pooled fit; separate 1fx-only fit predicts ~1%) |
| 12 Gy in 1fx | 45.333 Gy | **0.9711%** |
| **12.1 Gy in 1fx** | **46.047 Gy** | **1.0105%** |
| **20 Gy in 3fx** | **45.926 Gy** | **1.0037%** |
| **25 Gy in 5fx** | **45.833 Gy** | **0.9985%** |
| 21 Gy in 3fx | 50.167 Gy | **1.2661%** |
| 25.1 Gy in 5fx | 46.156 Gy | **1.0166%** |

Source Table 3 additionally provides 1%, 2%, and 5% **EQD2** rounded at **46.0/59.1/79.0 Gy**: source Eq. yields approximately **1.0078%/2.0184%/5.1073%**. The 5% difference of 0.1073 percentage points may reflect published rounded parameters or fitting/tabulation details; source has only low event counts and should not be treated as a high-precision individual risk model.

**Formal confidence intervals** around `TD50=157.3` and `gamma50=1.31` printed to two decimals must not be converted into apparently tight clinical confidence bands. Reported risk is sensitive to data extraction, model form, long follow-up, source α/β 1.6, SRS/fSRS equivalence assumptions, registration/point dose definitions and patient selection. `α/β=1.6 Gy` is **source fit provenance only**; it must NOT become a default for all optic toxicity or tissue endpoints in HFC.

## Clinical safety / follow-up

- **Previously irradiated patients**: no validated separate NTCP model or equivalent Dmax recommendations. The observed crude ~10× higher RION incidence is *not* a dose multiplier, fixed relative recovery model, or basis for importing never-irradiated 10/20/25 limits.
- **Alpha/beta sensitivity** is substantial: the authors note α/β=2.0 instead of 1.6 Gy changes pooled 1% modeled Dmax to **11.4 Gy/1fx, 18.6 Gy/3fx and 23 Gy/5fx**, again **not replacing** the more conservative 1-fx recommended limit.
- **Volume semantics:** optic/chiasm Dmax point is not Vx/D0.2cc; TG101 0.035cc and 0.2cc are different metrics and should not be substituted without matching source.
- **Risk at high fraction sizes and long delays**: scarce high-dose reports (single-fraction >13Gy), delayed RION >6–7 years and pooled historic heterogeneity may cause understated patient risk; model statistical significance is not independent clinical validation.

### Verifiable deliverables

- [Executable optic model test](../tests/hytecOpticRionReproduction.test.ts): pooled probit model, EQD2 transformation and 1%/2%/5% source levels, separate 1-fx-only 10Gy point and three unchanged HFC `ClinicalConstraint` planning limits, all with `priorRadiotherapy="none"`.
- Bilingual UI warning in `ClinicalConstraintsView` highlights **10 Gy recommended vs 12.1 Gy pooled modeled** and prior RT inapplicability.
- **No new clinical NTCP predictor, no changes in existing thresholds or dataset release state**. Independent second physicist/clinician review remains mandatory before P2 closure.
