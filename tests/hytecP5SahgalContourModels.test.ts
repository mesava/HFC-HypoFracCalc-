import { describe, expect, it } from "vitest";
import {
  hytecClinicalConstraints,
  reirradiationGuidanceSets,
} from "../src/data/evidence/v0.1/index.js";
import {
  resolveClinicalConstraint,
  validateConstraintDataset,
} from "../src/evidence/constraintRegistry.js";

/**
 * Original Sahgal et al. HyTEC 2021 Table 3 (PDF p8 / journal p131):
 * Sahgal thecal-sac Dmax and Katsoulakis–Gibbs TRUE spinal-cord Dmax
 * are separate model results, NOT bounds of one interchangeable dose.
 * Table 4 (PDF p11 / journal p134): thecal sac only in retreatment.
 * Scientific source-consistency, not clinical SBRT commissioning.
 */
const models = [
  ["hytec-cord-dmax-1fx-risk-range", 1, 12.4, 14.0],
  ["hytec-cord-dmax-2fx-17gy", 2, 17.0, 19.3],
  ["hytec-cord-dmax-3fx-20p3gy", 3, 20.3, 23.1],
  ["hytec-cord-dmax-4fx-23gy", 4, 23.0, 26.2],
  ["hytec-cord-dmax-5fx-25p3gy", 5, 25.3, 28.8],
] as const;

const eqd2 = (doseGy: number, n: number) =>
  doseGy * (doseGy / n + 2) / 4;

describe("P5 Sahgal 2021: separate model and cord contour for EACH Dmax entry", () => {
  it("preserves five original Table 3 records while making both contours explicit", () => {
    const recorded = hytecClinicalConstraints.filter(
      c => c.sourceId === "sahgal-2021-hytec-spinal-cord",
    );
    expect(recorded).toHaveLength(5);
    for (const [id, n, low, high] of models) {
      const c = resolveClinicalConstraint(id).constraint;
      expect(c.metric.kind).toBe("Dmax");
      expect(c.fractionation?.fractions).toBe(n);
      expect(c.valueRange).toEqual({ low, high });
      expect(c.estimatedRiskRange).toEqual({low:.01,high:.05});
      const pair = c.doseRangeModelProvenance!;
      expect(pair).toBeDefined();
      expect(pair.low.model).toBe("sahgal-2013");
      expect(pair.low.structure).toBe("thecal-sac");
      expect(pair.high.model).toBe("katsoulakis-gibbs");
      expect(pair.high.structure).toBe("true-spinal-cord");
      expect(pair.low.derivation).toBe(
        n===1 ? "single-fraction-source-model" : "source-model-lq-rescaling",
      );
      expect(pair.high.derivation).toBe(
        n===1 ? "single-fraction-source-model" : "lq-extrapolation-from-1fx",
      );
      // These are two model predictions, NOT one contour confidence interval.
      expect(pair.low.structure).not.toBe(pair.high.structure);
      expect(Math.abs(eqd2(high,n)-56)).toBeLessThan(.22);
      expect(Math.abs(eqd2(low,n)-44.64)).toBeLessThan(.22);
    }
    expect(() => validateConstraintDataset()).not.toThrow();
  });

  it("retreatment four lower-risk factors apply to thecal sac, not the true cord", () => {
    const re = reirradiationGuidanceSets.find(
      g => g.id === "hytec-spinal-cord-reirradiation-lower-risk-factors",
    )!;
    expect(re.requiredStructure).toBe("thecal-sac");
    expect(re.requiredMetric).toBe("Dmax");
    expect(re.alphaBetaGy).toBe(2);
    expect(re.maxPreviousCoursesSupported).toBe(1);
    expect(re.criteria.map(c => [c.quantity,c.relation,c.limitValue]))
      .toEqual([
        ["cumulative-eqd2","<=",70],
        ["current-eqd2","<=",25],
        ["current-to-cumulative-ratio","<=",0.5],
        ["interval-months",">=",5],
      ]);
    expect(re.evidenceMeaning).toBe("lower-risk-associated-factors");
    expect(re.notes?.join(" ")).toMatch(/not absolute|suggestions/i);
  });

  it("retreatment source Table 4 does not override direct Dmax EQD2 comparison", () => {
    // Physical prior prescription dose must NOT be assumed measured
    // thecal-sac Dmax. This is a conditional arithmetic example ONLY.
    const hypotheticalPreviousSacDmax = 50;
    const conditionalSum = eqd2(hypotheticalPreviousSacDmax,25)+eqd2(14,3);
    expect(conditionalSum).toBeCloseTo(73.33333333333333,9);
    expect(conditionalSum).toBeGreaterThan(70);
    expect(eqd2(14,3)).toBeLessThan(25);
  });
});
