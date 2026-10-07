# HFC ↔ Hypo-Calc functional parity

## Purpose

The original Hypo-Calc web application described by Batyan et al. (2023) is an important historical starting point for browser-based LQ calculations in this project domain.

Reference:

Batyan A, Dziameshka P, Hancharova K, Lemiasheuski V, Orgish A. *Linear Quadratic Model in the Clinical Practice via the Web-Application*. In: Radiation Therapy. IntechOpen; 2023. DOI: 10.5772/intechopen.109621.

HFC does **not** copy the original application's hidden defaults or treat its examples as current clinical recommendations. The publication is used for:

- functional parity checks;
- regression examples where the numerical assumptions are explicit;
- teaching examples in «Как пользоваться?»;
- documenting where HFC intentionally requires more explicit evidence/context.

## Functional mapping

| Hypo-Calc function | HFC |
|---|---|
| BED / EQD₂ | Quick BED/EQD₂ |
| Isoeffective dose | Target EQD₂ solver |
| Number of fractions by manual selection | Target EQD₂ solver — analytical n + nearest integer schedules |
| Modified schedule | Interactive Calendar + Course Correction |
| Unscheduled interruption | Treatment Gap |
| Reduced treatment time / Saturday treatment | Interactive Calendar + Treatment Gap |
| Multiple fractions/day / incomplete repair | Interactive Calendar + Thames Hm |
| Dose-delivery error correction | Course Correction |
| α/β reference table | Endpoint-specific versioned evidence registry |
| T½ reference table | Endpoint-specific repair registry |
| Dprolif | Endpoint-specific Dprolif/Tk registry |

HFC additionally includes Compare Regimens, RCR regimen library, Clinical Constraints, HyTEC clinical outcomes, Reirradiation, structured audit export/replay, evidence versioning, CI/browser/visual QA, and RU/EN interface.

## Published examples used as numerical regression tests

### 1. Isoeffective regimen

Reference schedule: 30 × 2 Gy → EQD₂ = 60 Gy.

18-fraction solution:

- α/β = 3 Gy → 2.849... Gy/fx → 2.85 Gy/fx;
- α/β = 10 Gy → 3.062... Gy/fx → 3.06 Gy/fx.

### 2. Number of fractions

Target EQD₂ = 50 Gy at d = 2.67 Gy/fx:

- α/β = 4.6 Gy → exact n ≈ 17.001 → nearest 17;
- α/β = 8.8 Gy → exact n ≈ 17.633 → nearest 18;
- α/β = 1.7 Gy → exact n ≈ 15.855 → nearest 16.

Unlike the source application, HFC solves n analytically rather than requiring manual trial-and-error.

### 3. Missed fraction with fixed finish date

Plan: 5 × 5 Gy, α/β = 10 Gy.

After 2 delivered fractions, only 2 treatment fractions remain available before the required finish date.

HFC solves the remaining biological target:

- required dose ≈ 6.726 Gy/fx → 6.73 Gy/fx.

### 4. Dose-delivery error

Plan: 33 × 2 Gy, α/β = 10 Gy.

Actually delivered: 20 × 1.8 Gy.

- planned EQD₂ = 66 Gy;
- delivered EQD₂ = 35.4 Gy;
- remaining EQD₂ = 30.6 Gy;
- 13 remaining fractions require d ≈ 2.297 Gy/fx → 2.30 Gy/fx.

These four cases are implemented in `tests/hypocalcParity.test.ts`.

## Examples kept as teaching/context rather than fixed numerical regression targets

The publication also demonstrates:

- a two-week H&N interruption;
- six fractions/week / Saturday compensation;
- BID with incomplete repair and spinal-cord evaluation.

HFC does not hard-code the article's final numbers for these cases because the result depends on biological assumptions such as Dprolif, Tk, T½ and endpoint-specific α/β. Those values are explicit, versioned inputs in HFC rather than hidden universal defaults.

The workflows themselves are regression-tested independently:

- Treatment Gap calendar and Dprolif/Tk;
- weekend/BID compensation;
- OAR-aware incomplete repair;
- free Interactive Calendar including BID/TID.

## Parity criterion

HFC may be described as a functional superset of the original Hypo-Calc only when:

1. the original LQ/course-modification use cases remain reproducible;
2. source assumptions are not silently inherited;
3. HFC safety/evidence layers remain explicit;
4. regression tests protect the historical parity examples.
