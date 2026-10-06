import {
  endpoints,
} from "../data/evidence/v0.1/index.js";
import type { SourceReference } from "../domain/evidence.js";
import type { EvidenceLqResult } from "../workflows/evidenceLq.js";
import {
  buildAuditBase,
  resolveAuditSources,
  type AuditAlphaBetaParameter,
  type AuditEndpointIdentity,
} from "./common.js";

export interface QuickEqdAuditRecord {
  schemaVersion: string;
  module: "quick-eqd";
  engineVersion: string;
  generatedAtIso: string;
  evidence: {
    datasetVersion: string;
    evidenceCutoffDate: string;
    releaseStatus: string;
  };
  endpoint: AuditEndpointIdentity;
  alphaBeta: AuditAlphaBetaParameter;
  input: {
    fractions: number;
    dosePerFractionGy: number;
  };
  result: {
    totalDoseGy: number;
    bedGy: number;
    eqd2Gy: number;
    alphaBetaSensitivity?: EvidenceLqResult["alphaBetaSensitivity"];
    warnings: string[];
  };
  sources: SourceReference[];
  safetyStatement: string;
}

export function buildQuickEqdAuditRecord(
  generatedAtIso: string,
  result: EvidenceLqResult,
): QuickEqdAuditRecord {
  const base = buildAuditBase(generatedAtIso);
  const endpoint = endpoints.find(
    (candidate) => candidate.id === result.endpointId,
  );
  if (!endpoint) {
    throw new Error(
      `Unknown endpoint for audit: ${result.endpointId}`,
    );
  }

  return {
    ...base,
    module: "quick-eqd",
    endpoint: {
      id: endpoint.id,
      organ: endpoint.organ,
      label: endpoint.endpoint,
    },
    alphaBeta: {
      valueGy: result.alphaBetaGy,
      selectionMode: result.selectionMode,
      ...(result.parameterRecordId
        ? { recordId: result.parameterRecordId }
        : {}),
      ...(result.sourceId
        ? { sourceId: result.sourceId }
        : {}),
    },
    input: {
      fractions: result.schedule.fractions,
      dosePerFractionGy:
        result.schedule.dosePerFractionGy,
    },
    result: {
      totalDoseGy: result.totalDoseGy,
      bedGy: result.bedGy,
      eqd2Gy: result.eqd2Gy,
      ...(result.alphaBetaSensitivity
        ? {
            alphaBetaSensitivity:
              result.alphaBetaSensitivity,
          }
        : {}),
      warnings: result.warnings,
    },
    sources: resolveAuditSources([result.sourceId]),
    safetyStatement:
      "This audit record documents a radiobiological equivalence calculation. It does not establish clinical interchangeability or constitute a treatment prescription.",
  };
}
