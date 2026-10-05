import type {
  EvidenceBasedParameterSelection,
  ManualParameterOverride,
} from "../domain/evidence.js";
import type { FractionationSchedule } from "../core/lq.js";
import {
  dosePerFractionForTargetEqdGy,
  eqdGy,
  totalDoseGy,
} from "../core/lq.js";
import {
  activeRepopulationDays,
} from "../core/repopulation.js";
import {
  defaultAlphaBetaSelection,
  resolveAlphaBetaSelection,
} from "../evidence/alphaBetaRegistry.js";
import {
  defaultRepopulationSelection,
  resolveRepopulationSelection,
  type RepopulationSelection,
} from "../evidence/repopulationRegistry.js";

export interface TreatmentGapCourseInput {
  endpointId: string;
  plannedSchedule: FractionationSchedule;
  plannedOverallTreatmentDays: number;
  deliveredFractionsBeforeGap: number;
  gapDays: number;
  alphaBetaSelection?:
    | EvidenceBasedParameterSelection
    | ManualParameterOverride;
  repopulationSelection?: RepopulationSelection;
}

export interface TreatmentGapBaseline {
  endpointId: string;
  plannedSchedule: FractionationSchedule;
  plannedOverallTreatmentDays: number;
  deliveredFractionsBeforeGap: number;
  remainingFractions: number;
  gapDays: number;
  alphaBetaGy: number;
  alphaBetaSelectionMode: "evidence" | "manual";
  alphaBetaRecordId?: string;
  dProlifGyPerDay: number;
  kickOffDays: number;
  repopulationSelectionMode: "evidence" | "manual";
  repopulationRecordId?: string;
  plannedRawEqd2Gy: number;
  plannedTimePenaltyGy: number;
  plannedEffectiveEqd2Gy: number;
  deliveredRawEqd2Gy: number;
  uncompensatedOverallTreatmentDays: number;
  uncompensatedTimePenaltyGy: number;
  uncompensatedEffectiveEqd2Gy: number;
  uncompensatedDeltaEffectiveEqd2Gy: number;
  warnings: string[];
}

export interface PreserveTimeStrategyResult {
  kind: "preserve-time";
  method: "weekend" | "bid";
  actualOverallTreatmentDays: number;
  remainingFractions: number;
  remainingDosePerFractionGy: number;
  finalRawEqd2Gy: number;
  finalEffectiveEqd2Gy: number;
  deltaEffectiveEqd2Gy: number;
  warnings: string[];
}

export interface DoseCompensationStrategyInput {
  remainingFractionsToDeliver: number;
  actualOverallTreatmentDays: number;
}

export interface DoseCompensationStrategyResult {
  kind: "dose-compensation";
  actualOverallTreatmentDays: number;
  remainingFractionsToDeliver: number;
  requiredRemainingEqd2Gy: number;
  requiredDosePerFractionGy: number;
  finalPhysicalDoseGy: number;
  finalRawEqd2Gy: number;
  finalTimePenaltyGy: number;
  finalEffectiveEqd2Gy: number;
  deltaEffectiveEqd2Gy: number;
  warnings: string[];
}

function assertFinitePositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be > 0.`);
  }
}

function assertFiniteNonNegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be >= 0.`);
  }
}

function assertPositiveInteger(value: number, name: string): void {
  assertFinitePositive(value, name);
  if (!Number.isInteger(value)) {
    throw new RangeError(`${name} must be an integer.`);
  }
}

function timePenaltyEqd2Gy(
  overallTreatmentDays: number,
  rateGyPerDay: number,
  kickOffDays: number,
): number {
  return (
    activeRepopulationDays(overallTreatmentDays, kickOffDays) *
    rateGyPerDay
  );
}

export function buildTreatmentGapBaseline(
  input: TreatmentGapCourseInput,
): TreatmentGapBaseline {
  assertPositiveInteger(
    input.plannedSchedule.fractions,
    "planned fractions",
  );
  assertFinitePositive(
    input.plannedSchedule.dosePerFractionGy,
    "planned dose per fraction",
  );
  assertFinitePositive(
    input.plannedOverallTreatmentDays,
    "planned overall treatment days",
  );
  assertFiniteNonNegative(
    input.deliveredFractionsBeforeGap,
    "delivered fractions before gap",
  );
  if (!Number.isInteger(input.deliveredFractionsBeforeGap)) {
    throw new RangeError(
      "deliveredFractionsBeforeGap must be an integer.",
    );
  }
  assertFiniteNonNegative(input.gapDays, "gap days");

  if (
    input.deliveredFractionsBeforeGap >=
    input.plannedSchedule.fractions
  ) {
    throw new RangeError(
      "The gap must occur before the final planned fraction.",
    );
  }

  const alphaSelection =
    input.alphaBetaSelection ??
    defaultAlphaBetaSelection(input.endpointId);
  if (!alphaSelection) {
    throw new Error(
      `No default alpha/beta exists for ${input.endpointId}; select an evidence record or enter a manual value.`,
    );
  }

  const repopSelection =
    input.repopulationSelection ??
    defaultRepopulationSelection(input.endpointId);
  if (!repopSelection) {
    throw new Error(
      `No default Dprolif/Tk model exists for ${input.endpointId}; select an evidence record or enter a manual value.`,
    );
  }

  const alpha = resolveAlphaBetaSelection(
    input.endpointId,
    alphaSelection,
  );
  const repop = resolveRepopulationSelection(
    input.endpointId,
    repopSelection,
  );

  if (repop.kickOffDays === undefined) {
    throw new Error(
      "Treatment Gap requires an explicit Tk value for the selected time-loss model.",
    );
  }

  const remainingFractions =
    input.plannedSchedule.fractions -
    input.deliveredFractionsBeforeGap;

  const plannedRawEqd2Gy = eqdGy(
    input.plannedSchedule,
    alpha.valueGy,
  );
  const plannedTimePenaltyGy = timePenaltyEqd2Gy(
    input.plannedOverallTreatmentDays,
    repop.rateGyPerDay,
    repop.kickOffDays,
  );
  const plannedEffectiveEqd2Gy =
    plannedRawEqd2Gy - plannedTimePenaltyGy;

  const deliveredSchedule: FractionationSchedule = {
    fractions: Math.max(1, input.deliveredFractionsBeforeGap),
    dosePerFractionGy: input.plannedSchedule.dosePerFractionGy,
  };
  const deliveredRawEqd2Gy =
    input.deliveredFractionsBeforeGap === 0
      ? 0
      : eqdGy(deliveredSchedule, alpha.valueGy);

  const uncompensatedOverallTreatmentDays =
    input.plannedOverallTreatmentDays + input.gapDays;
  const uncompensatedTimePenaltyGy = timePenaltyEqd2Gy(
    uncompensatedOverallTreatmentDays,
    repop.rateGyPerDay,
    repop.kickOffDays,
  );

  // All originally prescribed fractions are eventually delivered unchanged.
  const uncompensatedEffectiveEqd2Gy =
    plannedRawEqd2Gy - uncompensatedTimePenaltyGy;

  const warnings = [
    ...alpha.warnings,
    ...repop.warnings,
  ];

  if (input.gapDays > 7) {
    warnings.push(
      "The interruption exceeds one week. Basic Clinical Radiobiology 2025 cautions that simple linear Dprolif correction is most defensible for relatively small overall-time differences and should not be extrapolated casually over multi-week changes.",
    );
  }

  return {
    endpointId: input.endpointId,
    plannedSchedule: input.plannedSchedule,
    plannedOverallTreatmentDays: input.plannedOverallTreatmentDays,
    deliveredFractionsBeforeGap: input.deliveredFractionsBeforeGap,
    remainingFractions,
    gapDays: input.gapDays,
    alphaBetaGy: alpha.valueGy,
    alphaBetaSelectionMode: alpha.selectionMode,
    ...(alpha.parameterRecord
      ? { alphaBetaRecordId: alpha.parameterRecord.id }
      : {}),
    dProlifGyPerDay: repop.rateGyPerDay,
    kickOffDays: repop.kickOffDays,
    repopulationSelectionMode: repop.selectionMode,
    ...(repop.parameterRecord
      ? { repopulationRecordId: repop.parameterRecord.id }
      : {}),
    plannedRawEqd2Gy,
    plannedTimePenaltyGy,
    plannedEffectiveEqd2Gy,
    deliveredRawEqd2Gy,
    uncompensatedOverallTreatmentDays,
    uncompensatedTimePenaltyGy,
    uncompensatedEffectiveEqd2Gy,
    uncompensatedDeltaEffectiveEqd2Gy:
      uncompensatedEffectiveEqd2Gy - plannedEffectiveEqd2Gy,
    warnings,
  };
}

export function evaluatePreserveTimeStrategy(
  baseline: TreatmentGapBaseline,
  method: "weekend" | "bid",
  options?: {
    bidInterfractionHours?: number;
  },
): PreserveTimeStrategyResult {
  const warnings: string[] = [];
  const d = baseline.plannedSchedule.dosePerFractionGy;

  if (method === "bid") {
    const interval = options?.bidInterfractionHours ?? 8;
    assertFinitePositive(interval, "BID interfraction interval");

    if (interval < 6) {
      throw new RangeError(
        "RCR guidance requires at least 6 hours between twice-daily fractions.",
      );
    }

    if (interval < 8) {
      warnings.push(
        "RCR allows a minimum 6-hour BID interval, while Basic Clinical Radiobiology 2025 recommends the maximum practical interval, at least about 8 hours and preferably longer when feasible.",
      );
    }

    if (d > 2.2) {
      warnings.push(
        "RCR does not recommend twice-daily compensation when fraction size is significantly greater than 2.2 Gy.",
      );
    }

    warnings.push(
      "This strategy preserves tumour EQD2 and overall treatment time only if all planned fractions can actually be delivered within the original finish date. Late-tissue incomplete repair must be assessed separately for relevant OAR endpoints.",
    );
  } else {
    warnings.push(
      "Weekend treatment preserves the planned fraction size and overall treatment time if operationally feasible; RCR identifies this as the preferred form of compensation before changing biological dose.",
    );
  }

  return {
    kind: "preserve-time",
    method,
    actualOverallTreatmentDays: baseline.plannedOverallTreatmentDays,
    remainingFractions: baseline.remainingFractions,
    remainingDosePerFractionGy:
      baseline.plannedSchedule.dosePerFractionGy,
    finalRawEqd2Gy: baseline.plannedRawEqd2Gy,
    finalEffectiveEqd2Gy: baseline.plannedEffectiveEqd2Gy,
    deltaEffectiveEqd2Gy: 0,
    warnings,
  };
}

export function solveDoseCompensationStrategy(
  baseline: TreatmentGapBaseline,
  input: DoseCompensationStrategyInput,
): DoseCompensationStrategyResult {
  assertPositiveInteger(
    input.remainingFractionsToDeliver,
    "remaining fractions to deliver",
  );
  assertFinitePositive(
    input.actualOverallTreatmentDays,
    "actual overall treatment days",
  );

  const finalTimePenaltyGy = timePenaltyEqd2Gy(
    input.actualOverallTreatmentDays,
    baseline.dProlifGyPerDay,
    baseline.kickOffDays,
  );

  // We want:
  // delivered EQD2 + remaining EQD2 - final time penalty
  // = planned raw EQD2 - planned time penalty.
  const requiredRemainingEqd2Gy =
    baseline.plannedEffectiveEqd2Gy +
    finalTimePenaltyGy -
    baseline.deliveredRawEqd2Gy;

  if (requiredRemainingEqd2Gy <= 0) {
    throw new RangeError(
      "The requested compensation geometry produces a non-positive remaining EQD2 target; review the inputs.",
    );
  }

  const requiredDosePerFractionGy =
    dosePerFractionForTargetEqdGy(
      requiredRemainingEqd2Gy,
      input.remainingFractionsToDeliver,
      baseline.alphaBetaGy,
    );

  const remainingSchedule: FractionationSchedule = {
    fractions: input.remainingFractionsToDeliver,
    dosePerFractionGy: requiredDosePerFractionGy,
  };

  const remainingRawEqd2Gy = eqdGy(
    remainingSchedule,
    baseline.alphaBetaGy,
  );
  const finalRawEqd2Gy =
    baseline.deliveredRawEqd2Gy + remainingRawEqd2Gy;
  const finalEffectiveEqd2Gy =
    finalRawEqd2Gy - finalTimePenaltyGy;

  const deliveredPhysicalDoseGy =
    baseline.deliveredFractionsBeforeGap *
    baseline.plannedSchedule.dosePerFractionGy;
  const finalPhysicalDoseGy =
    deliveredPhysicalDoseGy +
    totalDoseGy(remainingSchedule);

  const warnings: string[] = [
    "This strategy solves tumour EQD2 equivalence only. It does not prove normal-tissue safety or clinical acceptability.",
  ];

  if (
    requiredDosePerFractionGy >
    baseline.plannedSchedule.dosePerFractionGy
  ) {
    warnings.push(
      "The solved post-gap fraction size is higher than planned. RCR notes that preserving tumour effect by increasing fraction size can worsen the therapeutic index and increase late-normal-tissue effect.",
    );
  }

  if (requiredDosePerFractionGy > 10) {
    warnings.push(
      "The solved dose per fraction exceeds 10 Gy; simple LQ extrapolation is increasingly uncertain and site-specific high-dose evidence is required.",
    );
  }

  if (
    input.actualOverallTreatmentDays -
      baseline.plannedOverallTreatmentDays >
    7
  ) {
    warnings.push(
      "The overall-treatment-time extension exceeds one week; the simple linear Dprolif approximation becomes increasingly uncertain.",
    );
  }

  return {
    kind: "dose-compensation",
    actualOverallTreatmentDays: input.actualOverallTreatmentDays,
    remainingFractionsToDeliver:
      input.remainingFractionsToDeliver,
    requiredRemainingEqd2Gy,
    requiredDosePerFractionGy,
    finalPhysicalDoseGy,
    finalRawEqd2Gy,
    finalTimePenaltyGy,
    finalEffectiveEqd2Gy,
    deltaEffectiveEqd2Gy:
      finalEffectiveEqd2Gy - baseline.plannedEffectiveEqd2Gy,
    warnings,
  };
}
