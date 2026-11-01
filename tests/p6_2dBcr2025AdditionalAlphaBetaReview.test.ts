import {describe,expect,it} from "vitest";
import ledger from "../docs/P6_2D_14_ADDITIONAL_ALPHA_BETA_BCR2025_SOURCE_GATES_2026-11-01.csv?raw";
import {alphaBetaAdditionalEstimates} from "../src/data/evidence/v0.1/alphaBetaAdditional.js";
import {alphaBetaEstimates,evidenceManifest} from "../src/data/evidence/v0.1/index.js";

function parseCsv(raw:string):Record<string,string>[] {
  const all:string[][]=[];let row:string[]=[],field="",q=false;
  for(let i=0;i<raw.length;i++){let c=raw[i]!;
    if(c==='"'){if(q&&raw[i+1]==='"'){field+='"';i++}else q=!q;}
    else if(c===','&&!q){row.push(field);field="";}
    else if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&raw[i+1]==='\n')i++;row.push(field);if(row.some(x=>x!==""))all.push(row);row=[];field="";}
    else field+=c;
  }
  if(q)throw Error("Bad quote");
  if(row.length||field){row.push(field);all.push(row);}
  const header=all.shift()!;
  return all.map((r,i)=>{if(r.length!==header.length)throw Error("Row "+i);return Object.fromEntries(header.map((k,j)=>[k,r[j]!]))});
}
const entries=parseCsv(ledger);
describe("P6.2d secondary BCR2025 Table10.1 α/β provenance",()=>{
 it("covers 14 additional code records and matches exactly 12 separate BCR Table10.1 rows",()=>{
  expect(alphaBetaEstimates).toHaveLength(44);expect(alphaBetaAdditionalEstimates).toHaveLength(14);expect(entries).toHaveLength(14);
  expect(new Set(entries.map(x=>x.record_id)).size).toBe(14);
  expect(entries.map(x=>x.record_id).sort()).toEqual(alphaBetaAdditionalEstimates.map(x=>x.id).sort());
  const byId=new Map(alphaBetaAdditionalEstimates.map(x=>[x.id,x]));
  const verified=entries.filter(x=>x.verified_tier==="accepted_secondary_BCR2025_table10_1");
  const originalMissing=entries.filter(x=>x.verified_tier==="original_not_in_current_upload_and_not_direct_BCR_table_row");
  expect(verified).toHaveLength(12);expect(originalMissing).toHaveLength(2);
  for(const r of entries){
    const live=byId.get(r.record_id)!;
    expect(r.source_id).toBe(live.sourceId);
    expect(r.defaultEligible_in_current_HFC).toBe(String(live.defaultEligible));
    expect(r.primary_original_model_reproduced).toBe("false");
    expect(r.primary_source_in_uploaded_batch).toBe("false");
    expect(r.source_textbook_sha256).toMatch(/^[0-9a-f]{64}$/);
    if(r.verified_tier.startsWith("accepted_secondary")){
      expect(Number(r.source_alpha_beta_gy)).toBe(live.valueGy);
      expect(Number(r.source_ci95_low_gy)).toBe(live.ci95?.low);
      expect(Number(r.source_ci95_high_gy)).toBe(live.ci95?.high);
      expect(r.hfc_value_CI_matches_textbook).toBe("true");
    } else {
      expect(r.source_alpha_beta_gy).toBe("");
      expect(r.hfc_value_CI_matches_textbook).toBe("not_checkable");
    }
  }
 });
 it("does not mislabel spinal myelopathy values as BCR Table10.1 Dische <3.3",()=>{
  for(const id of ["ab-spinal-cord-myelopathy-jin2015","ab-spinal-cord-myelopathy-schultheiss2008"]){
    const row=entries.find(x=>x.record_id===id)!;
    expect(row.source_textbook_location).toContain("different Dische 1981");
    expect(row.defaultEligible_in_current_HFC).toBe("false");
    expect(row.further_source_work).toContain("obtain primary");
  }
  expect(evidenceManifest.releaseStatus).toBe("draft");
 });
});
