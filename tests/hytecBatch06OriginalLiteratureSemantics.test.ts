import { describe, expect, it } from "vitest";
import {
  hytecClinicalConstraints, hytecOutcomeModels, sources,
} from "../src/data/evidence/v0.1/index.js";

/**
 * HyTEC batch 06 originals, manuscript nos. 17–20 + letters 21–23.
 * See docs/LITERATURE_BATCH_06_HYTEC_17_23_2026-10-15_RU.md.
 *
 * Source-parameter tests only: no clinical risk calculator / patient DVH
 * refit; figures' parameter CIs cannot be mechanically combined to form
 * a confidence band. All numeric HFC values are deliberately UNCHANGED.
 */
const selected=(id: string) => hytecOutcomeModels.find(x=>x.id===id)!;
const bed=(d:number,n:number,ab=10)=>d*(1+d/n/ab);
const toFractionEquivalent=(biologicalEffectiveDose:number,n:number,ab=10)=>{
  const q=n*ab;
  return(-q+Math.sqrt(q*q+4*q*biologicalEffectiveDose))/2;
};
const pancreasLogLogistic=(d3eq:number)=>
  1/(1+(17.6/d3eq)**(4*.64));
const adrenalPoisson=(eqd2:number)=>
  .5**Math.exp((2*.4996/Math.log(2))*(1-eqd2/34.6));
const roycePoisson=(eqd2:number,d50:number,gamma:number)=>
  2**(-Math.exp(Math.E*gamma*(1-eqd2/d50)));

describe("Mahadevan 2021: limited pancreatic cohorts; R0 is NOT a fitted TCP curve",()=>{
  const model=selected("hytec-pancreas-1y-local-control");
  it("reproduces source 33Gy/5fx and 36Gy/3fx unresected LC with 3fx-equivalent alpha/beta10",()=>{
    const a=toFractionEquivalent(bed(33,5),3);
    expect(a).toBeCloseTo(28.2249927704,9);
    expect(pancreasLogLogistic(a)).toBeCloseTo(.7701415982,9);
    expect(pancreasLogLogistic(36)).toBeCloseTo(.8619982998,9);
    expect(model.points.find(p=>p.id==="pancreas-unresected-33gy5fx-77lc")?.probability).toBe(.77);
    expect(model.points.find(p=>p.id==="pancreas-unresected-36gy3fx-86lc")?.probability).toBe(.86);
  });
  it("keeps R0 90% rounded Table2 apart from textual >90% and 8-point unresected fit",()=>{
    const r0=model.points.find(p=>p.id==="pancreas-r0-33gy5fx-over90lc")!;
    expect(r0.probability).toBe(.90);
    expect(r0.probabilityRelation).toBe(">");
    expect(r0.subgroup).toBe("R0 resection");
    expect(Math.abs(pancreasLogLogistic(28.2)-r0.probability)).toBeGreaterThan(.12);
    expect(model.points.filter(p=>p.subgroup==="Unresected disease")).toHaveLength(2);
    expect(model.points.filter(p=>p.subgroup==="R0 resection")).toHaveLength(1);
  });
});

describe("Stumpf 2021: one-year adrenal LC is separate from one-year OS",()=>{
  it("reproduces rounded BED10=116.4 LC ~95% from correct source Poisson convention",()=>{
    const model=selected("hytec-adrenal-metastases-1y-tcp");
    const p=model.points.find(p=>p.id==="adrenal-bed10-116p4")!;
    expect(p.dose.biologicalDose).toEqual({basis:"BED",valueGy:116.4,alphaBetaGy:10});
    expect(116.4/(1+2/10)).toBeCloseTo(97,9);
    expect(adrenalPoisson(97)).toBeCloseTo(.94980915777,9);
    expect(p.probability).toBe(.95);
    expect(p.probabilityRelation).toBe(">");
    expect(p.followUp).toBe("1 year");
    expect(hytecOutcomeModels.filter(m=>m.sourceId===model.sourceId)).toHaveLength(1);
  });
});

describe("Royce 2021: publication internally disagrees for low/intermediate risk",()=>{
  it("explicitly keeps the nonreproduced ~90/~95% points out of clinical fitted-curve status",()=>{
    const model=selected("hytec-prostate-sbrt-5y-tcp");
    const lo90=model.points.find(p=>p.id==="prostate-lowint-90tcp")!;
    const lo95=model.points.find(p=>p.id==="prostate-lowint-95tcp")!;
    expect(lo90.extrapolated).toBe(true); // lower than source ~80 Gy range
    expect(lo90.probability).toBe(.90);
    expect(lo95.probability).toBe(.95);
    expect(roycePoisson(71,20.6,.15)).toBeCloseTo(.774442662,8);
    expect(roycePoisson(90,20.6,.15)).toBeCloseTo(.839045157,8);
    expect(Math.abs(roycePoisson(71,20.6,.15)-lo90.probability)).toBeGreaterThan(.12);
    expect(Math.abs(roycePoisson(90,20.6,.15)-lo95.probability)).toBeGreaterThan(.11);
    expect(model.applicability?.notes?.join(" ")).toMatch(/UNRESOLVED/);
  });
  it("reproduces 2 high-risk published points without generalizing their 85-person 5-year fit",()=>{
    expect(roycePoisson(97,84.2,4.50)).toBeCloseTo(.8976688945,9);
    expect(roycePoisson(102,84.2,4.50)).toBeCloseTo(.949127082,9);
    const model=selected("hytec-prostate-sbrt-5y-tcp");
    expect(model.points.find(p=>p.id==="prostate-high-90tcp")?.probability).toBe(.90);
    expect(model.points.find(p=>p.id==="prostate-high-95tcp")?.probability).toBe(.95);
    expect(sources.find(s=>s.id===model.sourceId)?.notes).toMatch(/85 high-risk/);
  });
});

describe("Wang 2021: suggested prostate OAR objectives are not source NTCP curves",()=>{
  it("keeps V(Rx) absolute cc and two Dmax ranges without invented risk values",()=>{
    const rows=hytecClinicalConstraints.filter(c=>c.sourceId==="wang-2021-hytec-prostate-toxicity");
    expect(rows).toHaveLength(3);
    const expected=[
      ["hytec-prostate-sbrt-bladder-vrx-5to10cc","custom","cc",5,10],
      ["hytec-prostate-sbrt-urethra-dmax-38to42gy","Dmax","Gy",38,42],
      ["hytec-prostate-sbrt-rectum-dmax-35to38gy","Dmax","Gy",35,38],
    ] as const;
    for(const [id,kind,unit,low,high] of expected){
      const c=rows.find(x=>x.id===id)!;
      expect(c.metric.kind).toBe(kind);
      expect(c.unit).toBe(unit);
      expect(c.relation).toBe("<");
      expect(c.valueRange).toEqual({low,high});
      expect(c.guidanceKind).toBe("observational-threshold");
      expect(c.estimatedRisk).toBeUndefined();
      expect(c.applicability?.fractionCountRange).toEqual({min:4,max:5});
    }
    expect(rows[0].metric).toEqual({kind:"custom",customLabel:"V(Rx dose)"});
  });
  it("does not silently turn 68%-CI model fits or different endpoint definitions into HFC NTCP",()=>{
    const description=sources.find(s=>s.id==="wang-2021-hytec-prostate-toxicity")?.notes??"";
    expect(description).toMatch(/IPSS|CTCAE/);
    expect(description).toMatch(/68% CI/);
    expect(hytecOutcomeModels.every(m=>m.sourceId!=="wang-2021-hytec-prostate-toxicity")).toBe(true);
  });
});

describe("Correspondence: original source-boundary flags",()=>{
  it("records liver dose-response controversy and Brown/Song mechanism disagreement without LQ modifier",()=>{
    expect(sources.find(s=>s.id==="ohri-2021-hytec-liver-local-control")?.notes)
      .toMatch(/Klement|step-function/);
    expect(sources.find(s=>s.id==="song-2021-hytec-biological-principles")?.notes)
      .toMatch(/Brown\/Carlson|Song\/Cho/);
  });
});
