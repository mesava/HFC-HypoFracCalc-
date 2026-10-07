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

interface ClinicalRegimenMetadata {
  id: string;
  datasetVersion: string;
  sourceId: string;
  chapter: string;
  site: string;
  label: LocalizedClinicalText;
  indication: LocalizedClinicalText;
  intent: RegimenIntent;
  overallTreatment?: LocalizedClinicalText;
  recommendationGrade: RecommendationGrade;
  technique?: string[];
  notes?: LocalizedClinicalText[];
  status: "reviewed";
}

export interface ClinicalRegimenPreset
  extends ClinicalRegimenMetadata {
  schedule: FractionationSchedule;
}

export interface RegimenDoseRange {
  low: number;
  high: number;
}

export interface DoseRangePrescription {
  kind: "dose-range";
  fractions: number;
  totalDoseGyRange: RegimenDoseRange;
}

export interface SequentialRegimenPhase {
  id: string;
  label: LocalizedClinicalText;
  target: LocalizedClinicalText;
  schedule: FractionationSchedule;
}

export interface SequentialPrescription {
  kind: "sequential";
  phases: SequentialRegimenPhase[];
}

export interface SibDoseLevel {
  id: string;
  target: LocalizedClinicalText;
  totalDoseGy: number;
}

export interface SibPrescription {
  kind: "sib";
  fractions: number;
  doseLevels: SibDoseLevel[];
}

export type ComplexRegimenPrescription =
  | DoseRangePrescription
  | SequentialPrescription
  | SibPrescription;

export interface ComplexClinicalRegimenPreset
  extends ClinicalRegimenMetadata {
  prescription: ComplexRegimenPrescription;
}

export interface RegimenPresetProvenance {
  presetId: string;
  datasetVersion: string;
  sourceId: string;
  recommendationGrade: RecommendationGrade;
}
