import {
  dosePerFractionForTargetEqdGy,
  eqdGy,
  type FractionationSchedule,
} from "../core/lq.js";

export interface FractionCountCandidate {
  fractions: number;
  totalDoseGy: number;
  achievedEqd2Gy: number;
  deltaEqd2Gy: number;
}

export interface FractionCountSolution {
  exactFractions: number;
  lower: FractionCountCandidate;
  upper: FractionCountCandidate;
  nearest: FractionCountCandidate;
}

function positive(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be > 0.`);
  }
}

function candidate(
  fractions: number,
  dosePerFractionGy: number,
  alphaBetaGy: number,
  targetEqd2Gy: number,
): FractionCountCandidate {
  const safeFractions = Math.max(1, fractions);
  const schedule: FractionationSchedule = {
    fractions: safeFractions,
    dosePerFractionGy,
  };
  const achievedEqd2Gy = eqdGy(schedule, alphaBetaGy);
  return {
    fractions: safeFractions,
    totalDoseGy: safeFractions * dosePerFractionGy,
    achievedEqd2Gy,
    deltaEqd2Gy: achievedEqd2Gy - targetEqd2Gy,
  };
}

export function solveFractionCountForTargetEqd2(
  targetEqd2Gy: number,
  dosePerFractionGy: number,
  alphaBetaGy: number,
): FractionCountSolution {
  positive(targetEqd2Gy, "target EQD2");
  positive(dosePerFractionGy, "dose per fraction");
  positive(alphaBetaGy, "alpha/beta");

  const exactFractions =
    (targetEqd2Gy * (2 + alphaBetaGy)) /
    (dosePerFractionGy * (dosePerFractionGy + alphaBetaGy));

  const lower = candidate(
    Math.floor(exactFractions),
    dosePerFractionGy,
    alphaBetaGy,
    targetEqd2Gy,
  );
  const upper = candidate(
    Math.ceil(exactFractions),
    dosePerFractionGy,
    alphaBetaGy,
    targetEqd2Gy,
  );
  const nearest =
    Math.abs(lower.deltaEqd2Gy) <= Math.abs(upper.deltaEqd2Gy)
      ? lower
      : upper;

  return { exactFractions, lower, upper, nearest };
}

export function solveDosePerFractionForTargetEqd2(
  targetEqd2Gy: number,
  fractions: number,
  alphaBetaGy: number,
): number {
  return dosePerFractionForTargetEqdGy(
    targetEqd2Gy,
    fractions,
    alphaBetaGy,
  );
}
