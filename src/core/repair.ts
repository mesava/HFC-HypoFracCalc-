import { assertPositive, assertPositiveInteger } from "./validation.js";
import type { FractionationSchedule } from "./lq.js";
import { totalDoseGy } from "./lq.js";

export function repairRatePerHour(repairHalfTimeHours: number): number {
  assertPositive(repairHalfTimeHours, "repairHalfTimeHours");
  return Math.log(2) / repairHalfTimeHours;
}

/**
 * Thames H_m factor for m equally spaced fractions.
 *
 * Assumption: repair is complete before the next daily group.
 */
export function thamesHm(
  fractionsPerDay: number,
  interfractionIntervalHours: number,
  repairHalfTimeHours: number,
): number {
  assertPositiveInteger(fractionsPerDay, "fractionsPerDay");
  assertPositive(interfractionIntervalHours, "interfractionIntervalHours");
  assertPositive(repairHalfTimeHours, "repairHalfTimeHours");

  if (fractionsPerDay === 1) {
    return 0;
  }

  const mu = repairRatePerHour(repairHalfTimeHours);
  const phi = Math.exp(-mu * interfractionIntervalHours);
  const denominator = 1 - phi;

  // Limit as interval -> 0: all fractions behave like an unresolved group.
  if (Math.abs(denominator) < 1e-12) {
    return fractionsPerDay - 1;
  }

  return (
    (2 / fractionsPerDay) *
    (phi / denominator) *
    (fractionsPerDay - (1 - phi ** fractionsPerDay) / denominator)
  );
}

export interface IncompleteRepairInput {
  schedule: FractionationSchedule;
  alphaBetaGy: number;
  fractionsPerDay: number;
  interfractionIntervalHours: number;
  repairHalfTimeHours: number;
  referenceDosePerFractionGy?: number;
}

/**
 * EQDx with an H_m incomplete-repair term:
 * EQDx = D * [alpha/beta + d*(1+H_m)] / [alpha/beta + x].
 */
export function eqdGyWithIncompleteRepair(
  input: IncompleteRepairInput,
): number {
  assertPositive(input.alphaBetaGy, "alphaBetaGy");

  const x = input.referenceDosePerFractionGy ?? 2;
  assertPositive(x, "referenceDosePerFractionGy");

  const hm = thamesHm(
    input.fractionsPerDay,
    input.interfractionIntervalHours,
    input.repairHalfTimeHours,
  );

  const d = input.schedule.dosePerFractionGy;
  return (
    totalDoseGy(input.schedule) *
    (input.alphaBetaGy + d * (1 + hm)) /
    (input.alphaBetaGy + x)
  );
}
