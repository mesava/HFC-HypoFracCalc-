import { describe, expect, it } from "vitest";
import {
  alphaBetaEstimates,
  evidenceManifest,
  evidenceValidationInventory,
  hytecClinicalConstraints,
  repairHalfTimeEstimates,
  repopulationRateEstimates,
  reirradiationGuidanceSets,
} from "../src/data/evidence/v0.1/index.js";

describe("evidence validation inventory coverage", () => {
  const evidenceIds = [
    ...alphaBetaEstimates.map((record) => record.id),
    ...repairHalfTimeEstimates.map((record) => record.id),
    ...repopulationRateEstimates.map((record) => record.id),
    ...hytecClinicalConstraints.map((record) => record.id),
    ...reirradiationGuidanceSets.map((record) => record.id),
  ];

  it("covers every current evidence record exactly once", () => {
    const inventoryIds = evidenceValidationInventory.map(
      (record) => record.recordId,
    );

    expect(evidenceIds).toHaveLength(78);
    expect(inventoryIds).toHaveLength(evidenceIds.length);
    expect(new Set(inventoryIds).size).toBe(inventoryIds.length);
    expect([...inventoryIds].sort()).toEqual([...evidenceIds].sort());
  });

  it("keeps the dataset draft while primary-source sign-off remains open", () => {
    const pending = evidenceValidationInventory.filter((record) =>
      record.state.includes("pending"),
    );

    expect(pending).toHaveLength(13);
    expect(evidenceManifest.releaseStatus).toBe("draft");
  });

  it("makes the one pending automatic time model explicit", () => {
    const pendingIds = new Set<string>(
      evidenceValidationInventory
        .filter((record) => record.state.includes("pending"))
        .map((record) => record.recordId),
    );

    const pendingAutomatic = repopulationRateEstimates
      .filter(
        (record) =>
          record.defaultEligible && pendingIds.has(record.id),
      )
      .map((record) => record.id);

    expect(pendingAutomatic).toEqual([
      "dprolif-hn-various-bcr2025",
    ]);
  });
});
