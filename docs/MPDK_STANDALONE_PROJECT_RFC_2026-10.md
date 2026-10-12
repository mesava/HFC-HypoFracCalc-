# RFC: Medical Physics Development Kit (MPDK) as an independent open-source project

Status: PROPOSAL (2026-10-11). This document is a blueprint; no separate GitHub repository has yet been created.

## Mission and audience
A vendor-neutral, model-neutral, open-source set of reusable, machine-auditable instructions, validators, and evidence templates for scientific software engineering in radiotherapy medical physics. For medical physicists, scientific programmers and research QA teams. **Not** a treatment planning system, certified medical device, patient-level risk engine, or clinical prescription tool.

## Proposed repository structure
```
medical-physics-development-kit/
  README.md
  LICENSE
  SECURITY.md
  CONTRIBUTING.md
  AGENTS.md
  skills/
    scientific-review/SKILL.md
    independent-calculation/SKILL.md
    regression-review/SKILL.md
    evidence-curation/SKILL.md
    release-gate/SKILL.md
  adapters/
    hfc/
    biort/
    reference-dosimetry/
  templates/
    source-ledger/
    model-card/
    independent-reference-case/
    release-review/
  packages/guard/
  examples/synthetic/
  tests/
  .github/workflows/
```

## Architecture
- Core: domain checklists; input/output contracts; evidence traceability states; errors and severities.
- Adapters: per-repository protected paths, supported test commands, key scientific models, release topology and documentation locations.
- Runtime: deterministic command-line validation, provenance schemas, evidence reports and synthetic fixtures.
- Agents: AGENTS.md and portable skills consumable by compatible coding agents; **no claim of native installation in ChatGPT**.
- Governance: independent scientific review, recorded exceptions, human approval, release artifacts and audit trail.

## Initial medical physics domains
1. Radiobiology: LQ, BED, EQD2, time corrections, TCP/NTCP and fractionation.
2. Reference dosimetry: TG-51/TRS-398 Rev.1, chambers, beam quality, geometry and uncertainty; cite protocol revision.
3. DICOM dose/DVH: RTSTRUCT/RTDOSE coordinate geometry, interpolation, ROI contour and mask semantics.
4. Later: brachytherapy source strength, kV HVL, Monte Carlo benchmarks and linac QA measurement provenance.

## MVP acceptance criteria
- Five usable, versioned and host-portable skills with scope, anti-patterns and testable outputs.
- Deterministic CLI guard with passing positive/negative tests and documented bypass limits.
- At least one independently derived synthetic numerical case per supported medical physics domain.
- Reproducible schema for source records, endpoints, units and medical review sign-off.
- No patient data, secrets, copyrighted original full-text papers or unverifiable "validated" claims.
- Clear installation, maintenance and versioning documentation; independent expert feedback before v1.0.

## Roadmap
- **v0.1 / HFC pilot:** governance policy, five skill workflows and procedural changed-file checks.
- **v0.2:** machine-validated evidence, endpoint and dose-metric contracts.
- **v0.3:** independent reference calculations and PR scientific delta report.
- **v0.4:** BioRT and reference dosimetry adapters with per-domain scientific checks.
- **v1.0:** public reviewed CLI, synthetic benchmarks, documentation and tagged reproducible release.

## Science and release risk
A successful automated gate does not validate physical dose, clinical endpoints, image geometry or dose response models. Only qualified independent reviewers can approve release appropriateness within defined scope. A regulatory assessment would be required before any medical-device claims or patient-facing clinical deployment.

## Licensing and relation to ECC
Propose MIT or Apache-2.0 for original MPDK material, subject to owner choice. ECC has an MIT repository license. If any ECC source is copied rather than only its ideas, preserve the applicable notices and verify licensing of the individual contribution. MPDK is independent and must not imply endorsement by ECC, AAPM, ESTRO, IAEA or any vendor.
