import { describe, expect, it } from "vitest";
import sourceInventoryRaw from "../docs/LITERATURE_MASTER_INVENTORY.json?raw";
import ledgerRaw from "../docs/HYTEC_40_SOURCE_TO_CODE_LEDGER_2026-10-15.csv?raw";
import shaRaw from "../docs/HYTEC_40_ORIGINAL_SHA256_VERIFIED_2026-10-15.csv?raw";
import numericLedgerRaw from "../docs/HYTEC_P2_RECORD_LEVEL_LEDGER_2026-10.csv?raw";
import {
  alphaBetaEstimates,
  evidenceManifest,
  hytecClinicalConstraints,
  hytecOutcomeModels,
  reirradiationGuidanceSets,
  sources,
} from "../src/data/evidence/v0.1/index.js";

/**
 * HyTEC 40-document ORIGINAL-source inventory, audited 2026-10-15.
 * The 73 numerical records include SIX independent Ohri 2012 NSCLC points.
 * The HyTEC subset is exactly 34 model-points + 29 OAR rows + 4 Sahgal
 * reirradiation criteria. No clinical commissioning or source re-fit implied.
 */
function csvRows(csv: string): Record<string, string>[] {
  const rows: string[][] = [];
  let values: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i]!;
    if (ch === '"') {
      if (quoted && csv[i + 1] === '"') {
        value += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && ch === ",") {
      values.push(value);
      value = "";
    } else if (!quoted && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && csv[i + 1] === "\n") i++;
      values.push(value);
      value = "";
      if (values.some(Boolean)) rows.push(values);
      values = [];
    } else value += ch;
  }
  if (value || values.length) {
    values.push(value);
    rows.push(values);
  }
  const [header, ...body] = rows;
  if (!header) throw Error("CSV is empty");
  return body.map((entry, i) => {
    if (entry.length !== header.length) {
      throw Error(`CSV line ${i + 2} has ${entry.length} fields; expected ${header.length}`);
    }
    return Object.fromEntries(header.map((key, j) => [key, entry[j]!]));
  });
}
const ledger = csvRows(ledgerRaw);
const hashes = csvRows(shaRaw);
const oldNumeric = csvRows(numericLedgerRaw);
const hytecInventory = (JSON.parse(sourceInventoryRaw) as {
  items: { original_filename: string; type: string; bytes: number }[];
}).items.filter(x => x.original_filename.startsWith("HyTEC_"));
const originals = ledger.filter(r => r.document_kind === "primary-publication");
const hytecSourceIds = new Set(originals.map(x => x.source_id));
const pointList = hytecOutcomeModels.flatMap(model =>
  model.points.map(point => ({ model, point })),
);
const hytecPoints = pointList.filter(p => hytecSourceIds.has(p.model.sourceId));
const externalPoints = pointList.filter(p => !hytecSourceIds.has(p.model.sourceId));
const ids = (s: string | undefined) => (s || "").split("|").filter(Boolean);

describe("HyTEC 40-source post-batch-07 audit — file provenance", () => {
  it("uniquely identifies exactly 20 primary, 15 supplements, and 5 letters", () => {
    expect(ledger).toHaveLength(40);
    expect(hytecInventory).toHaveLength(40);
    expect(new Set(ledger.map(x => x.original_filename_inventory)).size).toBe(40);
    expect(ledger.map(x => x.original_filename_inventory).sort())
      .toEqual(hytecInventory.map(x => x.original_filename).sort());
    expect(originals).toHaveLength(20);
    expect(ledger.filter(x => x.document_kind === "supplement")).toHaveLength(15);
    expect(ledger.filter(x => x.document_kind === "scientific-letter")).toHaveLength(5);
    expect(hytecSourceIds.size).toBe(20);
    expect(originals.every(r => sources.some(s => s.id === r.source_id)))
      .toBe(true);
  });

  it("has byte SHA256 for 40 unique originals, without claiming complete numerical source QA", () => {
    expect(hashes).toHaveLength(40);
    const byOriginal = new Map(hashes.map(x => [x.original_filename_inventory, x]));
    for (const row of ledger) {
      const sha = byOriginal.get(row.original_filename_inventory);
      expect(sha).toBeDefined();
      expect(row.file_original_sha256).toBe(sha!.sha256);
      expect(row.file_original_sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(row.sha256_status).toBe("VERIFIED_LOCAL_FILE_BYTES_2026-10-15");
      expect(row.original_uploaded_filename).toBe(sha!.original_uploaded_filename);
      expect(row.all_pages_figures_tables_verified).toBe("NO");
      expect(row.full_fit_CI_reproduced).toBe("NO");
      expect(row.clinical_commissioned).toBe("NO");
    }
    for (const file of hytecInventory) {
      const s = byOriginal.get(file.original_filename);
      expect(s).toBeDefined();
      expect(Number(s!.file_size_bytes)).toBe(file.bytes);
    }
  });
});

describe("HyTEC source-to-code inventory — actual current TypeScript data", () => {
  it("counts 8 HyTEC outcome models with 34 points, excluding 6 external Ohri 2012 points", () => {
    const inHytec = hytecOutcomeModels.filter(m => hytecSourceIds.has(m.sourceId));
    const outHytec = hytecOutcomeModels.filter(m => !hytecSourceIds.has(m.sourceId));
    expect(inHytec).toHaveLength(8);
    expect(hytecPoints).toHaveLength(34);
    expect(outHytec).toHaveLength(1);
    expect(outHytec[0]?.id).toBe("nsclc-stage-i-size-adjusted-2y-tcp");
    expect(outHytec[0]?.sourceId).toBe("ohri-2012-nsclc-size-tcp");
    expect(externalPoints).toHaveLength(6);
  });

  it("maps every primary model, point, OAR, and reirradiation criterion to the correct source", () => {
    for (const r of originals) {
      const model = hytecOutcomeModels.filter(m => m.sourceId === r.source_id);
      const sourcePoints = model.flatMap(m => m.points.map(p => p.id));
      const clinical = hytecClinicalConstraints.filter(c => c.sourceId === r.source_id);
      const reirr = reirradiationGuidanceSets
        .filter(g => g.sourceId === r.source_id)
        .flatMap(g => g.criteria.map(c => c.id));
      expect(ids(r.outcome_model_ids)).toEqual(model.map(m => m.id));
      expect(ids(r.point_ids)).toEqual(sourcePoints);
      expect(ids(r.constraint_ids)).toEqual(clinical.map(c => c.id));
      expect(ids(r.guidance_criterion_ids)).toEqual(reirr);
      expect(Number(r.number_hytec_outcome_points)).toBe(sourcePoints.length);
      expect(Number(r.number_hytec_constraints)).toBe(clinical.length);
      expect(Number(r.number_hytec_guidance_criteria)).toBe(reirr.length);
    }
    expect(hytecClinicalConstraints).toHaveLength(29);
    expect(reirradiationGuidanceSets.flatMap(g => g.criteria)).toHaveLength(4);
    const numericIds = [
      ...hytecPoints.map(x => x.point.id),
      ...hytecClinicalConstraints.map(x => x.id),
      ...reirradiationGuidanceSets.flatMap(g => g.criteria.map(x => x.id)),
      ...externalPoints.map(x => x.point.id),
    ];
    expect(numericIds).toHaveLength(73);
    expect(oldNumeric).toHaveLength(73);
    expect(new Set(numericIds)).toEqual(new Set(oldNumeric.map(x => x.id)));
  });

  it("does not mistake a fitted LQ model assumption for a universal endpoint alpha/beta", () => {
    expect(alphaBetaEstimates.filter(a => hytecSourceIds.has(a.sourceId))).toHaveLength(0);
    expect(ledger.filter(x => x.document_kind !== "primary-publication")
      .every(x => Number(x.number_hytec_outcome_points) === 0
        && Number(x.number_hytec_constraints) === 0
        && Number(x.number_hytec_guidance_criteria) === 0))
      .toBe(true);
    expect(evidenceManifest.releaseStatus).toBe("draft");
  });
});
