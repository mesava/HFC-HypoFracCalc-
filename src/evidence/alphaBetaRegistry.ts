import type {
  AlphaBetaEstimate,
  EndpointIdentity,
  EvidenceBasedParameterSelection,
  ManualParameterOverride,
  SourceReference,
} from "../domain/evidence.js";
import {
  alphaBetaEstimates,
  endpoints,
  sources,
} from "../data/evidence/v0.1/index.js";

export interface ResolvedAlphaBetaSelection {
  endpoint: EndpointIdentity;
  valueGy: number;
  selectionMode: "evidence" | "manual";
  parameterRecord?: AlphaBetaEstimate;
  source?: SourceReference;
  rationale?: string;
  warnings: string[];
}

export function getAlphaBetaEstimates(
  endpointId: string,
): AlphaBetaEstimate[] {
  return alphaBetaEstimates.filter((record) => record.endpointId === endpointId);
}

export function getPreferredAlphaBetaEstimate(
  endpointId: string,
): AlphaBetaEstimate | undefined {
  const candidates = alphaBetaEstimates.filter(
    (record) =>
      record.endpointId === endpointId &&
      record.status === "preferred" &&
      record.defaultEligible,
  );

  if (candidates.length > 1) {
    throw new Error(
      `Evidence dataset error: endpoint ${endpointId} has more than one default-eligible preferred alpha/beta estimate.`,
    );
  }

  return candidates[0];
}

export function defaultAlphaBetaSelection(
  endpointId: string,
): EvidenceBasedParameterSelection | undefined {
  const preferred = getPreferredAlphaBetaEstimate(endpointId);
  return preferred
    ? {
        selectionMode: "evidence",
        parameterRecordId: preferred.id,
      }
    : undefined;
}

function findEndpoint(endpointId: string): EndpointIdentity {
  const endpoint = endpoints.find((candidate) => candidate.id === endpointId);
  if (!endpoint) {
    throw new Error(`Unknown endpoint: ${endpointId}`);
  }
  return endpoint;
}

export function resolveAlphaBetaSelection(
  endpointId: string,
  selection: EvidenceBasedParameterSelection | ManualParameterOverride,
): ResolvedAlphaBetaSelection {
  const endpoint = findEndpoint(endpointId);

  if (selection.selectionMode === "manual") {
    if (selection.parameter !== "alpha-beta" || selection.unit !== "Gy") {
      throw new Error(
        "Manual alpha/beta override must use parameter='alpha-beta' and unit='Gy'.",
      );
    }
    if (!Number.isFinite(selection.value) || selection.value <= 0) {
      throw new RangeError("Manual alpha/beta value must be > 0 Gy.");
    }

    return {
      endpoint,
      valueGy: selection.value,
      selectionMode: "manual",
      ...(selection.rationale !== undefined
        ? { rationale: selection.rationale }
        : {}),
      warnings: [
        "User-specified alpha/beta overrides the curated evidence dataset for this calculation.",
      ],
    };
  }

  const parameterRecord = alphaBetaEstimates.find(
    (candidate) => candidate.id === selection.parameterRecordId,
  );
  if (!parameterRecord) {
    throw new Error(
      `Unknown alpha/beta evidence record: ${selection.parameterRecordId}`,
    );
  }
  if (parameterRecord.endpointId !== endpointId) {
    throw new Error(
      `Alpha/beta record ${parameterRecord.id} does not belong to endpoint ${endpointId}.`,
    );
  }

  const source = sources.find(
    (candidate) => candidate.id === parameterRecord.sourceId,
  );
  if (!source) {
    throw new Error(
      `Evidence dataset error: missing source ${parameterRecord.sourceId}.`,
    );
  }

  const warnings: string[] = [];
  if (parameterRecord.support === "limited") {
    warnings.push(
      parameterRecord.supportReason ??
        "The selected alpha/beta estimate has limited model support.",
    );
  } else if (parameterRecord.support === "poor-fit") {
    warnings.push(
      parameterRecord.supportReason ??
        "The selected alpha/beta estimate comes from a poorly constrained model.",
    );
  }
  if (!parameterRecord.defaultEligible) {
    warnings.push(
      "This estimate is retained for transparency but is not eligible for automatic default selection.",
    );
  }

  return {
    endpoint,
    valueGy: parameterRecord.valueGy,
    selectionMode: "evidence",
    parameterRecord,
    source,
    warnings,
  };
}
