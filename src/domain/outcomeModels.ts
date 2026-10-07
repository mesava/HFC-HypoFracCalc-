import type {
  FractionationSchedule,
} from "../core/lq.js";
import type {
  ApplicabilityDomain,
  EvidenceStatus,
} from "./evidence.js";

export type OutcomeEvidenceForm =
  | "model-derived"
  | "pooled-observation"
  | "stratified-observation";

export type OutcomeProbabilityKind =
  | "TCP"
  | "local-control"
  | "biochemical-control";

export type ProbabilityRelation =
  | "<"
  | "<="
  | "≈"
  | ">="
  | ">";

export interface BiologicalDoseReference {
  basis: "BED" | "EQD2";
  valueGy: number;
  alphaBetaGy: number;
}

export interface EquivalentFractionationReference {
  fractions: number;
  totalDoseGy: number;
  alphaBetaGy?: number;
}

export interface OutcomeDoseDescriptor {
  schedule?: FractionationSchedule;
  /**
   * Source-reported transformed fractionation, e.g. a 5-fraction-equivalent
   * total dose used for pooled HyTEC modelling. This is not necessarily the
   * actually delivered schedule.
   */
  equivalentFractionation?: EquivalentFractionationReference;
  /**
   * Used when the source reports a biological-dose threshold/point.
   * This is source provenance, not an HFC-selected alpha/beta.
   */
  biologicalDose?: BiologicalDoseReference;
  totalDoseGyRange?: {
    low: number;
    high: number;
  };
  fractionCountRange?: {
    low: number;
    high: number;
  };
}

export interface OutcomeProbabilityPoint {
  id: string;
  dose: OutcomeDoseDescriptor;
  probability: number;
  probabilityRelation?: ProbabilityRelation;
  followUp: string;
  subgroup?: string;
  extrapolated?: boolean;
  notes?: string[];
}

export interface OutcomeModel {
  id: string;
  sourceId: string;
  endpointId: string;
  status: EvidenceStatus;
  evidenceForm: OutcomeEvidenceForm;
  outcomeKind: OutcomeProbabilityKind;
  technique: string[];
  priorRadiotherapy?: "none" | "yes" | "mixed" | "not-reported";
  population?: string;
  applicability?: ApplicabilityDomain;
  points: OutcomeProbabilityPoint[];
  notes?: string[];
}
