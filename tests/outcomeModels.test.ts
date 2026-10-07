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
});
