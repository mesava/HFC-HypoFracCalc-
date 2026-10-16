import {
  endpoints,
  hytecPublishedFitParameterReviews,
  sources,
} from "../data/evidence/v0.1/index.js";
import type { HytecPublishedFitParameterReview } from "../domain/hytecPublishedFitParameters.js";

/**
 * Scientific reference-record QA. This must NOT feed clinical default
 * selection or generate patient prediction bands.
 */
export function validateHytecPublishedFitParameterReviews(
  records: HytecPublishedFitParameterReview[] = hytecPublishedFitParameterReviews,
): void {
  const ids = new Set<string>();
  for (const fit of records) {
    if (ids.has(fit.id)) throw new Error(`Duplicate source fit: ${fit.id}`);
    ids.add(fit.id);
    if (!sources.some(s => s.id === fit.sourceId)) {
      throw new Error(`Missing primary source for fit ${fit.id}`);
    }
    if (!endpoints.some(e => e.id === fit.endpointId)) {
      throw new Error(`Missing clinical endpoint for fit ${fit.id}`);
    }
    for (const [name, parameter] of [
      ["midpoint", fit.midpoint],
      ["gamma50", fit.slopeGamma50],
    ] as const) {
      const { value, ci95 } = parameter;
      if (
        !Number.isFinite(value) || value <= 0 ||
        ci95.level !== 0.95 ||
        !Number.isFinite(ci95.low) ||
        !Number.isFinite(ci95.high) ||
        ci95.low <= 0 ||
        !(ci95.low <= value && value <= ci95.high)
      ) {
        throw new Error(`Invalid marginal 95% CI for ${fit.id}/${name}`);
      }
    }
    if (
      !Number.isFinite(fit.fitComparison.pValue) ||
      fit.fitComparison.pValue < 0 ||
      fit.fitComparison.pValue > 1 ||
      fit.parameterConfidenceMethod !== "profile-likelihood" ||
      fit.predictionBandStatus !== "NOT_AVAILABLE_FROM_MARGINAL_PARAMETER_CI" ||
      fit.use !== "research-reference-only"
    ) {
      throw new Error(`Invalid fit uncertainty interpretation: ${fit.id}`);
    }
    if (fit.sourceId === "redmond-2021-hytec-brain-mets-tcp") {
      if (
        fit.modelFamily !== "log-logistic-sfed" ||
        fit.inputAxis !== "SFED20-Gy" ||
        fit.midpointName !== "TD50" ||
        fit.outcomeTime !== "1-year" ||
        fit.fitComparison.method !== "fisher-median-split" ||
        fit.figureBinomialIntervalLevel !== undefined ||
        !fit.sourceObservations
      ) throw new Error(`Incorrect Redmond fit context: ${fit.id}`);
    }
    if (fit.sourceId === "milano-2021-hytec-brain") {
      if (
        fit.modelFamily !== "exponential-logistic-vx" ||
        fit.midpointName !== "Vx50" ||
        fit.outcomeTime !== "not-standardised" ||
        fit.fitComparison.method !== "likelihood-ratio-versus-constant-incidence" ||
        fit.figureBinomialIntervalLevel !== 0.68 ||
        fit.inputAxis === "SFED20-Gy"
      ) throw new Error(`Incorrect Milano fit context: ${fit.id}`);
    }
  }
}
