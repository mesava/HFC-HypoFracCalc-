import {
  bedGy,
  dosePerFractionForTargetEqdGy,
  eqdGy,
  totalDoseGy,
  type FractionationSchedule,
} from "../core/lq.js";

export interface CourseCorrectionInput {
  plannedSchedule: FractionationSchedule;
  deliveredFractions: number;
  deliveredDosePerFractionGy: number;
  remainingFractions: number;
  alphaBetaGy: number;
}

export interface CourseCorrectionResult {
  plannedEqd2Gy: number;
  plannedBedGy: number;
  deliveredEqd2Gy: number;
  deliveredBedGy: number;
  requiredRemainingEqd2Gy: number;
  requiredDosePerFractionGy: number;
  correctedFinalEqd2Gy: number;
  correctedFinalPhysicalDoseGy: number;
  deltaEqd2Gy: number;
  warnings: string[];
}

function positive(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be > 0.`);
  }
}

function nonNegativeInteger(value: number, name: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

export function solveCourseCorrection(
  input: CourseCorrectionInput,
): CourseCorrectionResult {
  positive(input.plannedSchedule.dosePerFractionGy, "planned dose per fraction");
  nonNegativeInteger(input.deliveredFractions, "delivered fractions");
  positive(input.deliveredDosePerFractionGy, "delivered dose per fraction");
  nonNegativeInteger(input.remainingFractions, "remaining fractions");
  positive(input.alphaBetaGy, "alpha/beta");

  if (!Number.isInteger(input.plannedSchedule.fractions) || input.plannedSchedule.fractions <= 0) {
    throw new RangeError("planned fractions must be a positive integer.");
  }
  if (input.remainingFractions <= 0) {
    throw new RangeError("At least one remaining fraction is required.");
  }

  const plannedEqd2Gy = eqdGy(input.plannedSchedule, input.alphaBetaGy);
  const plannedBedGy = bedGy(input.plannedSchedule, input.alphaBetaGy);

  const deliveredSchedule =
    input.deliveredFractions > 0
      ? {
          fractions: input.deliveredFractions,
          dosePerFractionGy: input.deliveredDosePerFractionGy,
        }
      : undefined;

  const deliveredEqd2Gy = deliveredSchedule
    ? eqdGy(deliveredSchedule, input.alphaBetaGy)
    : 0;
  const deliveredBedGy = deliveredSchedule
    ? bedGy(deliveredSchedule, input.alphaBetaGy)
    : 0;

  const requiredRemainingEqd2Gy = plannedEqd2Gy - deliveredEqd2Gy;
  if (requiredRemainingEqd2Gy <= 0) {
    throw new RangeError(
      "Delivered biological dose already equals or exceeds the planned EQD2 target.",
    );
  }

  const requiredDosePerFractionGy = dosePerFractionForTargetEqdGy(
    requiredRemainingEqd2Gy,
    input.remainingFractions,
    input.alphaBetaGy,
  );

  const remainingSchedule: FractionationSchedule = {
    fractions: input.remainingFractions,
    dosePerFractionGy: requiredDosePerFractionGy,
  };

  const correctedFinalEqd2Gy =
    deliveredEqd2Gy + eqdGy(remainingSchedule, input.alphaBetaGy);
  const correctedFinalPhysicalDoseGy =
    (deliveredSchedule ? totalDoseGy(deliveredSchedule) : 0) +
    totalDoseGy(remainingSchedule);

  const warnings = [
    "This workflow restores the selected LQ EQD2 target mathematically; it does not prove clinical equivalence or OAR safety.",
  ];

  if (requiredDosePerFractionGy > input.plannedSchedule.dosePerFractionGy) {
    warnings.push(
      "The corrected dose per fraction is higher than planned. Reassess normal-tissue dose metrics and clinical acceptability before use.",
    );
  }
  if (requiredDosePerFractionGy > 10) {
    warnings.push(
      "The solved dose per fraction exceeds 10 Gy; simple LQ extrapolation requires strong site-specific justification.",
    );
  }

  return {
    plannedEqd2Gy,
    plannedBedGy,
    deliveredEqd2Gy,
    deliveredBedGy,
    requiredRemainingEqd2Gy,
    requiredDosePerFractionGy,
    correctedFinalEqd2Gy,
    correctedFinalPhysicalDoseGy,
    deltaEqd2Gy: correctedFinalEqd2Gy - plannedEqd2Gy,
    warnings,
  };
}
