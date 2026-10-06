import type { EvidenceDatasetManifest } from "../../../domain/evidence.js";

export const evidenceManifest = {
  datasetVersion: "2026.10-v0.1",
  releaseStatus: "draft",
  evidenceCutoffDate: "2026-10-05",
  createdAt: "2026-10-05",
  reviewers: [],
  notes: [
    "Initial evidence-first dataset for photon external-beam radiotherapy.",
    "This draft is model-assisted curation from supplied primary literature and requires project-owner review before clinical release.",
    "Scope of this first dataset: prostate tumour control, late rectal toxicity, late genitourinary toxicity, and breast tumour/normal-tissue endpoints.",
  ],
} satisfies EvidenceDatasetManifest;
