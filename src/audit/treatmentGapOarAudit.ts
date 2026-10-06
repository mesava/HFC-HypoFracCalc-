import {
  alphaBetaEstimates,
  endpoints,
  repairHalfTimeEstimates,
} from "../data/evidence/v0.1/index.js";
import type { DoseMetric } from "../domain/constraints.js";
import type {
  EvidenceBasedParameterSelection,
  ManualParameterOverride,
} from "../domain/evidence.js";
import type {
  OarCalendarComparisonResult,
  OarDoseCompensationResult,
} from "../workflows/treatmentGapOar.js";
import type {
  AuditAlphaBetaParameter,
  AuditEndpointIdentity,
} from "./common.js";

export type OarParameterSelection =
  | EvidenceBasedParameterSelection
  | ManualParameterOverride;

export interface TreatmentGapOarAuditInputState {
  plannedOarDosePerFraction: string;
  postGapDoseMode: "manual" | "proportional";
  manualPostGapOarDose: string;
  alphaMode: "evidence" | "manual";
  alphaRecordId: string;
  manualAlphaBeta: string;
  repairMode: "evidence" | "manual";
  repairRecordId: string;
  manualRepairHalfTime: string;
  bidInterfractionHours: number;
}

export interface TreatmentGapOarRepairParameter {
  selectionMode: "evidence" | "manual";
  valueHours?: number;
  recordId?: string;
  sourceId?: string;
}

interface TreatmentGapOarAuditBase {
  cardId: number;
  endpoint: AuditEndpointIdentity;
  metric: DoseMetric;
  inputState: TreatmentGapOarAuditInputState;
  alphaSelection: OarParameterSelection;
  repairSelection: OarParameterSelection;
  sourceIds: string[];
}

export interface TreatmentGapOarCalculatedAuditEntry
  extends TreatmentGapOarAuditBase {
  status: "calculated";
  alphaBeta: AuditAlphaBetaParameter;
  repairHalfTime: TreatmentGapOarRepairParameter;
  plannedOarDosePerFractionGy: number;
  effectivePostGapOarDosePerFractionGy?: number;
  results: {
    weekend?: OarCalendarComparisonResult;
    bid?: OarCalendarComparisonResult | { error: string };
    doseCompensation?: OarDoseCompensationResult;
  };
}

export interface TreatmentGapOarErrorAuditEntry
  extends TreatmentGapOarAuditBase {
  status: "input-error";
  error: string;
}

export type TreatmentGapOarAuditEntry =
  | TreatmentGapOarCalculatedAuditEntry
  | TreatmentGapOarErrorAuditEntry;

export interface BuildTreatmentGapOarAuditInput {
  cardId: number;
  endpointId: string;
  metric: DoseMetric;
  inputState: TreatmentGapOarAuditInputState;
  alphaSelection: OarParameterSelection;
  repairSelection: OarParameterSelection;
  calculation:
    | {
        weekend?: OarCalendarComparisonResult | undefined;
        bid?:
          | OarCalendarComparisonResult
          | { error: string }
          | undefined;
        doseCompensationOar?:
          | OarDoseCompensationResult
          | undefined;
        postGapOarD?: number | undefined;
      }
    | { error: string };
}

function alphaParameter(
  selection: OarParameterSelection,
): AuditAlphaBetaParameter {
  if (selection.selectionMode === "manual") {
    return {
      valueGy: selection.value,
      selectionMode: "manual",
    };
  }

  const record = alphaBetaEstimates.find(
    (candidate) =>
      candidate.id === selection.parameterRecordId,
  );
  if (!record) {
    throw new Error(
      `Unknown OAR alpha/beta evidence record: ${selection.parameterRecordId}`,
    );
  }

  return {
    valueGy: record.valueGy,
    selectionMode: "evidence",
    recordId: record.id,
    sourceId: record.sourceId,
  };
}

function repairParameter(
  selection: OarParameterSelection,
): TreatmentGapOarRepairParameter {
  if (selection.selectionMode === "manual") {
    return {
      selectionMode: "manual",
      valueHours: selection.value,
    };
  }

  const record = repairHalfTimeEstimates.find(
    (candidate) =>
      candidate.id === selection.parameterRecordId,
  );
  if (!record) {
    return {
      selectionMode: "evidence",
      recordId: selection.parameterRecordId,
    };
  }

  return {
    selectionMode: "evidence",
    ...(record.valueHours !== undefined
      ? { valueHours: record.valueHours }
      : {}),
    recordId: record.id,
    sourceId: record.sourceId,
  };
}

function selectionSourceIds(
  alphaSelection: OarParameterSelection,
  repairSelection: OarParameterSelection,
): string[] {
  const alphaSourceId =
    alphaSelection.selectionMode === "evidence"
      ? alphaBetaEstimates.find(
          (record) =>
            record.id ===
            alphaSelection.parameterRecordId,
        )?.sourceId
      : undefined;
  const repairSourceId =
    repairSelection.selectionMode === "evidence"
      ? repairHalfTimeEstimates.find(
          (record) =>
            record.id ===
            repairSelection.parameterRecordId,
        )?.sourceId
      : undefined;

  return [
    ...new Set(
      [alphaSourceId, repairSourceId].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  ];
}

export function buildTreatmentGapOarAuditEntry(
  input: BuildTreatmentGapOarAuditInput,
): TreatmentGapOarAuditEntry {
  const endpoint = endpoints.find(
    (candidate) => candidate.id === input.endpointId,
  );
  if (!endpoint) {
    throw new Error(
      `Unknown OAR endpoint for audit: ${input.endpointId}`,
    );
  }

  const base: TreatmentGapOarAuditBase = {
    cardId: input.cardId,
    endpoint: {
      id: endpoint.id,
      organ: endpoint.organ,
      label: endpoint.endpoint,
    },
    metric: input.metric,
    inputState: input.inputState,
    alphaSelection: input.alphaSelection,
    repairSelection: input.repairSelection,
    sourceIds: selectionSourceIds(
      input.alphaSelection,
      input.repairSelection,
    ),
  };

  if ("error" in input.calculation) {
    return {
      ...base,
      status: "input-error",
      error: input.calculation.error,
    };
  }

  const alphaBeta = alphaParameter(input.alphaSelection);
  const repairHalfTime = repairParameter(
    input.repairSelection,
  );

  const plannedOarDosePerFractionGy = Number(
    input.inputState.plannedOarDosePerFraction,
  );
  if (
    !Number.isFinite(plannedOarDosePerFractionGy) ||
    plannedOarDosePerFractionGy <= 0
  ) {
    return {
      ...base,
      status: "input-error",
      error:
        "OAR dose per fraction must be a positive finite number.",
    };
  }

  return {
    ...base,
    status: "calculated",
    alphaBeta,
    repairHalfTime,
    plannedOarDosePerFractionGy,
    ...(input.calculation.postGapOarD !== undefined &&
    Number.isFinite(input.calculation.postGapOarD)
      ? {
          effectivePostGapOarDosePerFractionGy:
            input.calculation.postGapOarD,
        }
      : {}),
    results: {
      ...(input.calculation.weekend
        ? { weekend: input.calculation.weekend }
        : {}),
      ...(input.calculation.bid
        ? { bid: input.calculation.bid }
        : {}),
      ...(input.calculation.doseCompensationOar
        ? {
            doseCompensation:
              input.calculation.doseCompensationOar,
          }
        : {}),
    },
  };
}
