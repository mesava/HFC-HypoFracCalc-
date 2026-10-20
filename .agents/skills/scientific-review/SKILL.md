---
name: scientific-review
description: Assess medical physics equations, endpoint semantics, source provenance, applicability and scientific uncertainty before modifying scientific code or data.
---
# Scientific review — MPDK v0.1

Use for BED/EQD2, treatment time effects, fractionation, TCP/NTCP, HyTEC and dose constraints.
1. Define quantity (absorbed dose / BED / EQD2 / risk), physical units, fractionation, reference depth/geometry when relevant and endpoint.
2. Identify the population, technique, organ/structure contour, dose metric (Dmax, D0.03cc, Dmean, Vx) and treatment context including reirradiation.
3. Identify primary paper, secondary reference and exact location (table/page/equation); mark each assertion as verified, partially verified, unverified or conflicting. A BCR 2025 secondary quote does not establish independent primary full-text verification.
4. Reproduce numerical claims independently where possible; retain deviations, uncertainty and conflicting sources without adjusting coefficients to force a match.
5. Return a report: change; source/locator; model/parameter; scope; source status; reproduction method; discrepancy; clinical limitation; reviewer sign-off state.
6. Never label scientific review as clinical commissioning. Keep open concerns (including HFC PR #60 P3-C03/P3-C07) open until resolved with evidence.

Stop conditions: missing source for a novel clinical coefficient; ambiguous endpoint or contour; unverified extrapolation presented as a safe constraint.

