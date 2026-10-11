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
    expect(count("p3_primary_numeric_and_uncertainty_crosscheck_pending")).toBe(5);
    expect(count("p3_external_primary_abstract_MC_parameter_CI_checked_full_pdf_pending")).toBe(3);
    expect(count("p3_external_primary_abstract_qualitative_range_checked_full_pdf_pending")).toBe(1);
    expect(count("p3_external_primary_abstract_counterevidence_legacy_bound_unverified")).toBe(2);
    expect(count("p3_external_primary_abstract_numeric_CI_matched_dose_basis_open")).toBe(7);
    expect(count("p3_external_primary_abstract_point_and_alternative_assumption_checked_EQD2_open")).toBe(1);
    expect(count("p3_external_primary_abstract_point_and_subgroup_checked_EQD2_open")).toBe(1);
    expect(count("p3_external_primary_abstract_point_52day_not_Tk_EQD2_open")).toBe(1);
    expect(count("p3_primary_abstract_approx_secondary_QUANTEC_numeric_only_EQD2_open")).toBe(1);
    expect(count("p3_external_primary_fulltext_table4_numeric_checked_pdf_binary_pending")).toBe(7);
    expect(count("p3_user_original_indexed_pdf_page21_table_D5_coefficients_EQD2_checked_binary_SHA_pending")).toBe(3);
    expect(count("p3_user_secondary_BCR_table_original_numbers_checked_primary_source_open")).toBe(3);
    expect(count("p3_external_secondary_BCR_1996_Hendry_95limits_checked_primary_synthesis_open")).toBe(1);
    expect(count("p3_external_primary_abstract_point_CI_exact_matched_full_pdf_pending")).toBe(6);
    expect(count("p3_external_primary_abstract_point_CI_rounded_matched_full_pdf_pending")).toBe(1);
    expect(count("p3_external_primary_abstract_point_only_CI_secondary_pending")).toBe(1);
    const remaining=data.filter(x=>x.current_phase_review_status==="p3_primary_numeric_and_uncertainty_crosscheck_pending");
    expect(remaining.map(x=>x.record_id).sort()).toEqual(["ab-lung-pneumonitis-bentzen2000","ab-oral-mucosa-mucositis-denham1995","ab-skin-erythema-bcr2025","ab-skin-telangiectasia-bcr2025","ab-subcutis-fibrosis-bcr2025"]);
    expect(remaining.every(x=>x.record_family==="alpha-beta" && x.user_file_supplied==="false")).toBe(true);
    const fast=data.filter(x=>x.current_phase_review_status==="p3_external_primary_fulltext_table4_numeric_checked_pdf_binary_pending");
    expect(fast).toHaveLength(7);
    expect(fast.every(x=>x.source_id==="brunt-2020-fast-10y" && x.user_file_supplied==="true")).toBe(true);
    const ff2026=data.filter(x=>x.current_phase_review_status==="p3_user_original_indexed_pdf_page21_table_D5_coefficients_EQD2_checked_binary_SHA_pending");
    expect(ff2026.map(x=>x.record_id).sort()).toEqual(["ab-breast-chestwall-any-ae-fastforward2026","ab-breast-ibr-fastforward2026-adjusted","ab-breast-ibr-fastforward2026-unadjusted"]);
    expect(ff2026.every(x=>x.source_id==="brunt-2026-fast-forward-10y" && x.user_file_supplied==="true" && x.clinical_release_approved==="false")).toBe(true);
    const secondaryBcr=data.filter(x=>x.current_phase_review_status==="p3_user_secondary_BCR_table_original_numbers_checked_primary_source_open");
    const pooledHendry=data.filter(x=>x.current_phase_review_status==="p3_external_secondary_BCR_1996_Hendry_95limits_checked_primary_synthesis_open");
    expect(secondaryBcr).toHaveLength(3);
    expect(secondaryBcr.every(x=>x.source_id==="bcr-2025-ch10-tables" && x.user_file_supplied==="true" && x.clinical_release_approved==="false")).toBe(true);
    expect(pooledHendry.map(x=>x.record_id)).toEqual(["dprolif-hn-various-alternative-bcr2025"]);
    expect(pooledHendry[0]?.user_file_supplied).toBe("false"); // secondary book exists; original Hendry paper not supplied
    const strict=data.filter(x=>x.current_phase_review_status==="p3_primary_table_parameter_and_95pct_ci_checked");
    expect(strict.filter(x=>x.source_id==="brand-2021-chhip-rectal")).toHaveLength(9);
    expect(strict.filter(x=>x.source_id==="brand-2023-chhip-gu")).toHaveLength(10);
    expect(strict.filter(x=>x.source_id==="vogelius-bentzen-2020-prostate")).toHaveLength(1);
    const unresolved=data.filter(x=>x.current_phase_review_status==="p3_primary_numeric_and_uncertainty_crosscheck_pending");
    expect(unresolved.filter(x=>x.user_file_supplied==="true")).toHaveLength(0);
    expect(unresolved.filter(x=>x.user_file_supplied==="false")).toHaveLength(5);
  });

  it("blocks promotion to clinical release and leaves repair/time corrections reviewable",()=>{
    expect(data.every(x=>x.clinical_release_approved==="false")).toBe(true);
    for(const group of ["repair-half-time","repopulation-time"]){
      const rows=data.filter(x=>x.record_family===group);
      expect(rows.length).toBeGreaterThan(0);
      if(group==="repair-half-time") {
        expect(rows.filter(x=>x.current_phase_review_status==="p3_primary_numeric_and_uncertainty_crosscheck_pending")).toHaveLength(0);
        expect(rows.filter(x=>x.current_phase_review_status==="p3_external_primary_abstract_MC_parameter_CI_checked_full_pdf_pending")).toHaveLength(3);
        expect(rows.filter(x=>x.current_phase_review_status==="p3_external_primary_abstract_qualitative_range_checked_full_pdf_pending")).toHaveLength(1);
        expect(rows.filter(x=>x.current_phase_review_status==="p3_external_primary_abstract_counterevidence_legacy_bound_unverified")).toHaveLength(2);
      } else {
        expect(rows.filter(x=>x.current_phase_review_status==="p3_user_secondary_BCR_table_original_numbers_checked_primary_source_open")).toHaveLength(2);
        expect(rows.filter(x=>x.current_phase_review_status==="p3_external_secondary_BCR_1996_Hendry_95limits_checked_primary_synthesis_open")).toHaveLength(1);
        expect(rows.filter(x=>x.current_phase_review_status==="p3_external_primary_abstract_numeric_CI_matched_dose_basis_open")).toHaveLength(7);
        expect(rows.filter(x=>x.current_phase_review_status==="p3_primary_numeric_and_uncertainty_crosscheck_pending")).toHaveLength(0);
        expect(rows.filter(x=>x.current_phase_review_status==="p3_external_primary_abstract_point_and_alternative_assumption_checked_EQD2_open")).toHaveLength(1);
        expect(rows.filter(x=>x.current_phase_review_status==="p3_external_primary_abstract_point_and_subgroup_checked_EQD2_open")).toHaveLength(1);
        expect(rows.filter(x=>x.current_phase_review_status==="p3_external_primary_abstract_point_52day_not_Tk_EQD2_open")).toHaveLength(1);
        expect(rows.filter(x=>x.current_phase_review_status==="p3_primary_abstract_approx_secondary_QUANTEC_numeric_only_EQD2_open")).toHaveLength(1);
      }
      expect(rows.every(x=>x.priority==="critical")).toBe(true);
    }
  });
});
