import {describe,expect,it} from "vitest";
import {hytecOutcomeModels} from "../src/data/evidence/v0.1/index.js";

/**
 * Ohri et al. HyTEC "Local Control After Stereotactic Body Radiation
 * Therapy for Liver Tumors", DOI 10.1016/j.ijrobp.2017.12.288.
 * Source public AAPM original PDF at
 * https://www.aapm.org/pubs/protected_files/HyTEC/21/HyTEC_15_TCP_Liver.pdf
 * (uploaded Library alias temporarily lacked extractable page text).
 *
 * PDF pp1-3 source Results, p4 Eq1, p5 Fig3 (visual verification):
 * 290 metastatic liver lesions, >100Gy10 n141 vs <=100Gy10 n149;
 * 3-year Kaplan-Meier LC 93% versus 65%, logrank P<.001.
 * This is STRATIFIED OBSERVATION, not a continuous fitted 3-year TCP.
 *
 * Independent separate source Eq1 gives 2-year dose-response with
 * TCD50=16 Gy BED10 and k=74 Gy, NOT the 3y KM strata values.
 */

const separateTwoYearLogistic = (bed10: number) =>
  1/(1+Math.exp((16-bed10)/74));

describe("HyTEC Ohri 2021 liver metastases source-group semantics",()=>{
  const m=hytecOutcomeModels.find(x=>
    x.id==="hytec-liver-metastases-bed10-local-control",
  )!;

  it("preserves exactly the two 3-year liver-metastasis Kaplan-Meier groups",()=>{
    expect(m).toBeDefined();
    expect(m.sourceId).toBe("ohri-2021-hytec-liver-local-control");
    expect(m.outcomeKind).toBe("local-control");
    expect(m.evidenceForm).toBe("stratified-observation");
    expect(m.points).toHaveLength(2);
    for(const [id,group,risk] of [
      ["liver-mets-bed10-over100","BED10 >100 Gy",.93],
      ["liver-mets-bed10-le100","BED10 ≤100 Gy",.65],
    ] as const){
      const p=m.points.find(x=>x.id===id)!;
      expect(p).toBeDefined();
      expect(p.subgroup).toBe(group);
      expect(p.probability).toBe(risk);
      expect(p.probabilityRelation).toBe("≈");
      expect(p.followUp).toBe("3 years");
      expect(p.dose.biologicalDose).toEqual({
        basis:"BED",valueGy:100,alphaBetaGy:10,
      });
      expect(p.dose.schedule).toBeUndefined();
    }
    expect(m.notes?.join(" ")).toMatch(/141|149/);
  });

  it("does not conflate primary liver HCC/CCA control or continuous 2-year model with 3-year KM strata",()=>{
    // Official source p3/p5: 431 primary HCC/CCA lesions
    // primary 3y LC 86%, BED effect logrank p=.972;
    // metastatic 3y overall LC 76%, groups p<.001.
    const liverMetHigh=m.points.find(x=>x.id==="liver-mets-bed10-over100")!;
    const liverMetLow=m.points.find(x=>x.id==="liver-mets-bed10-le100")!;
    expect(liverMetHigh.probability-liverMetLow.probability).toBeCloseTo(.28,10);
    expect(m.applicability?.notes?.join(" ")).toMatch(/HCC|primary liver/i);
    // Different source quantitative result: 2y fitted logistic with
    // TCD50=16 Gy10 and k=74 Gy10 (not 3y group KM estimates).
    expect(separateTwoYearLogistic(80)).toBeCloseTo(.70,2);
    expect(separateTwoYearLogistic(100)).toBeCloseTo(.76,2);
    expect(separateTwoYearLogistic(180)).toBeCloseTo(.90,2);
    expect(separateTwoYearLogistic(100)).not.toBeCloseTo(.93,1);
    expect(m.notes?.join(" ")).toMatch(/2-year|2y/i);
  });
});
