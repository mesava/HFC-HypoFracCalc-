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
    "Inventory triage and technical RC checks are complete, with no evidence record in a pending validation state. The dataset remains draft pending independent clinical validation, local governance, and commissioning before approved clinical use.",
  ],
} satisfies EvidenceDatasetManifest;
