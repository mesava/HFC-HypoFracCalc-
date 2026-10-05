import type {
  EvidenceBasedParameterSelection,
  ManualParameterOverride,
  RepairHalfTimeEstimate,
  SourceReference,
} from "../domain/evidence.js";
import {
  repairHalfTimeEstimates,
  sources,
} from "../data/evidence/v0.1/index.js";

export interface ResolvedRepairHalfTimeSelection {
  valueHours: number;
  selectionMode: "evidence" | "manual";
  parameterRecord?: RepairHalfTimeEstimate;
  source?: SourceReference;
  rationale?: string;
  warnings: string[];
}

export function getRepairHalfTimeEstimates(
  endpointId: string,
): RepairHalfTimeEstimate[] {
  return repairHalfTimeEstimates.filter(
    (record) => record.endpointId === endpointId,
  );
}

export function getPreferredRepairHalfTimeEstimate(
  endpointId: string,
): RepairHalfTimeEstimate | undefined {
  const candidates = repairHalfTimeEstimates.filter(
    (record) =>
      record.endpointId === endpointId &&
      record.status === "preferred" &&
      record.defaultEligible &&
      record.valueHours !== undefined,
  );

  if (candidates.length > 1) {
    throw new Error(
      `Evidence dataset error: endpoint ${endpointId} has more than one default-eligible preferred repair half-time estimate.`,
    );
  }

  return candidates[0];
}

export function defaultRepairHalfTimeSelection(
  endpointId: string,
): EvidenceBasedParameterSelection | undefined {
  const preferred = getPreferredRepairHalfTimeEstimate(endpointId);
  return preferred
    ? {
        selectionMode: "evidence",
        parameterRecordId: preferred.id,
      }
    : undefined;
}

export function resolveRepairHalfTimeSelection(
  endpointId: string,
  selection: EvidenceBasedParameterSelection | ManualParameterOverride,
): ResolvedRepairHalfTimeSelection {
  if (selection.selectionMode === "manual") {
    if (
      selection.parameter !== "repair-half-time" ||
      selection.unit !== "hours"
    ) {
      throw new Error(
        "Manual repair-half-time override must use parameter='repair-half-time' and unit='hours'.",
      );
    }
    if (!Number.isFinite(selection.value) || selection.value <= 0) {
      throw new RangeError(
        "Manual repair half-time must be > 0 hours.",
      );
    }

    return {
      valueHours: selection.value,
      selectionMode: "manual",
      ...(selection.rationale !== undefined
        ? { rationale: selection.rationale }
        : {}),
      warnings: [
        "User-specified repair half-time overrides the curated evidence dataset for this calculation.",
      ],
    };
  }

  const record = repairHalfTimeEstimates.find(
    (candidate) => candidate.id === selection.parameterRecordId,
  ) as RepairHalfTimeEstimate | undefined;
  if (!record) {
    throw new Error(
      `Unknown repair half-time evidence record: ${selection.parameterRecordId}`,
    );
  }
  if (record.endpointId !== endpointId) {
    throw new Error(
      `Repair half-time record ${record.id} does not belong to endpoint ${endpointId}.`,
    );
  }
  if (record.valueHours === undefined) {
    throw new Error(
      `Repair half-time record ${record.id} is a range or bound rather than a point estimate. Enter an explicit user value for the calculation.`,
    );
  }

  const source = sources.find(
    (candidate) => candidate.id === record.sourceId,
  );
  if (!source) {
    throw new Error(
      `Evidence dataset error: missing source ${record.sourceId}.`,
    );
  }

  const warnings: string[] = [];
  if (record.support !== "supported") {
    warnings.push(
      record.supportReason ??
        "The selected repair half-time estimate has limited support.",
    );
  }
  if (!record.defaultEligible) {
    warnings.push(
      "This repair half-time estimate is not eligible for automatic default selection.",
    );
  }

  return {
    valueHours: record.valueHours,
    selectionMode: "evidence",
    parameterRecord: record,
    source,
    warnings,
  };
}
