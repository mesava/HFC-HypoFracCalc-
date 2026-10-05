import { describe, expect, it } from "vitest";
import type { ReirradiationCourse } from "../src/domain/reirradiation.js";
import { assessHytecSpinalCordReirradiation } from "../src/workflows/reirradiationGuidance.js";

const metric = { kind: "Dmax" } as const;

function previousCourse(
  overrides: Partial<ReirradiationCourse> = {},
): ReirradiationCourse {
  return {
    id: "prior",
    label: "Prior course",
    role: "previous",
    schedule: {
      fractions: 10,
      dosePerFractionGy: 2,
    },
    metric,
    intervalToCurrentMonths: 12,
    recovery: { mode: "none" },
    ...overrides,
  };
}

function currentCourse(
  overrides: Partial<ReirradiationCourse> = {},
): ReirradiationCourse {
  return {
    id: "current",
    label: "Current SBRT",
    role: "current",
    schedule: {
      fractions: 5,
      dosePerFractionGy: 3,
    },
    metric,
    ...overrides,
  };
}

describe("HyTEC spinal-cord reirradiation guidance", () => {
  it("assesses all four lower-risk factors on the published EQD2_2 basis", () => {
    const result = assessHytecSpinalCordReirradiation(
      [previousCourse(), currentCourse()],
      true,
    );

    expect(result.applicable).toBe(true);
    expect(result.calculationBasis.alphaBetaGy).toBe(2);
    expect(result.criteria).toHaveLength(4);
    expect(
      result.criteria.every(
        (criterion) => criterion.status === "met",
      ),
    ).toBe(true);
    expect(result.allAssessableCriteriaMet).toBe(true);
  });

  it("does not apply the guidance unless Dmax is explicitly confirmed as thecal-sac Dmax", () => {
    const result = assessHytecSpinalCordReirradiation(
      [previousCourse(), currentCourse()],
      false,
    );

    expect(result.applicable).toBe(false);
    expect(
      result.applicabilityReasons.some((reason) =>
        reason.includes("explicitly confirm"),
      ),
    ).toBe(true);
  });

  it("rejects a non-Dmax metric from the guidance context", () => {
    const result = assessHytecSpinalCordReirradiation(
      [
        previousCourse({ metric: { kind: "D0.1cc" } }),
        currentCourse({ metric: { kind: "D0.1cc" } }),
      ],
      true,
    );

    expect(result.applicable).toBe(false);
    expect(
      result.applicabilityReasons.some((reason) =>
        reason.includes("point maximum dose"),
      ),
    ).toBe(true);
  });

  it("does not extrapolate the guidance to more than one previous course", () => {
    const secondPrior = previousCourse({
      id: "prior-2",
      label: "Prior course 2",
      intervalToCurrentMonths: 24,
    });

    const result = assessHytecSpinalCordReirradiation(
      [previousCourse(), secondPrior, currentCourse()],
      true,
    );

    expect(result.applicable).toBe(false);
  });

  it("flags a cumulative EQD2_2 criterion when the published factor is exceeded", () => {
    const result = assessHytecSpinalCordReirradiation(
      [
        previousCourse({
          schedule: {
            fractions: 25,
            dosePerFractionGy: 2,
          },
        }),
        currentCourse({
          schedule: {
            fractions: 5,
            dosePerFractionGy: 5,
          },
        }),
      ],
      true,
    );

    const cumulative = result.criteria.find(
      (item) => item.id === "cumulative-eqd2-max",
    );

    expect(cumulative?.status).toBe("not-met");
    expect(result.allAssessableCriteriaMet).toBe(false);
  });

  it("marks the interval criterion not assessable when the interval is missing", () => {
    const result = assessHytecSpinalCordReirradiation(
      [
        previousCourse({
          intervalToCurrentMonths: undefined,
        }),
        currentCourse(),
      ],
      true,
    );

    const interval = result.criteria.find(
      (item) => item.id === "minimum-interval",
    );

    expect(interval?.status).toBe("not-assessable");
    expect(result.allAssessableCriteriaMet).toBeNull();
  });

  it("ignores a user recovery discount when comparing against the published HyTEC criteria", () => {
    const result = assessHytecSpinalCordReirradiation(
      [
        previousCourse({
          recovery: {
            mode: "manual-discount",
            discountFraction: 0.5,
            rationale: "Scenario analysis only",
          },
        }),
        currentCourse(),
      ],
      true,
    );

    expect(
      result.warnings.some((warning) =>
        warning.includes("ignored"),
      ),
    ).toBe(true);

    const cumulative = result.criteria.find(
      (item) => item.id === "cumulative-eqd2-max",
    );
    expect(cumulative?.observedValue).toBeCloseTo(38.75, 12);
  });
});
