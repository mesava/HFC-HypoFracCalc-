import { describe, expect, it } from "vitest";
import {
  alphaBetaEstimates,
  hytecClinicalConstraints,
  hytecOutcomeModels,
  sources,
} from "../src/data/evidence/v0.1/index.js";

/**
 * Independent evidence-scope check after reading user-uploaded original
 * HyTEC correspondence #24 (DOI 10.1016/j.ijrobp.2020.06.074,
 * journal pp252–253) and #25 (DOI 10.1016/j.ijrobp.2021.02.021,
 * pp253–254). This is NOT a clinical validation of any BED model.
 */
describe("Final HyTEC 24–25 correspondence — LQ applicability, not new coefficient", () => {
  it("explicitly records the approximately-10-Gy boundary as non-hard and above-10 uncertainty", () => {
    const overview = sources.find(s=>s.id==="grimm-2021-hytec-overview")!;
    const theory = sources.find(s=>s.id==="song-2021-hytec-biological-principles")!;
    expect(overview.notes).toMatch(/10\.1016\/j\.ijrobp\.2021\.02\.021/);
    expect(overview.notes).toMatch(/about 10 Gy\/fraction/);
    expect(overview.notes).toMatch(/not a strict cutoff/);
    expect(overview.notes).toMatch(/interpolation|heterogeneity/);
    expect(theory.notes).toMatch(/unresolved research question/);
    expect(theory.notes).toMatch(/no.*universal correction/i);
  });

  it("does not turn mechanistic letters into an endpoint alpha/beta, OAR dose, or patient TCP", () => {
    const sourceIds = [
      "song-2021-hytec-biological-principles",
      "grimm-2021-hytec-overview",
    ];
    expect(alphaBetaEstimates.filter(x=>sourceIds.includes(x.sourceId))).toHaveLength(0);
    expect(hytecOutcomeModels.filter(x=>sourceIds.includes(x.sourceId))).toHaveLength(0);
    expect(hytecClinicalConstraints.filter(x=>sourceIds.includes(x.sourceId))).toHaveLength(0);
  });
});
