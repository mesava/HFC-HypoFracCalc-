import {
  assertFiniteNumber,
  assertPositive,
  assertPositiveInteger,
} from "./validation.js";

export interface FractionationSchedule {
  fractions: number;
  dosePerFractionGy: number;
}

export interface LqApplicabilityAssessment {
  level: "supported-domain" | "caution" | "strong-caution";
  messages: string[];
}

function validateSchedule(schedule: FractionationSchedule): void {
  assertPositiveInteger(schedule.fractions, "fractions");
  assertPositive(schedule.dosePerFractionGy, "dosePerFractionGy");
}

export function totalDoseGy(schedule: FractionationSchedule): number {
  validateSchedule(schedule);
  return schedule.fractions * schedule.dosePerFractionGy;
}

export function bedGy(
  schedule: FractionationSchedule,
  alphaBetaGy: number,
): number {
  validateSchedule(schedule);
  assertPositive(alphaBetaGy, "alphaBetaGy");

  const d = schedule.dosePerFractionGy;
  return totalDoseGy(schedule) * (1 + d / alphaBetaGy);
}

export function eqdGy(
  schedule: FractionationSchedule,
  alphaBetaGy: number,
  referenceDosePerFractionGy = 2,
): number {
  validateSchedule(schedule);
  assertPositive(alphaBetaGy, "alphaBetaGy");
  assertPositive(referenceDosePerFractionGy, "referenceDosePerFractionGy");

  const d = schedule.dosePerFractionGy;
  return (
    totalDoseGy(schedule) *
    (d + alphaBetaGy) /
    (referenceDosePerFractionGy + alphaBetaGy)
  );
}

export function dosePerFractionForTargetEqdGy(
  targetEqdGy: number,
  fractions: number,
  alphaBetaGy: number,
  referenceDosePerFractionGy = 2,
): number {
  assertPositive(targetEqdGy, "targetEqdGy");
  assertPositiveInteger(fractions, "fractions");
  assertPositive(alphaBetaGy, "alphaBetaGy");
  assertPositive(referenceDosePerFractionGy, "referenceDosePerFractionGy");

  // target = n*d*(d + a/b)/(x + a/b)
  const discriminant =
    alphaBetaGy ** 2 +
    (4 * targetEqdGy * (referenceDosePerFractionGy + alphaBetaGy)) / fractions;

  return (-alphaBetaGy + Math.sqrt(discriminant)) / 2;
}

export function totalDoseForTargetEqdGy(
  targetEqdGy: number,
  dosePerFractionGy: number,
  alphaBetaGy: number,
  referenceDosePerFractionGy = 2,
): number {
  assertPositive(targetEqdGy, "targetEqdGy");
  assertPositive(dosePerFractionGy, "dosePerFractionGy");
  assertPositive(alphaBetaGy, "alphaBetaGy");
  assertPositive(referenceDosePerFractionGy, "referenceDosePerFractionGy");

  return (
    targetEqdGy *
    (referenceDosePerFractionGy + alphaBetaGy) /
    (dosePerFractionGy + alphaBetaGy)
  );
}

export function assessLqApplicability(
  dosePerFractionGy: number,
): LqApplicabilityAssessment {
  assertFiniteNumber(dosePerFractionGy, "dosePerFractionGy");
  assertPositive(dosePerFractionGy, "dosePerFractionGy");

  if (dosePerFractionGy < 1) {
    return {
      level: "caution",
      messages: [
        "Dose per fraction is below the approximate 1 Gy lower boundary of the range with strong clinical support for simple LQ extrapolation.",
      ],
    };
  }

  if (dosePerFractionGy > 15) {
    return {
      level: "strong-caution",
      messages: [
        "Dose per fraction exceeds 15 Gy; this is a strong extrapolation of the simple LQ model and must be interpreted cautiously.",
      ],
    };
  }

  if (dosePerFractionGy > 10) {
    return {
      level: "caution",
      messages: [
        "Dose per fraction exceeds the approximate 1–10 Gy range with strongest clinical support for the simple LQ model.",
      ],
    };
  }

  return {
    level: "supported-domain",
    messages: [],
  };
}
