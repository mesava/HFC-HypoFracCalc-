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
    "Current scope includes endpoint-specific alpha/beta estimates, repair half-times, treatment-time parameters, initial HyTEC dose-volume guidance, source-traceable HyTEC tumour outcome points, and scalar reirradiation guidance for photon external-beam radiotherapy.",
    "Inventory triage is complete: no evidence record remains in a pending validation state. The dataset remains draft until user acceptance testing, browser-level regression testing, audit replay checks, and project-owner release review are complete.",
  ],
} satisfies EvidenceDatasetManifest;
