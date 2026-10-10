import { describe, expect, it } from "vitest";
import csv from "../docs/P3_CNS_REPAIR_SOURCE_CONTRADICTION_LEDGER_2026-10.csv?raw";
import { repairHalfTimeEstimates, sources } from "../src/data/evidence/v0.1/index.js";

/** P3.5 abstract-based negative controls: not proof of generic CNS repair constants.
 * Bender ET only; Med Phys 2012 DOI 10.1118/1.4762562, PMID 23127096.
 * Lee et al 1998 PMID 9422555; Lee et al 2002 PMID 12007944.
 * Source BCR 2025 original file present in supplied inventory but its source
 * table / user PDF bytes and full primary figures remain unverified.
 */
const [head, ...lines] = csv.trimEnd().split(/\r?\n/);
const columns = head!.split(",");
const rows = lines.map((line, i) => {
  const values = line.split(",");
  if (values.length !== columns.length) throw Error("P3 CNS CSV invalid row " + (i + 2));
  return Object.fromEntries(columns.map((field, j) => [field, values[j]!])) as Record<string, string>;
});

describe("CNS repair legacy lower-bounds must stay deprecated / source-limited", () => {
  it("corrects Bender 2012 authorship to single published author while preserving DOI/PMID", () => {
    const bender = sources.find(x => x.id === "bender-2012-cns-repair")!;
    expect(bender).toBeDefined();
    expect(bender.citation).toMatch(/^Bender ET\. Brain necrosis/);
    expect(bender.citation).not.toMatch(/Tom[eé]/);
    expect(bender.doi).toBe("10.1118/1.4762562");
    expect(bender.pmid).toBe("23127096");
  });

  it("keeps both historical CNS bounds unavailable to new evidence selection", () => {
    const expectations = [
      ["t12-spinal-cord-myelopathy-bcr2025", 5, 4.1, 0, 8, "spinal-cord myelopathy"],
      ["t12-temporal-lobe-necrosis-bcr2025", 4, 38.1, 6.9, 76, "general brain necrosis monoexponential"],
    ] as const;
    expect(rows).toHaveLength(2);
    for (const [id, legacyBound, sourceEstimate, rangeMin, rangeMax, endpoint] of expectations) {
      const row = rows.find(x => x.record_id === id)!;
      const entry = repairHalfTimeEstimates.find(x => x.id === id)!;
      expect(row).toBeDefined();
      expect(entry).toBeDefined();
      expect(entry.sourceId).toBe("bcr-2025-ch10-tables");
      expect(entry.rangeHours).toEqual({low: legacyBound});
      expect(entry.qualifier).toBe("lower-bound");
      expect(entry.valueHours).toBeUndefined();
      expect(entry.ci95).toBeUndefined();
      expect(entry.defaultEligible).toBe(false);
      expect(entry.status).toBe("deprecated");
      expect(entry.support).toBe("poor-fit");
      expect(row.legacy_bound_kind).toBe("lower-bound");
      expect(Number(row.legacy_t12_bound_hours)).toBe(legacyBound);
      expect(Number(row.primary_estimate_hours)).toBe(sourceEstimate);
      expect(Number(row.primary_published_range_min_hours)).toBe(rangeMin);
      expect(Number(row.primary_published_range_max_hours)).toBe(rangeMax);
      expect(row.primary_endpoint).toBe(endpoint);
      expect(row.primary_doi).toBe("10.1118/1.4762562");
      expect(row.primary_pmid).toBe("23127096");
      expect(row.primary_interval_semantics).toBe("published_range_not_confirmed_95pct_CI");
      expect(row.source_supports_legacy_bound).toBe("false");
      expect(row.verified_primary_pdf_pages).toBe("false");
      expect(row.legacy_record_active).toBe("false");
      expect(row.clinical_approval).toBe("false");
      expect(entry.applicability?.notes?.join(" ")).toMatch(/not|no|without/i);
    }
  });

  it("does not interpret Lee 2002 BID hazard ratio as T1/2, or transfer broad brain fit to temporal lobe", () => {
    const cord = repairHalfTimeEstimates.find(x => x.id === "t12-spinal-cord-myelopathy-bcr2025")!;
    const lobe = repairHalfTimeEstimates.find(x => x.id === "t12-temporal-lobe-necrosis-bcr2025")!;
    expect(cord.applicability?.notes?.join(" ")).toMatch(/range 0–8 hours/i);
    expect(lobe.applicability?.notes?.join(" ")).toMatch(/38\.1-hour/);
    expect(lobe.applicability?.notes?.join(" ")).toMatch(/not an independently established temporal-lobe-specific/);
    expect(lobe.applicability?.notes?.join(" ")).toMatch(/hazard ratio \(13; 95% CI 3–54\) is an outcome risk ratio/);
    expect(lobe.defaultEligible).toBe(false);
    expect(cord.defaultEligible).toBe(false);
  });
});
