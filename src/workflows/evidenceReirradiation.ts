import type {
  EvidenceBasedParameterSelection,
  ManualParameterOverride,
} from "../domain/evidence.js";
import type {
  ReirradiationCourse,
  ReirradiationEvaluationResult,
  ReirradiationScenarioContext,
  RemainingDoseBudgetResult,
} from "../domain/reirradiation.js";
import type { DoseMetric } from "../domain/constraints.js";
import {
  defaultAlphaBetaSelection,
  resolveAlphaBetaSelection,
} from "../evidence/alphaBetaRegistry.js";
import {
  evaluateReirradiationScenario,
  solveRemainingEqd2Budget,
} from "./reirradiation.js";

export type ReirradiationAlphaBetaSelection =
  | EvidenceBasedParameterSelection
  | ManualParameterOverride;

export interface EvidenceReirradiationResult
  extends ReirradiationEvaluationResult {
  endpointId: string;
  alphaBetaSelectionMode: "evidence" | "manual";
  alphaBetaRecordId?: string;
  alphaBetaSourceId?: string;
}

export interface EvidenceRemainingDoseBudgetResult
  extends RemainingDoseBudgetResult {
  endpointId: string;
  alphaBetaSelectionMode: "evidence" | "manual";
  alphaBetaRecordId?: string;
  alphaBetaSourceId?: string;
}

function resolveSelection(
  endpointId: string,
  selection: ReirradiationAlphaBetaSelection | undefined,
) {
  const selected =
    selection ?? defaultAlphaBetaSelection(endpointId);

  if (!selected) {
    throw new Error(
      `No default alpha/beta exists for ${endpointId}; select an evidence record or enter a manual value.`,
    );
  }

  return resolveAlphaBetaSelection(endpointId, selected);
}

export function evaluateEvidenceReirradiationScenario(
  endpointId: string,
  courses: ReirradiationCourse[],
  context: ReirradiationScenarioContext,
  selection?: ReirradiationAlphaBetaSelection,
): EvidenceReirradiationResult {
  const alpha = resolveSelection(endpointId, selection);
  const result = evaluateReirradiationScenario(
    courses,
    alpha.valueGy,
    context,
  );

  return {
    ...result,
    endpointId,
    alphaBetaSelectionMode: alpha.selectionMode,
    ...(alpha.parameterRecord
      ? { alphaBetaRecordId: alpha.parameterRecord.id }
      : {}),
    ...(alpha.source ? { alphaBetaSourceId: alpha.source.id } : {}),
    warnings: [...alpha.warnings, ...result.warnings],
  };
}

export function solveEvidenceRemainingEqd2Budget(
  endpointId: string,
  previousCourses: ReirradiationCourse[],
  metric: DoseMetric,
  cumulativeEqd2LimitGy: number,
  currentFractions: number,
  selection?: ReirradiationAlphaBetaSelection,
): EvidenceRemainingDoseBudgetResult {
  const alpha = resolveSelection(endpointId, selection);
  const result = solveRemainingEqd2Budget(
    previousCourses,
    metric,
    cumulativeEqd2LimitGy,
    currentFractions,
    alpha.valueGy,
  );

  return {
    ...result,
    endpointId,
    alphaBetaSelectionMode: alpha.selectionMode,
    ...(alpha.parameterRecord
      ? { alphaBetaRecordId: alpha.parameterRecord.id }
      : {}),
    ...(alpha.source ? { alphaBetaSourceId: alpha.source.id } : {}),
    warnings: [...alpha.warnings, ...result.warnings],
  };
}
