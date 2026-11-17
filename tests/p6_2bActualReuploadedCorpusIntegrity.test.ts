import {describe,expect,it} from "vitest";
import actualCsv from "../docs/P6_2B_ACTUAL_69_FILE_SHA256_RECONCILIATION_2026-11-01.csv?raw";
import sourceCsv from "../docs/P5_ALL_61_SOURCE_PUBLICATION_COVERAGE_2026-10-16.csv?raw";
import evidenceCsv from "../docs/P5_ALL_103_LIVE_PARAMETER_SOURCE_CROSSWALK_2026-10-16.csv?raw";

function readCsv(input: string): Record<string,string>[] {
  const items:string[][]=[];let current:string[]=[],field="",q=false;
  for(let i=0;i<input.length;i++){
    const c=input[i]!;
    if(c==='"'){if(q&&input[i+1]==='"'){field+='"';i++;}else q=!q;}
    else if(c===','&&!q){current.push(field);field="";}
    else if((c==='\n'||c==='\r')&&!q){
      if(c==='\r'&&input[i+1]==='\n')i++;
      current.push(field);if(current.some(x=>x!==""))items.push(current);
      current=[];field="";
    } else field+=c;
  }
  if(q)throw Error("CSV unterminated quoted field");
  if(current.length||field){current.push(field);items.push(current);}
  const fields=items.shift()!;
  return items.map((xs,index)=>{
    if(xs.length!==fields.length)throw Error("Row "+index+" has "+xs.length+" fields instead of "+fields.length);
    return Object.fromEntries(fields.map((k,j)=>[k,xs[j]!]));
  });
}
const old=readCsv(actualCsv),sources=readCsv(sourceCsv),records=readCsv(evidenceCsv);

describe("P6.2b actual re-uploaded 69-entry source-of-truth audit",()=>{
 it("matches 66/69 original filenames, exact 40 prior SHA, 26 new hashes and three known missing files",()=>{
   expect(old).toHaveLength(69);
   expect(new Set(old.map(x=>x.original_filename)).size).toBe(69);
   expect(old.filter(x=>x.status_2026_11_01==="AVAILABLE_BYTES_VERIFIED")).toHaveLength(66);
   expect(old.filter(x=>x.sha256_comparison==="HISTORICAL_SHA256_MATCH")).toHaveLength(40);
   expect(old.filter(x=>x.sha256_comparison==="NEW_SHA256_BASELINE")).toHaveLength(26);
   expect(old.filter(x=>x.sha256_comparison==="HISTORICAL_SHA256_MISMATCH")).toHaveLength(0);
   expect(old.filter(x=>x.sha256_comparison==="NOT_TESTABLE").map(x=>x.original_filename).sort()).toEqual([
     "Handbook_of_Radiotherapy_Physics_Theory_and_Practice,_Second_Edition.pdf",
     "Linear-Quadratic-Model-in-the-Clinical-Practice-via-the-Web-Application.pdf",
     "Quantitative Radiobiology for Proton Therapy.pdf"
   ].sort());
 });
 it("contains real SHA256, metadata, valid CRC claims and rechecks 40/40 historical HyTEC identities",()=>{
   const present=old.filter(x=>x.status_2026_11_01==="AVAILABLE_BYTES_VERIFIED");
   expect(present.filter(x=>(x.original_filename ?? "").startsWith("HyTEC_"))).toHaveLength(40);
   for(const row of present){
     expect(row.uploaded_sha256).toMatch(/^[a-f0-9]{64}$/);
     expect(Number(row.uploaded_size_bytes)).toBeGreaterThan(0);
     if(row.historic_sha256_2026_10_15){
       expect(row.uploaded_sha256).toBe(row.historic_sha256_2026_10_15);
     }
     if(row.upload_location==="liter(1).zip")expect(row.zip_crc32_passed).toBe("true");
     else expect(row.zip_crc32_passed).toBe("not_applicable_direct_file");
     expect(row.original_paper_full_numerical_audit).toBe("NOT_COMPLETE");
   }
   expect(present.filter(x=>x.upload_location==="liter(1).zip")).toHaveLength(62);
   expect(present.filter(x=>x.upload_location==="direct-upload")).toHaveLength(4);
   expect(present.filter(x=>x.file_type==="pdf")).toHaveLength(49);
   expect(present.reduce((s,x)=>s+Number(x.pdf_pages||0),0)).toBe(2277);
 });
 it("reconciles source and record scope without promoting source presence to clinical evidence",()=>{
   expect(sources).toHaveLength(61);expect(records).toHaveLength(103);
   const loaded=new Set(old.filter(x=>x.status_2026_11_01==="AVAILABLE_BYTES_VERIFIED").map(x=>x.source_id).filter(Boolean));
   expect(sources.filter(x=>loaded.has(x.source_id))).toHaveLength(33);
   expect(records.filter(x=>loaded.has(x.source_id))).toHaveLength(73);
   expect(records.filter(x=>!loaded.has(x.source_id))).toHaveLength(30);
   expect(records.filter(x=>x.clinical_release_approved==="true")).toHaveLength(0);
 });
 it("independently reproduces RCR BED and BCR EQD2 page examples without mixing units",()=>{
   const rcrTotal=35*2*(1+2/10)-(46-28)*0.9;
   expect(rcrTotal).toBeCloseTo(67.8,12);
   expect(7*0.9).toBeCloseTo(6.3,12);
   expect(0.9/(1+2/10)).toBeCloseTo(0.75,12);
   expect((47-40)*0.7).toBeCloseTo(4.9,12);
 });
});
