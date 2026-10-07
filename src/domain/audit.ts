import type { DoseMetric } from "./constraints.js";
import type {
  CumulativeDoseStrategy,
  PreviousDoseDataAvailability,
  RegistrationSuitability,
  ReirradiationClassification,
  ReirradiationCourse,
  ReirradiationCourseResult,
} from "./reirradiation.js";
import type {
  ReirradiationGuidanceAssessment,
} from "./reirradiationGuidance.js";
import type { SourceReference } from "./evidence.js";

export interface ReirradiationAuditParameter {
  valueGy: number;
  selectionMode: "evidence" | "manual";
  recordId?: string;
  sourceId?: string;
}

export interface ReirradiationAuditContext {
  geometricOverlap: boolean;
  cumulativeDoseToxicityConcern: boolean;
  previousDoseData: PreviousDoseDataAvailability;
  registrationSuitability: RegistrationSuitability;
  strategy: CumulativeDoseStrategy;
}

export interface ReirradiationAuditBudget {
  cumulativeLimitGy: number;
  adjustedPriorEqd2Gy: number;
  remainingEqd2BudgetGy: number;
  fractions: number;
  maximumDosePerFractionGy: number | null;
  maximumTotalPhysicalDoseGy: number | null;
  limitAlreadyExceeded: boolean;
  warnings: string[];
}

export interface ReirradiationAuditUserConfirmations {
  thecalSacDmaxMetric: boolean;
}

export interface ReirradiationAuditResult {
  classification: ReirradiationClassification;
  cumulativePhysicalDoseGy: number;
  cumulativeBedGy: number;
  cumulativeEqd2Gy: number;
  courses: ReirradiationCourseResult[];
  warnings: string[];
}

export interface ReirradiationAuditRecord {
  schemaVersion: string;
  module: "reirradiation";
  engineVersion: string;
  generatedAtIso: string;
  evidence: {
    datasetVersion: string;
    evidenceCutoffDate: string;
    releaseStatus: string;
  };
  endpoint: {
    id: string;
    organ: string;
    label: string;
  };
  alphaBeta: ReirradiationAuditParameter;
  metric: DoseMetric;
  context: ReirradiationAuditContext;
  userConfirmations?: ReirradiationAuditUserConfirmations;
  inputCourses: ReirradiationCourse[];
  result: ReirradiationAuditResult;
  budget?: ReirradiationAuditBudget;
  guidance?: ReirradiationGuidanceAssessment;
  sources: SourceReference[];
  safetyStatement: string;
}
