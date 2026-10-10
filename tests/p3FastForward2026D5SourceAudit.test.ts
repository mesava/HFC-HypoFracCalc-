import { describe, expect, it } from "vitest";
import source from "../docs/P3_FAST_FORWARD_2026_TABLE_D5_SOURCE_CROSSWALK_2026-10.csv?raw";
import { alphaBetaEstimates } from "../src/data/evidence/v0.1/index.js";
import { eqdGy } from "../src/core/lq.js";

/** Original user provided FAST-Forward 2026 Supplement PDF, Table D5, PDF p21
 * (printed p20). Text and page image read. Original raw PDF checksum was NOT
 * available; no patient-level Cox/GEE re-fit or clinical approval.
 * Main paper: DOI 10.1016/S1470-2045(26)00076-8 PMID 42134381.
 */
const entries=source.trimEnd().split(/\r?\n/),keys=entries[0]!.split(",");
const rows=entries.slice(1).map((line,i)=>{const cells=line.split(",");if(cells.length!==keys.length)throw Error("FAST-Forward D5 CSV malformed row "+(i+2));return Object.fromEntries(keys.map((key,j)=>[key,cells[j]!])) as Record<string,string>});
const sourceModels=[
["ab-breast-ibr-fastforward2026-unadjusted","unadjusted",3.4,1.6,5.2,[45.0,44.0,41.4]],
["ab-breast-ibr-fastforward2026-adjusted","adjusted",3.3,1.9,4.9,[45.0,44.3,41.7]],
["ab-breast-chestwall-any-ae-fastforward2026","unadjusted",2.1,1.6,2.6,[46.5,49.4,46.3]],
["ab-breast-chestwall-any-ae-fastforward2026","adjusted",2.1,1.6,2.6,[46.6,49.5,46.2]],
] as const;
const regimen=[[40,15],[27,5],[26,5]] as const;
describe("P3.10 user original FAST-Forward 2026 Table D5 source and EQD2",()=>{
 it("has exactly 3 HFC evidence IDs and 12 source-published endpoint/model/regimen cells",()=>{
  expect(rows).toHaveLength(12);
  expect(new Set(rows.map(x=>x.record_id)).size).toBe(3);
  expect(rows.every(x=>x.original_source_locator==="Appendix_Table_D5_file_page21_printed_page20")).toBe(true);
  expect(rows.every(x=>x.primary_user_file_page_text_and_image_verified==="true")).toBe(true);
  expect(rows.every(x=>x.user_PDF_SHA256_verified==="false" && x.independent_patient_level_refit==="false" && x.clinical_release_approved==="false")).toBe(true);
 });
 it("locks primary source point+CI, model identity, adjusted/unadjusted variants and source printed EQD2",()=>{
  let largest=0;
  for(const [id,variant,ab,low,high,sourceEqds] of sourceModels){
   const matching=rows.filter(x=>x.record_id===id && x.source_variant===variant);
   expect(matching).toHaveLength(3);
   const hfc=alphaBetaEstimates.find(x=>x.id===id);
   if(!hfc)throw Error("Missing HFC source record "+id);
   expect(hfc.sourceId).toBe("brunt-2026-fast-forward-10y");
   expect(hfc.valueGy).toBe(ab);
   expect(hfc.ci95).toEqual({level:.95,low,high});
   for(let k=0;k<3;k++){
    const [D,n]=regimen[k]!;
    const row=matching.find(x=>Number(x.regimen_total_Gy)===D && Number(x.regimen_fractions)===n);
    if(!row)throw Error("Missing source regimen "+id+variant+D);
    expect(Number(row.source_alpha_beta_Gy)).toBe(ab);
    expect(Number(row.source_95ci_low_Gy)).toBe(low);
    expect(Number(row.source_95ci_high_Gy)).toBe(high);
    expect(Number(row.published_EQD2_Gy)).toBe(sourceEqds[k]);
    expect(row.fit_model).toBe(id.includes("ibr")?"Cox":"GEE");
    const independent=eqdGy({fractions:n,dosePerFractionGy:D/n},ab);
    const diff=Math.abs(independent-Number(row.published_EQD2_Gy));
    largest=Math.max(largest,diff);
    // Authors printed one-decimal alpha/beta yet used full-precision fits.
    expect(diff).toBeLessThan(0.15);
   }
  }
  expect(largest).toBeGreaterThan(.1);
 });
 it("does not confuse identical rounded NTE alpha/beta with equal precise adjusted EQD2",()=>{
  const eqd=(variant:string,D:number)=>Number(rows.find(x=>x.record_id==="ab-breast-chestwall-any-ae-fastforward2026" && x.source_variant===variant && Number(x.regimen_total_Gy)===D)!.published_EQD2_Gy);
  expect(eqd("unadjusted",27)).toBe(49.4);
  expect(eqd("adjusted",27)).toBe(49.5);
  expect(eqd("unadjusted",26)).toBe(46.3);
  expect(eqd("adjusted",26)).toBe(46.2);
  expect(rows.every(x=>x.clinical_release_approved==="false")).toBe(true);
 });
 it("keeps source-specific default eligibility and explicit clinical context unchanged",()=>{
  const adjusted=alphaBetaEstimates.find(x=>x.id==="ab-breast-ibr-fastforward2026-adjusted")!;
  const unadjusted=alphaBetaEstimates.find(x=>x.id==="ab-breast-ibr-fastforward2026-unadjusted")!;
  const nte=alphaBetaEstimates.find(x=>x.id==="ab-breast-chestwall-any-ae-fastforward2026")!;
  expect(adjusted.defaultEligible).toBe(true);
  expect(unadjusted.defaultEligible).toBe(false);
  expect(nte.defaultEligible).toBe(true);
  expect(adjusted.applicability?.notes?.join(" ")).toMatch(/page 21/i);
 });
});
