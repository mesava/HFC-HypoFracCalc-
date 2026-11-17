import {describe,expect,it} from "vitest";
import table from "../docs/P6_3B_ALL_10_TIME_LOSS_SOURCE_UNIT_QUALIFICATION_2026-10-19.csv?raw";
import {repopulationRateEstimates,evidenceManifest} from "../src/data/evidence/v0.1/index.js";
import {getRepopulationEstimates,getRepopulationSourceBlocker,defaultRepopulationSelection,resolveRepopulationSelection} from "../src/evidence/repopulationRegistry.js";
import {bedRateToEqdRate,eqdRateToBedRate} from "../src/core/repopulation.js";

function parse(data:string):Record<string,string>[] {
 const rows=data.trimEnd().split(/\r?\n/);
 const tokenize=(s:string):string[]=>{let parts:string[]=[],v="",quoted=false;
  for(let i=0;i<s.length;i++){const c=s[i]!;
    if(c==='"'){if(quoted&&s[i+1]==='"'){v+='"';i++;}else quoted=!quoted;}
    else if(c===','&&!quoted){parts.push(v);v="";}else v+=c;
  }
  if(quoted)throw Error("unclosed quoted CSV");parts.push(v);return parts;
 };
 const names=tokenize(rows[0]!);
 return rows.slice(1).map((line,i)=>{
  const cells=tokenize(line);if(cells.length!==names.length)throw Error("CSV row "+i);
  return Object.fromEntries(names.map((k,j)=>[k,cells[j]!]));
 });
}
const rows=parse(table);
describe("P6.3b ten source-specific time-loss rates: numeric source != verified EQD2 model",()=>{
 it("documents all and only 10 explicit-selectable HFC source IDs; none source-normalization approved",()=>{
  const selectable=repopulationRateEstimates.filter(r=>!getRepopulationSourceBlocker(r.id));
  expect(repopulationRateEstimates).toHaveLength(14);
  expect(selectable).toHaveLength(10);
  expect(rows).toHaveLength(10);
  expect(new Set(rows.map(r=>r.record_id)).size).toBe(10);
  expect(rows.map(r=>r.record_id).sort()).toEqual(selectable.map(r=>r.id).sort());
  for(const r of selectable){
   const v=rows.find(x=>x.record_id===r.id)!;
   expect(v.source_id).toBe(r.sourceId);expect(v.endpoint_id).toBe(r.endpointId);
   expect(v.stored_basis).toBe(r.basis);expect(v.stored_basis).toBe("EQD2");
   expect(Number(v.stored_rate_gy_per_day)).toBe(r.rateGyPerDay);
   expect(v.stored_kickoff_days).toBe(r.kickOffDays===undefined?"":String(r.kickOffDays));
   expect(v.source_numeric_transcription_checked).toBe("true");
   expect(v.source_EQD2_equation_and_units_qualified).toBe("false");
   expect(v.full_publisher_equation_reproduced).toBe("false");
   expect(v.patient_specific_model_validated).toBe("false");
   expect(v.clinical_release_approved).toBe("false");
   expect(v.current_runtime_policy).toBe("explicit_only");
   expect(v.primary_source_url).toMatch(/^https:\/\//);
   expect((v.source_tk_semantics ?? "").length).toBeGreaterThan(5);
   expect((v.source_dose_semantics ?? "").length).toBeGreaterThan(15);
   expect(r.defaultEligible).toBe(false);
   expect(defaultRepopulationSelection(r.endpointId)).toBeUndefined();
   expect(getRepopulationEstimates(r.endpointId).some(x=>x.id===r.id)).toBe(true);
   const sel=resolveRepopulationSelection(r.endpointId,{selectionMode:"evidence",parameterRecordId:r.id});
   expect(sel.rateGyPerDay).toBe(r.rateGyPerDay);
   expect(sel.warnings.join(" ")).toMatch(/not eligible for automatic default selection/);
  }
  expect(evidenceManifest.releaseStatus).toBe("draft");
 });
 it("guards two source-associated historical Tk assumptions vs eight missing Tk values",()=>{
   const withTk=rows.filter(x=>x.stored_kickoff_days!=="");
   expect(withTk.map(x=>[x.record_id,x.stored_kickoff_days]).sort()).toEqual([
     ["dprolif-hn-tonsil-bcr2025","30"],
     ["dprolif-larynx-roberts1994","21"]
   ].sort());
   expect(rows.filter(x=>x.stored_kickoff_days==="")).toHaveLength(8);
   expect(rows.find(x=>x.record_id==="dprolif-larynx-roberts1994")!.source_tk_semantics).toContain("non_significant");
   expect(rows.find(x=>x.record_id==="dprolif-hn-tonsil-bcr2025")!.source_tk_semantics).toContain("assumption");
   const prostate=rows.find(x=>x.record_id==="dprolif-prostate-bcr2025")!;
   expect(prostate.stored_kickoff_days).toBe("");
   expect(prostate.source_tk_semantics).toContain("52_day_cut_not_biological_onset");
 });
 it("guards distinct source-statistics and nontransferable normal-tissue endpoints",()=>{
  const skin=rows.find(x=>x.record_id==="dprolif-skin-erythema-chart2001")!;
  expect(skin.context_and_limitations).toMatch(/includes zero/);
  const lung=rows.find(x=>x.record_id==="dprolif-lung-pneumonitis-bentzen2000")!;
  expect(lung.source_numeric_tier).toContain("SE");
  const geh=rows.find(x=>x.record_id==="dprolif-esophagus-pcr-geh2006")!;
  expect(geh.context_and_limitations).toMatch(/neoadjuvant chemoRT/);
  const hendry=rows.find(x=>x.record_id==="dprolif-hn-various-alternative-bcr2025")!;
  expect(hendry.source_dose_semantics).toContain("BCR_secondary_EQD2_day");
 });
 it("continues hard blocking BOTH Hinata tBEDmax and BOTH deprecated source IDs",()=>{
  const blocked=repopulationRateEstimates.filter(r=>getRepopulationSourceBlocker(r.id));
  expect(blocked).toHaveLength(4);
  expect(blocked.filter(x=>x.sourceId==="hinata-2001-medulloblastoma-time")).toHaveLength(2);
  expect(blocked.filter(x=>x.status==="deprecated")).toHaveLength(2);
  for(const r of blocked){
   expect(rows.some(x=>x.record_id===r.id)).toBe(false);
   expect(getRepopulationEstimates(r.endpointId).some(x=>x.id===r.id)).toBe(false);
   expect(()=>resolveRepopulationSelection(r.endpointId,{selectionMode:"evidence",parameterRecordId:r.id})).toThrow();
  }
 });
 it("reproduces RCR example BED10/day K=0.9 to EQD2_10/day K=0.75; alpha/beta must be explicit",()=>{
   expect(bedRateToEqdRate(0.9,10)).toBeCloseTo(0.75,12);
   expect(eqdRateToBedRate(0.75,10)).toBeCloseTo(0.9,12);
   expect(bedRateToEqdRate(0.9,3)).toBeCloseTo(0.54,12);
   expect(bedRateToEqdRate(0.9,10)).not.toBe(0.9);
   expect(bedRateToEqdRate(0.9,10)).not.toBe(bedRateToEqdRate(0.9,3));
 });
});
