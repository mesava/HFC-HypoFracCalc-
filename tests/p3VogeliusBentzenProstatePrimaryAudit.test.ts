import { describe, expect, it } from "vitest";
import { alphaBetaEstimates } from "../src/data/evidence/v0.1/index.js";

/**
 * P3.2 printed primary-paper audit:
 * user-provided Vogelius_Bentzen_2020_IJROBP_prostate_alpha-beta.pdf
 * published 2020 (accepted author manuscript; Abstract PDF p2;
 * Results PDF p5-7 / Figures 1-3).
 *
 * Published pooled point alpha/beta=1.6 Gy (CI 1.3-2.0);
 * DIFFERENT random-effects sensitivity CI=0.8-2.4;
 * 14 trials, 13384 patients, I^2=70%, P=.0005;
 * apparent slope=.57 Gy per Gy/fraction (SE .19, P=.017);
 * higher dose biochemical-control plateau explanation also plausible.
 * This is publication-value regression, not patient-level new fit.
 */
describe("P3 Vogelius and Bentzen original prostate biochemical control study", () => {
  it("preserves original published primary pooled estimate with exact reported CI", () => {
    const e = alphaBetaEstimates.find(
      x => x.id === "ab-prostate-biochemical-control-vb2020",
    )!;
    expect(e.sourceId).toBe("vogelius-bentzen-2020-prostate");
    expect(e.endpointId).toBe("prostate-biochemical-control");
    expect(e.parameter).toBe("alpha-beta");
    expect(e.valueGy).toBe(1.6);
    expect(e.ci95).toEqual({ level: 0.95, low: 1.3, high: 2.0 });
    expect(e.defaultEligible).toBe(true);
    expect(e.applicability?.priorRadiotherapy).toBe("none");
    expect(e.applicability?.radiationQuality).toBe("photon");
  });

  it("discloses heterogeneity and alternative random-effects 0.8-2.4 CI", () => {
    const e = alphaBetaEstimates.find(
      x => x.id === "ab-prostate-biochemical-control-vb2020",
    )!;
    const notes = e.applicability?.notes?.join(" ") ?? "";
    expect(e.supportReason).toMatch(/14 randomized|13,384/);
    expect(notes).toMatch(/I²=70%/);
    expect(notes).toMatch(/P=0.0005/);
    expect(notes).toMatch(/0.8–2.4 Gy/);
    expect(notes).toMatch(/1.3–2.0 Gy/);
    expect(notes).toMatch(/random-effects/i);
    expect(e.ci95?.low).not.toBe(.8);
  });

  it("keeps meta-regression fraction-size dependence and biochemical control saturation as separate explanations", () => {
    const e = alphaBetaEstimates.find(
      x => x.id === "ab-prostate-biochemical-control-vb2020",
    )!;
    const notes = e.applicability?.notes?.join(" ") ?? "";
    expect(notes).toMatch(/0.57 Gy/);
    expect(notes).toMatch(/P=0.017/);
    expect(notes).toMatch(/approximately 80 Gy EQD2/);
    expect(notes).toMatch(/not proof|may reflect/i);
    // It would be unjustified to replace one pooled endpoint
    // alpha/beta with a dose-dependent patient-specific function.
    expect(alphaBetaEstimates.filter(x =>
      x.sourceId === "vogelius-bentzen-2020-prostate")).toHaveLength(1);
  });
});
