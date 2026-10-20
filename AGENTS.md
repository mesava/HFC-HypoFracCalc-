# HFC — AI development policy (MPDK v0.1 pilot)

Scope: this repository. These rules apply equally to any AI coding assistant that reads AGENTS.md.
Human project governance, primary science and executable evidence take precedence over AI suggestions.

## Before modifying anything
1. Read README.md; inspect relevant code, tests, scientific documentation, open issues and PRs.
2. Determine the target branch. Never assume main, develop or an unrelated scientific PR can be modified.
3. State scope and whether the change touches: math, evidence data, clinical interpretation, UI, or release.
4. Follow the relevant on-demand workflow in .agents/skills/*/SKILL.md.

## Scientific safety and independence
- Never invent an alpha/beta, dose constraint, uncertainty, citation, DOI, clinical approval or test result.
- Do not equate an independently computed numerical match with source validation or clinical commissioning.
- Treat BED, EQD2, Dprolif and endpoint-specific TCP/NTCP as distinct quantities; verify units, assumptions, population, structures and domain of applicability.
- Distinguish primary source, secondary literature, extracted numeric datum, fitted-model reproduction, independent clinical validation.
- Keep `draft` evidence and experimental models labelled as such; never promote them automatically.
- Preserved historical source identifiers and confidence intervals must not be silently rewritten to remove conflicts.
- Never include patient-identifying information in repository, agent memory, PRs or test fixtures.

## Change workflow
- Use minimal diffs. No dependency installation or network exfiltration merely to follow an agent skill.
- For changes to src/core/, src/workflows/, src/evidence/, src/data/evidence/, src/regimens/ or src/data/regimens/, provide scientific or QA documentation and unit regression tests.
- Independently calculate expected test values from an equation or cited source, not from the implementation under test.
- Run available checks (npm ci, npm test, npm run typecheck, npm run build, npm run test:e2e) and report which were truly executed, failed or not run.
- Use the decision/evidence registers already in docs; do not create duplicate sources of truth.
- Require human clinical/scientific approval before release promotion. Green CI is necessary but not sufficient.

## Working with scientific PR #60
- Scientific PR #60 remains a separate DRAFT and is not a dependency to merge into main/develop.
- Do not rebase, merge, alter or approve PR #60 in connection with the MPDK pilot.
- The five historic originals described in PR #60 are optional acquisition; cite BCR 2025 as secondary evidence, never call them primary-verified.
- Continue to treat P3-C03 (Hinata BED/EQD2) and P3-C07 (deprecated identifiers) as unresolved unless verified separately.

## MPDK pilot
- .agents/skills/ contains reusable *instructions*, not actual autonomous processes.
- scripts/mpdk-guard.mjs is a deterministic changed-path gate, not a scientific validator.
- See docs/MPDK_V0_1_PILOT_2026-10.md for scope and limitations.

