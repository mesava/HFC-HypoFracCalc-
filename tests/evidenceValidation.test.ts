import { describe, expect, it } from "vitest";
import { alphaBetaEstimates } from "../src/data/evidence/v0.1/alphaBeta.js";
import { alphaBetaAdditionalEstimates } from "../src/data/evidence/v0.1/alphaBetaAdditional.js";
import { repairHalfTimeEstimates } from "../src/data/evidence/v0.1/repairHalfTime.js";
import { repopulationRateEstimates } from "../src/data/evidence/v0.1/repopulation.js";
import { getRepairHalfTimeEstimates } from "../src/evidence/repairRegistry.js";
import { getRepopulationEstimates } from "../src/evidence/repopulationRegistry.js";

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

  it("retains the historical broad HNSCC time model for replay but deprecates it for new selection", () => {
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


describe("Evidence validation batch 6 — time-effect primary sources", () => {
  it("stores mucosal repair as the primary 2-4 h range without inventing a point value", () => {
    const record = repairHalfTimeEstimates.find(
      (item) => item.id === "t12-oral-mucositis-bcr2025",
    );

    expect(record?.sourceId).toBe("bentzen-ruifrok-thames-1996-repair");
    expect(record?.rangeHours).toEqual({ low: 2, high: 4 });
    expect(record?.valueHours).toBeUndefined();
    expect(record?.defaultEligible).toBe(false);
  });

  it("preserves the primary tonsil time model as explicit-only", () => {
    const record = repopulationRateEstimates.find(
      (item) => item.id === "dprolif-hn-tonsil-bcr2025",
    );

    expect(record?.sourceId).toBe("withers-1995-tonsil-time");
    expect(record?.rateGyPerDay).toBe(0.73);
    expect(record?.kickOffDays).toBe(30);
    expect(record?.defaultEligible).toBe(false);
  });

  it("does not mislabel the Koukourakis time factor as stage-I NSCLC", () => {
    const record = repopulationRateEstimates.find(
      (item) => item.id === "dprolif-nsclc-bcr2025",
    );

    expect(record?.sourceId).toBe("koukourakis-1996-nsclc-time");
    expect(record?.endpointId).toBe("nsclc-local-control");
    expect(record?.rateGyPerDay).toBe(0.45);
    expect(record?.kickOffDays).toBeUndefined();
    expect(record?.defaultEligible).toBe(false);
  });

  it("keeps the two Hinata medulloblastoma Tk assumptions as distinct models", () => {
    const tk0 = repopulationRateEstimates.find(
      (item) => item.id === "dprolif-medulloblastoma-bcr2025",
    );
    const tk21 = repopulationRateEstimates.find(
      (item) => item.id === "dprolif-medulloblastoma-tk21-hinata2001",
    );

    expect(tk0?.sourceId).toBe("hinata-2001-medulloblastoma-time");
    expect(tk0?.rateGyPerDay).toBe(0.52);
    expect(tk0?.ci95).toEqual({ level: 0.95, low: 0.29, high: 0.75 });
    expect(tk0?.kickOffDays).toBe(0);

    expect(tk21?.rateGyPerDay).toBe(0.55);
    expect(tk21?.ci95).toEqual({ level: 0.95, low: 0.3, high: 0.8 });
    expect(tk21?.kickOffDays).toBe(21);
    expect(tk21?.defaultEligible).toBe(false);
  });

  it("does not misinterpret the Thames 52-day analysis cut point as prostate Tk", () => {
    const record = repopulationRateEstimates.find(
      (item) => item.id === "dprolif-prostate-bcr2025",
    );

    expect(record?.sourceId).toBe("thames-2010-prostate-time");
    expect(record?.rateGyPerDay).toBe(0.24);
    expect(record?.kickOffDays).toBeUndefined();
    expect(record?.kickOffNotes).toMatch(/52 days.*cut point/i);
    expect(record?.defaultEligible).toBe(false);
  });

  it("uses the primary START analysis for the breast time-effect estimate", () => {
    const record = repopulationRateEstimates.find(
      (item) => item.id === "dprolif-breast-bcr2025",
    );

    expect(record?.sourceId).toBe("haviland-2016-breast-time");
    expect(record?.rateGyPerDay).toBe(0.6);
    expect(record?.ci95).toEqual({ level: 0.95, low: 0.1, high: 1.18 });
    expect(record?.defaultEligible).toBe(false);
  });

  it("keeps the primary oesophageal pCR time-effect estimate explicit-only", () => {
    const record = repopulationRateEstimates.find(
      (item) => item.id === "dprolif-esophagus-pcr-geh2006",
    );

    expect(record?.sourceId).toBe("geh-2006-esophagus");
    expect(record?.rateGyPerDay).toBe(0.59);
    expect(record?.ci95).toEqual({ level: 0.95, low: 0.18, high: 0.99 });
    expect(record?.defaultEligible).toBe(false);
  });
});


describe("Evidence validation batch 7 — final time-effect triage", () => {
  it("retires secondary CNS repair bounds from active selection without deleting audit records", () => {
    const cord = repairHalfTimeEstimates.find(
      (record) => record.id === "t12-spinal-cord-myelopathy-bcr2025",
    );
    const temporal = repairHalfTimeEstimates.find(
      (record) => record.id === "t12-temporal-lobe-necrosis-bcr2025",
    );

    expect(cord?.status).toBe("deprecated");
    expect(cord?.support).toBe("poor-fit");
    expect(temporal?.status).toBe("deprecated");
    expect(temporal?.support).toBe("poor-fit");

    expect(
      getRepairHalfTimeEstimates("spinal-cord-radiation-myelopathy"),
    ).toEqual([]);
    expect(
      getRepairHalfTimeEstimates("temporal-lobe-necrosis"),
    ).toEqual([]);
  });

  it("replaces the broad 0.8/21 interpretation with a larynx-specific Roberts model", () => {
    const primary = repopulationRateEstimates.find(
      (record) => record.id === "dprolif-larynx-roberts1994",
    );
    const historical = repopulationRateEstimates.find(
      (record) => record.id === "dprolif-hn-various-bcr2025",
    );

    expect(primary?.endpointId).toBe("head-neck-larynx-tumour-control");
    expect(primary?.sourceId).toBe("roberts-1994-larynx-time");
    expect(primary?.rateGyPerDay).toBe(0.8);
    expect(primary?.ci95).toEqual({ level: 0.95, low: 0.5, high: 1.1 });
    expect(primary?.kickOffDays).toBe(21);
    expect(primary?.defaultEligible).toBe(false);

    expect(historical?.status).toBe("deprecated");
    expect(
      getRepopulationEstimates("head-neck-larynx-tumour-control").map(
        (record) => record.id,
      ),
    ).toContain("dprolif-larynx-roberts1994");
  });

  it("retires the untraceable BCR larynx 0.74 summary rather than silently changing its value", () => {
    const record = repopulationRateEstimates.find(
      (item) => item.id === "dprolif-hn-larynx-bcr2025",
    );

    expect(record?.rateGyPerDay).toBe(0.74);
    expect(record?.ci95).toEqual({ level: 0.95, low: 0.3, high: 1.2 });
    expect(record?.status).toBe("deprecated");
    expect(record?.support).toBe("poor-fit");
  });

  it("keeps the pooled HNSCC 0.64 estimate explicitly identified as modelled synthesis", () => {
    const record = repopulationRateEstimates.find(
      (item) => item.id === "dprolif-hn-various-alternative-bcr2025",
    );

    expect(record?.sourceId).toBe("hendry-1996-missed-days");
    expect(record?.rateGyPerDay).toBe(0.64);
    expect(record?.ci95).toEqual({ level: 0.95, low: 0.42, high: 0.86 });
    expect(record?.support).toBe("limited");
    expect(record?.defaultEligible).toBe(false);
  });

  it("does not label a derived pneumonitis SE interval as a source-reported 95% CI", () => {
    const record = repopulationRateEstimates.find(
      (item) => item.id === "dprolif-lung-pneumonitis-bentzen2000",
    );

    expect(record?.rateGyPerDay).toBe(0.54);
    expect(record?.ci95).toBeUndefined();
    expect(record?.defaultEligible).toBe(false);
  });

  it("retains only the primary prostate point estimate in machine-readable evidence", () => {
    const record = repopulationRateEstimates.find(
      (item) => item.id === "dprolif-prostate-bcr2025",
    );

    expect(record?.rateGyPerDay).toBe(0.24);
    expect(record?.ci95).toBeUndefined();
    expect(record?.kickOffDays).toBeUndefined();
    expect(record?.defaultEligible).toBe(false);
  });
});
