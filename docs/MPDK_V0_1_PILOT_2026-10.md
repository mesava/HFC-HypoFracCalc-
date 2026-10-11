# MPDK v0.1 pilot for HFC

Date: 2026-10-11. Status: DRAFT governance-only experiment.

## Purpose and boundaries
Add explicit instructions, five project-scoped domain workflows, and a deterministic pull-request gate. No modifications to src/, models, evidence records, UI, clinical numerical constants, package.json, main, develop or scientific PR #60.

## File conventions
- AGENTS.md — read-first instructions for compatible coding agents.
- .agents/skills/*/SKILL.md — portable on-demand scientific workflows.
- scripts/mpdk-guard.mjs — checks companion file *presence* when protected scientific paths are modified.
- scripts/mpdk-guard.node-check.mjs — synthetic red/green checks of the guard itself.
- .github/workflows/mpdk-governance.yml — runs guard tests and evaluates a PR diff against its base.
- docs/MPDK_ECC_CAPABILITY_AUDIT_2026-10.md — targeted upstream inventory.
- docs/MPDK_STANDALONE_PROJECT_RFC_2026-10.md — future independent project, not yet created.

## Guard rules (first iteration)
Protected: src/core/, src/workflows/, src/evidence/, src/data/evidence/, src/regimens/, src/data/regimens/.
A PR touching one of these directories must also change at least one tests/ unit test and one docs/ scientific or QA note. These are *procedural* gates only: a fabricated test, incorrect formula or misleading documentation can still pass. E2E alone is not a numerical oracle.
Tests run with `node --test scripts/mpdk-guard.node-check.mjs`; local changed-file audit:
`node scripts/mpdk-guard.mjs --base origin/develop` (after fetching origin/develop).

## Mandatory manual review before merge
1. Confirm readme/AGENTS rules do not conflict with higher-priority human instructions.
2. Review guard's false positives/false negatives on two synthetic examples and at least one genuine scientific PR.
3. Confirm no clinical constants or release flags changed.
4. Confirm ordinary HFC CI still passes (typecheck, tests, build, Playwright).
5. Decide whether to enable strong branch protection, external reviewers and approval roles.

## No automatic release
Scientific source assessment, mathematical reproduction, independent medical physics validation and clinical commissioning are different gates. MPDK cannot approve patients or treatment workflows.

