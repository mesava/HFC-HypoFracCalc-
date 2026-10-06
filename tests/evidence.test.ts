import { describe, expect, it } from "vitest";
import {
  alphaBetaEstimates,
  endpoints,
  evidenceManifest,
  repairHalfTimeEstimates,
  repopulationRateEstimates,
  sources,
} from "../src/data/evidence/v0.1/index.js";
import {
  defaultAlphaBetaSelection,
  getPreferredAlphaBetaEstimate,
  resolveAlphaBetaSelection,
} from "../src/evidence/alphaBetaRegistry.js";

function expectUnique(values: string[]): void {
  expect(new Set(values).size).toBe(values.length);
}

describe("evidence-v0.1 integrity", () => {
  it("is explicitly a draft dataset", () => {
    expect(evidenceManifest.releaseStatus).toBe("draft");
    expect(evidenceManifest.datasetVersion).toBe("2026.10-v0.1");
  });

  it("uses unique source, endpoint and parameter IDs", () => {
    expectUnique(sources.map((source) => source.id));
    expectUnique(endpoints.map((endpoint) => endpoint.id));
    expectUnique(alphaBetaEstimates.map((record) => record.id));
    expectUnique(repairHalfTimeEstimates.map((record) => record.id));
    expectUnique(repopulationRateEstimates.map((record) => record.id));
  });

  it("all evidence records reference existing sources and endpoints", () => {
    const sourceIds = new Set(sources.map((source) => source.id));
    const endpointIds = new Set(endpoints.map((endpoint) => endpoint.id));

    for (const record of [
      ...alphaBetaEstimates,
      ...repairHalfTimeEstimates,
      ...repopulationRateEstimates,
    ]) {
      expect(sourceIds.has(record.sourceId)).toBe(true);
      expect(endpointIds.has(record.endpointId)).toBe(true);
    }
  });

  it("all alpha/beta point estimates are positive and CIs contain the point estimate when finite", () => {
    for (const record of alphaBetaEstimates) {
      expect(record.valueGy).toBeGreaterThan(0);

      if (record.ci95) {
        expect(record.ci95.low).toBeLessThanOrEqual(record.valueGy);
        expect(record.ci95.high).toBeGreaterThanOrEqual(record.valueGy);
      }
    }
  });

  it("all repair records have either a point value or a range/bound", () => {
    for (const record of repairHalfTimeEstimates) {
      expect(
        record.valueHours !== undefined || record.rangeHours !== undefined,
      ).toBe(true);

      if (record.valueHours !== undefined) {
        expect(record.valueHours).toBeGreaterThan(0);
      }
    }
  });

  it("all repopulation rates declare EQD2 or BED basis", () => {
    for (const record of repopulationRateEstimates) {
      expect(["EQD2", "BED"]).toContain(record.basis);
      expect(record.rateGyPerDay).toBeGreaterThanOrEqual(0);
    }
  });

  it("has no more than one auto-default alpha/beta per endpoint", () => {
    for (const endpoint of endpoints) {
      const defaults = alphaBetaEstimates.filter(
        (record) =>
          record.endpointId === endpoint.id &&
          record.status === "preferred" &&
          record.defaultEligible,
      );
      expect(defaults.length).toBeLessThanOrEqual(1);
    }
  });

  it("has no more than one auto-default repair half-time per endpoint", () => {
    for (const endpoint of endpoints) {
      const defaults = repairHalfTimeEstimates.filter(
        (record) =>
          record.endpointId === endpoint.id &&
          record.status === "preferred" &&
          record.defaultEligible,
      );
      expect(defaults.length).toBeLessThanOrEqual(1);
    }
  });

  it("has no more than one auto-default repopulation rate per endpoint", () => {
    for (const endpoint of endpoints) {
      const defaults = repopulationRateEstimates.filter(
        (record) =>
          record.endpointId === endpoint.id &&
          record.status === "preferred" &&
          record.defaultEligible,
      );
      expect(defaults.length).toBeLessThanOrEqual(1);
    }
  });
});

describe("preferred alpha/beta selections", () => {
  it("selects 1.6 Gy for prostate biochemical control", () => {
    const record = getPreferredAlphaBetaEstimate(
      "prostate-biochemical-control",
    );
    expect(record?.valueGy).toBe(1.6);
    expect(record?.ci95).toEqual({ level: 0.95, low: 1.3, high: 2.0 });
  });

  it("auto-selects only the strongest validated late rectal estimate", () => {
    expect(
      getPreferredAlphaBetaEstimate("rectum-bleeding-g1plus")?.valueGy,
    ).toBe(1.6);
    expect(
      getPreferredAlphaBetaEstimate("rectum-proctitis-g1plus"),
    ).toBeUndefined();
    expect(
      getPreferredAlphaBetaEstimate("rectum-sphincter-control-g1plus"),
    ).toBeUndefined();
  });

  it("does not auto-select the poorly constrained rectal pain estimate", () => {
    expect(
      getPreferredAlphaBetaEstimate("rectum-pain-g1plus"),
    ).toBeUndefined();
  });

  it("auto-selects only the three GU endpoints supported by EQD2 model improvement", () => {
    expect(
      getPreferredAlphaBetaEstimate("gu-dysuria-g1plus")?.valueGy,
    ).toBe(2.0);
    expect(
      getPreferredAlphaBetaEstimate("gu-hematuria-g1plus")?.valueGy,
    ).toBe(0.9);
    expect(
      getPreferredAlphaBetaEstimate("gu-hematuria-g2plus")?.valueGy,
    ).toBe(0.6);
    expect(
      getPreferredAlphaBetaEstimate("gu-incontinence-g1plus"),
    ).toBeUndefined();
  });

  it("selects the 2026 adjusted FAST-Forward tumour estimate", () => {
    const record = getPreferredAlphaBetaEstimate(
      "breast-ipsilateral-recurrence",
    );
    expect(record?.valueGy).toBe(3.3);
    expect(record?.ci95).toEqual({ level: 0.95, low: 1.9, high: 4.9 });
  });

  it("selects the 2026 FAST-Forward composite normal-tissue estimate", () => {
    const record = getPreferredAlphaBetaEstimate(
      "breast-chestwall-any-ae-fastforward",
    );
    expect(record?.valueGy).toBe(2.1);
    expect(record?.ci95).toEqual({ level: 0.95, low: 1.6, high: 2.6 });
  });

  it("selects validated HN and mucosal defaults but requires explicit NSCLC selection", () => {
    expect(
      getPreferredAlphaBetaEstimate("head-neck-tumour-control")?.valueGy,
    ).toBe(10.5);
    expect(
      getPreferredAlphaBetaEstimate("head-neck-various-late-effects")?.valueGy,
    ).toBe(4.0);
    expect(
      getPreferredAlphaBetaEstimate("nsclc-stage-i-local-control"),
    ).toBeUndefined();
    expect(
      getPreferredAlphaBetaEstimate("oral-mucosa-mucositis")?.valueGy,
    ).toBe(9.3);
  });

  it("does not auto-select a spinal-cord alpha/beta because human estimates conflict", () => {
    expect(
      getPreferredAlphaBetaEstimate("spinal-cord-radiation-myelopathy"),
    ).toBeUndefined();

    const alternatives = alphaBetaEstimates.filter(
      (record) =>
        record.endpointId === "spinal-cord-radiation-myelopathy",
    );
    expect(alternatives.map((record) => record.valueGy).sort()).toEqual([
      0.87,
      3.7,
    ]);
  });
});

describe("repair and repopulation evidence", () => {
  it("stores endpoint-specific CHART repair half-times", () => {
    const larynx = repairHalfTimeEstimates.find(
      (record) => record.endpointId === "larynx-edema",
    );
    const fibrosis = repairHalfTimeEstimates.find(
      (record) => record.endpointId === "subcutis-fibrosis",
    );

    expect(larynx?.valueHours).toBe(4.9);
    expect(larynx?.ci95).toEqual({ level: 0.95, low: 3.2, high: 6.4 });
    expect(fibrosis?.valueHours).toBe(4.4);
  });

  it("keeps deprecated CNS repair bounds out of automatic point defaults", () => {
    const cord = repairHalfTimeEstimates.find(
      (record) =>
        record.endpointId === "spinal-cord-radiation-myelopathy",
    );
    expect(cord?.qualifier).toBe("lower-bound");
    expect(cord?.rangeHours?.low).toBe(5);
    expect(cord?.defaultEligible).toBe(false);
    expect(cord?.status).toBe("deprecated");
  });

  it("keeps the historical broad HN Dprolif record only for audit replay", () => {
    const hn = repopulationRateEstimates.find(
      (record) => record.id === "dprolif-hn-various-bcr2025",
    );
    expect(hn?.basis).toBe("EQD2");
    expect(hn?.rateGyPerDay).toBe(0.8);
    expect(hn?.kickOffDays).toBe(21);
    expect(hn?.defaultEligible).toBe(false);
    expect(hn?.status).toBe("deprecated");
  });

  it("keeps prostate time-loss evidence available but not automatic", () => {
    const prostate = repopulationRateEstimates.find(
      (record) => record.id === "dprolif-prostate-bcr2025",
    );
    expect(prostate?.rateGyPerDay).toBe(0.24);
    expect(prostate?.kickOffDays).toBeUndefined();
    expect(prostate?.kickOffNotes).toMatch(/52 days.*cut point/i);
    expect(prostate?.defaultEligible).toBe(false);
  });
});

describe("manual override provenance", () => {
  it("resolves the default evidence selection with source provenance", () => {
    const selection = defaultAlphaBetaSelection(
      "prostate-biochemical-control",
    );
    expect(selection).toBeDefined();

    const resolved = resolveAlphaBetaSelection(
      "prostate-biochemical-control",
      selection!,
    );

    expect(resolved.selectionMode).toBe("evidence");
    expect(resolved.valueGy).toBe(1.6);
    expect(resolved.source?.doi).toBe("10.1016/j.ijrobp.2020.01.010");
  });

  it("allows a positive user-specified alpha/beta without changing evidence", () => {
    const resolved = resolveAlphaBetaSelection(
      "prostate-biochemical-control",
      {
        selectionMode: "manual",
        parameter: "alpha-beta",
        value: 2.0,
        unit: "Gy",
        rationale: "Sensitivity analysis",
      },
    );

    expect(resolved.selectionMode).toBe("manual");
    expect(resolved.valueGy).toBe(2.0);
    expect(resolved.rationale).toBe("Sensitivity analysis");
    expect(resolved.source).toBeUndefined();
    expect(
      getPreferredAlphaBetaEstimate("prostate-biochemical-control")?.valueGy,
    ).toBe(1.6);
  });

  it("rejects non-positive manual alpha/beta values", () => {
    expect(() =>
      resolveAlphaBetaSelection("prostate-biochemical-control", {
        selectionMode: "manual",
        parameter: "alpha-beta",
        value: 0,
        unit: "Gy",
      }),
    ).toThrow();
  });
});
