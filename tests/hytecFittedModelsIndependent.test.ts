import { describe, expect, it } from "vitest";
import {
  hytecClinicalConstraints,
  hytecOutcomeModels,
} from "../src/data/evidence/v0.1/index.js";

/**
 * Independent numerical retranscription of published parameter tables.
 * THESE FUNCTIONS ARE TEST FIXTURES ONLY. HFC does not offer continuous
 * patient-specific TCP/NTCP fitting. The reported parameter 95% intervals
 * are NOT joint curve confidence bands and may not be propagated by
 * independently picking the two interval endpoints.
 *
 * Source originals:
 * Grimm et al. HyTEC 2021, PDF p.7 Eq and p.8 Table 2;
 * Vargo et al. HyTEC 2021, PDF p.7 Table 4;
 * Stumpf et al. HyTEC 2021, PDF p.7 Eq.1 and Fig.1;
 * Royce et al. HyTEC 2021, PDF p.6 Eq.2/Table 3, p.7 Fig.1.
 *
 * Royce low/intermediate-risk discrepancy has independent later criticism:
 * Chen Q, In Regard to Royce et al, 2025, DOI 10.1016/j.ijrobp.2025.06.3898;
 * Mavroidis et al, In Reply to Chen, 2025,
 * DOI 10.1016/j.ijrobp.2025.06.3899.
 * No assertion is made about the unretrieved full text of the author reply.
 */
const grimmNtcp = (d: number, td50: number, g50: number): number =>
  1 / (1 + Math.pow(td50 / d, 4 * g50));

const vargoTcp = (d: number, d50: number, g50: number): number =>
  1 / (1 + Math.exp(-4 * g50 * (d / d50 - 1)));

const stumpfPoisson = (eqd2: number, d50: number, g50: number): number =>
  Math.pow(2, -Math.exp((2 * g50 / Math.log(2)) * (1 - eqd2 / d50)));

const roycePoisson = (eqd2: number, d50: number, gamma: number): number =>
  Math.pow(2, -Math.exp(Math.E * gamma * (1 - eqd2 / d50)));

describe("HyTEC P2: independent published model-parameter reproduction", () => {
  it("reproduces Grimm pooled carotid Dmax bleeding event risks and units", () => {
    // Source: Table 2, pooled n=238; TD50=45.7 (95% CI 39.6-64.9);
    // gamma50=1.1817 (95% CI 0.65-1.8), all in five fractions.
    expect(grimmNtcp(20, 45.7, 1.1817)).toBeCloseTo(0.0197226673, 7);
    expect(grimmNtcp(30, 45.7, 1.1817)).toBeCloseTo(0.1203082407, 7);
    for (const [id, dose, risk] of [
      ["hytec-major-vessel-dmax-5fx-20gy-risk", 20, 0.02],
      ["hytec-major-vessel-dmax-5fx-30gy-risk", 30, 0.12],
    ] as const) {
      const row = hytecClinicalConstraints.find(x => x.id === id)!;
      expect(row.metric.kind).toBe("Dmax");
      expect(row.value).toBe(dose);
      expect(row.fractionation?.fractions).toBe(5);
      expect(row.estimatedRisk).toBe(risk);
      expect(Math.abs(grimmNtcp(dose, 45.7, 1.1817) - risk)).toBeLessThan(0.001);
    }
  });

  it("reproduces Vargo logistic 1/2/3-year HN reirradiation model points", () => {
    // Source: PDF pp.6-7, Table 4 (5-fraction-equivalent Gy10).
    // 1-year fit statistically weak: median split p=.0685; model p=.096.
    // 2-year D50=45.1 (95% CI 39.1-71.5), gamma50=.56 (.27-.85).
    // 3-year D50=49.8 (95% CI 43.7-72.8), gamma50=.94 (.49-1.43).
    const model = hytecOutcomeModels.find(x => x.id === "hytec-hn-reirradiation-local-control")!;
    for (const [id, dose, d50, gamma, expected] of [
      ["hn-rert-1y-25p6gy5eq-50lc", 25.6, 25.5, 0.17, 0.50],
      ["hn-rert-1y-40p7gy5eq-60lc", 40.7, 25.5, 0.17, 0.60],
      ["hn-rert-2y-d50-45p1gy5eq", 45.1, 45.1, 0.56, 0.50],
      ["hn-rert-3y-26p8gy5eq-15lc", 26.8, 49.8, 0.94, 0.15],
      ["hn-rert-3y-44p4gy5eq-40lc", 44.4, 49.8, 0.94, 0.40],
      ["hn-rert-3y-d50-49p8gy5eq", 49.8, 49.8, 0.94, 0.50],
    ] as const) {
      const item = model.points.find(x => x.id === id)!;
      expect(item.probability).toBe(expected);
      expect(item.dose.equivalentFractionation).toMatchObject({
        fractions: 5,
        totalDoseGy: dose,
        alphaBetaGy: 10,
      });
      expect(Math.abs(vargoTcp(dose, d50, gamma) - expected)).toBeLessThan(0.001);
    }
  });

  it("reproduces Stumpf adrenal TCP at BED10=116.4 Gy with source Poisson model", () => {
    // Source: PDF p.7 Eq.1, Fig.1: D50,EQD2_10=34.6 (27.1-45.4);
    // gamma50=.4996 (.248-.814), distinct from Fig.2's OS fit.
    const eqd2 = 116.4 / (1 + 2 / 10); // 97 Gy; not 116.4 Gy!
    expect(eqd2).toBeCloseTo(97, 10);
    expect(stumpfPoisson(eqd2, 34.6, 0.4996)).toBeCloseTo(0.9498091578, 7);
    const m = hytecOutcomeModels.find(x => x.id === "hytec-adrenal-metastases-1y-tcp")!;
    const p = m.points.find(x => x.id === "adrenal-bed10-116p4")!;
    expect(p.dose.biologicalDose).toMatchObject({
      basis: "BED", valueGy: 116.4, alphaBetaGy: 10,
    });
    expect(p.probability).toBe(0.95);
    expect(p.probabilityRelation).toBe(">");
    // The model is approximately 95%, while the primary abstract says >95%.
    // Preserve the authors' strict inequality rather than silently rewriting.
  });

  it("records the unresolved Royce low/intermediate Poisson parameter inconsistency", () => {
    // Source: Royce PDF p.6 Eq.2 and Table 3, PDF p.7 Figure 1.
    // Published low/intermediate parameters D50=20.6 Gy, gamma=0.15
    // DO NOT reproduce quoted 90% at 71Gy or 95% at 90Gy:
    // 77.44% and 83.90%, respectively. Not an implementation bug in HFC.
    // The same printed equation reproduces high-risk quoted points.
    const m = hytecOutcomeModels.find(x => x.id === "hytec-prostate-sbrt-5y-tcp")!;
    for (const [id, dose, quoted, calculated] of [
      ["prostate-lowint-90tcp", 71, 0.90, 0.774442661657],
      ["prostate-lowint-95tcp", 90, 0.95, 0.839045156529],
    ] as const) {
      const p = m.points.find(x => x.id === id)!;
      expect(p.dose.biologicalDose?.valueGy).toBe(dose);
      expect(p.probability).toBe(quoted);
      expect(roycePoisson(dose, 20.6, 0.15)).toBeCloseTo(calculated, 9);
      expect(Math.abs(roycePoisson(dose, 20.6, 0.15) - quoted)).toBeGreaterThan(0.10);
    }
    for (const [id, dose, quoted] of [
      ["prostate-high-90tcp", 97, 0.90],
      ["prostate-high-95tcp", 102, 0.95],
    ] as const) {
      const p = m.points.find(x => x.id === id)!;
      expect(p.probability).toBe(quoted);
      expect(Math.abs(roycePoisson(dose, 84.2, 4.5) - quoted)).toBeLessThan(0.004);
    }
  });
});
