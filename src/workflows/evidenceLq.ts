import type {
  EvidenceBasedParameterSelection,
  ManualParameterOverride,
} from "../domain/evidence.js";
import type { FractionationSchedule } from "../core/lq.js";
import {
  assessLqApplicability,
  bedGy,
  eqdGy,
  totalDoseGy,
} from "../core/lq.js";
import {
  defaultAlphaBetaSelection,
  resolveAlphaBetaSelection,
} from "../evidence/alphaBetaRegistry.js";

export interface NumericEnvelope {
  low: number;
  high: number;
}

export interface AlphaBetaSensitivityEnvelope {
  alphaBetaCi95Gy: NumericEnvelope;
  bedGy: NumericEnvelope;
  eqd2Gy: NumericEnvelope;
  interpretation:
    "One-parameter sensitivity envelope obtained by evaluating the calculation at the reported 95% confidence limits of alpha/beta; not a full multi-parameter uncertainty propagation.";
}

export interface EvidenceLqResult {
  endpointId: string;
  schedule: FractionationSchedule;
  totalDoseGy: number;
  alphaBetaGy: number;
  selectionMode: "evidence" | "manual";
  parameterRecordId?: string;
  sourceId?: string;
  bedGy: number;
  eqd2Gy: number;
  alphaBetaSensitivity?: AlphaBetaSensitivityEnvelope;
  warnings: string[];
}

function orderedEnvelope(a: number, b: number): NumericEnvelope {
  return {
    low: Math.min(a, b),
    high: Math.max(a, b),
  };
}

export function calculateEvidenceLq(
  endpointId: string,
  schedule: FractionationSchedule,
  selection?: EvidenceBasedParameterSelection | ManualParameterOverride,
): EvidenceLqResult {
  const effectiveSelection =
    selection ?? defaultAlphaBetaSelection(endpointId);

  if (!effectiveSelection) {
    throw new Error(
      `No default-eligible alpha/beta estimate exists for endpoint ${endpointId}. Select a reviewed evidence record explicitly or enter a manual value.`,
    );
  }

  const resolved = resolveAlphaBetaSelection(endpointId, effectiveSelection);
  const applicability = assessLqApplicability(schedule.dosePerFractionGy);
  const warnings = [...resolved.warnings, ...applicability.messages];

  let alphaBetaSensitivity: AlphaBetaSensitivityEnvelope | undefined;
  if (resolved.parameterRecord?.ci95) {
    const ci = resolved.parameterRecord.ci95;
    const bedAtLow = bedGy(schedule, ci.low);
    const bedAtHigh = bedGy(schedule, ci.high);
    const eqdAtLow = eqdGy(schedule, ci.low);
    const eqdAtHigh = eqdGy(schedule, ci.high);

    alphaBetaSensitivity = {
      alphaBetaCi95Gy: { low: ci.low, high: ci.high },
      bedGy: orderedEnvelope(bedAtLow, bedAtHigh),
      eqd2Gy: orderedEnvelope(eqdAtLow, eqdAtHigh),
      interpretation:
        "One-parameter sensitivity envelope obtained by evaluating the calculation at the reported 95% confidence limits of alpha/beta; not a full multi-parameter uncertainty propagation.",
    };
  }

  return {
    endpointId,
    schedule,
    totalDoseGy: totalDoseGy(schedule),
    alphaBetaGy: resolved.valueGy,
    selectionMode: resolved.selectionMode,
    ...(resolved.parameterRecord
      ? { parameterRecordId: resolved.parameterRecord.id }
      : {}),
    ...(resolved.source ? { sourceId: resolved.source.id } : {}),
    bedGy: bedGy(schedule, resolved.valueGy),
    eqd2Gy: eqdGy(schedule, resolved.valueGy),
    ...(alphaBetaSensitivity ? { alphaBetaSensitivity } : {}),
    warnings,
  };
}
