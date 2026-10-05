# HFC — HypoFracCalc

HFC is an evidence-traceable radiobiology calculator under development for comparing photon radiotherapy fractionation schedules.

## Design goals

- Keep the mathematical core independent from the user interface.
- Treat **endpoint-specific clinical evidence** as data, not hard-coded constants.
- Keep the provenance and applicability of every biological parameter visible.
- Allow explicit user overrides without altering the curated evidence database.
- Distinguish EQD2-based proliferation parameters from BED-based time-loss parameters.
- Represent uncertainty and model-applicability warnings explicitly.
- Build treatment-gap and reirradiation workflows on top of the same audited core.
- Never silently invent a tissue parameter or clinical constraint.

## Current status

The project currently contains:

- LQ BED, EQDx and inverse calculations;
- explicit time/proliferation correction primitives;
- Thames-style incomplete-repair calculations;
- a draft versioned evidence dataset for photon EBRT;
- endpoint-specific alpha/beta selection with preferred, alternative and non-default records;
- manual parameter override provenance;
- selected repair half-time and Dprolif/Tk evidence;
- regression, integrity and end-to-end evidence-driven tests;
- GitHub Actions typecheck/test CI.

The evidence dataset is **draft** and is not yet a validated clinical release.

## Planned layers

1. **Core mathematics** — pure deterministic functions.
2. **Evidence layer** — estimates, confidence intervals, applicability and citations.
3. **Clinical workflow layer** — regimen comparison, treatment gaps, multiple fractions/day and later reirradiation.
4. **UI layer** — calculator, timeline and evidence inspector.
5. **Audit layer** — assumptions, source IDs, user overrides, warnings and reproducible calculation reports.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/EVIDENCE_MODEL.md](docs/EVIDENCE_MODEL.md) and [src/data/evidence/v0.1/README.md](src/data/evidence/v0.1/README.md).

## Scope

The initial clinical scope is **megavoltage photon external-beam radiotherapy**. Particle therapy, brachytherapy-specific dose-rate modelling and voxel-wise DICOM dose accumulation are future modules and must not be approximated by hidden assumptions in the v0.1 core.

## Safety / intended use

HFC is being developed as a transparent calculation and decision-support tool for qualified radiotherapy professionals. A numerical result is not a treatment prescription. Clinical use requires independent verification, local commissioning and documented governance.
