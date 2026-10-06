import { describe, expect, it } from "vitest";
import { buildQuickEqdAuditRecord } from "../src/audit/quickEqdAudit.js";
import { buildCompareRegimensAuditRecord } from "../src/audit/compareRegimensAudit.js";
import { buildTreatmentGapAuditRecord } from "../src/audit/treatmentGapAudit.js";
import { serializeAuditRecord } from "../src/audit/common.js";
import { calculateEvidenceLq } from "../src/workflows/evidenceLq.js";
import { compareRegimens } from "../src/workflows/compareRegimens.js";
import {
  buildTreatmentGapBaseline,
  evaluatePreserveTimeStrategy,
  solveDoseCompensationStrategy,
} from "../src/workflows/treatmentGap.js";
import { buildTreatmentCalendarScenario } from "../src/workflows/treatmentCalendar.js";

const generatedAtIso = "2026-10-06T05:00:00.000Z";

describe("audit coverage for HFC core modules", () => {
  it("builds a Quick EQD audit with evidence provenance", () => {
    const result = calculateEvidenceLq(
      "prostate-biochemical-control",
      {
        fractions: 5,
        dosePerFractionGy: 7.25,
      },
    );

    const audit = buildQuickEqdAuditRecord(
      generatedAtIso,
      result,
    );

    expect(audit.module).toBe("quick-eqd");
    expect(audit.endpoint.id).toBe(
      "prostate-biochemical-control",
    );
    expect(audit.alphaBeta.selectionMode).toBe(
      "evidence",
    );
    expect(audit.sources.length).toBeGreaterThan(0);
    expect(audit.result.eqd2Gy).toBeCloseTo(
      result.eqd2Gy,
      12,
    );
  });

  it("builds a Compare Regimens audit for multiple endpoints and regimens", () => {
    const result = compareRegimens(
      [
        {
          id: "ref",
          label: "Reference",
          schedule: {
            fractions: 30,
            dosePerFractionGy: 2,
          },
        },
        {
          id: "test",
          label: "Test",
          schedule: {
            fractions: 20,
            dosePerFractionGy: 3,
          },
        },
      ],
      [
        {
          endpointId:
            "prostate-biochemical-control",
        },
        {
          endpointId:
            "rectum-bleeding-g1plus",
        },
      ],
      "ref",
    );

    const audit = buildCompareRegimensAuditRecord(
      generatedAtIso,
      result,
    );

    expect(audit.module).toBe("compare-regimens");
    expect(audit.referenceRegimenId).toBe("ref");
    expect(audit.regimens).toHaveLength(2);
    expect(audit.endpoints).toHaveLength(2);
    expect(
      audit.endpoints.every(
        (endpoint) =>
          endpoint.comparison.cells.length === 2,
      ),
    ).toBe(true);
    expect(audit.sources.length).toBeGreaterThanOrEqual(2);
  });

  it("builds a calendar-based Treatment Gap audit with method and parameter sources", () => {
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

    const audit = buildTreatmentGapAuditRecord({
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
    });

    expect(audit.module).toBe("treatment-gap");
    expect(audit.calendarScenario?.plannedFractions).toBe(
      35,
    );
    expect(audit.inputs.repopulationSelection).toEqual(
      repopulationSelection,
    );
    const sourceIds = audit.sources.map(
      (source) => source.id,
    );
    expect(sourceIds).toContain(
      "rcr-2019-timely-delivery",
    );
    expect(sourceIds).toContain(
      "bcr-2025-ch10-tables",
    );
  });

  it("serializes each audit record as valid JSON", () => {
    const result = calculateEvidenceLq(
      "prostate-biochemical-control",
      {
        fractions: 5,
        dosePerFractionGy: 7.25,
      },
    );
    const audit = buildQuickEqdAuditRecord(
      generatedAtIso,
      result,
    );

    expect(
      JSON.parse(serializeAuditRecord(audit)),
    ).toEqual(audit);
  });
});
