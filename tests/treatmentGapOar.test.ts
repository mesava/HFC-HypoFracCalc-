import { describe, expect, it } from "vitest";
import {
  compareOarCalendarStrategy,
  evaluateOarCalendarEffect,
  evaluateOarDoseCompensation,
  proportionalOarDosePerFraction,
} from "../src/workflows/treatmentGapOar.js";
import type { CalendarFractionDay } from "../src/workflows/treatmentCalendar.js";

const manualAlpha = {
  selectionMode: "manual" as const,
  parameter: "alpha-beta" as const,
  value: 3,
  unit: "Gy" as const,
};

const manualRepair = {
  selectionMode: "manual" as const,
  parameter: "repair-half-time" as const,
  value: 4.4,
  unit: "hours" as const,
};

function calendar(
  fractionsPerDay: (1 | 2)[],
): CalendarFractionDay[] {
  return fractionsPerDay.map((fractions, index) => ({
    date: "2026-10-" + String(index + 1).padStart(2, "0"),
    fractions,
    kind:
      fractions === 2
        ? "bid-recovery"
        : "regular",
  }));
}

describe("Treatment Gap OAR workflow", () => {
  it("returns the same OAR BED/EQD2 when fractions are only moved to weekends", () => {
    const planned = calendar(
      Array.from({ length: 10 }, () => 1 as const),
    );
    const weekend = planned.map((day, index) => ({
      ...day,
      kind:
        index >= 8
          ? ("weekend-recovery" as const)
          : ("regular" as const),
    }));

    const result = compareOarCalendarStrategy({
      endpointId: "subcutis-fibrosis",
      plannedCalendar: planned,
      strategyCalendar: weekend,
      dosePerFractionGy: 1,
      alphaBetaSelection: manualAlpha,
    });

    expect(result.deltaBedGy).toBeCloseTo(0, 12);
    expect(result.deltaEqd2Gy).toBeCloseTo(0, 12);
  });

  it("increases modelled OAR effect on BID days when incomplete repair is present", () => {
    const planned = calendar(
      Array.from({ length: 10 }, () => 1 as const),
    );
    const bid = calendar([2, 2, 2, 2, 2]);

    const result = compareOarCalendarStrategy({
      endpointId: "subcutis-fibrosis",
      plannedCalendar: planned,
      strategyCalendar: bid,
      dosePerFractionGy: 1,
      alphaBetaSelection: manualAlpha,
      repairHalfTimeSelection: manualRepair,
      bidInterfractionHours: 6,
    });

    expect(result.strategy.bidDays).toBe(5);
    expect(result.strategy.repairHalfTimeHours).toBe(4.4);
    expect(result.deltaBedGy).toBeGreaterThan(0);
    expect(result.deltaEqd2Gy).toBeGreaterThan(0);
  });

  it("requires an explicit repair half-time when BID is used and no point default exists", () => {
    expect(() =>
      evaluateOarCalendarEffect({
        endpointId: "spinal-cord-radiation-myelopathy",
        calendar: calendar([2, 1, 1]),
        dosePerFractionGy: 1,
        alphaBetaSelection: manualAlpha,
        bidInterfractionHours: 8,
      }),
    ).toThrow(/No point repair half-time default/);
  });

  it("rejects range or bound evidence records as if they were point T1/2 values", () => {
    expect(() =>
      evaluateOarCalendarEffect({
        endpointId: "spinal-cord-radiation-myelopathy",
        calendar: calendar([2, 1, 1]),
        dosePerFractionGy: 1,
        alphaBetaSelection: manualAlpha,
        repairHalfTimeSelection: {
          selectionMode: "evidence",
          parameterRecordId:
            "t12-spinal-cord-myelopathy-bcr2025",
        },
        bidInterfractionHours: 8,
      }),
    ).toThrow(/range or bound rather than a point estimate/);
  });

  it("calculates post-gap OAR effect from an explicitly entered post-gap OAR dose", () => {
    const result = evaluateOarDoseCompensation({
      endpointId: "subcutis-fibrosis",
      deliveredFractionsBeforeGap: 20,
      remainingFractions: 10,
      plannedDosePerFractionGy: 1,
      postGapDosePerFractionGy: 1.1,
      alphaBetaSelection: manualAlpha,
    });

    expect(result.finalPhysicalDoseGy).toBeCloseTo(31, 12);
    expect(result.deltaBedGy).toBeGreaterThan(0);
    expect(result.deltaEqd2Gy).toBeGreaterThan(0);
  });

  it("provides an explicit proportional-scaling helper without assuming it automatically", () => {
    expect(
      proportionalOarDosePerFraction(1.2, 2, 2.5),
    ).toBeCloseTo(1.5, 12);
  });
});
