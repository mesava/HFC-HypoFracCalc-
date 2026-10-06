import { describe, expect, it } from "vitest";
import {
  buildTreatmentGapBaseline,
  evaluatePreserveTimeStrategy,
  solveDoseCompensationStrategy,
} from "../src/workflows/treatmentGap.js";

describe("Treatment Gap workflow", () => {
  it("calculates uncompensated HNSCC time loss with preferred Dprolif/Tk", () => {
    const baseline = buildTreatmentGapBaseline({
      endpointId: "head-neck-tumour-control",
      plannedSchedule: {
        fractions: 35,
        dosePerFractionGy: 2,
      },
      plannedOverallTreatmentDays: 46,
      deliveredFractionsBeforeGap: 20,
      gapDays: 7,
    });

    expect(baseline.alphaBetaGy).toBe(10.5);
    expect(baseline.dProlifGyPerDay).toBe(0.8);
    expect(baseline.kickOffDays).toBe(21);
    expect(baseline.remainingFractions).toBe(15);
    expect(baseline.uncompensatedDeltaEffectiveEqd2Gy).toBeCloseTo(
      -5.6,
      10,
    );
  });

  it("reproduces the BCR one-week time difference with manual 0.7 Gy/day", () => {
    const baseline = buildTreatmentGapBaseline({
      endpointId: "head-neck-tumour-control",
      plannedSchedule: {
        fractions: 35,
        dosePerFractionGy: 2,
      },
      plannedOverallTreatmentDays: 40,
      deliveredFractionsBeforeGap: 20,
      gapDays: 7,
      repopulationSelection: {
        selectionMode: "manual",
        rateGyPerDay: 0.7,
        kickOffDays: 21,
        rationale: "BCR worked-example sensitivity",
      },
    });

    expect(baseline.uncompensatedDeltaEffectiveEqd2Gy).toBeCloseTo(
      -4.9,
      10,
    );
  });

  it("weekend compensation preserves planned tumour effective EQD2", () => {
    const baseline = buildTreatmentGapBaseline({
      endpointId: "head-neck-tumour-control",
      plannedSchedule: {
        fractions: 35,
        dosePerFractionGy: 2,
      },
      plannedOverallTreatmentDays: 46,
      deliveredFractionsBeforeGap: 20,
      gapDays: 5,
    });

    const strategy = evaluatePreserveTimeStrategy(
      baseline,
      "weekend",
    );

    expect(strategy.actualOverallTreatmentDays).toBe(46);
    expect(strategy.deltaEffectiveEqd2Gy).toBeCloseTo(0, 12);
    expect(strategy.remainingDosePerFractionGy).toBe(2);
  });

  it("rejects BID intervals shorter than the RCR 6-hour minimum", () => {
    const baseline = buildTreatmentGapBaseline({
      endpointId: "head-neck-tumour-control",
      plannedSchedule: {
        fractions: 35,
        dosePerFractionGy: 2,
      },
      plannedOverallTreatmentDays: 46,
      deliveredFractionsBeforeGap: 20,
      gapDays: 3,
    });

    expect(() =>
      evaluatePreserveTimeStrategy(baseline, "bid", {
        bidInterfractionHours: 5.5,
      }),
    ).toThrow(/at least 6 hours/);
  });

  it("warns when BID interval is 6-8 hours", () => {
    const baseline = buildTreatmentGapBaseline({
      endpointId: "head-neck-tumour-control",
      plannedSchedule: {
        fractions: 35,
        dosePerFractionGy: 2,
      },
      plannedOverallTreatmentDays: 46,
      deliveredFractionsBeforeGap: 20,
      gapDays: 3,
    });

    const strategy = evaluatePreserveTimeStrategy(
      baseline,
      "bid",
      { bidInterfractionHours: 6 },
    );

    expect(strategy.warnings.join(" ")).toMatch(/at least about 8 hours/);
  });

  it("warns against BID when planned fraction size is above 2.2 Gy", () => {
    const baseline = buildTreatmentGapBaseline({
      endpointId: "head-neck-tumour-control",
      plannedSchedule: {
        fractions: 20,
        dosePerFractionGy: 3,
      },
      plannedOverallTreatmentDays: 28,
      deliveredFractionsBeforeGap: 10,
      gapDays: 2,
    });

    const strategy = evaluatePreserveTimeStrategy(
      baseline,
      "bid",
      { bidInterfractionHours: 8 },
    );

    expect(strategy.warnings.join(" ")).toMatch(/greater than 2.2 Gy/);
  });

  it("solves a modified remaining fraction size to restore tumour effective EQD2", () => {
    const baseline = buildTreatmentGapBaseline({
      endpointId: "head-neck-tumour-control",
      plannedSchedule: {
        fractions: 35,
        dosePerFractionGy: 2,
      },
      plannedOverallTreatmentDays: 46,
      deliveredFractionsBeforeGap: 25,
      gapDays: 5,
    });

    const strategy = solveDoseCompensationStrategy(baseline, {
      remainingFractionsToDeliver: 10,
      actualOverallTreatmentDays: 51,
    });

    expect(strategy.requiredDosePerFractionGy).toBeGreaterThan(2);
    expect(strategy.finalEffectiveEqd2Gy).toBeCloseTo(
      baseline.plannedEffectiveEqd2Gy,
      10,
    );
    expect(strategy.deltaEffectiveEqd2Gy).toBeCloseTo(0, 10);
  });

  it("requires explicit Dprolif/Tk when no preferred time model exists", () => {
    expect(() =>
      buildTreatmentGapBaseline({
        endpointId: "prostate-biochemical-control",
        plannedSchedule: {
          fractions: 20,
          dosePerFractionGy: 3,
        },
        plannedOverallTreatmentDays: 28,
        deliveredFractionsBeforeGap: 10,
        gapDays: 3,
      }),
    ).toThrow(/No default Dprolif\/Tk model/);
  });
});
