import { describe, expect, it } from "vitest";
import {
  activeRepopulationDays,
  bedRateToEqdRate,
  correctBiologicalDoseForTreatmentTime,
} from "../src/core/repopulation.js";

describe("repopulation", () => {
  it("applies no proliferation before Tk", () => {
    expect(activeRepopulationDays(18, 21)).toBe(0);
  });

  it("counts only days after Tk", () => {
    expect(activeRepopulationDays(28, 21)).toBe(7);
  });

  it("reproduces a 4.9 Gy EQD2 difference for 7 days at 0.7 Gy/day", () => {
    const corrected = correctBiologicalDoseForTreatmentTime(
      70,
      40,
      47,
      {
        basis: "EQD2",
        rateGyPerDay: 0.7,
        kickOffDays: 21,
      },
    );

    expect(corrected).toBeCloseTo(65.1, 12);
  });

  it("converts a BED rate to an EQD2 rate only when alpha/beta is explicit", () => {
    expect(bedRateToEqdRate(0.9, 10, 2)).toBeCloseTo(0.75, 12);
  });
});
