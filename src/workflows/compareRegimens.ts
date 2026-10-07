import type { FractionationSchedule } from "../core/lq.js";
import { eqdGy, totalDoseGy } from "../core/lq.js";
import type {
  EvidenceBasedParameterSelection,
  ManualParameterOverride,
} from "../domain/evidence.js";
import type {
  RegimenPresetProvenance,
} from "../domain/regimen.js";
import {
  calculateEvidenceLq,
  type EvidenceLqResult,
  type NumericEnvelope,
} from "./evidenceLq.js";

export interface NamedRegimen {
  id: string;
  label: string;
  schedule: FractionationSchedule;
  preset?: RegimenPresetProvenance;
}

export interface ComparisonEndpoint {
  endpointId: string;
  selection?: EvidenceBasedParameterSelection | ManualParameterOverride;
}

export interface RegimenComparisonCell {
  regimenId: string;
  regimenLabel: string;
  isReference: boolean;
  result: EvidenceLqResult;
  deltaPhysicalDoseGy: number;
  deltaBedGy: number;
  deltaEqd2Gy: number;
  /**
   * Correlated one-parameter sensitivity: the same alpha/beta CI boundary
   * is applied to the compared and reference schedule.
   */
  deltaEqd2Sensitivity?: NumericEnvelope;
}

export interface EndpointComparison {
  endpointId: string;
  cells: RegimenComparisonCell[];
}

export interface CompareRegimensResult {
  referenceRegimenId: string;
  regimens: NamedRegimen[];
  endpoints: EndpointComparison[];
}

function assertUniqueIds(values: string[], label: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} IDs must be unique.`);
  }
}

function eqd2AtAlphaBetaBoundary(
  schedule: FractionationSchedule,
  alphaBetaGy: number,
): number {
  if (alphaBetaGy > 0) {
    return eqdGy(schedule, alphaBetaGy);
  }

  // lim_(a/b -> 0+) D * (d + a/b) / (2 + a/b) = D*d/2.
  return totalDoseGy(schedule) * schedule.dosePerFractionGy / 2;
}

function orderedEnvelope(a: number, b: number): NumericEnvelope {
  return {
    low: Math.min(a, b),
    high: Math.max(a, b),
  };
}

export function compareRegimens(
  regimens: NamedRegimen[],
  endpoints: ComparisonEndpoint[],
  referenceRegimenId: string,
): CompareRegimensResult {
  if (regimens.length < 2) {
    throw new Error("Compare Regimens requires at least two regimens.");
  }
  if (endpoints.length < 1) {
    throw new Error("Compare Regimens requires at least one endpoint.");
  }

  assertUniqueIds(
    regimens.map((regimen) => regimen.id),
    "Regimen",
  );
  assertUniqueIds(
    endpoints.map((endpoint) => endpoint.endpointId),
    "Endpoint",
  );

  const referenceRegimen = regimens.find(
    (regimen) => regimen.id === referenceRegimenId,
  );
  if (!referenceRegimen) {
    throw new Error(
      `Reference regimen ${referenceRegimenId} was not found.`,
    );
  }

  const endpointResults: EndpointComparison[] = endpoints.map((endpoint) => {
    const calculated = new Map<string, EvidenceLqResult>();

    for (const regimen of regimens) {
      calculated.set(
        regimen.id,
        calculateEvidenceLq(
          endpoint.endpointId,
          regimen.schedule,
          endpoint.selection,
        ),
      );
    }

    const referenceResult = calculated.get(referenceRegimenId);
    if (!referenceResult) {
      throw new Error("Internal comparison error: missing reference result.");
    }

    const cells = regimens.map((regimen): RegimenComparisonCell => {
      const result = calculated.get(regimen.id);
      if (!result) {
        throw new Error(
          `Internal comparison error: missing result for ${regimen.id}.`,
        );
      }

      let deltaEqd2Sensitivity: NumericEnvelope | undefined;
      const ci = result.alphaBetaSensitivity?.alphaBetaCi95Gy;
      const referenceCi =
        referenceResult.alphaBetaSensitivity?.alphaBetaCi95Gy;

      if (
        ci &&
        referenceCi &&
        ci.low === referenceCi.low &&
        ci.high === referenceCi.high
      ) {
        const lowDelta =
          eqd2AtAlphaBetaBoundary(regimen.schedule, ci.low) -
          eqd2AtAlphaBetaBoundary(referenceRegimen.schedule, ci.low);
        const highDelta =
          eqd2AtAlphaBetaBoundary(regimen.schedule, ci.high) -
          eqd2AtAlphaBetaBoundary(referenceRegimen.schedule, ci.high);

        deltaEqd2Sensitivity = orderedEnvelope(lowDelta, highDelta);
      }

      return {
        regimenId: regimen.id,
        regimenLabel: regimen.label,
        isReference: regimen.id === referenceRegimenId,
        result,
        deltaPhysicalDoseGy:
          result.totalDoseGy - referenceResult.totalDoseGy,
        deltaBedGy: result.bedGy - referenceResult.bedGy,
        deltaEqd2Gy: result.eqd2Gy - referenceResult.eqd2Gy,
        ...(deltaEqd2Sensitivity ? { deltaEqd2Sensitivity } : {}),
      };
    });

    return {
      endpointId: endpoint.endpointId,
      cells,
    };
  });

  return {
    referenceRegimenId,
    regimens,
    endpoints: endpointResults,
  };
}
