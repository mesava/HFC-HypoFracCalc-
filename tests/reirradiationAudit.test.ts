import { describe, expect, it } from "vitest";
import {
  buildReirradiationAuditRecord,
  serializeAuditRecord,
} from "../src/audit/reirradiationAudit.js";
import {
  evaluateEvidenceReirradiationScenario,
  solveEvidenceRemainingEqd2Budget,
} from "../src/workflows/evidenceReirradiation.js";
import { assessHytecSpinalCordReirradiation } from "../src/workflows/reirradiationGuidance.js";
import type {
  ReirradiationCourse,
  ReirradiationScenarioContext,
} from "../src/domain/reirradiation.js";

const context: ReirradiationScenarioContext = {
  geometricOverlap: true,
  cumulativeDoseToxicityConcern: true,
  previousDoseData: "summary-only",
  registrationSuitability: "uncertain",
  strategy: "conservative-near-max",
};

const courses: ReirradiationCourse[] = [
  {
    id: "prior",
    label: "Prior course",
    role: "previous",
    schedule: {
      fractions: 10,
      dosePerFractionGy: 2,
    },
    metric: { kind: "Dmax" },
    intervalToCurrentMonths: 12,
    recovery: { mode: "none" },
  },
  {
    id: "current",
    label: "Current course",
    role: "current",
    schedule: {
      fractions: 5,
      dosePerFractionGy: 3,
    },
    metric: { kind: "Dmax" },
  },
];

describe("reirradiation audit record", () => {
  it("captures versions, inputs, outputs, provenance and method sources", () => {
    const result = evaluateEvidenceReirradiationScenario(
      "spinal-cord-radiation-myelopathy",
      courses,
      context,
      {
        selectionMode: "manual",
        parameter: "alpha-beta",
        value: 2,
        unit: "Gy",
        rationale: "Regression test",
      },
    );

    const budget = solveEvidenceRemainingEqd2Budget(
      "spinal-cord-radiation-myelopathy",
      [courses[0]!],
      { kind: "Dmax" },
      70,
      5,
      {
        selectionMode: "manual",
        parameter: "alpha-beta",
        value: 2,
        unit: "Gy",
        rationale: "Regression test",
      },
    );

    const guidance =
      assessHytecSpinalCordReirradiation(
        courses,
        true,
      );

    const audit = buildReirradiationAuditRecord({
      generatedAtIso: "2026-10-05T20:00:00.000Z",
      endpointId:
        "spinal-cord-radiation-myelopathy",
      courses,
      context,
      result,
      budget,
      guidance,
    });

    expect(audit.schemaVersion).toBe("1.0");
    expect(audit.engineVersion).toBe("0.1.0-dev");
    expect(audit.evidence.datasetVersion).toBe(
      "2026.10-v0.1",
    );
    expect(audit.endpoint.id).toBe(
      "spinal-cord-radiation-myelopathy",
    );
    expect(audit.alphaBeta.selectionMode).toBe("manual");
    expect(audit.alphaBeta.valueGy).toBe(2);
    expect(audit.inputCourses).toHaveLength(2);
    expect(audit.result.courses).toHaveLength(2);
    expect(audit.budget?.cumulativeLimitGy).toBe(70);
    expect(audit.guidance?.sourceId).toBe(
      "sahgal-2021-hytec-spinal-cord",
    );

    const sourceIds = audit.sources.map(
      (source) => source.id,
    );
    for (const sourceId of [
      "andratschke-2022-estro-eortc-reirradiation",
      "rcr-2024-principles-reirradiation",
      "appelt-2026-cumulative-dose-reirradiation",
      "paradis-2026-recog-consensus",
      "zhang-2026-recog-case-guide",
      "sahgal-2021-hytec-spinal-cord",
    ]) {
      expect(sourceIds).toContain(sourceId);
    }
  });

  it("serializes deterministically for a fixed timestamp", () => {
    const result = evaluateEvidenceReirradiationScenario(
      "subcutis-fibrosis",
      [
        {
          ...courses[0]!,
          metric: { kind: "D0.1cc" },
        },
        {
          ...courses[1]!,
          metric: { kind: "D0.1cc" },
        },
      ],
      context,
    );

    const audit = buildReirradiationAuditRecord({
      generatedAtIso: "2026-10-05T20:00:00.000Z",
      endpointId: "subcutis-fibrosis",
      courses: [
        {
          ...courses[0]!,
          metric: { kind: "D0.1cc" },
        },
        {
          ...courses[1]!,
          metric: { kind: "D0.1cc" },
        },
      ],
      context,
      result,
    });

    const serialized = serializeAuditRecord(audit);
    expect(serialized).toContain(
      '"module": "reirradiation"',
    );
    expect(serialized).toContain(
      '"generatedAtIso": "2026-10-05T20:00:00.000Z"',
    );
    expect(JSON.parse(serialized)).toEqual(audit);
  });

  it("rejects a mismatched endpoint", () => {
    const result = evaluateEvidenceReirradiationScenario(
      "subcutis-fibrosis",
      [
        {
          ...courses[0]!,
          metric: { kind: "D0.1cc" },
        },
        {
          ...courses[1]!,
          metric: { kind: "D0.1cc" },
        },
      ],
      context,
    );

    expect(() =>
      buildReirradiationAuditRecord({
        generatedAtIso:
          "2026-10-05T20:00:00.000Z",
        endpointId:
          "spinal-cord-radiation-myelopathy",
        courses,
        context,
        result,
      }),
    ).toThrow(/endpoint does not match/);
  });
});
