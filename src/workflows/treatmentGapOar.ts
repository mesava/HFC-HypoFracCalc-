import type {
  EvidenceBasedParameterSelection,
  ManualParameterOverride,
} from "../domain/evidence.js";
import type { DoseMetric } from "../domain/constraints.js";
import { thamesHm } from "../core/repair.js";
import {
  defaultAlphaBetaSelection,
  resolveAlphaBetaSelection,
} from "../evidence/alphaBetaRegistry.js";
import {
  defaultRepairHalfTimeSelection,
  resolveRepairHalfTimeSelection,
} from "../evidence/repairRegistry.js";
import type { CalendarFractionDay } from "./treatmentCalendar.js";

export interface OarEffectResult {
  endpointId: string;
  metric: DoseMetric;
  alphaBetaGy: number;
  alphaBetaSelectionMode: "evidence" | "manual";
  alphaBetaRecordId?: string;
  repairHalfTimeHours?: number;
  repairSelectionMode?: "evidence" | "manual";
  repairRecordId?: string;
  totalFractions: number;
  bidDays: number;
  physicalDoseGy: number;
  bedGy: number;
  eqd2Gy: number;
  warnings: string[];
}

export interface OarCalendarEffectInput {
  endpointId: string;
  metric: DoseMetric;
  calendar: CalendarFractionDay[];
  dosePerFractionGy: number;
  alphaBetaSelection?:
    | EvidenceBasedParameterSelection
    | ManualParameterOverride;
  repairHalfTimeSelection?:
    | EvidenceBasedParameterSelection
    | ManualParameterOverride;
  bidInterfractionHours?: number;
}

export interface OarCalendarComparisonResult {
  planned: OarEffectResult;
  strategy: OarEffectResult;
  deltaBedGy: number;
  deltaEqd2Gy: number;
  warnings: string[];
}

export interface OarDoseCompensationInput {
  endpointId: string;
  metric: DoseMetric;
  deliveredFractionsBeforeGap: number;
  remainingFractions: number;
  plannedDosePerFractionGy: number;
  postGapDosePerFractionGy: number;
  alphaBetaSelection?:
    | EvidenceBasedParameterSelection
    | ManualParameterOverride;
}

export interface OarDoseCompensationResult {
  endpointId: string;
  metric: DoseMetric;
  alphaBetaGy: number;
  plannedEqd2Gy: number;
  finalEqd2Gy: number;
  deltaEqd2Gy: number;
  plannedBedGy: number;
  finalBedGy: number;
  deltaBedGy: number;
  finalPhysicalDoseGy: number;
  warnings: string[];
}

function validateDoseMetric(metric: DoseMetric): void {
  if (metric.kind === "Vx") {
    throw new Error(
      "Vx is a volume metric and cannot be converted by this per-fraction OAR BED/EQD2 workflow. Use a dose-valued metric such as Dmax, D0.03cc, D1cc, D2cc, mean dose, or a custom dose metric.",
    );
  }

  if (
    metric.kind === "custom" &&
    (!metric.customLabel || metric.customLabel.trim() === "")
  ) {
    throw new Error(
      "A custom OAR dose metric requires a non-empty label.",
    );
  }
}

function assertPositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be > 0.`);
  }
}

function assertNonNegativeInteger(
  value: number,
  name: string,
): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(
      `${name} must be a non-negative integer.`,
    );
  }
}

function resolveAlpha(
  endpointId: string,
  selection:
    | EvidenceBasedParameterSelection
    | ManualParameterOverride
    | undefined,
) {
  const resolvedSelection =
    selection ?? defaultAlphaBetaSelection(endpointId);
  if (!resolvedSelection) {
    throw new Error(
      `No default alpha/beta exists for ${endpointId}; select an evidence record or enter a manual value.`,
    );
  }
  return resolveAlphaBetaSelection(
    endpointId,
    resolvedSelection,
  );
}

function bedForFractions(
  fractions: number,
  dosePerFractionGy: number,
  alphaBetaGy: number,
  hm = 0,
): number {
  if (fractions === 0) return 0;
  return (
    fractions *
    dosePerFractionGy *
    (1 +
      (dosePerFractionGy * (1 + hm)) /
        alphaBetaGy)
  );
}

function eqd2FromBed(
  bedGy: number,
  alphaBetaGy: number,
): number {
  return bedGy / (1 + 2 / alphaBetaGy);
}

export function proportionalOarDosePerFraction(
  plannedOarDosePerFractionGy: number,
  plannedTargetDosePerFractionGy: number,
  postGapTargetDosePerFractionGy: number,
): number {
  assertPositive(
    plannedOarDosePerFractionGy,
    "planned OAR dose per fraction",
  );
  assertPositive(
    plannedTargetDosePerFractionGy,
    "planned target dose per fraction",
  );
  assertPositive(
    postGapTargetDosePerFractionGy,
    "post-gap target dose per fraction",
  );

  return (
    plannedOarDosePerFractionGy *
    (postGapTargetDosePerFractionGy /
      plannedTargetDosePerFractionGy)
  );
}

export function evaluateOarCalendarEffect(
  input: OarCalendarEffectInput,
): OarEffectResult {
  validateDoseMetric(input.metric);
  assertPositive(
    input.dosePerFractionGy,
    "OAR dose per fraction",
  );
  if (input.calendar.length === 0) {
    throw new RangeError(
      "OAR calendar must contain at least one treatment day.",
    );
  }

  const alpha = resolveAlpha(
    input.endpointId,
    input.alphaBetaSelection,
  );

  const bidDays = input.calendar.filter(
    (day) => day.fractions === 2,
  ).length;

  let repair:
    | ReturnType<typeof resolveRepairHalfTimeSelection>
    | undefined;

  if (bidDays > 0) {
    const interval = input.bidInterfractionHours;
    if (
      interval === undefined ||
      !Number.isFinite(interval) ||
      interval <= 0
    ) {
      throw new RangeError(
        "A positive BID interfraction interval is required when the calendar contains twice-daily treatment.",
      );
    }

    const repairSelection =
      input.repairHalfTimeSelection ??
      defaultRepairHalfTimeSelection(input.endpointId);
    if (!repairSelection) {
      throw new Error(
        `No point repair half-time default exists for ${input.endpointId}; choose a point evidence estimate or enter a manual T1/2 before evaluating BID OAR effect.`,
      );
    }

    repair = resolveRepairHalfTimeSelection(
      input.endpointId,
      repairSelection,
    );
  }

  let bedGy = 0;
  let totalFractions = 0;

  for (const day of input.calendar) {
    if (day.fractions !== 1 && day.fractions !== 2) {
      throw new RangeError(
        "Treatment Gap OAR v0.1 supports one or two fractions per treatment day.",
      );
    }

    totalFractions += day.fractions;
    const hm =
      day.fractions === 2 && repair
        ? thamesHm(
            2,
            input.bidInterfractionHours!,
            repair.valueHours,
          )
        : 0;

    bedGy += bedForFractions(
      day.fractions,
      input.dosePerFractionGy,
      alpha.valueGy,
      hm,
    );
  }

  const warnings = [
    ...alpha.warnings,
    ...(repair?.warnings ?? []),
  ];

  if (bidDays > 0) {
    warnings.push(
      "Incomplete-repair correction assumes two equal OAR fractions on each BID day and complete repair before the next daily treatment group.",
    );
  }

  return {
    endpointId: input.endpointId,
    metric: input.metric,
    alphaBetaGy: alpha.valueGy,
    alphaBetaSelectionMode: alpha.selectionMode,
    ...(alpha.parameterRecord
      ? { alphaBetaRecordId: alpha.parameterRecord.id }
      : {}),
    ...(repair
      ? {
          repairHalfTimeHours: repair.valueHours,
          repairSelectionMode: repair.selectionMode,
        }
      : {}),
    ...(repair?.parameterRecord
      ? { repairRecordId: repair.parameterRecord.id }
      : {}),
    totalFractions,
    bidDays,
    physicalDoseGy:
      totalFractions * input.dosePerFractionGy,
    bedGy,
    eqd2Gy: eqd2FromBed(bedGy, alpha.valueGy),
    warnings,
  };
}

export function compareOarCalendarStrategy(
  plannedInput: Omit<OarCalendarEffectInput, "calendar"> & {
    plannedCalendar: CalendarFractionDay[];
    strategyCalendar: CalendarFractionDay[];
  },
): OarCalendarComparisonResult {
  const planned = evaluateOarCalendarEffect({
    endpointId: plannedInput.endpointId,
    metric: plannedInput.metric,
    calendar: plannedInput.plannedCalendar,
    dosePerFractionGy: plannedInput.dosePerFractionGy,
    ...(plannedInput.alphaBetaSelection
      ? { alphaBetaSelection: plannedInput.alphaBetaSelection }
      : {}),
  });

  const strategy = evaluateOarCalendarEffect({
    endpointId: plannedInput.endpointId,
    metric: plannedInput.metric,
    calendar: plannedInput.strategyCalendar,
    dosePerFractionGy: plannedInput.dosePerFractionGy,
    ...(plannedInput.alphaBetaSelection
      ? { alphaBetaSelection: plannedInput.alphaBetaSelection }
      : {}),
    ...(plannedInput.repairHalfTimeSelection
      ? {
          repairHalfTimeSelection:
            plannedInput.repairHalfTimeSelection,
        }
      : {}),
    ...(plannedInput.bidInterfractionHours !== undefined
      ? {
          bidInterfractionHours:
            plannedInput.bidInterfractionHours,
        }
      : {}),
  });

  return {
    planned,
    strategy,
    deltaBedGy: strategy.bedGy - planned.bedGy,
    deltaEqd2Gy: strategy.eqd2Gy - planned.eqd2Gy,
    warnings: strategy.warnings,
  };
}

export function evaluateOarDoseCompensation(
  input: OarDoseCompensationInput,
): OarDoseCompensationResult {
  validateDoseMetric(input.metric);
  assertNonNegativeInteger(
    input.deliveredFractionsBeforeGap,
    "delivered fractions before gap",
  );
  assertNonNegativeInteger(
    input.remainingFractions,
    "remaining fractions",
  );
  if (
    input.deliveredFractionsBeforeGap +
      input.remainingFractions <=
    0
  ) {
    throw new RangeError(
      "At least one OAR-associated treatment fraction is required.",
    );
  }
  assertPositive(
    input.plannedDosePerFractionGy,
    "planned OAR dose per fraction",
  );
  assertPositive(
    input.postGapDosePerFractionGy,
    "post-gap OAR dose per fraction",
  );

  const alpha = resolveAlpha(
    input.endpointId,
    input.alphaBetaSelection,
  );

  const totalFractions =
    input.deliveredFractionsBeforeGap +
    input.remainingFractions;

  const plannedBedGy = bedForFractions(
    totalFractions,
    input.plannedDosePerFractionGy,
    alpha.valueGy,
  );

  const deliveredBedGy = bedForFractions(
    input.deliveredFractionsBeforeGap,
    input.plannedDosePerFractionGy,
    alpha.valueGy,
  );
  const remainingBedGy = bedForFractions(
    input.remainingFractions,
    input.postGapDosePerFractionGy,
    alpha.valueGy,
  );
  const finalBedGy = deliveredBedGy + remainingBedGy;

  const warnings = [...alpha.warnings];
  warnings.push(
    "The OAR result is tied to the explicitly entered dose-per-fraction metric. It must not be interpreted as a whole-organ or DVH constraint unless that metric is clinically appropriate.",
  );

  return {
    endpointId: input.endpointId,
    metric: input.metric,
    alphaBetaGy: alpha.valueGy,
    plannedEqd2Gy: eqd2FromBed(
      plannedBedGy,
      alpha.valueGy,
    ),
    finalEqd2Gy: eqd2FromBed(
      finalBedGy,
      alpha.valueGy,
    ),
    deltaEqd2Gy:
      eqd2FromBed(finalBedGy, alpha.valueGy) -
      eqd2FromBed(plannedBedGy, alpha.valueGy),
    plannedBedGy,
    finalBedGy,
    deltaBedGy: finalBedGy - plannedBedGy,
    finalPhysicalDoseGy:
      input.deliveredFractionsBeforeGap *
        input.plannedDosePerFractionGy +
      input.remainingFractions *
        input.postGapDosePerFractionGy,
    warnings,
  };
}
