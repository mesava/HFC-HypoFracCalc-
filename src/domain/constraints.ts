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

export interface ClinicalConstraint {
  id: string;
  sourceId: string;
  endpointId: string;
  status: EvidenceStatus;
  metric: DoseMetric;
  value: number;
  unit: "Gy" | "cc" | "%" | "probability";
  fractionation?: FractionationContext;
  estimatedRisk?: number;
  riskCi95?: ConfidenceInterval;
  priorRadiotherapy?: "none" | "yes" | "mixed" | "not-reported";
  applicability?: ApplicabilityDomain;
  notes?: string[];
}
