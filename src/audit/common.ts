import {
  evidenceManifest,
  sources,
} from "../data/evidence/v0.1/index.js";
import type { SourceReference } from "../domain/evidence.js";
import {
  HFC_AUDIT_SCHEMA_VERSION,
  HFC_ENGINE_VERSION,
} from "../version.js";

export interface AuditBase {
  schemaVersion: string;
  engineVersion: string;
  generatedAtIso: string;
  evidence: {
    datasetVersion: string;
    evidenceCutoffDate: string;
    releaseStatus: string;
  };
}

export interface AuditEndpointIdentity {
  id: string;
  organ: string;
  label: string;
}

export interface AuditAlphaBetaParameter {
  valueGy: number;
  selectionMode: "evidence" | "manual";
  recordId?: string;
  sourceId?: string;
}

export function assertAuditTimestamp(value: string): void {
  if (
    value.trim() === "" ||
    Number.isNaN(Date.parse(value))
  ) {
    throw new Error(
      "generatedAtIso must be a valid ISO date-time string.",
    );
  }
}

export function buildAuditBase(
  generatedAtIso: string,
): AuditBase {
  assertAuditTimestamp(generatedAtIso);

  return {
    schemaVersion: HFC_AUDIT_SCHEMA_VERSION,
    engineVersion: HFC_ENGINE_VERSION,
    generatedAtIso,
    evidence: {
      datasetVersion: evidenceManifest.datasetVersion,
      evidenceCutoffDate:
        evidenceManifest.evidenceCutoffDate,
      releaseStatus: evidenceManifest.releaseStatus,
    },
  };
}

export function resolveAuditSources(
  sourceIds: Iterable<string | undefined>,
): SourceReference[] {
  const unique = [
    ...new Set(
      [...sourceIds].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  ];

  return unique.map((sourceId) => {
    const source = sources.find(
      (candidate) => candidate.id === sourceId,
    );
    if (!source) {
      throw new Error(
        `Audit source is missing from the evidence registry: ${sourceId}`,
      );
    }
    return source;
  });
}

export function serializeAuditRecord(
  record: unknown,
): string {
  return JSON.stringify(record, null, 2);
}
