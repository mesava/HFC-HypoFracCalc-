import { describe, expect, it } from "vitest";
import { alphaBetaEstimates } from "../src/data/evidence/v0.1/alphaBeta.js";

function estimate(id: string) {
  const record = alphaBetaEstimates.find((item) => item.id === id);
  expect(record, `Missing evidence record: ${id}`).toBeTruthy();
  return record!;
}

describe("Evidence validation batch 1", () => {
  it("does not auto-select weakly supported CHHiP rectal estimates", () => {
    const ids = [
      "ab-rectum-bleeding-g2-brand2021",
      "ab-rectum-frequency-g1-brand2021",
      "ab-rectum-frequency-g2-brand2021",
      "ab-rectum-proctitis-g1-brand2021",
      "ab-rectum-proctitis-g2-brand2021",
      "ab-rectum-sphincter-g1-brand2021",
      "ab-rectum-stricture-ulcer-g1-brand2021",
    ];

    for (const id of ids) {
      expect(estimate(id).defaultEligible).toBe(false);
    }
  });

  it("keeps only the supported CHHiP GU fractionation-sensitive endpoints automatic", () => {
    const supported = [
      "ab-gu-dysuria-g1-brand2023",
      "ab-gu-hematuria-g1-brand2023",
      "ab-gu-hematuria-g2-brand2023",
    ];

    for (const id of supported) {
      const record = estimate(id);
      expect(record.defaultEligible).toBe(true);
      expect(record.support).toBe("supported");
    }

    const nonAutomatic = [
      "ab-gu-dysuria-g2-brand2023",
      "ab-gu-incontinence-g1-brand2023",
      "ab-gu-incontinence-g2-brand2023",
      "ab-gu-reduced-flow-g1-brand2023",
      "ab-gu-reduced-flow-g2-brand2023",
      "ab-gu-frequency-g1-brand2023",
      "ab-gu-frequency-g2-brand2023",
    ];

    for (const id of nonAutomatic) {
      expect(estimate(id).defaultEligible).toBe(false);
    }
  });

  it("does not auto-select FAST endpoints with insufficient uncertainty support", () => {
    expect(estimate("ab-breast-induration-fast2020").defaultEligible).toBe(false);
    expect(estimate("ab-breast-edema-fast2020").defaultEligible).toBe(false);
  });

  it("retains the validated prostate pooled estimate as automatic with its published CI", () => {
    const record = estimate("ab-prostate-biochemical-control-vb2020");
    expect(record.valueGy).toBe(1.6);
    expect(record.ci95).toEqual({ level: 0.95, low: 1.3, high: 2.0 });
    expect(record.defaultEligible).toBe(true);
  });
});
