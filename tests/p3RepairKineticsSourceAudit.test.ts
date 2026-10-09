import { describe, expect, it } from "vitest";
import crosswalkRaw from "../docs/P3_REPAIR_KINETICS_PRIMARY_CROSSCHECK_2026-10.csv?raw";
import { repairHalfTimeEstimates } from "../src/data/evidence/v0.1/index.js";

/**
 * Source-only provenance guard, not patient-level repair fit validation.
 * Bentzen et al 1999, DOI 10.1016/S0167-8140(99)00151-6, PMID 10660202
 * Bentzen et al 1996, DOI 10.1016/0167-8140(95)01689-9, PMID 8966232
 * Official publication author abstracts, not full-text PDF visual QA.
 */
const lines = crosswalkRaw.trimEnd().split(/\r?\n/);
const headers = lines[0]!.split(",");
const rows = lines.slice(1).map((s, i) => {
  const values = s.split(",");
  if (values.length !== headers.length) throw Error("Repair provenance CSV column count row " + (i + 2));
  return Object.fromEntries(headers.map((h, j) => [h, values[j]!])) as Record<string, string>;
});
const byId = (id: string) => {
  const row = rows.find(x => x.record_id === id);
  if (!row) throw Error("Missing repair provenance row: " + id);
  return row;
};
const fromHfc = (id: string) => {
  const record = repairHalfTimeEstimates.find(x => x.id === id);
  if (!record) throw Error("Missing HFC repair estimate: " + id);
  return record;
};

describe("P3 repair source: exact endpoint means/Monte Carlo intervals and mucosal range", () => {
  it("matches three published CHART means and separate MC-derived parameter 95% CIs", () => {
    const expected = [
      ["t12-laryngeal-edema-chart1999", 4.9, 3.2, 6.4],
      ["t12-skin-telangiectasia-chart1999", 3.8, 2.5, 4.6],
      ["t12-subcutis-fibrosis-chart1999", 4.4, 3.8, 4.9],
    ] as const;
    expect(rows).toHaveLength(4);
    expect(new Set(rows.map(x => x.record_id)).size).toBe(4);
    for (const [id, mean, low, high] of expected) {
      const row = byId(id);
      const record = fromHfc(id);
      expect(row.source_id).toBe("bentzen-saunders-dische-1999-repair");
      expect(row.doi).toBe("10.1016/S0167-8140(99)00151-6");
      expect(row.pmid).toBe("10660202");
      expect(row.source_medium).toBe("PubMed_primary_author_abstract");
      expect(row.ci95_kind).toBe("Monte_Carlo_parameter_95pct_interval");
      expect(Number(row.monte_carlo_draws)).toBe(1000);
      expect([Number(row.point_hours), Number(row.ci95_low_hours), Number(row.ci95_high_hours)])
        .toEqual([mean, low, high]);
      expect(record.valueHours).toBe(mean);
      expect(record.ci95).toEqual({level: 0.95, low, high});
      expect(record.qualifier).toBe("point");
      expect(record.notes?.join(" ")).toMatch(/Monte Carlo/i);
      expect(row.source_pdf_pages_checked).toBe("false");
      expect(row.user_original_primary_supplied).toBe("false");
      expect(row.clinical_signoff).toBe("false");
    }
  });

  it("retains the primary 1996 mucosal 2–4 h probable RANGE; 3.2 h is not a fitted point", () => {
    const row = byId("t12-oral-mucositis-bcr2025");
    const record = fromHfc(row.record_id);
    expect(row.doi).toBe("10.1016/0167-8140(95)01689-9");
    expect(row.pmid).toBe("8966232");
    expect(row.ci95_kind).toBe("qualitative_probable_range_no_CI");
    expect([Number(row.range_low_hours), Number(row.range_high_hours)]).toEqual([2, 4]);
    expect(record.rangeHours).toEqual({low:2,high:4});
    expect(record.valueHours).toBeUndefined();
    expect(record.ci95).toBeUndefined();
    expect(record.qualifier).toBe("range");
    expect(record.defaultEligible).toBe(false);
    expect(record.notes?.join(" ")).toMatch(/3\.2 h.*not an independently fitted/i);
  });

  it("reproduces ONLY mono-exponential residual fractions at 6h/12h; not clinical TCP/NTCP", () => {
    const sourceReferenceFractions = [
      ["t12-laryngeal-edema-chart1999", .4279488287, .18314019998],
      ["t12-skin-telangiectasia-chart1999", .3347260253, .1120415120],
      ["t12-subcutis-fibrosis-chart1999", .3886015704, .15101118055],
    ] as const;
    for (const [id, expected6, expected12] of sourceReferenceFractions) {
      const halfTime = fromHfc(id).valueHours!;
      const sixHour = Math.pow(2, -6 / halfTime);
      const twelveHour = Math.pow(2, -12 / halfTime);
      expect(sixHour).toBeCloseTo(expected6, 8);
      expect(twelveHour).toBeCloseTo(expected12, 8);
      expect(twelveHour).toBeCloseTo(sixHour * sixHour, 12);
      expect(twelveHour).toBeLessThan(sixHour);
    }
  });

  it("does not accidentally reactivate deprecated spinal cord and temporal lobe parameter presets", () => {
    expect(repairHalfTimeEstimates).toHaveLength(6);
    for (const id of ["t12-spinal-cord-myelopathy-bcr2025","t12-temporal-lobe-necrosis-bcr2025"]) {
      const record = fromHfc(id);
      expect(record.status).toBe("deprecated");
      expect(record.defaultEligible).toBe(false);
    }
  });
});
