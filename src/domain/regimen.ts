import type {
  FractionationSchedule,
} from "../core/lq.js";

export interface LocalizedClinicalText {
  ru: string;
  en: string;
}

export type RegimenIntent =
  | "definitive"
  | "adjuvant"
  | "postoperative"
  | "palliative"
  | "reirradiation";

export type RecommendationGrade =
  | "A"
  | "B"
  | "C"
  | "D";

export interface ClinicalRegimenPreset {
  id: string;
  datasetVersion: string;
  sourceId: string;
  chapter: string;
  site: string;
  label: LocalizedClinicalText;
  indication: LocalizedClinicalText;
  intent: RegimenIntent;
  schedule: FractionationSchedule;
  overallTreatment?: LocalizedClinicalText;
  recommendationGrade: RecommendationGrade;
  technique?: string[];
  notes?: LocalizedClinicalText[];
  status: "reviewed";
}

export interface RegimenPresetProvenance {
  presetId: string;
  datasetVersion: string;
  sourceId: string;
  recommendationGrade: RecommendationGrade;
}
