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

  it("reproduces Milano Figures 5/6 nine Table 3 model points without mixing V12 and V14", () => {
    // Source: Milano et al. HyTEC 2021, PDF p7 Fig5, p8 Fig6,
    // p11 equation (3), p12 Table3 (printed journal pp74-75, 78-79).
    // Eq3 EXPONENTIAL logistic, not earlier eq1 log(Vx) / log-logistic.
    // Source figure parameters and rounded reference risks are supplied
    // explicitly below to avoid circular lookup of HFC values.
    const probability = (v: number, v50: number, gamma50: number) =>
      1 / (1 + Math.exp(-4 * gamma50 * (v / v50 - 1)));

    const sourceFits = [
      {
        name: "Fig5 V12 mixed grade1-3 edema-or-necrosis non-Korytko pooled",
        axisGy: 12, v50: 63.2, gamma50: .87,
        risks: [.036, .048, .086], maxDelta: .0031,
      },
      {
        name: "Fig6A V14 grade1-3 edema-or-necrosis",
        axisGy: 14, v50: 45.8, gamma50: .88,
        risks: [.041, .060, .121], maxDelta: .0007,
      },
      {
        name: "Fig6B V14 grade3 pathology-confirmed necrosis requiring surgery",
        axisGy: 14, v50: 42.6, gamma50: 1.58,
        risks: [.004, .008, .034], maxDelta: .0003,
      },
    ] as const;

    let checked = 0;
    for (const model of sourceFits) {
      for (const [index, volume] of [5, 10, 20].entries()) {
        const result = probability(volume, model.v50, model.gamma50);
        const published = model.risks[index]!;
        expect(result, model.name + " / " + volume + "cc")
          .toBeGreaterThan(0);
        expect(result, model.name + " / " + volume + "cc")
          .toBeLessThan(1);
        // Printed values and slope parameters are rounded; Fig5 source
        // table vs printed γ50 differ by up to ~0.30 percentage points.
        expect(Math.abs(result - published), model.name)
          .toBeLessThan(model.maxDelta);
        checked++;
      }
    }
    expect(checked).toBe(9);
    // Korytko was separated and contributes its own very different
    // published V12 5/10/20cc estimates (19.6/25.8/41.5%).
    expect(probability(5, 63.2, .87)).toBeLessThan(.05);
    expect(.196).toBeGreaterThan(4 * probability(5, 63.2, .87));
  });

  it("reproduces Milano Table 3 LQ α/β=2 dose translations but never equates V12 and V14", () => {
    // PDF p12 Table3: 1fx V12/V14 corresponds to V19.6/V23.1
    // in 3fx and V24.4/V28.8 in 5fx (rounded to 0.1Gy).
    // Dose conversions are radiation quality/source scoped and cannot
    // make target-inclusive tissue Vx equal normal-brain Vx.
    const bed = (doseTotal: number, fx: number, ab: number) =>
      doseTotal * (1 + doseTotal / fx / ab);
    const cases = [
      { singleGy: 12, totalGy: 19.6, fx: 3 },
      { singleGy: 12, totalGy: 24.4, fx: 5 },
      { singleGy: 14, totalGy: 23.1, fx: 3 },
      { singleGy: 14, totalGy: 28.8, fx: 5 },
    ] as const;
    for (const value of cases) {
      const oneFractionBED = bed(value.singleGy, 1, 2);
      const fractionatedBED = bed(value.totalGy, value.fx, 2);
      expect(Math.abs(fractionatedBED - oneFractionBED))
        .toBeLessThan(.38); // physical rounding to 0.1 Gy
    }
    expect(bed(12, 1, 2)).toBe(84);
    expect(bed(14, 1, 2)).toBe(112);
    // Using α/β=10 would be a semantic error.
    expect(Math.abs(bed(19.6, 3, 10) - bed(12, 1, 10)))
      .toBeGreaterThan(4);
  });
});
