import type { EvidenceDatasetManifest } from "../../../domain/evidence.js";

export const evidenceManifest = {
  datasetVersion: "2026.10-v0.2",
  releaseStatus: "draft",
  evidenceCutoffDate: "2026-10-07",
  createdAt: "2026-10-05",
  reviewers: [],
  notes: [
    "Initial evidence-first dataset for photon external-beam radiotherapy.",
    "This draft is model-assisted curation from supplied literature and primary-source verification; technical QA does not substitute for independent clinical validation and local commissioning.",
    "Current scope includes endpoint-specific alpha/beta estimates, repair half-times, treatment-time parameters, expanded HyTEC dose-volume guidance, nine source-traceable tumour outcome models/point sets, and scalar reirradiation guidance for photon external-beam radiotherapy.",
    "Previous per-record validated labels and technical RC checks reflect earlier curation, not complete primary-paper source QA. The Oct 2026 P2 audit has classified source support for 73 HyTEC-related point/constraint/reirradiation records, including 6 missing original Ohri 2012 NSCLC points and 2 unresolved Royce prostate primary-paper model contradictions. Some official published copies were reviewed when uploaded file bytes could not be verified. No record should be interpreted as independently clinically validated solely from a validationInventory label.",
    "Release status remains draft: 103 total evidence records still require the full P2/P3 source crosswalk and independent clinical review, 95% uncertainty assessment where applicable, local governance and commissioning before patient-care use.",
  ],
} satisfies EvidenceDatasetManifest;
