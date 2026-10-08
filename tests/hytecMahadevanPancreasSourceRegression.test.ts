import {describe, expect, it} from "vitest";
import {hytecOutcomeModels} from "../src/data/evidence/v0.1/index.js";

/**
 * Mahadevan et al. 2021 HyTEC pancreas local control, DOI
 * 10.1016/j.ijrobp.2020.11.017. PDF p7 equations and Table2, p6 Fig1,
 * pp3-8 source group definitions. Source parameter check, not
 * independent individual-patient logistic fit or validation.
 */
const lqBed = (totalGy: number, n: number, ab=10) =>
  totalGy*(1+totalGy/n/ab);

function equivalentTotalDose(bed: number, n: number, ab=10) {
  // Invert BED = D + D^2/(n*alpha/beta)
  const q=n*ab;
  return (-q+Math.sqrt(q*q+4*q*bed))/2;
}
const logLogistic = (total3FxGy: number, d50=17.6, gamma50=.64) =>
  1/(1+(d50/total3FxGy)**(4*gamma50));

describe("HyTEC Mahadevan pancreas — strata and published fit", () => {
  const model = hytecOutcomeModels.find(
    x=>x.id==="hytec-pancreas-1y-local-control",
  )!;

  it("reproduces two unresected model points with source LQ-10 3fx dose conversion", () => {
    expect(model).toBeDefined();
    expect(model.evidenceForm).toBe("model-derived");
    for (const [id,physical,n,threeEq,reported] of [
      ["pancreas-unresected-33gy5fx-77lc",33,5,28.2,.77],
      ["pancreas-unresected-36gy3fx-86lc",36,3,36,.86],
    ] as const) {
      const p=model.points.find(x=>x.id===id)!;
      expect(p).toBeDefined();
      expect(p.subgroup).toBe("Unresected disease");
      expect(p.probabilityRelation).toBe("≈");
      expect(p.probability).toBe(reported);
      const expected=equivalentTotalDose(lqBed(physical,n,10),3,10);
      expect(Math.abs(expected-threeEq)).toBeLessThan(.03);
      expect(p.dose.equivalentFractionation).toEqual({
        fractions:3,totalDoseGy:threeEq,alphaBetaGy:10,
      });
      expect(Math.abs(logLogistic(expected)-reported)).toBeLessThan(.003);
      expect(p.followUp).toBe("1 year");
    }
    expect(logLogistic(equivalentTotalDose(lqBed(33,5),3)))
      .toBeCloseTo(.7701416,6);
    expect(logLogistic(36)).toBeCloseTo(.8619983,6);
  });

  it("does not claim the R0 90% average is the same fitted dose-response curve", () => {
    const r0=model.points.find(x=>x.id==="pancreas-r0-33gy5fx-over90lc")!;
    expect(r0.subgroup).toBe("R0 resection");
    expect(r0.probability).toBe(.90);
    // Text says >90%; source Table2 gives a rounded 90 at 33Gy/5fx.
    // This is a source-reporting precision distinction, not grounds to
    // manufacture a new continuous R0 TCP model or change the estimate.
    expect(r0.probabilityRelation).toBe(">");
    expect(r0.dose.equivalentFractionation?.totalDoseGy).toBe(28.2);
    expect(r0.notes?.join(" ")).toMatch(/Table 2|weighted average/i);
    expect(model.applicability?.notes?.join(" ")).toMatch(/separate|R0/i);
    expect(Math.abs(logLogistic(28.2)-.90)).toBeGreaterThan(.12);
  });

  it("uses a non-significant third-year/no-standardized timeline only as explicit publication limitation", () => {
    // Source p7: unresected model from 8 data points of studies >=80%
    // without surgery, D50=17.6 (8.8-21.5), gamma50=.64 (.27-1.02)
    // P=.002 Fisher exact test. R0 3-series estimate is separate.
    expect(model.applicability?.followUp).toBe("1-year local control");
    expect(model.applicability?.notes?.join(" ")).toMatch(/Kaplan-Meier|starting time/i);
    expect(model.notes?.join(" ")).toMatch(/three studies|3 studies/i);
  });
});
