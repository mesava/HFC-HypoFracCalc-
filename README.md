# HFC — HypoFracCalc

HFC is an evidence-traceable radiobiology calculator under development for comparing radiotherapy fractionation schedules.

## Design goals

- Keep the mathematical core independent from the user interface.
- Treat **endpoint-specific clinical evidence** as data, not hard-coded constants.
- Keep the provenance of every biological parameter visible.
- Allow the user to override a curated biological parameter explicitly without altering the evidence database.
- Distinguish EQD-based proliferation parameters from BED-based proliferation parameters.
- Represent uncertainty and model-applicability warnings explicitly.
- Build treatment-gap and reirradiation workflows on top of the same audited core.
- Never silently choose a tissue parameter or clinical constraint.

## Current status

This repository is at **v0.1 architecture stage**. The first implementation contains:

- LQ BED and EQD calculations;
- inverse EQD calculations;
- explicit time/proliferation correction primitives;
- Thames-style incomplete-repair factor for equally spaced fractions;
- typed evidence and clinical-constraint schemas;
- evidence-selected vs user-specified parameter provenance;
- regression tests based on published worked examples.

No clinical parameter database is enabled as a default yet. Evidence curation will be versioned separately from calculation code.

## Planned layers

1. **Core mathematics** — pure deterministic functions.
2. **Evidence layer** — parameter estimates, confidence intervals, applicability domains and citations.
3. **Clinical workflow layer** — schedule comparison, treatment gaps, multiple fractions/day, later reirradiation.
4. **UI layer** — calculator, timeline and evidence inspector.
5. **Audit layer** — assumptions, source IDs, user overrides, warnings and reproducible calculation report.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/EVIDENCE_MODEL.md](docs/EVIDENCE_MODEL.md).

## Scope

The initial clinical scope is **megavoltage photon external-beam radiotherapy**. Particle therapy, brachytherapy-specific dose-rate modelling and voxel-wise DICOM dose accumulation are future modules and must not be approximated by hidden assumptions in the v0.1 core.

## Safety / intended use

HFC is being developed as a transparent calculation and decision-support tool for qualified radiotherapy professionals. A numerical result is not a treatment prescription. Clinical use requires independent verification, local commissioning and documented governance.
