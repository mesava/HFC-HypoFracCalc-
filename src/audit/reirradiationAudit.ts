import {
  endpoints,
} from "../data/evidence/v0.1/index.js";
import type { ReirradiationAuditRecord } from "../domain/audit.js";
import type {
  ReirradiationCourse,
  ReirradiationScenarioContext,
} from "../domain/reirradiation.js";
import type { ReirradiationGuidanceAssessment } from "../domain/reirradiationGuidance.js";
import type {
  EvidenceReirradiationResult,
  EvidenceRemainingDoseBudgetResult,
} from "../workflows/evidenceReirradiation.js";
import {
  buildAuditBase,
  resolveAuditSources,
  serializeAuditRecord,
} from "./common.js";

const REIRRADIATION_METHOD_SOURCE_IDS = [
  "andratschke-2022-estro-eortc-reirradiation",
  "rcr-2024-principles-reirradiation",
  "appelt-2026-cumulative-dose-reirradiation",
  "paradis-2026-recog-consensus",
  "zhang-2026-recog-case-guide",
] as const;

export interface BuildReirradiationAuditInput {
  generatedAtIso: string;
  endpointId: string;
  courses: ReirradiationCourse[];
  context: ReirradiationScenarioContext;
  result: EvidenceReirradiationResult;
  confirmThecalSacDmax?: boolean;
  budget?: EvidenceRemainingDoseBudgetResult;
  guidance?: ReirradiationGuidanceAssessment;
}

function uniqueSourceIds(
  input: BuildReirradiationAuditInput,
): string[] {
  const ids = new Set<string>(
    REIRRADIATION_METHOD_SOURCE_IDS,
  );

  if (input.result.alphaBetaSourceId) {
    ids.add(input.result.alphaBetaSourceId);
  }
  if (input.guidance?.sourceId) {
    ids.add(input.guidance.sourceId);
  }

  return [...ids];
}

export function buildReirradiationAuditRecord(
  input: BuildReirradiationAuditInput,
): ReirradiationAuditRecord {
  const base = buildAuditBase(input.generatedAtIso);

  if (input.result.endpointId !== input.endpointId) {
    throw new Error(
      "Audit input endpoint does not match the calculation result endpoint.",
    );
  }

  const endpoint = endpoints.find(
    (candidate) => candidate.id === input.endpointId,
  );
  if (!endpoint) {
    throw new Error(
      `Unknown endpoint for audit: ${input.endpointId}`,
    );
  }

  const auditSources = resolveAuditSources(
    uniqueSourceIds(input),
  );

  return {
    ...base,
    module: "reirradiation",
    endpoint: {
      id: endpoint.id,
      organ: endpoint.organ,
      label: endpoint.endpoint,
    },
    alphaBeta: {
      valueGy: input.result.alphaBetaGy,
      selectionMode:
        input.result.alphaBetaSelectionMode,
      ...(input.result.alphaBetaRecordId
        ? { recordId: input.result.alphaBetaRecordId }
        : {}),
      ...(input.result.alphaBetaSourceId
        ? { sourceId: input.result.alphaBetaSourceId }
        : {}),
    },
    metric: input.result.metric,
    context: {
      geometricOverlap: input.context.geometricOverlap,
      cumulativeDoseToxicityConcern:
        input.context.cumulativeDoseToxicityConcern,
      previousDoseData: input.context.previousDoseData,
      registrationSuitability:
        input.context.registrationSuitability,
      strategy: input.context.strategy,
    },
    userConfirmations: {
      thecalSacDmaxMetric:
        input.confirmThecalSacDmax ?? false,
    },
    inputCourses: input.courses,
    result: {
      classification: input.result.classification,
      cumulativePhysicalDoseGy:
        input.result.cumulativePhysicalDoseGy,
      cumulativeBedGy: input.result.cumulativeBedGy,
      cumulativeEqd2Gy:
        input.result.cumulativeEqd2Gy,
      courses: input.result.courses,
      warnings: input.result.warnings,
    },
    ...(input.budget
      ? {
          budget: {
            cumulativeLimitGy:
              input.budget.cumulativeLimitGy,
            adjustedPriorEqd2Gy:
              input.budget.adjustedPriorEqd2Gy,
            remainingEqd2BudgetGy:
              input.budget.remainingEqd2BudgetGy,
            fractions: input.budget.fractions,
            maximumDosePerFractionGy:
              input.budget.maximumDosePerFractionGy,
            maximumTotalPhysicalDoseGy:
              input.budget.maximumTotalPhysicalDoseGy,
            limitAlreadyExceeded:
              input.budget.limitAlreadyExceeded,
            warnings: input.budget.warnings,
          },
        }
      : {}),
    ...(input.guidance
      ? { guidance: input.guidance }
      : {}),
    sources: auditSources,
    safetyStatement:
      "This audit record documents a clinical decision-support calculation. It is not a treatment prescription or an automatic statement of clinical safety.",
  };
}

export { serializeAuditRecord } from "./common.js";
