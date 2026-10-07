export const regimenLibraryManifest = {
  datasetVersion: "RCR-DF4-2024-v0.1",
  releaseStatus: "draft",
  sourceId: "rcr-2024-dose-fractionation",
  sourceEdition: "Fourth edition",
  sourceYear: 2024,
  notes: [
    "Initial curated subset of fixed-dose photon external-beam regimens from RCR Dose Fractionation, 4th ed. 2024.",
    "A preset is a clinical schedule reference and must never select an alpha/beta value automatically.",
    "Ranges and compound multi-target/SIB prescriptions are deferred until the regimen schema can represent them without collapsing source meaning.",
  ],
} as const;
