import { describe, expect, it } from "vitest";
import { alphaBetaEstimates } from "../src/data/evidence/v0.1/index.js";
import type { AlphaBetaEstimate } from "../src/domain/evidence.js";

/**
 * P3 scientific source audit. ORIGINAL USER-SUPPLIED primary papers:
 *
 * Brand et al. 2021, CHHiP late RECTAL outcomes, IJROBP 110:596-608,
 * "Brand_2021_IJROBP_rectal_alpha-beta.pdf" PDF p8 Table 3,
 * p9 Table 4; DOCX supplement Appendix A/E3 for endpoint definitions.
 *
 * Brand et al. 2023 (online 2022), CHHiP late GU outcomes,
 * IJROBP 115:327-336, "Brand_2022_IJROBP_GU_alpha-beta.pdf",
 * PDF p6 Table 2.
 *
 * These are extracted published point estimates and bootstrap CIs,
 * not independent bootstrapped model refits, shared organ constants or
 * validated NTCP predictions. No patient-level data are available.
 */
type Case = readonly [id: string, valueGy: number, low: number, high: number];
const rectal: readonly Case[] = [
  ["ab-rectum-bleeding-g1-brand2021", 1.6, 0.9, 2.5],
  ["ab-rectum-bleeding-g2-brand2021", 1.7, 0.7, 3.0],
  ["ab-rectum-frequency-g1-brand2021", 2.3, 0.9, 5.3],
  ["ab-rectum-frequency-g2-brand2021", 2.7, 0.9, 8.5],
  ["ab-rectum-pain-g1-brand2021", 3.6, 0.0, 839.6],
  ["ab-rectum-proctitis-g1-brand2021", 2.7, 1.5, 5.4],
  ["ab-rectum-proctitis-g2-brand2021", 2.7, 1.3, 15.1],
  ["ab-rectum-sphincter-g1-brand2021", 3.1, 1.4, 9.1],
  ["ab-rectum-stricture-ulcer-g1-brand2021", 2.5, 0.9, 8.2],
];
const gu: readonly Case[] = [
  ["ab-gu-dysuria-g1-brand2023", 2.0, 1.2, 3.2],
  ["ab-gu-dysuria-g2-brand2023", 1.6, 0.1, 36.0],
  ["ab-gu-hematuria-g1-brand2023", 0.9, 0.1, 2.2],
  ["ab-gu-hematuria-g2-brand2023", 0.6, 0.1, 1.7],
  ["ab-gu-incontinence-g1-brand2023", 1.0, 0.1, 17.6],
  ["ab-gu-incontinence-g2-brand2023", 1.5, 0.1, 6.2],
  ["ab-gu-reduced-flow-g1-brand2023", 1.9, 0.1, 424.6],
  ["ab-gu-reduced-flow-g2-brand2023", 0.7, 0.1, 991.9],
  ["ab-gu-frequency-g1-brand2023", 1.9, 0.1, 997.8],
  ["ab-gu-frequency-g2-brand2023", 3.3, 0.1, 996.0],
];

describe("P3 Brand CHHiP endpoint-specific alpha/beta primary-paper audit", () => {
  it("matches all 9 original rectal LKB-EQD2 free-fitted alpha/beta + 95% bootstrap CIs", () => {
    const actual: AlphaBetaEstimate[] = alphaBetaEstimates.filter(
      e => e.sourceId === "brand-2021-chhip-rectal",
    );
    expect(actual).toHaveLength(9);
    expect(new Set(rectal.map(r => r[0])).size).toBe(9);
    for (const [id, value, low, high] of rectal) {
      const row = actual.find(e => e.id === id);
      expect(row, id).toBeDefined();
      expect(row!.valueGy, id).toBe(value);
      expect(row!.ci95, id).toEqual({ level: 0.95, low, high });
      expect(row!.parameter).toBe("alpha-beta");
      expect(row!.applicability?.fractionCountRange).toEqual({
        min: 19, max: 37,
      });
    }
  });

  it("matches all 10 GU LKB-EQD2 Table 2 estimates and percentile intervals", () => {
    const actual: AlphaBetaEstimate[] = alphaBetaEstimates.filter(
      e => e.sourceId === "brand-2023-chhip-gu",
    );
    expect(actual).toHaveLength(10);
    expect(new Set(gu.map(r => r[0])).size).toBe(10);
    for (const [id, value, low, high] of gu) {
      const row = actual.find(e => e.id === id);
      expect(row, id).toBeDefined();
      expect(row!.valueGy, id).toBe(value);
      expect(row!.ci95, id).toEqual({ level: 0.95, low, high });
      expect(row!.parameter).toBe("alpha-beta");
      expect(row!.applicability?.fractionCountRange).toEqual({
        min: 19, max: 37,
      });
    }
  });

  it("restricts automatic choice to one stronger rectal and three better-supported GU outcomes", () => {
    const rectalAuto = alphaBetaEstimates
      .filter(e => e.sourceId === "brand-2021-chhip-rectal" && e.defaultEligible)
      .map(e => e.id);
    expect(rectalAuto).toEqual(["ab-rectum-bleeding-g1-brand2021"]);
    const guAuto = alphaBetaEstimates
      .filter(e => e.sourceId === "brand-2023-chhip-gu" && e.defaultEligible)
      .map(e => e.id);
    expect(guAuto).toEqual([
      "ab-gu-dysuria-g1-brand2023",
      "ab-gu-hematuria-g1-brand2023",
      "ab-gu-hematuria-g2-brand2023",
    ]);
    // Source statistics:
    // Rectal G1 bleeding a/b=1.6 differs from a fixed 4.8 Gy
    // comparison (multiplicity-adjusted p=.00032).
    // GU corrected versus uncorrected fits: dysuria G1 p=.0046,
    // haematuria G1 p=.034 and G2 p=.015.
    expect(alphaBetaEstimates.find(e =>
      e.id === "ab-rectum-bleeding-g1-brand2021")?.supportReason)
      .toMatch(/4\.8 Gy/i);
  });

  it("does not accept extreme confidence intervals as reliable tissue coefficients", () => {
    for (const id of [
      "ab-rectum-pain-g1-brand2021",
      "ab-gu-reduced-flow-g1-brand2023",
      "ab-gu-reduced-flow-g2-brand2023",
      "ab-gu-frequency-g1-brand2023",
      "ab-gu-frequency-g2-brand2023",
    ]) {
      const e = alphaBetaEstimates.find(x => x.id === id)!;
      expect(e.defaultEligible, id).toBe(false);
      expect(e.ci95!.high - e.ci95!.low, id).toBeGreaterThan(100);
    }
    const bowelPain = alphaBetaEstimates.find(
      e => e.id === "ab-rectum-pain-g1-brand2021",
    )!;
    expect(bowelPain.support).toBe("poor-fit");
    expect(bowelPain.ci95?.low).toBe(0.0);
  });

  it("preserves distinct clinical endpoint definitions and does not promote source cohort alpha/beta to an OAR constant", () => {
    for (const row of alphaBetaEstimates.filter(e =>
      e.sourceId === "brand-2021-chhip-rectal" ||
      e.sourceId === "brand-2023-chhip-gu",
    )) {
      expect(row.applicability?.population).toMatch(/CHHiP/i);
      expect(row.applicability?.technique).toContain("IMRT");
      expect(row.endpointId).toBeTruthy();
      expect(row.applicability?.priorRadiotherapy).toBe("none");
    }
    expect(rectal.map(x => x[1])).not.toEqual(gu.map(x => x[1]));
  });
});
