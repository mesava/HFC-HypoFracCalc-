import { describe, expect, it } from "vitest";

/**
 * Moiseenko et al HyTEC modeling primer, IJROBP 2021;110:11-20,
 * DOI 10.1016/j.ijrobp.2020.11.020, original PDF
 * pp5–7 Fig2–4 and companion supplement E1.
 *
 * These are pedagogical binary lung toxicity data (n=96, events=13),
 * NOT any clinically validated HFC mean-lung-dose risk model.
 */
const original = {
  n: 96,
  events: 13,
  modelParameterCount: 2,
  d50Gy: 6.06,
  gamma50: 1.19,
  profileLikelihood95: { d50:[5.05,9.04], gamma:[.73,1.77] },
  bootstrap95: { d50:[5.20,8.70], gamma:[.79,1.89] },
  bootstraps: 2000,
  maxLogLikelihood: -31.41,
  nullLogLikelihood: -38.07,
  reportedPApprox: .0003,
};

function illustrativeLogistic(xGy: number, d50Gy:number, gamma50:number) {
  return 1/(1+Math.exp(4*gamma50*(1-xGy/d50Gy)));
}

describe("HyTEC Moiseenko source uncertainty audit",()=>{
  it("keeps separate source profile likelihood and bootstrap parameter confidence intervals",()=>{
    expect(original.profileLikelihood95.d50).toEqual([5.05,9.04]);
    expect(original.profileLikelihood95.gamma).toEqual([.73,1.77]);
    expect(original.bootstrap95.d50).toEqual([5.20,8.70]);
    expect(original.bootstrap95.gamma).toEqual([.79,1.89]);
    expect(original.bootstrap95).not.toEqual(original.profileLikelihood95);
    expect(original.bootstraps).toBe(2000);
    // Neither object is a 95% confidence BAND on clinical TCP/NTCP.
  });

  it("reproduces the published likelihood-ratio improvement over a null horizontal probability model",()=>{
    expect(original.events/original.n).toBeCloseTo(13/96,12);
    expect(original.events/original.modelParameterCount).toBe(6.5);
    const delta=original.maxLogLikelihood-original.nullLogLikelihood;
    expect(delta).toBeCloseTo(6.66,9);
    expect(2*delta).toBeCloseTo(13.32,9);
    expect(original.reportedPApprox).toBe(.0003);
  });

  it("treats the example D50 as exactly 50%-risk midpoint of illustrative fit, not a clinical threshold",()=>{
    expect(illustrativeLogistic(original.d50Gy,original.d50Gy,original.gamma50))
      .toBeCloseTo(.5,13);
    expect(illustrativeLogistic(4,original.d50Gy,original.gamma50))
      .toBeLessThan(.5);
    expect(illustrativeLogistic(8,original.d50Gy,original.gamma50))
      .toBeGreaterThan(.5);
    const gammaSlope = original.gamma50/original.d50Gy;
    const eps = 1e-5;
    const derivative =
      (illustrativeLogistic(original.d50Gy+eps,original.d50Gy,original.gamma50) -
       illustrativeLogistic(original.d50Gy-eps,original.d50Gy,original.gamma50)) / (2*eps);
    expect(derivative).toBeCloseTo(gammaSlope,7);
  });

  it("prohibits treating rectangular combinations of marginal parameter CIs as joint confidence limits",()=>{
    // Explicit scientific invariant: the paper uses correlated joint pairs.
    // A mathematically possible rectangular cross-product DOES NOT
    // have documented 95% joint coverage. The below is illustration only.
    const corners=[
      [original.profileLikelihood95.d50[0]!,original.profileLikelihood95.gamma[0]!],
      [original.profileLikelihood95.d50[0]!,original.profileLikelihood95.gamma[1]!],
      [original.profileLikelihood95.d50[1]!,original.profileLikelihood95.gamma[0]!],
      [original.profileLikelihood95.d50[1]!,original.profileLikelihood95.gamma[1]!],
    ];
    const predicted = corners.map(([d,g])=>illustrativeLogistic(8,d,g));
    expect(predicted).toHaveLength(4);
    expect(predicted.every(p=>p>=0 && p<=1)).toBe(true);
    // DO NOT turn Math.min(...predicted),Math.max(...predicted) into
    // valid 95% patient risk bands without joint bootstrap pairs/likelihood.
  });
});
