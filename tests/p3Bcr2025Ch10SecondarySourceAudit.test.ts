import { describe, expect, it } from "vitest";
import source from "../docs/P3_BCR_2025_CH10_FOUR_RECORD_SOURCE_CROSSWALK_2026-10.csv?raw";
import { alphaBetaEstimates, repopulationRateEstimates } from "../src/data/evidence/v0.1/index.js";
import { getRepopulationEstimates } from "../src/evidence/repopulationRegistry.js";

/** P3.11 original user-supplied SECONDARY BCR Chapter 10 PDF:
 * page 120 printed 105 Table10.1 (text), page123 printed108 Table10.3 (text+image).
 * No original primary cohort fit, no clinical approval; binary SHA unavailable.
 */
const lines=source.trimEnd().split(/\r?\n/), head=lines[0]!.split(",");
const rows=lines.slice(1).map((line,i)=>{const cells=line.split(",");if(cells.length!==head.length)throw Error("BCR source matrix malformed "+(i+2));return Object.fromEntries(head.map((h,j)=>[h,cells[j]!])) as Record<string,string>});
const values=[
["ab-bowel-stricture-perforation-bcr2025",3.9,2.5,5.3,"",120,"table10_1",false],
["dprolif-hn-various-bcr2025",.80,.50,1.10,"21",123,"table10_3",true],
["dprolif-hn-larynx-bcr2025",.74,.30,1.20,"",123,"table10_3",true],
["dprolif-hn-various-alternative-bcr2025",.64,.42,.86,"",123,"table10_3",false],
] as const;
describe("P3.11 BCR 2025 exact secondary table source fidelity without false primary validation",()=>{
 it("guards four independent source identifiers and original BCR page and provenance flags",()=>{
  expect(rows).toHaveLength(4);
  expect(new Set(rows.map(x=>x.record_id)).size).toBe(4);
  for(const [id,n,lo,hi,Tk,page,table,bcrSupplied] of values){
   const row=rows.find(x=>x.record_id===id);
   if(!row)throw Error("Missing secondary textbook row "+id);
   expect(row.source_table).toBe(table);
   expect(Number(row.source_file_page_1indexed)).toBe(page);
   expect(Number(row.source_point_Gy_or_Gy_day)).toBe(n);
   expect(Number(row.source_95CL_low)).toBe(lo);
   expect(Number(row.source_95CL_high)).toBe(hi);
   expect(row.source_Tk_days).toBe(Tk);
   expect(row.source_is_secondary).toBe("true");
   expect(row.user_BCR_supplied).toBe(String(bcrSupplied));
   expect(row.primary_origin_paper_verified).toBe("false");
   expect(row.source_page_image_verified).toBe(page===123?"true":"false");
   expect(row.clinical_release_approved).toBe("false");
   expect(row.default_eligible).toBe("false");
  }
 });
 it("preserves one bowel alpha/beta as explicit-only secondary, no primary Deore model approval",()=>{
  const row=rows.find(x=>x.record_id==="ab-bowel-stricture-perforation-bcr2025")!;
  const a=alphaBetaEstimates.find(x=>x.id===row.record_id)!;
  expect(a).toBeDefined();
  expect(a.sourceId).toBe("bcr-2025-ch10-tables");
  expect(a.valueGy).toBe(3.9);
  expect(a.ci95).toEqual({level:.95,low:2.5,high:5.3});
  expect(a.defaultEligible).toBe(false);
  expect(a.supportReason).toMatch(/SECONDARY source fidelity/);
 });
 it("does not reactivate two deprecated head-neck BCR entries and keeps Hendry review-only",()=>{
  for(const [id,val,low,high] of [
   ["dprolif-hn-various-bcr2025",.80,.50,1.10],
   ["dprolif-hn-larynx-bcr2025",.74,.30,1.20],
   ["dprolif-hn-various-alternative-bcr2025",.64,.42,.86]
  ] as const){
   const r=repopulationRateEstimates.find(x=>x.id===id)!;
   expect(r).toBeDefined();expect(r.rateGyPerDay).toBe(val);
   expect(r.ci95).toEqual({level:.95,low,high});
   expect(r.basis).toBe("EQD2");
   expect(r.defaultEligible).toBe(false);
   expect(r.supportReason).toMatch(/P3.11/);
   if(id==="dprolif-hn-various-alternative-bcr2025"){
     expect(r.status).toBe("reviewed");
     expect(r.supportReason).toMatch(/pooled estimate/i);
   }else{
     expect(r.status).toBe("deprecated");
     expect(getRepopulationEstimates(r.endpointId).some(x=>x.id===id)).toBe(false);
   }
  }
  expect(repopulationRateEstimates.find(x=>x.id==="dprolif-hn-various-bcr2025")!.kickOffDays).toBe(21);
 });
});
