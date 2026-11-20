import { describe, expect, it } from "vitest";
import fixtureText from "./fixtures/dvh_source_context_v0_1_synthetic.json?raw";
import jsonSchemaText from "../docs/contracts/hfc-dvh-context-v0.1.0.schema.json?raw";
import { hytecClinicalConstraints, evidenceManifest } from "../src/data/evidence/v0.1/index.js";
import {
  DVH_CONTEXT_CONTRACT_VERSION,
  assessDvhResearchContext,
  inspectDvhContextShape,
  type DvhSourceContextV1,
} from "../src/research/dvhSourceContextContract.js";
import { hytecOarSourceProfiles } from "../src/research/hytecOarSourceProfiles.js";

const fixture = JSON.parse(fixtureText) as DvhSourceContextV1;
const clone = (): DvhSourceContextV1 => structuredClone(fixture);
const assess = (change: (x: DvhSourceContextV1) => void) => {
  const x = clone();
  change(x);
  return assessDvhResearchContext(x);
};
const hasReason = (reasons: string[], part: string) =>
  expect(reasons).toContain(part);

describe("P7.3 BioRT–HFC research-only DVH-context contract", () => {
  it("exposes an explicit versioned JSON Schema with strict nested fields", () => {
    const schema = JSON.parse(jsonSchemaText);
    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(schema.properties.contractVersion.const).toBe(DVH_CONTEXT_CONTRACT_VERSION);
    expect(schema.properties.dataClass.const).toBe("synthetic");
    expect(schema.additionalProperties).toBe(false);
    for (const part of ["roi", "geometry", "measurement", "treatment"])
      expect(schema.properties[part].additionalProperties).toBe(false);
    expect(inspectDvhContextShape(fixture)).toEqual([]);
    expect(evidenceManifest.releaseStatus).toBe("draft");
  });

  it("does not calculate DVH values, patient risks or clinical acceptance", () => {
    const result = assessDvhResearchContext(fixture);
    expect(result).toEqual({
      status: "source-metadata-compatible",
      reasons: ["metadata-only-no-dose-volume-or-clinical-comparison"],
      canAutoEnforce: false,
      clinicalUseApproved: false,
      patientRiskCalculated: false,
      doseVolumeLimitChecked: false,
    });
  });

  it("rejects unknown contract versions, non-synthetic payloads and PHI-like extra keys", () => {
    expect(assess(x => { x.contractVersion = "hfc-dvh-context/0.2.0" as typeof DVH_CONTEXT_CONTRACT_VERSION; }).status)
      .toBe("invalid-contract");
    const real = { ...clone(), dataClass: "patient", patientId: "not-allowed" };
    const out = assessDvhResearchContext(real);
    expect(out.status).toBe("invalid-contract");
    hasReason(out.reasons, "non-synthetic-data-rejected");
    hasReason(out.reasons, "payload-keys-invalid");
    const nested = clone() as DvhSourceContextV1 & { roi: DvhSourceContextV1["roi"] & { patientName?: string } };
    nested.roi.patientName = "No Name";
    hasReason(assessDvhResearchContext(nested).reasons, "roi-shape-invalid");
  });

  it("never accepts missing or misleading RTDOSE/RTSTRUCT frame of reference", () => {
    let r = assess(x => { x.geometry.rtstructFrameOfReferenceUid = null; });
    expect(r.status).toBe("indeterminate");
    hasReason(r.reasons, "geometry-registration-qa-incomplete");

    r = assess(x => { x.geometry.rtstructFrameOfReferenceUid = "1.2.3.999"; });
    expect(r.status).toBe("incompatible");
    hasReason(r.reasons, "frame-of-reference-uid-mismatch");

    r = assess(x => { x.geometry.frameMatchQa = "fail"; });
    expect(r.status).toBe("incompatible");
    hasReason(r.reasons, "geometry-or-mask-qa-failed");

    r = assess(x => { x.geometry.registration = "registered-reviewed"; });
    expect(r.status).toBe("indeterminate");
    hasReason(r.reasons, "registered-dose-contour-geometry-not-independently-commissioned");
  });

  it("requires RTSTRUCT ROI definition and mask QA, not a matching label only", () => {
    const u = assess(x => { x.roi.definitionReviewed = false; });
    expect(u.status).toBe("indeterminate");
    hasReason(u.reasons, "roi-definition-not-reviewed");
    const bad = assess(x => { x.roi.reportingContour = "normal-liver-minus-gtv"; });
    expect(bad.status).toBe("incompatible");
    hasReason(bad.reasons, "source-reporting-contour-mismatch");
    const mask = assess(x => { x.geometry.maskQa = "unknown"; });
    expect(mask.status).toBe("indeterminate");
  });

  it("does not silently convert BED, EQD2 or per-fraction Gy to physical total Gy", () => {
    for (const basis of ["BED", "EQD2", "physical-per-fraction-gy"] as const) {
      const x = assess(v => { v.measurement.doseBasis = basis; });
      expect(x.status).toBe("incompatible");
      hasReason(x.reasons, "physical-total-dose-basis-required");
    }
    expect(assess(x => { x.measurement.doseBasis = "unknown"; }).status).toBe("indeterminate");
  });

  it("disallows point Dmax equivalence when BioRT supplies only sampled voxel maximum", () => {
    const r = assess(x => { x.measurement.dvh.maxDefinition = "sampled-voxel-maximum"; });
    expect(r.status).toBe("indeterminate");
    hasReason(r.reasons, "dmax-definition-not-source-comparable");
  });

  it("keeps Vx, VleX and prescription-relative volume distinct", () => {
    const c = hytecClinicalConstraints.find(v => v.id === "hytec-liver-spared-vle15gy-700cc")!;
    const p = hytecOarSourceProfiles[c.id]!;
    const x = clone();
    x.constraintId = c.id;
    x.endpointId = c.endpointId;
    x.measurement.metric = c.metric;
    x.measurement.unit = c.unit;
    x.measurement.thresholdSide = "at-or-below";
    x.roi.volumeBasis = c.volumeBasis ?? null;
    x.roi.reportingContour = p.contour;
    x.treatment.technique = c.technique?.[0] ?? null;
    x.treatment.population = p.populations[0]!;
    x.treatment.fractions = 3;
    const ok = assessDvhResearchContext(x);
    expect(ok.status).not.toBe("incompatible");
    x.measurement.thresholdSide = "at-or-above";
    hasReason(assessDvhResearchContext(x).reasons, "vlex-threshold-direction-invalid");
    x.measurement.thresholdSide = "at-or-below";
    x.measurement.metric = { kind: "Vx", xGy: 15 };
    expect(assessDvhResearchContext(x).status).toBe("incompatible");
  });

  it("requires cumulative DVH, explicit binning and correct absolute vs relative Vx unit", () => {
    const c = hytecClinicalConstraints.find(v => v.id === "hytec-lung-rilt-v20-10to15pct")!;
    const p = hytecOarSourceProfiles[c.id]!;
    const x = clone();
    x.constraintId = c.id;
    x.endpointId = c.endpointId;
    x.roi.reportingContour = p.contour;
    x.roi.volumeBasis = c.volumeBasis ?? null;
    x.measurement.metric = c.metric;
    x.measurement.unit = c.unit;
    x.measurement.thresholdSide = "at-or-above";
    x.measurement.dvh.volumeNormalization = "relative-percent";
    x.treatment.population = p.populations[0]!;
    x.treatment.fractions = 3;
    x.treatment.technique = "lung SBRT";
    expect(assessDvhResearchContext(x).status).toBe("source-metadata-compatible");

    x.measurement.dvh.volumeNormalization = "absolute-cc";
    hasReason(assessDvhResearchContext(x).reasons, "dvh-volume-unit-mismatch");
    x.measurement.dvh.volumeNormalization = "relative-percent";
    x.measurement.dvh.curve = "differential";
    const u = assessDvhResearchContext(x);
    expect(u.status).toBe("indeterminate");
    hasReason(u.reasons, "cumulative-dvh-provenance-unverified");
  });

  it("keeps unknown histogram normalization indeterminate, not a false incompatibility", () => {
    const c = hytecClinicalConstraints.find(v => v.id === "hytec-lung-rilt-v20-10to15pct")!;
    const p = hytecOarSourceProfiles[c.id]!;
    const x = clone();
    x.constraintId = c.id;
    x.endpointId = c.endpointId;
    x.roi.reportingContour = p.contour;
    x.roi.volumeBasis = c.volumeBasis ?? null;
    x.measurement.metric = c.metric;
    x.measurement.unit = c.unit;
    x.measurement.thresholdSide = "at-or-above";
    x.measurement.dvh.volumeNormalization = "unknown";
    x.treatment.population = p.populations[0]!;
    x.treatment.technique = "lung SBRT";
    x.treatment.fractions = 3;
    const result = assessDvhResearchContext(x);
    expect(result.status).toBe("indeterminate");
    hasReason(result.reasons, "dvh-volume-normalization-unknown");
    expect(result.reasons).not.toContain("dvh-volume-unit-mismatch");
  });

  it("does not use D0.5cc without an adequately sampled ROI volume and cumulative DVH", () => {
    const c = hytecClinicalConstraints.find(v => v.id === "hytec-major-vessel-d0p5cc-5fx-20gy")!;
    const p = hytecOarSourceProfiles[c.id]!;
    const x = clone();
    x.constraintId = c.id;
    x.endpointId = c.endpointId;
    x.roi.reportingContour = p.contour;
    x.measurement.metric = c.metric;
    x.treatment.population = p.populations[0]!;
    x.treatment.priorRadiotherapy = "yes";
    x.treatment.technique = "head-and-neck SBRT reirradiation";
    x.treatment.fractions = 5;
    x.treatment.fractionDeliveryPattern = "nonconsecutive";
    expect(assessDvhResearchContext(x).status).toBe("source-metadata-compatible");
    x.measurement.dvh.sampledVolumeCc = 0.3;
    const small = assessDvhResearchContext(x);
    expect(small.status).toBe("indeterminate");
    hasReason(small.reasons, "near-max-dcc-dvh-provenance-insufficient");
  });

  it("requires explicit prescription target for V(Rx dose), never guesses for two targets", () => {
    const c = hytecClinicalConstraints.find(v => v.id === "hytec-prostate-sbrt-bladder-vrx-5to10cc")!;
    const p = hytecOarSourceProfiles[c.id]!;
    const x = clone();
    x.constraintId = c.id;
    x.endpointId = c.endpointId;
    x.measurement.metric = c.metric;
    x.measurement.unit = c.unit;
    x.measurement.thresholdSide = "at-or-above";
    x.roi.reportingContour = p.contour;
    x.treatment.population = p.populations[0]!;
    x.treatment.technique = "prostate SBRT";
    x.treatment.fractions = 5;
    x.treatment.prescriptionTargets = [
      { targetId: "ptv-low", physicalTotalDoseGy: 36.25 },
      { targetId: "ptv-high", physicalTotalDoseGy: 40 },
    ];
    x.treatment.selectedPrescriptionTargetId = null;
    const unknown = assessDvhResearchContext(x);
    expect(unknown.status).toBe("indeterminate");
    hasReason(unknown.reasons, "explicit-prescription-target-required");
    x.treatment.selectedPrescriptionTargetId = "other";
    expect(assessDvhResearchContext(x).status).toBe("incompatible");
    x.treatment.selectedPrescriptionTargetId = "ptv-high";
    const m = assessDvhResearchContext(x);
    expect(m.status).toBe("indeterminate"); // prostate contour definitions heterogeneous
    hasReason(m.reasons, "source-contour-study-heterogeneity");
  });

  it("does not imply 3D reirradiation or sum simultaneous phases", () => {
    const a = assess(x => {
      x.treatment.phaseCount = 2;
      x.treatment.simultaneousPhaseDoseSum = "verified-per-voxel";
    });
    expect(a.status).toBe("indeterminate");
    hasReason(a.reasons, "multiphase-voxel-dose-not-supported");
    const b = assess(x => { x.treatment.interCourseAccumulation = "registered-reviewed"; });
    expect(b.status).toBe("indeterminate");
    hasReason(b.reasons, "intercourse-dose-accumulation-not-supported");
  });

  it("enforces fraction, prior-RT and endpoint provenance independently", () => {
    expect(assess(x => { x.treatment.fractions = 3; }).status).toBe("incompatible");
    expect(assess(x => { x.treatment.priorRadiotherapy = "yes"; }).status).toBe("incompatible");
    expect(assess(x => { x.endpointId = "brain-symptomatic-radionecrosis"; }).status)
      .toBe("incompatible");
  });

  it("maps all 29 HyTEC IDs as research context records without calculating limits", () => {
    expect(hytecClinicalConstraints).toHaveLength(29);
    for (const c of hytecClinicalConstraints) {
      const p = hytecOarSourceProfiles[c.id];
      expect(p).toBeDefined();
      const x = clone();
      x.constraintId = c.id;
      x.endpointId = c.endpointId;
      x.roi.reportingContour = p!.contour;
      x.roi.volumeBasis = c.volumeBasis ?? null;
      x.roi.sourceModelContour = c.doseRangeModelProvenance ? "thecal-sac" : null;
      x.measurement.metric = c.metric;
      x.measurement.unit = c.unit;
      x.measurement.thresholdSide = c.metric.kind === "VleX" ? "at-or-below" :
        (c.metric.kind === "Vx" || c.metric.kind === "custom") ? "at-or-above" : "not-applicable";
      x.measurement.dvh.volumeNormalization = c.unit === "%" ? "relative-percent" : "absolute-cc";
      x.treatment.population = p!.populations[0]!;
      x.treatment.technique = c.technique?.[0] ?? c.applicability?.technique?.[0] ?? null;
      x.treatment.fractions = c.fractionation?.fractions ?? c.applicability?.fractionCountRange?.min ?? null;
      x.treatment.priorRadiotherapy = c.priorRadiotherapy === "yes" ? "yes" : "none";
      x.treatment.fractionDeliveryPattern = p!.schedule === "nonconsecutive-advised" ? "nonconsecutive" : "other";
      const result = assessDvhResearchContext(x);
      expect(result.status, c.id + ": " + result.reasons.join("|")).not.toBe("invalid-contract");
      expect(result.status, c.id + ": " + result.reasons.join("|")).not.toBe("incompatible");
      expect(result.clinicalUseApproved).toBe(false);
      expect(result.canAutoEnforce).toBe(false);
      expect(result.doseVolumeLimitChecked).toBe(false);
      expect(result.patientRiskCalculated).toBe(false);
    }
  });
});
