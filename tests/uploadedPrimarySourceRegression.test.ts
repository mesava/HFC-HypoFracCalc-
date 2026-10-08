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

  it("tracks the published Redmond size-stratified one-year brain-metastasis TCP anchors", () => {
    // Redmond et al., HyTEC 2021, Abstract/Results. These are one-year,
    // NOT the distinct actuarial two-year values in the paper's Table 3.
    const m = hytecOutcomeModels.find(x => x.id === "hytec-brain-mets-1y-local-control")!;
    for (const [id, n, d, probability, relation] of [
      ["brain-mets-le20mm-18gy-1fx", 1, 18, 0.85, ">"],
      ["brain-mets-le20mm-24gy-1fx", 1, 24, 0.95, "≈"],
      ["brain-mets-21-30mm-18gy-1fx", 1, 18, 0.75, "≈"],
      ["brain-mets-31-40mm-15gy-1fx", 1, 15, 0.69, "≈"],
    ] as const) {
      const p = m.points.find(x => x.id === id);
      expect(p?.dose.schedule).toEqual({fractions:n,dosePerFractionGy:d});
      expect(p?.probability).toBe(probability);
      expect(p?.probabilityRelation).toBe(relation);
      expect(p?.followUp).toBe("1 year");
    }
  });

  it("preserves Soltys HyTEC vestibular LQ TCP predictions and the below-11-Gy extrapolation warning", () => {
    // Soltys et al., HyTEC 2021, Abstract/Results and section 8.
    // At <11 Gy/1fx, no analyzable clinical dose-response data supported the fit.
    // The source reports LQ-L as a distinct fitted response model, not interchangeable with LQ.
    const m = hytecOutcomeModels.find(x => x.id === "hytec-vestibular-schwannoma-3to5y-tcp")!;
    for (const [id, probability] of [
      ["vs-10gy-1fx", 0.85],
      ["vs-11gy-1fx", 0.884],
      ["vs-12gy-1fx", 0.912],
      ["vs-13gy-1fx", 0.935],
      ["vs-18gy-3fx", 0.936],
      ["vs-25gy-5fx", 0.972],
    ] as const) {
      const p = m.points.find(x => x.id === id);
      expect(p?.probability).toBe(probability);
      expect(p?.followUp).toBe("3–5 years");
    }
    const low = m.points.find(x => x.id === "vs-10gy-1fx");
    expect(low?.extrapolated).toBe(true);
    expect(low?.notes?.join(" ")).toMatch(/below 11 Gy/);
    expect(m.points.find(x => x.id === "vs-11gy-1fx")?.extrapolated).not.toBe(true);
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

  it("reproduces Soltys spine pooled Supplement Table 1 logistic TCP on BED6 3-fraction equivalent axis", () => {
    // HyTEC 09 Soltys 2021, supplementary Table 1: n=2606, alpha/beta=6 Gy,
    // D50=19.44 Gy (95% CI 18.07–20.53); g50=0.8140 (0.6594–0.9741).
    // Source equation: TCP=exp(z)/(1+exp(z)), z=4*g50*(D3eq/D50-1).
    // These are rounded MODEL estimates, not eight independently observed outcomes.
    const pooledTcp = (fractions: number, dosePerFractionGy: number) => {
      const ab = 6;
      const bed = fractions * dosePerFractionGy * (1 + dosePerFractionGy / ab);
      const x = 3 * ab;
      const d3eq = (Math.sqrt(x * x + 4 * x * bed) - x) / 2;
      const z = 4 * 0.8140 * (d3eq / 19.44 - 1);
      return 1 / (1 + Math.exp(-z));
    };
    const model = hytecOutcomeModels.find(x => x.id === "hytec-spinal-mets-2y-tcp")!;
    for (const [id, n, d, expected] of [
      ["spine-18gy-1fx", 1, 18, 0.8103],
      ["spine-20gy-1fx", 1, 20, 0.8830],
      ["spine-24gy-1fx", 1, 24, 0.9595],
      ["spine-24gy-2fx", 2, 12, 0.8103],
      ["spine-27gy-3fx", 3, 9, 0.7801],
      ["spine-90tcp-28gy-2fx", 2, 14, 0.9060],
      ["spine-90tcp-33gy-3fx", 3, 11, 0.9065],
      ["spine-90tcp-40gy-5fx", 5, 8, 0.9060],
    ] as const) {
      const point = model.points.find(x => x.id === id)!;
      expect(point).toBeDefined();
      expect(point.dose.schedule).toEqual({fractions: n, dosePerFractionGy: d});
      expect(pooledTcp(n, d)).toBeCloseTo(expected, 3);
      expect(Math.abs(point.probability - pooledTcp(n, d))).toBeLessThan(0.02);
      expect(point.probabilityRelation).toBe("≈");
    }
    expect(model.points.find(x => x.id === "spine-90tcp-40gy-5fx")?.extrapolated).toBe(true);
  });

  it("keeps HyTEC brain V12/V20/V24 target-inclusive volume context explicit", () => {
    // Milano brain 2021, supplemental Figs E1–E3 compare different V12
    // volume definitions. HFC risk-point labels must not imply brain-minus-PTV.
    const brainIds = [
      "hytec-brain-v12-5cc-symptomatic-rn",
      "hytec-brain-v12-10cc-symptomatic-rn",
      "hytec-brain-v12-over15cc-symptomatic-rn",
      "hytec-brain-v20-3fx-any-necrosis-edema",
      "hytec-brain-v20-3fx-resection",
      "hytec-brain-v24-5fx-any-necrosis-edema",
      "hytec-brain-v24-5fx-resection",
    ];
    for (const id of brainIds) {
      const record = hytecClinicalConstraints.find(x => x.id === id)!;
      expect(record).toBeDefined();
      expect(record.guidanceKind).toBe("risk-point");
      expect(record.population).toMatch(/(includes target|plus target)/i);
    }
  });
});
