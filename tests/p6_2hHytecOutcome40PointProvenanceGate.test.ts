import { describe, expect, it } from "vitest";
import sourceAudit from "../docs/P6_2H_ALL_40_OUTCOME_POINTS_9_MODELS_PRIMARY_PROVENANCE_2026-11-02.csv?raw";
import { hytecOutcomeModels, evidenceManifest } from "../src/data/evidence/v0.1/index.js";
function parseCsv(s:string):Record<string,string>[] {
 const rows:string[][]=[];let row:string[]=[],value="",quoted=false;
 for(let i=0;i<s.length;i++){
  const c=s[i]!;
  if(c==='"'){if(quoted&&s[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}
  else if(c===','&&!quoted){row.push(value);value="";}
  else if((c==='\n'||c==='\r')&&!quoted){
    if(c==='\r'&&s[i+1]==='\n')i++;
    row.push(value);if(row.some(x=>x!==""))rows.push(row);row=[];value="";
  } else value+=c;
 }
 if(quoted)throw Error("Unclosed CSV quote");
 if(row.length||value){row.push(value);rows.push(row);}
 const header=rows.shift()!;
 return rows.map((cols,i)=>{
  if(cols.length!==header.length)throw Error("Malformed P6.2h CSV row "+i);
  return Object.fromEntries(header.map((k,j)=>[k,cols[j]!]));
 });
}
const rows=parseCsv(sourceAudit);
describe("P6.2h 9 OutcomeModel source groups / 40 published probability points",()=>{
 it("retains exactly 9 groups / 40 source point IDs, probabilities, source linkage",()=>{
  expect(hytecOutcomeModels).toHaveLength(9);
  expect(rows).toHaveLength(40);
  expect(new Set(rows.map(x=>x.point_id)).size).toBe(40);
  expect(new Set(rows.map(x=>x.model_id)).size).toBe(9);
  const live=hytecOutcomeModels.flatMap(m=>m.points.map(p=>({m,p})));
  expect(live).toHaveLength(40);
  expect(rows.map(x=>x.point_id).sort()).toEqual(live.map(x=>x.p.id).sort());
  for(const {m,p} of live){
   const r=rows.find(x=>x.point_id===p.id)!;
   expect(r.model_id).toBe(m.id);expect(r.source_id).toBe(m.sourceId);
   expect(r.endpoint_id).toBe(m.endpointId);
   expect(Number(r.code_probability)).toBe(p.probability);
   expect(r.source_probability_vs_historical_ledger).toBe("true");
   expect(r.source_reference_equivalence_checked).toBe("true");
   expect(r.patient_specific_tcp_validated).toBe("false");
   if(p.sourceReproducibility==="unresolved-equation-table-mismatch"){
     expect(r.model_reproducibility_flag).toBe("unresolved-equation-table-mismatch");
   }
  }
  expect(evidenceManifest.releaseStatus).toBe("draft");
 });
 it("distinguishes 8 uploaded HyTEC PDF groups vs external Ohri NSCLC primary",()=>{
  const uploaded=rows.filter(r=>r.source_provenance_status==="uploaded_original_pdf_sha_verified");
  const external=rows.filter(r=>r.source_provenance_status==="external_primary_text_not_in_this_upload");
  expect(uploaded).toHaveLength(34);
  expect(external).toHaveLength(6);
  expect(new Set(uploaded.map(x=>x.source_id)).size).toBe(8);
  expect(new Set(external.map(x=>x.source_id))).toEqual(new Set(["ohri-2012-nsclc-size-tcp"]));
  for(const r of uploaded){
    expect(r.uploaded_original_sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(r.original_pdf).toMatch(/^HyTEC_\d\d_.+\.pdf$/);
    expect(r.original_pdf_pages_checked).toMatch(/^\d+(;\d+)*$/);
  }
  for(const r of external){
    expect(r.original_pdf).toBe("NOT_IN_UPLOADED_LITER_ZIP");
    expect(r.uploaded_original_sha256).toBe("NOT_AVAILABLE");
  }
 });
 it("retains Royce's two equation-table mismatches and Ohri original printed 93%",()=>{
  const royce=rows.filter(r=>r.source_id==="royce-2021-hytec-prostate-tcp");
  expect(royce).toHaveLength(4);
  expect(royce.filter(x=>x.model_reproducibility_flag==="unresolved-equation-table-mismatch")).toHaveLength(2);
  const nsclc=rows.find(x=>x.point_id==="nsclc-50gy-5fx-1cm-2y")!;
  expect(nsclc.code_probability).toBe("0.93");
  expect(nsclc.model_reproducibility_flag).toContain("93_vs_independent_formula_94p8");
  expect(rows.filter(x=>x.source_id==="ohri-2012-nsclc-size-tcp")).toHaveLength(6);
 });
 it("does not confuse stratified observational liver LC with a fitted TCP curve",()=>{
  const liver=hytecOutcomeModels.find(x=>x.id==="hytec-liver-metastases-bed10-local-control")!;
  expect(liver.evidenceForm).toBe("stratified-observation");
  expect(liver.points).toHaveLength(2);
  expect(rows.filter(x=>x.model_id===liver.id).every(x=>x.source_context.includes("liver_metastases_only_not_HCC"))).toBe(true);
  const pancreas=rows.filter(x=>x.model_id==="hytec-pancreas-1y-local-control");
  expect(pancreas).toHaveLength(3);
  expect(pancreas.every(x=>x.source_specific_caveat.includes("Resected R0"))).toBe(true);
 });
});
