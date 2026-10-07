import {
  evidenceManifest,
} from "../data/evidence/v0.1/index.js";
import type {
  EvidenceBasedParameterSelection,
  ManualParameterOverride,
} from "../domain/evidence.js";
import {
  HFC_ENGINE_VERSION,
} from "../version.js";
import {
  calculateEvidenceLq,
} from "../workflows/evidenceLq.js";
import {
  compareRegimens,
  type ComparisonEndpoint,
} from "../workflows/compareRegimens.js";
import {
  buildQuickEqdAuditRecord,
  type QuickEqdAuditRecord,
} from "./quickEqdAudit.js";
import {
  buildCompareRegimensAuditRecord,
  type CompareRegimensAuditRecord,
} from "./compareRegimensAudit.js";
import {
  parseAuditDocument,
  type AuditIntegrityStatus,
  type AuditModule,
  type AuditRecordHeader,
  type ParsedAuditDocument,
} from "./envelope.js";
import type {
  AuditAlphaBetaParameter,
} from "./common.js";
import type {
  TreatmentGapAuditRecord,
} from "./treatmentGapAudit.js";
import type {
  ReirradiationAuditRecord,
} from "../domain/audit.js";
import {
  rebuildTreatmentGapAudit,
  treatmentGapReplayComparable,
} from "./replayTreatmentGap.js";
import {
  rebuildReirradiationAudit,
  reirradiationReplayComparable,
} from "./replayReirradiation.js";

export type ReplaySupportedModule =
  | "quick-eqd"
  | "compare-regimens"
  | "treatment-gap"
  | "reirradiation";

export interface AuditReplayDifference {
  path: string;
  saved: unknown;
  replayed: unknown;
}

export interface AuditReplayReport {
  module: ReplaySupportedModule;
  integrityStatus: AuditIntegrityStatus;
  generatedAtIso: string;
  savedEngineVersion: string;
  currentEngineVersion: string;
  savedEvidenceDatasetVersion: string;
  currentEvidenceDatasetVersion: string;
  engineVersionChanged: boolean;
  evidenceDatasetChanged: boolean;
  matches: boolean;
  differences: AuditReplayDifference[];
}

export interface AuditImportInspection {
  integrityStatus: AuditIntegrityStatus;
  header: AuditRecordHeader;
  replaySupported: boolean;
  replay?: AuditReplayReport;
}

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function requireObject(
  value: unknown,
  label: string,
): Record<string, unknown> {
  if (!isObject(value)) {
    throw new Error(
      `Audit replay requires "${label}" to be an object.`,
    );
  }
  return value;
}

function requireString(
  object: Record<string, unknown>,
  key: string,
  label: string,
): string {
  const value = object[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `Audit replay requires "${label}.${key}" to be a non-empty string.`,
    );
  }
  return value;
}

function requireNumber(
  object: Record<string, unknown>,
  key: string,
  label: string,
): number {
  const value = object[key];
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    throw new Error(
      `Audit replay requires "${label}.${key}" to be a finite number.`,
    );
  }
  return value;
}

function alphaSelectionFromAudit(
  parameter: AuditAlphaBetaParameter,
  rationale: string,
):
  | EvidenceBasedParameterSelection
  | ManualParameterOverride {
  if (parameter.selectionMode === "evidence") {
    if (!parameter.recordId) {
      throw new Error(
        "Evidence-based audit alpha/beta is missing recordId.",
      );
    }
    return {
      selectionMode: "evidence",
      parameterRecordId: parameter.recordId,
    };
  }

  if (
    !Number.isFinite(parameter.valueGy) ||
    parameter.valueGy <= 0
  ) {
    throw new Error(
      "Manual audit alpha/beta must be > 0 Gy.",
    );
  }

  return {
    selectionMode: "manual",
    parameter: "alpha-beta",
    value: parameter.valueGy,
    unit: "Gy",
    rationale,
  };
}

function assertQuickRecord(
  record: unknown,
): asserts record is QuickEqdAuditRecord {
  const root = requireObject(record, "record");
  const endpoint = requireObject(
    root.endpoint,
    "record.endpoint",
  );
  requireString(endpoint, "id", "record.endpoint");

  const alphaBeta = requireObject(
    root.alphaBeta,
    "record.alphaBeta",
  );
  const selectionMode = requireString(
    alphaBeta,
    "selectionMode",
    "record.alphaBeta",
  );
  if (
    selectionMode !== "evidence" &&
    selectionMode !== "manual"
  ) {
    throw new Error(
      "Audit replay requires alphaBeta.selectionMode to be evidence or manual.",
    );
  }
  requireNumber(alphaBeta, "valueGy", "record.alphaBeta");

  const input = requireObject(
    root.input,
    "record.input",
  );
  requireNumber(input, "fractions", "record.input");
  requireNumber(
    input,
    "dosePerFractionGy",
    "record.input",
  );

  requireObject(root.result, "record.result");
}

function assertCompareRecord(
  record: unknown,
): asserts record is CompareRegimensAuditRecord {
  const root = requireObject(record, "record");
  requireString(
    root,
    "referenceRegimenId",
    "record",
  );

  if (!Array.isArray(root.regimens) || root.regimens.length < 2) {
    throw new Error(
      "Compare audit replay requires at least two regimens.",
    );
  }
  if (!Array.isArray(root.endpoints) || root.endpoints.length < 1) {
    throw new Error(
      "Compare audit replay requires at least one endpoint.",
    );
  }

  for (const [index, value] of root.regimens.entries()) {
    const regimen = requireObject(
      value,
      `record.regimens[${index}]`,
    );
    requireString(
      regimen,
      "id",
      `record.regimens[${index}]`,
    );
    requireString(
      regimen,
      "label",
      `record.regimens[${index}]`,
    );
    const schedule = requireObject(
      regimen.schedule,
      `record.regimens[${index}].schedule`,
    );
    requireNumber(
      schedule,
      "fractions",
      `record.regimens[${index}].schedule`,
    );
    requireNumber(
      schedule,
      "dosePerFractionGy",
      `record.regimens[${index}].schedule`,
    );
  }

  for (const [index, value] of root.endpoints.entries()) {
    const endpointEntry = requireObject(
      value,
      `record.endpoints[${index}]`,
    );
    const endpoint = requireObject(
      endpointEntry.endpoint,
      `record.endpoints[${index}].endpoint`,
    );
    requireString(
      endpoint,
      "id",
      `record.endpoints[${index}].endpoint`,
    );
    const alphaBeta = requireObject(
      endpointEntry.alphaBeta,
      `record.endpoints[${index}].alphaBeta`,
    );
    requireNumber(
      alphaBeta,
      "valueGy",
      `record.endpoints[${index}].alphaBeta`,
    );
    const selectionMode = requireString(
      alphaBeta,
      "selectionMode",
      `record.endpoints[${index}].alphaBeta`,
    );
    if (
      selectionMode !== "evidence" &&
      selectionMode !== "manual"
    ) {
      throw new Error(
        "Compare audit replay requires alphaBeta.selectionMode to be evidence or manual.",
      );
    }
  }
}

function numericEqual(
  left: number,
  right: number,
): boolean {
  const tolerance = Math.max(
    1e-10,
    Math.abs(left) * 1e-10,
    Math.abs(right) * 1e-10,
  );
  return Math.abs(left - right) <= tolerance;
}

function collectDifferences(
  saved: unknown,
  replayed: unknown,
  path: string,
  output: AuditReplayDifference[],
): void {
  if (
    typeof saved === "number" &&
    typeof replayed === "number"
  ) {
    if (!numericEqual(saved, replayed)) {
      output.push({ path, saved, replayed });
    }
    return;
  }

  if (
    saved === null ||
    replayed === null ||
    typeof saved !== "object" ||
    typeof replayed !== "object"
  ) {
    if (!Object.is(saved, replayed)) {
      output.push({ path, saved, replayed });
    }
    return;
  }

  if (
    Array.isArray(saved) ||
    Array.isArray(replayed)
  ) {
    if (
      !Array.isArray(saved) ||
      !Array.isArray(replayed)
    ) {
      output.push({ path, saved, replayed });
      return;
    }

    if (saved.length !== replayed.length) {
      output.push({
        path: path + ".length",
        saved: saved.length,
        replayed: replayed.length,
      });
    }

    const length = Math.min(
      saved.length,
      replayed.length,
    );
    for (let index = 0; index < length; index += 1) {
      collectDifferences(
        saved[index],
        replayed[index],
        `${path}[${index}]`,
        output,
      );
    }
    return;
  }

  const savedObject = saved as Record<string, unknown>;
  const replayedObject =
    replayed as Record<string, unknown>;
  const keys = new Set([
    ...Object.keys(savedObject),
    ...Object.keys(replayedObject),
  ]);

  for (const key of [...keys].sort()) {
    const nextPath = path ? `${path}.${key}` : key;
    if (!(key in savedObject)) {
      output.push({
        path: nextPath,
        saved: undefined,
        replayed: replayedObject[key],
      });
      continue;
    }
    if (!(key in replayedObject)) {
      output.push({
        path: nextPath,
        saved: savedObject[key],
        replayed: undefined,
      });
      continue;
    }
    collectDifferences(
      savedObject[key],
      replayedObject[key],
      nextPath,
      output,
    );
  }
}

function quickComparable(
  audit: QuickEqdAuditRecord,
): unknown {
  return {
    endpoint: audit.endpoint,
    alphaBeta: audit.alphaBeta,
    input: audit.input,
    result: audit.result,
    sources: audit.sources,
  };
}

function compareComparable(
  audit: CompareRegimensAuditRecord,
): unknown {
  return {
    referenceRegimenId: audit.referenceRegimenId,
    regimens: audit.regimens,
    endpoints: audit.endpoints,
    sources: audit.sources,
  };
}

function reportBase(
  header: AuditRecordHeader,
  integrityStatus: AuditIntegrityStatus,
) {
  return {
    integrityStatus,
    generatedAtIso: header.generatedAtIso,
    savedEngineVersion: header.engineVersion,
    currentEngineVersion: HFC_ENGINE_VERSION,
    savedEvidenceDatasetVersion:
      header.evidence.datasetVersion,
    currentEvidenceDatasetVersion:
      evidenceManifest.datasetVersion,
    engineVersionChanged:
      header.engineVersion !== HFC_ENGINE_VERSION,
    evidenceDatasetChanged:
      header.evidence.datasetVersion !==
      evidenceManifest.datasetVersion,
  };
}

export function replayQuickEqdAudit(
  record: unknown,
  integrityStatus: AuditIntegrityStatus,
): AuditReplayReport {
  assertQuickRecord(record);

  const selection = alphaSelectionFromAudit(
    record.alphaBeta,
    "Replay of imported Quick EQD audit",
  );
  const replayedResult = calculateEvidenceLq(
    record.endpoint.id,
    record.input,
    selection,
  );
  const replayedAudit = buildQuickEqdAuditRecord(
    record.generatedAtIso,
    replayedResult,
  );

  const differences: AuditReplayDifference[] = [];
  collectDifferences(
    quickComparable(record),
    quickComparable(replayedAudit),
    "",
    differences,
  );

  return {
    module: "quick-eqd",
    ...reportBase(record, integrityStatus),
    matches: differences.length === 0,
    differences,
  };
}

export function replayCompareRegimensAudit(
  record: unknown,
  integrityStatus: AuditIntegrityStatus,
): AuditReplayReport {
  assertCompareRecord(record);

  const endpointRequests: ComparisonEndpoint[] =
    record.endpoints.map((entry) => ({
      endpointId: entry.endpoint.id,
      selection: alphaSelectionFromAudit(
        entry.alphaBeta,
        "Replay of imported Compare Regimens audit",
      ),
    }));

  const replayedResult = compareRegimens(
    record.regimens,
    endpointRequests,
    record.referenceRegimenId,
  );
  const replayedAudit =
    buildCompareRegimensAuditRecord(
      record.generatedAtIso,
      replayedResult,
    );

  const differences: AuditReplayDifference[] = [];
  collectDifferences(
    compareComparable(record),
    compareComparable(replayedAudit),
    "",
    differences,
  );

  return {
    module: "compare-regimens",
    ...reportBase(record, integrityStatus),
    matches: differences.length === 0,
    differences,
  };
}

export function replayTreatmentGapAudit(
  record: unknown,
  integrityStatus: AuditIntegrityStatus,
): AuditReplayReport {
  const saved = record as TreatmentGapAuditRecord;
  if (
    !isObject(saved) ||
    saved.module !== "treatment-gap" ||
    !isObject(saved.endpoint) ||
    typeof saved.endpoint.id !== "string" ||
    !isObject(saved.inputs) ||
    !isObject(saved.baseline) ||
    !isObject(saved.strategies) ||
    !Array.isArray(saved.oars)
  ) {
    throw new Error(
      "Treatment Gap audit record is missing required replay fields.",
    );
  }

  const replayed =
    rebuildTreatmentGapAudit(saved);
  const differences: AuditReplayDifference[] = [];
  collectDifferences(
    treatmentGapReplayComparable(saved),
    treatmentGapReplayComparable(replayed),
    "",
    differences,
  );

  return {
    module: "treatment-gap",
    ...reportBase(saved, integrityStatus),
    matches: differences.length === 0,
    differences,
  };
}

export function replayReirradiationAudit(
  record: unknown,
  integrityStatus: AuditIntegrityStatus,
): AuditReplayReport {
  const saved = record as ReirradiationAuditRecord;
  if (
    !isObject(saved) ||
    saved.module !== "reirradiation" ||
    !isObject(saved.endpoint) ||
    typeof saved.endpoint.id !== "string" ||
    !isObject(saved.alphaBeta) ||
    !isObject(saved.context) ||
    !Array.isArray(saved.inputCourses) ||
    !isObject(saved.result)
  ) {
    throw new Error(
      "Reirradiation audit record is missing required replay fields.",
    );
  }

  const replayed =
    rebuildReirradiationAudit(saved);
  const includeUserConfirmations =
    saved.schemaVersion !== "1.0";
  const differences: AuditReplayDifference[] = [];
  collectDifferences(
    reirradiationReplayComparable(
      saved,
      includeUserConfirmations,
    ),
    reirradiationReplayComparable(
      replayed,
      includeUserConfirmations,
    ),
    "",
    differences,
  );

  return {
    module: "reirradiation",
    ...reportBase(saved, integrityStatus),
    matches: differences.length === 0,
    differences,
  };
}

export function isReplaySupportedModule(
  module: AuditModule,
): module is ReplaySupportedModule {
  return (
    module === "quick-eqd" ||
    module === "compare-regimens" ||
    module === "treatment-gap" ||
    module === "reirradiation"
  );
}

export function replayParsedAuditDocument(
  parsed: ParsedAuditDocument,
): AuditReplayReport {
  const header = parsed.record as AuditRecordHeader;

  if (header.module === "quick-eqd") {
    return replayQuickEqdAudit(
      parsed.record,
      parsed.integrityStatus,
    );
  }

  if (header.module === "compare-regimens") {
    return replayCompareRegimensAudit(
      parsed.record,
      parsed.integrityStatus,
    );
  }

  if (header.module === "treatment-gap") {
    return replayTreatmentGapAudit(
      parsed.record,
      parsed.integrityStatus,
    );
  }

  if (header.module === "reirradiation") {
    return replayReirradiationAudit(
      parsed.record,
      parsed.integrityStatus,
    );
  }

  throw new Error(
    `Replay is not supported for audit module: ${header.module}`,
  );
}

export async function inspectAuditDocument(
  text: string,
): Promise<AuditImportInspection> {
  const parsed = await parseAuditDocument(text);
  const header = parsed.record as AuditRecordHeader;
  const replaySupported =
    isReplaySupportedModule(header.module);

  return {
    integrityStatus: parsed.integrityStatus,
    header,
    replaySupported,
    ...(replaySupported
      ? {
          replay: replayParsedAuditDocument(parsed),
        }
      : {}),
  };
}
