import { describe, expect, it } from "vitest";
import csv from "../docs/P6_2G_ALL_29_HYTEC_OAR_PRIMARY_PDF_CROSSWALK_2026-11-02.csv?raw";
import { hytecClinicalConstraints, evidenceManifest } from "../src/data/evidence/v0.1/index.js";

function parseCsv(s: string): Record<string,string>[] {
 const rows: string[][]=[];let cols:string[]=[],f="",quote=false;
 for(let i=0;i<s.length;i++){const c=s[i]!;
  if(c==='"'){if(quote&&s[i+1]==='"'){f+='"';i++;}else quote=!quote;}
  else if(c===','&&!quote){cols.push(f);f="";}
  else if((c==='\n'||c==='\r')&&!quote){if(c==='\r'&&s[i+1]==='\n')i++;cols.push(f);if(cols.some(x=>x!==""))rows.push(cols);cols=[];f="";}
  else f+=c;
 }
 if(quote)throw Error("Unterminated CSV quote");
 if(cols.length||f){cols.push(f);rows.push(cols);}
 const names=rows.shift()!;
 return rows.map((v,i)=>{if(v.length!==names.length)throw Error("row "+i);return Object.fromEntries(names.map((k,j)=>[k,v[j]!]));});
}
const rows=parseCsv(csv);
const toRange=(value:number|undefined,range:{low:number;high:number}|undefined):string =>
 range ? range.low+".."+range.high : String(value??"");

describe("P6.2g 29 OAR constraints mapped to 7 uploaded original HyTEC PDFs",()=>{
 it("covers precisely 29 live IDs and preserves source/endpoint/type/metric/fraction",()=>{
  expect(rows).toHaveLength(29);expect(hytecClinicalConstraints).toHaveLength(29);
  expect(new Set(rows.map(r=>r.record_id)).size).toBe(29);
  expect(rows.map(r=>r.record_id).sort()).toEqual(hytecClinicalConstraints.map(x=>x.id).sort());
  const paperSet=new Set<string>();
  for(const c of hytecClinicalConstraints){
   const r=rows.find(x=>x.record_id===c.id)!;
   expect(r.source_id).toBe(c.sourceId);
   expect(r.endpoint_id).toBe(c.endpointId);
   expect(r.primary_sha256).toMatch(/^[a-f0-9]{64}$/);
   paperSet.add(r.primary_file??"");
   expect(r.primary_pdf_pages).toMatch(/^\d+(;\d+)*$/);
   const metric=c.metric.kind==="custom"?c.metric.customLabel:
     (c.metric.kind==="Vx"||c.metric.kind==="VleX")?c.metric.kind+c.metric.xGy:c.metric.kind;
   expect(r.primary_metric).toBe(metric);
   expect(r.live_metric).toBe(metric);
   expect(r.primary_value).toBe(toRange(c.value,c.valueRange));
   expect(r.live_value).toBe(toRange(c.value,c.valueRange));
   const fractions=c.fractionation?.fractions===undefined?
     c.applicability?.fractionCountRange?.min+".."+c.applicability?.fractionCountRange?.max:
     String(c.fractionation.fractions);
   expect(r.primary_fractionation).toBe(fractions);
   expect(r.live_fractionation).toBe(fractions);
   expect(r.primary_evidence_role).toBe(c.guidanceKind);
   expect(r.independent_source_vs_code_metadata_match).toBe("true");
   expect(r.full_source_cohort_statistical_refit).toBe("false");
   expect(r.patient_specific_NTCP_validated).toBe("false");
   expect(r.clinical_release_approved).toBe("false");
  }
  expect(paperSet.size).toBe(7);
  expect(evidenceManifest.releaseStatus).toBe("draft");
 });
 it("keeps source contour definitions and risk-point ≠ planning-limit distinct",()=>{
  const byId=(id:string)=>rows.find(x=>x.record_id===id)!;
  for(const x of rows.filter(x=>x.source_id==="milano-2021-hytec-brain")){
    expect(x.primary_evidence_role).toBe("risk-point");
    expect(x.live_volume_basis).toBe("target-inclusive-tissue");
  }
  for(const x of rows.filter(x=>x.source_id==="sahgal-2021-hytec-spinal-cord")){
    expect(x.source_structure_and_dose_basis).toContain("thecal_sac");
    expect(x.source_limitation).toContain("NOT CI");
  }
  const vessel=byId("hytec-major-vessel-d0p5cc-5fx-20gy");
  const maxRisk=byId("hytec-major-vessel-dmax-5fx-20gy-risk");
  expect(vessel.primary_metric).toBe("D0.5cc");
  expect(vessel.primary_evidence_role).toBe("planning-limit");
  expect(maxRisk.primary_metric).toBe("Dmax");
  expect(maxRisk.primary_evidence_role).toBe("risk-point");
  expect(vessel.source_limitation).toContain("Dmax");
  for(const x of rows.filter(x=>x.source_id==="wang-2021-hytec-prostate-toxicity"))expect(x.primary_evidence_role).toBe("observational-threshold");
 });
 it("locks liver spared-volume VleX, lung combined contour, prescription-relative bladder Vx",()=>{
  for(const dose of [15,17]){
    const r=bySpared(dose);
    expect(r.primary_metric).toBe("VleX"+dose);
    expect(r.primary_value).toBe("700");
    expect(r.live_volume_basis).toBe("normal-liver-minus-gtv");
    expect(r.primary_evidence_role).toBe("observational-threshold");
  }
  const lung=rows.find(x=>x.record_id==="hytec-lung-rilt-v20-10to15pct")!;
  expect(lung.primary_metric).toBe("Vx20");
  expect(lung.primary_value).toBe("10..15");
  expect(lung.live_volume_basis).toBe("bilateral-lungs-minus-gtv-or-igtv");
  const bladder=rows.find(x=>x.record_id==="hytec-prostate-sbrt-bladder-vrx-5to10cc")!;
  expect(bladder.primary_metric).toBe("V(Rx dose)");
  expect(bladder.primary_value).toBe("5..10");
  expect(bladder.source_limitation).toContain("prescription-dependent");
 });
});
function bySpared(dose:number){return rows.find(x=>x.record_id==="hytec-liver-spared-vle"+dose+"gy-700cc")!;}
