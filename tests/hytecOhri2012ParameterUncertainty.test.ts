import { describe, expect, it } from "vitest";
import sourceParameterLedger from "../docs/HYTEC_P2_OHRI_2012_PARAMETER_CI_LEDGER_2026-10.csv?raw";
import { hytecOutcomeModels } from "../src/data/evidence/v0.1/index.js";

/**
 * Ohri et al. 2012 IJROBP 84:e379–e384; DOI 10.1016/j.ijrobp.2012.04.040.
 * NIH author manuscript, Results, https://pmc.ncbi.nlm.nih.gov/articles/PMC3867931/
 * Published marginal 95% intervals are NOT TCP probability confidence bands.
 * No original user-supplied PDF, SHA256, or PDF page verification is claimed.
 */
const lines = sourceParameterLedger.trimEnd().split(/\r?\n/);
const columns = lines[0]!.split(",");
const entries = lines.slice(1).map((line, index) => {
  const cells = line.split(",");
  if (cells.length !== columns.length) {
    throw new Error(`Ohri parameter ledger invalid CSV row ${index + 2}`);
  }
  return Object.fromEntries(columns.map((column, i) => [column, cells[i]!])) as Record<string, string>;
});

describe("Ohri 2012 NSCLC primary-model marginal uncertainty provenance", () => {
  const model = hytecOutcomeModels.find(x => x.id === "nsclc-stage-i-size-adjusted-2y-tcp")!;

  it("locks exactly the three source-published fitted parameter intervals and their units", () => {
    expect(entries).toHaveLength(3);
    expect(new Set(entries.map(x => x.coefficient)).size).toBe(3);
    const parameters = Object.fromEntries(entries.map(row => [
      row.coefficient,
      { estimate: Number(row.estimate), low: Number(row.ci95_low), high: Number(row.ci95_high), unit: row.unit },
    ]));
    expect(parameters).toEqual({
      TCD50: {estimate: 0, low: -30, high: 30, unit: "Gy"},
      k: {estimate: 31, low: 19, high: 43, unit: "Gy"},
      c: {estimate: 10, low: 2, high: 18, unit: "Gy/cm"},
    });
    for (const entry of entries) {
      expect(entry.source_id).toBe("ohri-2012-nsclc-size-tcp");
      expect(entry.doi).toBe("10.1016/j.ijrobp.2012.04.040");
      expect(entry.primary_locator).toBe("PMC3867931 Results");
      expect(entry.interval_kind).toBe("published_marginal_parameter_95pct_CI");
      expect(entry.user_original_pdf_supplied).toBe("false");
      expect(entry.pdf_page_verified).toBe("false");
    }
  });

  it("retains cohort size and correctly identifies 18.4 months as MEAN follow-up", () => {
    const notes = model.applicability?.notes?.join(" ") ?? "";
    expect(notes).toMatch(/504 NSCLC tumors in 482 patients/i);
    expect(notes).toMatch(/26 observed local failures/i);
    expect(notes).toMatch(/mean 18\.4-month follow-up/i);
    expect(notes).not.toMatch(/median 18\.4-month follow-up/i);
    expect(notes).toMatch(/2–18 Gy\/cm/);
    expect(notes).toMatch(/−30 to 30 Gy/);
    expect(notes).toMatch(/19–43 Gy/);
    expect(notes).toMatch(/not independent patient-level TCP confidence bands/i);
    expect(notes).toMatch(/covariance/i);
  });

  it("retains publication example 93% and does not infer patient-level confidence bands from marginal CIs", () => {
    const anchor = model.points.find(x => x.id === "nsclc-50gy-5fx-1cm-2y")!;
    expect(anchor.probability).toBe(0.93);
    expect(model.status).toBe("reviewed");
    const sBed = 50 * (1 + 10 / 10) - 10 * 1;
    const curve = 1 / (1 + Math.exp(-(sBed - 0) / 31));
    expect(curve).toBeCloseTo(0.948006, 5);
    expect(curve - anchor.probability).toBeGreaterThan(0.017);
  });
});
