import { describe, expect, it } from "vitest";
import audit from "../docs/P6_2E_F_ALL_20_REPAIR_REPOP_BCR2025_TABLE10_2_10_3_2026-11-01.csv?raw";
import { repairHalfTimeEstimates, repopulationRateEstimates, evidenceManifest } from "../src/data/evidence/v0.1/index.js";
import { getRepopulationSourceBlocker, getRepopulationEstimates, defaultRepopulationSelection, resolveRepopulationSelection } from "../src/evidence/repopulationRegistry.js";
import { bedRateToEqdRate } from "../src/core/repopulation.js";

function parseCsv(csv:string):Record<string,string>[] {
 const lines:string[][]=[];let quote=false,cell="",cols:string[]=[];
 for(let i=0;i<csv.length;i++){const ch=csv[i]!;
  if(ch==='"'){if(quote&&csv[i+1]==='"'){cell+='"';i++;}else quote=!quote;}
  else if(ch===','&&!quote){cols.push(cell);cell="";}
  else if((ch==='\n'||ch==='\r')&&!quote){
   if(ch==='\r'&&csv[i+1]==='\n')i++;
   cols.push(cell);if(cols.some(x=>x!==""))lines.push(cols);
   cols=[];cell="";
  }else cell+=ch;
 }
 if(quote)throw new Error("Unclosed CSV field");
 if(cols.length||cell){cols.push(cell);lines.push(cols);}
 const fields=lines.shift()!;
 return lines.map((v,i)=>{if(v.length!==fields.length)throw new Error("P6.2e/f CSV row "+i);return Object.fromEntries(fields.map((k,j)=>[k,v[j]!]))});
}
const rows=parseCsv(audit),rep=rows.filter(r=>r.family==="repopulation-time"),half=rows.filter(r=>r.family==="repair-half-time");
describe("P6.2e/f supplied BCR2025 Tables10.2/10.3 source specificity",()=>{
 it("matches all and only 6+14 current scientific source IDs without changing code status/default",()=>{
  expect(repairHalfTimeEstimates).toHaveLength(6);
  expect(repopulationRateEstimates).toHaveLength(14);
  expect(rows).toHaveLength(20);
  expect(half).toHaveLength(6);expect(rep).toHaveLength(14);
  expect(new Set(rows.map(r=>r.record_id)).size).toBe(20);
  const all=[...repairHalfTimeEstimates,...repopulationRateEstimates];
  expect(rows.map(r=>r.record_id).sort()).toEqual(all.map(r=>r.id).sort());
  for(const r of rows){
   const actual=all.find(x=>x.id===r.record_id)!;
   expect(r.source_id).toBe(actual.sourceId);
   expect(r.endpoint_id).toBe(actual.endpointId);
   expect(r.hfc_status).toBe(actual.status);
   expect(r.hfc_default_eligible).toBe(String(actual.defaultEligible));
   expect(r.primary_original_equation_reproduced).toBe("false");
   expect(r.independent_EQD2_normalization_verified).toBe("false");
   expect(r.clinical_release_approved).toBe("false");
   expect(Number(r.source_pdf_page)).toBe(r.family==="repair-half-time"?122:123);
   if(actual.parameter==="repair-half-time"){
    if(actual.valueHours!==undefined)expect(Number(r.hfc_record_value_or_range)).toBe(actual.valueHours);
    if(actual.ci95){expect(Number(r.hfc_ci95_low)).toBe(actual.ci95.low);expect(Number(r.hfc_ci95_high)).toBe(actual.ci95.high);}
   }else{
    expect(Number(r.hfc_record_value_or_range)).toBe(actual.rateGyPerDay);
    expect(r.hfc_declared_dose_basis).toBe(actual.basis);
    expect(r.hfc_tk_days).toBe(actual.kickOffDays===undefined?"":String(actual.kickOffDays));
   }
  }
  expect(evidenceManifest.releaseStatus).toBe("draft");
 });
 it("preserves numeric BCR match while refusing to assert 0.55/Tk21 is separate textbook row",()=>{
  expect(rows.filter(x=>x.exact_BCR_point_value_match==="true")).toHaveLength(19);
  const special=rep.find(x=>x.record_id==="dprolif-medulloblastoma-tk21-hinata2001")!;
  expect(special.source_reported_value).toBe("");
  expect(special.hfc_record_value_or_range).toBe("0.55");
  expect(special.exact_BCR_point_value_match).toBe("secondary_not_a_separate_table_row");
  expect(special.source_classification).toContain("additional_primary_point");
 });
 it("does not mistake qualitative recovery ranges or lower bounds for point estimates",()=>{
  const row=(id:string)=>half.find(x=>x.record_id===id)!;
  for(const [id,v] of [
    ["t12-laryngeal-edema-chart1999","4.9"],
    ["t12-skin-telangiectasia-chart1999","3.8"],
    ["t12-subcutis-fibrosis-chart1999","4.4"]
  ] as const)expect(row(id).source_reported_value).toBe(v);
  expect(row("t12-oral-mucositis-bcr2025").source_classification).toBe("qualitative_range_no_CI");
  expect(row("t12-oral-mucositis-bcr2025").source_reported_value).toBe("2–4");
  expect(row("t12-spinal-cord-myelopathy-bcr2025").source_reported_value).toBe(">5");
  expect(row("t12-temporal-lobe-necrosis-bcr2025").source_reported_value).toBe(">4");
  for(const r of half.filter(x=>(x.source_classification ?? "").includes("lower_bound"))){
   expect(r.hfc_status).toBe("deprecated");
   expect(r.hfc_default_eligible).toBe("false");
   expect(r.source_reported_ci95_low).toBe("");
  }
 });
 it("flags BCR 95CL not copied as primary-derived HFC confidence intervals",()=>{
  const lung=rep.find(x=>x.record_id==="dprolif-lung-pneumonitis-bentzen2000")!;
  expect([lung.source_reported_value,lung.source_reported_ci95_low,lung.source_reported_ci95_high]).toEqual(["0.54","0.13","0.95"]);
  expect([lung.hfc_ci95_low,lung.hfc_ci95_high]).toEqual(["",""]);
  const prostate=rep.find(x=>x.record_id==="dprolif-prostate-bcr2025")!;
  expect([prostate.source_reported_ci95_low,prostate.source_reported_ci95_high,prostate.source_reported_tk]).toEqual(["0.03","0.44","52"]);
  expect(prostate.hfc_ci95_low).toBe("");expect(prostate.hfc_tk_days).toBe("");
  expect(prostate.source_specific_warning).toContain("cut point");
 });
 it("preserves no automatic Dprolif and four source-level explicit-ID blockers",()=>{
  expect(repopulationRateEstimates.every(x=>x.defaultEligible===false)).toBe(true);
  let blocked=0,allowed=0;
  for(const r of repopulationRateEstimates){
   expect(defaultRepopulationSelection(r.endpointId)).toBeUndefined();
   if(getRepopulationSourceBlocker(r.id)){
    blocked++;
    expect(getRepopulationEstimates(r.endpointId).some(x=>x.id===r.id)).toBe(false);
    expect(()=>resolveRepopulationSelection(r.endpointId,{selectionMode:"evidence",parameterRecordId:r.id})).toThrow();
   }else allowed++;
  }
  expect(blocked).toBe(4);expect(allowed).toBe(10);
 });
 it("guards difference between RCR Gy_BED/day and BCR Gy_EQD2/day",()=>{
  expect(bedRateToEqdRate(0.9,10)).toBeCloseTo(0.75,12);
  expect(0.9).not.toBe(0.75);
  expect((47-40)*0.7).toBeCloseTo(4.9,12);
  expect(7*0.9).toBeCloseTo(6.3,12);
 });
});
