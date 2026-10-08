import ledgerCsv from "../docs/HYTEC_P2_RECORD_LEVEL_LEDGER_2026-10.csv?raw";
import { describe, expect, it } from "vitest";

function parseCsvRow(row: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuote = false;
  for (let i = 0; i < row.length; i++) {
    const char = row[i]!;
    if (char === '"') {
      if (inQuote && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (char === "," && !inQuote) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (inQuote) throw new Error("CSV audit ledger contains an unclosed quote");
  fields.push(current);
  return fields;
}

const csv = ledgerCsv.trimEnd();
const lines = csv.split(/\r?\n/).filter(Boolean);
const columns = parseCsvRow(lines[0]!);
const items = lines.slice(1).map((line, index) => {
  const values = parseCsvRow(line);
  if (values.length !== columns.length) {
    throw new Error(
      `Invalid source ledger column count in row ${index + 2}: expected ${columns.length}, got ${values.length}`,
    );
  }
  return Object.fromEntries(columns.map((col, i) => [col, values[i]!])) as Record<string, string>;
});

const expectedCount: Record<string, number> = {
  published_fit_point_reproduced_secondary_review_pending: 23,
  published_fit_approx_checked_rounded_point: 8,
  UNRESOLVED_primary_source_equation_table_narrative_disagreement: 2,
  published_summary_endpoint_and_contour_checked_no_independent_fit: 7,
  published_optic_dmax_objective_and_pooled_probit_checked_no_prior_rt: 3,
  visual_table3_contour_and_LQ_math_checked_fit_uncertain: 5,
  visual_table4_four_factor_and_software_math_checked_provenance_open: 4,
  source_document_figure_endpoint_scope_checked_nonuniversal: 2,
  source_reported_R0_group_average_checked_not_fitted: 1,
  source_stratified_KM_cohort_checked_not_fitted: 2,
  source_reviewed_QUANTEC_mld_probit_nonsignificant: 4,
  source_reviewed_reverse_volume_700cc_unmodelled: 2,
  source_reviewed_prostate_suggested_not_fitted: 3,
  source_reviewed_carotid_D0p5cc_guidance_not_Dmax_risk: 1,
  external_primary_formula_reproduced_rounded_review_pending: 5,
  UNRESOLVED_source_example_vs_published_rounded_fit: 1,
};

describe("P2 scientific source-audit ledger schema and review-state guardrails", () => {
  it("keeps exactly 73 distinct implemented HyTEC-related records and 15 correctly parsed columns", () => {
    expect(columns).toHaveLength(15);
    expect(columns[1]).toBe("id");
    expect(columns[11]).toBe("verification_status");
    expect(items).toHaveLength(73);
    expect(new Set(items.map(x => x.id)).size).toBe(73);
    expect(items.every(x => x.source_id && x.endpoint_id && x.code_file))
      .toBe(true);
  });

  it("matches independently counted scientific statuses without silently promoting to validated", () => {
    const actual: Record<string, number> = {};
    for (const row of items) {
      const state = row.verification_status!;
      actual[state] = (actual[state] ?? 0) + 1;
    }
    expect(actual).toEqual(expectedCount);
    expect(actual.source_text_anchor_only_not_independently_fitted ?? 0).toBe(0);
    expect(
      items.filter(x => x.verification_status?.toLowerCase().includes("validated")),
    ).toHaveLength(0);
  });

  it("marks absent Ohri2012 primaries, disputed Royce fits and unfitted OAR guidance explicitly", () => {
    const source = (id: string) => items.filter(x => x.source_id === id);
    expect(source("ohri-2012-nsclc-size-tcp")).toHaveLength(6);
    expect(source("ohri-2012-nsclc-size-tcp")
      .filter(x => x.verification_status === "external_primary_formula_reproduced_rounded_review_pending")).toHaveLength(5);
    expect(source("ohri-2012-nsclc-size-tcp")
      .filter(x => x.verification_status === "UNRESOLVED_source_example_vs_published_rounded_fit")).toHaveLength(1);
    expect(source("ohri-2012-nsclc-size-tcp")
      .every(x => x.primary_file === "NOT_SUPPLIED")).toBe(true);

    const low = items.filter(x => x.verification_status?.startsWith("UNRESOLVED"));
    expect(low).toHaveLength(3);
    expect(low.filter(x => x.source_id === "royce-2021-hytec-prostate-tcp")).toHaveLength(2);
    expect(low.filter(x => x.source_id === "ohri-2012-nsclc-size-tcp")).toHaveLength(1);

    expect(source("miften-2021-hytec-liver-toxicity")).toHaveLength(6);
    expect(source("miften-2021-hytec-liver-toxicity")
      .every(x => x.verification_status?.startsWith("source_reviewed_")))
      .toBe(true);
    expect(source("wang-2021-hytec-prostate-toxicity")).toHaveLength(3);
    expect(source("grimm-2021-hytec-major-vessels")
      .some(x => x.verification_status ===
        "source_reviewed_carotid_D0p5cc_guidance_not_Dmax_risk"))
      .toBe(true);
  });
});
