import {
  assertFiniteNumber,
  assertNonNegative,
  assertPositive,
} from "./validation.js";

export type RepopulationDoseBasis = "EQD2" | "BED";

export interface RepopulationRate {
  basis: RepopulationDoseBasis;
  rateGyPerDay: number;
  kickOffDays?: number;
}

export function activeRepopulationDays(
  overallTreatmentDays: number,
  kickOffDays = 0,
): number {
  assertNonNegative(overallTreatmentDays, "overallTreatmentDays");
  assertNonNegative(kickOffDays, "kickOffDays");

  return Math.max(0, overallTreatmentDays - kickOffDays);
}

export function repopulationPenaltyGy(
  overallTreatmentDays: number,
  rate: RepopulationRate,
): number {
  assertNonNegative(rate.rateGyPerDay, "rateGyPerDay");
  const tk = rate.kickOffDays ?? 0;

  return activeRepopulationDays(overallTreatmentDays, tk) * rate.rateGyPerDay;
}

/**
 * Compare the same biological-dose quantity at two overall treatment times.
 *
 * The caller is responsible for matching the quantity to rate.basis:
 * - EQD2 quantity <-> Dprolif-like EQD2 rate
 * - BED quantity  <-> K-like BED rate
 */
export function correctBiologicalDoseForTreatmentTime(
  referenceBiologicalDoseGy: number,
  referenceOverallTreatmentDays: number,
  actualOverallTreatmentDays: number,
  rate: RepopulationRate,
): number {
  assertFiniteNumber(referenceBiologicalDoseGy, "referenceBiologicalDoseGy");
  assertNonNegative(referenceOverallTreatmentDays, "referenceOverallTreatmentDays");
  assertNonNegative(actualOverallTreatmentDays, "actualOverallTreatmentDays");

  const tk = rate.kickOffDays ?? 0;
  const referenceActiveDays = activeRepopulationDays(
    referenceOverallTreatmentDays,
    tk,
  );
  const actualActiveDays = activeRepopulationDays(
    actualOverallTreatmentDays,
    tk,
  );

  return (
    referenceBiologicalDoseGy -
    (actualActiveDays - referenceActiveDays) * rate.rateGyPerDay
  );
}

/**
 * BED = EQDx * (1 + x/(alpha/beta)).
 * Conversion is explicit to avoid confusing BED-based K with EQD2-based Dprolif.
 */
export function bedRateToEqdRate(
  bedRateGyPerDay: number,
  alphaBetaGy: number,
  referenceDosePerFractionGy = 2,
): number {
  assertNonNegative(bedRateGyPerDay, "bedRateGyPerDay");
  assertPositive(alphaBetaGy, "alphaBetaGy");
  assertPositive(referenceDosePerFractionGy, "referenceDosePerFractionGy");

  return bedRateGyPerDay / (1 + referenceDosePerFractionGy / alphaBetaGy);
}

export function eqdRateToBedRate(
  eqdRateGyPerDay: number,
  alphaBetaGy: number,
  referenceDosePerFractionGy = 2,
): number {
  assertNonNegative(eqdRateGyPerDay, "eqdRateGyPerDay");
  assertPositive(alphaBetaGy, "alphaBetaGy");
  assertPositive(referenceDosePerFractionGy, "referenceDosePerFractionGy");

  return eqdRateGyPerDay * (1 + referenceDosePerFractionGy / alphaBetaGy);
}
