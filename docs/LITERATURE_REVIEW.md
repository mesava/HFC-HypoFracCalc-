# Literature review — architecture input

This document records how the supplied literature changes the HFC design. It is not yet the final clinical parameter dataset.

## Core LQ / clinical radiobiology

**Joiner & van der Kogel, Basic Clinical Radiobiology, 6th ed. (2025)**

Role in HFC:

- primary mathematical/clinical framework for LQ, BED and EQD2;
- endpoint-specific parameter philosophy;
- incomplete-repair framework;
- Dprolif/Tk time correction;
- uncertainty and model-applicability rules.

Key architecture consequence: no generic organ-only alpha/beta table.

## Endpoint-specific alpha/beta evidence

### Vogelius & Bentzen 2020 — prostate

Meta-analysis supports a low prostate alpha/beta estimate around 1.6 Gy, but also reports substantial heterogeneity and a relationship between estimated alpha/beta and experimental fraction size.

**HFC consequence:** store estimate, CI, heterogeneity/model caveats and validity domain. Do not present 1.6 Gy as an unconditional universal constant.

### Brand et al. 2021 — rectal toxicity

Different late rectal endpoints produce different alpha/beta estimates; e.g. bleeding and sphincter-control estimates are materially different.

**HFC consequence:** `Rectum` alone is not a valid parameter key. Endpoint and grade are required.

### Brand et al. 2022/2023 — GU toxicity

Strong fractionation dependence was supported for only a subset of GU endpoints (notably dysuria and haematuria).

**HFC consequence:** the database must support “no robust estimate / no model improvement” rather than forcing an alpha/beta value for every endpoint.

## Breast hypofractionation

### FAST 10-year (2020)

Provides endpoint-specific estimates for late normal-tissue effects and supports the radiobiological plausibility of five-fraction schedules.

### FAST-Forward 5-year (2020) and 10-year (2026)

The 10-year analysis provides long-term clinical validation of 26 Gy in five daily fractions and new model-derived alpha/beta estimates for ipsilateral breast recurrence and clinician-reported breast/chest-wall effects.

**HFC consequence:** evidence datasets need date/version provenance. A 2025 textbook snapshot cannot be treated as a permanently frozen truth.

## HyTEC

The HyTEC collection is best represented as a separate **high-dose clinical evidence layer**, not as a collection of generic alpha/beta constants.

It supplies:

- TCP/NTCP and dose-response models;
- dose-volume metrics;
- fractionation-specific tolerance evidence;
- high-dose biological caveats;
- explicit model/extrapolation uncertainty.

**HFC consequence:** introduce `ClinicalConstraint` / `OutcomeModel` records that retain dose metric, fraction number, endpoint, risk estimate and prior-RT context.

## Reirradiation

### ESTRO–EORTC consensus 2022

Provides a definition/classification framework:

- type I: geometrical overlap with a previously irradiated volume;
- type II: no geometrical overlap, but cumulative dose raises toxicity concerns.

**HFC consequence:** reirradiation is a course-level workflow with classification and documentation, not merely `EQD2_1 + EQD2_2`.

### RCR Principles of Reirradiation 2024

Supports:

- BED/EQD2 conversion of previous and proposed dose;
- explicit documentation of alpha/beta and any recovery assumption;
- caution with registration and recovery uncertainty;
- independent checking;
- rejection of physical-dose-only summation for cumulative biological assessment.

### Appelt et al. ESTRO consensus on cumulative dose (accepted 2025 / Radiotherapy & Oncology 2026)

The 35 consensus statements strongly shape the future reirradiation engine:

- use full DICOM data when available;
- use point-dose conservative strategies when registration is unreliable;
- radiobiologically rescale to EQD2/BED before cumulative OAR summation;
- keep tissue-specific alpha/beta consistent across courses;
- if recovery is assumed, apply it to the previous equieffective dose and document it;
- do not quantitatively sum physical 3D dose distributions;
- expose registration/dose uncertainty;
- require documentation, peer review and QA.

### Zhang et al. ReCOG case guide 2026

Demonstrates three practical cumulative-dose strategies:

1. direct point-dose summation;
2. point dose in the overlap region;
3. image-registration-based 3D equieffective accumulation.

**HFC consequence:** implement cumulative dose through interchangeable strategies, with a common audit output.

## Clinical regimen library

**RCR Dose Fractionation, 4th ed. (2024)** is suitable for:

- regimen presets;
- site/intent/fractionation metadata;
- regression/golden tests.

A preset is not a model parameter and should never silently choose an alpha/beta value.

## Literature still to add

Before declaring `evidence-v1` complete, add and review:

- the 2026 ReCOG core consensus statement (Paradis et al., Lancet Oncology);
- the 2026 systematic review/reappraisal of alpha/beta (Samai & Berremdani);
- the final RCR fifth edition of *Timely Delivery of Radical Radiotherapy* when published.

Until the final RCR update is released, the 2019 fourth edition remains the current treatment-interruption guidance source used for regression examples.
