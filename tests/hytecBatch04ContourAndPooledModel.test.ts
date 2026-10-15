import { describe, expect, it } from "vitest";
import {
  hytecClinicalConstraints,
  hytecOutcomeModels,
} from "../src/data/evidence/v0.1/index.js";
import {
  queryClinicalConstraints,
  validateConstraintDataset,
} from "../src/evidence/constraintRegistry.js";

/**
 * Primary batch 04, HyTEC 06-09:
 * Milano brain DOI 10.1016/j.ijrobp.2020.08.013 main PDF pp.2,4,
 *  supplemental Fig E1-E4; Milano optic DOI 10.1016/j.ijrobp.2018.01.053
 *  main PDF pp.2,10 and online tables; Soltys vestibular and spinal TCP
 *  DOI 10.1016/j.ijrobp.2020.11.019 and 10.1016/j.ijrobp.2020.11.021.
 * This is numerical SOURCE REPRODUCTION not clinical commissioning.
 */
const milanoBrain = hytecClinicalConstraints.filter(
  c => c.sourceId === "milano-2021-hytec-brain",
);

describe("HyTEC Milano target-inclusive Vx geometry provenance", () => {
  it("marks exactly seven V12/V20/V24 entries as tissue volume INCLUDING target", () => {
    expect(milanoBrain).toHaveLength(7);
    expect(milanoBrain.every(c => c.metric.kind === "Vx")).toBe(true);
    expect(milanoBrain.map(c => c.metric.xGy).sort((a,b)=>(a??0)-(b??0)))
      .toEqual([12,12,12,20,20,24,24]);
    expect(milanoBrain.every(c => c.volumeBasis === "target-inclusive-tissue"))
      .toBe(true);
    expect(milanoBrain.every(c => c.guidanceKind === "risk-point"))
      .toBe(true);
    expect(() => validateConstraintDataset()).not.toThrow();
  });

  it("refuses to silently match HyTEC tissue Vx with brain-minus-target Vx", () => {
    const inclusive = queryClinicalConstraints({
      metricKind:"Vx", volumeBasis:"target-inclusive-tissue",
    }).filter(c => c.sourceId==="milano-2021-hytec-brain");
    expect(inclusive).toHaveLength(7);

    const excludingTarget = queryClinicalConstraints({
      metricKind:"Vx", volumeBasis:"brain-minus-target",
    }).filter(c => c.sourceId==="milano-2021-hytec-brain");
    expect(excludingTarget).toHaveLength(0);

    // Missing contour provenance is not equivalent to an explicit match.
    expect(milanoBrain.every(c => c.volumeBasis !== undefined)).toBe(true);
  });

  it("does not confuse source descriptive symptomatic RN with any RN/resection", () => {
    const id = (name:string)=>milanoBrain.find(c=>c.id===name)!;
    expect(id("hytec-brain-v12-5cc-symptomatic-rn").endpointId)
      .toBe("brain-symptomatic-radionecrosis");
    expect(id("hytec-brain-v12-5cc-symptomatic-rn").estimatedRisk).toBe(.10);
    expect(id("hytec-brain-v20-3fx-any-necrosis-edema").estimatedRisk).toBe(.10);
    expect(id("hytec-brain-v20-3fx-resection").estimatedRisk).toBe(.04);
    expect(id("hytec-brain-v20-3fx-resection").endpointId)
      .toBe("brain-radionecrosis-resection");
  });
});

describe("HyTEC optical RION no-prior-RT model and clinical recommendation provenance", () => {
  it("preserves distinct 1fx recommendation from pooled 1%-modeled 12.1Gy", () => {
    const optic=hytecClinicalConstraints.filter(c=>
      c.sourceId==="milano-2021-hytec-optic");
    expect(optic.map(c=>[c.fractionation?.fractions,c.value]))
      .toEqual([[1,10],[3,20],[5,25]]);
    expect(optic.every(c=>c.metric.kind==="Dmax")).toBe(true);
    expect(optic.every(c=>c.priorRadiotherapy==="none")).toBe(true);
    const pooledEquivalent=12.1*(12.1+1.6)/(2+1.6);
    expect(pooledEquivalent).toBeCloseTo(46.05,1);
    expect(optic.find(c=>c.fractionation?.fractions===1)?.value)
      .toBeLessThan(12.1);
  });
});

describe("HyTEC Soltys spinal LC source fit versus rounded HFC source narrative", () => {
  const spinal=hytecOutcomeModels.find(
    m=>m.id==="hytec-spinal-mets-2y-tcp",
  )!;
  const eq3 = (D:number, n:number) => {
    const bed = D*(1+D/n/6);
    return (-18+Math.sqrt(324+72*bed))/2;
  };
  const logistic = (D3:number) =>
    1/(1+Math.exp(-4*.8140*(D3/19.44-1)));

  it("marks mixed previously irradiated / unirradiated cohorts explicitly", () => {
    expect(spinal.priorRadiotherapy).toBe("mixed");
    expect(spinal.applicability?.notes?.join(" ")).toMatch(/previously irradiated and unirradiated/i);
    expect(spinal.applicability?.notes?.join(" ")).toMatch(/D95|prescription/i);
  });

  it("reproduces published pooled supplemental Table 1 to ~1.7 pp in eight approximate points", () => {
    const values = [
      ["spine-18gy-1fx",18,1,.82],
      ["spine-20gy-1fx",20,1,.90],
      ["spine-24gy-1fx",24,1,.96],
      ["spine-24gy-2fx",24,2,.82],
      ["spine-27gy-3fx",27,3,.78],
      ["spine-90tcp-28gy-2fx",28,2,.90],
      ["spine-90tcp-33gy-3fx",33,3,.90],
      ["spine-90tcp-40gy-5fx",40,5,.90],
    ] as const;
    for(const [id,totalGy,n,publishedApprox] of values){
      const p=spinal.points.find(point=>point.id===id)!;
      expect(p).toBeDefined();
      expect(p.probability).toBe(publishedApprox);
      const modelTcp=logistic(eq3(totalGy,n));
      expect(Math.abs(modelTcp-publishedApprox),id).toBeLessThan(.0171);
    }
    expect(logistic(eq3(20,1))).toBeCloseTo(.8830336,6);
    // HFC retains the rounded main-text ≈90%, not fake point precision.
    expect(spinal.points.find(p=>p.id==="spine-20gy-1fx")?.probability)
      .toBe(.90);
  });

  it("keeps exact same BED6 for 24/2 and 18/1, while source prescription D95 remains unmodeled", () => {
    expect(eq3(24,2)).toBeCloseTo(eq3(18,1),11);
    expect(spinal.points.find(p=>p.id==="spine-90tcp-40gy-5fx")?.extrapolated)
      .toBe(true);
  });
});
