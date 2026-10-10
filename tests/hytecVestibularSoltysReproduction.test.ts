import { describe, expect, it } from "vitest";
import { hytecOutcomeModels } from "../src/data/evidence/v0.1/index.js";

/**
 * HyTEC Soltys et al. (2021) Vestibular Schwannoma, doi
 * 10.1016/j.ijrobp.2020.11.019, original PDF pp5,7–9
 * (Fig1, Eq1/2, Fig2/Table3), supplement Table E3.
 * Scientific regression only: not a continuous patient-level TCP API.
 *
 * Model used for HFC's six LQ-derived anchors:
 *   TCP = exp[-ln(2)*exp((2*gamma50/ln(2))*(1-EQD2/EQD2_50))]
 *   EQD2 = D*(D/n+ab)/(2+ab)
 *   EQD2_50 = 3.48 Gy, gamma50=.1446, alpha/beta=12.4 Gy.
 *
 * Assumed pseudo-observation TCP(0)=30%, not a forced intercept!
 * The printed fitted-curve TCP at 0 Gy is therefore not exactly 30%.
 */
const lqEqd2 = (totalGy: number, fractions: number, alphaBetaGy: number) =>
  totalGy * (totalGy/fractions + alphaBetaGy)/(2+alphaBetaGy);

const sourcePoissonTcp = (eqd2Gy: number, d50Gy = 3.48, gamma50 = .1446) =>
  Math.exp(-Math.LN2 * Math.exp(
    (2*gamma50/Math.LN2)*(1-eqd2Gy/d50Gy),
  ));

describe("HyTEC Soltys vestibular schwannoma LQ model, source-only", () => {
  const model = hytecOutcomeModels.find(
    x => x.id === "hytec-vestibular-schwannoma-3to5y-tcp",
  )!;

  it("reproduces all six printed LQ 3–5-year control values to <0.06 pp", () => {
    expect(model).toBeDefined();
    expect(model.sourceId).toBe("soltys-2021-hytec-vestibular-tcp");
    expect(model.points).toHaveLength(6);
    for (const [id, n, dPerFraction, reported] of [
      ["vs-10gy-1fx",1,10,.85],
      ["vs-11gy-1fx",1,11,.884],
      ["vs-12gy-1fx",1,12,.912],
      ["vs-13gy-1fx",1,13,.935],
      ["vs-18gy-3fx",3,6,.936],
      ["vs-25gy-5fx",5,5,.972],
    ] as const) {
      const p = model.points.find(x => x.id === id)!;
      expect(p).toBeDefined();
      expect(p.dose.schedule).toEqual({fractions:n,dosePerFractionGy:dPerFraction});
      expect(p.followUp).toBe("3–5 years");
      expect(p.probability).toBe(reported);
      expect(p.probabilityRelation).toBe("≈");
      const eqd2Gy = lqEqd2(n*dPerFraction,n,12.4);
      const fitted = sourcePoissonTcp(eqd2Gy);
      expect(Math.abs(fitted-reported),id).toBeLessThan(.0006);
    }
  });

  it("retains 10Gy/1fx as extrapolation and does not mistake TCP(0)=30% pseudo-observation for a fitted anchor", () => {
    expect(model.points.find(x => x.id === "vs-10gy-1fx")?.extrapolated)
      .toBe(true);
    for (const p of model.points.filter(x => x.id !== "vs-10gy-1fx")) {
      expect(p.extrapolated).not.toBe(true);
    }
    // Authors did not force the fit through the 30% pseudo-observation.
    expect(sourcePoissonTcp(0)).toBeCloseTo(.349231,5);
    expect(Math.abs(sourcePoissonTcp(0)-.30)).toBeGreaterThan(.04);
    expect(sourcePoissonTcp(3.48)).toBeCloseTo(.5,10);
    expect(model.population).toMatch(/Vestibular schwannoma/i);
  });

  it("reproduces LQ source Table3 EQD2 and equivalent multi-fraction doses as rounded source values", () => {
    // Table 3 LQ TCP=95% corresponds approximately EQD2=25Gy,
    // D=13.8/1, 19.2/3 or 21.5/5.
    for (const [total,n] of [[13.8,1],[19.2,3],[21.5,5]] as const) {
      expect(Math.abs(lqEqd2(total,n,12.4)-25)).toBeLessThan(.20);
    }
    expect(sourcePoissonTcp(25)).toBeCloseTo(.948838,5);
  });

  it("does not silently conflate authors' alternative LQ-L fit with selected LQ probabilities", () => {
    // Paper p8: LQ-L predicts TCP at 10/11/12/13Gy/1fx of
    // 89.7/93.1/95.6/97.33% (versus 85/88.4/91.2/93.5% LQ).
    // Different fitted alpha/beta=2.97 (CI 1.72–4.27), transition at
    // dT=5.94Gy and Eq1 must remain separate. No numeric substitution.
    const publishedLqlAt10 = .897;
    expect(publishedLqlAt10-sourcePoissonTcp(lqEqd2(10,1,12.4)))
      .toBeGreaterThan(.04);
    expect(model.applicability?.notes?.join(" ")).toMatch(/NF2|neurofibromatosis/i);
    expect(model.notes?.join(" ")).toMatch(/LQ-L|12.4/);
  });
});
