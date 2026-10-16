import { describe, expect, it } from "vitest";
import {
  hytecClinicalConstraints,
  hytecOutcomeModels,
} from "../src/data/evidence/v0.1/index.js";
import { validateConstraintDataset } from "../src/evidence/constraintRegistry.js";
import { validateOutcomeModelDataset } from "../src/evidence/outcomeModelRegistry.js";

/**
 * HyTEC source PDFs and supplements:
 * Redmond 2021 DOI 10.1016/j.ijrobp.2020.10.034, main PDF p7 and
 * supplement EA4 pp8-9. Milano 2021 DOI 10.1016/j.ijrobp.2020.08.013,
 * main PDF pp4-5, 11-12 (Table 3); supplemental Figs E1–E4.
 *
 * Reproduces study-level arithmetic; NOT clinical validation or an
 * individual patient TCP/NTCP calculator.
 */
const redmond = hytecOutcomeModels.find(
  m => m.id === "hytec-brain-mets-1y-local-control",
)!;
const logLogistic = (x: number, td50: number, g50: number) =>
  1 / (1 + (td50 / x) ** (4 * g50));
const sfed = (d: number, n: number, ab: number) => {
  const bed = d * (1 + d / (n * ab));
  return (-ab + Math.sqrt(ab * ab + 4 * ab * bed)) / 2;
};
const milano = hytecClinicalConstraints.filter(
  c => c.sourceId === "milano-2021-hytec-brain",
);

describe("Redmond 2021: source dose basis is prescription margin and LQ SFED20", () => {
  it("pins PTV-margin dose, SFED20 and separate lesion-level 1-year endpoint", () => {
    expect(redmond.sourcePrescriptionBasis).toBe("ptv-margin-prescription");
    expect(redmond.sourceFractionEquivalent).toEqual({
      fractions: 1, alphaBetaGy: 20, symbol: "SFED",
    });
    expect(redmond.points).toHaveLength(4);
    expect(redmond.points.every(p => p.followUp === "1 year")).toBe(true);
    expect(redmond.applicability?.notes?.join(" ")).toMatch(/WBRT|margin/i);
    expect(() => validateOutcomeModelDataset()).not.toThrow();
  });

  it("reproduces article Table 2 SFED20, without replacing source model alpha/beta with default", () => {
    expect(sfed(20,1,20)).toBeCloseTo(20,12);
    expect(sfed(30,3,20)).toBeCloseTo(21.622776601683793,10);
    expect(sfed(35,5,20)).toBeCloseTo(22.326459750489228,10);
    // Fractionation-conversion sensitivity to assumed alpha/beta:
    expect(sfed(30,3,2)).toBeCloseTo(18,10);
    expect(sfed(35,5,2)).toBeCloseTo(16.8,1);
    expect(sfed(30,3,20)).not.toBeCloseTo(sfed(30,3,2),1);
  });

  it("does not substitute 2-year local control and per-patient overall survival for 1-year lesion LC", () => {
    const oneYear = logLogistic(18,11.21,.9749);
    const twoYear = logLogistic(18,13.88,1.3542);
    expect(oneYear).toBeCloseTo(.8637410748548232,11);
    expect(twoYear).toBeCloseTo(.8034423779211698,11);
    expect(oneYear-twoYear).toBeGreaterThan(.06);
    expect(redmond.points.find(p=>p.id==="brain-mets-le20mm-18gy-1fx")?.probability)
      .toBe(.85); // source text "greater than 85%"
  });
});

describe("Milano 2021: source V12 harmonisation is NOT a directly observed contour for each patient", () => {
  it("preserves seven published-risk records and separately marks three 1fx V12 source reconstructions", () => {
    expect(milano).toHaveLength(7);
    const v12=milano.filter(c=>c.metric.kind==="Vx"&&c.metric.xGy===12);
    expect(v12).toHaveLength(3);
    expect(v12.every(c=>c.volumeBasis==="target-inclusive-tissue")).toBe(true);
    expect(v12.every(c=>c.volumeBasisDerivation==="mixed-reported-and-estimated"))
      .toBe(true);
    const v20v24=milano.filter(c=>c.metric.kind==="Vx"&&
      (c.metric.xGy===20 || c.metric.xGy===24));
    expect(v20v24).toHaveLength(4);
    expect(v20v24.every(c=>c.volumeBasis==="target-inclusive-tissue")).toBe(true);
    expect(v20v24.every(c=>c.volumeBasisDerivation===undefined)).toBe(true);
    expect(()=>validateConstraintDataset()).not.toThrow();
  });

  it("does not treat Table3 Korytko 1fx V12 any-necrosis as pooled symptomatic V12",()=>{
    // Table 3 original p12. Different model cohorts and clinical endpoints:
    const table3=[
      {volume:5,other:.036,korytko:.196},
      {volume:10,other:.048,korytko:.258},
      {volume:20,other:.086,korytko:.415},
    ];
    for(const p of table3){
      expect(p.korytko).toBeGreaterThan(p.other*4);
    }
    expect(milano.find(c=>c.id==="hytec-brain-v12-5cc-symptomatic-rn")
      ?.estimatedRisk).toBe(.10);
    expect(milano.filter(c=>c.endpointId==="brain-symptomatic-radionecrosis"))
      .toHaveLength(3);
    expect(milano.filter(c=>c.endpointId==="brain-necrosis-edema-any"))
      .toHaveLength(2);
    expect(milano.filter(c=>c.endpointId==="brain-radionecrosis-resection"))
      .toHaveLength(2);
  });

  it("keeps Table 3 1/3/5fx physical Vx equivalence only for source assumed alpha/beta2",()=>{
    const bed=(d:number,n:number)=>d*(1+d/n/2);
    for(const [single,multi,n] of [[12,19.6,3],[12,24.4,5],[14,23.1,3],[14,28.8,5]] as const){
      expect(Math.abs(bed(single,1)-bed(multi,n))).toBeLessThan(.38);
    }
    // Equal BED at the source's alpha/beta is not equal DVH contour,
    // clinical endpoint or independently validated NTCP.
  });
});
