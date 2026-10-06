import { describe, expect, it } from "vitest";
import { calculateEvidenceLq } from "../src/workflows/evidenceLq.js";

describe("evidence-driven LQ workflow", () => {
  it("uses the preferred prostate alpha/beta and exposes a sensitivity envelope", () => {
    const result = calculateEvidenceLq(
      "prostate-biochemical-control",
      { fractions: 5, dosePerFractionGy: 7.25 },
    );

    expect(result.selectionMode).toBe("evidence");
    expect(result.alphaBetaGy).toBe(1.6);
    expect(result.parameterRecordId).toBe(
      "ab-prostate-biochemical-control-vb2020",
    );
    expect(result.sourceId).toBe("vogelius-bentzen-2020-prostate");
    expect(result.alphaBetaSensitivity).toBeDefined();
    expect(result.alphaBetaSensitivity?.alphaBetaCi95Gy).toEqual({
      low: 1.3,
      high: 2.0,
    });
  });

  it("uses the 2026 FAST-Forward adjusted alpha/beta for ipsilateral breast recurrence", () => {
    const result = calculateEvidenceLq(
      "breast-ipsilateral-recurrence",
      { fractions: 5, dosePerFractionGy: 5.2 },
    );

    expect(result.alphaBetaGy).toBe(3.3);
    expect(result.sourceId).toBe("brunt-2026-fast-forward-10y");
  });

  it("requires explicit selection or manual override when no robust GU default exists", () => {
    expect(() =>
      calculateEvidenceLq(
        "gu-incontinence-g1plus",
        { fractions: 20, dosePerFractionGy: 3 },
      ),
    ).toThrow(/No default-eligible alpha\/beta estimate/);
  });

  it("accepts a manual alpha/beta for an endpoint without a default", () => {
    const result = calculateEvidenceLq(
      "gu-incontinence-g1plus",
      { fractions: 20, dosePerFractionGy: 3 },
      {
        selectionMode: "manual",
        parameter: "alpha-beta",
        value: 3,
        unit: "Gy",
        rationale: "Local protocol sensitivity analysis",
      },
    );

    expect(result.selectionMode).toBe("manual");
    expect(result.alphaBetaGy).toBe(3);
    expect(result.parameterRecordId).toBeUndefined();
    expect(result.sourceId).toBeUndefined();
    expect(result.alphaBetaSensitivity).toBeUndefined();
    expect(result.warnings.join(" ")).toMatch(/User-specified/);
  });

  it("orders a finite alpha/beta sensitivity envelope numerically", () => {
    const result = calculateEvidenceLq(
      "breast-photographic-appearance",
      { fractions: 5, dosePerFractionGy: 6 },
    );

    expect(result.alphaBetaSensitivity).toBeDefined();
    const envelope = result.alphaBetaSensitivity!;
    expect(envelope.bedGy.high).not.toBeNull();
    expect(envelope.bedGy.low).toBeLessThanOrEqual(envelope.bedGy.high!);
    expect(envelope.eqd2Gy.low).toBeLessThanOrEqual(envelope.eqd2Gy.high);
  });

  it("handles an alpha/beta confidence interval reaching zero without division by zero", () => {
    const result = calculateEvidenceLq(
      "breast-induration",
      { fractions: 5, dosePerFractionGy: 6 },
      {
        selectionMode: "evidence",
        parameterRecordId: "ab-breast-induration-fast2020",
      },
    );

    expect(result.alphaBetaGy).toBe(1.6);
    expect(result.alphaBetaSensitivity).toBeDefined();
    expect(result.alphaBetaSensitivity?.alphaBetaCi95Gy.low).toBe(0);
    expect(result.alphaBetaSensitivity?.bedGy.high).toBeNull();
    expect(result.alphaBetaSensitivity?.eqd2Gy.high).toBeGreaterThan(0);
    expect(result.warnings.join(" ")).toMatch(/BED becomes unbounded/);
  });
});
