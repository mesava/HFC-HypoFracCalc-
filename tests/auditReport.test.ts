import { describe, expect, it } from "vitest";
import { buildPrintableAuditHtml } from "../src/audit/report.js";
import { buildQuickEqdAuditRecord } from "../src/audit/quickEqdAudit.js";
import { buildCompareRegimensAuditRecord } from "../src/audit/compareRegimensAudit.js";
import { calculateEvidenceLq } from "../src/workflows/evidenceLq.js";
import { compareRegimens } from "../src/workflows/compareRegimens.js";

const generatedAtIso = "2026-10-06T05:30:00.000Z";

describe("printable audit report", () => {
  it("renders a human-readable Quick EQD report", () => {
    const result = calculateEvidenceLq(
      "prostate-biochemical-control",
      {
        fractions: 5,
        dosePerFractionGy: 7.25,
      },
    );
    const audit = buildQuickEqdAuditRecord(
      generatedAtIso,
      result,
    );

    const html = buildPrintableAuditHtml(
      audit,
      "ru",
    );

    expect(html).toContain("Быстрый EQD");
    expect(html).toContain("EQD₂");
    expect(html).toContain("Печать / сохранить PDF");
    expect(html).toContain(audit.evidence.datasetVersion);
    expect(html).toContain("Источники");
  });

  it("escapes user-editable regimen labels before inserting them into HTML", () => {
    const comparison = compareRegimens(
      [
        {
          id: "r1",
          label: "<script>alert('x')</script>",
          schedule: {
            fractions: 30,
            dosePerFractionGy: 2,
          },
        },
        {
          id: "r2",
          label: "Safe",
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
      ],
      "r1",
    );

    const audit = buildCompareRegimensAuditRecord(
      generatedAtIso,
      comparison,
    );
    const html = buildPrintableAuditHtml(
      audit,
      "en",
    );

    expect(html).not.toContain(
      "<script>alert('x')</script>",
    );
    expect(html).toContain(
      "&lt;script&gt;alert(&#039;x&#039;)&lt;/script&gt;",
    );
  });

  it("includes print CSS for A4 output", () => {
    const result = calculateEvidenceLq(
      "prostate-biochemical-control",
      {
        fractions: 5,
        dosePerFractionGy: 7.25,
      },
    );
    const audit = buildQuickEqdAuditRecord(
      generatedAtIso,
      result,
    );

    const html = buildPrintableAuditHtml(
      audit,
      "en",
    );

    expect(html).toContain("@page { size: A4;");
    expect(html).toContain("@media print");
  });
});
