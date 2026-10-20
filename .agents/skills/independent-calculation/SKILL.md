---
name: independent-calculation
description: Produce traceable, independent reference calculations for radiotherapy physics and radiobiology algorithms.
---
# Independent calculation — MPDK v0.1

1. Define input values with units, tolerance and source; specify exact equation and clinical applicability.
2. Build a calculation independent from the tested production function (hand derivation, alternative script or published table).
3. Use explicit dimensional checks: Gy, Gy/fraction, time in days, EQD2 endpoint alpha/beta and reference convention.
4. Include at least: source anchor, ordinary example, boundary case, adverse/invalid input, and sensitivity to a material assumption.
5. For published models distinguish exact fit, approximate graphical value, reproduced confidence interval and unavailable uncertainty.
6. Store reproducible anchors in tests/ with explanatory references in docs/, recording discrepancy if source and equation disagree.
7. Never circularly generate expected results by invoking the HFC function being tested; a passing test is not clinical validation.

Output: inputs; symbolic method; independently derived expected result; tolerances; source; failure interpretation.

