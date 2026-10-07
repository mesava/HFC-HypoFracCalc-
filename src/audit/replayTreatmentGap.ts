import type {
  TreatmentGapAuditRecord,
} from "./treatmentGapAudit.js";
import {
  buildTreatmentGapAuditRecord,
} from "./treatmentGapAudit.js";
import {
  buildTreatmentGapOarAuditEntry,
  type TreatmentGapOarAuditEntry,
} from "./treatmentGapOarAudit.js";
import {
  buildTreatmentGapBaseline,
  evaluatePreserveTimeStrategy,
  solveDoseCompensationStrategy,
} from "../workflows/treatmentGap.js";
import {
  buildTreatmentCalendarScenario,
  type TreatmentCalendarScenario,
} from "../workflows/treatmentCalendar.js";
import {
  compareOarCalendarStrategy,
  evaluateOarDoseCompensation,
  proportionalOarDosePerFraction,
} from "../workflows/treatmentGapOar.js";

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Replay calculation failed.";
}

function rebuildOarEntry(
  saved: TreatmentGapOarAuditEntry,
  calendarScenario: TreatmentCalendarScenario | undefined,
  plannedTargetDosePerFractionGy: number,
  deliveredFractionsBeforeGap: number,
  doseCompensation:
    | ReturnType<typeof solveDoseCompensationStrategy>
    | { error: string },
): TreatmentGapOarAuditEntry {
  let calculation:
    | {
        weekend?: ReturnType<typeof compareOarCalendarStrategy>;
        bid?:
          | ReturnType<typeof compareOarCalendarStrategy>
          | { error: string };
        doseCompensationOar?: ReturnType<
          typeof evaluateOarDoseCompensation
        >;
        postGapOarD?: number;
      }
    | { error: string };

  try {
    const plannedOarD = Number(
      saved.inputState.plannedOarDosePerFraction,
    );

    let weekend;
    let bid;

    if (calendarScenario) {
      weekend = compareOarCalendarStrategy({
        endpointId: saved.endpoint.id,
        metric: saved.metric,
        plannedCalendar: calendarScenario.planned,
        strategyCalendar:
          calendarScenario.weekendRecovery,
        dosePerFractionGy: plannedOarD,
        alphaBetaSelection: saved.alphaSelection,
      });

      try {
        bid = compareOarCalendarStrategy({
          endpointId: saved.endpoint.id,
          metric: saved.metric,
          plannedCalendar: calendarScenario.planned,
          strategyCalendar: calendarScenario.bidRecovery,
          dosePerFractionGy: plannedOarD,
          alphaBetaSelection: saved.alphaSelection,
          repairHalfTimeSelection:
            saved.repairSelection,
          bidInterfractionHours:
            saved.inputState.bidInterfractionHours,
        });
      } catch (error) {
        bid = { error: errorMessage(error) };
      }
    }

    let doseCompensationOar;
    let postGapOarD;

    if (!("error" in doseCompensation)) {
      postGapOarD =
        saved.inputState.postGapDoseMode ===
        "proportional"
          ? proportionalOarDosePerFraction(
              plannedOarD,
              plannedTargetDosePerFractionGy,
              doseCompensation.requiredDosePerFractionGy,
            )
          : Number(
              saved.inputState.manualPostGapOarDose,
            );

      doseCompensationOar =
        evaluateOarDoseCompensation({
          endpointId: saved.endpoint.id,
          metric: saved.metric,
          deliveredFractionsBeforeGap,
          remainingFractions:
            doseCompensation.remainingFractionsToDeliver,
          plannedDosePerFractionGy: plannedOarD,
          postGapDosePerFractionGy: postGapOarD,
          alphaBetaSelection: saved.alphaSelection,
        });
    }

    calculation = {
      ...(weekend ? { weekend } : {}),
      ...(bid ? { bid } : {}),
      ...(doseCompensationOar
        ? { doseCompensationOar }
        : {}),
      ...(postGapOarD !== undefined
        ? { postGapOarD }
        : {}),
    };
  } catch (error) {
    calculation = {
      error: errorMessage(error),
    };
  }

  return buildTreatmentGapOarAuditEntry({
    cardId: saved.cardId,
    endpointId: saved.endpoint.id,
    metric: saved.metric,
    inputState: saved.inputState,
    alphaSelection: saved.alphaSelection,
    repairSelection: saved.repairSelection,
    calculation,
  });
}

export function rebuildTreatmentGapAudit(
  saved: TreatmentGapAuditRecord,
): TreatmentGapAuditRecord {
  const calendarScenario =
    saved.inputs.courseInputMode === "calendar"
      ? buildTreatmentCalendarScenario(
          saved.inputs.calendarInput!,
        )
      : undefined;

  const manual =
    saved.inputs.courseInputMode === "manual"
      ? saved.inputs.manualDurationInput!
      : undefined;

  const plannedOverallTreatmentDays =
    calendarScenario?.plannedOverallTreatmentDays ??
    manual!.plannedOverallTreatmentDays;
  const deliveredFractionsBeforeGap =
    calendarScenario?.deliveredFractionsBeforeGap ??
    manual!.deliveredFractionsBeforeGap;
  const gapDays =
    calendarScenario?.gapCalendarDays ??
    manual!.gapDays;

  const baseline = buildTreatmentGapBaseline({
    endpointId: saved.endpoint.id,
    plannedSchedule: saved.baseline.plannedSchedule,
    plannedOverallTreatmentDays,
    deliveredFractionsBeforeGap,
    gapDays,
    ...(calendarScenario
      ? {
          uncompensatedOverallTreatmentDays:
            calendarScenario.uncompensatedOverallTreatmentDays,
        }
      : {}),
    alphaBetaSelection:
      saved.inputs.alphaSelection,
    repopulationSelection:
      saved.inputs.repopulationSelection,
  });

  const weekend = evaluatePreserveTimeStrategy(
    baseline,
    "weekend",
    calendarScenario
      ? {
          actualOverallTreatmentDays:
            calendarScenario.weekendOverallTreatmentDays,
        }
      : undefined,
  );

  let bid:
    | ReturnType<typeof evaluatePreserveTimeStrategy>
    | { error: string };
  try {
    bid = evaluatePreserveTimeStrategy(
      baseline,
      "bid",
      {
        bidInterfractionHours:
          saved.inputs.bidInterfractionHours,
        ...(calendarScenario
          ? {
              actualOverallTreatmentDays:
                calendarScenario.bidOverallTreatmentDays,
            }
          : {}),
      },
    );
  } catch (error) {
    bid = { error: errorMessage(error) };
  }

  let doseCompensation:
    | ReturnType<typeof solveDoseCompensationStrategy>
    | { error: string };
  try {
    doseCompensation =
      solveDoseCompensationStrategy(
        baseline,
        saved.inputs.doseCompensationInput,
      );
  } catch (error) {
    doseCompensation = {
      error: errorMessage(error),
    };
  }

  const oars = saved.oars.map((oar) =>
    rebuildOarEntry(
      oar,
      calendarScenario,
      baseline.plannedSchedule.dosePerFractionGy,
      baseline.deliveredFractionsBeforeGap,
      doseCompensation,
    ),
  );

  return buildTreatmentGapAuditRecord({
    generatedAtIso: saved.generatedAtIso,
    endpointId: saved.endpoint.id,
    courseInputMode: saved.inputs.courseInputMode,
    alphaSelection:
      saved.inputs.alphaSelection,
    repopulationSelection:
      saved.inputs.repopulationSelection,
    baseline,
    weekend,
    bid,
    doseCompensation,
    bidInterfractionHours:
      saved.inputs.bidInterfractionHours,
    doseCompensationInput:
      saved.inputs.doseCompensationInput,
    ...(saved.inputs.calendarInput &&
    calendarScenario
      ? {
          calendarInput:
            saved.inputs.calendarInput,
          calendarScenario,
        }
      : {}),
    ...(saved.inputs.manualDurationInput
      ? {
          manualDurationInput:
            saved.inputs.manualDurationInput,
        }
      : {}),
    oars,
  });
}

function normalizeErrorResult(
  value: unknown,
): unknown {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value
  ) {
    return { error: true };
  }
  return value;
}

function normalizeOar(
  entry: TreatmentGapOarAuditEntry,
): unknown {
  if (entry.status === "input-error") {
    const { error: _error, ...rest } = entry;
    return {
      ...rest,
      errorPresent: true,
    };
  }

  return {
    ...entry,
    results: {
      ...entry.results,
      ...(entry.results.bid
        ? {
            bid: normalizeErrorResult(
              entry.results.bid,
            ),
          }
        : {}),
    },
  };
}

export function treatmentGapReplayComparable(
  audit: TreatmentGapAuditRecord,
): unknown {
  return {
    endpoint: audit.endpoint,
    inputs: audit.inputs,
    baseline: audit.baseline,
    calendarScenario: audit.calendarScenario,
    strategies: {
      weekend: audit.strategies.weekend,
      bid: normalizeErrorResult(
        audit.strategies.bid,
      ),
      doseCompensation: normalizeErrorResult(
        audit.strategies.doseCompensation,
      ),
    },
    oars: audit.oars.map(normalizeOar),
    sources: audit.sources,
  };
}
