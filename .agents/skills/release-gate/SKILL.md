---
name: release-gate
description: Enforce a separation of code CI readiness, scientific evidence review, clinical commissioning and human release authorization.
---
# Release gate — MPDK v0.1

Classify approval independently across:
G1 code/tests; G2 scientific numerical verification; G3 source provenance; G4 applicability, user warnings and risk; G5 human clinical/medical-physics review.
Each gate is PASS, FAIL, or NOT VERIFIED with links to evidence, reviewer and timestamp. No 'implicit PASS'.
CI success does not prove scientific or clinical validity. Scientific DRAFT cannot automatically become validated or recommended.
For open critical discrepancies or unreviewed patient-facing coefficients require blocking review; never bypass by renaming identifiers.
Before merge, inspect scope, security, tests and source status; never merge or deploy without explicit authorization.
For current HFC: P3-C03 and P3-C07 remain blocking unless resolved. PR #60 must not be modified by this MPDK pilot.
Produce concise release table with evidence and unresolved items. 'Not run' is not 'passed'.

