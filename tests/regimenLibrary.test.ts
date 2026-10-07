import { describe, expect, it } from "vitest";
import {
  regimenLibraryManifest,
  regimenPresets,
} from "../src/data/regimens/v0.1/index.js";
import {
  sources,
} from "../src/data/evidence/v0.1/index.js";
import {
  getRegimenPresetById,
  getRegimenPresetsByIntent,
  getRegimenPresetsBySite,
} from "../src/regimens/registry.js";
import {
  compareRegimens,
} from "../src/workflows/compareRegimens.js";
import {
  buildCompareRegimensAuditRecord,
} from "../src/audit/compareRegimensAudit.js";
import {
  serializeAuditEnvelope,
} from "../src/audit/envelope.js";
import {
  inspectAuditDocument,
} from "../src/audit/replay.js";

describe("RCR 2024 regimen library", () => {
  it("contains only valid unique source-backed fixed schedules", () => {
    const ids = regimenPresets.map(
      (preset) => preset.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect(regimenPresets.length).toBeGreaterThan(20);

    for (const preset of regimenPresets) {
      expect(preset.datasetVersion).toBe(
        regimenLibraryManifest.datasetVersion,
      );
      expect(preset.sourceId).toBe(
        regimenLibraryManifest.sourceId,
      );
      expect(
        sources.some(
          (source) =>
            source.id === preset.sourceId,
        ),
      ).toBe(true);
      expect(
        Number.isInteger(
          preset.schedule.fractions,
        ),
      ).toBe(true);
      expect(
        preset.schedule.fractions,
      ).toBeGreaterThan(0);
      expect(
        preset.schedule.dosePerFractionGy,
      ).toBeGreaterThan(0);
      expect(
        ["A", "B", "C", "D"],
      ).toContain(preset.recommendationGrade);
    }
  });

  it("does not embed alpha/beta or other biological parameter selections in presets", () => {
    const serialized = JSON.stringify(
      regimenPresets,
    ).toLowerCase();

    expect(serialized).not.toContain(
      "alphabeta",
    );
    expect(serialized).not.toContain(
      "alpha-beta",
    );
    expect(serialized).not.toContain(
      "parameterrecordid",
    );
  });

  it("preserves representative RCR schedules and recommendation grades", () => {
    const cases = [
      [
        "rcr2024-breast-nonnodal-26gy-5fx",
        5,
        26,
        "A",
      ],
      [
        "rcr2024-prostate-only-60gy-20fx",
        20,
        60,
        "A",
      ],
      [
        "rcr2024-prostate-sbrt-36p25gy-5fx",
        5,
        36.25,
        "A",
      ],
      [
        "rcr2024-bone-pain-8gy-1fx",
        1,
        8,
        "A",
      ],
      [
        "rcr2024-brainmets-wbrt-30gy-10fx",
        10,
        30,
        "A",
      ],
    ] as const;

    for (const [
      id,
      fractions,
      totalDose,
      grade,
    ] of cases) {
      const preset = getRegimenPresetById(id);
      expect(preset).toBeDefined();
      expect(preset?.schedule.fractions).toBe(
        fractions,
      );
      expect(
        (preset?.schedule.fractions ?? 0) *
          (preset?.schedule
            .dosePerFractionGy ?? 0),
      ).toBeCloseTo(totalDose, 12);
      expect(
        preset?.recommendationGrade,
      ).toBe(grade);
    }
  });

  it("supports site and intent lookup without changing evidence selection", () => {
    expect(
      getRegimenPresetsBySite("prostate")
        .length,
    ).toBeGreaterThanOrEqual(5);
    expect(
      getRegimenPresetsByIntent(
        "palliative",
      ).length,
    ).toBeGreaterThanOrEqual(5);
  });

  it("preserves preset provenance through Compare audit and replay", async () => {
    const preset = getRegimenPresetById(
      "rcr2024-prostate-only-60gy-20fx",
    );
    expect(preset).toBeDefined();
    if (!preset) return;

    const result = compareRegimens(
      [
        {
          id: "manual-reference",
          label: "Reference",
          schedule: {
            fractions: 30,
            dosePerFractionGy: 2,
          },
        },
        {
          id: "rcr-preset",
          label: preset.label.en,
          schedule: preset.schedule,
          preset: {
            presetId: preset.id,
            datasetVersion:
              preset.datasetVersion,
            sourceId: preset.sourceId,
            recommendationGrade:
              preset.recommendationGrade,
          },
        },
      ],
      [
        {
          endpointId:
            "prostate-biochemical-control",
        },
      ],
      "manual-reference",
    );

    const audit =
      buildCompareRegimensAuditRecord(
        "2026-10-07T08:00:00.000Z",
        result,
      );

    expect(
      audit.regimens[1]?.preset?.presetId,
    ).toBe(preset.id);

    const inspected =
      await inspectAuditDocument(
        await serializeAuditEnvelope(audit),
      );

    expect(inspected.replay?.matches).toBe(
      true,
    );
    expect(
      inspected.replay?.differences,
    ).toEqual([]);
  });
});
