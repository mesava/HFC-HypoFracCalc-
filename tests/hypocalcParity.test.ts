import { describe, expect, it } from "vitest";
import { solveCourseCorrection } from "../src/workflows/courseCorrection.js";
import {
  solveDosePerFractionForTargetEqd2,
  solveFractionCountForTargetEqd2,
} from "../src/workflows/targetEqdSolver.js";
import {
  buildEditableCalendar,
  summarizeEditableCalendar,
} from "../src/workflows/interactiveCalendar.js";

describe("Hypo-Calc parity examples", () => {
  it("reproduces the published isoeffective 30x2 -> 18 fraction examples", () => {
    expect(
      solveDosePerFractionForTargetEqd2(60, 18, 3),
    ).toBeCloseTo(2.85, 2);
    expect(
      solveDosePerFractionForTargetEqd2(60, 18, 10),
    ).toBeCloseTo(3.06, 2);
  });

  it("reproduces the published breast fraction-count examples at 2.67 Gy/fx", () => {
    expect(
      solveFractionCountForTargetEqd2(50, 2.67, 4.6).nearest.fractions,
    ).toBe(17);
    expect(
      solveFractionCountForTargetEqd2(50, 2.67, 8.8).nearest.fractions,
    ).toBe(18);
    expect(
      solveFractionCountForTargetEqd2(50, 2.67, 1.7).nearest.fractions,
    ).toBe(16);
  });

  it("reproduces the missed-fraction compensation example", () => {
    const result = solveCourseCorrection({
      plannedSchedule: { fractions: 5, dosePerFractionGy: 5 },
      deliveredFractions: 2,
      deliveredDosePerFractionGy: 5,
      remainingFractions: 2,
      alphaBetaGy: 10,
    });

    expect(result.requiredDosePerFractionGy).toBeCloseTo(6.73, 2);
    expect(result.deltaEqd2Gy).toBeCloseTo(0, 10);
  });

  it("reproduces the published dose-dispensing error correction example", () => {
    const result = solveCourseCorrection({
      plannedSchedule: { fractions: 33, dosePerFractionGy: 2 },
      deliveredFractions: 20,
      deliveredDosePerFractionGy: 1.8,
      remainingFractions: 13,
      alphaBetaGy: 10,
    });

    expect(result.plannedEqd2Gy).toBeCloseTo(66, 10);
    expect(result.deliveredEqd2Gy).toBeCloseTo(35.4, 10);
    expect(result.requiredRemainingEqd2Gy).toBeCloseTo(30.6, 10);
    expect(result.requiredDosePerFractionGy).toBeCloseTo(2.30, 2);
  });

  it("builds a visible weekday calendar and recalculates after free editing", () => {
    const calendar = buildEditableCalendar({
      startDate: "2026-10-05",
      plannedFractions: 5,
    });

    const initial = summarizeEditableCalendar(calendar, 5, 10);
    expect(initial.totalFractions).toBe(5);
    expect(initial.treatmentDays).toBe(5);

    const edited = calendar.map((day) =>
      day.date === "2026-10-07"
        ? { ...day, fractions: 0 as const }
        : day,
    );
    const changed = summarizeEditableCalendar(edited, 5, 10);
    expect(changed.totalFractions).toBe(4);
    expect(changed.eqd2Gy).toBeLessThan(initial.eqd2Gy);
  });
});
