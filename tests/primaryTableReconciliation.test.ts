import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { alphaBetaEstimates } from "../src/data/evidence/v0.1/alphaBeta.js";
import type { AlphaBetaEstimate } from "../src/domain/evidence.js";

const file = "docs/audit/2026-10-alpha-beta-primary-table-reconciliation.csv";
const lines = readFileSync(file, "utf8").trim().split(/\r?\n/);
const headers = lines[0]!.slice(1, -1).split('","');
const rows = lines.slice(1).map((line) => {
  const fields = line.slice(1, -1).split('","');
  return Object.fromEntries(headers.map((key, index) => [key, fields[index]]));
});

describe("Primary-table reconciled alpha/beta values", () => {
  it("contains the 22 source-anchored table rows", () => {
    expect(rows).toHaveLength(22);
    expect(new Set(rows.map((row) => row.record_id)).size).toBe(22);
    expect(rows.every((row) => row.result === "MATCH")).toBe(true);
  });

  it.each(rows)("retains original alpha/beta and CI for $record_id", (row) => {
    const found: AlphaBetaEstimate | undefined = alphaBetaEstimates.find((record) => record.id === row.record_id);
    expect(found, row.record_id).toBeDefined();
    expect(found?.valueGy).toBe(Number(row.source_alpha_beta_Gy));
    expect(found?.ci95?.low).toBe(Number(row.source_CI95_lo_Gy));
    expect(found?.ci95?.high).toBe(Number(row.source_CI95_hi_Gy));
  });
});
