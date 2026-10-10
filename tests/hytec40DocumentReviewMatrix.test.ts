import { describe, expect, it } from "vitest";
import sourceJson from "../docs/LITERATURE_MASTER_INVENTORY.json?raw";
import sourceMatrix from "../docs/HYTEC_P2_COMPLETE_40_DOCUMENT_REVIEW_MATRIX_2026-10.csv?raw";

interface InventoryRow {
  original_filename: string;
  type: string;
  doi: string | null;
}
interface Inventory {
  items: InventoryRow[];
}

const inventory = JSON.parse(sourceJson) as Inventory;
const entries = inventory.items.filter(x => x.original_filename.startsWith("HyTEC_"));

function decodeCsv(line: string): string[] {
  const fields: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    if (c === '"') {
      if (quoted && line[i + 1] === '"') {
        field += '"';
        ++i;
      } else {
        quoted = !quoted;
      }
    } else if (c === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += c;
    }
  }
  if (quoted) throw new Error("Unclosed CSV quote");
  fields.push(field);
  return fields;
}

const lines = sourceMatrix.trimEnd().split(/\r?\n/);
const keys = decodeCsv(lines[0]!);
const records = lines.slice(1).map((line, index) => {
  const values = decodeCsv(line);
  if (values.length !== keys.length) {
    throw new Error(`Source review matrix row ${index + 2} has invalid columns`);
  }
  return Object.fromEntries(keys.map((k, i) => [k, values[i]!])) as Record<string, string>;
});

function countBy<T>(values: readonly T[], key: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) {
    const k = key(value);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}

describe("HyTEC P2 40-original-document review matrix provenance", () => {
  it("covers precisely the 20 core, 15 supplements and 5 letters inventoried by P1", () => {
    expect(entries).toHaveLength(40);
    expect(records).toHaveLength(40);
    expect(new Set(records.map(x => x.original_filename)).size).toBe(40);
    expect(records.map(x => x.original_filename).sort())
      .toEqual(entries.map(x => x.original_filename).sort());
    expect(countBy(records, x => x.document_kind!)).toEqual({
      "primary-publication": 20,
      supplement: 15,
      "scientific-letter": 5,
    });
  });

  it("does not misrepresent preliminary text/figure/source-model work as complete scientific QA", () => {
    for (const r of records) {
      expect(r.all_pages_figures_tables_verified).toBe("NO");
      expect(r.all_source_model_CI_independently_reproduced)
        .toBe("NO_FULL_INDEPENDENT_MODEL_CI_QA");
      expect(r.uploaded_original_SHA256_verified).toBe("NO");
      expect(r.extracted_text_screening).toMatch(
        /first_page_plus_selected_relevant_material|entire_extracted_text_screened_not_all_visual/,
      );
      expect(r.review_note_file).toMatch(/\.md$/);
    }
  });

  it("keeps bibliographic linkage and missing-letter DOI explicit", () => {
    const lookup = new Map(entries.map(r => [r.original_filename, r]));
    for (const row of records) {
      const source = lookup.get(row.original_filename!);
      expect(source).toBeDefined();
      expect(row.doi).toBe(source!.doi ?? "not_identified_in_inventory");
      expect(row.hytec_series_id).toMatch(/^HyTEC_\d\d$/);
    }
  });
});
