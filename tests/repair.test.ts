import { describe, expect, it } from "vitest";
import {
  eqdGyWithIncompleteRepair,
  thamesHm,
} from "../src/core/repair.js";

describe("incomplete repair", () => {
  it("returns Hm=0 for one fraction per day", () => {
    expect(thamesHm(1, 6, 4.4)).toBe(0);
  });

  it("reproduces H2 about 0.39 for T1/2 4.4 h and a 6 h interval", () => {
    expect(thamesHm(2, 6, 4.4)).toBeCloseTo(0.39, 2);
  });

  it("reproduces the RAPID-style worked example at about 62.4 Gy EQD2", () => {
    const result = eqdGyWithIncompleteRepair({
      schedule: {
        fractions: 10,
        dosePerFractionGy: 3.85,
      },
      alphaBetaGy: 3.4,
      fractionsPerDay: 2,
      interfractionIntervalHours: 6,
      repairHalfTimeHours: 4.4,
    });

    expect(result).toBeCloseTo(62.4, 1);
  });
});
