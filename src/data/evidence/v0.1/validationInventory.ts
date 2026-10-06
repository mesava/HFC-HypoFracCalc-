export type EvidenceValidationState =
  | "validated-primary-point-only"
  | "validated-review"
  | "deprecated-untraceable-summary"
  | "validated-modelled-synthesis"
  | "deprecated-context-mismatch"
  | "deprecated-secondary-unverified"
  | "validated"
  | "validated-primary"
  | "primary-source-audit-pending";

export interface EvidenceValidationInventoryRecord {
  recordId: string;
  validationPackage: string;
  state: EvidenceValidationState;
}

/**
 * Machine-readable companion to docs/EVIDENCE_INVENTORY.md.
 * Every current evidence record must occur exactly once here.
 * Adding a new evidence record without assigning a validation state fails CI.
 */
export const evidenceValidationInventory = [
  { recordId: "ab-prostate-biochemical-control-vb2020", validationPackage: "1", state: "validated" },
  { recordId: "ab-rectum-bleeding-g1-brand2021", validationPackage: "1", state: "validated" },
  { recordId: "ab-rectum-bleeding-g2-brand2021", validationPackage: "1", state: "validated" },
  { recordId: "ab-rectum-frequency-g1-brand2021", validationPackage: "1", state: "validated" },
  { recordId: "ab-rectum-frequency-g2-brand2021", validationPackage: "1", state: "validated" },
  { recordId: "ab-rectum-pain-g1-brand2021", validationPackage: "1", state: "validated" },
  { recordId: "ab-rectum-proctitis-g1-brand2021", validationPackage: "1", state: "validated" },
  { recordId: "ab-rectum-proctitis-g2-brand2021", validationPackage: "1", state: "validated" },
  { recordId: "ab-rectum-sphincter-g1-brand2021", validationPackage: "1", state: "validated" },
  { recordId: "ab-rectum-stricture-ulcer-g1-brand2021", validationPackage: "1", state: "validated" },
  { recordId: "ab-gu-dysuria-g1-brand2023", validationPackage: "1", state: "validated" },
  { recordId: "ab-gu-dysuria-g2-brand2023", validationPackage: "1", state: "validated" },
  { recordId: "ab-gu-hematuria-g1-brand2023", validationPackage: "1", state: "validated" },
  { recordId: "ab-gu-hematuria-g2-brand2023", validationPackage: "1", state: "validated" },
  { recordId: "ab-gu-incontinence-g1-brand2023", validationPackage: "1", state: "validated" },
  { recordId: "ab-gu-incontinence-g2-brand2023", validationPackage: "1", state: "validated" },
  { recordId: "ab-gu-reduced-flow-g1-brand2023", validationPackage: "1", state: "validated" },
  { recordId: "ab-gu-reduced-flow-g2-brand2023", validationPackage: "1", state: "validated" },
  { recordId: "ab-gu-frequency-g1-brand2023", validationPackage: "1", state: "validated" },
  { recordId: "ab-gu-frequency-g2-brand2023", validationPackage: "1", state: "validated" },
  { recordId: "ab-breast-photo-fast2020", validationPackage: "1", state: "validated" },
  { recordId: "ab-breast-photo-fast2020-adjusted", validationPackage: "1", state: "validated" },
  { recordId: "ab-breast-any-nte-fast2020", validationPackage: "1", state: "validated" },
  { recordId: "ab-breast-shrinkage-fast2020", validationPackage: "1", state: "validated" },
  { recordId: "ab-breast-induration-fast2020", validationPackage: "1", state: "validated" },
  { recordId: "ab-breast-telangiectasia-fast2020", validationPackage: "1", state: "validated" },
  { recordId: "ab-breast-edema-fast2020", validationPackage: "1", state: "validated" },
  { recordId: "ab-breast-ibr-fastforward2026-adjusted", validationPackage: "1", state: "validated" },
  { recordId: "ab-breast-ibr-fastforward2026-unadjusted", validationPackage: "1", state: "validated" },
  { recordId: "ab-breast-chestwall-any-ae-fastforward2026", validationPackage: "1", state: "validated" },
  { recordId: "ab-oral-mucosa-mucositis-denham1995", validationPackage: "4", state: "validated" },
  { recordId: "ab-skin-erythema-bcr2025", validationPackage: "4", state: "validated" },
  { recordId: "ab-skin-telangiectasia-bcr2025", validationPackage: "4", state: "validated" },
  { recordId: "ab-subcutis-fibrosis-bcr2025", validationPackage: "4", state: "validated" },
  { recordId: "ab-bowel-stricture-perforation-bcr2025", validationPackage: "4", state: "validated" },
  { recordId: "ab-bowel-various-late-dische1999", validationPackage: "4", state: "validated" },
  { recordId: "ab-lung-pneumonitis-bentzen2000", validationPackage: "4", state: "validated" },
  { recordId: "ab-lung-fibrosis-dubray1995", validationPackage: "4", state: "validated" },
  { recordId: "ab-hn-late-effects-stuschke1999", validationPackage: "4", state: "validated" },
  { recordId: "ab-hn-tumour-control-stuschke1999", validationPackage: "4", state: "validated" },
  { recordId: "ab-nsclc-stage-i-stuschke2010", validationPackage: "4", state: "validated" },
  { recordId: "ab-esophagus-pcr-geh2006", validationPackage: "4", state: "validated" },
  { recordId: "ab-spinal-cord-myelopathy-jin2015", validationPackage: "4", state: "validated" },
  { recordId: "ab-spinal-cord-myelopathy-schultheiss2008", validationPackage: "4", state: "validated" },
  { recordId: "t12-laryngeal-edema-chart1999", validationPackage: "2", state: "validated-primary" },
  { recordId: "t12-skin-telangiectasia-chart1999", validationPackage: "2", state: "validated-primary" },
  { recordId: "t12-subcutis-fibrosis-chart1999", validationPackage: "2", state: "validated-primary" },
  { recordId: "t12-oral-mucositis-bcr2025", validationPackage: "2/6", state: "validated-primary" },
  { recordId: "t12-spinal-cord-myelopathy-bcr2025", validationPackage: "7", state: "deprecated-secondary-unverified" },
  { recordId: "t12-temporal-lobe-necrosis-bcr2025", validationPackage: "7", state: "deprecated-secondary-unverified" },
  { recordId: "dprolif-mucosa-chart2001", validationPackage: "2", state: "validated-primary" },
  { recordId: "dprolif-skin-erythema-chart2001", validationPackage: "2", state: "validated-primary" },
  { recordId: "dprolif-hn-various-bcr2025", validationPackage: "7", state: "deprecated-context-mismatch" },
  { recordId: "dprolif-hn-various-alternative-bcr2025", validationPackage: "7", state: "validated-modelled-synthesis" },
  { recordId: "dprolif-hn-larynx-bcr2025", validationPackage: "7", state: "deprecated-untraceable-summary" },
  { recordId: "dprolif-larynx-roberts1994", validationPackage: "7", state: "validated-primary" },
  { recordId: "dprolif-hn-tonsil-bcr2025", validationPackage: "6", state: "validated-primary" },
  { recordId: "dprolif-lung-pneumonitis-bentzen2000", validationPackage: "7", state: "validated-review" },
  { recordId: "dprolif-esophagus-pcr-geh2006", validationPackage: "6", state: "validated-primary" },
  { recordId: "dprolif-nsclc-bcr2025", validationPackage: "6", state: "validated-primary" },
  { recordId: "dprolif-medulloblastoma-bcr2025", validationPackage: "6", state: "validated-primary" },
  { recordId: "dprolif-medulloblastoma-tk21-hinata2001", validationPackage: "6", state: "validated-primary" },
  { recordId: "dprolif-prostate-bcr2025", validationPackage: "7", state: "validated-primary-point-only" },
  { recordId: "dprolif-breast-bcr2025", validationPackage: "6", state: "validated-primary" },
  { recordId: "hytec-optic-dmax-1fx-10gy", validationPackage: "3", state: "validated" },
  { recordId: "hytec-optic-dmax-3fx-20gy", validationPackage: "3", state: "validated" },
  { recordId: "hytec-optic-dmax-5fx-25gy", validationPackage: "3", state: "validated" },
  { recordId: "hytec-brain-v12-5cc-symptomatic-rn", validationPackage: "3", state: "validated" },
  { recordId: "hytec-brain-v12-10cc-symptomatic-rn", validationPackage: "3", state: "validated" },
  { recordId: "hytec-brain-v12-over15cc-symptomatic-rn", validationPackage: "3", state: "validated" },
  { recordId: "hytec-brain-v20-3fx-any-necrosis-edema", validationPackage: "3", state: "validated" },
  { recordId: "hytec-brain-v20-3fx-resection", validationPackage: "3", state: "validated" },
  { recordId: "hytec-brain-v24-5fx-any-necrosis-edema", validationPackage: "3", state: "validated" },
  { recordId: "hytec-brain-v24-5fx-resection", validationPackage: "3", state: "validated" },
  { recordId: "hytec-cord-dmax-1fx-risk-range", validationPackage: "3", state: "validated" },
  { recordId: "hytec-cord-dmax-2fx-17gy", validationPackage: "3", state: "validated" },
  { recordId: "hytec-cord-dmax-3fx-20p3gy", validationPackage: "3", state: "validated" },
  { recordId: "hytec-cord-dmax-4fx-23gy", validationPackage: "3", state: "validated" },
  { recordId: "hytec-cord-dmax-5fx-25p3gy", validationPackage: "3", state: "validated" },
  { recordId: "hytec-spinal-cord-reirradiation-lower-risk-factors", validationPackage: "3/5", state: "validated" },
] as const satisfies readonly EvidenceValidationInventoryRecord[];
