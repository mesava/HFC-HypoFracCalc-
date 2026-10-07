import { describe, expect, it } from "vitest";
import {
  buildTreatmentGapAuditRecord,
} from "../src/audit/treatmentGapAudit.js";
import {
  buildTreatmentGapOarAuditEntry,
} from "../src/audit/treatmentGapOarAudit.js";
import {
  buildReirradiationAuditRecord,
} from "../src/audit/reirradiationAudit.js";
import {
  serializeAuditEnvelope,
} from "../src/audit/envelope.js";
import {
  inspectAuditDocument,
} from "../src/audit/replay.js";
import {
  buildTreatmentGapBaseline,
  evaluatePreserveTimeStrategy,
  solveDoseCompensationStrategy,
} from "../src/workflows/treatmentGap.js";
import {
  buildTreatmentCalendarScenario,
} from "../src/workflows/treatmentCalendar.js";
import {
  compareOarCalendarStrategy,
  evaluateOarDoseCompensation,
} from "../src/workflows/treatmentGapOar.js";
import {
  evaluateEvidenceReirradiationScenario,
  solveEvidenceRemainingEqd2Budget,
} from "../src/workflows/evidenceReirradiation.js";
import {
  assessHytecSpinalCordReirradiation,
} from "../src/workflows/reirradiationGuidance.js";
import type {
  ReirradiationCourse,
  ReirradiationScenarioContext,
} from "../src/domain/reirradiation.js";

const generatedAtIso = "2026-10-07T06:30:00.000Z";

function treatmentGapAudit() {
  const calendarInput = {
    startDate: "2026-09-07",
    fractions: 35,
    gapStartDate: "2026-10-05",
    gapEndDate: "2026-10-09",
  };
  const calendarScenario =
    buildTreatmentCalendarScenario(calendarInput);

  const alphaSelection = {
    selectionMode: "manual" as const,
    parameter: "alpha-beta" as const,
    value: 10,
    unit: "Gy" as const,
    rationale: "Clinical replay regression",
  };
  // Historical/deprecated records must remain replayable for old audits.
  const repopulationSelection = {
    selectionMode: "evidence" as const,
    parameterRecordId:
      "dprolif-hn-various-bcr2025",
  };

  const baseline = buildTreatmentGapBaseline({
    endpointId: "head-neck-tumour-control",
    plannedSchedule: {
      fractions: 35,
      dosePerFractionGy: 2,
    },
    plannedOverallTreatmentDays:
      calendarScenario.plannedOverallTreatmentDays,
    deliveredFractionsBeforeGap:
      calendarScenario.deliveredFractionsBeforeGap,
    gapDays: calendarScenario.gapCalendarDays,
    uncompensatedOverallTreatmentDays:
      calendarScenario.uncompensatedOverallTreatmentDays,
    alphaBetaSelection: alphaSelection,
    repopulationSelection,
  });

  const weekend = evaluatePreserveTimeStrategy(
    baseline,
    "weekend",
    {
      actualOverallTreatmentDays:
        calendarScenario.weekendOverallTreatmentDays,
    },
  );
  const bid = evaluatePreserveTimeStrategy(
    baseline,
    "bid",
    {
      bidInterfractionHours: 8,
      actualOverallTreatmentDays:
        calendarScenario.bidOverallTreatmentDays,
    },
  );
  const doseCompensationInput = {
    remainingFractionsToDeliver:
      baseline.remainingFractions,
    actualOverallTreatmentDays:
      calendarScenario.uncompensatedOverallTreatmentDays,
  };
  const doseCompensation =
    solveDoseCompensationStrategy(
      baseline,
      doseCompensationInput,
    );

  const oarAlphaSelection = {
    selectionMode: "evidence" as const,
    parameterRecordId:
      "ab-subcutis-fibrosis-bcr2025",
  };
  const repairSelection = {
    selectionMode: "evidence" as const,
    parameterRecordId:
      "t12-subcutis-fibrosis-chart1999",
  };
  const metric = { kind: "Dmax" } as const;

  const oarWeekend = compareOarCalendarStrategy({
    endpointId: "subcutis-fibrosis",
    metric,
    plannedCalendar: calendarScenario.planned,
    strategyCalendar:
      calendarScenario.weekendRecovery,
    dosePerFractionGy: 1,
    alphaBetaSelection: oarAlphaSelection,
  });
  const oarBid = compareOarCalendarStrategy({
    endpointId: "subcutis-fibrosis",
    metric,
    plannedCalendar: calendarScenario.planned,
    strategyCalendar: calendarScenario.bidRecovery,
    dosePerFractionGy: 1,
    alphaBetaSelection: oarAlphaSelection,
    repairHalfTimeSelection: repairSelection,
    bidInterfractionHours: 8,
  });
  const postGapOarD = 1.1;
  const doseCompensationOar =
    evaluateOarDoseCompensation({
      endpointId: "subcutis-fibrosis",
      metric,
      deliveredFractionsBeforeGap:
        baseline.deliveredFractionsBeforeGap,
      remainingFractions:
        doseCompensation.remainingFractionsToDeliver,
      plannedDosePerFractionGy: 1,
      postGapDosePerFractionGy: postGapOarD,
      alphaBetaSelection: oarAlphaSelection,
    });

  const oar = buildTreatmentGapOarAuditEntry({
    cardId: 1,
    endpointId: "subcutis-fibrosis",
    metric,
    inputState: {
      plannedOarDosePerFraction: "1",
      postGapDoseMode: "manual",
      manualPostGapOarDose: "1.1",
      alphaMode: "evidence",
      alphaRecordId:
        "ab-subcutis-fibrosis-bcr2025",
      manualAlphaBeta: "3",
      repairMode: "evidence",
      repairRecordId:
        "t12-subcutis-fibrosis-chart1999",
      manualRepairHalfTime: "4.4",
      bidInterfractionHours: 8,
    },
    alphaSelection: oarAlphaSelection,
    repairSelection,
    calculation: {
      weekend: oarWeekend,
      bid: oarBid,
      doseCompensationOar,
      postGapOarD,
    },
  });

  return buildTreatmentGapAuditRecord({
    generatedAtIso,
    endpointId: "head-neck-tumour-control",
    courseInputMode: "calendar",
    alphaSelection,
    repopulationSelection,
    baseline,
    weekend,
    bid,
    doseCompensation,
    bidInterfractionHours: 8,
    doseCompensationInput,
    calendarInput,
    calendarScenario,
    oars: [oar],
  });
}

const reirradiationContext: ReirradiationScenarioContext = {
  geometricOverlap: true,
  cumulativeDoseToxicityConcern: true,
  previousDoseData: "summary-only",
  registrationSuitability: "uncertain",
  strategy: "conservative-near-max",
};

function reirradiationCourses(
  metric: "D0.1cc" | "Dmax" = "D0.1cc",
): ReirradiationCourse[] {
  return [
    {
      id: "prior",
      label: "Prior course",
      role: "previous",
      schedule: {
        fractions: 10,
        dosePerFractionGy: 2,
      },
      metric: { kind: metric },
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
      metric: { kind: metric },
    },
  ];
}

function reirradiationAudit() {
  const courses = reirradiationCourses();
  const selection = {
    selectionMode: "manual" as const,
    parameter: "alpha-beta" as const,
    value: 3,
    unit: "Gy" as const,
    rationale: "Replay regression",
  };

  const result =
    evaluateEvidenceReirradiationScenario(
      "subcutis-fibrosis",
      courses,
      reirradiationContext,
      selection,
    );
  const budget =
    solveEvidenceRemainingEqd2Budget(
      "subcutis-fibrosis",
      [courses[0]!],
      { kind: "D0.1cc" },
      70,
      5,
      selection,
    );

  return buildReirradiationAuditRecord({
    generatedAtIso,
    endpointId: "subcutis-fibrosis",
    courses,
    context: reirradiationContext,
    result,
    budget,
  });
}

function spinalGuidanceAudit(
  confirmed: boolean,
) {
  const courses = reirradiationCourses("Dmax");
  const selection = {
    selectionMode: "manual" as const,
    parameter: "alpha-beta" as const,
    value: 2,
    unit: "Gy" as const,
    rationale: "Replay regression",
  };
  const result =
    evaluateEvidenceReirradiationScenario(
      "spinal-cord-radiation-myelopathy",
      courses,
      reirradiationContext,
      selection,
    );
  const guidance =
    assessHytecSpinalCordReirradiation(
      courses,
      confirmed,
    );

  return buildReirradiationAuditRecord({
    generatedAtIso,
    endpointId:
      "spinal-cord-radiation-myelopathy",
    courses,
    context: reirradiationContext,
    result,
    confirmThecalSacDmax: confirmed,
    guidance,
  });
}

describe("clinical audit replay v0.2", () => {
  it("replays a Treatment Gap audit including calendar, strategies and OAR provenance", async () => {
    const inspected = await inspectAuditDocument(
      await serializeAuditEnvelope(
        treatmentGapAudit(),
      ),
    );

    expect(inspected.integrityStatus).toBe("verified");
    expect(inspected.replaySupported).toBe(true);
    expect(inspected.replay?.module).toBe(
      "treatment-gap",
    );
    expect(inspected.replay?.matches).toBe(true);
    expect(inspected.replay?.differences).toEqual([]);
  });

  it("detects Treatment Gap result drift in a legacy raw audit", async () => {
    const audit = treatmentGapAudit();
    audit.baseline.plannedEffectiveEqd2Gy += 0.5;

    const inspected = await inspectAuditDocument(
      JSON.stringify(audit),
    );

    expect(inspected.integrityStatus).toBe(
      "legacy-unverified",
    );
    expect(inspected.replay?.matches).toBe(false);
    expect(
      inspected.replay?.differences.some(
        (difference) =>
          difference.path ===
          "baseline.plannedEffectiveEqd2Gy",
      ),
    ).toBe(true);
  });

  it("replays reirradiation cumulative dose and remaining budget", async () => {
    const inspected = await inspectAuditDocument(
      await serializeAuditEnvelope(
        reirradiationAudit(),
      ),
    );

    expect(inspected.integrityStatus).toBe("verified");
    expect(inspected.replay?.module).toBe(
      "reirradiation",
    );
    expect(inspected.replay?.matches).toBe(true);
    expect(inspected.replay?.differences).toEqual([]);
  });

  it.each([true, false])(
    "replays spinal HyTEC guidance when thecal-sac confirmation is %s",
    async (confirmed) => {
      const inspected = await inspectAuditDocument(
        await serializeAuditEnvelope(
          spinalGuidanceAudit(confirmed),
        ),
      );

      expect(inspected.replay?.matches).toBe(true);
      expect(inspected.replay?.differences).toEqual([]);
    },
  );

  it("replays historical schema 1.0 spinal guidance without explicit user confirmation", async () => {
    const legacy = spinalGuidanceAudit(true);
    legacy.schemaVersion = "1.0";
    delete legacy.userConfirmations;

    const inspected = await inspectAuditDocument(
      await serializeAuditEnvelope(legacy),
    );

    expect(inspected.integrityStatus).toBe("verified");
    expect(inspected.header.schemaVersion).toBe("1.0");
    expect(inspected.replay?.matches).toBe(true);
    expect(inspected.replay?.differences).toEqual([]);
  });
});
