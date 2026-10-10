import { describe, expect, it } from "vitest";
import csv from "../docs/P3_REPOPULATION_REMAINING_EIGHT_CROSSWALK_2026-10.csv?raw";
import { repopulationRateEstimates } from "../src/data/evidence/v0.1/index.js";
import { getRepopulationEstimates } from "../src/evidence/repopulationRegistry.js";
const lines=csv.trimEnd().split(/\r?\n/), keys=lines[0]!.split(",");
const rows=lines.slice(1).map((line,i)=>{const v=line.split(",");if(v.length!==keys.length)throw Error("bad P3.7 CSV row "+i);return Object.fromEntries(keys.map((k,j)=>[k,v[j]!])) as Record<string,string>});
const find=(id:string)=>{const r=repopulationRateEstimates.find(x=>x.id===id);if(!r)throw Error("missing "+id);return r};
describe("P3.7 remaining eight original time source checks",()=>{
 it("inventories 8 different scientific records without false PDF or clinical approval",()=>{
  expect(rows).toHaveLength(8);expect(new Set(rows.map(x=>x.record_id)).size).toBe(8);
  expect(rows.every(x=>x.full_pdf_checked==="false"&&x.EQD2_units_checked==="false"&&x.clinical_approved==="false")).toBe(true);
 });
 it("reproduces 4 primary abstract point parameters and source-specific alternative",()=>{
  const c=[["dprolif-hn-tonsil-bcr2025",.73,"7558943"],["dprolif-esophagus-pcr-geh2006",.59,"16545878"],["dprolif-nsclc-bcr2025",.45,"8567332"],["dprolif-prostate-bcr2025",.24,"20400191"]] as const;
  for(const [id,v,pmid] of c){const r=rows.find(x=>x.record_id===id)!;expect(Number(r.primary_abstract_point)).toBe(v);expect(r.pmid).toBe(pmid);expect(find(id).rateGyPerDay).toBe(v);expect(r.primary_exact).toBe("true");expect(find(id).defaultEligible).toBe(false)}
  expect(find("dprolif-esophagus-pcr-geh2006").ci95).toEqual({level:.95,low:.18,high:.99});
  expect(find("dprolif-hn-tonsil-bcr2025").kickOffDays).toBe(30);
  expect(find("dprolif-prostate-bcr2025").kickOffDays).toBeUndefined();
 });
 it("does not invent primary 95% CI from QUANTEC's secondary one-standard-error estimate",()=>{
  const r=rows.find(x=>x.record_id==="dprolif-lung-pneumonitis-bentzen2000")!;
  expect(r.primary_exact).toBe("false");expect(r.primary_abstract_point).toBe("");
  expect(r.scope).toMatch(/ONE_SE/);expect(find(r.record_id!).ci95).toBeUndefined();
  expect(find(r.record_id!).rateGyPerDay).toBe(.54);
 });
 it("keeps 3 pending rate records and two BCR entries deprecated",()=>{
  const p=["dprolif-hn-various-bcr2025","dprolif-hn-various-alternative-bcr2025","dprolif-hn-larynx-bcr2025"];
  for(const id of p){const r=rows.find(x=>x.record_id===id)!;expect(r.primary_abstract_point).toBe("");expect(find(id).defaultEligible).toBe(false)}
  for(const id of [p[0]!,p[2]!]){const rec=find(id);expect(rec.status).toBe("deprecated");expect(getRepopulationEstimates(rec.endpointId).some(x=>x.id===id)).toBe(false)}
 });
});
