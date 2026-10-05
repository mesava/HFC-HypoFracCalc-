# HFC evidence dataset 2026.10-v0.1

Status: **draft**

This is the first evidence-traceable dataset for photon EBRT. It contains endpoint-specific alpha/beta estimates plus selected repair half-times and EQD2-based repopulation parameters.

## Curation rules

- Parameters are keyed by **clinical endpoint**, not by organ alone.
- `status` describes the curation lifecycle; `support` separately describes strength/stability of the numerical estimate.
- `defaultEligible: false` prevents automatic use even when a publication reports a number.
- A secondary-source record remains visibly secondary until its originating paper is independently curated.
- Manual user values are calculation-level overrides and never modify the dataset.
- A clinical dose-volume constraint is not treated as an alpha/beta estimate.

## Current alpha/beta coverage

### Modern primary-data groups

- Prostate biochemical control — Vogelius & Bentzen 2020.
- Rectal late toxicity — Brand et al. 2021 CHHiP endpoint-specific models.
- GU late toxicity — Brand et al. 2023 CHHiP; only dysuria G1+, hematuria G1+ and hematuria G2+ are auto-default eligible.
- Breast tumour and late normal-tissue effects — FAST 10-year and FAST-Forward 10-year 2026.

### Additional photon endpoints

The draft now also includes selected evidence for:

- oral/oropharyngeal mucositis;
- skin erythema and telangiectasia;
- subcutaneous fibrosis;
- bowel late effects;
- lung pneumonitis and radiological fibrosis;
- head-and-neck tumour control and composite late effects;
- stage I NSCLC local control;
- oesophageal pathologic complete response in the preoperative chemoradiotherapy context;
- spinal-cord radiation myelopathy.

The spinal-cord case deliberately has **no automatic preferred alpha/beta**: published human estimates in the curated sources differ materially (including 0.87 Gy and 3.7 Gy), while Basic Clinical Radiobiology also discusses other historical/experimental values. HFC therefore requires an explicit evidence choice or manual override.

## Repair half-time

The draft includes CHART-derived point estimates for:

- laryngeal edema: 4.9 h [3.2–6.4];
- skin telangiectasia: 3.8 h [2.5–4.6];
- subcutaneous fibrosis: 4.4 h [3.8–4.9].

Ranges or lower bounds such as oral mucositis 2–4 h, spinal-cord myelopathy >5 h and temporal-lobe necrosis >4 h are retained as non-default evidence rather than converted into arbitrary point values.

## Repopulation / overall treatment time

All current time-loss records explicitly state their biological-dose basis. The first dataset uses **EQD2-based Dprolif** records.

The only automatic treatment-gap default currently enabled is the well-described general HNSCC record:

- Dprolif = 0.80 Gy/day [0.50–1.10];
- Tk = 21 days.

Other published estimates — including prostate, breast, NSCLC, oesophagus, mucosa, skin and medulloblastoma — remain available for review/sensitivity analysis but are not silently applied.

## Important uncertainty rule

If a reported alpha/beta confidence interval reaches or crosses 0 Gy, HFC does not insert zero into the BED equation. BED is reported as having an unbounded upper sensitivity limit as alpha/beta approaches zero, while EQD2 uses its finite alpha/beta→0+ limit.

## Release gate

Before promotion from `draft` to `validated`:

- project owner reviews all preferred/default decisions;
- remaining secondary-source records are checked against primary papers where clinically important;
- numerical values and metadata are independently cross-checked;
- regression tests reproduce source examples/tables where feasible;
- intended-use, commissioning and local governance documentation is completed.
