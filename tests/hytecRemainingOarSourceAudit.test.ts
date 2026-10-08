import { describe, expect, it } from "vitest";
import { hytecClinicalConstraints } from "../src/data/evidence/v0.1/index.js";

/**
 * P2.13 original public AAPM manuscript crosswalks:
 * Miften 2021 https://www.aapm.org/pubs/protected_files/HyTEC/21/HyTEC_16_NTCP_LiverGI.pdf
 *  PDF p7 Table3, p8 Recommendations (printed pp203-204), p1-3 contours/endpoints.
 * Grimm 2021 https://www.aapm.org/pubs/protected_files/HyTEC/21/HyTEC_12_NTCP_Carotid.pdf
 *  PDF p7 Table2/recommendations (printed p154), p4-6 pooled models.
 * Wang 2021 https://www.aapm.org/pubs/protected_files/HyTEC/21/HyTEC_20_NTCP_Prostate.pdf
 *  PDF p1 conclusion (printed p238), p9-10 Table4 trial-specific examples.
 * HyTEC overview https://www.aapm.org/pubs/protected_files/HyTEC/21/HyTEC_01_Introduction.pdf
 *  PDF p5 Table2 also transcribes prostate dose/objectives + endpoints.
 *
 * This file checks source-derived RECORDS and incompatible endpoints/metrics.
 * No patient-level NTCP fitted here.
 */
const sourceRows=(id: string) => hytecClinicalConstraints.filter(x=>x.sourceId===id);
const stdNorm=(z: number) => {
  const t=1/(1+0.2316419*Math.abs(z));
  const polynomial=((((1.330274429*t-1.821255978)*t)+1.781477937)*t-0.356563782)*t+0.319381530;
  const tail=Math.exp(-z*z/2)/Math.sqrt(2*Math.PI)*polynomial*t;
  return z<0?tail:1-tail;
};
const liverProbit=(physicalMld: number)=>
  stdNorm((physicalMld/40.8-1)*0.95*Math.sqrt(2*Math.PI));
const carotidLogLogistic=(dose: number,td50: number,gamma50: number)=>
  1/(1+Math.pow(td50/dose,4*gamma50));

describe("Miften HyTEC liver: four QUANTEC MLD objectives and two unmodelled 700cc guides",()=>{
  const rows=sourceRows("miften-2021-hytec-liver-toxicity");

  it("preserves four distinct disease cohort/fractionation specific MLD objectives",()=>{
    expect(rows).toHaveLength(6);
    const expected=[
      ["hytec-liver-primary-mld-3fx-13gy",3,13,"Primary liver disease"],
      ["hytec-liver-primary-mld-6fx-18gy",6,18,"Primary liver disease"],
      ["hytec-liver-metastases-mld-3fx-15gy",3,15,"Metastatic liver lesions"],
      ["hytec-liver-metastases-mld-6fx-20gy",6,20,"Metastatic liver lesions"],
    ] as const;
    for(const [id,fx,mld,pop] of expected){
      const r=rows.find(x=>x.id===id)!;
      expect(r).toBeDefined();
      expect(r.metric).toEqual({kind:"mean-dose"});
      expect(r.fractionation?.fractions).toBe(fx);
      expect(r.value).toBe(mld);
      expect(r.relation).toBe("<=");
      expect(r.population).toBe(pop);
      expect(r.guidanceKind).toBe("planning-limit");
      expect(r.estimatedRisk).toBe(.20);
      expect(r.riskRelation).toBe("<");
      expect(r.endpointId).toBe("liver-grade3plus-enzyme-toxicity");
      expect(r.notes?.join(" ")).toMatch(/not statistically significant|P=0.10/);
      expect(r.notes?.join(" ")).toMatch(/liver.minus.GTV|GTV/i);
    }
  });

  it("only reproduces FIG1 statistical fit illustratively; P=0.10 forbids validated NTCP label",()=>{
    // 17 grade>=3 liver enzyme events / 288 patients, 5 source cohorts;
    // D50=40.8 Gy (95% CI lower25.5, upper UNBOUNDED), gamma50=.95
    // (95% CI .58-1.44). Published Fig1 fit is NON-SIGNIFICANT P=.10.
    for(const [physicalMld,riskApprox] of [
      [13,.0523428],[15,.0660567],[18,.0916399],[20,.11237498],
    ] as const){
      expect(liverProbit(physicalMld)).toBeCloseTo(riskApprox,5);
    }
    expect(liverProbit(40.8)).toBeCloseTo(.5,6);
    expect(rows.every(x=>x.guidanceKind!=="risk-point")).toBe(true);
  });

  it("preserves 700cc rVdose absolute spared-liver fraction-specific observations without fitted liver-enzyme NTCP",()=>{
    const a=rows.find(x=>x.id==="hytec-liver-spared-vle15gy-700cc")!;
    const b=rows.find(x=>x.id==="hytec-liver-spared-vle17gy-700cc")!;
    for(const [r,dose] of [[a,15],[b,17]] as const){
      expect(r).toBeDefined();
      expect(r.metric).toEqual({kind:"VleX",xGy:dose});
      expect(r.unit).toBe("cc");
      expect(r.value).toBe(700);
      expect(r.relation).toBe(">=");
      expect(r.guidanceKind).toBe("observational-threshold");
      expect(r.applicability?.fractionCountRange).toEqual({min:3,max:6});
      expect(r.notes?.join(" ")).toMatch(/insufficient|not.*formal.*model/i);
      expect(r.notes?.join(" ")).toMatch(/normal liver|liver minus GTV/i);
      // These data cannot be read as grade3+ enzyme NTCP 9.3%;
      // 11/118 is general grade3+ GI toxicity among trials with
      // spare-700cc guidelines, NOT a fitted rV15/rV17 liver model.
      expect(r.estimatedRisk).toBeUndefined();
    }
    expect(11/118).toBeCloseTo(.093220339,7);
  });
});

describe("Wang HyTEC prostate: source SUGGESTIONS, not universal/individual NTCP",()=>{
  const rows=sourceRows("wang-2021-hytec-prostate-toxicity");
  it("preserves 3 source suggestions with explicitly distinct dose metric and 4-5fx applicability",()=>{
    expect(rows).toHaveLength(3);
    const bladder=rows.find(x=>x.id==="hytec-prostate-sbrt-bladder-vrx-5to10cc")!;
    const urethra=rows.find(x=>x.id==="hytec-prostate-sbrt-urethra-dmax-38to42gy")!;
    const rectum=rows.find(x=>x.id==="hytec-prostate-sbrt-rectum-dmax-35to38gy")!;
    expect(bladder.metric).toEqual({kind:"custom",customLabel:"V(Rx dose)"});
    expect(bladder.valueRange).toEqual({low:5,high:10});
    expect(bladder.unit).toBe("cc");
    expect(bladder.endpointId).toBe("bladder-prostate-sbrt-late-urinary-toxicity");
    expect(urethra.metric).toEqual({kind:"Dmax"});
    expect(urethra.valueRange).toEqual({low:38,high:42});
    expect(urethra.unit).toBe("Gy");
    expect(rectum.metric).toEqual({kind:"Dmax"});
    expect(rectum.valueRange).toEqual({low:35,high:38});
    expect(rectum.unit).toBe("Gy");
    expect(rectum.endpointId).toBe("rectum-prostate-sbrt-late-bowel-toxicity");
    for(const r of rows){
      expect(r.guidanceKind).toBe("observational-threshold");
      expect(r.relation).toBe("<");
      expect(r.applicability?.fractionCountRange).toEqual({min:4,max:5});
      expect(r.priorRadiotherapy).toBe("none");
      expect(r.estimatedRisk).toBeUndefined();
      expect(r.notes?.join(" ")).toMatch(/not a.*(tolerance|hard|validated)|do not offer firm guidance|not.*firm/i);
      expect(r.notes?.join(" ")).toMatch(/35.40 Gy|Rx|prescription/i);
    }
  });
});

describe("Grimm HyTEC major-vessel bleeding: D0.5cc guidance != pooled Dmax risk",()=>{
  const rows=sourceRows("grimm-2021-hytec-major-vessels");
  it("preserves separately sourced D0.5cc <20Gy /5fx conservative suggestion",()=>{
    const r=rows.find(x=>x.id==="hytec-major-vessel-d0p5cc-5fx-20gy")!;
    expect(r).toBeDefined();
    expect(r.metric).toEqual({kind:"D0.5cc"});
    expect(r.value).toBe(20);
    expect(r.unit).toBe("Gy");
    expect(r.relation).toBe("<");
    expect(r.fractionation?.fractions).toBe(5);
    expect(r.guidanceKind).toBe("planning-limit");
    expect(r.priorRadiotherapy).toBe("yes");
    expect(r.estimatedRisk).toBeUndefined();
    expect(r.applicability?.notes?.join(" ")).toMatch(/nonconsecutive|every.other.day/i);
    expect(r.notes?.join(" ")).toMatch(/not.*(validated|probability|continuous)|general guidance/i);
    expect(r.notes?.join(" ")).toMatch(/Dmax.*different|different.*Dmax/i);
  });

  it("keeps source pooled Dmax 2% estimate distinct from D0.5cc-only fit",()=>{
    const pooled20=carotidLogLogistic(20,45.7,1.1817);
    const separate20=carotidLogLogistic(20,53.7,.5756);
    expect(pooled20).toBeCloseTo(.01972267,6);
    expect(separate20).toBeCloseTo(.09329623,6);
    expect(separate20-pooled20).toBeGreaterThan(.07);
    // Pooled Dmax = 238 cases, p ~ 6.44e-11;
    // single source D0.5cc = 61 cases, median-split p=.182
    // => not independently validated as a D0.5cc probability rule.
    expect(rows.find(x=>x.id==="hytec-major-vessel-dmax-5fx-20gy-risk")?.estimatedRisk).toBe(.02);
    expect(rows.find(x=>x.id==="hytec-major-vessel-dmax-5fx-30gy-risk")?.estimatedRisk).toBe(.12);
  });
});
