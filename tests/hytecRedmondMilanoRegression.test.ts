import { describe, expect, it } from "vitest";
import {
  hytecClinicalConstraints,
  hytecOutcomeModels,
} from "../src/data/evidence/v0.1/index.js";

/**
 * P2 primary-source audit for Redmond 2021 brain metastasis local-control
 * and Milano 2021 brain radionecrosis dose-volume outcome semantics.
 *
 * Redmond supplemental EA4, PDF pp.8-9, 1-Year LC, 1-5 fraction rows:
 * small TD50=11.21 Gy and g50=.9749 (N=10106)
 * medium TD50=12.44 Gy and g50=.7617 (N=647)
 * large TD50=9.15 Gy and g50=.4089 (N=1028)
 * Source modeled on single-fraction-equivalent prescription dose with
 * α/β=20 Gy. The HFC points below are single-fraction schedules,
 * so the source's SFED20 equals delivered prescription dose.
 *
 * Milano brain tolerance PDF p.12 Table 3 identifies multiple studies,
 * different toxicity grades, V12 and non-identical brain/tissue contours.
 * Never substitute these figure-specific risks for the separately pooled
 * symptomatic radionecrosis associations in HFC.
 */

function redmondLogLogistic(doseSFED20: number, td50: number, g50: number) {
  return 1 / (1 + (td50 / doseSFED20) ** (4 * g50));
}

describe("P2 HyTEC Redmond / Milano source models and endpoint invariants", () => {
  it("reproduces four Redmond 1-year LC single-fraction HFC anchors from EA4 pooled 1-5fx parameters", () => {
    const m = hytecOutcomeModels.find(x => x.id === "hytec-brain-mets-1y-local-control")!;
    expect(m).toBeDefined();

    for (const [id, prescription, td50, g50, hfcProbability, relation] of [
      ["brain-mets-le20mm-18gy-1fx", 18, 11.21, .9749, .85, ">"],
      ["brain-mets-le20mm-24gy-1fx", 24, 11.21, .9749, .95, "≈"],
      ["brain-mets-21-30mm-18gy-1fx", 18, 12.44, .7617, .75, "≈"],
      ["brain-mets-31-40mm-15gy-1fx", 15, 9.15, .4089, .69, "≈"],
    ] as const) {
      const p = m.points.find(x => x.id === id)!;
      expect(p).toBeDefined();
      expect(p.dose.schedule).toEqual({ fractions: 1, dosePerFractionGy: prescription });
      expect(p.probability).toBe(hfcProbability);
      expect(p.probabilityRelation).toBe(relation);
      expect(p.followUp).toBe("1 year");

      const actual = redmondLogLogistic(prescription, td50, g50);
      // The first source estimate is ">85%", and its model predicts ~86.37%.
      // All 4 source narrative roundings are within 1.5 percentage points.
      expect(Math.abs(actual - hfcProbability)).toBeLessThan(0.015);
      if (relation === ">") expect(actual).toBeGreaterThan(hfcProbability);
    }

    expect(redmondLogLogistic(18, 11.21, .9749)).toBeCloseTo(.863741, 5);
    expect(redmondLogLogistic(24, 11.21, .9749)).toBeCloseTo(.951133, 5);
    expect(redmondLogLogistic(18, 12.44, .7617)).toBeCloseTo(.755036, 5);
    expect(redmondLogLogistic(15, 9.15, .4089)).toBeCloseTo(.691784, 5);
  });

  it("keeps Redmond source fit distinct from a model for 2-year LC or overall survival", () => {
    // Supp. EA4: small tumors 2yr LC, 1-5fx TD50=13.88 and g50=1.3542.
    // It must not replace the 1yr LC points with a different endpoint.
    const predictedTwoYearAt18 = redmondLogLogistic(18, 13.88, 1.3542);
    const predictedOneYearAt18 = redmondLogLogistic(18, 11.21, .9749);
    expect(predictedOneYearAt18 - predictedTwoYearAt18).toBeGreaterThan(0.06);
    const m = hytecOutcomeModels.find(x => x.id === "hytec-brain-mets-1y-local-control")!;
    expect(m.points.every(p => p.followUp === "1 year")).toBe(true);
  });

  it("does not equate the Milano Table 3 heterogeneous 'any necrosis' models to HFC symptomatic risk", () => {
    // Milano PDF p12 Table 3:
    // V12 5/10/20 cc any necrosis grade 1-3 (Chin/Inoue/Peng): 3.6/4.8/8.6%
    // Same volume any necrosis from Korytko: 19.6/25.8/41.5%
    // V14 grade 3 requiring surgery in Inoue/Peng: .4/.8/3.4%.
    // The table itself provides no validation of HFC V12=5cc symptomatic 10%.
    const sourceAnyNecrosisV12At5cc = .036;
    const alternateAnyNecrosisV12At5cc = .196;
    expect(alternateAnyNecrosisV12At5cc - sourceAnyNecrosisV12At5cc).toBeGreaterThan(.15);

    for (const [id, volume, risk, relation] of [
      ["hytec-brain-v12-5cc-symptomatic-rn", 5, .10, "≈"],
      ["hytec-brain-v12-10cc-symptomatic-rn", 10, .15, "≈"],
      ["hytec-brain-v12-over15cc-symptomatic-rn", 15, .20, "≈"],
    ] as const) {
      const point = hytecClinicalConstraints.find(x => x.id === id)!;
      expect(point.endpointId).toBe("brain-symptomatic-radionecrosis");
      expect(point.metric).toEqual({kind:"Vx",xGy:12});
      expect(point.value).toBe(volume);
      expect(point.estimatedRisk).toBe(risk);
      expect(point.riskRelation).toBe(relation);
      expect(point.population?.toLowerCase()).toMatch(/includes target/);
      expect(point.guidanceKind).toBe("risk-point");
    }
    expect(hytecClinicalConstraints.find(x => x.id === "hytec-brain-v12-over15cc-symptomatic-rn")?.relation).toBe(">");
  });

  it("preserves Milano 3fx vs 5fx and edema versus resection endpoint differences", () => {
    const entries = [
      ["hytec-brain-v20-3fx-any-necrosis-edema", 20, 3, "brain-necrosis-edema-any", .10],
      ["hytec-brain-v20-3fx-resection", 20, 3, "brain-radionecrosis-resection", .04],
      ["hytec-brain-v24-5fx-any-necrosis-edema", 24, 5, "brain-necrosis-edema-any", .10],
      ["hytec-brain-v24-5fx-resection", 24, 5, "brain-radionecrosis-resection", .04],
    ] as const;
    for (const [id, dose, fx, endpoint, risk] of entries) {
      const r = hytecClinicalConstraints.find(x => x.id === id)!;
      expect(r.metric).toEqual({kind:"Vx",xGy:dose});
      expect(r.value).toBe(20);
      expect(r.relation).toBe("<");
      expect(r.estimatedRisk).toBe(risk);
      expect(r.riskRelation).toBe("<");
      expect(r.fractionation?.fractions).toBe(fx);
      expect(r.endpointId).toBe(endpoint);
      expect(r.population?.toLowerCase()).toMatch(/target/);
    }
  });
});
