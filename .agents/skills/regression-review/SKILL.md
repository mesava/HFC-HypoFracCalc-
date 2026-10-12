---
name: regression-review
description: Perform code change-impact assessment and numerical regression testing for radiotherapy calculation and evidence modules.
---
# Regression review — MPDK v0.1

Before modification: map affected functions, data records, call paths, UI cards, exports and downstream consumers. Identify separate unit, integration and browser checks. Establish baseline results.
After modification: compare diff against intended scope. Run existing tests and build with exact commands; explicitly say if a command was not run.
For scientific paths use independent numerical anchors, negative inputs, boundary cases, uncertainty/disclaimer visibility and backward compatibility of explicit IDs.
Compare both numeric results and semantic outputs (organ contour, endpoint, units, clinical eligibility, source flags). Avoid snapshot-only scientific tests.
Report FAIL on mismatched numeric anchors; no auto-fix of primary coefficients without documented authorization.
The pilot script scripts/mpdk-guard.mjs checks only presence of companion files. It cannot prove scientific correctness.

