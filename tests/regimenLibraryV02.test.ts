import { describe, expect, it } from "vitest";
import {
  complexRegimenLibraryManifest,
  complexRegimenPresets,
} from "../src/data/regimens/v0.2/index.js";
import {
  sources,
} from "../src/data/evidence/v0.1/index.js";
import {
  getComplexRegimenPresetById,
  getComplexRegimenPresetsByKind,
  getComplexRegimenPresetsBySite,
} from "../src/regimens/registry.js";

describe("RCR 2024 complex regimen library v0.2", () => {
  it("contains unique source-backed complex prescriptions without a top-level fixed schedule", () => {
    const ids = complexRegimenPresets.map(
      (preset) => preset.id,
    );

    expect(complexRegimenPresets).toHaveLength(4);
    expect(new Set(ids).size).toBe(ids.length);

    for (const preset of complexRegimenPresets) {
      expect(preset.datasetVersion).toBe(
        complexRegimenLibraryManifest.datasetVersion,
      );
      expect(preset.sourceId).toBe(
        complexRegimenLibraryManifest.sourceId,
      );
      expect(
        sources.some(
          (source) =>
            source.id === preset.sourceId,
        ),
      ).toBe(true);
      expect("schedule" in preset).toBe(false);
      expect(
        ["dose-range", "sequential", "sib"],
      ).toContain(preset.prescription.kind);
    }
  });

  it("preserves the 21–24 Gy single-fraction brain-metastasis recommendation as a range", () => {
    const preset = getComplexRegimenPresetById(
      "rcr2024-brainmets-srs-under20mm-21to24gy-1fx",
    );

    expect(preset).toBeDefined();
    expect(preset?.recommendationGrade).toBe("B");
    expect(preset?.prescription).toEqual({
      kind: "dose-range",
      fractions: 1,
      totalDoseGyRange: {
        low: 21,
        high: 24,
      },
    });
  });

  it("preserves breast SIB as two simultaneous target dose levels over the same 15 fractions", () => {
    const preset = getComplexRegimenPresetById(
      "rcr2024-breast-boost-sib-48gy-40gy-15fx",
    );

    expect(preset).toBeDefined();
    if (!preset || preset.prescription.kind !== "sib") {
      return;
    }

    expect(preset.prescription.fractions).toBe(15);
    expect(
      preset.prescription.doseLevels.map(
        (level) => [
          level.id,
          level.totalDoseGy,
        ],
      ),
    ).toEqual([
      ["boost-volume", 48],
      ["rest-of-breast", 40],
    ]);
    expect(preset.recommendationGrade).toBe("A");
  });

  it("keeps sequential breast boosts as ordered phases rather than summing them into one n×d", () => {
    const preset = getComplexRegimenPresetById(
      "rcr2024-breast-boost-sequential-26gy5-plus-13p35gy5",
    );

    expect(preset).toBeDefined();
    if (
      !preset ||
      preset.prescription.kind !==
        "sequential"
    ) {
      return;
    }

    expect(
      preset.prescription.phases.map(
        (phase) => ({
          id: phase.id,
          fractions: phase.schedule.fractions,
          totalDoseGy:
            phase.schedule.fractions *
            phase.schedule.dosePerFractionGy,
        }),
      ),
    ).toEqual([
      {
        id: "whole-breast",
        fractions: 5,
        totalDoseGy: 26,
      },
      {
        id: "boost",
        fractions: 5,
        totalDoseGy: 13.35,
      },
    ]);
  });

  it("does not embed alpha/beta selection and supports kind/site lookup", () => {
    const serialized = JSON.stringify(
      complexRegimenPresets,
    ).toLowerCase();

    expect(serialized).not.toContain(
      "alphabeta",
    );
    expect(serialized).not.toContain(
      "alpha-beta",
    );

    expect(
      getComplexRegimenPresetsByKind("sib"),
    ).toHaveLength(1);
    expect(
      getComplexRegimenPresetsByKind(
        "dose-range",
      ),
    ).toHaveLength(1);
    expect(
      getComplexRegimenPresetsByKind(
        "sequential",
      ),
    ).toHaveLength(2);
    expect(
      getComplexRegimenPresetsBySite(
        "breast",
      ),
    ).toHaveLength(3);
  });
});
