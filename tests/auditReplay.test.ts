import { describe, expect, it } from "vitest";
import {
  buildQuickEqdAuditRecord,
} from "../src/audit/quickEqdAudit.js";
import {
  buildCompareRegimensAuditRecord,
} from "../src/audit/compareRegimensAudit.js";
import {
  serializeAuditEnvelope,
} from "../src/audit/envelope.js";
import {
  inspectAuditDocument,
} from "../src/audit/replay.js";
import {
  calculateEvidenceLq,
} from "../src/workflows/evidenceLq.js";
import {
  compareRegimens,
} from "../src/workflows/compareRegimens.js";

const timestamp = "2026-10-07T05:30:00.000Z";

function quickAudit() {
  return buildQuickEqdAuditRecord(
    timestamp,
    calculateEvidenceLq(
      "prostate-biochemical-control",
      {
        fractions: 5,
        dosePerFractionGy: 7.25,
      },
    ),
  );
}

function compareAudit() {
  const result = compareRegimens(
    [
      {
        id: "r1",
        label: "Reference",
        schedule: {
          fractions: 30,
          dosePerFractionGy: 2,
        },
      },
      {
        id: "r2",
        label: "Test",
        schedule: {
          fractions: 20,
          dosePerFractionGy: 3,
        },
      },
    ],
    [
      {
        endpointId:
          "prostate-biochemical-control",
      },
      {
        endpointId:
          "rectum-bleeding-g1plus",
      },
    ],
    "r1",
  );

  return buildCompareRegimensAuditRecord(
    timestamp,
    result,
  );
}

describe("audit replay v0.1", () => {
  it("replays a verified Quick EQD envelope without drift", async () => {
    const inspected = await inspectAuditDocument(
      await serializeAuditEnvelope(quickAudit()),
    );

    expect(inspected.integrityStatus).toBe("verified");
    expect(inspected.replaySupported).toBe(true);
    expect(inspected.replay?.module).toBe("quick-eqd");
    expect(inspected.replay?.matches).toBe(true);
    expect(inspected.replay?.differences).toEqual([]);
  });

  it("replays a legacy raw Quick EQD record but marks integrity as unverified", async () => {
    const audit = quickAudit();
    const inspected = await inspectAuditDocument(
      JSON.stringify(audit),
    );

    expect(inspected.integrityStatus).toBe(
      "legacy-unverified",
    );
    expect(inspected.replay?.matches).toBe(true);
  });

  it("detects saved-result drift in an unverified legacy Quick EQD audit", async () => {
    const audit = quickAudit();
    audit.result.eqd2Gy += 1;

    const inspected = await inspectAuditDocument(
      JSON.stringify(audit),
    );

    expect(inspected.replay?.matches).toBe(false);
    expect(
      inspected.replay?.differences.some(
        (difference) =>
          difference.path === "result.eqd2Gy",
      ),
    ).toBe(true);
  });

  it("replays Compare Regimens with all endpoint and source provenance", async () => {
    const inspected = await inspectAuditDocument(
      await serializeAuditEnvelope(compareAudit()),
    );

    expect(inspected.integrityStatus).toBe("verified");
    expect(inspected.replay?.module).toBe(
      "compare-regimens",
    );
    expect(inspected.replay?.matches).toBe(true);
    expect(inspected.replay?.differences).toEqual([]);
  });

  it("rejects a module-spoofed audit whose payload does not match the declared module", async () => {
    const spoofed = {
      ...quickAudit(),
      module: "treatment-gap",
    };

    await expect(
      inspectAuditDocument(
        await serializeAuditEnvelope(spoofed),
      ),
    ).rejects.toThrow(
      /Treatment Gap audit record is missing required replay fields/i,
    );
  });
});
