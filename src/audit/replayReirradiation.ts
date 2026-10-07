import type {
  ReirradiationAuditRecord,
} from "../domain/audit.js";
import type {
  EvidenceBasedParameterSelection,
  ManualParameterOverride,
} from "../domain/evidence.js";
import {
  buildReirradiationAuditRecord,
} from "./reirradiationAudit.js";
import {
  evaluateEvidenceReirradiationScenario,
  solveEvidenceRemainingEqd2Budget,
} from "../workflows/evidenceReirradiation.js";
import {
  assessHytecSpinalCordReirradiation,
} from "../workflows/reirradiationGuidance.js";

const THECAL_SAC_CONFIRMATION_REASON =
  "The user must explicitly confirm that the entered Dmax represents the thecal-sac maximum dose.";

function alphaSelection(
  record: ReirradiationAuditRecord,
):
  | EvidenceBasedParameterSelection
  | ManualParameterOverride {
  if (
    record.alphaBeta.selectionMode ===
    "evidence"
  ) {
    if (!record.alphaBeta.recordId) {
      throw new Error(
        "Evidence-based reirradiation audit is missing alpha/beta recordId.",
      );
    }

    return {
      selectionMode: "evidence",
      parameterRecordId:
        record.alphaBeta.recordId,
    };
  }

  return {
    selectionMode: "manual",
    parameter: "alpha-beta",
    value: record.alphaBeta.valueGy,
    unit: "Gy",
    rationale:
      "Replay of imported reirradiation audit",
  };
}

function inferThecalSacConfirmation(
  record: ReirradiationAuditRecord,
): boolean {
  if (!record.guidance) return false;

  return !record.guidance.applicabilityReasons.includes(
    THECAL_SAC_CONFIRMATION_REASON,
  );
}

export function rebuildReirradiationAudit(
  saved: ReirradiationAuditRecord,
): ReirradiationAuditRecord {
  const selection = alphaSelection(saved);

  const result =
    evaluateEvidenceReirradiationScenario(
      saved.endpoint.id,
      saved.inputCourses,
      saved.context,
      selection,
    );

  const previousCourses =
    saved.inputCourses.filter(
      (course) => course.role === "previous",
    );

  const budget = saved.budget
    ? solveEvidenceRemainingEqd2Budget(
        saved.endpoint.id,
        previousCourses,
        saved.metric,
        saved.budget.cumulativeLimitGy,
        saved.budget.fractions,
        selection,
      )
    : undefined;

  const guidance = saved.guidance
    ? assessHytecSpinalCordReirradiation(
        saved.inputCourses,
        inferThecalSacConfirmation(saved),
      )
    : undefined;

  return buildReirradiationAuditRecord({
    generatedAtIso: saved.generatedAtIso,
    endpointId: saved.endpoint.id,
    courses: saved.inputCourses,
    context: saved.context,
    result,
    ...(budget ? { budget } : {}),
    ...(guidance ? { guidance } : {}),
  });
}

export function reirradiationReplayComparable(
  audit: ReirradiationAuditRecord,
): unknown {
  return {
    endpoint: audit.endpoint,
    alphaBeta: audit.alphaBeta,
    metric: audit.metric,
    context: audit.context,
    inputCourses: audit.inputCourses,
    result: audit.result,
    budget: audit.budget,
    guidance: audit.guidance,
    sources: audit.sources,
  };
}
