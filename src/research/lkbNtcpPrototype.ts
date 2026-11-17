/**
 * P6.4a: isolated, mathematical LKB demonstration for synthetic differential DVHs.
 *
 * NOT connected to the clinical HFC evidence registry, Treatment Gap, browser UI,
 * patient planning, or a validated TCP/NTCP endpoint model.
 *
 * The caller is responsible for source-specific contour and dose normalisation.
 * No BED/EQD2 conversions are performed here, deliberately.
 */
export interface ResearchLkbDvhBin {
  /** Hypothetical dose in Gy, NOT automatically EQD2. */
  doseGy: number;
  /** Fraction of total contoured organ volume: all bins must sum to 1. */
  volumeFraction: number;
}

export interface ResearchLkbParameters {
  /** Homogeneous-irradiation TD50 in source-consistent Gy. */
  td50Gy: number;
  /** Dimensionless Lyman slope parameter, must be strictly positive. */
  m: number;
  /** Dimensionless dose-volume exponent parameter, must be strictly positive. */
  n: number;
}

export interface ResearchLkbResult {
  /** Generalized equivalent uniform dose in the input dose unit (Gy). */
  effectiveDoseGy: number;
  /** Standard-normal coordinate (D_eff - TD50)/(m*TD50). */
  t: number;
  /** Normal CDF of t, a toy model probability, NOT clinical patient risk. */
  probability: number;
}

/** Standard Gaussian CDF; A&S 7.1.26 / common five-term approximation. */
function standardNormalCdf(z: number): number {
  if (z === 0) return 0.5;
  const x = Math.abs(z);
  const k = 1 / (1 + 0.2316419 * x);
  const polynomial = k * (
    0.319381530 +
    k * (-0.356563782 +
    k * (1.781477937 +
    k * (-1.821255978 + k * 1.330274429)))
  );
  const upperTail = Math.exp(-0.5 * x * x) * polynomial / Math.sqrt(2 * Math.PI);
  return Math.min(1, Math.max(0, z > 0 ? 1 - upperTail : upperTail));
}

/**
 * Differential-DVH effective dose: (SUM_i volumeFraction_i * doseGy_i^(1/n))^n.
 * Evaluate relative to the maximum dose to avoid overflow in steep n fits.
 */
export function evaluateResearchLkbExample(
  differentialDvh: readonly ResearchLkbDvhBin[],
  parameters: ResearchLkbParameters,
): ResearchLkbResult {
  const { td50Gy, m, n } = parameters;
  if (!Number.isFinite(td50Gy) || td50Gy <= 0 ||
      !Number.isFinite(m) || m <= 0 ||
      !Number.isFinite(n) || n <= 0) {
    throw new RangeError("Research LKB requires finite positive TD50, m and n.");
  }
  if (differentialDvh.length === 0) {
    throw new RangeError("Research LKB requires a nonempty differential DVH.");
  }
  let totalVolumeFraction = 0;
  let maximumDoseGy = 0;
  for (const bin of differentialDvh) {
    if (!Number.isFinite(bin.doseGy) || bin.doseGy < 0 ||
        !Number.isFinite(bin.volumeFraction) || bin.volumeFraction < 0) {
      throw new RangeError("Research LKB DVH bins must contain nonnegative finite dose and volume fraction.");
    }
    totalVolumeFraction += bin.volumeFraction;
    maximumDoseGy = Math.max(maximumDoseGy, bin.doseGy);
  }
  if (!Number.isFinite(totalVolumeFraction) ||
      Math.abs(totalVolumeFraction - 1) > 1e-8) {
    throw new RangeError("Research LKB requires differential DVH volume fractions to sum to one; not percentages.");
  }

  let effectiveDoseGy = 0;
  if (maximumDoseGy > 0) {
    let sumNormalised = 0;
    for (const bin of differentialDvh) {
      sumNormalised += bin.volumeFraction * Math.pow(bin.doseGy / maximumDoseGy, 1 / n);
    }
    effectiveDoseGy = maximumDoseGy * Math.pow(sumNormalised, n);
  }
  const t = (effectiveDoseGy - td50Gy) / (m * td50Gy);
  return { effectiveDoseGy, t, probability: standardNormalCdf(t) };
}
