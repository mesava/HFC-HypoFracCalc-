import {
  alphaBetaEstimates,
  endpoints,
  repopulationRateEstimates,
} from "../data/evidence/v0.1/index.js";
import type {
  EvidenceBasedParameterSelection,
  ManualParameterOverride,
  SourceReference,
} from "../domain/evidence.js";
import type {
  EvidenceRepopulationSelection,
  ManualRepopulationSelection,
} from "../evidence/repopulationRegistry.js";
import type {
  DoseCompensationStrategyInput,
  DoseCompensationStrategyResult,
  PreserveTimeStrategyResult,
  TreatmentGapBaseline,
} from "../workflows/treatmentGap.js";
import type {
  TreatmentCalendarInput,
  TreatmentCalendarScenario,
} from "../workflows/treatmentCalendar.js";
import {
  buildAuditBase,
  resolveAuditSources,
  type AuditEndpointIdentity,
} from "./common.js";

export interface TreatmentGapAuditInput {
  generatedAtIso: string;
  endpointId: string;
  courseInputMode: "calendar" | "manual";
  alphaSelection:
    | EvidenceBasedParameterSelection
    | ManualParameterOverride;
  repopulationSelection:
    | EvidenceRepopulationSelection
    | ManualRepopulationSelection;
  baseline: TreatmentGapBaseline;
  weekend: PreserveTimeStrategyResult;
  bid: PreserveTimeStrategyResult | { error: string };
  doseCompensation:
    | DoseCompensationStrategyResult
    | { error: string };
  bidInterfractionHours: number;
  doseCompensationInput: DoseCompensationStrategyInput;
  calendarInput?: TreatmentCalendarInput;
  calendarScenario?: TreatmentCalendarScenario;
  manualDurationInput?: {
    plannedOverallTreatmentDays: number;
    deliveredFractionsBeforeGap: number;
    gapDays: number;
  };
}

export interface TreatmentGapAuditRecord {
  schemaVersion: string;
  module: "treatment-gap";
  engineVersion: string;
  generatedAtIso: string;
  evidence: {
    datasetVersion: string;
    evidenceCutoffDate: string;
    releaseStatus: string;
  };
  endpoint: AuditEndpointIdentity;
  inputs: {
    courseInputMode: "calendar" | "manual";
    alphaSelection:
      | EvidenceBasedParameterSelection
      | ManualParameterOverride;
    repopulationSelection:
      | EvidenceRepopulationSelection
      | ManualRepopulationSelection;
    bidInterfractionHours: number;
    doseCompensationInput: DoseCompensationStrategyInput;
    calendarInput?: TreatmentCalendarInput;
    manualDurationInput?: {
      plannedOverallTreatmentDays: number;
      deliveredFractionsBeforeGap: number;
      gapDays: number;
    };
  };
  baseline: TreatmentGapBaseline;
  calendarScenario?: TreatmentCalendarScenario;
  strategies: {
    weekend: PreserveTimeStrategyResult;
    bid: PreserveTimeStrategyResult | { error: string };
    doseCompensation:
      | DoseCompensationStrategyResult
      | { error: string };
  };
  sources: SourceReference[];
  safetyStatement: string;
}

function alphaSourceId(
  selection:
    | EvidenceBasedParameterSelection
    | ManualParameterOverride,
): string | undefined {
  if (selection.selectionMode !== "evidence") {
    return undefined;
  }
  return alphaBetaEstimates.find(
    (record) =>
      record.id === selection.parameterRecordId,
  )?.sourceId;
}

function repopulationSourceId(
  selection:
    | EvidenceRepopulationSelection
    | ManualRepopulationSelection,
): string | undefined {
  if (selection.selectionMode !== "evidence") {
    return undefined;
  }
  return repopulationRateEstimates.find(
    (record) =>
      record.id === selection.parameterRecordId,
  )?.sourceId;
}

export function buildTreatmentGapAuditRecord(
  input: TreatmentGapAuditInput,
): TreatmentGapAuditRecord {
  const base = buildAuditBase(input.generatedAtIso);

  if (input.baseline.endpointId !== input.endpointId) {
    throw new Error(
      "Audit input endpoint does not match the treatment-gap baseline endpoint.",
    );
  }

  const endpoint = endpoints.find(
    (candidate) => candidate.id === input.endpointId,
  );
  if (!endpoint) {
    throw new Error(
      `Unknown endpoint for audit: ${input.endpointId}`,
    );
  }

  if (
    input.courseInputMode === "calendar" &&
    (!input.calendarInput || !input.calendarScenario)
  ) {
    throw new Error(
      "Calendar-mode treatment-gap audit requires both calendar input and calculated scenario.",
    );
  }

  if (
    input.courseInputMode === "manual" &&
    !input.manualDurationInput
  ) {
    throw new Error(
      "Manual-duration treatment-gap audit requires the manual duration inputs.",
    );
  }

  const sourceIds = [
    "rcr-2019-timely-delivery",
    "bcr-2025-ch10-tables",
    alphaSourceId(input.alphaSelection),
    repopulationSourceId(input.repopulationSelection),
  ];

  return {
    ...base,
    module: "treatment-gap",
    endpoint: {
      id: endpoint.id,
      organ: endpoint.organ,
      label: endpoint.endpoint,
    },
    inputs: {
      courseInputMode: input.courseInputMode,
      alphaSelection: input.alphaSelection,
      repopulationSelection:
        input.repopulationSelection,
      bidInterfractionHours:
        input.bidInterfractionHours,
      doseCompensationInput:
        input.doseCompensationInput,
      ...(input.calendarInput
        ? { calendarInput: input.calendarInput }
        : {}),
      ...(input.manualDurationInput
        ? {
            manualDurationInput:
              input.manualDurationInput,
          }
        : {}),
    },
    baseline: input.baseline,
    ...(input.calendarScenario
      ? { calendarScenario: input.calendarScenario }
      : {}),
    strategies: {
      weekend: input.weekend,
      bid: input.bid,
      doseCompensation: input.doseCompensation,
    },
    sources: resolveAuditSources(sourceIds),
    safetyStatement:
      "This audit record documents treatment-interruption radiobiology and compensation scenarios. It does not establish normal-tissue safety, clinical acceptability, or a treatment prescription.",
  };
}
