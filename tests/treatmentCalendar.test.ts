import { describe, expect, it } from "vitest";
import {
  addCalendarDays,
  buildTreatmentCalendarScenario,
  calendarDaySpan,
  isWeekend,
} from "../src/workflows/treatmentCalendar.js";

describe("treatment calendar", () => {
  it("matches the RCR 70 Gy/35 fractions/46 days convention for a seven-week weekday course", () => {
    const scenario = buildTreatmentCalendarScenario({
      startDate: "2026-10-05",
      fractions: 35,
      gapStartDate: "2026-11-16",
      gapEndDate: "2026-11-20",
    });

    expect(scenario.plannedEndDate).toBe("2026-11-20");
    expect(scenario.plannedOverallTreatmentDays).toBe(46);
    expect(scenario.missedPlannedFractions).toBe(5);
    expect(scenario.uncompensated.at(-1)?.date).toBe(
      "2026-11-27",
    );
    expect(scenario.uncompensatedOverallTreatmentDays).toBe(53);
  });

  it("builds a Monday-Friday 35-fraction course", () => {
    const scenario = buildTreatmentCalendarScenario({
      startDate: "2026-10-05",
      fractions: 35,
      gapStartDate: "2026-11-02",
      gapEndDate: "2026-11-06",
    });

    expect(scenario.plannedEndDate).toBe("2026-11-20");
    expect(scenario.plannedOverallTreatmentDays).toBe(46);
    expect(scenario.deliveredFractionsBeforeGap).toBe(20);
    expect(scenario.missedPlannedFractions).toBe(5);
    expect(scenario.remainingFractionsAfterGap).toBe(15);
  });

  it("derives the uncompensated OTT extension from real calendar dates", () => {
    const scenario = buildTreatmentCalendarScenario({
      startDate: "2026-10-05",
      fractions: 35,
      gapStartDate: "2026-11-02",
      gapEndDate: "2026-11-06",
    });

    expect(scenario.uncompensated.at(-1)?.date).toBe(
      "2026-11-27",
    );
    expect(scenario.uncompensatedOverallTreatmentDays).toBe(53);
  });

  it("uses weekend slots without pretending they always fully restore OTT", () => {
    const scenario = buildTreatmentCalendarScenario({
      startDate: "2026-10-05",
      fractions: 35,
      gapStartDate: "2026-11-02",
      gapEndDate: "2026-11-06",
    });

    expect(scenario.weekendRecoveredFractions).toBe(5);
    expect(scenario.weekendRecovery.at(-1)?.date).toBe(
      "2026-11-21",
    );
    expect(scenario.weekendOverallTreatmentDays).toBe(47);
  });

  it("uses only as many BID days as needed to restore the planned finish when possible", () => {
    const scenario = buildTreatmentCalendarScenario({
      startDate: "2026-10-05",
      fractions: 35,
      gapStartDate: "2026-11-02",
      gapEndDate: "2026-11-06",
    });

    expect(scenario.bidDays).toBe(5);
    expect(scenario.bidRecoveredFractions).toBe(5);
    expect(scenario.bidRecovery.at(-1)?.date).toBe(
      "2026-11-20",
    );
    expect(scenario.bidOverallTreatmentDays).toBe(46);
  });

  it("allows a shorter interruption to be recovered by weekends within the planned OTT", () => {
    const scenario = buildTreatmentCalendarScenario({
      startDate: "2026-10-05",
      fractions: 35,
      gapStartDate: "2026-11-02",
      gapEndDate: "2026-11-05",
    });

    expect(scenario.missedPlannedFractions).toBe(4);
    expect(scenario.weekendOverallTreatmentDays).toBe(46);
    expect(scenario.weekendRecovery.at(-1)?.date).toBe(
      "2026-11-20",
    );
  });

  it("rejects a calendar interval that contains no planned fraction", () => {
    expect(() =>
      buildTreatmentCalendarScenario({
        startDate: "2026-10-05",
        fractions: 10,
        gapStartDate: "2026-10-10",
        gapEndDate: "2026-10-11",
      }),
    ).toThrow(/does not contain any planned treatment fraction/);
  });

  it("respects explicitly excluded treatment dates", () => {
    const scenario = buildTreatmentCalendarScenario({
      startDate: "2026-10-05",
      fractions: 5,
      gapStartDate: "2026-10-07",
      gapEndDate: "2026-10-07",
      excludedDates: ["2026-10-06"],
    });

    expect(scenario.planned.map((day) => day.date)).toEqual([
      "2026-10-05",
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
      "2026-10-12",
    ]);
    expect(scenario.warnings).toHaveLength(1);
  });

  it("uses timezone-independent ISO date arithmetic", () => {
    expect(addCalendarDays("2026-10-31", 1)).toBe(
      "2026-11-01",
    );
    expect(calendarDaySpan("2026-10-31", "2026-11-02")).toBe(3);
    expect(isWeekend("2026-11-01")).toBe(true);
  });
});
