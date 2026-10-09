import { describe, expect, it } from "vitest";
import ledger from "../docs/P3_103_EVIDENCE_SOURCE_AUDIT_STATUS_2026-10.csv?raw";

/**
 * Entire HFC evidence matrix: 103 distinct records, NOT synonymous with
 * the separate 73-entry P2 HyTEC point-level ledger.
 * Direct original file availability != clinical validation.
 */
function row(s: string) {
  const v: string[] = [];
  let current = "";
  let quoted = false;
  for(let i=0;i<s.length;i++){
    const c=s[i]!;
    if(c==='"'){
      if(quoted && s[i+1]==='"'){current+='"';i++;}
      else quoted=!quoted;
    } else if(c===","&&!quoted){v.push(current);current="";}
    else current+=c;
  }
  if(quoted)throw Error("open CSV quotation");
  v.push(current);
  return v;
}
const lines=ledger.trimEnd().split(/\r?\n/);
const head=row(lines[0]!);
const data=lines.slice(1).map((line,n)=>{
  const r=row(line);
  if(r.length!==head.length) throw Error("Invalid 103 evidence CSV row "+(n+2));
  return Object.fromEntries(head.map((key,i)=>[key,r[i]!]));
});

describe("P3 entire evidence 103-record crosswalk and review gate",()=>{
  it("keeps exactly 103 unique record IDs, original source ID and source-file coverage flags",()=>{
    expect(data).toHaveLength(103);
    expect(new Set(data.map(x=>x.record_id)).size).toBe(103);
    expect(data.every(x=>x.record_id && x.source_id && x.record_family)).toBe(true);
    expect(data.filter(x=>x.user_file_supplied==="true")).toHaveLength(73);
    expect(data.filter(x=>x.user_file_supplied==="false")).toHaveLength(30);
  });

  it("separates strict P3 source-parameter review, P2 source-review and pending bio-parameters",()=>{
    const count=(state:string)=>data.filter(x=>x.current_phase_review_status===state).length;
    expect(count("p3_primary_table_parameter_and_95pct_ci_checked")).toBe(20);
    expect(count("p2_source_review_in_separate_73_record_ledger")).toBe(39);
    expect(count("p3_primary_numeric_and_uncertainty_crosscheck_pending")).toBe(40);
    expect(count("p3_external_primary_abstract_MC_parameter_CI_checked_full_pdf_pending")).toBe(3);
    expect(count("p3_external_primary_abstract_qualitative_range_checked_full_pdf_pending")).toBe(1);
    const strict=data.filter(x=>x.current_phase_review_status==="p3_primary_table_parameter_and_95pct_ci_checked");
    expect(strict.filter(x=>x.source_id==="brand-2021-chhip-rectal")).toHaveLength(9);
    expect(strict.filter(x=>x.source_id==="brand-2023-chhip-gu")).toHaveLength(10);
    expect(strict.filter(x=>x.source_id==="vogelius-bentzen-2020-prostate")).toHaveLength(1);
    const unresolved=data.filter(x=>x.current_phase_review_status==="p3_primary_numeric_and_uncertainty_crosscheck_pending");
    expect(unresolved.filter(x=>x.user_file_supplied==="true")).toHaveLength(15);
    expect(unresolved.filter(x=>x.user_file_supplied==="false")).toHaveLength(25);
  });

  it("blocks promotion to clinical release and leaves repair/time corrections reviewable",()=>{
    expect(data.every(x=>x.clinical_release_approved==="false")).toBe(true);
    for(const group of ["repair-half-time","repopulation-time"]){
      const rows=data.filter(x=>x.record_family===group);
      expect(rows.length).toBeGreaterThan(0);
      if(group==="repair-half-time") {
        expect(rows.filter(x=>x.current_phase_review_status==="p3_primary_numeric_and_uncertainty_crosscheck_pending")).toHaveLength(2);
        expect(rows.filter(x=>x.current_phase_review_status==="p3_external_primary_abstract_MC_parameter_CI_checked_full_pdf_pending")).toHaveLength(3);
        expect(rows.filter(x=>x.current_phase_review_status==="p3_external_primary_abstract_qualitative_range_checked_full_pdf_pending")).toHaveLength(1);
      } else {
        expect(rows.every(x=>x.current_phase_review_status==="p3_primary_numeric_and_uncertainty_crosscheck_pending")).toBe(true);
      }
      expect(rows.every(x=>x.priority==="critical")).toBe(true);
    }
  });
});
