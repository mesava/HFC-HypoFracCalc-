import type { EvidenceDatasetManifest } from "../../../domain/evidence.js";

export const evidenceManifest = {
  datasetVersion: "2026.10-v0.1",
  releaseStatus: "draft",
  evidenceCutoffDate: "2026-10-05",
  createdAt: "2026-10-05",
  reviewers: [],
  notes: [
    "Initial evidence-first dataset for photon external-beam radiotherapy.",
    "This draft is model-assisted curation from supplied literature and selected primary-source verification; it requires project-owner review before clinical release.",
    "Current scope includes prostate, breast, rectal and GU endpoints plus selected head-and-neck, lung, esophagus, bowel, skin, mucosa and spinal-cord evidence.",
    "The dataset also contains endpoint-specific repair half-time and EQD2-based repopulation records for treatment-gap and multiple-fractions-per-day workflows.",
  ],
} satisfies EvidenceDatasetManifest;
