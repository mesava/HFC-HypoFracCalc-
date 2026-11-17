import type { ClinicalConstraint, DoseMetric, DoseVolumeBasis } from "../domain/constraints.js";

/**
 * Research-only comparison of SOURCE CONTEXT, not a DVH pass/fail gate.
 * It does not evaluate the numerical criterion, estimate patient NTCP,
 * prove clinical suitability or authorize a treatment decision.
 */
export interface ConstraintSourceContext {
  metric?: DoseMetric;
  unit?: ClinicalConstraint["unit"];
  fractions?: number;
  radiationQuality?: "photon" | "proton" | "heavy-ion" | "brachytherapy" | "mixed";
  technique?: string;
  priorRadiotherapy?: "none" | "yes";
  volumeBasis?: DoseVolumeBasis;
  /** Explicit selection of one original dose-reporting contour for a mixed-model range. */
  sourceModelContour?: "thecal-sac" | "true-spinal-cord";
  /** Required to interpret prescription-relative V(Rx dose), not itself a dose comparison. */
  prescriptionDoseGy?: number;
  /** Human source-population assessment only, never automatic patient eligibility. */
  populationReviewed?: boolean;
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
    // For liver/lung MLD a free-text note is NOT machine-readable contour provenance.
    missing("source-mean-dose-contour-not-structured");
  }

  if (constraint.metric.kind === "custom" && constraint.metric.customLabel === "V(Rx dose)") {
    if (context.prescriptionDoseGy === undefined) missing("prescription-dose-not-provided");
    else if (!Number.isFinite(context.prescriptionDoseGy) || context.prescriptionDoseGy <= 0)
      incompatible.push("prescription-dose-invalid");
  }

  if (constraint.population && context.populationReviewed !== true)
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
