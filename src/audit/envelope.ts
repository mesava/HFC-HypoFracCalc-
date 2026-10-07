import {
  assertAuditTimestamp,
} from "./common.js";
import {
  HFC_AUDIT_SCHEMA_VERSION,
} from "../version.js";

export const HFC_AUDIT_ENVELOPE_VERSION = "1.0";
export const HFC_AUDIT_CANONICALIZATION = "hfc-json-v1";
export const HFC_AUDIT_HASH_ALGORITHM = "SHA-256";
export const HFC_SUPPORTED_AUDIT_SCHEMA_VERSIONS = [
  "1.0",
  HFC_AUDIT_SCHEMA_VERSION,
] as const;

export type AuditModule =
  | "quick-eqd"
  | "compare-regimens"
  | "treatment-gap"
  | "reirradiation";

export interface AuditRecordHeader {
  schemaVersion: string;
  module: AuditModule;
  engineVersion: string;
  generatedAtIso: string;
  evidence: {
    datasetVersion: string;
    evidenceCutoffDate: string;
    releaseStatus: string;
  };
}

export interface AuditIntegrity {
  algorithm: typeof HFC_AUDIT_HASH_ALGORITHM;
  canonicalization: typeof HFC_AUDIT_CANONICALIZATION;
  digestHex: string;
}

export interface AuditEnvelope<T = unknown> {
  format: "hfc-audit";
  envelopeVersion: typeof HFC_AUDIT_ENVELOPE_VERSION;
  record: T;
  integrity: AuditIntegrity;
}

export type AuditIntegrityStatus =
  | "verified"
  | "legacy-unverified";

export interface ParsedAuditDocument<T = unknown> {
  record: T;
  integrityStatus: AuditIntegrityStatus;
  envelope?: AuditEnvelope<T>;
}

function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function canonicalJsonValue(value: unknown): string {
  if (value === null) return "null";

  if (
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(
        "Audit canonicalization does not allow non-finite numbers.",
      );
    }
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return (
      "[" +
      value
        .map((item) => canonicalJsonValue(item))
        .join(",") +
      "]"
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.keys(value)
      .filter((key) => value[key] !== undefined)
      .sort()
      .map(
        (key) =>
          JSON.stringify(key) +
          ":" +
          canonicalJsonValue(value[key]),
      );
    return "{" + entries.join(",") + "}";
  }

  throw new Error(
    `Audit canonicalization does not support value type: ${typeof value}`,
  );
}

export function canonicalizeAuditRecord(
  record: unknown,
): string {
  return canonicalJsonValue(record);
}

function cryptoSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error(
      "Web Crypto API is required to calculate the audit SHA-256 integrity hash.",
    );
  }
  return subtle;
}

export async function sha256Hex(
  value: string,
): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await cryptoSubtle().digest(
    HFC_AUDIT_HASH_ALGORITHM,
    bytes,
  );

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function calculateAuditDigest(
  record: unknown,
): Promise<string> {
  return sha256Hex(canonicalizeAuditRecord(record));
}

export async function buildAuditEnvelope<T>(
  record: T,
): Promise<AuditEnvelope<T>> {
  assertSupportedAuditHeader(record);

  return {
    format: "hfc-audit",
    envelopeVersion: HFC_AUDIT_ENVELOPE_VERSION,
    record,
    integrity: {
      algorithm: HFC_AUDIT_HASH_ALGORITHM,
      canonicalization: HFC_AUDIT_CANONICALIZATION,
      digestHex: await calculateAuditDigest(record),
    },
  };
}

export async function serializeAuditEnvelope(
  record: unknown,
): Promise<string> {
  const envelope = await buildAuditEnvelope(record);
  return JSON.stringify(envelope, null, 2);
}

function assertStringField(
  object: Record<string, unknown>,
  key: string,
): string {
  const value = object[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `Audit record field "${key}" must be a non-empty string.`,
    );
  }
  return value;
}

function assertSupportedAuditHeader(
  record: unknown,
): asserts record is AuditRecordHeader {
  if (!isPlainObject(record)) {
    throw new Error("Audit record must be a JSON object.");
  }

  const schemaVersion = assertStringField(
    record,
    "schemaVersion",
  );
  if (
    !HFC_SUPPORTED_AUDIT_SCHEMA_VERSIONS.includes(
      schemaVersion as (typeof HFC_SUPPORTED_AUDIT_SCHEMA_VERSIONS)[number],
    )
  ) {
    throw new Error(
      `Unsupported audit schema version: ${schemaVersion}`,
    );
  }

  const module = assertStringField(record, "module");
  const supportedModules: AuditModule[] = [
    "quick-eqd",
    "compare-regimens",
    "treatment-gap",
    "reirradiation",
  ];
  if (
    !supportedModules.includes(module as AuditModule)
  ) {
    throw new Error(
      `Unsupported audit module: ${module}`,
    );
  }

  assertStringField(record, "engineVersion");
  const generatedAtIso = assertStringField(
    record,
    "generatedAtIso",
  );
  assertAuditTimestamp(generatedAtIso);

  const evidence = record.evidence;
  if (!isPlainObject(evidence)) {
    throw new Error(
      'Audit record field "evidence" must be an object.',
    );
  }
  assertStringField(evidence, "datasetVersion");
  assertStringField(evidence, "evidenceCutoffDate");
  assertStringField(evidence, "releaseStatus");
}

function parseJsonObject(text: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Audit document is not valid JSON.");
  }

  if (!isPlainObject(parsed)) {
    throw new Error(
      "Audit document root must be a JSON object.",
    );
  }
  return parsed;
}

function assertEnvelope(
  value: Record<string, unknown>,
): asserts value is Record<string, unknown> & {
  format: "hfc-audit";
  envelopeVersion: string;
  record: unknown;
  integrity: Record<string, unknown>;
} {
  if (value.format !== "hfc-audit") {
    throw new Error("Unknown audit envelope format.");
  }

  const envelopeVersion = assertStringField(
    value,
    "envelopeVersion",
  );
  if (
    envelopeVersion !== HFC_AUDIT_ENVELOPE_VERSION
  ) {
    throw new Error(
      `Unsupported audit envelope version: ${envelopeVersion}`,
    );
  }

  if (!("record" in value)) {
    throw new Error(
      'Audit envelope field "record" is required.',
    );
  }

  if (!isPlainObject(value.integrity)) {
    throw new Error(
      'Audit envelope field "integrity" must be an object.',
    );
  }
}

export async function parseAuditDocument(
  text: string,
): Promise<ParsedAuditDocument> {
  const parsed = parseJsonObject(text);

  if (parsed.format === "hfc-audit") {
    assertEnvelope(parsed);

    const algorithm = assertStringField(
      parsed.integrity,
      "algorithm",
    );
    if (algorithm !== HFC_AUDIT_HASH_ALGORITHM) {
      throw new Error(
        `Unsupported audit integrity algorithm: ${algorithm}`,
      );
    }

    const canonicalization = assertStringField(
      parsed.integrity,
      "canonicalization",
    );
    if (
      canonicalization !== HFC_AUDIT_CANONICALIZATION
    ) {
      throw new Error(
        `Unsupported audit canonicalization: ${canonicalization}`,
      );
    }

    const expectedDigest = assertStringField(
      parsed.integrity,
      "digestHex",
    ).toLowerCase();

    if (!/^[0-9a-f]{64}$/.test(expectedDigest)) {
      throw new Error(
        "Audit integrity digest must be a 64-character SHA-256 hexadecimal string.",
      );
    }

    const actualDigest = await calculateAuditDigest(
      parsed.record,
    );
    if (actualDigest !== expectedDigest) {
      throw new Error(
        "Audit integrity check failed: the record does not match its SHA-256 digest.",
      );
    }

    assertSupportedAuditHeader(parsed.record);

    const envelope = parsed as unknown as AuditEnvelope;
    return {
      record: envelope.record,
      integrityStatus: "verified",
      envelope,
    };
  }

  assertSupportedAuditHeader(parsed);
  return {
    record: parsed,
    integrityStatus: "legacy-unverified",
  };
}
