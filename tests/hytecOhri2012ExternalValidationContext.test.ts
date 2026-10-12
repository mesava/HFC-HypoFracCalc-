import { describe, expect, it } from "vitest";
import verificationCsv from "../docs/HYTEC_P2_OHRI_2012_EXTERNAL_VALIDATION_CROSSWALK_2026-10.csv?raw";
import { hytecOutcomeModels } from "../src/data/evidence/v0.1/index.js";

/** Huang et al., Front Oncol, online 2025-01-10, DOI 10.3389/fonc.2024.1431140.
 * External study, NOT among original user papers and NOT stage-I-only calibration.
 * Source checks are published Tables 2, 4, 5, not patient-level ROC recreation.
 */
const lines = verificationCsv.trimEnd().split(/\r?\n/);
const header = lines[0]!.split(",");
const rows = lines.slice(1).map((line, i) => {
  const cells = line.split(",");
  if (cells.length !== header.length) throw Error(`Huang crosswalk invalid row ${i + 2}`);
  return Object.fromEntries(header.map((key, j) => [key, cells[j]!])) as Record<string, string>;
});
const value = (name: string) => {
  const match = rows.filter(x => x.metric === name);
  if (match.length !== 1) throw Error(`External evidence metric missing or duplicated: ${name}`);
  return Number(match[0]!.value);
};

describe("Ohri NSCLC external validation 2025 must not expand original cohort scope", () => {
  const model = hytecOutcomeModels.find(x => x.id === "nsclc-stage-i-size-adjusted-2y-tcp")!;

  it("records an independently published MIXED lung cohort instead of stage-I-only validation", () => {
    expect(rows).toHaveLength(10);
    expect(rows.every(x => x.source_kind === "external_additional_not_user_supplied")).toBe(true);
    expect(rows.every(x => x.scope === "not_stage_I_only")).toBe(true);
    expect(rows.every(x => x.doi === "10.3389/fonc.2024.1431140")).toBe(true);
    expect(value("cohort_total")).toBe(153);
    expect(value("stage_I")).toBe(48);
    expect(value("stage_IV")).toBe(81);
    expect(value("metastatic")).toBe(60);
    expect(value("two_year_local_recurrence")).toBe(59);
    expect(value("at_least_single_fraction_cases")).toBe(21);
    expect(value("stage_I") / value("cohort_total")).toBeCloseTo(0.314, 2);
  });

  it("keeps ROC discrimination CI categorically separate from TCP parameter CI and model calibration", () => {
    expect(value("ohri_2y_auc")).toBe(0.633);
    expect(rows.find(x => x.metric === "ohri_2y_auc")?.ci95_low).toBe("0.552");
    expect(rows.find(x => x.metric === "ohri_2y_auc")?.ci95_high).toBe("0.710");
    expect(value("ohri_2y_sensitivity")).toBe(42.4);
    expect(value("ohri_2y_specificity")).toBe(80.9);
    expect(value("ohri_2y_HL_p")).toBe(0.867);
    const notes = model.applicability?.notes?.join(" ") ?? "";
    expect(notes).toMatch(/Huang et al/);
    expect(notes).toMatch(/153 mixed primary\/metastatic/);
    expect(notes).toMatch(/48 stage-I/);
    expect(notes).toMatch(/not a predicted TCP confidence interval/i);
    expect(notes).toMatch(/does NOT independently validate stage-I-specific calibration/i);
    expect(model.population).toMatch(/Stage I NSCLC/);
    expect(model.status).toBe("reviewed");
  });

  it("does not change source narrative points or the disputed 93 percent", () => {
    expect(model.points).toHaveLength(6);
    expect(model.points.find(x => x.id === "nsclc-50gy-5fx-1cm-2y")?.probability).toBe(0.93);
  });
});
