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

export interface PossiblyUnboundedEnvelope {
  low: number;
  /**
   * null means the upper bound is unbounded in the model.
   */
  high: number | null;
}

export interface AlphaBetaSensitivityEnvelope {
  alphaBetaCi95Gy: NumericEnvelope;
  bedGy: PossiblyUnboundedEnvelope;
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

function eqd2LimitAtAlphaBetaZero(
  schedule: FractionationSchedule,
): number {
  // lim_(a/b -> 0+) D * (d + a/b) / (2 + a/b) = D*d/2.
  return (
    totalDoseGy(schedule) *
    schedule.dosePerFractionGy /
    2
  );
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
    const bedAtHighAlphaBeta = bedGy(schedule, ci.high);
    const eqdAtHighAlphaBeta = eqdGy(schedule, ci.high);

    let bedEnvelope: PossiblyUnboundedEnvelope;
    let eqdEnvelope: NumericEnvelope;

    if (ci.low <= 0) {
      bedEnvelope = {
        low: bedAtHighAlphaBeta,
        high: null,
      };

      const eqdAtZeroLimit = eqd2LimitAtAlphaBetaZero(schedule);
      eqdEnvelope = orderedEnvelope(eqdAtZeroLimit, eqdAtHighAlphaBeta);

      warnings.push(
        "The reported alpha/beta confidence interval reaches or crosses 0 Gy. BED becomes unbounded as alpha/beta approaches 0, so the upper BED sensitivity bound is reported as unbounded. EQD2 uses the finite alpha/beta→0+ limit.",
      );
    } else {
      const bedAtLowAlphaBeta = bedGy(schedule, ci.low);
      const eqdAtLowAlphaBeta = eqdGy(schedule, ci.low);

      bedEnvelope = orderedEnvelope(
        bedAtLowAlphaBeta,
        bedAtHighAlphaBeta,
      );
      eqdEnvelope = orderedEnvelope(
        eqdAtLowAlphaBeta,
        eqdAtHighAlphaBeta,
      );
    }

    alphaBetaSensitivity = {
      alphaBetaCi95Gy: { low: ci.low, high: ci.high },
      bedGy: bedEnvelope,
      eqd2Gy: eqdEnvelope,
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
