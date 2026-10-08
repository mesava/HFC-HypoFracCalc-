import { describe, expect, it } from "vitest";
import { dosePerFractionForTargetEqdGy, eqdGy } from "../src/core/lq.js";
import { alphaBetaEstimates, hytecClinicalConstraints, hytecOutcomeModels, reirradiationGuidanceSets } from "../src/data/evidence/v0.1/index.js";

/**
 * Independent published-source regression anchors. These are **selected** source
 * table values, not a full clinical commissioning or a blanket data validation.
 *
 * FAST-Forward 2026 corrected supplementary appendix (24 Aug 2026), Table D5;
 * Vogelius & Bentzen 2020, Results;
 * HyTEC Milano optic pathways 2021, Abstract;
 * HyTEC Sahgal spinal cord 2021, Abstract;
 * HyTEC Vargo H&N 2021, Table 4;
 * HyTEC Mahadevan pancreas 2021, Abstract/section 8;
 * Batyan et al., 2023, section 3 examples.
 */
const estimate = (id: string) => {
  const item = alphaBetaEstimates.find((entry) => entry.id === id);
  expect(item, `missing α/β record ${id}`).toBeDefined();
  return item!;
};

describe("Uploaded primary literature: reproducible checks", () => {
  it("preserves Vogelius and Bentzen pooled prostate value AND interval", () => {
    expect(estimate("ab-prostate-biochemical-control-vb2020")).toMatchObject({
      valueGy: 1.6,
      ci95: { low: 1.3, high: 2.0 },
    });
  });

  it("matches corrected FAST-Forward 2026 Table D5 endpoints", () => {
    expect(estimate("ab-breast-ibr-fastforward2026-adjusted")).toMatchObject({
      valueGy: 3.3, ci95: { low: 1.9, high: 4.9 },
    });
    expect(estimate("ab-breast-ibr-fastforward2026-unadjusted")).toMatchObject({
      valueGy: 3.4, ci95: { low: 1.6, high: 5.2 },
    });
    expect(estimate("ab-breast-chestwall-any-ae-fastforward2026")).toMatchObject({
      valueGy: 2.1, ci95: { low: 1.6, high: 2.6 },
    });
  });

  it("preserves the HyTEC optic-pathway 1/3/5-fraction limits and no prior RT", () => {
    for (const [n, dose] of [[1, 10], [3, 20], [5, 25]]) {
      const found = hytecClinicalConstraints.find(
        x => x.sourceId === "milano-2021-hytec-optic" && x.fractionation?.fractions === n,
      );
      expect(found?.value).toBe(dose);
      expect(found?.metric.kind).toBe("Dmax");
      expect(found?.priorRadiotherapy).toBe("none");
    }
  });

  it("does not mistake Sahgal lower-risk associated factors for tissue recovery", () => {
    const row = reirradiationGuidanceSets.find(
      x => x.id === "hytec-spinal-cord-reirradiation-lower-risk-factors",
    );
    expect(row?.alphaBetaGy).toBe(2);
    expect(row?.requiredStructure).toBe("thecal-sac");
    expect(row?.evidenceMeaning).toBe("lower-risk-associated-factors");
    expect(row?.criteria.map(x => [x.quantity, x.limitValue])).toEqual([
      ["cumulative-eqd2", 70],
      ["current-eqd2", 25],
      ["current-to-cumulative-ratio", 0.5],
      ["interval-months", 5],
    ]);
  });

  it("preserves source 5-fraction-equivalent D50 for HN recurrence", () => {
    const model = hytecOutcomeModels.find(x => x.id === "hytec-hn-reirradiation-local-control")!;
    for (const [id, gy, period] of [
      ["hn-rert-2y-d50-45p1gy5eq", 45.1, "2 years"],
      ["hn-rert-3y-d50-49p8gy5eq", 49.8, "3 years"],
    ] as const) {
      const point = model.points.find(x => x.id === id);
      expect(point?.probability).toBe(0.5);
      expect(point?.followUp).toBe(period);
      expect(point?.dose.schedule).toBeUndefined();
      expect(point?.dose.equivalentFractionation).toEqual({
        fractions: 5, totalDoseGy: gy, alphaBetaGy: 10,
      });
    }
  });

  it("preserves pancreas resection-specific local-control probabilities", () => {
    const model = hytecOutcomeModels.find(x => x.id === "hytec-pancreas-1y-local-control")!;
    const a = model.points.find(x => x.id === "pancreas-unresected-33gy5fx-77lc");
    const b = model.points.find(x => x.id === "pancreas-r0-33gy5fx-over90lc");
    expect(a?.probability).toBe(0.77);
    expect(a?.dose.equivalentFractionation?.totalDoseGy).toBe(28.2);
    expect(b?.probability).toBe(0.90);
    expect(b?.probabilityRelation).toBe(">");
  });

  it("reproduces published 30x2 to 18 fractions LQ isoeffect examples", () => {
    // Published examples from section 3.1; OTT is explicitly held fixed.
    expect(dosePerFractionForTargetEqdGy(60, 18, 3)).toBeCloseTo(2.85, 2);
    expect(dosePerFractionForTargetEqdGy(60, 18, 10)).toBeCloseTo(3.06, 2);
  });

  it("reproduces published compensation after Wednesday missed fraction", () => {
    // 5 x 5 Gy at α/β 10; first two 5 Gy given, one omitted, two left.
    const target = eqdGy({ fractions: 5, dosePerFractionGy: 5 }, 10);
    const delivered = eqdGy({ fractions: 2, dosePerFractionGy: 5 }, 10);
    expect(dosePerFractionForTargetEqdGy(target - delivered, 2, 10)).toBeCloseTo(6.73, 2);
  });

  it("reproduces a past delivered-dose error from the published example", () => {
    // 33x2 Gy intended; first 20 fractions actually 1.8 Gy; 13 remain.
    const planned = eqdGy({ fractions: 33, dosePerFractionGy: 2 }, 10);
    const delivered = eqdGy({ fractions: 20, dosePerFractionGy: 1.8 }, 10);
    expect(planned).toBe(66);
    expect(delivered).toBeCloseTo(35.4, 9);
    expect(planned - delivered).toBeCloseTo(30.6, 9);
    expect(dosePerFractionForTargetEqdGy(planned - delivered, 13, 10))
      .toBeCloseTo(2.3, 1);
  });

  it.each([
    ["ab-rectum-bleeding-g1-brand2021", 1.6, 0.9, 2.5],
    ["ab-rectum-bleeding-g2-brand2021", 1.7, 0.7, 3],
    ["ab-rectum-frequency-g1-brand2021", 2.3, 0.9, 5.3],
    ["ab-rectum-frequency-g2-brand2021", 2.7, 0.9, 8.5],
    ["ab-rectum-pain-g1-brand2021", 3.6, 0, 839.6],
    ["ab-rectum-proctitis-g1-brand2021", 2.7, 1.5, 5.4],
    ["ab-rectum-proctitis-g2-brand2021", 2.7, 1.3, 15.1],
    ["ab-rectum-sphincter-g1-brand2021", 3.1, 1.4, 9.1],
    ["ab-rectum-stricture-ulcer-g1-brand2021", 2.5, 0.9, 8.2],
    ["ab-gu-dysuria-g1-brand2023", 2, 1.2, 3.2],
    ["ab-gu-dysuria-g2-brand2023", 1.6, 0.1, 36],
    ["ab-gu-hematuria-g1-brand2023", 0.9, 0.1, 2.2],
    ["ab-gu-hematuria-g2-brand2023", 0.6, 0.1, 1.7],
    ["ab-gu-incontinence-g1-brand2023", 1, 0.1, 17.6],
    ["ab-gu-incontinence-g2-brand2023", 1.5, 0.1, 6.2],
    ["ab-gu-reduced-flow-g1-brand2023", 1.9, 0.1, 424.6],
    ["ab-gu-reduced-flow-g2-brand2023", 0.7, 0.1, 991.9],
    ["ab-gu-frequency-g1-brand2023", 1.9, 0.1, 997.8],
    ["ab-gu-frequency-g2-brand2023", 3.3, 0.1, 996],
  ])("matches Brand CHHiP source Table 3/Table 2 for %s", (id, value, ciLow, ciHigh) => {
    // Rectal: Brand 2021 Table 3 LKB-EQD2 (all patients, free α/β).
    // GU: Brand 2022 online / 2023 print Table 2 LKB-EQD2 (all patients).
    const record = estimate(id as string);
    expect(record.valueGy).toBe(value);
    expect(record.ci95?.low).toBe(ciLow);
    expect(record.ci95?.high).toBe(ciHigh);
  });
});
