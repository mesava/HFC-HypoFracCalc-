import { describe, expect, it } from "vitest";
import raw from "../docs/P3_FIVE_PRIMARY_FULLTEXT_ACQUISITION_2026-10.csv?raw";
import matrix from "../docs/P3_103_EVIDENCE_SOURCE_AUDIT_STATUS_2026-10.csv?raw";
import { alphaBetaEstimates, evidenceManifest } from "../src/data/evidence/v0.1/index.js";
import { defaultAlphaBetaSelection, resolveAlphaBetaSelection } from "../src/evidence/alphaBetaRegistry.js";

/** P3.14: exact numeric values and 95% confidence limits verified from the
 * supplied Basic Clinical Radiobiology 2025 Table 10.1. Original journal PDFs
 * are nice-to-have, not release prerequisites; clinical commissioning separate.
 */
const lines=raw.trimEnd().split(/\r?\n/),head=lines[0]!.split(",");
const rows=lines.slice(1).map((line,i)=>{
  const values=line.split(",");
  if(values.length!==head.length)throw Error("P3.14 optional sources CSV malformed at "+(i+2));
  return Object.fromEntries(head.map((key,j)=>[key,values[j]!])) as Record<string,string>;
});
const get=(id:string)=>{
  const item=alphaBetaEstimates.find(x=>x.id===id);
  if(!item)throw Error("Missing historic alpha-beta "+id);
  return item;
};
describe("P3.14 textbook-supported numerical values and optional original papers",()=>{
  it("has five faithfully accepted BCR 2025 Table 10.1 numerical estimates and source CIs",()=>{
    expect(rows).toHaveLength(5);
    const expected=[
      ["ab-oral-mucosa-mucositis-denham1995",9.3,5.8,17.9],
      ["ab-skin-erythema-bcr2025",8.8,6.9,11.6],
      ["ab-skin-telangiectasia-bcr2025",2.6,2.2,3.3],
      ["ab-subcutis-fibrosis-bcr2025",1.7,.6,2.6],
      ["ab-lung-pneumonitis-bentzen2000",4,2.2,5.8],
    ] as const;
    expect(new Set(rows.map(x=>x.record_id)).size).toBe(5);
    for(const [id,value,low,high] of expected){
      const entry=rows.find(x=>x.record_id===id)!;
      expect(entry).toBeDefined();
      expect([Number(entry.hfc_alpha_beta_Gy),Number(entry.hfc_CI95_low_Gy),Number(entry.hfc_CI95_high_Gy)]).toEqual([value,low,high]);
      const record=get(id);
      expect(record.valueGy).toBe(value);
      expect(record.ci95).toEqual({level:.95,low,high});
      expect(entry.BCR2025_Table10_1_numeric_CI_verified).toBe("true");
      expect(entry.original_journal_acquisition_policy).toBe("recommended_optional");
      expect(entry.source_priority).toBe("nice_to_have");
      expect(entry.original_primary_fulltext_available_and_read).toBe("false");
      expect(entry.primary_tables_and_95CI_checked).toBe("false");
      expect(entry.clinical_release_approved).toBe("false");
      expect(matrix).toContain(id+",");
      expect(matrix.split(/\r?\n/).find(x=>x.startsWith(id+","))).toContain("p3_user_secondary_BCR_2025_table10_1_verified_primary_optional");
      expect(record.supportReason).toContain("P3.14");
    }
  });
  it("preserves four historic automatic defaults and does not warn solely about missing five originals",()=>{
    const defaults=rows.filter(x=>x.defaultEligible_preserved==="true");
    expect(defaults).toHaveLength(4);
    for(const row of defaults){
      const record=get(row.record_id!);
      expect(record.defaultEligible).toBe(true);
      expect(record.support).toBe("supported");
      expect(row.support_after_P3_14).toBe("supported");
      const selection=defaultAlphaBetaSelection(record.endpointId);
      expect(selection?.parameterRecordId).toBe(record.id);
      const resolved=resolveAlphaBetaSelection(record.endpointId,selection!);
      expect(resolved.valueGy).toBe(record.valueGy);
      expect(resolved.warnings.join(" ")).not.toMatch(/P3\.13|mandatory original/i);
    }
    const lung=get("ab-lung-pneumonitis-bentzen2000");
    expect(lung.defaultEligible).toBe(false);
    expect(lung.support).toBe("limited");
  });
  it("tracks original papers as optional while clinical validation gates remain separate",()=>{
    expect(rows.every(x=>x.original_journal_acquisition_policy==="recommended_optional")).toBe(true);
    expect(evidenceManifest.releaseStatus).toBe("draft");
    expect(evidenceManifest.reviewers).toHaveLength(0);
    expect(evidenceManifest.notes?.join(" ")).toContain("nice-to-have provenance enrichments");
  });
});
