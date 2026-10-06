import { describe, expect, it } from "vitest";
import { buildTreatmentGapOarAuditEntry } from "../src/audit/treatmentGapOarAudit.js";
import { buildTreatmentGapAuditRecord } from "../src/audit/treatmentGapAudit.js";
import {
  buildTreatmentGapBaseline,
  evaluatePreserveTimeStrategy,
  solveDoseCompensationStrategy,
} from "../src/workflows/treatmentGap.js";
import { buildTreatmentCalendarScenario } from "../src/workflows/treatmentCalendar.js";
import {
  compareOarCalendarStrategy,
  evaluateOarDoseCompensation,
} from "../src/workflows/treatmentGapOar.js";

describe("Treatment Gap OAR audit", () => {
  it("captures OAR alpha/beta, repair provenance and adds their sources to the parent audit", () => {
    const calendarInput = {
      startDate: "2026-09-07",
      fractions: 35,
      gapStartDate: "2026-10-05",
      gapEndDate: "2026-10-09",
    };
    const calendarScenario =
      buildTreatmentCalendarScenario(calendarInput);

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

    const weekend = compareOarCalendarStrategy({
      endpointId: "subcutis-fibrosis",
      metric,
      plannedCalendar: calendarScenario.planned,
      strategyCalendar:
        calendarScenario.weekendRecovery,
      dosePerFractionGy: 1,
      alphaBetaSelection: oarAlphaSelection,
    });
    const bid = compareOarCalendarStrategy({
      endpointId: "subcutis-fibrosis",
      metric,
      plannedCalendar: calendarScenario.planned,
      strategyCalendar: calendarScenario.bidRecovery,
      dosePerFractionGy: 1,
      alphaBetaSelection: oarAlphaSelection,
      repairHalfTimeSelection: repairSelection,
      bidInterfractionHours: 8,
    });
    const doseCompensationOar =
      evaluateOarDoseCompensation({
        endpointId: "subcutis-fibrosis",
        metric,
        deliveredFractionsBeforeGap:
          calendarScenario.deliveredFractionsBeforeGap,
        remainingFractions:
          calendarScenario.remainingFractionsAfterGap,
        plannedDosePerFractionGy: 1,
        postGapDosePerFractionGy: 1.1,
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
        weekend,
        bid,
        doseCompensationOar,
        postGapOarD: 1.1,
      },
    });

    expect(oar.status).toBe("calculated");
    if (oar.status !== "calculated") {
      throw new Error("Expected calculated OAR audit entry.");
    }
    expect(oar.alphaBeta.recordId).toBe(
      "ab-subcutis-fibrosis-bcr2025",
    );
    expect(oar.repairHalfTime.recordId).toBe(
      "t12-subcutis-fibrosis-chart1999",
    );
    expect(oar.repairHalfTime.valueHours).toBe(4.4);
    expect(oar.results.bid).toBeDefined();

    const tumourAlphaSelection = {
      selectionMode: "manual" as const,
      parameter: "alpha-beta" as const,
      value: 10,
      unit: "Gy" as const,
      rationale: "Regression test",
    };
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
      alphaBetaSelection: tumourAlphaSelection,
      repopulationSelection,
    });

    const weekendTumour = evaluatePreserveTimeStrategy(
      baseline,
      "weekend",
      {
        actualOverallTreatmentDays:
          calendarScenario.weekendOverallTreatmentDays,
      },
    );
    const bidTumour = evaluatePreserveTimeStrategy(
      baseline,
      "bid",
      {
        actualOverallTreatmentDays:
          calendarScenario.bidOverallTreatmentDays,
        bidInterfractionHours: 8,
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

    const parent = buildTreatmentGapAuditRecord({
      generatedAtIso: "2026-10-06T06:00:00.000Z",
      endpointId: "head-neck-tumour-control",
      courseInputMode: "calendar",
      alphaSelection: tumourAlphaSelection,
      repopulationSelection,
      baseline,
      weekend: weekendTumour,
      bid: bidTumour,
      doseCompensation,
      bidInterfractionHours: 8,
      doseCompensationInput,
      calendarInput,
      calendarScenario,
      oars: [oar],
    });

    expect(parent.oars).toHaveLength(1);
    expect(parent.oars[0]?.status).toBe("calculated");
    const sourceIds = parent.sources.map(
      (source) => source.id,
    );
    expect(sourceIds).toContain(
      "bentzen-saunders-dische-1999-repair",
    );
  });

  it("preserves an invalid OAR card in the audit instead of silently dropping it", () => {
    const entry = buildTreatmentGapOarAuditEntry({
      cardId: 7,
      endpointId: "subcutis-fibrosis",
      metric: { kind: "custom", customLabel: "" },
      inputState: {
        plannedOarDosePerFraction: "",
        postGapDoseMode: "manual",
        manualPostGapOarDose: "",
        alphaMode: "evidence",
        alphaRecordId: "",
        manualAlphaBeta: "",
        repairMode: "evidence",
        repairRecordId: "",
        manualRepairHalfTime: "",
        bidInterfractionHours: 8,
      },
      alphaSelection: {
        selectionMode: "evidence",
        parameterRecordId: "",
      },
      repairSelection: {
        selectionMode: "evidence",
        parameterRecordId: "",
      },
      calculation: {
        error: "A custom OAR dose metric requires a non-empty label.",
      },
    });

    expect(entry.status).toBe("input-error");
    if (entry.status !== "input-error") {
      throw new Error("Expected input-error OAR audit entry.");
    }
    expect(entry.error).toContain("non-empty label");
    expect(entry.inputState.alphaRecordId).toBe("");
  });
});
