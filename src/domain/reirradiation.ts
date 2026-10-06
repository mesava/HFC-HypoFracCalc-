import type { DoseMetric } from "./constraints.js";
import type { FractionationSchedule } from "../core/lq.js";

export type ReirradiationClassification =
  | "type-I"
  | "type-II"
  | "repeat-irradiation";

export type CumulativeDoseStrategy =
  | "direct-point-sum"
  | "overlap-point-sum"
  | "conservative-near-max"
  | "image-registration-3d";

export type PreviousDoseDataAvailability =
  | "complete-dicom"
  | "incomplete-reconstructable"
  | "summary-only"
  | "unknown";

export type RegistrationSuitability =
  | "not-assessed"
  | "rigid-suitable"
  | "deformable-validated"
  | "uncertain"
  | "unsuitable";

export interface ManualRecoveryAssumption {
  mode: "manual-discount";
  /**
   * Fraction of the previously delivered equieffective dose that is
   * explicitly discounted by the user.
   * 0 = no recovery credit; 0.25 = discount 25% of prior contribution.
   */
  discountFraction: number;
  rationale: string;
}

export interface NoRecoveryAssumption {
  mode: "none";
}

export type RecoveryAssumption =
  | NoRecoveryAssumption
  | ManualRecoveryAssumption;

export interface ReirradiationCourse {
  id: string;
  label: string;
  role: "previous" | "current";
  schedule: FractionationSchedule;

  /**
   * Dose to the same selected OAR/target metric for this course.
   * The schedule is therefore metric-specific, not automatically the
   * prescription schedule.
   */
  metric: DoseMetric;

  /**
   * Optional interval from this previous course to the current course.
   * It is stored for audit only and never generates automatic recovery.
   */
  intervalToCurrentMonths?: number;

  recovery?: RecoveryAssumption;
  notes?: string;
}

export interface ReirradiationScenarioContext {
  geometricOverlap: boolean;
  cumulativeDoseToxicityConcern: boolean;
  previousDoseData: PreviousDoseDataAvailability;
  registrationSuitability: RegistrationSuitability;
  strategy: CumulativeDoseStrategy;
}

export interface ReirradiationCourseResult {
  id: string;
  label: string;
  role: "previous" | "current";
  physicalDoseGy: number;
  bedGy: number;
  eqd2Gy: number;
  recoveryDiscountFraction: number;
  adjustedBedGy: number;
  adjustedEqd2Gy: number;
  intervalToCurrentMonths?: number;
  recoveryRationale?: string;
}

export interface ReirradiationEvaluationResult {
  classification: ReirradiationClassification;
  strategy: CumulativeDoseStrategy;
  metric: DoseMetric;
  alphaBetaGy: number;
  courses: ReirradiationCourseResult[];
  cumulativePhysicalDoseGy: number;
  cumulativeBedGy: number;
  cumulativeEqd2Gy: number;
  warnings: string[];
  audit: {
    previousDoseData: PreviousDoseDataAvailability;
    registrationSuitability: RegistrationSuitability;
    recoveryApplied: boolean;
  };
}

export interface RemainingDoseBudgetResult {
  basis: "EQD2";
  cumulativeLimitGy: number;
  adjustedPriorEqd2Gy: number;
  remainingEqd2BudgetGy: number;
  fractions: number;
  alphaBetaGy: number;
  maximumDosePerFractionGy: number | null;
  maximumTotalPhysicalDoseGy: number | null;
  limitAlreadyExceeded: boolean;
  warnings: string[];
}
