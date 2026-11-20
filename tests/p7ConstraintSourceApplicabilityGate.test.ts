import { describe, expect, it } from "vitest";
import { hytecClinicalConstraints, evidenceManifest } from "../src/data/evidence/v0.1/index.js";
import {
  assessConstraintSourceContext,
  type ConstraintSourceContext,
} from "../src/research/constraintSourceContext.js";
import { hytecOarSourceProfiles } from "../src/research/hytecOarSourceProfiles.js";

const get = (id: string) => {
  const constraint = hytecClinicalConstraints.find(item => item.id === id);
  if (!constraint) throw new Error("Missing HyTEC constraint: " + id);
  return constraint;
};

const matched = (id: string, overrides: Partial<ConstraintSourceContext> = {}) => {
  const c = get(id);
  const profile = hytecOarSourceProfiles[id];
  if (!profile) throw new Error("Missing HyTEC research profile: " + id);
  const base: ConstraintSourceContext = {
    metric: c.metric,
    unit: c.unit,
    fractions: c.fractionation?.fractions ?? c.applicability?.fractionCountRange?.min,
    radiationQuality: "photon",
    priorRadiotherapy: c.priorRadiotherapy === "yes" ? "yes" : "none",
    technique: c.technique?.[0] ?? c.applicability?.technique?.[0],
    volumeBasis: c.volumeBasis,
    populationReviewed: true,
    endpointId: c.endpointId,
    patientPopulation: profile.populations[0],
    reportingContour: profile.contour,
    fractionDeliveryPattern: "nonconsecutive",
  };
  return assessConstraintSourceContext(c, { ...base, ...overrides });
};

describe("P7: research-only source applicability, never automatic clinical acceptance", () => {
  it("does not grant clinical permission for any of the 29 OAR records", () => {
    expect(hytecClinicalConstraints).toHaveLength(29);
    expect(evidenceManifest.releaseStatus).toBe("draft");
    for (const c of hytecClinicalConstraints) {
      const a = assessConstraintSourceContext(c, {});
      expect(a.clinicalUseApproved).toBe(false);
      expect(a.canAutoEnforce).toBe(false);
      expect(a.patientRiskCalculated).toBe(false);
      expect(a.status).not.toBe("source-metadata-compatible");
      expect(a.reasons).toContain("metric-not-provided");
    }
  });

  it("rejects previously irradiated optic pathways and wrong fractionation", () => {
    const id = "hytec-optic-dmax-1fx-10gy";
    expect(matched(id).status).toBe("source-metadata-compatible");
    expect(matched(id, { priorRadiotherapy: "yes" }).reasons).toContain("prior-rt-mismatch");
    expect(matched(id, { fractions: 3 }).reasons).toContain("fraction-count-mismatch");
    expect(matched(id, { radiationQuality: "proton" }).status).toBe("incompatible");
  });

  it("does not replace target-inclusive brain V12 with brain-minus-target V12", () => {
    const id = "hytec-brain-v12-5cc-symptomatic-rn";
    // The source pooled target-inclusive V12 partly using estimated volumes;
    // matching the listed contour is NOT proof of directly measured DVH equivalence.
    expect(matched(id).status).toBe("indeterminate");
    expect(matched(id).reasons).toContain("source-volume-harmonisation-uncertain");
    const wrongContour = matched(id, { volumeBasis: "brain-minus-target" });
    expect(wrongContour.status).toBe("incompatible");
    expect(wrongContour.reasons).toContain("contour-basis-mismatch");
    const missing = matched(id, { volumeBasis: undefined });
    expect(missing.status).toBe("indeterminate");
    expect(missing.reasons).toContain("contour-basis-not-provided");
    expect(matched(id).guidanceKind).toBe("risk-point");
  });

  it("requires model contour selection; upper cord LQ extrapolation is not a clinical tolerance", () => {
    const id = "hytec-cord-dmax-5fx-25p3gy";
    const missing = matched(id);
    expect(missing.status).toBe("indeterminate");
    expect(missing.reasons).toContain("mixed-model-contour-not-selected");
    const extrapolated = matched(id, { sourceModelContour: "true-spinal-cord" });
    expect(extrapolated.status).toBe("indeterminate");
    expect(extrapolated.reasons).toContain("extrapolated-model-not-independently-validated");
    const lowerModel = matched(id, { sourceModelContour: "thecal-sac" });
    expect(lowerModel.status).toBe("source-metadata-compatible");
    expect(lowerModel.canAutoEnforce).toBe(false);
    expect(lowerModel.guidanceKind).toBe("risk-point");
  });

  it("does not conflate carotid D0.5cc objective with Dmax pooled risk", () => {
    const id = "hytec-major-vessel-d0p5cc-5fx-20gy";
    expect(matched(id).guidanceKind).toBe("planning-limit");
    const mismatched = matched(id, { metric: { kind: "Dmax" } });
    expect(mismatched.status).toBe("incompatible");
    expect(mismatched.reasons).toContain("metric-mismatch");
    expect(matched("hytec-major-vessel-dmax-5fx-20gy-risk").guidanceKind).toBe("risk-point");
  });

  it("protects liver spared VleX from being interpreted as ordinary Vx", () => {
    const id = "hytec-liver-spared-vle15gy-700cc";
    expect(matched(id).status).toBe("source-metadata-compatible");
    expect(matched(id, { metric: { kind: "Vx", xGy: 15 } }).status).toBe("incompatible");
    expect(matched(id, { volumeBasis: "target-inclusive-tissue" }).status).toBe("incompatible");
    expect(matched(id).guidanceKind).toBe("observational-threshold");
  });

  it("enforces combined-lung basis and percent rather than cc for V20", () => {
    const id = "hytec-lung-rilt-v20-10to15pct";
    expect(matched(id).status).toBe("source-metadata-compatible");
    expect(matched(id, { unit: "cc" }).reasons).toContain("metric-unit-mismatch");
    expect(matched(id, { volumeBasis: "brain-minus-target" }).status).toBe("incompatible");
    expect(matched(id, { fractions: 1 }).reasons).toContain("fraction-count-out-of-source-range");
  });

  it("cannot compare prostate bladder V(Rx dose) without prescription dose", () => {
    const id = "hytec-prostate-sbrt-bladder-vrx-5to10cc";
    const absent = matched(id);
    expect(absent.status).toBe("indeterminate");
    expect(absent.reasons).toContain("prescription-dose-not-provided");
    const wrongMetric = matched(id, { metric: { kind: "Vx", xGy: 5 }, prescriptionDoseGy: 40 });
    expect(wrongMetric.status).toBe("incompatible");
    const withPrescription = matched(id, { prescriptionDoseGy: 40 });
    expect(withPrescription.status).toBe("source-metadata-compatible");
    expect(withPrescription.canAutoEnforce).toBe(false);
  });

  it("requires source-defined normal-liver-minus-GTV contour for MLD", () => {
    const id = "hytec-liver-primary-mld-3fx-13gy";
    const a = matched(id);
    expect(a.status).toBe("source-metadata-compatible");
    expect(matched(id, { volumeBasis: "target-inclusive-tissue" }).reasons)
      .toContain("contour-basis-mismatch");
    expect(matched(id, { fractions: 6 }).status).toBe("incompatible");
    expect(matched(id, { patientPopulation: "liver-metastasis-sbrt" }).reasons)
      .toContain("source-cohort-mismatch");
  });

  it("requires source-population review when source records describe a selected cohort", () => {
    const id = "hytec-optic-dmax-1fx-10gy";
    const a = matched(id, { populationReviewed: false });
    expect(a.status).toBe("indeterminate");
    expect(a.reasons).toContain("source-population-not-reviewed");
  });
});
