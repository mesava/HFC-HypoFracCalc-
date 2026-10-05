export type EvidenceStatus =
  | "candidate"
  | "reviewed"
  | "preferred"
  | "deprecated";

export type EvidenceKind =
  | "randomized-trial"
  | "meta-analysis"
  | "systematic-review"
  | "consensus"
  | "guideline"
  | "cohort"
  | "modeling-study"
  | "textbook"
  | "other";

export interface ConfidenceInterval {
  level: 0.95;
  low: number;
  high: number;
}

export interface SourceReference {
  id: string;
  citation: string;
  year: number;
  doi?: string;
  pmid?: string;
  kind: EvidenceKind;
  notes?: string;
}

export interface EndpointIdentity {
  id: string;
  organ: string;
  endpoint: string;
  role: "tumour" | "normal-tissue";
  grade?: string;
  scoringSystem?: string;
}

export interface ApplicabilityDomain {
  radiationQuality?: "photon" | "proton" | "heavy-ion" | "brachytherapy" | "mixed";
  technique?: string[];
  dosePerFractionGyRange?: {
    min?: number;
    max?: number;
  };
  fractionCountRange?: {
    min?: number;
    max?: number;
  };
  priorRadiotherapy?: "none" | "yes" | "mixed" | "not-reported";
  followUp?: string;
  population?: string;
  systemicTherapy?: string;
  notes?: string[];
}

interface ParameterRecordBase {
  id: string;
  endpointId: string;
  sourceId: string;
  status: EvidenceStatus;
  applicability?: ApplicabilityDomain;
  notes?: string[];
}

export interface AlphaBetaEstimate extends ParameterRecordBase {
  parameter: "alpha-beta";
  valueGy: number;
  ci95?: ConfidenceInterval;
}

export interface RepairHalfTimeEstimate extends ParameterRecordBase {
  parameter: "repair-half-time";
  valueHours?: number;
  rangeHours?: {
    low?: number;
    high?: number;
  };
  qualifier?: "point" | "range" | "lower-bound" | "upper-bound";
  ci95?: ConfidenceInterval;
}

export interface RepopulationRateEstimate extends ParameterRecordBase {
  parameter: "repopulation-rate";
  basis: "EQD2" | "BED";
  rateGyPerDay: number;
  ci95?: ConfidenceInterval;
  kickOffDays?: number;
  kickOffNotes?: string;
}

export type BiologicalParameterEstimate =
  | AlphaBetaEstimate
  | RepairHalfTimeEstimate
  | RepopulationRateEstimate;

export interface EvidenceBasedParameterSelection {
  selectionMode: "evidence";
  parameterRecordId: string;
}

export interface ManualParameterOverride {
  selectionMode: "manual";
  parameter: "alpha-beta" | "repair-half-time" | "repopulation-rate";
  value: number;
  unit: "Gy" | "hours" | "Gy/day";
  basis?: "EQD2" | "BED";
  rationale?: string;
}

/**
 * A calculation must record whether the biological parameter came from the
 * curated evidence dataset or was explicitly supplied by the user.
 */
export type ParameterSelection =
  | EvidenceBasedParameterSelection
  | ManualParameterOverride;

export interface EvidenceDatasetManifest {
  datasetVersion: string;
  evidenceCutoffDate: string;
  createdAt: string;
  reviewers: string[];
  notes?: string[];
}
