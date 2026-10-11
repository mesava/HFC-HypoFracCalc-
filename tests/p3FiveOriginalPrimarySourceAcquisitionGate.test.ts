import { describe, expect, it } from "vitest";
import raw from "../docs/P3_FIVE_PRIMARY_FULLTEXT_ACQUISITION_2026-10.csv?raw";
import matrix from "../docs/P3_103_EVIDENCE_SOURCE_AUDIT_STATUS_2026-10.csv?raw";
import {
 alphaBetaEstimates,
 evidenceManifest,
} from "../src/data/evidence/v0.1/index.js";
import {
 defaultAlphaBetaSelection,
 resolveAlphaBetaSelection,
} from "../src/evidence/alphaBetaRegistry.js";

const l=raw.trimEnd().split(/\r?\n/),head=l[0]!.split(",");
const rows=l.slice(1).map((line,i)=>{
 const v=line.split(",");
 if(v.length!==head.length)throw Error("P3.13 primary access matrix inconsistent at row "+(i+2));
 return Object.fromEntries(head.map((key,j)=>[key,v[j]!])) as Record<string,string>;
});
const get=(id:string)=>{
 const a=alphaBetaEstimates.find(x=>x.id===id);
 if(!a)throw Error("P3.13 unresolved alpha/beta not found: "+id);
 return a;
};
const sourceRow=(id:string)=>matrix.split(/\r?\n/).find(s=>s.startsWith(id+","))!;
describe("P3.13 source fulltext acquisition gate and auto-default provenance warning",()=>{
 it("tracks exactly five distinct missing-original-numeric-CI papers and no false source upgrade",()=>{
  expect(rows).toHaveLength(5);
  expect(new Set(rows.map(x=>x.record_id)).size).toBe(5);
  for(const row of rows){
    const a=get(row.record_id!);
    expect(Number(row.hfc_alpha_beta_Gy)).toBe(a.valueGy);
    expect(a.ci95).toEqual({level:.95,low:Number(row.hfc_CI95_low_Gy),high:Number(row.hfc_CI95_high_Gy)});
    expect(a.sourceId).toBeDefined();
    expect(row.published_exact_numeric_primary_paper_verified).toBe("false");
    expect(row.original_primary_fulltext_available_and_read).toBe("false");
    expect(row.primary_tables_and_95CI_checked).toBe("false");
    expect(row.original_user_source_file_supplied).toBe("false");
    expect(row.clinical_release_approved).toBe("false");
    expect(row.secondary_numeric_source).toContain("BCR2025_Table10.1");
    expect(sourceRow(row.record_id!)).toContain("p3_primary_numeric_and_uncertainty_crosscheck_pending");
    expect(a.support).toBe("limited");
    expect(a.supportReason).toContain("P3.13");
    expect(a.supportReason).toContain("SECONDARY textbook");
  }
 });
 it("surfaces the unverified source provenance warning even when a draft estimate is automatic",()=>{
  const automatic=rows.filter(x=>x.defaultEligible_preserved==="true");
  expect(automatic).toHaveLength(4);
  const manualOnly=rows.filter(x=>x.defaultEligible_preserved==="false");
  expect(manualOnly.map(x=>x.record_id)).toEqual(["ab-lung-pneumonitis-bentzen2000"]);
  for(const x of automatic){
   const a=get(x.record_id!);
   expect(a.defaultEligible).toBe(true);
   const selection=defaultAlphaBetaSelection(a.endpointId);
   expect(selection?.parameterRecordId).toBe(a.id);
   const resolved=resolveAlphaBetaSelection(a.endpointId,selection!);
   expect(resolved.valueGy).toBe(a.valueGy);
   expect(resolved.warnings.join(" ")).toContain("P3.13");
   expect(resolved.warnings.join(" ")).toMatch(/SECONDARY textbook/);
  }
  expect(get("ab-lung-pneumonitis-bentzen2000").defaultEligible).toBe(false);
 });
 it("blocks promotion of the scientific evidence dataset while any P3.13 auto-default lacks original primary CI",()=>{
  const pendingAutomatic=rows.filter(x=>x.defaultEligible_preserved==="true" && x.primary_tables_and_95CI_checked!=="true");
  expect(pendingAutomatic).toHaveLength(4);
  if(pendingAutomatic.length>0){
    // If anyone promotes evidenceManifest to validated, this must fail until source QA is done.
    expect(evidenceManifest.releaseStatus).toBe("draft");
  }
 });
});
