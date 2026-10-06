import type { RepopulationRateEstimate } from "../domain/evidence.js";
import { repopulationRateEstimates } from "../data/evidence/v0.1/index.js";

export interface EvidenceRepopulationSelection {
  selectionMode: "evidence";
  parameterRecordId: string;
  /**
   * Optional explicit Tk override while retaining the evidence provenance of
   * the selected Dprolif rate. The override is always surfaced as a warning.
   */
  kickOffOverrideDays?: number;
}

export interface ManualRepopulationSelection {
  selectionMode: "manual";
  rateGyPerDay: number;
  kickOffDays?: number;
  rationale?: string;
}

export type RepopulationSelection =
  | EvidenceRepopulationSelection
  | ManualRepopulationSelection;

export interface ResolvedRepopulationSelection {
  selectionMode: "evidence" | "manual";
  basis: "EQD2";
  rateGyPerDay: number;
  kickOffDays?: number;
  parameterRecord?: RepopulationRateEstimate;
  rationale?: string;
  warnings: string[];
}

export function getRepopulationEstimates(
  endpointId: string,
): RepopulationRateEstimate[] {
  return repopulationRateEstimates.filter(
    (record) =>
      record.endpointId === endpointId &&
      record.status !== "deprecated",
  );
}

export function getPreferredRepopulationEstimate(
  endpointId: string,
): RepopulationRateEstimate | undefined {
  const candidates = repopulationRateEstimates.filter(
    (record) =>
      record.endpointId === endpointId &&
      record.status === "preferred" &&
      record.defaultEligible,
  );

  if (candidates.length > 1) {
    throw new Error(
      `Evidence dataset error: endpoint ${endpointId} has more than one preferred repopulation estimate.`,
    );
  }

  return candidates[0];
}

export function defaultRepopulationSelection(
  endpointId: string,
): EvidenceRepopulationSelection | undefined {
  const preferred = getPreferredRepopulationEstimate(endpointId);
  return preferred
    ? {
        selectionMode: "evidence",
        parameterRecordId: preferred.id,
      }
    : undefined;
}

export function resolveRepopulationSelection(
  endpointId: string,
  selection: RepopulationSelection,
): ResolvedRepopulationSelection {
  if (selection.selectionMode === "manual") {
    if (
      !Number.isFinite(selection.rateGyPerDay) ||
      selection.rateGyPerDay < 0
    ) {
      throw new RangeError("Manual Dprolif must be >= 0 Gy/day.");
    }
    if (
      selection.kickOffDays !== undefined &&
      (!Number.isFinite(selection.kickOffDays) ||
        selection.kickOffDays < 0)
    ) {
      throw new RangeError("Manual Tk must be >= 0 days.");
    }

    return {
      selectionMode: "manual",
      basis: "EQD2",
      rateGyPerDay: selection.rateGyPerDay,
      ...(selection.kickOffDays !== undefined
        ? { kickOffDays: selection.kickOffDays }
        : {}),
      ...(selection.rationale !== undefined
        ? { rationale: selection.rationale }
        : {}),
      warnings: [
        "User-specified Dprolif/Tk overrides the curated evidence dataset for this calculation.",
      ],
    };
  }

  const record = repopulationRateEstimates.find(
    (candidate) => candidate.id === selection.parameterRecordId,
  );
  if (!record) {
    throw new Error(
      `Unknown repopulation evidence record: ${selection.parameterRecordId}`,
    );
  }
  if (record.endpointId !== endpointId) {
    throw new Error(
      `Repopulation record ${record.id} does not belong to endpoint ${endpointId}.`,
    );
  }
  if (record.basis !== "EQD2") {
    throw new Error(
      "Treatment Gap v0.1 accepts EQD2-based Dprolif records only.",
    );
  }

  const warnings: string[] = [];
  if (record.support !== "supported") {
    warnings.push(
      record.supportReason ??
        "The selected time-loss estimate has limited evidence support.",
    );
  }
  if (!record.defaultEligible) {
    warnings.push(
      "This time-loss estimate is not eligible for automatic default selection.",
    );
  }
  if (
    selection.kickOffOverrideDays !== undefined &&
    (!Number.isFinite(selection.kickOffOverrideDays) ||
      selection.kickOffOverrideDays < 0)
  ) {
    throw new RangeError("Tk override must be >= 0 days.");
  }

  const effectiveTk =
    selection.kickOffOverrideDays ?? record.kickOffDays;

  if (selection.kickOffOverrideDays !== undefined) {
    warnings.push(
      "Tk is user-specified for this calculation while Dprolif remains evidence-sourced.",
    );
  } else if (record.kickOffDays === undefined) {
    warnings.push(
      "No single Tk value is available for this evidence record; time correction requires an explicit kick-off assumption.",
    );
  }

  return {
    selectionMode: "evidence",
    basis: "EQD2",
    rateGyPerDay: record.rateGyPerDay,
    ...(effectiveTk !== undefined
      ? { kickOffDays: effectiveTk }
      : {}),
    parameterRecord: record,
    warnings,
  };
}
