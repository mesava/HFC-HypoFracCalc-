import { describe, expect, it } from "vitest";
import src from "../docs/P3_13_ALPHA_BETA_SOURCE_CROSSWALK_2026-10.csv?raw";
import { alphaBetaEstimates } from "../src/data/evidence/v0.1/index.js";

/** P3.12 primary publisher author abstracts, not independent patient-level fit.
 * Provenance exactness: 6 primary exact CI, 1 primary rounded, 1 point only,
 * 5 context-only; NONE approved for clinical release.
 */
const data=src.trimEnd().split(/\r?\n/),cols=data[0]!.split(",");
const rows=data.slice(1).map((line,i)=>{const parts=line.split(",");if(parts.length!==cols.length)throw Error("Malformed P3.12 CSV row "+(i+2));return Object.fromEntries(cols.map((k,j)=>[k,parts[j]!])) as Record<string,string>});
const status={
 exact:"p3_external_primary_abstract_point_CI_exact_matched_full_pdf_pending",
 rounded:"p3_external_primary_abstract_point_CI_rounded_matched_full_pdf_pending",
 point:"p3_external_primary_abstract_point_only_CI_secondary_pending",
 pending:"p3_primary_numeric_and_uncertainty_crosscheck_pending"
};
const get=(id:string)=>{const a=alphaBetaEstimates.find(x=>x.id===id);if(!a)throw Error("Missing HFC source α/β "+id);return a};
describe("P3.12 residual 13 alpha/beta provenance and source-specific constraints",()=>{
 it("maintains exact 13 unique records with no source PDF binary or clinical approval",()=>{
  expect(rows).toHaveLength(13);
  expect(new Set(rows.map(x=>x.record_id)).size).toBe(13);
  expect(rows.filter(x=>x.source_audit_tier===status.exact)).toHaveLength(6);
  expect(rows.filter(x=>x.source_audit_tier===status.rounded)).toHaveLength(1);
  expect(rows.filter(x=>x.source_audit_tier===status.point)).toHaveLength(1);
  expect(rows.filter(x=>x.source_audit_tier===status.pending)).toHaveLength(5);
  for(const row of rows){
   const rec=get(row.record_id!);
   expect(rec.valueGy).toBe(Number(row.hfc_alpha_beta_Gy));
   expect(rec.ci95).toEqual({level:.95,low:Number(row.hfc_CI95_low_Gy),high:Number(row.hfc_CI95_high_Gy)});
   expect(row.source_original_user_file_supplied).toBe("false");
   expect(row.full_original_PDF_numeric_tables_checked).toBe("false");
   expect(row.clinical_release_approved).toBe("false");
  }
 });
 it("reproduces six exactly published point+CI pairs from specific original models",()=>{
  const originals=[
    ["ab-hn-tumour-control-stuschke1999",10.5,6.5,29],
    ["ab-hn-late-effects-stuschke1999",4,3.3,5],
    ["ab-nsclc-stage-i-stuschke2010",8.2,7,9.4],
    ["ab-esophagus-pcr-geh2006",4.9,1.5,17],
    ["ab-spinal-cord-myelopathy-jin2015",3.7,2.2,8.2],
    ["ab-spinal-cord-myelopathy-schultheiss2008",.87,.54,1.19]
  ] as const;
  for(const [id,estimate,low,high] of originals){
   const row=rows.find(x=>x.record_id===id)!;
   expect(row.source_audit_tier).toBe(status.exact);
   expect([Number(row.primary_reported_point_Gy),Number(row.primary_reported_CI95_low_Gy),Number(row.primary_reported_CI95_high_Gy)]).toEqual([estimate,low,high]);
  }
  expect(rows.find(x=>x.record_id==="ab-spinal-cord-myelopathy-jin2015")!.source_scope_or_warning).toContain("human_group_C_only");
  expect(rows.find(x=>x.record_id==="ab-spinal-cord-myelopathy-schultheiss2008")!.source_scope_or_warning).toContain("cervical");
  expect(rows.find(x=>x.record_id==="ab-hn-late-effects-stuschke1999")!.source_scope_or_warning).toContain("fixed_gamma50_5");
 });
 it("does not confuse Dubray primary source full precision with rounded HFC uncertainty",()=>{
  const x=rows.find(x=>x.record_id==="ab-lung-fibrosis-dubray1995")!;
  expect(x.source_audit_tier).toBe(status.rounded);
  expect([Number(x.primary_reported_point_Gy),Number(x.primary_reported_CI95_low_Gy),Number(x.primary_reported_CI95_high_Gy)]).toEqual([3.07,-.23,8.46]);
  expect(Math.round(Number(x.primary_reported_point_Gy)*10)/10).toBe(get(x.record_id!).valueGy);
  expect(Math.round(Number(x.primary_reported_CI95_low_Gy)*10)/10).toBe(get(x.record_id!).ci95!.low);
  expect(Math.round(Number(x.primary_reported_CI95_high_Gy)*10)/10).toBe(get(x.record_id!).ci95!.high);
  expect(get(x.record_id!).defaultEligible).toBe(false);
 });
 it("does not manufacture 95% CI for Dische 1999 or five source-context-only studies",()=>{
  const dische=rows.find(x=>x.record_id==="ab-bowel-various-late-dische1999")!;
  expect(dische.source_audit_tier).toBe(status.point);
  expect(Number(dische.primary_reported_point_Gy)).toBe(4.3);
  expect(dische.primary_reported_CI95_low_Gy).toBe("");
  expect(dische.primary_reported_CI95_high_Gy).toBe("");
  for(const x of rows.filter(r=>r.source_audit_tier===status.pending)){
   expect(x.primary_reported_point_Gy).toBe("");
   expect(x.primary_reported_CI95_low_Gy).toBe("");
   expect(x.primary_reported_CI95_high_Gy).toBe("");
  }
  expect(rows.find(x=>x.record_id==="ab-oral-mucosa-mucositis-denham1995")!.source_scope_or_warning).toContain("range_7_to10");
  expect(rows.find(x=>x.record_id==="ab-subcutis-fibrosis-bcr2025")!.source_scope_or_warning).toContain("no_alpha_beta_fibrosis_CI");
 });
});
