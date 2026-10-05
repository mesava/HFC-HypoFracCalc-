import { describe, expect, it } from "vitest";
import {
  assessLqApplicability,
  bedGy,
  dosePerFractionForTargetEqdGy,
  eqdGy,
  totalDoseGy,
} from "../src/core/lq.js";

describe("LQ core", () => {
  it("returns total physical dose", () => {
    expect(totalDoseGy({ fractions: 30, dosePerFractionGy: 2 })).toBe(60);
  });

  it("returns EQD2 equal to physical dose for 2 Gy fractions", () => {
    expect(
      eqdGy({ fractions: 30, dosePerFractionGy: 2 }, 1.6),
    ).toBeCloseTo(60, 12);
  });

  it("reproduces the 1 x 8 Gy, alpha/beta 2 Gy example", () => {
    expect(
      eqdGy({ fractions: 1, dosePerFractionGy: 8 }, 2),
    ).toBeCloseTo(20, 12);
  });

  it("calculates BED", () => {
    expect(
      bedGy({ fractions: 30, dosePerFractionGy: 2 }, 10),
    ).toBeCloseTo(72, 12);
  });

  it("round-trips an EQD target back to dose per fraction", () => {
    const schedule = { fractions: 5, dosePerFractionGy: 6 };
    const alphaBetaGy = 3.4;
    const target = eqdGy(schedule, alphaBetaGy);
    const recovered = dosePerFractionForTargetEqdGy(
      target,
      schedule.fractions,
      alphaBetaGy,
    );

    expect(recovered).toBeCloseTo(schedule.dosePerFractionGy, 12);
  });

  it("flags high-dose extrapolation without blocking calculation", () => {
    expect(assessLqApplicability(8).level).toBe("supported-domain");
    expect(assessLqApplicability(12).level).toBe("caution");
    expect(assessLqApplicability(18).level).toBe("strong-caution");
  });

  it("rejects alpha/beta <= 0", () => {
    expect(() =>
      eqdGy({ fractions: 5, dosePerFractionGy: 6 }, 0),
    ).toThrow();
  });
});
