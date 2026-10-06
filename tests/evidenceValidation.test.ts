import { describe, expect, it } from "vitest";
import { alphaBetaEstimates } from "../src/data/evidence/v0.1/alphaBeta.js";
import { alphaBetaAdditionalEstimates } from "../src/data/evidence/v0.1/alphaBetaAdditional.js";
import { repairHalfTimeEstimates } from "../src/data/evidence/v0.1/repairHalfTime.js";
import { repopulationRateEstimates } from "../src/data/evidence/v0.1/repopulation.js";

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


describe("Evidence validation batch 2", () => {
  it("retains the primary CHART repair half-times with published confidence intervals", () => {
    const larynx = repairHalfTimeEstimates.find(
      (record) => record.id === "t12-laryngeal-edema-chart1999",
    );
    const skin = repairHalfTimeEstimates.find(
      (record) => record.id === "t12-skin-telangiectasia-chart1999",
    );
    const fibrosis = repairHalfTimeEstimates.find(
      (record) => record.id === "t12-subcutis-fibrosis-chart1999",
    );

    expect(larynx?.valueHours).toBe(4.9);
    expect(larynx?.ci95).toEqual({ level: 0.95, low: 3.2, high: 6.4 });
    expect(skin?.valueHours).toBe(3.8);
    expect(skin?.ci95).toEqual({ level: 0.95, low: 2.5, high: 4.6 });
    expect(fibrosis?.valueHours).toBe(4.4);
    expect(fibrosis?.ci95).toEqual({ level: 0.95, low: 3.8, high: 4.9 });
  });

  it("keeps CHART early-reaction Dprolif estimates non-automatic when Tk is not uniquely defined", () => {
    const mucosa = repopulationRateEstimates.find(
      (record) => record.id === "dprolif-mucosa-chart2001",
    );
    const skin = repopulationRateEstimates.find(
      (record) => record.id === "dprolif-skin-erythema-chart2001",
    );

    expect(mucosa?.basis).toBe("EQD2");
    expect(mucosa?.rateGyPerDay).toBe(0.8);
    expect(mucosa?.ci95).toEqual({ level: 0.95, low: 0.7, high: 1.1 });
    expect(mucosa?.defaultEligible).toBe(false);

    expect(skin?.rateGyPerDay).toBe(0.12);
    expect(skin?.ci95).toEqual({ level: 0.95, low: -0.12, high: 0.22 });
    expect(skin?.defaultEligible).toBe(false);
  });

  it("records the current HNSCC time model explicitly as EQD2-based rather than BED-based K", () => {
    const hn = repopulationRateEstimates.find(
      (record) => record.id === "dprolif-hn-various-bcr2025",
    );

    expect(hn?.basis).toBe("EQD2");
    expect(hn?.rateGyPerDay).toBe(0.8);
    expect(hn?.kickOffDays).toBe(21);
    expect(hn?.applicability?.notes?.join(" ")).toMatch(/K=0\.9 Gy BED\/day/);
    expect(hn?.applicability?.notes?.join(" ")).toMatch(/not numerically interchangeable/i);
  });
});


function additionalEstimate(id: string) {
  const record = alphaBetaAdditionalEstimates.find(
    (item) => item.id === id,
  );
  expect(record, `Missing additional evidence record: ${id}`).toBeTruthy();
  return record!;
}

describe("Evidence validation batch 4", () => {
  it("links validated skin endpoints to their primary clinical sources", () => {
    const erythema = additionalEstimate(
      "ab-skin-erythema-bcr2025",
    );
    const telangiectasia = additionalEstimate(
      "ab-skin-telangiectasia-bcr2025",
    );
    const fibrosis = additionalEstimate(
      "ab-subcutis-fibrosis-bcr2025",
    );

    expect(erythema.sourceId).toBe(
      "turesson-thames-1989-skin",
    );
    expect(erythema.valueGy).toBe(8.8);
    expect(erythema.ci95).toEqual({
      level: 0.95,
      low: 6.9,
      high: 11.6,
    });
    expect(erythema.defaultEligible).toBe(true);

    expect(telangiectasia.sourceId).toBe(
      "bentzen-turesson-thames-1990-telangiectasia",
    );
    expect(telangiectasia.valueGy).toBe(2.6);
    expect(telangiectasia.ci95).toEqual({
      level: 0.95,
      low: 2.2,
      high: 3.3,
    });
    expect(telangiectasia.defaultEligible).toBe(true);

    expect(fibrosis.sourceId).toBe(
      "bentzen-overgaard-1991-postmastectomy",
    );
    expect(fibrosis.valueGy).toBe(1.7);
    expect(fibrosis.ci95).toEqual({
      level: 0.95,
      low: 0.6,
      high: 2.6,
    });
    expect(fibrosis.defaultEligible).toBe(true);
  });

  it("does not auto-select limited or context-confounded historical estimates", () => {
    const ids = [
      "ab-bowel-stricture-perforation-bcr2025",
      "ab-bowel-various-late-dische1999",
      "ab-lung-pneumonitis-bentzen2000",
      "ab-lung-fibrosis-dubray1995",
      "ab-nsclc-stage-i-stuschke2010",
      "ab-esophagus-pcr-geh2006",
    ];

    for (const id of ids) {
      expect(
        additionalEstimate(id).defaultEligible,
      ).toBe(false);
    }
  });

  it("retains directly supported head-and-neck estimates as automatic with explicit endpoint scope", () => {
    const tumour = additionalEstimate(
      "ab-hn-tumour-control-stuschke1999",
    );
    const late = additionalEstimate(
      "ab-hn-late-effects-stuschke1999",
    );

    expect(tumour.valueGy).toBe(10.5);
    expect(tumour.ci95).toEqual({
      level: 0.95,
      low: 6.5,
      high: 29,
    });
    expect(tumour.defaultEligible).toBe(true);
    expect(tumour.support).toBe("supported");

    expect(late.valueGy).toBe(4);
    expect(late.ci95).toEqual({
      level: 0.95,
      low: 3.3,
      high: 5,
    });
    expect(late.defaultEligible).toBe(true);
    expect(late.support).toBe("supported");
  });

  it("stores the published Schultheiss cervical-cord confidence interval but keeps it non-automatic", () => {
    const cord = additionalEstimate(
      "ab-spinal-cord-myelopathy-schultheiss2008",
    );

    expect(cord.valueGy).toBe(0.87);
    expect(cord.ci95).toEqual({
      level: 0.95,
      low: 0.54,
      high: 1.19,
    });
    expect(cord.defaultEligible).toBe(false);
  });
});
