import type { DoseMetric, DoseVolumeBasis } from "../domain/constraints.js";
import { hytecClinicalConstraints } from "../data/evidence/v0.1/index.js";
import { assessConstraintSourceContext } from "./constraintSourceContext.js";
import {
  hytecOarSourceProfiles,
  type HytecOarPopulation,
  type HytecReportingContour,
} from "./hytecOarSourceProfiles.js";

/**
 * P7.3 — a synthetic-only interoperability experiment, NOT a clinical import.
 * Versioned metadata only. No DVH bins, voxel arrays, patient identifiers,
 * real patient doses, confidence scores, TCP/NTCP, or constraint pass/fail.
 */
export const DVH_CONTEXT_CONTRACT_VERSION = "hfc-dvh-context/0.1.0" as const;

export type DvhDoseBasis =
  | "physical-total-gy"
  | "physical-per-fraction-gy"
  | "BED"
  | "EQD2"
  | "unknown";

export interface DvhSourceContextV1 {
  contractVersion: typeof DVH_CONTEXT_CONTRACT_VERSION;
  dataClass: "synthetic";
  producer: "BioRT" | "synthetic-test";
  constraintId: string;
  endpointId: string;
  /** DICOM labels are never treated as sufficient contour identity. */
  roi: {
    number: number | null;
    name: string | null;
    reportingContour: HytecReportingContour | null;
    volumeBasis: DoseVolumeBasis | null;
    sourceModelContour: "thecal-sac" | "true-spinal-cord" | null;
    definitionReviewed: boolean;
  };
  geometry: {
    /** Synthetic-only values. Never send real patient UIDs to public artifacts. */
    rtdoseFrameOfReferenceUid: string | null;
    rtstructFrameOfReferenceUid: string | null;
    frameMatchQa: "pass" | "fail" | "unknown";
    maskQa: "pass" | "fail" | "unknown";
    registration: "same-frame" | "registered-reviewed" | "unregistered" | "unknown";
  };
  measurement: {
    metric: DoseMetric;
    unit: "Gy" | "cc" | "%" | "probability";
    doseBasis: DvhDoseBasis;
    /** Which side of xGy is counted is critical for VleX vs Vx. */
    thresholdSide: "at-or-above" | "at-or-below" | "not-applicable";
    dvh: {
      curve: "cumulative" | "differential" | "unknown";
      volumeNormalization: "absolute-cc" | "relative-percent" | "unknown";
      doseBinWidthGy: number | null;
      interpolation: "linear" | "step" | "none" | "unknown";
      maxDefinition: "point-maximum" | "sampled-voxel-maximum" | "unknown";
      maxDefinitionReviewed: boolean;
      sampledVolumeCc: number | null;
    };
  };
  treatment: {
    fractions: number | null;
    technique: string | null;
    priorRadiotherapy: "none" | "yes" | "unknown";
    population: HytecOarPopulation | null;
    populationReviewed: boolean;
    fractionDeliveryPattern: "consecutive" | "nonconsecutive" | "other" | "unknown";
    /** Explicit plan target needed for prescription-relative V(Rx dose). */
    prescriptionTargets: { targetId: string; physicalTotalDoseGy: number }[];
    selectedPrescriptionTargetId: string | null;
    phaseCount: number | null;
    simultaneousPhaseDoseSum: "not-applicable" | "verified-per-voxel" | "unknown";
    interCourseAccumulation: "none" | "registered-reviewed" | "unverified";
  };
}

export type DvhResearchStatus =
  | "invalid-contract"
  | "incompatible"
  | "indeterminate"
  | "source-metadata-compatible";
export interface DvhResearchAssessment {
  status: DvhResearchStatus;
  reasons: string[];
  clinicalUseApproved: false;
  canAutoEnforce: false;
  patientRiskCalculated: false;
  doseVolumeLimitChecked: false;
}

const make = (status: DvhResearchStatus, reasons: string[]): DvhResearchAssessment => ({
  status, reasons: [...new Set(reasons)], clinicalUseApproved: false,
  canAutoEnforce: false, patientRiskCalculated: false, doseVolumeLimitChecked: false,
});
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const keys = (value: Record<string, unknown>, expected: readonly string[]): boolean =>
  Object.keys(value).every(key => expected.includes(key)) &&
  expected.every(key => Object.prototype.hasOwnProperty.call(value, key));
const oneOf = (value: unknown, allowed: readonly string[]): value is string =>
  typeof value === "string" && allowed.includes(value);
const stringOrNull = (value: unknown): value is string | null =>
  value === null || (typeof value === "string" && value.trim().length > 0);
const positiveOrNull = (value: unknown): value is number | null =>
  value === null || (typeof value === "number" && Number.isFinite(value) && value > 0);
const positiveIntOrNull = (value: unknown): value is number | null =>
  value === null || (typeof value === "number" && Number.isSafeInteger(value) && value > 0);
const metricKinds = ["Dmax", "D0.03cc", "D0.1cc", "D0.5cc", "D1cc", "D2cc", "mean-dose", "Vx", "VleX", "custom"];
const allowedContour = ["optic-nerve-or-chiasm", "brain-tissue-including-target", "model-dependent-spinal-cord",
  "carotid-major-vessel", "both-lungs-minus-gtv-igtv", "normal-liver-minus-gtv",
  "bladder-source-defined", "urethra-source-defined", "rectum-source-defined"];
const allowedBasis = ["target-inclusive-tissue", "brain-minus-target", "normal-liver-minus-gtv",
  "bilateral-lungs-minus-gtv-or-igtv"];
const allowedPopulation = ["lesions-near-optic-pathways", "brain-metastases", "de-novo-spine-sbrt",
  "head-neck-reirradiation", "small-peripheral-lung-sbrt", "primary-hepatic-sbrt",
  "liver-metastasis-sbrt", "prostate-sbrt"];

function validMetric(value: unknown): value is DoseMetric {
  if (!record(value) || !oneOf(value.kind, metricKinds)) return false;
  if (value.kind === "Vx" || value.kind === "VleX")
    return keys(value, ["kind", "xGy"]) && typeof value.xGy === "number" &&
      Number.isFinite(value.xGy) && value.xGy > 0;
  if (value.kind === "custom")
    return keys(value, ["kind", "customLabel"]) && typeof value.customLabel === "string" &&
      value.customLabel === "V(Rx dose)";
  return keys(value, ["kind"]);
}

/** Validate untrusted JSON shape *before* comparing it with a source constraint.
 * All fields are required (unknowns represented by explicit null/"unknown").
 * Strict nested keys reject accidental identifiers, hidden numerical DVHs,
 * or future incompatible versions. Do not use this as an anonymiser.
 */
export function inspectDvhContextShape(input: unknown): string[] {
  const errors: string[] = [];
  if (!record(input)) return ["payload-not-an-object"];
  if (!keys(input, ["contractVersion", "dataClass", "producer", "constraintId", "endpointId",
    "roi", "geometry", "measurement", "treatment"])) errors.push("payload-keys-invalid");
  if (input.contractVersion !== DVH_CONTEXT_CONTRACT_VERSION) errors.push("contract-version-unsupported");
  if (input.dataClass !== "synthetic") errors.push("non-synthetic-data-rejected");
  if (!oneOf(input.producer, ["BioRT", "synthetic-test"])) errors.push("producer-invalid");
  if (!stringOrNull(input.constraintId) || input.constraintId === null ||
      !stringOrNull(input.endpointId) || input.endpointId === null) errors.push("source-identity-invalid");

  const roi = input.roi;
  if (!record(roi) || !keys(roi, ["number", "name", "reportingContour", "volumeBasis", "sourceModelContour", "definitionReviewed"]) ||
      !positiveIntOrNull(roi.number) || !stringOrNull(roi.name) ||
      !(roi.reportingContour === null || oneOf(roi.reportingContour, allowedContour)) ||
      !(roi.volumeBasis === null || oneOf(roi.volumeBasis, allowedBasis)) ||
      !(roi.sourceModelContour === null || oneOf(roi.sourceModelContour, ["thecal-sac", "true-spinal-cord"])) ||
      typeof roi.definitionReviewed !== "boolean") errors.push("roi-shape-invalid");

  const g = input.geometry;
  if (!record(g) || !keys(g, ["rtdoseFrameOfReferenceUid", "rtstructFrameOfReferenceUid",
    "frameMatchQa", "maskQa", "registration"]) ||
      !stringOrNull(g.rtdoseFrameOfReferenceUid) || !stringOrNull(g.rtstructFrameOfReferenceUid) ||
      !oneOf(g.frameMatchQa, ["pass", "fail", "unknown"]) ||
      !oneOf(g.maskQa, ["pass", "fail", "unknown"]) ||
      !oneOf(g.registration, ["same-frame", "registered-reviewed", "unregistered", "unknown"]))
    errors.push("geometry-shape-invalid");

  const m = input.measurement;
  if (!record(m) || !keys(m, ["metric", "unit", "doseBasis", "thresholdSide", "dvh"]) ||
      !validMetric(m.metric) || !oneOf(m.unit, ["Gy", "cc", "%", "probability"]) ||
      !oneOf(m.doseBasis, ["physical-total-gy", "physical-per-fraction-gy", "BED", "EQD2", "unknown"]) ||
      !oneOf(m.thresholdSide, ["at-or-above", "at-or-below", "not-applicable"]))
    errors.push("measurement-shape-invalid");
  const h = record(m) ? m.dvh : undefined;
  if (!record(h) || !keys(h, ["curve", "volumeNormalization", "doseBinWidthGy",
    "interpolation", "maxDefinition", "maxDefinitionReviewed", "sampledVolumeCc"]) ||
      !oneOf(h.curve, ["cumulative", "differential", "unknown"]) ||
      !oneOf(h.volumeNormalization, ["absolute-cc", "relative-percent", "unknown"]) ||
      !positiveOrNull(h.doseBinWidthGy) || !positiveOrNull(h.sampledVolumeCc) ||
      !oneOf(h.interpolation, ["linear", "step", "none", "unknown"]) ||
      !oneOf(h.maxDefinition, ["point-maximum", "sampled-voxel-maximum", "unknown"]) ||
      typeof h.maxDefinitionReviewed !== "boolean") errors.push("dvh-provenance-shape-invalid");

  const t = input.treatment;
  if (!record(t) || !keys(t, ["fractions", "technique", "priorRadiotherapy", "population",
    "populationReviewed", "fractionDeliveryPattern", "prescriptionTargets",
    "selectedPrescriptionTargetId", "phaseCount", "simultaneousPhaseDoseSum",
    "interCourseAccumulation"]) ||
      !positiveIntOrNull(t.fractions) || !stringOrNull(t.technique) ||
      !oneOf(t.priorRadiotherapy, ["none", "yes", "unknown"]) ||
      !(t.population === null || oneOf(t.population, allowedPopulation)) ||
      typeof t.populationReviewed !== "boolean" ||
      !oneOf(t.fractionDeliveryPattern, ["consecutive", "nonconsecutive", "other", "unknown"]) ||
      !Array.isArray(t.prescriptionTargets) ||
      !t.prescriptionTargets.every(x => record(x) && keys(x, ["targetId", "physicalTotalDoseGy"]) &&
        stringOrNull(x.targetId) && x.targetId !== null &&
        typeof x.physicalTotalDoseGy === "number" && Number.isFinite(x.physicalTotalDoseGy) &&
        x.physicalTotalDoseGy > 0) ||
      !stringOrNull(t.selectedPrescriptionTargetId) ||
      !positiveIntOrNull(t.phaseCount) ||
      !oneOf(t.simultaneousPhaseDoseSum, ["not-applicable", "verified-per-voxel", "unknown"]) ||
      !oneOf(t.interCourseAccumulation, ["none", "registered-reviewed", "unverified"]))
    errors.push("treatment-shape-invalid");
  return errors;
}

/**
 * Context matching only; never evaluates a DVH value against a limit.
 * BioRT physical DVHs are not automatically assumed equal to HyTEC contours.
 */
export function assessDvhResearchContext(input: unknown): DvhResearchAssessment {
  const invalid = inspectDvhContextShape(input);
  if (invalid.length > 0) return make("invalid-contract", invalid);
  const c = input as DvhSourceContextV1;
  const constraint = hytecClinicalConstraints.find(x => x.id === c.constraintId);
  const profile = hytecOarSourceProfiles[c.constraintId];
  if (!constraint || !profile) return make("invalid-contract", ["constraint-id-not-in-curated-hytec-29"]);

  const incompatible: string[] = [];
  const uncertain: string[] = [];
  const geom = c.geometry;
  if (geom.frameMatchQa === "fail" || geom.maskQa === "fail" || geom.registration === "unregistered")
    incompatible.push("geometry-or-mask-qa-failed");
  if (geom.rtdoseFrameOfReferenceUid !== null && geom.rtstructFrameOfReferenceUid !== null &&
      geom.rtdoseFrameOfReferenceUid !== geom.rtstructFrameOfReferenceUid &&
      geom.registration === "same-frame")
    incompatible.push("frame-of-reference-uid-mismatch");
  if (geom.rtdoseFrameOfReferenceUid === null || geom.rtstructFrameOfReferenceUid === null ||
      geom.frameMatchQa !== "pass" || geom.maskQa !== "pass" ||
      geom.registration === "unknown") uncertain.push("geometry-registration-qa-incomplete");
  if (geom.registration === "registered-reviewed")
    uncertain.push("registered-dose-contour-geometry-not-independently-commissioned");
  if (c.roi.number === null || c.roi.name === null || !c.roi.definitionReviewed)
    uncertain.push("roi-definition-not-reviewed");

  if (c.measurement.doseBasis === "unknown") uncertain.push("dose-basis-unknown");
  else if (c.measurement.doseBasis !== "physical-total-gy")
    incompatible.push("physical-total-dose-basis-required");

  const metric = c.measurement.metric;
  const h = c.measurement.dvh;
  if (metric.kind === "Vx" || metric.kind === "VleX" ||
      (metric.kind === "custom" && metric.customLabel === "V(Rx dose)")) {
    if (h.curve !== "cumulative") uncertain.push("cumulative-dvh-provenance-unverified");
    if (h.volumeNormalization === "unknown") uncertain.push("dvh-volume-normalization-unknown");
    else if (h.volumeNormalization !== (c.measurement.unit === "%" ? "relative-percent" : "absolute-cc"))
      incompatible.push("dvh-volume-unit-mismatch");
    if (h.doseBinWidthGy === null || h.interpolation === "unknown")
      uncertain.push("dvh-binning-or-interpolation-unknown");
  }
  if (metric.kind === "Vx" && c.measurement.thresholdSide !== "at-or-above")
    incompatible.push("vx-threshold-direction-invalid");
  if (metric.kind === "VleX" && c.measurement.thresholdSide !== "at-or-below")
    incompatible.push("vlex-threshold-direction-invalid");
  if (metric.kind !== "Vx" && metric.kind !== "VleX" &&
      c.measurement.thresholdSide !== (metric.kind === "custom" ? "at-or-above" : "not-applicable"))
    incompatible.push("threshold-direction-unexpected");

  if (metric.kind === "Dmax") {
    if (h.maxDefinition !== "point-maximum" || !h.maxDefinitionReviewed)
      uncertain.push("dmax-definition-not-source-comparable");
  }
  if (metric.kind === "D0.5cc") {
    if (h.curve !== "cumulative" || h.volumeNormalization !== "absolute-cc" ||
        h.sampledVolumeCc === null || h.sampledVolumeCc < 0.5 ||
        h.doseBinWidthGy === null || h.interpolation === "unknown")
      uncertain.push("near-max-dcc-dvh-provenance-insufficient");
  }
  if (metric.kind === "mean-dose" && (h.sampledVolumeCc === null || h.sampledVolumeCc <= 0))
    uncertain.push("mean-dose-sampled-volume-unknown");

  const t = c.treatment;
  const rxIds = t.prescriptionTargets.map(x => x.targetId);
  if (new Set(rxIds).size !== rxIds.length) incompatible.push("duplicate-prescription-target-id");
  const rx = t.prescriptionTargets.find(x => x.targetId === t.selectedPrescriptionTargetId);
  if (t.selectedPrescriptionTargetId !== null && !rx)
    incompatible.push("selected-prescription-target-not-found");
  if (metric.kind === "custom" && metric.customLabel === "V(Rx dose)" && !rx)
    uncertain.push("explicit-prescription-target-required");
  if (t.phaseCount === null) uncertain.push("treatment-phase-count-unknown");
  else if (t.phaseCount > 1) uncertain.push("multiphase-voxel-dose-not-supported");
  if (t.simultaneousPhaseDoseSum !== "not-applicable")
    uncertain.push("simultaneous-phase-accumulation-not-supported");
  if (t.interCourseAccumulation !== "none")
    uncertain.push("intercourse-dose-accumulation-not-supported");

  const base = assessConstraintSourceContext(constraint, {
    metric,
    unit: c.measurement.unit,
    fractions: t.fractions ?? undefined,
    radiationQuality: "photon",
    technique: t.technique ?? undefined,
    priorRadiotherapy: t.priorRadiotherapy === "unknown" ? undefined : t.priorRadiotherapy,
    volumeBasis: c.roi.volumeBasis ?? undefined,
    sourceModelContour: c.roi.sourceModelContour ?? undefined,
    prescriptionDoseGy: rx?.physicalTotalDoseGy,
    populationReviewed: t.populationReviewed,
    endpointId: c.endpointId,
    patientPopulation: t.population ?? undefined,
    reportingContour: c.roi.reportingContour ?? undefined,
    fractionDeliveryPattern: t.fractionDeliveryPattern === "unknown" ? undefined : t.fractionDeliveryPattern,
  });
  if (base.status === "incompatible") incompatible.push(...base.reasons);
  else if (base.status === "indeterminate") uncertain.push(...base.reasons);

  if (incompatible.length > 0) return make("incompatible", [...incompatible, ...uncertain]);
  if (uncertain.length > 0) return make("indeterminate", uncertain);
  return make("source-metadata-compatible", [
    "metadata-only-no-dose-volume-or-clinical-comparison",
  ]);
}
