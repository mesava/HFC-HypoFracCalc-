import { describe, expect, it } from "vitest";
import {
  alphaBetaEstimates,
  endpoints,
  evidenceManifest,
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
  });

  it("all alpha/beta records reference existing sources and endpoints", () => {
    const sourceIds = new Set(sources.map((source) => source.id));
    const endpointIds = new Set(endpoints.map((endpoint) => endpoint.id));

    for (const record of alphaBetaEstimates) {
      expect(sourceIds.has(record.sourceId)).toBe(true);
      expect(endpointIds.has(record.endpointId)).toBe(true);
      expect(record.valueGy).toBeGreaterThan(0);

      if (record.ci95) {
        expect(record.ci95.low).toBeLessThanOrEqual(record.valueGy);
        expect(record.ci95.high).toBeGreaterThanOrEqual(record.valueGy);
      }
    }
  });

  it("has no more than one auto-default per endpoint", () => {
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
});

describe("preferred alpha/beta selections", () => {
  it("selects 1.6 Gy for prostate biochemical control", () => {
    const record = getPreferredAlphaBetaEstimate(
      "prostate-biochemical-control",
    );
    expect(record?.valueGy).toBe(1.6);
    expect(record?.ci95).toEqual({ level: 0.95, low: 1.3, high: 2.0 });
  });

  it("selects endpoint-specific late rectal estimates", () => {
    expect(
      getPreferredAlphaBetaEstimate("rectum-bleeding-g1plus")?.valueGy,
    ).toBe(1.6);
    expect(
      getPreferredAlphaBetaEstimate("rectum-proctitis-g1plus")?.valueGy,
    ).toBe(2.7);
    expect(
      getPreferredAlphaBetaEstimate("rectum-sphincter-control-g1plus")
        ?.valueGy,
    ).toBe(3.1);
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
