# Evidence model

## Goal

HFC must be able to answer:

> Why was this biological parameter or clinical constraint used?

Every value therefore carries provenance, uncertainty and applicability metadata.

## Parameter families

### Alpha/beta

An alpha/beta record is linked to a **specific clinical endpoint**, not merely an organ.

Required fields:

- endpoint ID;
- estimate in Gy;
- confidence interval when available;
- tumour vs normal-tissue role;
- source ID;
- population/context;
- modality/radiation quality;
- evidence status;
- applicability notes.

### Repair half-time

Required fields include endpoint, T1/2 in hours, interval/qualifier if the paper reports a range or lower bound, source and experimental/clinical context.

### Repopulation

The record must state whether the rate is:

- `EQD2`-based Dprolif, or
- `BED`-based K.

It may additionally carry `Tk`/delay time. A rate without a declared basis is invalid.

## Evidence lifecycle

Each record has a curation state:

- `candidate` — extracted but not independently checked;
- `reviewed` — checked against the source;
- `preferred` — explicitly selected for a defined use/context;
- `deprecated` — retained for reproducibility but should not be offered by default.

A newer publication does not automatically delete an older estimate. Multiple estimates can coexist.

## Applicability domain

A record may describe:

- dose-per-fraction range represented by the source data;
- fraction-count range;
- treatment technique;
- disease stage/site;
- endpoint grade and scoring system;
- prior irradiation status;
- follow-up interval;
- concurrent systemic therapy;
- important modifiers or model assumptions.

## Clinical constraints

Dose-volume/outcome evidence is separate from radiobiological parameter estimates.

A constraint record can represent metrics such as:

- Dmax / near-maximum dose;
- D0.03 cc, D0.1 cc, D1 cc, D2 cc;
- mean dose;
- Vx;
- fractionation-specific risk level;
- prior-RT context.

This separation is needed for HyTEC, where a clinical risk statement cannot safely be collapsed into an organ-level alpha/beta value.

## Dataset governance

Every released evidence dataset should contain:

- dataset version;
- evidence cut-off date;
- reviewer(s);
- source list;
- change log;
- machine-readable validation report.

No change to a preferred parameter should occur without a documented evidence-dataset change.
