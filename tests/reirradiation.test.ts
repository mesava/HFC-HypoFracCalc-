import { describe, expect, it } from "vitest";
import { eqdGy } from "../src/core/lq.js";
import {
  classifyReirradiation,
  evaluateReirradiationScenario,
  solveRemainingEqd2Budget,
} from "../src/workflows/reirradiation.js";
import {
  evaluateEvidenceReirradiationScenario,
  solveEvidenceRemainingEqd2Budget,
} from "../src/workflows/evidenceReirradiation.js";
import type {
  ReirradiationCourse,
  ReirradiationScenarioContext,
} from "../src/domain/reirradiation.js";

const metric = { kind: "D0.1cc" } as const;

const context: ReirradiationScenarioContext = {
  geometricOverlap: true,
  cumulativeDoseToxicityConcern: true,
  previousDoseData: "summary-only",
  registrationSuitability: "uncertain",
  strategy: "conservative-near-max",
};

function previousCourse(
  overrides: Partial<ReirradiationCourse> = {},
): ReirradiationCourse {
  return {
    id: "prior-1",
    label: "Prior course",
    role: "previous",
    schedule: {
      fractions: 30,
      dosePerFractionGy: 2,
    },
    metric,
    ...overrides,
  };
}

function currentCourse(
  overrides: Partial<ReirradiationCourse> = {},
): ReirradiationCourse {
  return {
    id: "current",
    label: "Current course",
    role: "current",
    schedule: {
      fractions: 5,
      dosePerFractionGy: 5,
    },
    metric,
    ...overrides,
  };
}

describe("reirradiation classification", () => {
  it("classifies geometric overlap as type I", () => {
    expect(classifyReirradiation(true, false)).toBe(
      "type-I",
    );
  });

  it("classifies cumulative-dose concern without overlap as type II", () => {
    expect(classifyReirradiation(false, true)).toBe(
      "type-II",
    );
  });

  it("keeps non-overlap without cumulative concern outside the reirradiation definition", () => {
    expect(classifyReirradiation(false, false)).toBe(
      "repeat-irradiation",
    );
  });
});

describe("cumulative equieffective dose", () => {
  it("sums EQD2 and BED after consistent radiobiological rescaling", () => {
    const result = evaluateReirradiationScenario(
      [previousCourse(), currentCourse()],
      3,
      context,
    );

    expect(result.classification).toBe("type-I");
    expect(result.cumulativePhysicalDoseGy).toBeCloseTo(
      85,
      12,
    );
    expect(result.cumulativeEqd2Gy).toBeCloseTo(100, 12);
    expect(result.cumulativeBedGy).toBeCloseTo(
      166.6666666667,
      9,
    );
  });

  it("does not infer recovery from a long treatment interval", () => {
    const result = evaluateReirradiationScenario(
      [
        previousCourse({
          intervalToCurrentMonths: 36,
          recovery: { mode: "none" },
        }),
        currentCourse(),
      ],
      3,
      context,
    );

    expect(result.courses[0]?.eqd2Gy).toBeCloseTo(60, 12);
    expect(result.courses[0]?.adjustedEqd2Gy).toBeCloseTo(
      60,
      12,
    );
    expect(result.audit.recoveryApplied).toBe(false);
  });

  it("applies an explicit recovery discount only to prior equieffective dose", () => {
    const result = evaluateReirradiationScenario(
      [
        previousCourse({
          intervalToCurrentMonths: 24,
          recovery: {
            mode: "manual-discount",
            discountFraction: 0.25,
            rationale:
              "Institutional clinician-approved scenario analysis.",
          },
        }),
        currentCourse(),
      ],
      3,
      context,
    );

    expect(result.courses[0]?.adjustedEqd2Gy).toBeCloseTo(
      45,
      12,
    );
    expect(result.courses[1]?.adjustedEqd2Gy).toBeCloseTo(
      40,
      12,
    );
    expect(result.cumulativeEqd2Gy).toBeCloseTo(85, 12);
    expect(result.audit.recoveryApplied).toBe(true);
  });

  it("rejects recovery applied to the current course", () => {
    expect(() =>
      evaluateReirradiationScenario(
        [
          previousCourse(),
          currentCourse({
            recovery: {
              mode: "manual-discount",
              discountFraction: 0.2,
              rationale: "Not allowed",
            },
          }),
        ],
        3,
        context,
      ),
    ).toThrow(/previously delivered courses/);
  });

  it("requires the same scalar dose metric across courses", () => {
    expect(() =>
      evaluateReirradiationScenario(
        [
          previousCourse(),
          currentCourse({
            metric: { kind: "D2cc" },
          }),
        ],
        3,
        context,
      ),
    ).toThrow(/same dose metric/);
  });

  it("rejects volumetric Vx from scalar point-dose summation", () => {
    expect(() =>
      evaluateReirradiationScenario(
        [
          previousCourse({
            metric: { kind: "Vx", xGy: 20 },
          }),
          currentCourse({
            metric: { kind: "Vx", xGy: 20 },
          }),
        ],
        3,
        context,
      ),
    ).toThrow(/volumetric metric/);
  });

  it("does not pretend scalar values are a completed 3D accumulation", () => {
    const result = evaluateReirradiationScenario(
      [previousCourse(), currentCourse()],
      3,
      {
        ...context,
        previousDoseData: "complete-dicom",
        registrationSuitability: "rigid-suitable",
        strategy: "image-registration-3d",
      },
    );

    expect(
      result.warnings.some((warning) =>
        warning.includes("does not perform voxel-wise"),
      ),
    ).toBe(true);
  });
});

describe("evidence-aware reirradiation workflow", () => {
  it("preserves the alpha/beta evidence record and source", () => {
    const result = evaluateEvidenceReirradiationScenario(
      "subcutis-fibrosis",
      [previousCourse(), currentCourse()],
      context,
    );

    expect(result.alphaBetaSelectionMode).toBe("evidence");
    expect(result.alphaBetaRecordId).toBe(
      "ab-subcutis-fibrosis-bcr2025",
    );
    expect(result.alphaBetaSourceId).toBe(
      "bentzen-overgaard-1991-postmastectomy",
    );
    expect(result.alphaBetaGy).toBeCloseTo(1.7, 12);
  });

  it("preserves a manual alpha/beta selection in the remaining-budget calculation", () => {
    const result = solveEvidenceRemainingEqd2Budget(
      "subcutis-fibrosis",
      [previousCourse()],
      metric,
      120,
      5,
      {
        selectionMode: "manual",
        parameter: "alpha-beta",
        value: 3,
        unit: "Gy",
        rationale: "Local scenario analysis",
      },
    );

    expect(result.alphaBetaSelectionMode).toBe("manual");
    expect(result.alphaBetaRecordId).toBeUndefined();
    expect(result.alphaBetaSourceId).toBeUndefined();
    expect(result.alphaBetaGy).toBeCloseTo(3, 12);
  });
});

describe("remaining cumulative EQD2 budget", () => {
  it("solves a current 5-fraction dose from a cumulative EQD2 limit", () => {
    const result = solveRemainingEqd2Budget(
      [previousCourse()],
      metric,
      100,
      5,
      3,
    );

    expect(result.adjustedPriorEqd2Gy).toBeCloseTo(60, 12);
    expect(result.remainingEqd2BudgetGy).toBeCloseTo(40, 12);
    expect(result.maximumDosePerFractionGy).toBeCloseTo(
      5,
      12,
    );
    expect(result.maximumTotalPhysicalDoseGy).toBeCloseTo(
      25,
      12,
    );

    expect(
      eqdGy(
        {
          fractions: 5,
          dosePerFractionGy:
            result.maximumDosePerFractionGy!,
        },
        3,
        2,
      ),
    ).toBeCloseTo(40, 12);
  });

  it("reflects a user-specified recovery discount in the remaining budget", () => {
    const result = solveRemainingEqd2Budget(
      [
        previousCourse({
          recovery: {
            mode: "manual-discount",
            discountFraction: 0.25,
            rationale: "Scenario analysis",
          },
        }),
      ],
      metric,
      100,
      5,
      3,
    );

    expect(result.adjustedPriorEqd2Gy).toBeCloseTo(45, 12);
    expect(result.remainingEqd2BudgetGy).toBeCloseTo(55, 12);
    expect(result.maximumDosePerFractionGy).toBeGreaterThan(5);
  });

  it("reports when the prior dose already exceeds the supplied cumulative limit", () => {
    const result = solveRemainingEqd2Budget(
      [previousCourse()],
      metric,
      50,
      5,
      3,
    );

    expect(result.limitAlreadyExceeded).toBe(true);
    expect(result.remainingEqd2BudgetGy).toBeCloseTo(-10, 12);
    expect(result.maximumDosePerFractionGy).toBeNull();
  });
});
