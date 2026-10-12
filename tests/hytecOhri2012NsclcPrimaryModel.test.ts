import { describe, expect, it } from "vitest";
import { hytecOutcomeModels } from "../src/data/evidence/v0.1/index.js";

/**
 * Source: Ohri et al. Int J Radiat Oncol Biol Phys. 2012;84:e379–e384.
 * DOI 10.1016/j.ijrobp.2012.04.040, PMID22999272, PMCID PMC3867931.
 * NIH-author-manuscript original available in open full text:
 * https://pmc.ncbi.nlm.nih.gov/articles/PMC3867931/
 *
 * Equation explicitly published in Abstract and Methods:
 * TCP_2y = 1/(1+exp(-(BED10 - c*diameterCm - TCD50)/k))
 * with c=10 Gy/cm, TCD50=0 Gy, k=31 Gy, and
 * BED10=D*(1+d/10) using prescribed PTV dose.
 *
 * Discussion separately prints six examples. The original source
 * includes one internal discrepancy for 50Gy/5fx diameter 1cm:
 * printed 93%, rounded-equation evaluates 94.80%.
 * This test must NOT "correct" the value or claim patient validation.
 */

const bed10 = (n: number, dosePerFractionGy: number) =>
  n * dosePerFractionGy * (1 + dosePerFractionGy / 10);

const tcp2y = (bed: number, maxDiameterCm: number) =>
  1 / (1 + Math.exp(-(bed - 10 * maxDiameterCm) / 31));

describe("Ohri 2012 NSCLC published size-adjusted BED10 TCP crosscheck", () => {
  const model = hytecOutcomeModels.find(
    x => x.id === "nsclc-stage-i-size-adjusted-2y-tcp",
  )!;

  it("preserves six published 2y local-control examples, not new clinical fitted 95% risk bands", () => {
    expect(model).toBeDefined();
    expect(model.sourceId).toBe("ohri-2012-nsclc-size-tcp");
    expect(model.points).toHaveLength(6);
    expect(model.evidenceForm).toBe("model-derived");

    const cases = [
      ["nsclc-50gy-5fx-1cm-2y", 5, 10, 1, 0.93],
      ["nsclc-50gy-5fx-3cm-2y", 5, 10, 3, 0.90],
      ["nsclc-50gy-5fx-5cm-2y", 5, 10, 5, 0.83],
      ["nsclc-54gy-3fx-1cm-2y", 3, 18, 1, 0.99],
      ["nsclc-54gy-3fx-3cm-2y", 3, 18, 3, 0.98],
      ["nsclc-54gy-3fx-5cm-2y", 3, 18, 5, 0.96],
    ] as const;
    for (const [id, n, doseGy, diameter, published] of cases) {
      const point = model.points.find(x => x.id === id)!;
      expect(point, id).toBeDefined();
      expect(point.dose.schedule).toEqual({
        fractions: n,
        dosePerFractionGy: doseGy,
      });
      expect(point.probability).toBe(published);
      expect(point.followUp).toBe("2 years");
      expect(point.subgroup).toContain(`${diameter} cm`);

      const fitted = tcp2y(bed10(n, doseGy), diameter);
      if (id === "nsclc-50gy-5fx-1cm-2y") {
        expect(fitted).toBeCloseTo(0.948006, 5);
        expect((fitted - published) * 100).toBeGreaterThan(1.7);
        expect((fitted - published) * 100).toBeLessThan(1.9);
      } else {
        expect(Math.abs(fitted - published), id).toBeLessThan(0.006);
      }
    }
  });

  it("reproduces source sBED benchmarks and keeps 2y probabilities distinct from independent patient-level validation", () => {
    expect(bed10(5, 10)).toBe(100);
    expect(bed10(3, 18)).toBeCloseTo(151.2, 12);

    for (const [sizeAdjustedBedGy, published] of [
      [44, 0.80],
      [69, 0.90],
      [93, 0.95],
    ] as const) {
      expect(Math.abs(tcp2y(sizeAdjustedBedGy, 0) - published))
        .toBeLessThan(0.006);
    }
  });

  it("never treats sBED zero as a calibrated 50% control rate or includes single-fraction as validated", () => {
    const notes = model.applicability?.notes?.join(" ") ?? "";
    expect(notes).toMatch(/single.fraction/i);
    expect(notes).toMatch(/8 Gy/i);
    expect(notes).toMatch(/two weeks|2 weeks/i);
    expect(notes).toMatch(/93%.{0,160}94\.8%|94\.8%.{0,160}93%/i);
    // The original authors explicitly warn that the 0-Gy fitted
    // TCD50=0 should not be read as 50% local control with no dose.
    expect(tcp2y(0, 0)).toBe(.5);
  });
});
