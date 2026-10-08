import { describe, expect, it } from "vitest";
import { sources } from "../src/data/evidence/v0.1/sources.js";

const hytecClinical = [
  "redmond-2021-hytec-brain-mets-tcp",
  "milano-2021-hytec-brain",
  "milano-2021-hytec-optic",
  "soltys-2021-hytec-vestibular-tcp",
  "soltys-2021-hytec-spinal-mets-tcp",
  "sahgal-2021-hytec-spinal-cord",
  "vargo-2021-hytec-hn-reirradiation-tcp",
  "grimm-2021-hytec-major-vessels",
  "lee-2021-hytec-stage-i-nsclc",
  "kong-2021-hytec-lung-parenchyma",
  "ohri-2021-hytec-liver-local-control",
  "miften-2021-hytec-liver-toxicity",
  "mahadevan-2021-hytec-pancreas-tcp",
  "stumpf-2021-hytec-adrenal-tcp",
  "royce-2021-hytec-prostate-tcp",
  "wang-2021-hytec-prostate-toxicity",
] as const;

const hytecContext = [
  "grimm-2021-hytec-overview",
  "moiseenko-2021-hytec-modeling-primer",
  "song-2021-hytec-biological-principles",
  "marciscano-2021-hytec-immunomodulation",
] as const;

describe("HyTEC 2021 primary bibliography coverage", () => {
  it("registers all 16 site-specific papers from the official issue", () => {
    expect(hytecClinical).toHaveLength(16);
    for (const id of hytecClinical) {
      const source = sources.find((item) => item.id === id);
      expect(source, id).toBeDefined();
      expect(source?.year).toBe(2021);
    }
  });

  it("registers the four background papers with DOI and no numeric defaults", () => {
    expect(hytecContext).toHaveLength(4);
    for (const id of hytecContext) {
      const source = sources.find((item) => item.id === id);
      expect(source?.year).toBe(2021);
      expect(source?.doi).toMatch(/^10\.1016\/j\.ijrobp\./);
      expect(source?.kind).toBe("other");
    }
  });

  it("does not duplicate any source id", () => {
    const ids = sources.map((source) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
