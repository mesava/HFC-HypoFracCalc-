import { describe, expect, it } from "vitest";
import csv from "../docs/P3_REPOPULATION_14_SOURCE_CROSSWALK_2026-10.csv?raw";
import { repopulationRateEstimates } from "../src/data/evidence/v0.1/index.js";
import { resolveRepopulationSelection } from "../src/evidence/repopulationRegistry.js";
import { bedRateToEqdRate } from "../src/core/repopulation.js";

/**
 * P3.6 source-abstract-only numeric test: CHART 2001 PMID 11439207;
 * Roberts 1994 PMID 8087485; Hinata 2001 PMID 11383644;
 * Haviland 2016 PMID 27666929. NOT PDF/page, clinical or basis verification.
 */
const lines=csv.trimEnd().split(/\r?\n/);
const head=lines[0]!.split(",");
const records=lines.slice(1).map((line,i)=>{
  const vals=line.split(",");
  if(vals.length!==head.length)throw Error("Malformed P3.6 CSV row "+(i+2));
  return Object.fromEntries(head.map((h,j)=>[h,vals[j]!])) as Record<string,string>;
});
const numerical = [
  ["dprolif-mucosa-chart2001", .8,.7,1.1,"11439207"],
  ["dprolif-skin-erythema-chart2001", .12,-.12,.22,"11439207"],
  ["dprolif-larynx-roberts1994", .8,.5,1.1,"8087485"],
  ["dprolif-medulloblastoma-bcr2025", .52,.29,.75,"11383644"],
  ["dprolif-medulloblastoma-tk21-hinata2001", .55,.30,.80,"11383644"],
  ["dprolif-breast-bcr2025", .60,.10,1.18,"27666929"],
] as const;
const idRecord=(id:string)=>{
 const x=repopulationRateEstimates.find(r=>r.id===id);
 if(!x)throw Error("missing HFC repopulation record "+id);
 return x;
};
describe("P3.6 14-record repopulation primary-abstract and dose-basis integrity",()=>{
 it("reconciles 14 current HFC IDs and remains draft/unapproved",()=>{
  expect(records).toHaveLength(14);
  expect(new Set(records.map(r=>r.record_id)).size).toBe(14);
  expect(new Set(repopulationRateEstimates.map(r=>r.id))).toEqual(new Set(records.map(r=>r.record_id)));
  expect(records.filter(r=>r.source_validation_depth==="author_abstract_numeric_matched_full_model_pending")).toHaveLength(6);
  expect(records.filter(r=>r.source_validation_depth==="pending_primary_numeric_and_units")).toHaveLength(8);
  expect(records.every(r=>r.clinical_approved==="false")).toBe(true);
  expect(records.filter(r=>r.pdf_original_user_supplied==="true")).toHaveLength(2);
 });
 it("retains six exact source-abstract parameter and 95% CI values with required endpoints",()=>{
  for(const [id,mean,low,high,pmid] of numerical){
   const row=records.find(r=>r.record_id===id)!;
   const hfc=idRecord(id);
   expect(row).toBeDefined();
   expect(row.primary_pmid).toBe(pmid);
   expect(row.source_id).toBe(hfc.sourceId);
   expect(Number(row.published_parameter_gy_per_day)).toBe(mean);
   expect(Number(row.published_ci95_low)).toBe(low);
   expect(Number(row.published_ci95_high)).toBe(high);
   expect(hfc.rateGyPerDay).toBe(mean);
   expect(hfc.ci95).toEqual({level:.95,low,high});
   expect(hfc.defaultEligible).toBe(false);
   expect(hfc.basis).toBe("EQD2"); // EXISTING implementation; source basis remains OPEN.
  }
  expect(idRecord("dprolif-skin-erythema-chart2001").ci95!.low).toBeLessThan(0);
  expect(idRecord("dprolif-larynx-roberts1994").kickOffDays).toBe(21);
  expect(idRecord("dprolif-medulloblastoma-bcr2025").kickOffDays).toBe(0);
  expect(idRecord("dprolif-medulloblastoma-tk21-hinata2001").kickOffDays).toBe(21);
  expect(idRecord("dprolif-breast-bcr2025").kickOffDays).toBeUndefined();
 });
 it("never treats primary tBED gamma/alpha as independently validated EQD2 Gy/day",()=>{
  const ids=["dprolif-medulloblastoma-bcr2025","dprolif-medulloblastoma-tk21-hinata2001"];
  for(const id of ids){
    const row=records.find(r=>r.record_id===id)!;
    const record=idRecord(id);
    expect(row.source_dose_basis_interpretation).toBe("tBED_gamma_over_alpha_BED_per_day_not_EQD2");
    const resolved=resolveRepopulationSelection(record.endpointId,{selectionMode:"evidence",parameterRecordId:id});
    expect(resolved.warnings.join(" ")).toMatch(/dose-basis blocker/i);
    expect(resolved.warnings.join(" ")).toMatch(/BED.*EQD2/i);
    expect(record.defaultEligible).toBe(false);
  }
  // Mathematical dimension check only, NOT an approved update to source parameters:
  expect(bedRateToEqdRate(.52,10)).toBeCloseTo(.52/1.2,12);
  expect(bedRateToEqdRate(.55,10)).toBeCloseTo(.55/1.2,12);
  expect(bedRateToEqdRate(.52,10)).not.toBeCloseTo(.52,2);
 });
 it("does not fabricate model coefficients or CIs for eight source-review pending records",()=>{
  for(const row of records.filter(r=>r.source_validation_depth==="pending_primary_numeric_and_units")){
    expect(row.published_parameter_gy_per_day).toBe("");
    expect(row.published_ci95_low).toBe("");
    expect(row.published_ci95_high).toBe("");
    expect(row.primary_pmid).toBe("");
    expect(row.clinical_approved).toBe("false");
  }
 });
});
