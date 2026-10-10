# P3.8 — FAST 10-year (2020): independent seven-endpoint α/β source table check

**Дата: 10.10.2026. Статус: ORIGINAL PUBLIC ARTICLE full-text table transcription, WITHOUT original user-supplied PDF binary SHA, page image verification, reanalysis of 915 randomized participants or clinical approval.**

## Source and methods

Brunt AM, Haviland JS, Sydenham M et al. *Ten-Year Results of FAST: A Randomized Controlled Trial of 5-Fraction Whole-Breast Radiotherapy for Early Breast Cancer.* J Clin Oncol. 2020;38:3261–3272. DOI [10.1200/JCO.19.02750](https://doi.org/10.1200/JCO.19.02750); [original full open author publication at PMC7526720](https://pmc.ncbi.nlm.nih.gov/articles/PMC7526720/). **Table 4, printed journal p3270** is accessible as original article author's uploaded searchable text transcription [ResearchGate author manuscript](https://www.researchgate.net/publication/342937425_Ten-Year_Results_of_FAST_A_Randomized_Controlled_Trial_of_5-Fraction_Whole-Breast_Radiotherapy_for_Early_Breast_Cancer), lines around Table 4. This check is **not** a direct visual match against the `FAST_10y_JCO2020.pdf` bytes listed in the user-supplied collection; supplied corpus only has filename-level availability here.

- Trial randomized 915 women age ≥50, pT1–2 pN0 early breast cancer, post breast-conserving surgery, exclusion of chemotherapy, nodal RT, boost/mastectomy; regimens 50 Gy/25 daily fractions over five weeks; 30 Gy/5 **once-weekly** fractions over five weeks; 28.5 Gy/5 **once-weekly** over five weeks.
- Photographic appearance assessed at 2/5 years versus postsurgical pretreatment baseline; physician moderate/marked late NTE scored annually to 10 years. Authors performed generalized estimating equations (GEE); **α/β estimated as ratio of coefficients for total dose and total dose × fraction size** in fitted model; parametric 95% intervals.
- **FAST is not FAST-Forward.** The latter uses five fractions in one week, other cohort/techniques and endpoint/αβ estimates.

## Direct seven-row correspondence

The standalone [7-row source Table 4 crosswalk](P3_FAST_2020_TABLE4_SOURCE_CROSSWALK_2026-10.csv) contains **printed α/β and printed 95% CI, original published EQD2 for two 5fx regimens, source locator and clinical release flag**. Numerical values:
  
| Source endpoint | α/β Gy | Published 95% CI Gy | Source EQD2 Gy, 30/5 | Source EQD2 Gy, 28.5/5 |
|---|---:|---:|---:|---:|
| Photographic mild/marked unadjusted | 2.7 | 1.5–3.9 | 55.7 | 51.0 |
| Photographic adjusted (breast size/surgical deficit) | 2.5 | 1.1–3.9 | 56.4 | 51.7 |
| Physician any moderate/marked NTE | 2.5 | 1.8–3.3 | 56.4 | 51.7 |
| Physician breast shrinkage | 2.7 | 1.9–3.5 | 55.5 | 50.9 |
| Physician breast induration | 1.6 | **0–4.4** | 63.7 | 58.1 |
| Physician telangiectasia | 3.1 | 2.3–3.9 | 53.5 | 49.1 |
| Physician breast edema | 1.9 | **not reported** | 60.3 | 55.2 |

**7/7 source α/β values agree with HFC. 6/6 source reported intervals match, and the seventh (edema) properly has no `ci95`.** For induration the authors expressly explain that calculated *negative* lower confidence limits were **truncated at zero** (Section Statistical Considerations + Table 4 note c). Do not treat lower `0` as a precisely established biological bound. No parameter edits.

## Independent dose arithmetic (not a refit)

The published table gives EQD2 for 30 Gy/5 (d=6 Gy) and 28.5 Gy/5 (d=5.7 Gy). Under a standard single-component LQ model, `EQD2 = D × (d+α/β)/(2+α/β)`. The regression test computes both from **rounded printed α/β** and compares them against the original table **within 0.6 Gy**. This bounded comparison is a *rounding plausibility check*, not a new acceptance criterion for the model. For example, photographic source `α/β=2.7` and `EQD2(30/5)=55.7` while recomputation at exactly 2.7 gives **55.53**; small disagreement is expected when the published α/β is rounded to one decimal and authors use fuller precision in table calculations. No source data altered to force exact equality.

The FAST trial was not powered to compare local cancer control and has only 11 ipsilateral breast events overall at 9.9-year median follow-up. Its **late normal-tissue α/β values should not be marketed as tumour α/β, nor as validation of clinical SBRT EQD2 constraints**.

## Scientific release gates

7 records move from general P3 pending to `p3_external_primary_fulltext_table4_numeric_checked_pdf_binary_pending`. In distinction from earlier P3.1 user-supplied original PDF table audits, this pass is based on original published open article and author table text, not verified original binary. All `clinical_release_approved=false`; current `defaultEligible` remains untouched. Need source PDF SHA and independent page visual, GEE score data and CI reconstruction and clinician physicist review. The system stays `draft` and PR #60 unmerged.

P3 pending now 20: **17 other α/β and 3 repopulation**; user-supplied file available 6 of these 20, absent 14; total file coverage across 103 remains 73/103.
