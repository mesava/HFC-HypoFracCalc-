# HFC evidence dataset 2026.10-v0.1

Status: **draft**

This first evidence dataset covers photon EBRT and four clinical groups:

1. prostate tumour biochemical control;
2. late rectal toxicity after prostate EBRT;
3. late genitourinary toxicity after prostate EBRT;
4. breast tumour recurrence and late breast/chest-wall normal-tissue effects.

## Curation rules used in v0.1

- Parameters are keyed by **clinical endpoint**, not by organ alone.
- A numerical estimate can be retained even when it is not suitable for automatic default selection.
- `status: preferred` means that HFC may present that record as the preferred estimate for the **exact endpoint and applicability context**.
- `support` separately describes how strongly the source supports the numerical estimate.
- `defaultEligible: false` prevents automatic use even if a numerical alpha/beta was reported.
- Manual user values remain calculation-level overrides and never modify this dataset.

## Prostate

Vogelius & Bentzen (2020) pooled 14 randomized EBRT trials (13,384 patients):

- alpha/beta = **1.6 Gy**
- 95% CI **1.3–2.0 Gy**

This is the v0.1 preferred estimate for biochemical control, with explicit caveats:

- I² = 70%;
- study alpha/beta estimates increased with fraction size;
- the source discusses either non-constant fractionation sensitivity or saturation of biochemical control above roughly 80 Gy EQD2.

HFC must therefore show the estimate and its caveat together.

## Rectum — CHHiP

Brand et al. (2021) provides endpoint-specific late rectal estimates. The dataset retains all Table 3 LKB-EQD2 estimates, but assigns different support levels.

Examples:

| Endpoint | alpha/beta (Gy) | 95% CI | v0.1 handling |
|---|---:|---:|---|
| Bleeding G1+ | 1.6 | 0.9–2.5 | preferred, supported |
| Bleeding G2+ | 1.7 | 0.7–3.0 | preferred, limited |
| Stool frequency G1+ | 2.3 | 0.9–5.3 | preferred, limited |
| Stool frequency G2+ | 2.7 | 0.9–8.5 | preferred, limited |
| Pain G1+ | 3.6 | 0–839.6 | **not default**, poor fit |
| Proctitis G1+ | 2.7 | 1.5–5.4 | preferred, limited |
| Proctitis G2+ | 2.7 | 1.3–15.1 | preferred, limited |
| Sphincter control G1+ | 3.1 | 1.4–9.1 | preferred, limited |
| Stricture/ulcer G1+ | 2.5 | 0.9–8.2 | preferred, limited |

The source itself advises caution in collapsing these data into one universal rectal alpha/beta.

## Genitourinary — CHHiP

Brand et al. (2023) reports numerical fits for ten GU endpoint/grade combinations, but EQD2 correction significantly improved the non-EQD2 model for only three:

| Endpoint | alpha/beta (Gy) | 95% CI |
|---|---:|---:|
| Dysuria G1+ | 2.0 | 1.2–3.2 |
| Hematuria G1+ | 0.9 | 0.1–2.2 |
| Hematuria G2+ | 0.6 | 0.1–1.7 |

These three are default-eligible in v0.1.

The other reported numerical estimates are retained as reviewed evidence but **not auto-selected** because model improvement was absent or penalized model fit was worse and/or estimates were extremely imprecise.

This distinction is a deliberate HFC feature: “a paper reports a number” is not equivalent to “the number should become a clinical default”.

## Breast

### FAST 10-year

Preferred endpoint-specific late normal-tissue estimates include:

- photographic breast appearance: **2.7 Gy** (1.5–3.9);
- physician-assessed composite NTE: **2.5 Gy** (1.8–3.3);
- shrinkage: **2.7 Gy** (1.9–3.5);
- induration: **1.6 Gy** (0–4.4; limited);
- telangiectasia: **3.1 Gy** (2.3–3.9);
- edema: **1.9 Gy** (point estimate; CI not reported in Table 4).

Applicability note: the FAST 5-fraction schedules were delivered **once weekly over 5 weeks**.

### FAST-Forward 10-year (2026)

Appendix Table D5 provides:

- ipsilateral breast recurrence, adjusted model: **3.3 Gy** (1.9–4.9);
- ipsilateral breast recurrence, unadjusted: 3.4 Gy (1.6–5.2);
- any clinician-reported breast/chest-wall adverse effect: **2.1 Gy** (1.6–2.6).

The adjusted 3.3 Gy estimate is preferred for the tumour endpoint in v0.1.

## Next review step

Before this dataset can move from `draft` to `validated`:

- project owner reviews preferred/default decisions;
- source metadata are independently cross-checked;
- numerical records are regression-tested against the source tables;
- additional modern sources are added where they materially alter endpoint selection.
