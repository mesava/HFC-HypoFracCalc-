import { describe, expect, it } from "vitest";
import { buildQuickEqdAuditRecord } from "../src/audit/quickEqdAudit.js";
import {
  buildAuditEnvelope,
  calculateAuditDigest,
  canonicalizeAuditRecord,
  parseAuditDocument,
  serializeAuditEnvelope,
} from "../src/audit/envelope.js";
import { calculateEvidenceLq } from "../src/workflows/evidenceLq.js";

function quickAudit() {
  const result = calculateEvidenceLq(
    "prostate-biochemical-control",
    {
      fractions: 5,
      dosePerFractionGy: 7.25,
    },
  );

  return buildQuickEqdAuditRecord(
    "2026-10-07T05:00:00.000Z",
    result,
  );
}

describe("audit integrity envelope", () => {
  it("canonicalizes object keys deterministically", () => {
    const left = canonicalizeAuditRecord({
      b: 2,
      a: { y: 2, x: 1 },
    });
    const right = canonicalizeAuditRecord({
      a: { x: 1, y: 2 },
      b: 2,
    });

    expect(left).toBe(right);
  });

  it("produces the same SHA-256 digest for equivalent records", async () => {
    const left = {
      schemaVersion: "1.0",
      module: "quick-eqd",
      engineVersion: "0.1.0-dev",
      generatedAtIso: "2026-10-07T05:00:00.000Z",
      evidence: {
        datasetVersion: "test",
        evidenceCutoffDate: "2026-10-07",
        releaseStatus: "draft",
      },
      z: 1,
      a: 2,
    };
    const right = {
      a: 2,
      z: 1,
      evidence: {
        releaseStatus: "draft",
        evidenceCutoffDate: "2026-10-07",
        datasetVersion: "test",
      },
      generatedAtIso: "2026-10-07T05:00:00.000Z",
      engineVersion: "0.1.0-dev",
      module: "quick-eqd",
      schemaVersion: "1.0",
    };

    await expect(calculateAuditDigest(left)).resolves.toBe(
      await calculateAuditDigest(right),
    );
  });

  it("serializes and verifies a current audit record", async () => {
    const audit = quickAudit();
    const serialized = await serializeAuditEnvelope(
      audit,
    );
    const parsed = await parseAuditDocument(serialized);

    expect(parsed.integrityStatus).toBe("verified");
    expect(parsed.record).toEqual(audit);

    const raw = JSON.parse(serialized);
    expect(raw.format).toBe("hfc-audit");
    expect(raw.envelopeVersion).toBe("1.0");
    expect(raw.record.schemaVersion).toBe("1.1");
    expect(raw.integrity.algorithm).toBe("SHA-256");
    expect(raw.integrity.digestHex).toMatch(
      /^[0-9a-f]{64}$/,
    );
  });

  it("rejects a tampered envelope", async () => {
    const audit = quickAudit();
    const envelope = await buildAuditEnvelope(audit);

    (
      envelope.record as typeof audit
    ).input.fractions = 6;

    await expect(
      parseAuditDocument(
        JSON.stringify(envelope),
      ),
    ).rejects.toThrow(/integrity check failed/i);
  });

  it("accepts an old raw schema 1.0 audit as legacy-unverified", async () => {
    const audit = {
      ...quickAudit(),
      schemaVersion: "1.0",
    };
    const parsed = await parseAuditDocument(
      JSON.stringify(audit),
    );

    expect(parsed.integrityStatus).toBe(
      "legacy-unverified",
    );
    expect(parsed.record).toEqual(audit);
  });

  it("rejects unsupported audit schema versions", async () => {
    const audit = {
      ...quickAudit(),
      schemaVersion: "9.9",
    };

    await expect(
      parseAuditDocument(JSON.stringify(audit)),
    ).rejects.toThrow(/unsupported audit schema version/i);
  });
});
