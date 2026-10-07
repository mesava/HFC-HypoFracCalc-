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

  it("preserves the full de-novo spinal-cord HyTEC Dmax ranges for 1-5 fractions", () => {
    const expected = new Map([
      [1, { low: 12.4, high: 14.0 }],
      [2, { low: 17.0, high: 19.3 }],
      [3, { low: 20.3, high: 23.1 }],
      [4, { low: 23.0, high: 26.2 }],
      [5, { low: 25.3, high: 28.8 }],
    ]);

    for (const [fractions, range] of expected) {
      const constraints = queryClinicalConstraints({
        endpointId: "spinal-cord-radiation-myelopathy",
        fractions,
        metricKind: "Dmax",
        priorRadiotherapy: "none",
      });

      expect(constraints).toHaveLength(1);
      expect(constraints[0]?.value).toBeUndefined();
      expect(constraints[0]?.valueRange).toEqual(range);
      expect(constraints[0]?.estimatedRiskRange).toEqual({
        low: 0.01,
        high: 0.05,
      });
      expect(constraints[0]?.guidanceKind).toBe("risk-point");
    }
  });


  it("documents that spinal-cord ranges are model ranges rather than confidence intervals", () => {
    for (const fractions of [1, 2, 3, 4, 5]) {
      const constraints = queryClinicalConstraints({
        endpointId: "spinal-cord-radiation-myelopathy",
        fractions,
        metricKind: "Dmax",
        priorRadiotherapy: "none",
      });

      expect(constraints).toHaveLength(1);
      expect(
        constraints[0]?.notes?.some((note) =>
          note.toLowerCase().includes("not a confidence interval"),
        ),
      ).toBe(true);
    }
  });

  it("keeps the optic single-fraction recommendation distinct from the 12 Gy modelled risk point", () => {
    const constraints = queryClinicalConstraints({
      endpointId: "optic-pathway-radiation-neuropathy",
      fractions: 1,
      metricKind: "Dmax",
      priorRadiotherapy: "none",
    });

    expect(constraints).toHaveLength(1);
    expect(constraints[0]?.value).toBe(10);
    expect(constraints[0]?.guidanceKind).toBe("planning-limit");
    expect(
      constraints[0]?.notes?.some((note) =>
        note.includes("12 Gy"),
      ),
    ).toBe(true);
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

  it("keeps major-vessel reirradiation guidance separate from pooled risk points", () => {
    const constraints = queryClinicalConstraints({
      endpointId: "major-vessel-grade3plus-bleeding",
      fractions: 5,
      priorRadiotherapy: "yes",
    });

    expect(constraints).toHaveLength(3);

    const objective = constraints.find(
      (item) =>
        item.id ===
        "hytec-major-vessel-d0p5cc-5fx-20gy",
    );
    expect(objective?.metric.kind).toBe("D0.5cc");
    expect(objective?.guidanceKind).toBe(
      "planning-limit",
    );
    expect(objective?.value).toBe(20);
    expect(objective?.estimatedRisk).toBeUndefined();

    const dmax30 = constraints.find(
      (item) =>
        item.id ===
        "hytec-major-vessel-dmax-5fx-30gy-risk",
    );
    expect(dmax30?.guidanceKind).toBe("risk-point");
    expect(dmax30?.estimatedRisk).toBe(0.12);
  });

  it("stores lung SBRT guidance as observational thresholds rather than universal tolerances", () => {
    const constraints = queryClinicalConstraints({
      endpointId: "lung-symptomatic-rilt",
      priorRadiotherapy: "none",
    });

    expect(constraints).toHaveLength(2);
    expect(
      constraints.every(
        (item) =>
          item.guidanceKind ===
          "observational-threshold",
      ),
    ).toBe(true);

    const v20 = constraints.find(
      (item) =>
        item.id ===
        "hytec-lung-rilt-v20-10to15pct",
    );
    expect(v20?.metric).toEqual({
      kind: "Vx",
      xGy: 20,
    });
    expect(v20?.valueRange).toEqual({
      low: 10,
      high: 15,
    });
    expect(v20?.estimatedRiskRange).toEqual({
      low: 0.1,
      high: 0.15,
    });
  });

  it("preserves primary-versus-metastatic liver MLD objectives for 3 and 6 fractions", () => {
    const constraints = queryClinicalConstraints({
      endpointId: "liver-grade3plus-enzyme-toxicity",
    });

    expect(constraints).toHaveLength(4);

    const byPopulationAndFx = new Map(
      constraints.map((item) => [
        `${item.population}|${item.fractionation?.fractions}`,
        item.value,
      ]),
    );

    expect(
      byPopulationAndFx.get(
        "Primary liver disease|3",
      ),
    ).toBe(13);
    expect(
      byPopulationAndFx.get(
        "Primary liver disease|6",
      ),
    ).toBe(18);
    expect(
      byPopulationAndFx.get(
        "Metastatic liver lesions|3",
      ),
    ).toBe(15);
    expect(
      byPopulationAndFx.get(
        "Metastatic liver lesions|6",
      ),
    ).toBe(20);

    expect(
      constraints.every(
        (item) =>
          item.estimatedRisk === 0.2 &&
          item.riskRelation === "<",
      ),
    ).toBe(true);
  });

  it("represents liver 700-cc guidance as spared volume at dose rather than fake D700cc", () => {
    const constraints = queryClinicalConstraints({
      endpointId: "liver-grade3plus-enzyme-toxicity",
      metricKind: "VleX",
    });

    expect(constraints).toHaveLength(2);
    expect(
      constraints.map((item) => ({
        xGy: item.metric.xGy,
        relation: item.relation,
        value: item.value,
        unit: item.unit,
        kind: item.guidanceKind,
      })),
    ).toEqual([
      {
        xGy: 15,
        relation: ">=",
        value: 700,
        unit: "cc",
        kind: "observational-threshold",
      },
      {
        xGy: 17,
        relation: ">=",
        value: 700,
        unit: "cc",
        kind: "observational-threshold",
      },
    ]);
  });

  it("does not turn prostate SBRT suggested tolerance ranges into hard limits or point values", () => {
    const ids = [
      "hytec-prostate-sbrt-bladder-vrx-5to10cc",
      "hytec-prostate-sbrt-urethra-dmax-38to42gy",
      "hytec-prostate-sbrt-rectum-dmax-35to38gy",
    ];

    for (const id of ids) {
      const resolved = resolveClinicalConstraint(id);
      expect(
        resolved.constraint.guidanceKind,
      ).toBe("observational-threshold");
      expect(
        resolved.constraint.value,
      ).toBeUndefined();
      expect(
        resolved.constraint.valueRange,
      ).toBeDefined();
      expect(
        resolved.constraint.notes?.some(
          (note) =>
            note.includes(
              "do not offer firm guidance on tolerance doses",
            ),
        ),
      ).toBe(true);
    }

    expect(
      resolveClinicalConstraint(ids[0]!).constraint
        .metric,
    ).toEqual({
      kind: "custom",
      customLabel: "V(Rx dose)",
    });
  });
});
