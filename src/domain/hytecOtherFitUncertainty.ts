/**
 * Scientific source-fit AUDIT, not OutcomeModel, not ClinicalConstraint.
 * Keep unbounded and negative profile CI bounds exactly as printed.
 * The presence of a fitted D50 / gamma50 does not establish individual TCP.
 */
export interface HytecAuditParameter {
  name: "D50" | "TD50" | "gamma50" | "alpha/beta";
  value: number;
  /** null HIGH means the paper prints N (no finite upper CI bound). */
  ci95?: { low: number; high: number | null };
}

export interface HytecAuditFitVariant {
  id: string;
  labelRu: string;
  labelEn: string;
  followUp: string;
  doseAxis: string;
  sampleCount?: number;
  sourceLocator: string;
  modelFamily: "LQ-Poisson" | "LQL-Poisson" | "logistic" | "Poisson" | "source-bootstrap";
  modelParameters: HytecAuditParameter[];
  sourceOnlyRiskIntervals?: Array<{
    bed10Gy: number;
    estimate: number;
    ci95: { low: number; high: number };
  }>;
  status:
    | "published-fit-parameter-reproduced-at-selected-source-points"
    | "published-parameters-not-independently-refit"
    | "source-numeric-discrepancy-unresolved"
    | "source-bootstrap-risk-interval-only";
  noteRu: string;
  noteEn: string;
}

export interface HytecOtherFitUncertaintyReview {
  sourceId: string;
  /** Clinical endpoint displayed in HFC, not necessarily every variant in a source. */
  endpointId: string;
  sourceDoi: string;
  variants: HytecAuditFitVariant[];
  researchOnly: true;
  sourceConfidenceBandReproduced: false;
}
