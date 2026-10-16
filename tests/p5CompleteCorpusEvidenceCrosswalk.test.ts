import { describe, expect, it } from "vitest";
import liveCsv from "../docs/P5_ALL_103_LIVE_PARAMETER_SOURCE_CROSSWALK_2026-10-16.csv?raw";
import sourceCsv from "../docs/P5_ALL_61_SOURCE_PUBLICATION_COVERAGE_2026-10-16.csv?raw";
import {
  alphaBetaEstimates,
  evidenceManifest,
  hytecClinicalConstraints,
  hytecOutcomeModels,
  repairHalfTimeEstimates,
  repopulationRateEstimates,
  reirradiationGuidanceSets,
  sources,
} from "../src/data/evidence/v0.1/index.js";
import { getRepopulationSourceBlocker } from "../src/evidence/repopulationRegistry.js";

type LedgerRow = Record<string,string>;

/** CSV parser for quoted original filenames, caveats and commas. */
function decode(line: string): string[] {
  const fields:string[]=[];
  let val="", inQuote=false;
  for(let i=0;i<line.length;i++) {
    const c=line[i]!;
    if(c==='"') {
      if(inQuote && line[i+1]==='"') {val+='"';i++;}
      else inQuote=!inQuote;
    } else if(c===','&&!inQuote) {fields.push(val);val="";}
    else val+=c;
  }
  if(inQuote) throw Error("Unclosed CSV quotation");
  fields.push(val);
  return fields;
}

function rowsFromCsv(raw:string):LedgerRow[] {
  const lines=raw.trimEnd().split(/\r?\n/);
  const head=decode(lines[0]!);
  if(new Set(head).size!==head.length) throw Error("Duplicate CSV header");
  return lines.slice(1).map((line,i)=>{
    const cells=decode(line);
    if(cells.length!==head.length) throw Error("CSV column count mismatch row "+(i+2));
    return Object.fromEntries(head.map((h,j)=>[h,cells[j]!]));
  });
}
const rows=rowsFromCsv(liveCsv);
const sourceRows=rowsFromCsv(sourceCsv);
const groups = [
  ["alpha-beta",alphaBetaEstimates],
  ["repair-half-time",repairHalfTimeEstimates],
  ["repopulation-time",repopulationRateEstimates],
  ["clinical-constraint",hytecClinicalConstraints],
  ["outcome-model",hytecOutcomeModels],
  ["reirradiation-guidance",reirradiationGuidanceSets],
] as const;

describe("P5: 103 live records and all 61 bibliography sources, strict scientific source mapping",()=>{
  it("accounts for every current code ID, family, endpoint and source EXACTLY ONCE",()=>{
    expect(rows).toHaveLength(103);
    expect(new Set(rows.map(r=>r.record_id)).size).toBe(rows.length);
    const live=groups.flatMap(([family,recs])=>recs.map(rec=>({
      id:rec.id,sourceId:rec.sourceId,endpointId:rec.endpointId,family,
    })));
    expect(live).toHaveLength(103);
    const byId=new Map(rows.map(r=>[r.record_id,r]));
    for(const item of live) {
      const row=byId.get(item.id);
      expect(row, "missing "+item.id).toBeDefined();
      expect(row!.family).toBe(item.family);
      expect(row!.source_id).toBe(item.sourceId);
      expect(row!.endpoint_id).toBe(item.endpointId);
      expect(row!.clinical_release_approved).toBe("false");
      expect(row!.code_file).toMatch(/^src\/data\/evidence\/v0\.1\//);
    }
    expect(rows.map(x=>x.record_id).sort()).toEqual(live.map(x=>x.id).sort());
    expect(Object.fromEntries(groups.map(([family,r])=>[family,r.length])))
      .toEqual({
        "alpha-beta":44,
        "repair-half-time":6,
        "repopulation-time":14,
        "clinical-constraint":29,
        "outcome-model":9,
        "reirradiation-guidance":1,
      });
    expect(rows.every(x=>x.original_phase_review_label.trim()!=="")).toBe(true);
    expect(evidenceManifest.releaseStatus).toBe("draft");
  });

  it("synchronizes source files, auto eligibility and genuine 95% parameter CI for 44 alpha/beta",()=>{
    for(const p of alphaBetaEstimates){
      const row=rows.find(r=>r.record_id===p.id)!;
      expect(Number(row.parameter_value_or_metric.match(/^α\\/β=([0-9.]+) Gy$/)?.[1]))
        .toBe(p.valueGy);
      expect(row.default_eligible).toBe(String(p.defaultEligible));
      expect(row.support).toBe(p.support);
      expect(row.record_status).toBe(p.status);
      if(p.ci95) {
        const ci = row.ci95_if_stored.split("..");
        expect(ci.map(Number)).toEqual([p.ci95.low,p.ci95.high]);
      } else {
        expect(row.ci95_if_stored).toBe("not-recorded");
      }
    }
    expect(alphaBetaEstimates.filter(x=>x.defaultEligible)).toHaveLength(17);
    const accepted = [
      "ab-oral-mucosa-mucositis-denham1995",
      "ab-skin-erythema-bcr2025",
      "ab-skin-telangiectasia-bcr2025",
      "ab-subcutis-fibrosis-bcr2025",
    ];
    for(const id of accepted) {
      const value=alphaBetaEstimates.find(a=>a.id===id)!;
      const row=rows.find(r=>r.record_id===id)!;
      expect(value.defaultEligible).toBe(true);
      expect(row.initial_69_user_file_present).toBe("false");
      expect(row.source_review_scope_2026_10_16).toBe("accepted_secondary_BCR2025_Table10_1");
      // Accepted SECONDARY data, not false claim of direct original-PDF verification.
      expect(row.full_primary_numeric_pdf_checked).not.toBe("true");
    }
  });

  it("preserves six repair entries; default-eligible three do not imply full primary PDF verification",()=>{
    expect(repairHalfTimeEstimates).toHaveLength(6);
    expect(repairHalfTimeEstimates.filter(x=>x.defaultEligible)).toHaveLength(3);
    for(const p of repairHalfTimeEstimates){
      const row=rows.find(r=>r.record_id===p.id)!;
      expect(row.default_eligible).toBe(String(p.defaultEligible));
      expect(row.support).toBe(p.support);
      expect(row.record_status).toBe(p.status);
    }
    const chart=rows.filter(r=>r.family==="repair-half-time" && r.source_id==="bentzen-saunders-dische-1999-repair");
    expect(chart).toHaveLength(3);
    expect(chart.every(r=>
      r.initial_69_user_file_present==="false" &&
      r.primary_numeric_check_depth.includes("PubMed_primary_author_abstract"))).toBe(true);
  });

  it("keeps all repopulation values explicitly non-default, with source dose-basis uncertainty and Hinata blocked",()=>{
    expect(repopulationRateEstimates).toHaveLength(14);
    expect(repopulationRateEstimates.every(x=>x.defaultEligible===false)).toBe(true);
    for(const x of repopulationRateEstimates){
      const row=rows.find(r=>r.record_id===x.id)!;
      expect(row.default_eligible).toBe("false");
      expect(row.dose_basis).toBe(x.basis);
      expect(row.dose_basis_source_verified_status).not.toBe("not_evaluated_in_P3_repopulation_crosswalk");
      expect(row.clinical_release_approved).toBe("false");
    }
    const hinata=repopulationRateEstimates.filter(r=>r.sourceId==="hinata-2001-medulloblastoma-time");
    expect(hinata).toHaveLength(2);
    for(const r of hinata){
      expect(getRepopulationSourceBlocker(r.id)?.code).toBe("incompatible-dose-basis");
      expect(rows.find(x=>x.record_id===r.id)?.dose_basis_source_verified_status)
        .toMatch(/tBED_gamma_over_alpha_BED_per_day_not_EQD2/);
    }
  });

  it("keeps 29 HyTEC OAR constraints separate from 9 source outcome sets and one lower-risk guidance set",()=>{
    expect(hytecClinicalConstraints).toHaveLength(29);
    expect(hytecOutcomeModels).toHaveLength(9);
    expect(reirradiationGuidanceSets).toHaveLength(1);
    const hytec=rows.filter(x=>["clinical-constraint","outcome-model","reirradiation-guidance"].includes(x.family));
    expect(hytec).toHaveLength(39);
    expect(hytec.every(r=>r.hytec_p2_number_of_point_or_rule_rows!=="")).toBe(true);
    // 34 HyTEC clinical outcome points + 6 non-HyTEC Ohri 2012 points
    // + 29 HyTEC OAR constraints + 4 Sahgal reirradiation rules.
    expect(hytec.reduce((n,r)=>n+Number(r.hytec_p2_number_of_point_or_rule_rows),0)).toBe(73);
    expect(hytec.filter(r=>r.initial_69_user_file_present==="false")).toHaveLength(1);
    expect(reirradiationGuidanceSets[0]!.requiredStructure).toBe("thecal-sac");
    expect(reirradiationGuidanceSets[0]!.criteria).toHaveLength(4);
  });

  it("covers all 61 bibliographic sources, without treating absent numerical records as an error",()=>{
    expect(sourceRows).toHaveLength(61);
    expect(new Set(sourceRows.map(r=>r.source_id)).size).toBe(sourceRows.length);
    expect(sourceRows.map(x=>x.source_id).sort()).toEqual(sources.map(x=>x.id).sort());
    const byId=new Map(sourceRows.map(r=>[r.source_id,r]));
    for(const source of sources){
      const row=byId.get(source.id)!;
      expect(row.doi).toBe(source.doi??"");
      expect(Number(row.evidence_record_count)).toBe(rows.filter(r=>r.source_id===source.id).length);
      expect(row.primary_file_not_proof_of_numeric_verification).toBe("true");
      expect(row.clinical_release_approved).toBe("false");
    }
    expect(sourceRows.filter(r=>r.original_69_file_present==="true")).toHaveLength(34);
    expect(sourceRows.filter(r=>r.original_69_file_present==="false")).toHaveLength(27);
    expect(rows.filter(r=>r.initial_69_user_file_present==="true")).toHaveLength(73);
    expect(rows.filter(r=>r.initial_69_user_file_present==="false")).toHaveLength(30);
    const referenceOnly=sourceRows.filter(x=>x.evidence_record_count==="0");
    expect(referenceOnly).toHaveLength(17);
    expect(referenceOnly.every(r=>r.source_function!=="registered-numeric-evidence")).toBe(true);
    expect(byId.get("rcr-2024-dose-fractionation")!.source_function).toBe("regimen-library-outside-103");
    expect(byId.get("andratschke-2022-estro-eortc-reirradiation")!.source_function).toBe("reirradiation-terminology-outside-103");
  });
});
