import { describe, expect, it } from "vitest";
import { compareRegimens } from "../src/workflows/compareRegimens.js";

describe("Compare Regimens workflow", () => {
  const regimens = [
    {
      id: "r1",
      label: "60 Gy / 30",
      schedule: { fractions: 30, dosePerFractionGy: 2 },
    },
    {
      id: "r2",
      label: "60 Gy / 20",
      schedule: { fractions: 20, dosePerFractionGy: 3 },
    },
    {
      id: "r3",
      label: "36.25 Gy / 5",
      schedule: { fractions: 5, dosePerFractionGy: 7.25 },
    },
  ];

  it("compares multiple regimens against one reference for one endpoint", () => {
    const comparison = compareRegimens(
      regimens,
      [{ endpointId: "prostate-biochemical-control" }],
      "r1",
    );

    expect(comparison.referenceRegimenId).toBe("r1");
    expect(comparison.endpoints).toHaveLength(1);

    const cells = comparison.endpoints[0]!.cells;
    expect(cells).toHaveLength(3);
    expect(cells[0]?.deltaEqd2Gy).toBeCloseTo(0, 12);
    expect(cells[1]?.deltaEqd2Gy).toBeGreaterThan(0);
    expect(cells[2]?.deltaEqd2Gy).toBeGreaterThan(0);
  });

  it("compares multiple endpoints in one matrix", () => {
    const comparison = compareRegimens(
      regimens,
      [
        { endpointId: "prostate-biochemical-control" },
        { endpointId: "rectum-bleeding-g1plus" },
      ],
      "r1",
    );

    expect(comparison.endpoints.map((item) => item.endpointId)).toEqual([
      "prostate-biochemical-control",
      "rectum-bleeding-g1plus",
    ]);
  });

  it("computes correlated delta-EQD2 sensitivity using the same alpha/beta CI boundaries", () => {
    const comparison = compareRegimens(
      regimens.slice(0, 2),
      [{ endpointId: "prostate-biochemical-control" }],
      "r1",
    );

    const compared = comparison.endpoints[0]!.cells[1]!;
    expect(compared.deltaEqd2Sensitivity).toBeDefined();
    expect(compared.deltaEqd2Sensitivity!.low).toBeLessThanOrEqual(
      compared.deltaEqd2Sensitivity!.high,
    );

    // The central estimate should lie inside the boundary sensitivity range.
    expect(compared.deltaEqd2Gy).toBeGreaterThanOrEqual(
      compared.deltaEqd2Sensitivity!.low,
    );
    expect(compared.deltaEqd2Gy).toBeLessThanOrEqual(
      compared.deltaEqd2Sensitivity!.high,
    );
  });

  it("keeps manual alpha/beta selection consistent across all compared schedules", () => {
    const comparison = compareRegimens(
      regimens.slice(0, 2),
      [
        {
          endpointId: "spinal-cord-radiation-myelopathy",
          selection: {
            selectionMode: "manual",
            parameter: "alpha-beta",
            value: 2,
            unit: "Gy",
            rationale: "Local protocol",
          },
        },
      ],
      "r1",
    );

    for (const cell of comparison.endpoints[0]!.cells) {
      expect(cell.result.selectionMode).toBe("manual");
      expect(cell.result.alphaBetaGy).toBe(2);
      expect(cell.result.sourceId).toBeUndefined();
    }
  });

  it("refuses an endpoint without a default when no explicit selection is supplied", () => {
    expect(() =>
      compareRegimens(
        regimens.slice(0, 2),
        [{ endpointId: "spinal-cord-radiation-myelopathy" }],
        "r1",
      ),
    ).toThrow(/No default-eligible alpha\/beta estimate/);
  });

  it("rejects duplicate regimen IDs", () => {
    expect(() =>
      compareRegimens(
        [regimens[0]!, { ...regimens[1]!, id: "r1" }],
        [{ endpointId: "prostate-biochemical-control" }],
        "r1",
      ),
    ).toThrow(/Regimen IDs must be unique/);
  });

  it("rejects duplicate endpoints", () => {
    expect(() =>
      compareRegimens(
        regimens.slice(0, 2),
        [
          { endpointId: "prostate-biochemical-control" },
          { endpointId: "prostate-biochemical-control" },
        ],
        "r1",
      ),
    ).toThrow(/Endpoint IDs must be unique/);
  });
});
