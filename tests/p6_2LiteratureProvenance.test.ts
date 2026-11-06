import { describe, expect, it } from "vitest";
import originalCsv from "../docs/LITERATURE_MASTER_INVENTORY.csv?raw";
import historicHashCsv from "../docs/HYTEC_40_ORIGINAL_SHA256_VERIFIED_2026-10-15.csv?raw";
import p5RecordsCsv from "../docs/P5_ALL_103_LIVE_PARAMETER_SOURCE_CROSSWALK_2026-10-16.csv?raw";
import p5SourcesCsv from "../docs/P5_ALL_61_SOURCE_PUBLICATION_COVERAGE_2026-10-16.csv?raw";
import p6FilesCsv from "../docs/P6_2_ALL_69_FILE_PROVENANCE_2026-10-19.csv?raw";
import p6SourcesCsv from "../docs/P6_2_ALL_61_SOURCE_TRIAGE_2026-10-19.csv?raw";
import { evidenceManifest } from "../src/data/evidence/v0.1/index.js";

type Row = Record<string,string>;
function parse(raw: string): Row[] {
 const lines=raw.trimEnd().split(/\r?\n/);
 const decode=(s:string):string[]=>{
  const a:string[]=[];let v="",quote=false;
  for(let i=0;i<s.length;i++){const c=s[i]!;
   if(c==='"'){if(quote&&s[i+1]==='"'){v+='"';i++;}else quote=!quote;}
   else if(c===','&&!quote){a.push(v);v="";}
   else v+=c;
  }
  if(quote)throw Error("unclosed quote");
  a.push(v);return a;
 };
 const keys=decode(lines[0]!);
 return lines.slice(1).filter(Boolean).map((l,i)=>{
  const cells=decode(l);if(keys.length!==cells.length)throw Error("CSV row "+i);
  return Object.fromEntries(keys.map((k,j)=>[k,cells[j]!]));
 });
}
const orig=parse(originalCsv),hash=parse(historicHashCsv),oldRec=parse(p5RecordsCsv),oldSrc=parse(p5SourcesCsv),files=parse(p6FilesCsv),sources=parse(p6SourcesCsv);

describe("P6.2 source/archive audit completeness, no false clinical release",()=>{
 it("matches all 69 original file IDs and PREVIOUSLY verified 40 HyTEC SHA256, not inventing new hashes",()=>{
  expect(orig).toHaveLength(69);expect(files).toHaveLength(69);expect(hash).toHaveLength(40);
  const originalByName=new Map(orig.map(r=>[r.original_filename,r]));
  const historyByName=new Map(hash.map(r=>[r.original_filename_inventory,r]));
  expect(new Set(files.map(x=>x.original_filename)).size).toBe(69);
  expect(files.filter(x=>x.historical_sha256)).toHaveLength(40);
  for(const r of files){
    const o=originalByName.get(r.original_filename);
    expect(o).toBeDefined();expect(r.source_id).toBe(o!.source_id);
    expect(r.file_size_bytes).toBe(o!.bytes);
    const h=historyByName.get(r.original_filename);
    expect(r.historical_sha256).toBe(h?.sha256??"");
    expect(r.historical_sha256 ? /^[a-f0-9]{64}$/.test(r.historical_sha256):true).toBe(true);
    expect(r.new_SHA256_computed_in_P6_2).toBe("false");
    expect(r.archive_internal_entry_verified_in_P6_2).toBe("false");
    expect(r.all_pages_figures_tables_verified_in_P6_2).toBe("false");
    expect(r.clinical_numerical_validation).toBe("false");
  }
  expect(files.filter(x=>!x.historical_sha256)).toHaveLength(29);
  expect(files.filter(x=>!x.source_id)).toHaveLength(9);
 });
 it("maps 61 source IDs exactly and preserves 103 evidence source coverage and no clinical sign-off",()=>{
  expect(oldRec).toHaveLength(103);expect(oldSrc).toHaveLength(61);expect(sources).toHaveLength(61);
  const p5=new Map(oldSrc.map(x=>[x.source_id,x]));
  expect(new Set(sources.map(x=>x.source_id)).size).toBe(61);
  for(const s of sources){
   const expected=p5.get(s.source_id)!;expect(expected).toBeDefined();
   expect(s.linked_record_count).toBe(expected.evidence_record_count);
   expect(s.linked_initial_files).toBe(expected.original_69_file_count);
   expect(s.initial_69_file_present).toBe(expected.original_69_file_present);
   const sourceFiles=files.filter(f=>f.source_id===s.source_id);
   expect(sourceFiles).toHaveLength(Number(s.linked_initial_files));
   expect(s.historical_hytec_sha256_files).toBe(String(sourceFiles.filter(f=>!!f.historical_sha256).length));
   expect(s.initial_files_without_recorded_sha256).toBe(String(sourceFiles.filter(f=>!f.historical_sha256).length));
   expect(s.all_record_clinical_approval_false).toBe("true");
   expect(s.direct_raw_source_bytes_verified_in_P6_2).toBe("false");
   expect(s.complete_primary_page_table_check_in_P6_2).toBe("false");
   expect(s.archive_internal_file_identity_confirmed_in_P6_2).toBe("false");
  }
  expect(sources.filter(s=>s.initial_69_file_present==="false")).toHaveLength(27);
  expect(sources.filter(s=>s.initial_69_file_present==="false"&&Number(s.linked_record_count)>0)).toHaveLength(23);
  expect(oldRec.filter(r=>r.initial_69_user_file_present==="false")).toHaveLength(30);
  expect(oldRec.every(r=>r.clinical_release_approved==="false")).toBe(true);
  expect(evidenceManifest.releaseStatus).toBe("draft");
 });
});
