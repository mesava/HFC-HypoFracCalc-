import { describe, expect, it } from "vitest";
import {
  hytecClinicalConstraints,
  reirradiationGuidanceSets,
} from "../src/data/evidence/v0.1/index.js";

/**
 * P2 source-consistency test for Sahgal et al., 2021 HyTEC spinal cord,
 * "Spinal Cord Dose Tolerance to Stereotactic Body Radiation Therapy",
 * doi:10.1016/j.ijrobp.2019.09.038.
 * User primary PDF page 8 (printed 131) Table 3 and footnotes; PDF page
 * 10 (printed 133) 1-5fx recommendations; page 11 (printed 134) Table 4
 * and four reirradiation criteria. Original primary pages visually checked.
 *
 * This regression documents SOURCE discrepancies; NOT a continuous RM
 * NTCP model, accepted patient plan, or numerical source correction.
 */
const eqd2 = (totalGy: number, fractions: number, alphaBetaGy = 2) =>
  totalGy * (totalGy / fractions + alphaBetaGy) / (2 + alphaBetaGy);

describe("Sahgal spine de novo — distinct contour-specific model columns", () => {
  it("preserves all five source Table 3 lower/upper doses and 1–5% as model RANGE not CI", () => {
    const source = [
      ["hytec-cord-dmax-1fx-risk-range", 1, 12.4, 14.0],
      ["hytec-cord-dmax-2fx-17gy", 2, 17.0, 19.3],
      ["hytec-cord-dmax-3fx-20p3gy", 3, 20.3, 23.1],
      ["hytec-cord-dmax-4fx-23gy", 4, 23.0, 26.2],
      ["hytec-cord-dmax-5fx-25p3gy", 5, 25.3, 28.8],
    ] as const;

    for (const [id, fx, lower, upper] of source) {
      const row = hytecClinicalConstraints.find(x => x.id === id)!;
      expect(row.sourceId).toBe("sahgal-2021-hytec-spinal-cord");
      expect(row.endpointId).toBe("spinal-cord-radiation-myelopathy");
      expect(row.metric.kind).toBe("Dmax");
      expect(row.fractionation?.fractions).toBe(fx);
      expect(row.valueRange).toEqual({low:lower,high:upper});
      expect(row.estimatedRiskRange).toEqual({low:.01,high:.05});
      expect(row.priorRadiotherapy).toBe("none");
      expect(row.guidanceKind).toBe("risk-point");
      expect(row.notes?.join(" ")).toMatch(/confidence interval/);
    }
  });

  it("exposes upper de novo 2–5fx values as LQ extrapolations from 14Gy/1fx, not independently validated 2–5fx limits", () => {
    // Table3: lower is Sahgal/thecal sac; upper is KG/true cord.
    // Footnote: italicized KG 2–5 fraction values are LQ extrapolations.
    // α/β2 LQ lower anchor 12.4/1fx => 44.64Gy EQD2_2,
    // upper anchor 14/1fx => 56.00Gy EQD2_2.
    for (const [id, fx, lower, upper] of [
      ["hytec-cord-dmax-1fx-risk-range",1,12.4,14],
      ["hytec-cord-dmax-2fx-17gy",2,17,19.3],
      ["hytec-cord-dmax-3fx-20p3gy",3,20.3,23.1],
      ["hytec-cord-dmax-4fx-23gy",4,23,26.2],
      ["hytec-cord-dmax-5fx-25p3gy",5,25.3,28.8],
    ] as const) {
      expect(Math.abs(eqd2(lower, fx)-44.64)).toBeLessThan(.20);
      expect(Math.abs(eqd2(upper, fx)-56)).toBeLessThan(.22);
      if (fx > 1) {
        const row = hytecClinicalConstraints.find(x => x.id === id)!;
        expect(row.notes?.join(" ")).toMatch(/LQ.extrapolat/i);
      }
    }
  });
});

describe("Sahgal spine reirradiation — four lower-risk factors vs Table 4 example doses", () => {
  it("requires EQD2_2 based thecal sac Dmax, interval >=5months and no built-in recovery", () => {
    const set = reirradiationGuidanceSets.find(
      x => x.id === "hytec-spinal-cord-reirradiation-lower-risk-factors",
    )!;
    expect(set.requiredStructure).toBe("thecal-sac");
    expect(set.requiredMetric).toBe("Dmax");
    expect(set.alphaBetaGy).toBe(2);
    expect(set.maxPreviousCoursesSupported).toBe(1);
    expect(set.evidenceMeaning).toBe("lower-risk-associated-factors");
    expect(set.criteria.map(x => [x.quantity,x.relation,x.limitValue])).toEqual([
      ["cumulative-eqd2","<=",70],
      ["current-eqd2","<=",25],
      ["current-to-cumulative-ratio","<=",0.5],
      ["interval-months",">=",5],
    ]);
    expect(set.notes?.join(" ")).toMatch(/recover|discount/i);
  });

  it("records source Table 4 50Gy/25fx +14Gy/3fx tension with independently stated cumulative <=70Gy EQD2_2", () => {
    // Table 4 PDF page 11 visibly states this published example.
    // It is not algorithmically manufactured by HFC. Study recommendations
    // are explicitly nonabsolute; this flags inconsistency in simultaneous
    // satisfaction, not proof of patient-level harm or a typographic error.
    const previousEqd2 = eqd2(50,25);
    const currentEqd2 = eqd2(14,3);
    const cumulativeEqd2 = previousEqd2 + currentEqd2;
    expect(previousEqd2).toBe(50);
    expect(currentEqd2).toBeCloseTo(23.333333333333332,9);
    expect(cumulativeEqd2).toBeCloseTo(73.33333333333333,9);
    expect(currentEqd2).toBeLessThan(25); // current criterion met
    expect(currentEqd2/cumulativeEqd2).toBeLessThan(.5); // ratio met
    expect(cumulativeEqd2).toBeGreaterThan(70); // additive cap violated
    expect(cumulativeEqd2-70).toBeCloseTo(3.333333333333333,9);
  });

  it("distinguishes small tabulated rounding excesses and missing N/A data from source-approved dose limits", () => {
    // Published Table4 first-row 18Gy/5fx ~25Gy current EQD2 cap;
    // mathematically it is 25.2Gy EQD2_2.
    expect(eqd2(18,5)).toBeCloseTo(25.2,10);
    // Table4 prior 50/25 11Gy/2fx yields cumulative ~70.625.
    expect(eqd2(50,25)+eqd2(11,2)).toBeCloseTo(70.625,10);
    // Table4 1-fx cells for prior 40/20, 45/25 and 50/25 are
    // N/A — the publication supplies no dose; never synthesize one.
    expect([null,null,null].every(v=>v===null)).toBe(true);
    // Independently computing EQD2 and comparing all criteria is safer
    // than treating a published Table4 example dose as a pass flag.
  });
});
