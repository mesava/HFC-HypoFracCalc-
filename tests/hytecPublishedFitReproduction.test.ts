import { describe, expect, it } from "vitest";
import {
  hytecClinicalConstraints,
  hytecOutcomeModels,
} from "../src/data/evidence/v0.1/index.js";

/**
 * Published, independently transcribed HyTEC fitted model parameters.
 * Research-grade audit only: this is NOT a clinical TCP/NTCP runtime.
 *
 * Source locators:
 * - Royce et al. 2021, PDF p6 Table 3 and eq(2), p7 Fig 1;
 * - Vargo et al. 2021, PDF pp6-7 Table 4 and Results;
 * - Grimm et al. 2021, PDF pp7-8 Table 2 and pooled Dmax model;
 * - Stumpf et al. 2021, PDF p7 Fig 1 and eq(1).
 *
 * A point-value comparison does NOT validate the full confidence band or
 * patient-level fit; parameter CI cannot simply be propagated as independent
 * extremes to construct an outcome confidence interval.
 */

const roycePoisson = (eqd2: number, d50: number, gamma: number) =>
  2 ** (-Math.exp(Math.E * gamma * (1 - eqd2 / d50)));

// Stumpf uses gamma50 with a *different* Poisson slope convention.
const stumpfPoisson = (eqd2: number, d50: number, gamma50: number) =>
  0.5 ** Math.exp((2 * gamma50 / Math.log(2)) * (1 - eqd2 / d50));

const vargoLogistic = (dose5fxEq: number, d50: number, gamma50: number) =>
  1 / (1 + Math.exp(-4 * gamma50 * (dose5fxEq / d50 - 1)));

const grimmLogLogistic = (doseDmax: number, td50: number, gamma50: number) =>
  1 / (1 + (td50 / doseDmax) ** (4 * gamma50));

const outcome = (id: string) => {
  const model = hytecOutcomeModels.find((x) => x.id === id);
  expect(model).toBeDefined();
  return model!;
};

describe("HyTEC published fitted models — independent numerical reproduction", () => {
  it("reproduces Vargo six model-derived 1/2/3-year reirradiation local-control anchors", () => {
    // Table 4 fitted 5-fraction equivalent D50 and gamma50.
    // The 1-year fit is weak/not significant; reproducing numbers is not
    // permission to use this as a clinical treatment-response predictor.
    const m = outcome("hytec-hn-reirradiation-local-control");
    for (const [pointId, dose, expected, d50, gamma] of [
      ["hn-rert-1y-25p6gy5eq-50lc", 25.6, 0.50, 25.5, 0.17],
      ["hn-rert-1y-40p7gy5eq-60lc", 40.7, 0.60, 25.5, 0.17],
      ["hn-rert-2y-d50-45p1gy5eq", 45.1, 0.50, 45.1, 0.56],
      ["hn-rert-3y-26p8gy5eq-15lc", 26.8, 0.15, 49.8, 0.94],
      ["hn-rert-3y-44p4gy5eq-40lc", 44.4, 0.40, 49.8, 0.94],
      ["hn-rert-3y-d50-49p8gy5eq", 49.8, 0.50, 49.8, 0.94],
    ] as const) {
      const p = m.points.find(x => x.id === pointId)!;
      expect(p).toBeDefined();
      expect(p.dose.equivalentFractionation).toEqual({
        fractions: 5, totalDoseGy: dose, alphaBetaGy: 10,
      });
      expect(p.probability).toBe(expected);
      // Max observed rounded-point deviation 0.067 percentage points.
      expect(Math.abs(vargoLogistic(dose, d50, gamma) - expected))
        .toBeLessThan(0.001);
    }
  });

  it("reproduces pooled Grimm major-vessel Dmax bleed risk points (not D0.5cc model)", () => {
    // HyTEC Grimm PDF p8, Table 2 pooled 238-vessel model:
    // TD50=45.7 (CI 39.6–64.9) Gy, gamma50=1.1817 (CI 0.65–1.8).
    const dmax20 = hytecClinicalConstraints.find(x => x.id ===
      "hytec-major-vessel-dmax-5fx-20gy-risk")!;
    const dmax30 = hytecClinicalConstraints.find(x => x.id ===
      "hytec-major-vessel-dmax-5fx-30gy-risk")!;
    expect(dmax20?.metric.kind).toBe("Dmax");
    expect(dmax30?.metric.kind).toBe("Dmax");
    expect(dmax20.estimatedRisk).toBe(0.02);
    expect(dmax30.estimatedRisk).toBe(0.12);
    expect(grimmLogLogistic(20, 45.7, 1.1817)).toBeCloseTo(0.019723, 5);
    expect(grimmLogLogistic(30, 45.7, 1.1817)).toBeCloseTo(0.120308, 5);
    // Original reports approximate risks, never assume exact 2%/12%.
    expect(Math.abs(grimmLogLogistic(20, 45.7, 1.1817) - 0.02))
      .toBeLessThan(0.001);
    expect(Math.abs(grimmLogLogistic(30, 45.7, 1.1817) - 0.12))
      .toBeLessThan(0.001);
  });

  it("reproduces Stumpf 1-year adrenal LC ~95% from BED10 116.4 Gy", () => {
    // PDF p7 Fig 1: EQD2_10 D50=34.6 (CI 27.1–45.4) Gy;
    // gamma50=0.4996 (CI 0.248–0.814).
    const bed10 = 116.4;
    const eqd2_10 = bed10 / (1 + 2 / 10); // 97 Gy
    expect(eqd2_10).toBeCloseTo(97, 10);
    const modelled = stumpfPoisson(eqd2_10, 34.6, 0.4996);
    expect(modelled).toBeCloseTo(0.949809, 5);
    expect(Math.abs(modelled - 0.95)).toBeLessThan(0.001);
    const p = outcome("hytec-adrenal-metastases-1y-tcp")
      .points.find(x => x.id === "adrenal-bed10-116p4")!;
    expect(p.probability).toBe(0.95);
    expect(p.probabilityRelation).toBe(">");
    expect(p.dose.biologicalDose?.valueGy).toBe(bed10);
    expect(p.dose.biologicalDose?.alphaBetaGy).toBe(10);
  });

  it("reproduces high-risk Royce prostate source Poisson predictions", () => {
    // PDF p6 Table3: D50 84.2 (81.4–86.8), gamma 4.50 (2.82–6.53).
    const model = outcome("hytec-prostate-sbrt-5y-tcp");
    for (const [id, eqd2, approx] of [
      ["prostate-high-90tcp", 97, 0.90],
      ["prostate-high-95tcp", 102, 0.95],
    ] as const) {
      const p = model.points.find(x => x.id === id)!;
      expect(p.probability).toBe(approx);
      expect(p.dose.biologicalDose?.valueGy).toBe(eqd2);
      expect(Math.abs(roycePoisson(eqd2, 84.2, 4.50) - approx))
        .toBeLessThan(0.003);
    }
  });

  it("documents rather than conceals unresolved Royce LOW/intermediate Table3-vs-text mismatch", () => {
    // PDF p6 equation (2) + Table3: D50=20.6 Gy and gamma=0.15.
    // The same article (abstract, Results, Fig1) quotes ≈90% at EQD2=71
    // and ≈95% at EQD2=90. They do NOT follow from the printed parameters.
    // This regression test intentionally protects the source inconsistency
    // from being silently described as a validated curve. Neither the dose
    // nor the printed probability in HFC is changed pending source review.
    const actual71 = roycePoisson(71, 20.6, 0.15);
    const actual90 = roycePoisson(90, 20.6, 0.15);
    expect(actual71).toBeCloseTo(0.774443, 5);
    expect(actual90).toBeCloseTo(0.839045, 5);

    const model = outcome("hytec-prostate-sbrt-5y-tcp");
    const p71 = model.points.find(x => x.id === "prostate-lowint-90tcp")!;
    const p90 = model.points.find(x => x.id === "prostate-lowint-95tcp")!;
    expect(p71.dose.biologicalDose?.valueGy).toBe(71);
    expect(p90.dose.biologicalDose?.valueGy).toBe(90);
    expect(p71.probability).toBe(0.90);
    expect(p90.probability).toBe(0.95);
    expect(p71.extrapolated).toBe(true);

    expect(p71.probability - actual71).toBeGreaterThan(0.12);
    expect(p90.probability - actual90).toBeGreaterThan(0.10);
    // A gamma inferred from two narrative percentages is not a citable
    // source coefficient and must NOT be substituted into the dataset.
  });
});
