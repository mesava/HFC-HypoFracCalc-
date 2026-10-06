import type {
  ApplicabilityDomain,
  ConfidenceInterval,
  EvidenceStatus,
} from "./evidence.js";

export type DoseMetricKind =
  | "Dmax"
  | "D0.03cc"
  | "D0.1cc"
  | "D1cc"
  | "D2cc"
  | "mean-dose"
  | "Vx"
  | "custom";

export interface DoseMetric {
  kind: DoseMetricKind;
  xGy?: number;
  customLabel?: string;
}

export interface FractionationContext {
  fractions?: number;
  dosePerFractionGy?: number;
  totalDoseGy?: number;
}

export type ConstraintRelation =
  | "<"
  | "<="
  | "="
  | "≈"
  | ">="
  | ">";

export type ClinicalGuidanceKind =
  | "planning-limit"
  | "risk-point"
  | "observational-threshold";

export interface NumericalRange {
  low: number;
  high: number;
}

export interface ClinicalConstraint {
  id: string;
  sourceId: string;
  endpointId: string;
  status: EvidenceStatus;

  /**
   * A clinical constraint is not assumed to be a hard universal tolerance.
   * The evidence meaning is stored explicitly.
   */
  guidanceKind: ClinicalGuidanceKind;

  metric: DoseMetric;
  relation: ConstraintRelation;

  /**
   * Use either a point value or a reported range. A range must not be
   * collapsed into a point estimate by the registry.
   */
  value?: number;
  valueRange?: NumericalRange;
  unit: "Gy" | "cc" | "%" | "probability";

  fractionation?: FractionationContext;

  /**
   * Risk is stored separately from the dose/volume threshold because many
   * HyTEC records are dose-volume-risk observations rather than prescriptions.
   */
  estimatedRisk?: number;
  estimatedRiskRange?: NumericalRange;
  riskRelation?: "<" | "<=" | "≈" | ">=" | ">";

  riskCi95?: ConfidenceInterval;
  priorRadiotherapy?: "none" | "yes" | "mixed" | "not-reported";
  population?: string;
  technique?: string[];
  applicability?: ApplicabilityDomain;
  notes?: string[];
}
