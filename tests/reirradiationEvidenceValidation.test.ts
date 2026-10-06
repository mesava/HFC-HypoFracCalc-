import { describe, expect, it } from "vitest";
import { sources } from "../src/data/evidence/v0.1/index.js";
import {
  classifyReirradiation,
  evaluateReirradiationScenario,
} from "../src/workflows/reirradiation.js";
import type {
  ReirradiationCourse,
  ReirradiationScenarioContext,
} from "../src/domain/reirradiation.js";

const metric = { kind: "D0.1cc" } as const;

const previousCourse: ReirradiationCourse = {
  id: "previous",
  label: "Previous course",
  role: "previous",
  schedule: {
    fractions: 30,
    dosePerFractionGy: 2,
  },
  metric,
  intervalToCurrentMonths: 60,
  recovery: { mode: "none" },
};

const currentCourse: ReirradiationCourse = {
  id: "current",
  label: "Current course",
  role: "current",
  schedule: {
    fractions: 5,
    dosePerFractionGy: 5,
  },
  metric,
};

const conservativeContext: ReirradiationScenarioContext = {
  geometricOverlap: false,
  cumulativeDoseToxicityConcern: true,
  previousDoseData: "summary-only",
  registrationSuitability: "uncertain",
  strategy: "conservative-near-max",
};

describe("Evidence validation batch 5: reirradiation methods", () => {
  it("retains the ESTRO-EORTC type I/type II classification semantics", () => {
    expect(classifyReirradiation(true, false)).toBe(
      "type-I",
    );
    expect(classifyReirradiation(false, true)).toBe(
      "type-II",
    );
    expect(classifyReirradiation(false, false)).toBe(
      "repeat-irradiation",
    );
  });

  it("never infers tissue recovery from elapsed time alone", () => {
    const result = evaluateReirradiationScenario(
      [previousCourse, currentCourse],
      3,
      conservativeContext,
    );

    const prior = result.courses[0]!;
    expect(prior.intervalToCurrentMonths).toBe(60);
    expect(prior.recoveryDiscountFraction).toBe(0);
    expect(prior.adjustedEqd2Gy).toBeCloseTo(
      prior.eqd2Gy,
      12,
    );
    expect(result.audit.recoveryApplied).toBe(false);
  });

  it("requires an explicit rationale for any recovery discount", () => {
    expect(() =>
      evaluateReirradiationScenario(
        [
          {
            ...previousCourse,
            recovery: {
              mode: "manual-discount",
              discountFraction: 0.25,
              rationale: "",
            },
          },
          currentCourse,
        ],
        3,
        conservativeContext,
      ),
    ).toThrow(/explicit rationale/);
  });

  it("documents conservative point summation as a worst-case rather than spatial accumulation", () => {
    const result = evaluateReirradiationScenario(
      [previousCourse, currentCourse],
      3,
      conservativeContext,
    );

    expect(
      result.warnings.some((warning) =>
        warning.includes("worst-case"),
      ),
    ).toBe(true);
    expect(
      result.warnings.some((warning) =>
        warning.includes("does not establish spatial co-location"),
      ),
    ).toBe(true);
  });

  it("does not present the unimplemented 3D strategy as completed dose accumulation", () => {
    const result = evaluateReirradiationScenario(
      [previousCourse, currentCourse],
      3,
      {
        geometricOverlap: true,
        cumulativeDoseToxicityConcern: true,
        previousDoseData: "complete-dicom",
        registrationSuitability: "rigid-suitable",
        strategy: "image-registration-3d",
      },
    );

    expect(
      result.warnings.some((warning) =>
        warning.includes(
          "does not perform voxel-wise image registration",
        ),
      ),
    ).toBe(true);
  });

  it("requires radiobiological rescaling and keeps physical-dose sums audit-only", () => {
    const result = evaluateReirradiationScenario(
      [previousCourse, currentCourse],
      3,
      conservativeContext,
    );

    expect(result.cumulativePhysicalDoseGy).toBeGreaterThan(0);
    expect(
      result.warnings.some(
        (warning) =>
          warning.includes("audit only") &&
          warning.includes("EQD2 or BED"),
      ),
    ).toBe(true);
  });

  it("registers all validated general reirradiation method sources", () => {
    const ids = new Set(sources.map((source) => source.id));

    for (const id of [
      "andratschke-2022-estro-eortc-reirradiation",
      "rcr-2024-principles-reirradiation",
      "appelt-2026-cumulative-dose-reirradiation",
      "paradis-2026-recog-consensus",
      "zhang-2026-recog-case-guide",
    ]) {
      expect(ids.has(id), `Missing source: ${id}`).toBe(true);
    }
  });
});
