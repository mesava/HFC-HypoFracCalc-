import type { ConfidenceInterval } from "./evidence.js";

/**
 * SOURCE-REPORTED FIT PARAMETERS only. These records are not independent
 * validated clinical TCP/NTCP calculators and contain NO confidence band
 * for a patient outcome. Marginal CIs cannot be propagated independently
 * without source covariance / profile likelihood / cohort measurements.
 */
export interface HytecPublishedFitParameterReview {
  id: string;
  sourceId: string;
  endpointId: string;
  sourceLocator: string;
  cohort: string;
  subgroup: string;
  modelFamily: "log-logistic-sfed" | "exponential-logistic-vx";
  inputAxis: "SFED20-Gy" | "tissue-V12-SFED2-cc" | "tissue-V14-SFED2-cc";
  outcomeTime: "1-year" | "not-standardised";
  sourceObservations?: number;
  midpointName: "TD50" | "Vx50";
  midpoint: { value: number; ci95: ConfidenceInterval };
  slopeGamma50: { value: number; ci95: ConfidenceInterval };
  fitComparison: {
    method: "fisher-median-split" | "likelihood-ratio-versus-constant-incidence";
    pValue: number;
    relation: "=" | "<";
  };
  parameterConfidenceMethod: "profile-likelihood";
  /** FIGURE data points may use a different interval convention. */
  figureBinomialIntervalLevel?: 0.68;
  /** A mandatory disambiguation, not a result inferred from marginal CI bounds. */
  predictionBandStatus: "NOT_AVAILABLE_FROM_MARGINAL_PARAMETER_CI";
  use: "research-reference-only";
  notes?: string;
}
