import type { ClinicalConstraint, DoseMetric, DoseVolumeBasis } from "../domain/constraints.js";
import {
  hytecOarSourceProfiles,
  type HytecOarPopulation,
  type HytecReportingContour,
} from "./hytecOarSourceProfiles.js";

/**
 * Research-only comparison of SOURCE CONTEXT, not a DVH pass/fail gate.
 * It does not evaluate the numerical criterion, estimate patient NTCP,
 * prove clinical suitability or authorize a treatment decision.
 */
export interface ConstraintSourceContext {
  metric?: DoseMetric | undefined;
  unit?: ClinicalConstraint["unit"] | undefined;
  fractions?: number | undefined;
  radiationQuality?: "photon" | "proton" | "heavy-ion" | "brachytherapy" | "mixed" | undefined;
  technique?: string | undefined;
  priorRadiotherapy?: "none" | "yes" | undefined;
  volumeBasis?: DoseVolumeBasis | undefined;
  /** Explicit selection of one original dose-reporting contour for a mixed-model range. */
  sourceModelContour?: "thecal-sac" | "true-spinal-cord" | undefined;
  /** Required to interpret prescription-relative V(Rx dose), not itself a dose comparison. */
  prescriptionDoseGy?: number | undefined;
  /** Human source-population assessment only, never automatic patient eligibility. */
  populationReviewed?: boolean | undefined;
  /** Evidence endpoint, never inferred from organ or prescription alone. */
  endpointId?: string | undefined;
  /** Source cohort category; still requires expert review. */
  patientPopulation?: HytecOarPopulation | undefined;
  /** Explicit reporting contour. Names alone do not establish correct segmentation. */
  reportingContour?: HytecReportingContour | undefined;
  /** Scheduling information for source-specific nonconsecutive-day guidance. */
  fractionDeliveryPattern?: "consecutive" | "nonconsecutive" | "other" | undefined;
}

export type ConstraintSourceStatus =
  | "incompatible"
  | "indeterminate"
  | "source-metadata-compatible";

export interface ConstraintSourceAssessment {
  status: ConstraintSourceStatus;
  reasons: string[];
  guidanceKind: ClinicalConstraint["guidanceKind"];
  /** These remain false even for source-metadata-compatible records. */
  clinicalUseApproved: false;
  canAutoEnforce: false;
  patientRiskCalculated: false;
}

const sameMetric = (a: DoseMetric, b: DoseMetric): boolean =>
  a.kind === b.kind &&
  (a.kind !== "Vx" && a.kind !== "VleX" || a.xGy === b.xGy) &&
  (a.kind !== "custom" || a.customLabel === b.customLabel);

const sameTechnique = (source: string, requested: string): boolean =>
  source.trim().toLocaleLowerCase("en-US") === requested.trim().toLocaleLowerCase("en-US");

export function assessConstraintSourceContext(
  constraint: ClinicalConstraint,
  context: ConstraintSourceContext,
): ConstraintSourceAssessment {
  const incompatible: string[] = [];
  const indeterminate: string[] = [];
  const missing = (code: string) => indeterminate.push(code);

  if (!context.metric) missing("metric-not-provided");
  else if (!sameMetric(constraint.metric, context.metric)) incompatible.push("metric-mismatch");

  if (!context.unit) missing("metric-unit-not-provided");
  else if (context.unit !== constraint.unit) incompatible.push("metric-unit-mismatch");

  if (context.radiationQuality === undefined) missing("radiation-quality-not-provided");
  else if (context.radiationQuality !== (constraint.applicability?.radiationQuality ?? "photon"))
    incompatible.push("radiation-quality-out-of-scope");

  const exactFractions = constraint.fractionation?.fractions;
  const range = constraint.applicability?.fractionCountRange;
  if (context.fractions === undefined) missing("fraction-count-not-provided");
  else if (!Number.isInteger(context.fractions) || context.fractions < 1)
    incompatible.push("fraction-count-invalid");
  else if (exactFractions !== undefined && context.fractions !== exactFractions)
    incompatible.push("fraction-count-mismatch");
  else if (range && ((range.min !== undefined && context.fractions < range.min) ||
    (range.max !== undefined && context.fractions > range.max)))
    incompatible.push("fraction-count-out-of-source-range");
  else if (exactFractions === undefined && !range)
    missing("source-fractionation-not-structured");

  const prior = constraint.priorRadiotherapy ?? constraint.applicability?.priorRadiotherapy;
  if (prior === "none" || prior === "yes") {
    if (context.priorRadiotherapy === undefined) missing("prior-rt-not-provided");
    else if (context.priorRadiotherapy !== prior) incompatible.push("prior-rt-mismatch");
  }

  const techniques = constraint.technique ?? constraint.applicability?.technique;
  if (techniques && techniques.length > 0) {
    if (!context.technique) missing("technique-not-provided");
    else if (!techniques.some(t => sameTechnique(t, context.technique!)))
      incompatible.push("technique-not-in-source");
  }

  if (constraint.volumeBasis) {
    if (!context.volumeBasis) missing("contour-basis-not-provided");
    else if (context.volumeBasis !== constraint.volumeBasis) incompatible.push("contour-basis-mismatch");
  } else if (constraint.metric.kind === "mean-dose") {
    // A source note alone cannot establish the DVH contour; report unknown rather than infer.
    missing("source-mean-dose-contour-not-structured");
  }

  if (constraint.metric.kind === "custom" && constraint.metric.customLabel === "V(Rx dose)") {
    if (context.prescriptionDoseGy === undefined) missing("prescription-dose-not-provided");
    else if (!Number.isFinite(context.prescriptionDoseGy) || context.prescriptionDoseGy <= 0)
      incompatible.push("prescription-dose-invalid");
  }

  const profile = hytecOarSourceProfiles[constraint.id];
  if (profile) {
    if (context.endpointId === undefined) missing("endpoint-not-provided");
    else if (context.endpointId !== constraint.endpointId) incompatible.push("endpoint-mismatch");

    if (!context.patientPopulation) missing("source-cohort-not-provided");
    else if (!profile.populations.includes(context.patientPopulation))
      incompatible.push("source-cohort-mismatch");

    if (!context.reportingContour) missing("source-reporting-contour-not-provided");
    else if (context.reportingContour !== profile.contour)
      incompatible.push("source-reporting-contour-mismatch");

    if (profile.schedule === "nonconsecutive-advised") {
      if (!context.fractionDeliveryPattern) missing("fraction-delivery-pattern-not-provided");
      else if (context.fractionDeliveryPattern !== "nonconsecutive")
        missing("fraction-schedule-differs-from-guidance");
    }

    // Some source syntheses estimate target-inclusive V12 from mixed contours.
    if (constraint.volumeBasisDerivation === "mixed-reported-and-estimated")
      missing("source-volume-harmonisation-uncertain");

    // Prostate OAR definitions and pooled carotid Dmax contours vary by source
    // study: a matching contour label never establishes measurement equivalence.
    if (profile.contourComparability === "mixed-or-uncertain" &&
        profile.contour !== "model-dependent-spinal-cord" &&
        profile.contour !== "brain-tissue-including-target")
      missing("source-contour-study-heterogeneity");
  }

  if ((constraint.population || profile) && context.populationReviewed !== true)
    missing("source-population-not-reviewed");

  if (constraint.doseRangeModelProvenance) {
    if (!context.sourceModelContour) missing("mixed-model-contour-not-selected");
    else {
      const endpoint = [constraint.doseRangeModelProvenance.low, constraint.doseRangeModelProvenance.high]
        .find(value => value.structure === context.sourceModelContour);
      if (!endpoint) incompatible.push("model-contour-mismatch");
      else if (endpoint.derivation === "lq-extrapolation-from-1fx")
        missing("extrapolated-model-not-independently-validated");
    }
  }

  const status: ConstraintSourceStatus = incompatible.length > 0
    ? "incompatible"
    : indeterminate.length > 0
      ? "indeterminate"
      : "source-metadata-compatible";

  return {
    status,
    reasons: [...incompatible, ...indeterminate],
    guidanceKind: constraint.guidanceKind,
    clinicalUseApproved: false,
    canAutoEnforce: false,
    patientRiskCalculated: false,
  };
}
