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
