import { describe, expect, it } from "vitest";
import { bedGy } from "../src/core/lq.js";
import {
  hytecClinicalConstraints,
  hytecOutcomeModels,
  sources,
} from "../src/data/evidence/v0.1/index.js";

/**
 * P5 independent source check:
 * - Royce et al., HyTEC 19, 2021 original PDF p.6 Eq.(2)/Table 3 and p.7 Fig.1.
 * - Quan Chen letter DOI 10.1016/j.ijrobp.2025.06.3898,
 *   reply DOI 10.1016/j.ijrobp.2025.06.3899: bibliographic metadata
 *   verified but the author's full reply text is NOT available.
 * - Wang et al., HyTEC 20 original PDF p.6 sec.6 and p.7 urethral
 *   model explicitly convert 4fx to 5fx using LQ alpha/beta=3 Gy.
 *   Figure 1B p.8 labels its axes "Four Fraction".
 * Tests do NOT assert source error or patient NTCP validation.
 */
const royce = hytecOutcomeModels.find(
  m => m.id === "hytec-prostate-sbrt-5y-tcp",
)!;
const roycePoisson = (eqd2: number, d50: number, gamma: number) =>
  2 ** (-Math.exp(Math.E * gamma * (1 - eqd2 / d50)));

// Invert BED analytically, independently of the HFC EQD2 inversion API.
function physicalDoseForBed(
  targetBedGy: number,
  fractions: number,
  alphaBetaGy: number,
): number {
  const d = (-alphaBetaGy +
    Math.sqrt(alphaBetaGy ** 2 + 4 * alphaBetaGy * targetBedGy / fractions)) / 2;
  return fractions * d;
}

describe("Royce 2021: unresolved equation/Table 3 cannot silently become verified clinical fit", () => {
  it("flags both low/intermediate points at the data level, not just a model-wide note", () => {
    const mismatched = royce.points.filter(
      p => p.sourceReproducibility === "unresolved-equation-table-mismatch",
    );
    expect(mismatched.map(p => p.id).sort()).toEqual([
      "prostate-lowint-90tcp",
      "prostate-lowint-95tcp",
    ]);
    expect(mismatched.map(p => p.probability)).toEqual([.90, .95]);
    expect(royce.points.filter(p => p.id.startsWith("prostate-high-"))
      .every(p => p.sourceReproducibility === undefined)).toBe(true);
  });

  it("independently reproduces mismatch and high-risk fit without inventing repaired gamma", () => {
    expect(roycePoisson(71, 20.6, .15)).toBeCloseTo(.774442662, 8);
    expect(roycePoisson(90, 20.6, .15)).toBeCloseTo(.839045157, 8);
    expect(roycePoisson(97, 84.2, 4.50)).toBeCloseTo(.8976688945, 9);
    expect(roycePoisson(102, 84.2, 4.50)).toBeCloseTo(.949127082, 9);
    expect(royce.applicability?.notes?.join(" ")).toContain("UNRESOLVED");
    expect(sources.find(s => s.id === royce.sourceId)?.notes).toContain("HAVE NOT been reviewed");
  });
});

describe("Wang 2021: documented 4-to-5 fraction LQ conversion is not a verified NTCP", () => {
  it("reproduces BED3-preserving 4fx to 5fx conversion for original 43/44/45Gy urethral doses", () => {
    const expected = [
      [43, 47.386246000250374],
      [44, 48.502232098372644],
      [45, 49.618298293979315],
    ] as const;

    for (const [originalFourFractionGy, expectedFiveFractionGy] of expected) {
      const originalBedGy = bedGy(
        { fractions: 4, dosePerFractionGy: originalFourFractionGy / 4 },
        3,
      );
      const totalFiveFractionGy = physicalDoseForBed(originalBedGy, 5, 3);
      expect(totalFiveFractionGy).toBeCloseTo(expectedFiveFractionGy, 9);
      const recoveredBed = bedGy(
        { fractions: 5, dosePerFractionGy: totalFiveFractionGy / 5 },
        3,
      );
      expect(recoveredBed).toBeCloseTo(originalBedGy, 10);
      expect(totalFiveFractionGy).toBeGreaterThan(originalFourFractionGy);
    }
    // These are examples of source-described dose conversion ONLY.
    // They are NOT new clinical planning objectives.
  });

  it("preserves the source's separate OAR suggested guidance without patient-specific NTCP", () => {
    const wang = sources.find(s => s.id === "wang-2021-hytec-prostate-toxicity")!;
    expect(wang.notes).toMatch(/alpha\/beta=3 Gy/);
    expect(wang.notes).toMatch(/Figure 1B/);
    expect(wang.notes).toMatch(/5-fraction equivalent dose/);
    const guides = hytecClinicalConstraints.filter(c => c.sourceId === wang.id);
    expect(guides).toHaveLength(3);
    expect(guides.every(c => c.guidanceKind === "observational-threshold")).toBe(true);
    expect(guides.every(c => c.estimatedRisk === undefined)).toBe(true);
    expect(hytecOutcomeModels.filter(m => m.sourceId === wang.id)).toHaveLength(0);
  });
});
