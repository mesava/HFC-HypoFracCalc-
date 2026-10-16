import { describe, expect, it } from "vitest";
import {
  alphaBetaEstimates, hytecClinicalConstraints, hytecOtherFitUncertaintyReviews,
  hytecOutcomeModels, hytecPublishedFitParameterReviews, sources,
} from "../src/data/evidence/v0.1/index.js";
import { validateHytecOtherFitUncertaintyReviews } from "../src/evidence/hytecOtherFitAuditRegistry.js";

/**
 * Independent ORIGINAL HyTEC source checks: #08 Fig1B/Fig2 and #09 E1,
 * #11 Table4, #12 Table2, #15 sec6, #17 Fig1, #18 Figs1-2, #19 Table3.
 * Source-level fitted parameter CIs are not patient prediction bands.
 */
const review = (sourceId:string) => hytecOtherFitUncertaintyReviews.find(r=>r.sourceId===sourceId)!;
const variant = (id:string) => hytecOtherFitUncertaintyReviews.flatMap(r=>r.variants).find(v=>v.id===id)!;
const param=(id:string,name:string)=>variant(id).modelParameters.find(p=>p.name===name)!;
const poisson=(eqd2:number,d50:number,gamma:number)=>
  2**(-Math.exp(Math.E*gamma*(1-eqd2/d50)));
const logistic=(d:number,d50:number,g50:number)=>
  1/(1+Math.exp(-4*g50*(d/d50-1)));
const stumpfPoisson=(eqd2:number,d50:number,gamma:number)=>
  2**(-Math.exp((2*gamma/Math.log(2))*(1-eqd2/d50)));

describe("P5 remaining HyTEC model fit CI audit, originals 08,09,11,12,15,17,18,19",()=>{
  it("records exactly eight unique primary sources and 16 distinct source-only variants",()=>{
    expect(hytecOtherFitUncertaintyReviews).toHaveLength(8);
    expect(hytecOtherFitUncertaintyReviews.flatMap(r=>r.variants)).toHaveLength(16);
    expect(()=>validateHytecOtherFitUncertaintyReviews()).not.toThrow();
    expect(hytecOtherFitUncertaintyReviews.every(r =>
      r.researchOnly && r.sourceConfidenceBandReproduced===false)).toBe(true);
    for(const r of hytecOtherFitUncertaintyReviews){
      expect(sources.find(s=>s.id===r.sourceId)?.doi).toBe(r.sourceDoi);
    }
    expect(hytecPublishedFitParameterReviews).toHaveLength(6); // prior Redmond+Milano
    expect(hytecOutcomeModels).toHaveLength(9); // 8 HyTEC and external Ohri 2012
    expect(hytecClinicalConstraints).toHaveLength(29);
    expect(alphaBetaEstimates.filter(a=>hytecOtherFitUncertaintyReviews.some(r=>r.sourceId===a.sourceId)))
      .toHaveLength(0);
  });

  it("Soltys vestibular fits are model-dependent, not a single default alpha/beta",()=>{
    expect(param("vs-lq-3to5y","alpha/beta")).toEqual({
      name:"alpha/beta",value:12.4,ci95:{low:9,high:19.3},
    });
    expect(param("vs-lql-3to5y","alpha/beta")).toEqual({
      name:"alpha/beta",value:2.97,ci95:{low:1.72,high:4.27},
    });
    expect(param("vs-lq-3to5y","gamma50").value).toBe(.1446);
    expect(param("vs-lql-3to5y","gamma50").value).toBe(.158);
  });

  it("Soltys spinal original supplemental E1 keeps physical per-fraction fits apart from pooled 3fx equivalent",()=>{
    const pooled=variant("spine-pooled-1to5");
    expect(pooled.sampleCount).toBe(2606);
    expect(param(pooled.id,"D50").ci95).toEqual({low:18.07,high:20.53});
    expect(param(pooled.id,"gamma50")).toEqual({
      name:"gamma50",value:.8140,ci95:{low:.6594,high:.9741},
    });
    expect([1474,117,94]).toEqual([
      variant("spine-1fx-only").sampleCount,
      variant("spine-4fx-only").sampleCount,
      variant("spine-5fx-only").sampleCount,
    ]);
    expect(param("spine-4fx-only","D50").value).toBe(29.09);
    expect(param("spine-5fx-only","gamma50").ci95).toEqual({low:.124,high:.9803});
    expect(pooled.doseAxis).toMatch(/3-fraction equivalent/);
    expect(variant("spine-1fx-only").doseAxis).toMatch(/physical prescription/);
  });

  it("Vargo source 1-year CI upper is unbounded and gamma CI crosses zero",()=>{
    expect(param("vargo-lc-1y","D50").ci95).toEqual({low:3,high:null});
    expect(param("vargo-lc-1y","gamma50").ci95).toEqual({low:-.09,high:.45});
    expect(param("vargo-lc-2y","D50").ci95).toEqual({low:39.1,high:71.5});
    expect(param("vargo-lc-3y","gamma50").ci95).toEqual({low:.49,high:1.43});
    expect(logistic(25.6,25.5,.17)).toBeCloseTo(.50067,4);
    expect(logistic(49.8,49.8,.94)).toBeCloseTo(.5,10);
  });

  it("Ohri 2-year 5000-bootstrap intervals are separate from HFC 3-year stratified observations",()=>{
    const v=variant("ohri-liver-2y-bootstrap");
    expect(v.sourceOnlyRiskIntervals).toEqual([
      {bed10Gy:80,estimate:.70,ci95:{low:.64,high:.77}},
      {bed10Gy:100,estimate:.76,ci95:{low:.70,high:.82}},
      {bed10Gy:180,estimate:.90,ci95:{low:.85,high:.95}},
    ]);
    expect(v.followUp).toBe("2-year");
    const sourcePoints=hytecOutcomeModels.find(x=>x.sourceId===review("ohri-2021-hytec-liver-local-control").sourceId)!.points;
    expect(sourcePoints).toHaveLength(2);
    expect(sourcePoints.every(p=>p.followUp==="3 years")).toBe(true);
  });

  it("Stumpf source LC and OS have different dose-response parameters",()=>{
    expect(param("stumpf-1y-lc","D50")).toEqual({name:"D50",value:34.6,ci95:{low:27.1,high:45.4}});
    expect(param("stumpf-1y-os-not-lc","D50")).toEqual({name:"D50",value:44.7,ci95:{low:33.5,high:60.6}});
    expect(stumpfPoisson(97,34.6,.4996)).toBeCloseTo(.949809,5);
    expect(variant("stumpf-1y-os-not-lc").noteRu).toContain("не источник клинической вероятности LC");
  });

  it("Mahadevan unresected 1-year fit is distinct from separate R0 cohort",()=>{
    expect(param("mahadevan-unresected-1y","D50").ci95).toEqual({low:8.8,high:21.5});
    expect(param("mahadevan-unresected-1y","gamma50").ci95).toEqual({low:.27,high:1.02});
    expect(variant("mahadevan-unresected-1y").noteRu).toContain("R0");
    expect(variant("mahadevan-unresected-1y").followUp).toBe("1-year");
  });

  it("Royce low/intermediate source Eq2 mismatch stays visible despite CI",()=>{
    expect(param("royce-5y-low-intermediate","D50").ci95).toEqual({low:18.9,high:22.3});
    expect(param("royce-5y-high","gamma50").ci95).toEqual({low:2.82,high:6.53});
    expect(variant("royce-5y-low-intermediate").status).toBe("source-numeric-discrepancy-unresolved");
    expect(poisson(71,20.6,.15)).toBeCloseTo(.774442662,8);
    expect(poisson(97,84.2,4.5)).toBeCloseTo(.8976688945,8);
  });

  it("Grimm carotid model is pooled current Dmax only, not prior accumulated dose or D0.5cc",()=>{
    const v=variant("grimm-carotid-pooled-dmax-5fx");
    expect(v.sampleCount).toBe(238);
    expect(param(v.id,"TD50").ci95).toEqual({low:39.6,high:64.9});
    expect(param(v.id,"gamma50").ci95).toEqual({low:.65,high:1.8});
    expect(v.doseAxis).toContain("Dmax");
    expect(v.noteRu).toContain("D0.5cc");
    const risk=(d:number)=>1/(1+(45.7/d)**(4*1.1817));
    expect(risk(20)).toBeCloseTo(.019723,5);
    expect(risk(30)).toBeCloseTo(.120308,5);
  });
});
