import { describe, expect, it } from "vitest";
import {
  queryOutcomeModels,
  resolveOutcomeModel,
  validateOutcomeModelDataset,
} from "../src/evidence/outcomeModelRegistry.js";

describe("HyTEC outcome model registry", () => {
  it("validates the initial source-backed outcome dataset", () => {
    expect(() =>
      validateOutcomeModelDataset(),
    ).not.toThrow();
  });

  it("keeps brain-metastasis TCP stratified by lesion size", () => {
    const resolved = resolveOutcomeModel(
      "hytec-brain-mets-1y-local-control",
    );

    expect(resolved.model.points).toHaveLength(4);
    expect(
      resolved.model.points.find(
        (point) =>
          point.id ===
          "brain-mets-21-30mm-18gy-1fx",
      )?.probability,
    ).toBe(0.75);
    expect(
      resolved.model.points.find(
        (point) =>
          point.id ===
          "brain-mets-31-40mm-15gy-1fx",
      )?.probability,
    ).toBe(0.69);
  });

  it("preserves vestibular schwannoma model-derived TCP points", () => {
    const model = queryOutcomeModels({
      endpointId:
        "vestibular-schwannoma-tumour-control",
    })[0];

    expect(model?.evidenceForm).toBe(
      "model-derived",
    );
    expect(
      model?.points.find(
        (point) => point.id === "vs-25gy-5fx",
      )?.probability,
    ).toBe(0.972);
  });

  it("flags the 40 Gy in 5 fractions spine 90% TCP point as extrapolated", () => {
    const resolved = resolveOutcomeModel(
      "hytec-spinal-mets-2y-tcp",
    );
    const point = resolved.model.points.find(
      (candidate) =>
        candidate.id === "spine-90tcp-40gy-5fx",
    );

    expect(point?.probability).toBe(0.9);
    expect(point?.extrapolated).toBe(true);
  });

  it("stores liver BED10 evidence as stratified observation rather than a continuous model", () => {
    const resolved = resolveOutcomeModel(
      "hytec-liver-metastases-bed10-local-control",
    );

    expect(resolved.model.evidenceForm).toBe(
      "stratified-observation",
    );
    expect(
      resolved.model.points.map((point) => ({
        subgroup: point.subgroup,
        probability: point.probability,
      })),
    ).toEqual([
      {
        subgroup: "BED10 >100 Gy",
        probability: 0.93,
      },
      {
        subgroup: "BED10 ≤100 Gy",
        probability: 0.65,
      },
    ]);
  });

  it("preserves source-specific biological dose transforms without turning them into HFC alpha-beta defaults", () => {
    const adrenal = resolveOutcomeModel(
      "hytec-adrenal-metastases-1y-tcp",
    );
    const prostate = resolveOutcomeModel(
      "hytec-prostate-sbrt-5y-tcp",
    );

    expect(
      adrenal.model.points[0]?.dose
        .biologicalDose,
    ).toEqual({
      basis: "BED",
      valueGy: 116.4,
      alphaBetaGy: 10,
    });

    expect(
      prostate.model.points[0]?.dose
        .biologicalDose,
    ).toEqual({
      basis: "EQD2",
      valueGy: 71,
      alphaBetaGy: 1.5,
    });
  });

  it("keeps high-risk and low/intermediate-risk prostate TCP points separate", () => {
    const model = resolveOutcomeModel(
      "hytec-prostate-sbrt-5y-tcp",
    ).model;

    expect(
      model.points.filter((point) =>
        point.subgroup?.includes(
          "Low/intermediate",
        ),
      ),
    ).toHaveLength(2);

    expect(
      model.points.filter((point) =>
        point.subgroup?.includes("High-risk"),
      ),
    ).toHaveLength(2);
  });

  it("preserves stage-I NSCLC size-dependent primary-model predictions", () => {
    const model = resolveOutcomeModel(
      "nsclc-stage-i-size-adjusted-2y-tcp",
    ).model;

    expect(model.points).toHaveLength(6);
    expect(
      model.points.find(
        (point) => point.id === "nsclc-50gy-5fx-3cm-2y",
      )?.probability,
    ).toBe(0.9);
    expect(
      model.points.find(
        (point) => point.id === "nsclc-54gy-3fx-5cm-2y",
      )?.probability,
    ).toBe(0.96);
  });

  it("stores HN reirradiation dose-response as five-fraction-equivalent source doses", () => {
    const model = resolveOutcomeModel(
      "hytec-hn-reirradiation-local-control",
    ).model;
    const d50 = model.points.find(
      (point) => point.id === "hn-rert-2y-d50-45p1gy5eq",
    );

    expect(d50?.dose.schedule).toBeUndefined();
    expect(d50?.dose.equivalentFractionation).toEqual({
      fractions: 5,
      totalDoseGy: 45.1,
      alphaBetaGy: 10,
    });
    expect(d50?.probability).toBe(0.5);
    expect(d50?.followUp).toBe("2 years");
  });

  it("keeps pancreatic surgery status separate and preserves source-transformed 3-fraction equivalence", () => {
    const model = resolveOutcomeModel(
      "hytec-pancreas-1y-local-control",
    ).model;

    const unresected = model.points.find(
      (point) =>
        point.id === "pancreas-unresected-33gy5fx-77lc",
    );
    const r0 = model.points.find(
      (point) =>
        point.id === "pancreas-r0-33gy5fx-over90lc",
    );

    expect(unresected?.probability).toBe(0.77);
    expect(unresected?.dose.equivalentFractionation).toEqual({
      fractions: 3,
      totalDoseGy: 28.2,
      alphaBetaGy: 10,
    });
    expect(r0?.probabilityRelation).toBe(">");
    expect(r0?.probability).toBe(0.9);
    expect(r0?.subgroup).toBe("R0 resection");
  });

});