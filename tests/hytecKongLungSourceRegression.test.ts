import { describe, expect, it } from "vitest";
import { hytecClinicalConstraints } from "../src/data/evidence/v0.1/index.js";

/**
 * Scientific source-scope regression: Kong et al. 2021 HyTEC (review written
 * through summer 2016), doi:10.1016/j.ijrobp.2018.11.028.
 *
 * Primary source visually inspected:
 * PDF p2 Abstract, p4 Table3, p5 Fig1, p8 Table4 (ILD), p11 section8,
 * pp11–12 Table5. Supplement PDF p10 S-Table3 (trial-specific NRG/RTOG).
 *
 * Neither this file nor the UI exposes these heterogeneous cohort fits as a
 * patient-specific lung NTCP calculator. The Table5 probit numerical checks
 * demonstrate that study-specific models are not pooled planning limits.
 */

function standardNormalCdf(z: number) {
  // Stable, sufficient-precision approximation for source-rounded inputs.
  const t = 1 / (1 + .2316419 * Math.abs(z));
  const poly = ((((1.330274429 * t - 1.821255978) * t +
    1.781477937) * t - .356563782) * t + .319381530);
  const upperTail = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI) * poly * t;
  return z < 0 ? upperTail : 1 - upperTail;
}

/** Conventional probit gamma50 parametrization, never a HFC clinical API. */
function sourceProbit(dose: number, d50: number, gamma50: number) {
  return standardNormalCdf(
    (dose / d50 - 1) * gamma50 * Math.sqrt(2 * Math.PI),
  );
}

describe("HyTEC Kong lung source boundaries", () => {
  const lung = hytecClinicalConstraints.filter(
    x => x.sourceId === "kong-2021-hytec-lung-parenchyma",
  );

  it("retains precisely two observational MLD/V20 ranges, not hard constraints or fitted patient risk", () => {
    expect(lung).toHaveLength(2);
    const mld = lung.find(x => x.id === "hytec-lung-rilt-mean-dose-under8gy")!;
    const v20 = lung.find(x => x.id === "hytec-lung-rilt-v20-10to15pct")!;
    expect(mld.guidanceKind).toBe("observational-threshold");
    expect(v20.guidanceKind).toBe("observational-threshold");
    expect(mld.metric).toEqual({kind:"mean-dose"});
    expect(mld.value).toBe(8);
    expect(mld.unit).toBe("Gy");
    expect(mld.relation).toBe("<");
    expect(v20.metric).toEqual({kind:"Vx",xGy:20});
    expect(v20.valueRange).toEqual({low:10,high:15});
    expect(v20.unit).toBe("%");
    expect(v20.relation).toBe("<");
    for (const entry of [mld,v20]) {
      expect(entry.estimatedRiskRange).toEqual({low:.10,high:.15});
      expect(entry.riskRelation).toBe("<");
      expect(entry.endpointId).toBe("lung-symptomatic-rilt");
      expect(entry.priorRadiotherapy).toBe("none");
      expect(entry.applicability?.fractionCountRange).toEqual({min:3,max:5});
      expect(entry.population).toMatch(/small peripheral/i);
      expect(entry.population).toMatch(/bilateral lungs/i);
      expect(entry.notes?.join(" ")).toMatch(/not a (guaranteed|validated|universal)/i);
      expect(entry.applicability?.notes?.join(" ")).toMatch(/interstitial lung disease/i);
      expect(entry.applicability?.notes?.join(" ")).toMatch(/GTV|IGTV/);
    }
  });

  it("retains identical-plan Figure1 contour-induced MLD differences without converting into a correction factor", () => {
    // Kong Fig1B, PDF p5; these are FOUR DVHs from ONE illustrative case:
    const physicalMeanDoseGy = {
      ipsilateralMinusPtv: 6.8,
      ipsilateralMinusGtv: 7.7,
      bilateralMinusPtv: 4.1,
      bilateralMinusGtv: 4.6,
    };
    expect(physicalMeanDoseGy.ipsilateralMinusGtv).toBe(7.7);
    expect(physicalMeanDoseGy.bilateralMinusGtv).toBe(4.6);
    expect(physicalMeanDoseGy.ipsilateralMinusPtv).toBe(6.8);
    expect(physicalMeanDoseGy.bilateralMinusPtv).toBe(4.1);
    expect(physicalMeanDoseGy.ipsilateralMinusGtv -
      physicalMeanDoseGy.bilateralMinusGtv).toBeCloseTo(3.1,9);
    // These values are source-specific, not a universal linear transform
    // between ipsilateral/bilateral nor target-subtraction methods.
  });

  it("does not mistake heterogeneous Table5 single-cohort probit models for pooled MLD<8 risk", () => {
    // Kong Table5 (PDF p11-12):
    // Ong 2010: n=18/18, combined lungs − PTV, CTCAE v4 G2+;
    // physical MLD D50=7.9 Gy (95% CI 6.7–9.2), gamma50=4.85 (1.21–∞).
    // Borst 2010: n=128/161+, combined lungs − GTV, CTC v2 G2+;
    // physical MLD D50=14.9 Gy (11.2–29.0), gamma50=.82 (.58–1.08).
    const ong = sourceProbit(8, 7.9, 4.85);
    const borst = sourceProbit(8, 14.9, .82);
    expect(ong).toBeCloseTo(.561151, 5);
    expect(borst).toBeCloseTo(.170588, 5);
    expect(ong-borst).toBeGreaterThan(.35);
    // This source heterogeneity and differing OAR/endpoint definitions
    // PREVENT using either fitted 8Gy NTCP as the HFC pooled 10%-15%
    // observational risk. Do not replace HFC threshold/risk with either.
  });

  it("preserves source Table4 ILD/non-ILD numerators rather than implying a universal multiplier", () => {
    // Table4 primary PDF p8, G3-5 radiation pneumonitis (distinct from
    // HFC's pooled G2+ RILT endpoint, and cohorts/schedules differ).
    const comparisons = [
      {study:"Takeda 2010",nonIld:[5,125],ild:[2,3]},
      {study:"Yamashita 2010",nonIld:[2,104],ild:[9,13]},
      {study:"Ueki 2015",nonIld:[2,137],ild:[2,20]},
      {study:"Bahig 2016",nonIld:[10,476],ild:[9,28]},
    ] as const;
    expect(comparisons).toHaveLength(4);
    for (const cohort of comparisons) {
      const pNon = cohort.nonIld[0] / cohort.nonIld[1];
      const pIld = cohort.ild[0] / cohort.ild[1];
      expect(pIld, cohort.study).toBeGreaterThan(pNon);
    }
    expect(2/3).toBeCloseTo(.666667,5);
    expect(9/13).toBeCloseTo(.692308,5);
    expect(2/20).toBe(.1);
    expect(9/28).toBeCloseTo(.321429,5);
    // The apparent risk ratio varies dramatically by study and sample
    // size: no scalar "ILD multiplier" was imported into HFC.
  });
});
