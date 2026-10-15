import { describe, expect, it } from "vitest";
import { dosePerFractionForTargetEqdGy } from "../src/core/lq.js";
import {
  evaluateReirradiationScenario,
  solveRemainingEqd2Budget,
} from "../src/workflows/reirradiation.js";
import type {
  ReirradiationCourse,
  ReirradiationScenarioContext,
} from "../src/domain/reirradiation.js";

/**
 * Zhang et al., Practical Radiation Oncology 2026,
 * DOI 10.1016/j.prro.2026.03.010
 * Case 1: Figures 3-5 (PDF pp.6-8), Table 1 p.6.
 * Case 2: supplementary Appendix E1, final tables pp.8-11.
 *
 * The values below describe selected OAR near-maximum dose metrics.
 * They are NOT whole-target prescription doses or clinical limits
 * to be applied to other patients. Institutional TRF assumptions are
 * manually entered solely to reproduce the published example.
 */
const caudaMetric = { kind: "D0.1cc" } as const;
const context: ReirradiationScenarioContext = {
  geometricOverlap: true,
  cumulativeDoseToxicityConcern: true,
  previousDoseData: "complete-dicom",
  registrationSuitability: "rigid-suitable",
  strategy: "direct-point-sum",
};

function previousCaudaOarDose(
  totalDoseGy: number,
): ReirradiationCourse {
  return {
    id: "C1",
    label: "Illustrative prior OAR D0.1cc (not PTV Rx)",
    role: "previous",
    schedule: { fractions: 5, dosePerFractionGy: totalDoseGy / 5 },
    metric: caudaMetric,
    intervalToCurrentMonths: 24,
    recovery: {
      mode: "manual-discount",
      discountFraction: 0.5,
      rationale: "Reproduce Zhang et al. 2026 Case 1 INSTITUTIONAL example only; no universal tissue-recovery inference.",
    },
  };
}

function currentCaudaOarDose(
  totalDoseGy: number,
): ReirradiationCourse {
  return {
    id: "C2",
    label: "Illustrative current OAR D0.1cc (not PTV Rx)",
    role: "current",
    schedule: { fractions: 5, dosePerFractionGy: totalDoseGy / 5 },
    metric: caudaMetric,
  };
}

describe("ReCOG Zhang 2026 published case worked numerical acceptance", () => {
  it("Case 1 strategy 1a reproduces direct OAR D0.1cc sum and remaining-dose objective", () => {
    // Figure 3: C1 20 Gy/5fx OAR, C2 31.9 Gy/5fx OAR,
    // alpha/beta=2.5 Gy, 50% manual discount, 60 Gy EQD2 institutional limit.
    const c1 = previousCaudaOarDose(20);
    const c2 = currentCaudaOarDose(31.9);
    const result = evaluateReirradiationScenario([c1, c2], 2.5, context);
    expect(result.courses[0]!.eqd2Gy).toBeCloseTo(28.9, 1);
    expect(result.courses[1]!.eqd2Gy).toBeCloseTo(62.9, 1);
    expect(result.cumulativeEqd2Gy).toBeCloseTo(77.4, 1);
    expect(result.audit.recoveryApplied).toBe(true);

    const budget = solveRemainingEqd2Budget(
      [c1], caudaMetric, 60, 5, 2.5,
    );
    expect(budget.adjustedPriorEqd2Gy).toBeCloseTo(14.45, 1);
    expect(budget.remainingEqd2BudgetGy).toBeCloseTo(45.55, 1);
    expect(budget.maximumTotalPhysicalDoseGy).toBeCloseTo(26.4, 1);
    expect(budget.limitAlreadyExceeded).toBe(false);
    // The new OAR planning objective is NOT a tumor prescription.
    expect(c2.schedule.dosePerFractionGy * 5).toBeGreaterThan(
      budget.maximumTotalPhysicalDoseGy!,
    );
  });

  it("Case 1 strategy 1b reproduces overlap-region OAR calculation", () => {
    // Figure 4: C1 Dmax 15.8 Gy/5fx => 19.9 EQD2_2.5,
    // C2 Dmax 30 Gy/5fx => 56.7 EQD2_2.5 (rounded).
    const c1 = previousCaudaOarDose(15.8);
    const c2 = currentCaudaOarDose(30);
    const result = evaluateReirradiationScenario(
      [c1, c2],
      2.5,
      { ...context, strategy: "overlap-point-sum" },
    );
    expect(result.courses[0]!.eqd2Gy).toBeCloseTo(19.9, 1);
    expect(result.courses[1]!.eqd2Gy).toBeCloseTo(56.7, 1);
    expect(result.cumulativeEqd2Gy).toBeCloseTo(66.7, 0);

    const budget = solveRemainingEqd2Budget(
      [c1], caudaMetric, 60, 5, 2.5,
    );
    expect(budget.remainingEqd2BudgetGy).toBeCloseTo(50, 0);
    expect(budget.maximumTotalPhysicalDoseGy).toBeCloseTo(27.9, 1);
    expect(
      budget.maximumTotalPhysicalDoseGy!,
    ).toBeGreaterThan(26.4);
  });

  it("Case 2 reproduces source-reported remaining 41.2 Gy EQD2_2.5 objective", () => {
    // Appendix E1 case 2: prior spinal-cord overlap OAR EQD2=27.6 Gy;
    // institution TRF=0.5; cumulative constraint=55 Gy EQD2_2.5.
    // C1 involved separate 3fx + 10fx plans: DO NOT reconstruct
    // per-fraction OAR metric from their target prescriptions.
    const remaining = 55 - 0.5 * 27.6;
    expect(remaining).toBeCloseTo(41.2, 12);
    const currentDpf = dosePerFractionForTargetEqdGy(
      remaining, 5, 2.5, 2,
    );
    expect(5 * currentDpf).toBeCloseTo(24.8, 1);
  });

  it("never equates source strategy 2 voxel sum with scalar sum of maxima", () => {
    // Zhang Appendix E1 case 1: after 3D spatial EQD2 mapping,
    // 0.5*C1+C2 is reported 65.1 Gy in the first plan, compared
    // with ~77.4 Gy from summing independent scalar OAR maxima.
    const scalar = evaluateReirradiationScenario(
      [previousCaudaOarDose(20), currentCaudaOarDose(31.9)],
      2.5,
      context,
    ).cumulativeEqd2Gy;
    const publishedSpatial = 65.1;
    expect(scalar - publishedSpatial).toBeGreaterThan(12);
    // A 3D voxel-to-voxel reconstruction requires DICOM+registration,
    // NOT a mathematical transformation of the scalar total.
  });

  it("does not apply example institutional recovery automatically by elapsed time", () => {
    const prior = {
      ...previousCaudaOarDose(20),
      recovery: { mode: "none" as const },
    };
    const noDiscount = evaluateReirradiationScenario(
      [prior, currentCaudaOarDose(31.9)], 2.5, context,
    );
    expect(noDiscount.audit.recoveryApplied).toBe(false);
    expect(noDiscount.courses[0]!.adjustedEqd2Gy)
      .toBeCloseTo(28.9, 1);
    expect(noDiscount.cumulativeEqd2Gy).toBeGreaterThan(90);
  });
});

describe("HyTEC Redmond 2021 supplemental SFED20 cross-check", () => {
  const sFed20 = (totalGy: number, n: number) => {
    const bed20 = totalGy * (1 + totalGy / n / 20);
    return 0.5 * (-20 + Math.sqrt(20 * 20 + 4 * 20 * bed20));
  };

  const logLogistic = (s: number, td50: number, gamma50: number) =>
    1 / (1 + (td50 / s) ** (4 * gamma50));

  it("reproduces a medium-lesion 1-year LC modeled point for 27Gy/3fx", () => {
    // Redmond Table EA4, pp.8-9: medium 21-30mm, 1-5fx,
    // 1yr LC TD50=12.44 SFED20 Gy, gamma50=.7617.
    const s = sFed20(27, 3);
    expect(s).toBeCloseTo(19.715316, 5);
    expect(logLogistic(s, 12.44, .7617)).toBeCloseTo(.802657, 5);
    // These 80.27% are a published-model calculation, NOT
    // a case-specific TCP estimate or a new HFC clinical preset.
  });

  it("uses non-linear SFED20 instead of physical total dose", () => {
    const correct = logLogistic(sFed20(27, 3), 12.44, .7617);
    const wrong = logLogistic(27, 12.44, .7617);
    expect(wrong - correct).toBeGreaterThan(.1);
    expect(sFed20(18, 1)).toBeCloseTo(18, 12);
  });
});
