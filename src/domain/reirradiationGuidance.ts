import type { EvidenceStatus } from "./evidence.js";

export type ReirradiationGuidanceQuantity =
  | "cumulative-eqd2"
  | "current-eqd2"
  | "current-to-cumulative-ratio"
  | "interval-months";

export interface ReirradiationGuidanceCriterionDefinition {
  id: string;
  label: string;
  quantity: ReirradiationGuidanceQuantity;
  relation: "<=" | ">=";
  limitValue: number;
  unit: "Gy EQD2_2" | "ratio" | "months";
  note?: string;
}

export interface ReirradiationGuidanceSet {
  id: string;
  sourceId: string;
  endpointId: string;
  status: EvidenceStatus;
  evidenceMeaning: "lower-risk-associated-factors";
  alphaBetaGy: number;
  requiredMetric: "Dmax";
  requiredStructure: "thecal-sac";
  currentFractionCountRange: {
    min: number;
    max: number;
  };
  maxPreviousCoursesSupported: number;
  technique: string[];
  criteria: ReirradiationGuidanceCriterionDefinition[];
  notes: string[];
}

export type ReirradiationCriterionStatus =
  | "met"
  | "not-met"
  | "not-assessable";

export interface ReirradiationGuidanceCriterion {
  id: string;
  label: string;
  status: ReirradiationCriterionStatus;
  observedValue?: number;
  limitValue?: number;
  relation?: "<=" | ">=";
  unit?: "Gy EQD2_2" | "ratio" | "months";
  note?: string;
}

export interface ReirradiationGuidanceAssessment {
  guidanceId: string;
  sourceId: string;
  endpointId: string;
  applicable: boolean;
  applicabilityReasons: string[];
  criteria: ReirradiationGuidanceCriterion[];
  allAssessableCriteriaMet: boolean | null;
  warnings: string[];
  calculationBasis: {
    alphaBetaGy: number;
    metric: "Dmax";
    structure: "thecal-sac";
    recoveryDiscountApplied: false;
  };
}
