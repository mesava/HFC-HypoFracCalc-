import { describe, expect, it } from "vitest";
import { bedGy, eqdGy } from "../src/core/lq.js";
import fixtureJson from "./fixtures/biorrt_hfc_lq_parity_v0_1.json?raw";

interface GoldenCase {
  id: string;
  fractions: number;
  total_dose_gy: number;
  alpha_beta_gy: number;
  reference_fraction_gy: number;
  expected_bed_gy: number;
  expected_eqd_gy: number;
}

interface GoldenDataset {
  schema_version: string;
  tolerance_abs_gy: number;
  cases: GoldenCase[];
}

const data = JSON.parse(fixtureJson) as GoldenDataset;

describe("BioRT ↔ HFC LQ interoperability v0.1", () => {
  it("keeps the shared evidence-neutral numerical contract", () => {
    expect(data.schema_version).toBe("biorrt-hfc-lq-parity/0.1");
    expect(data.cases).toHaveLength(5);
    expect(new Set(data.cases.map((c) => c.id)).size).toBe(5);
    expect(data.tolerance_abs_gy).toBe(1e-10);
  });

  it.each(data.cases)(
    "$id: reproduces BED and EQD2 independently of BioRT C#",
    (c) => {
      const schedule = {
        fractions: c.fractions,
        dosePerFractionGy: c.total_dose_gy / c.fractions,
      };

      const bed = bedGy(schedule, c.alpha_beta_gy);
      const eqd = eqdGy(
        schedule,
        c.alpha_beta_gy,
        c.reference_fraction_gy,
      );

      expect(
        Math.abs(bed - c.expected_bed_gy),
      ).toBeLessThanOrEqual(data.tolerance_abs_gy);

      expect(
        Math.abs(eqd - c.expected_eqd_gy),
      ).toBeLessThanOrEqual(data.tolerance_abs_gy);
    },
  );
});
