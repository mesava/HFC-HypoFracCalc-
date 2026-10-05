import { describe, expect, it } from "vitest";
import {
  queryClinicalConstraints,
  resolveClinicalConstraint,
  validateConstraintDataset,
} from "../src/evidence/constraintRegistry.js";

describe("clinical constraint registry", () => {
  it("validates all initial HyTEC records", () => {
    expect(() => validateConstraintDataset()).not.toThrow();
  });

  it("returns optic pathway guidance only for the requested fraction count", () => {
    const constraints = queryClinicalConstraints({
      endpointId: "optic-pathway-radiation-neuropathy",
      fractions: 3,
      metricKind: "Dmax",
      priorRadiotherapy: "none",
    });

    expect(constraints).toHaveLength(1);
    expect(constraints[0]?.value).toBe(20);
    expect(constraints[0]?.guidanceKind).toBe(
      "planning-limit",
    );
    expect(constraints[0]?.estimatedRisk).toBe(0.01);
    expect(constraints[0]?.riskRelation).toBe("<");
  });

  it("preserves the spinal-cord single-fraction risk range instead of collapsing it", () => {
    const resolved = resolveClinicalConstraint(
      "hytec-cord-dmax-1fx-risk-range",
    );

    expect(resolved.constraint.value).toBeUndefined();
    expect(resolved.constraint.valueRange).toEqual({
      low: 12.4,
      high: 14,
    });
    expect(resolved.constraint.estimatedRiskRange).toEqual({
      low: 0.01,
      high: 0.05,
    });
    expect(resolved.constraint.guidanceKind).toBe(
      "risk-point",
    );
  });

  it("keeps brain V12 evidence as risk points rather than planning limits", () => {
    const constraints = queryClinicalConstraints({
      endpointId: "brain-symptomatic-radionecrosis",
      fractions: 1,
      metricKind: "Vx",
    });

    expect(constraints).toHaveLength(3);
    expect(
      constraints.every(
        (constraint) =>
          constraint.guidanceKind === "risk-point" &&
          constraint.metric.kind === "Vx" &&
          constraint.metric.xGy === 12,
      ),
    ).toBe(true);
  });

  it("separates any necrosis/edema from radionecrosis requiring resection", () => {
    const anyNecrosis = queryClinicalConstraints({
      endpointId: "brain-necrosis-edema-any",
      fractions: 5,
    });
    const resection = queryClinicalConstraints({
      endpointId: "brain-radionecrosis-resection",
      fractions: 5,
    });

    expect(anyNecrosis).toHaveLength(1);
    expect(resection).toHaveLength(1);
    expect(anyNecrosis[0]?.estimatedRisk).toBe(0.1);
    expect(resection[0]?.estimatedRisk).toBe(0.04);
    expect(anyNecrosis[0]?.riskRelation).toBe("<");
    expect(resection[0]?.riskRelation).toBe("<");
  });

  it("does not expose prior-radiotherapy optic guidance as if de-novo constraints applied", () => {
    const constraints = queryClinicalConstraints({
      endpointId: "optic-pathway-radiation-neuropathy",
      fractions: 5,
      priorRadiotherapy: "yes",
    });

    expect(constraints).toHaveLength(0);
  });
});
