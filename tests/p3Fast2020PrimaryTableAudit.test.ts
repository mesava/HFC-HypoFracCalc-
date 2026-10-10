import { describe, expect, it } from "vitest";
import original from "../docs/P3_FAST_2020_TABLE4_SOURCE_CROSSWALK_2026-10.csv?raw";
import { alphaBetaEstimates } from "../src/data/evidence/v0.1/index.js";
import { eqdGy } from "../src/core/lq.js";

/** Brunt et al 2020 DOI 10.1200/JCO.19.02750 Table 4 p3270,
 * source publication PMC7526720 + original author posted table text.
 * This is source number/CI/EQD2 reconstruction only; NOT clinical approval,
 * GEE patient data refit or original user PDF binary verification.
 */
const a=original.trimEnd().split(/\r?\n/), keys=a[0]!.split(",");
const rows=a.slice(1).map((line,i)=>{const parts=line.split(",");if(parts.length!==keys.length)throw Error("P3.8 table CSV count line "+(i+2));return Object.fromEntries(keys.map((x,j)=>[x,parts[j]!])) as Record<string,string>});
const expected=[
["ab-breast-photo-fast2020",2.7,1.5,3.9,55.7,51.0,true],
["ab-breast-photo-fast2020-adjusted",2.5,1.1,3.9,56.4,51.7,false],
["ab-breast-any-nte-fast2020",2.5,1.8,3.3,56.4,51.7,true],
["ab-breast-shrinkage-fast2020",2.7,1.9,3.5,55.5,50.9,true],
["ab-breast-induration-fast2020",1.6,0,4.4,63.7,58.1,false],
["ab-breast-telangiectasia-fast2020",3.1,2.3,3.9,53.5,49.1,true],
["ab-breast-edema-fast2020",1.9,null,null,60.3,55.2,false]
] as const;
describe("P3.8 FAST 2020 primary article table four seven endpoints",()=>{
 it("has exact 7 distinct published α/β values and appropriate source uncertainties",()=>{
  expect(rows).toHaveLength(7);
  expect(new Set(rows.map(x=>x.record_id)).size).toBe(7);
  for(const [id,ab,low,high,eqd30,eqd28,auto] of expected){
   const x=rows.find(y=>y.record_id===id);if(!x)throw Error("No FAST Table 4 row "+id);
   const record=alphaBetaEstimates.find(y=>y.id===id);if(!record)throw Error("No FAST HFC row "+id);
   expect(record.sourceId).toBe("brunt-2020-fast-10y");
   expect(x.source_doi).toBe("10.1200/JCO.19.02750");
   expect(x.source_table_locator).toBe("Table4_print_p3270");
   expect(Number(x.source_alpha_beta_Gy)).toBe(ab);
   expect(record.valueGy).toBe(ab);
   expect(record.defaultEligible).toBe(auto);
   expect(x.original_user_PDF_binary_verified).toBe("false");
   expect(x.clinical_release_approved).toBe("false");
   if(low===null || high===null){
     expect(x.uncertainty_semantics).toBe("no_source_CI");
     expect(x.source_CI95_low_Gy).toBe("");
     expect(x.source_CI95_high_Gy).toBe("");
     expect(record.ci95).toBeUndefined();
   }else{
     expect(Number(x.source_CI95_low_Gy)).toBe(low);
     expect(Number(x.source_CI95_high_Gy)).toBe(high);
     expect(record.ci95).toEqual({level:.95,low,high});
   }
   // Published EQD2 computed with possibly unrounded source alpha/beta.
   // Independently recomputed from displayed rounded values; tolerance <=0.6 Gy.
   expect(Math.abs(eqdGy({fractions:5,dosePerFractionGy:6},ab)-eqd30)).toBeLessThan(0.6);
   expect(Math.abs(eqdGy({fractions:5,dosePerFractionGy:5.7},ab)-eqd28)).toBeLessThan(0.6);
  }
 });
 it("does not silently turn 0-truncated source lower confidence bound into a hard biological limit",()=>{
  const x=rows.find(y=>y.record_id==="ab-breast-induration-fast2020")!;
  expect(x.uncertainty_semantics).toBe("CI_lower_clipped_at_zero");
  expect(Number(x.source_CI95_low_Gy)).toBe(0);
  expect(x.default_eligible).toBe("false");
 });
 it("all FAST cohort schedules preserve once-weekly 5fx context and original exact comparator",()=>{
  const note=alphaBetaEstimates.find(x=>x.id==="ab-breast-photo-fast2020")!.applicability!;
  expect(note.notes?.join(" ")).toMatch(/once weekly/i);
  expect(note.fractionCountRange).toEqual({min:5,max:25});
  expect(rows.some(x=>x.source_primary_fulltext_access==="publisher_article_PMC_text_and_author_upload_table4")).toBe(true);
 });
});
