import {
  endpoints,
} from "../data/evidence/v0.1/index.js";
import type { SourceReference } from "../domain/evidence.js";
import type {
  CompareRegimensResult,
  EndpointComparison,
} from "../workflows/compareRegimens.js";
import {
  buildAuditBase,
  resolveAuditSources,
  type AuditAlphaBetaParameter,
  type AuditEndpointIdentity,
} from "./common.js";

export interface CompareAuditEndpoint {
  endpoint: AuditEndpointIdentity;
  alphaBeta: AuditAlphaBetaParameter;
  comparison: EndpointComparison;
}

export interface CompareRegimensAuditRecord {
  schemaVersion: string;
  module: "compare-regimens";
  engineVersion: string;
  generatedAtIso: string;
  evidence: {
    datasetVersion: string;
    evidenceCutoffDate: string;
    releaseStatus: string;
  };
  referenceRegimenId: string;
  regimens: CompareRegimensResult["regimens"];
  endpoints: CompareAuditEndpoint[];
  sources: SourceReference[];
  safetyStatement: string;
}

export function buildCompareRegimensAuditRecord(
  generatedAtIso: string,
  result: CompareRegimensResult,
): CompareRegimensAuditRecord {
  const base = buildAuditBase(generatedAtIso);

  const sourceIds: string[] = [];
  const auditedEndpoints = result.endpoints.map(
    (comparison): CompareAuditEndpoint => {
      const endpoint = endpoints.find(
        (candidate) =>
          candidate.id === comparison.endpointId,
      );
      if (!endpoint) {
        throw new Error(
          `Unknown endpoint for audit: ${comparison.endpointId}`,
        );
      }

      const representative = comparison.cells[0]?.result;
      if (!representative) {
        throw new Error(
          `Comparison endpoint ${comparison.endpointId} has no regimen results.`,
        );
      }

      for (const cell of comparison.cells) {
        if (
          cell.result.selectionMode !==
            representative.selectionMode ||
          cell.result.alphaBetaGy !==
            representative.alphaBetaGy ||
          cell.result.parameterRecordId !==
            representative.parameterRecordId
        ) {
          throw new Error(
            `Comparison endpoint ${comparison.endpointId} does not use one consistent alpha/beta selection across regimens.`,
          );
        }
        if (cell.result.sourceId) {
          sourceIds.push(cell.result.sourceId);
        }
      }

      return {
        endpoint: {
          id: endpoint.id,
          organ: endpoint.organ,
          label: endpoint.endpoint,
        },
        alphaBeta: {
          valueGy: representative.alphaBetaGy,
          selectionMode:
            representative.selectionMode,
          ...(representative.parameterRecordId
            ? {
                recordId:
                  representative.parameterRecordId,
              }
            : {}),
          ...(representative.sourceId
            ? { sourceId: representative.sourceId }
            : {}),
        },
        comparison,
      };
    },
  );

  return {
    ...base,
    module: "compare-regimens",
    referenceRegimenId: result.referenceRegimenId,
    regimens: result.regimens,
    endpoints: auditedEndpoints,
    sources: resolveAuditSources(sourceIds),
    safetyStatement:
      "This audit record documents mathematical BED/EQD2 comparisons. Equivalent or similar biological dose does not by itself establish clinical interchangeability of fractionation regimens.",
  };
}
