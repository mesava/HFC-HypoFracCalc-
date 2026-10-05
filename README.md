# HFC — HypoFracCalc

**HFC (HypoFracCalc)** is an evidence-traceable radiobiology website for photon external-beam radiotherapy.

The project started from the useful clinical ideas demonstrated by `hypo-calc`, but the HFC implementation is independent and is being designed around:

- endpoint-specific biological parameters;
- explicit source provenance;
- uncertainty and applicability warnings;
- treatment-course workflows;
- reproducible calculation/audit data;
- strict separation between mathematics, evidence and UI.

> HFC is a clinical decision-support / independent radiobiological calculator under development. It is **not** a treatment prescription system.

## Website status

The site currently contains:

| Module | Status | Main function |
|---|---|---|
| Home | implemented | Project/module overview |
| Quick EQD | implemented | BED, EQD2, alpha/beta evidence selection and manual override |
| Compare Regimens | implemented | 2–5 regimens, tumour + multiple OAR endpoints, delta EQD2 |
| Treatment Gap | v0.1 implemented | OTT, Dprolif/Tk, weekend/BID logic, tumour dose-compensation solver |
| Methodology | implemented | Model assumptions, dataset status and evidence governance |
| Reirradiation | planned | Cumulative equieffective dose and dose-accumulation strategies |

See [docs/SITE.md](docs/SITE.md) for website/deployment details.

## Core mathematics

The current photon LQ core contains:

```
BED = n d (1 + d/(alpha/beta))

EQDx = n d (d + alpha/beta)/(x + alpha/beta)
```

For EQD2, `x = 2 Gy`.

Implemented functions include:

- physical dose;
- BED;
- EQDx / EQD2;
- inverse EQD calculation;
- dose-per-fraction solution for a target EQD;
- incomplete-repair Thames Hm calculation;
- explicit overall-treatment-time correction primitives;
- high-dose LQ applicability warnings.

The mathematical core has no React/UI dependencies.

## Evidence-first parameter model

Biological parameters live outside calculation code.

The draft dataset currently includes:

- endpoint-specific alpha/beta estimates;
- 95% confidence intervals where available;
- evidence support level;
- preferred vs alternative vs non-default estimates;
- source DOI/PMID metadata;
- clinical applicability notes;
- repair half-time (T1/2) records;
- EQD2-based Dprolif and Tk records.

Examples already curated from the supplied literature include:

- prostate biochemical control — Vogelius & Bentzen 2020;
- rectal toxicity — CHHiP / Brand et al. 2021;
- GU toxicity — CHHiP / Brand et al. 2023;
- breast — FAST and FAST-Forward, including 10-year FAST-Forward 2026 data;
- head-and-neck tumour control and late effects;
- NSCLC;
- lung pneumonitis/fibrosis;
- bowel late effects;
- oral mucositis;
- skin/subcutaneous endpoints;
- oesophageal pathologic complete response;
- spinal-cord myelopathy alternatives.

A number reported by a paper is **not automatically a default**.

For example, spinal-cord alpha/beta currently has conflicting published human estimates in the curated set, so HFC requires an explicit selection or a manual value.

Dataset documentation:
[src/data/evidence/v0.1/README.md](src/data/evidence/v0.1/README.md)

## Manual override

For supported workflows the user can replace a curated parameter with a custom value.

Manual values:

- do not modify the evidence database;
- are stored as calculation-level inputs;
- are marked as `user-specified`;
- can carry a rationale.

This allows local-protocol or sensitivity-analysis values without corrupting source provenance.

## Uncertainty

HFC currently provides **one-parameter sensitivity**, not a claim of complete clinical uncertainty propagation.

For an alpha/beta estimate with a reported 95% CI, the calculation is repeated at the confidence limits.

If the alpha/beta confidence interval reaches or crosses 0 Gy:

- BED becomes unbounded as alpha/beta approaches zero;
- HFC reports an unbounded upper BED sensitivity;
- EQD2 uses its finite alpha/beta→0+ limit.

For Compare Regimens, delta-EQD2 sensitivity is **correlated**: the same alpha/beta boundary is applied to both compared schedules before taking the difference.

## Treatment Gap v0.1

The Treatment Gap workflow is based on the supplied RCR treatment-interruption guidance and Basic Clinical Radiobiology 2025.

Priority order represented in the UI:

1. preserve planned OTT and dose/fraction;
2. weekend recovery when feasible;
3. BID recovery when appropriate;
4. biological dose modification only when acceleration cannot solve the interruption.

Current RCR/BCR rules represented explicitly:

- RCR BID minimum: **6 h**;
- BCR 2025: use the maximum practical interval, about **8 h or more** when feasible;
- RCR: BID is not recommended when fraction size is significantly greater than **2.2 Gy**;
- linear Dprolif correction receives a warning for larger OTT extrapolations.

The first automatic time-loss default is the general HNSCC record:

```
Dprolif = 0.80 Gy EQD2/day
95% CI  = 0.50–1.10
Tk      = 21 days
```

The dose-compensation solver restores **tumour effective EQD2** for a user-defined final OTT and number of remaining fractions.

It does **not** infer OAR safety from prescription dose.

See [docs/TREATMENT_GAP.md](docs/TREATMENT_GAP.md).

## Architecture

```
src/
├─ core/
│  ├─ lq.ts
│  ├─ repair.ts
│  ├─ repopulation.ts
│  └─ validation.ts
│
├─ domain/
│  ├─ evidence.ts
│  └─ constraints.ts
│
├─ data/evidence/v0.1/
│  ├─ alphaBeta*.ts
│  ├─ repairHalfTime.ts
│  ├─ repopulation.ts
│  ├─ endpoints.ts
│  ├─ sources.ts
│  └─ manifest.ts
│
├─ evidence/
│  ├─ alphaBetaRegistry.ts
│  └─ repopulationRegistry.ts
│
├─ workflows/
│  ├─ evidenceLq.ts
│  ├─ compareRegimens.ts
│  └─ treatmentGap.ts
│
└─ ui/
   ├─ App.tsx
   ├─ SiteHome.tsx
   ├─ CompareRegimensView.tsx
   ├─ TreatmentGapView.tsx
   ├─ MethodologyView.tsx
   └─ styles.css
```

More detail:
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/EVIDENCE_MODEL.md](docs/EVIDENCE_MODEL.md)
- [docs/LITERATURE_REVIEW.md](docs/LITERATURE_REVIEW.md)

## Development

Requirements: Node.js 22+.

```bash
npm install
npm run dev
```

Validation:

```bash
npm run typecheck
npm test
npm run build
```

## Deployment

A GitHub Pages deployment workflow is included:

```
.github/workflows/deploy-pages.yml
```

It runs on pushes to `main` and publishes the Vite `dist/` build.

The repository must have GitHub Pages configured to use **GitHub Actions** as its source.

## Evidence/data versioning

Calculation engine and evidence data are versioned independently.

Example:

```
HFC engine:       0.x
Evidence dataset: 2026.10-v0.1
```

A historical calculation should ultimately remain reproducible even after the evidence database is updated.

## Scope

Current scope:

- megavoltage photon EBRT;
- LQ-based fractionation comparisons;
- treatment-course interruption modelling;
- evidence-traceable biological parameters.

Not yet included:

- proton/RBE modelling;
- brachytherapy dose-rate models;
- validated OAR-aware Treatment Gap compensation;
- voxel-wise DICOM EQD2 accumulation;
- reirradiation workflow;
- prescription or autonomous clinical recommendations.

## Intended use and safety

HFC is intended for qualified radiotherapy professionals as a transparent calculation and decision-support tool.

Clinical use requires:

- independent verification;
- local commissioning;
- documented governance;
- review of applicable dose-volume constraints;
- clinical judgement.

A mathematically equivalent BED/EQD2 result is not, by itself, evidence that two treatments are clinically interchangeable.

## License

MIT. See [LICENSE](LICENSE).
