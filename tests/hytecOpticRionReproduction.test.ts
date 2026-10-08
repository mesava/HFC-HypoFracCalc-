import { describe, expect, it } from "vitest";
import { hytecClinicalConstraints } from "../src/data/evidence/v0.1/index.js";

/**
 * Source-scoped scientific regression, not a deployable clinical NTCP API.
 *
 * Milano et al., HyTEC optic pathways (doi:10.1016/j.ijrobp.2018.01.053).
 * AAPM original PDF (public):
 * https://www.aapm.org/pubs/protected_files/HyTEC/HyTEC_06_NTCP_Optic_20180116.pdf
 * PDF p6 probit model and TD50/gamma50, p9 Table 3 / recommended doses.
 *
 * Pooled fit in EQD2(alpha/beta=1.6 Gy): TD50=157.3 Gy (95% CI 157.2-157.4),
 * gamma50=1.31 (1.30-1.32). Model restrictions:
 * no previous optic apparatus radiotherapy; low incidences; heterogeneity
 * and systematic uncertainty; PUBLISHED MODEL FIT != 1fx recommendation.
 */
function normalCdf(z: number): number {
  // Abramowitz-Stegun 7.1.26-style upper-tail approximation.
  // Numerical approximation error well below source parameter precision.
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly =
    (((1.330274429 * t - 1.821255978) * t + 1.781477937) * t -
      0.356563782) * t + 0.319381530;
  const upperTail =
    Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI) * poly * t;
  return z < 0 ? upperTail : 1 - upperTail;
}

function eqd2(totalGy: number, fx: number, alphaBetaGy = 1.6) {
  return totalGy * (totalGy / fx + alphaBetaGy) / (2 + alphaBetaGy);
}

function pooledRionRisk(eqd2Gy: number) {
  const td50 = 157.3;
  const g50 = 1.31;
  const z = (eqd2Gy / td50 - 1) * g50 * Math.sqrt(2 * Math.PI);
  return normalCdf(z);
}

describe("HyTEC optic RION printed probit and clinical recommendation separation", () => {
  it("reproduces pooled 1%/2%/5% EQD2_1.6 levels in Table 3", () => {
    for (const [eqd2Gy, risk, tolerance] of [
      [46.0, .01, .0003],
      [59.1, .02, .0003],
      [79.0, .05, .002],
    ] as const) {
      expect(Math.abs(pooledRionRisk(eqd2Gy) - risk))
        .toBeLessThan(tolerance);
    }
  });

  it("reproduces recommended 3fx and 5fx 1%-risk model equivalents, but 1fx recommendation is conservative", () => {
    const thresholdRisk = .01;
    for (const [gy, fx, expectedEqd2] of [
      [12.1, 1, 46.0],
      [20.0, 3, 46.0],
      [25.1, 5, 46.0],
    ] as const) {
      expect(Math.abs(eqd2(gy, fx) - expectedEqd2))
        .toBeLessThan(.17);
      expect(Math.abs(pooledRionRisk(eqd2(gy, fx)) - thresholdRisk))
        .toBeLessThan(.0002);
    }

    // NOT an invitation to replace HFC 1fx optic Dmax <=10 Gy.
    // Published all-study pooled curve is ~0.45% at 10Gy/1fx,
    // whereas the independent SRS-only source model gives ~1% at
    // 10Gy. Source authors recommend 10Gy despite 12.1Gy from pool.
    expect(pooledRionRisk(eqd2(10, 1))).toBeCloseTo(.00451347, 5);
    expect(pooledRionRisk(eqd2(12.1, 1))).toBeGreaterThan(.01);
  });

  it("separates source-recommended 10/20/25 Gy Dmax thresholds from fit coefficients and prior RT", () => {
    for (const [id, doseGy, fx, relation] of [
      ["hytec-optic-dmax-1fx-10gy", 10, 1, "≈"],
      ["hytec-optic-dmax-3fx-20gy", 20, 3, "<"],
      ["hytec-optic-dmax-5fx-25gy", 25, 5, "<"],
    ] as const) {
      const r = hytecClinicalConstraints.find(x => x.id === id)!;
      expect(r).toBeDefined();
      expect(r.guidanceKind).toBe("planning-limit");
      expect(r.metric).toEqual({ kind: "Dmax" });
      expect(r.value).toBe(doseGy);
      expect(r.fractionation?.fractions).toBe(fx);
      expect(r.relation).toBe("<=");
      expect(r.priorRadiotherapy).toBe("none");
      expect(r.endpointId).toBe("optic-pathway-radiation-neuropathy");
      expect(r.estimatedRisk).toBe(.01);
      expect(r.riskRelation).toBe(relation);
    }
    // Neither the alpha/beta 1.6 used in the source's pooled fit
    // nor the crude ~10-fold repeat-RT increase is a user-settable
    // individualized recovery/NTCP parameter in this evidence set.
    expect(hytecClinicalConstraints.filter(x =>
      x.sourceId === "milano-2021-hytec-optic").length).toBe(3);
  });

  it("does not equate the 1fx-only RION source model with the full 1–5fx pooled model", () => {
    // Table 3 bottom (1fx only): 1% risk EQD2_1.6=32.2 Gy, 10.0Gy/1fx
    // Table 3 top (pooled 1-5fx): 1% risk EQD2_1.6=46.0 Gy, 12.1Gy/1fx
    expect(eqd2(10, 1)).toBeCloseTo(32.2, 1);
    expect(eqd2(12.1, 1)).toBeCloseTo(46.0, 0);
    expect(46.0 - 32.2).toBeGreaterThan(13);
  });
});
