import { describe, expect, it } from "vitest";
import {
  alphaBetaEstimates,
  hytecClinicalConstraints,
  hytecOutcomeModels,
  hytecPublishedFitParameterReviews,
} from "../src/data/evidence/v0.1/index.js";
import { validateHytecPublishedFitParameterReviews } from "../src/evidence/hytecPublishedFitRegistry.js";
import type { HytecPublishedFitParameterReview } from "../src/domain/hytecPublishedFitParameters.js";

/**
 * Independent transcription check against UPLOADED originals:
 * Redmond supp. EA4 PDF pp8–9 (profile likelihood TD50/gamma CI;
 *   median-split Fisher p).
 * Milano primary Fig 5 PDF p7 / Fig 6A–B PDF p8 (profile likelihood
 *   Vx50/gamma CI and LR p; 68% score binomial figure error bars).
 * Source-fit reference ONLY; not confidence intervals of predicted risks.
 */
describe("P5 original HyTEC fitted-parameter confidence-interval scope", () => {
  it("retains precisely six source-only fits, valid marginal CI and no patient risk-band inputs", () => {
    expect(hytecPublishedFitParameterReviews).toHaveLength(6);
    expect(() => validateHytecPublishedFitParameterReviews()).not.toThrow();
    expect(new Set(hytecPublishedFitParameterReviews.map(f => f.id)).size).toBe(6);
    expect(hytecPublishedFitParameterReviews.every(f =>
      f.use === "research-reference-only" &&
      f.predictionBandStatus === "NOT_AVAILABLE_FROM_MARGINAL_PARAMETER_CI" &&
      f.parameterConfidenceMethod === "profile-likelihood")).toBe(true);
    expect(hytecOutcomeModels.filter(x =>
      ["redmond-2021-hytec-brain-mets-tcp", "milano-2021-hytec-brain"].includes(x.sourceId)))
      .toHaveLength(1);
    expect(hytecClinicalConstraints.filter(c => c.sourceId === "milano-2021-hytec-brain"))
      .toHaveLength(7);
    expect(alphaBetaEstimates.filter(a =>
      ["redmond-2021-hytec-brain-mets-tcp", "milano-2021-hytec-brain"].includes(a.sourceId)))
      .toHaveLength(0);
  });

  it("Redmond EA4 one-year LC has 3 different sample sizes, exact marginal CIs and distinct Fisher p", () => {
    const rows = hytecPublishedFitParameterReviews.filter(f => f.sourceId ===
      "redmond-2021-hytec-brain-mets-tcp");
    expect(rows).toHaveLength(3);
    const expected = [
      ["≤20 mm", 10106, 11.21, 10.43, 11.90, 0.9749, .86, 1.09, 4.69e-10],
      ["21–30 mm", 647, 12.44, 5.67, 14.63, 0.7617, .26, 1.27, .188],
      ["31–40 mm", 1028, 9.15, 4.75, 11.37, 0.4089, .20, .62, .006],
    ] as const;
    for (let i=0;i<rows.length;i++) {
      const row=rows[i]!, e=expected[i]!;
      expect(row.subgroup).toBe(e[0]);
      expect(row.sourceObservations).toBe(e[1]);
      expect(row.midpoint.value).toBe(e[2]);
      expect(row.midpoint.ci95).toEqual({level:.95,low:e[3],high:e[4]});
      expect(row.slopeGamma50.value).toBe(e[5]);
      expect(row.slopeGamma50.ci95).toEqual({level:.95,low:e[6],high:e[7]});
      expect(row.fitComparison).toEqual({
        method:"fisher-median-split",pValue:e[8],relation:"=",
      });
    }
    // The Fisher test concerns a median split; p=.188 for medium lesions
    // is NOT an individual TCP prediction accuracy/goodness-of-fit test.
    expect(rows[1]?.fitComparison.pValue).toBeGreaterThan(.05);
  });

  it("Milano Figure 5 vs Figure 6A/6B have different Vx endpoints, separate parameters and binomial 68% error bars", () => {
    const rows = hytecPublishedFitParameterReviews.filter(f => f.sourceId ===
      "milano-2021-hytec-brain");
    expect(rows).toHaveLength(3);
    const expected = [
      ["tissue-V12-SFED2-cc", "brain-necrosis-edema-any", 63.2, 49.2, 97, .87, .74, 1.03, .001, "<"],
      ["tissue-V14-SFED2-cc", "brain-necrosis-edema-any", 45.8, 33, 106.2, .88, .68, 1.11, .003, "="],
      ["tissue-V14-SFED2-cc", "brain-radionecrosis-resection", 42.6, 33.8, 75.5, 1.58, 1.17, 2.09, .001, "<"],
    ] as const;
    for (let i=0;i<rows.length;i++) {
      const f=rows[i]!, e=expected[i]!;
      expect(f.inputAxis).toBe(e[0]);
      expect(f.endpointId).toBe(e[1]);
      expect(f.midpoint).toEqual({value:e[2],ci95:{level:.95,low:e[3],high:e[4]}});
      expect(f.slopeGamma50).toEqual({value:e[5],ci95:{level:.95,low:e[6],high:e[7]}});
      expect(f.fitComparison).toEqual({
        method:"likelihood-ratio-versus-constant-incidence",pValue:e[8],relation:e[9],
      });
      expect(f.figureBinomialIntervalLevel).toBe(.68);
    }
  });

  it("source equation can reproduce SOURCE Table 3 estimates, but no interval is inferred by mixing marginal TD50/gamma CIs", () => {
    const redmond = hytecPublishedFitParameterReviews.find(x=>x.id==="redmond-1y-lc-small-1to5fx")!;
    const pRedmond = (dose:number) =>
      1/(1+(redmond.midpoint.value/dose)**(4*redmond.slopeGamma50.value));
    expect(pRedmond(18)).toBeCloseTo(.863741,5);
    const milano = hytecPublishedFitParameterReviews.find(x=>x.id==="milano-fig5-v12-chin-inoue-peng")!;
    const pMilano = (volume:number) =>
      1/(1+Math.exp(-4*milano.slopeGamma50.value*(volume/milano.midpoint.value-1)));
    expect(pMilano(5)).toBeCloseTo(.036,2);
    expect(pMilano(10)).toBeCloseTo(.048,2);
    // Marginal (separate) CI95 for Vx50/gamma != 95% CI for pMilano(5).
    expect(milano.predictionBandStatus).toBe("NOT_AVAILABLE_FROM_MARGINAL_PARAMETER_CI");
  });

  it("rejects misleadingly marked prediction bands and switched contour/endpoint provenance", () => {
    const copies = hytecPublishedFitParameterReviews.map(f => ({
      ...f,
      midpoint:{...f.midpoint,ci95:{...f.midpoint.ci95}},
      slopeGamma50:{...f.slopeGamma50,ci95:{...f.slopeGamma50.ci95}},
    })) as HytecPublishedFitParameterReview[];
    copies[0]!.predictionBandStatus = "NOT_AVAILABLE_FROM_MARGINAL_PARAMETER_CI";
    copies[0]!.midpoint.ci95.low=100;
    expect(() => validateHytecPublishedFitParameterReviews(copies)).toThrow(/Invalid marginal 95% CI/);
    copies[0]!.midpoint.ci95.low=10.43;
    copies[0]!.fitComparison.method="likelihood-ratio-versus-constant-incidence";
    expect(() => validateHytecPublishedFitParameterReviews(copies)).toThrow(/Redmond fit context/);
  });
});
