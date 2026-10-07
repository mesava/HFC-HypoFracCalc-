export const complexRegimenLibraryManifest = {
  datasetVersion: "RCR-DF4-2024-v0.2",
  releaseStatus: "draft",
  sourceId: "rcr-2024-dose-fractionation",
  sourceEdition: "Fourth edition",
  sourceYear: 2024,
  notes: [
    "Extends the fixed-schedule v0.1 library with source-faithful dose ranges, sequential phases and simultaneous integrated boost prescriptions.",
    "Complex presets are reference structures and must not be collapsed to a single n x d schedule implicitly.",
    "A complex preset never selects an alpha/beta value or establishes clinical interchangeability.",
  ],
} as const;
