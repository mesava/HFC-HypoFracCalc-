import type {
  OutcomeModel,
} from "../../../domain/outcomeModels.js";

export const hytecOutcomeModels: OutcomeModel[] = [
  {
    id: "hytec-brain-mets-1y-local-control",
    sourceId: "redmond-2021-hytec-brain-mets-tcp",
    endpointId: "brain-metastases-local-control",
    status: "reviewed",
    evidenceForm: "model-derived",
    outcomeKind: "TCP",
    technique: ["SRS", "fSRS"],
    priorRadiotherapy: "mixed",
    population:
      "Published SRS/fSRS series for brain metastases with dose/fractionation and at least 1-year local-control data.",
    applicability: {
      radiationQuality: "photon",
      technique: ["SRS", "fSRS"],
      followUp: "1-year local control",
      notes: [
        "Necrosis and pseudoprogression can complicate local-control assessment.",
        "Lesion size materially modifies the dose-response relationship.",
        "The pooled literature was heterogeneous and retrospective.",
      ],
    },
    points: [
      {
        id: "brain-mets-le20mm-18gy-1fx",
        dose: {
          schedule: {
            fractions: 1,
            dosePerFractionGy: 18,
          },
        },
        probability: 0.85,
        probabilityRelation: ">",
        followUp: "1 year",
        subgroup: "Maximum tumour diameter ≤20 mm",
        notes: [
          "The source reports >85% 1-year local control at 18 Gy for lesions ≤20 mm.",
        ],
      },
      {
        id: "brain-mets-le20mm-24gy-1fx",
        dose: {
          schedule: {
            fractions: 1,
            dosePerFractionGy: 24,
          },
        },
        probability: 0.95,
        probabilityRelation: "≈",
        followUp: "1 year",
        subgroup: "Maximum tumour diameter ≤20 mm",
      },
      {
        id: "brain-mets-21-30mm-18gy-1fx",
        dose: {
          schedule: {
            fractions: 1,
            dosePerFractionGy: 18,
          },
        },
        probability: 0.75,
        probabilityRelation: "≈",
        followUp: "1 year",
        subgroup: "Maximum tumour diameter 21–30 mm",
      },
      {
        id: "brain-mets-31-40mm-15gy-1fx",
        dose: {
          schedule: {
            fractions: 1,
            dosePerFractionGy: 15,
          },
        },
        probability: 0.69,
        probabilityRelation: "≈",
        followUp: "1 year",
        subgroup: "Maximum tumour diameter 31–40 mm",
      },
    ],
    notes: [
      "HyTEC also reports approximately 80% 1-year local control for 21–40 mm lesions treated with 27–35 Gy in 3–5 fractions; that range is not collapsed into a single schedule in v0.1.",
    ],
  },
  {
    id: "hytec-vestibular-schwannoma-3to5y-tcp",
    sourceId: "soltys-2021-hytec-vestibular-tcp",
    endpointId: "vestibular-schwannoma-tumour-control",
    status: "reviewed",
    evidenceForm: "model-derived",
    outcomeKind: "TCP",
    technique: ["SRS", "fSRS"],
    priorRadiotherapy: "not-reported",
    population:
      "Vestibular schwannoma treated with single-fraction SRS or 2–5 fraction fSRS in pooled published series.",
    applicability: {
      radiationQuality: "photon",
      technique: ["SRS", "fSRS"],
      followUp: "3–5 year tumour control",
      notes: [
        "The source reports limited analysable data below 11 Gy in one fraction.",
        "Tumour-control definitions and dosimetric reporting were heterogeneous.",
      ],
    },
    points: [
      {
        id: "vs-10gy-1fx",
        dose: { schedule: { fractions: 1, dosePerFractionGy: 10 } },
        probability: 0.85,
        probabilityRelation: "≈",
        followUp: "3–5 years",
      },
      {
        id: "vs-11gy-1fx",
        dose: { schedule: { fractions: 1, dosePerFractionGy: 11 } },
        probability: 0.884,
        probabilityRelation: "≈",
        followUp: "3–5 years",
      },
      {
        id: "vs-12gy-1fx",
        dose: { schedule: { fractions: 1, dosePerFractionGy: 12 } },
        probability: 0.912,
        probabilityRelation: "≈",
        followUp: "3–5 years",
      },
      {
        id: "vs-13gy-1fx",
        dose: { schedule: { fractions: 1, dosePerFractionGy: 13 } },
        probability: 0.935,
        probabilityRelation: "≈",
        followUp: "3–5 years",
      },
      {
        id: "vs-18gy-3fx",
        dose: { schedule: { fractions: 3, dosePerFractionGy: 6 } },
        probability: 0.936,
        probabilityRelation: "≈",
        followUp: "3–5 years",
      },
      {
        id: "vs-25gy-5fx",
        dose: { schedule: { fractions: 5, dosePerFractionGy: 5 } },
        probability: 0.972,
        probabilityRelation: "≈",
        followUp: "3–5 years",
      },
    ],
    notes: [
      "The source LQ TCP fit estimated alpha/beta 12.4 Gy (95% CI 9.0–19.3). HFC stores that as source-model provenance only and does not promote it to an endpoint alpha/beta default.",
    ],
  },
  {
    id: "hytec-spinal-mets-2y-tcp",
    sourceId: "soltys-2021-hytec-spinal-mets-tcp",
    endpointId: "spinal-metastases-local-control",
    status: "reviewed",
    evidenceForm: "model-derived",
    outcomeKind: "TCP",
    technique: ["spine SBRT"],
    priorRadiotherapy: "not-reported",
    population:
      "Published spine SBRT series with dose/fractionation and actuarial 2-year local-control data.",
    applicability: {
      radiationQuality: "photon",
      technique: ["spine SBRT"],
      followUp: "2-year local control",
      notes: [
        "The pooled model estimated alpha/beta approximately 6 Gy to combine fractionation schedules.",
        "The source explicitly cautions that data and local-control definitions were heterogeneous.",
      ],
    },
    points: [
      {
        id: "spine-18gy-1fx",
        dose: { schedule: { fractions: 1, dosePerFractionGy: 18 } },
        probability: 0.82,
        probabilityRelation: "≈",
        followUp: "2 years",
      },
      {
        id: "spine-20gy-1fx",
        dose: { schedule: { fractions: 1, dosePerFractionGy: 20 } },
        probability: 0.90,
        probabilityRelation: "≈",
        followUp: "2 years",
      },
      {
        id: "spine-24gy-1fx",
        dose: { schedule: { fractions: 1, dosePerFractionGy: 24 } },
        probability: 0.96,
        probabilityRelation: "≈",
        followUp: "2 years",
      },
      {
        id: "spine-24gy-2fx",
        dose: { schedule: { fractions: 2, dosePerFractionGy: 12 } },
        probability: 0.82,
        probabilityRelation: "≈",
        followUp: "2 years",
      },
      {
        id: "spine-27gy-3fx",
        dose: { schedule: { fractions: 3, dosePerFractionGy: 9 } },
        probability: 0.78,
        probabilityRelation: "≈",
        followUp: "2 years",
      },
      {
        id: "spine-90tcp-28gy-2fx",
        dose: { schedule: { fractions: 2, dosePerFractionGy: 14 } },
        probability: 0.90,
        probabilityRelation: "≈",
        followUp: "2 years",
        notes: ["Model-derived 90% TCP point."],
      },
      {
        id: "spine-90tcp-33gy-3fx",
        dose: { schedule: { fractions: 3, dosePerFractionGy: 11 } },
        probability: 0.90,
        probabilityRelation: "≈",
        followUp: "2 years",
        notes: ["Model-derived 90% TCP point."],
      },
      {
        id: "spine-90tcp-40gy-5fx",
        dose: { schedule: { fractions: 5, dosePerFractionGy: 8 } },
        probability: 0.90,
        probabilityRelation: "≈",
        followUp: "2 years",
        extrapolated: true,
        notes: [
          "The publication explicitly labels the 40 Gy / 5 fraction 90% TCP estimate as extrapolation.",
        ],
      },
    ],
  },
  {
    id: "hytec-liver-metastases-bed10-local-control",
    sourceId: "ohri-2021-hytec-liver-local-control",
    endpointId: "liver-metastases-local-control",
    status: "reviewed",
    evidenceForm: "stratified-observation",
    outcomeKind: "local-control",
    technique: ["liver SBRT"],
    priorRadiotherapy: "not-reported",
    population:
      "Liver metastases treated with SBRT in pooled published series.",
    applicability: {
      radiationQuality: "photon",
      technique: ["liver SBRT"],
      followUp: "3-year local control",
      notes: [
        "The >100 Gy10 comparison applies to liver metastases; primary liver tumours were analysed separately and did not show a clear dose-response within commonly used schedules.",
      ],
    },
    points: [
      {
        id: "liver-mets-bed10-over100",
        dose: {
          biologicalDose: {
            basis: "BED",
            valueGy: 100,
            alphaBetaGy: 10,
          },
        },
        probability: 0.93,
        probabilityRelation: "≈",
        followUp: "3 years",
        subgroup: "BED10 >100 Gy",
      },
      {
        id: "liver-mets-bed10-le100",
        dose: {
          biologicalDose: {
            basis: "BED",
            valueGy: 100,
            alphaBetaGy: 10,
          },
        },
        probability: 0.65,
        probabilityRelation: "≈",
        followUp: "3 years",
        subgroup: "BED10 ≤100 Gy",
      },
    ],
    notes: [
      "These are pooled stratified outcomes, not a fitted continuous TCP curve.",
    ],
  },
  {
    id: "hytec-adrenal-metastases-1y-tcp",
    sourceId: "stumpf-2021-hytec-adrenal-tcp",
    endpointId: "adrenal-metastases-local-control",
    status: "reviewed",
    evidenceForm: "model-derived",
    outcomeKind: "TCP",
    technique: ["adrenal SBRT"],
    priorRadiotherapy: "not-reported",
    population:
      "Adrenal metastases treated with SBRT in published series from 2008–2017.",
    applicability: {
      radiationQuality: "photon",
      technique: ["adrenal SBRT"],
      followUp: "1-year local control",
    },
    points: [
      {
        id: "adrenal-bed10-116p4",
        dose: {
          biologicalDose: {
            basis: "BED",
            valueGy: 116.4,
            alphaBetaGy: 10,
          },
        },
        probability: 0.95,
        probabilityRelation: ">",
        followUp: "1 year",
        notes: [
          "The source reports >95% 1-year local control at approximately BED10 116.4 Gy and recommends at least this tumour BED while respecting normal-tissue tolerances.",
        ],
      },
    ],
  },
  {
    id: "hytec-prostate-sbrt-5y-tcp",
    sourceId: "royce-2021-hytec-prostate-tcp",
    endpointId: "prostate-biochemical-control",
    status: "reviewed",
    evidenceForm: "model-derived",
    outcomeKind: "biochemical-control",
    technique: ["prostate SBRT"],
    priorRadiotherapy: "none",
    population:
      "Localized prostate cancer treated with 4–5 fraction SBRT in pooled published cohorts.",
    applicability: {
      radiationQuality: "photon",
      technique: ["prostate SBRT"],
      fractionCountRange: { min: 4, max: 5 },
      followUp: "5-year freedom from biochemical relapse",
      notes: [
        "The pooled literature contained substantially fewer high-risk patients than low/intermediate-risk patients.",
        "Dose-volume information was insufficient; modelling used prescription dose.",
      ],
    },
    points: [
      {
        id: "prostate-lowint-90tcp",
        dose: {
          schedule: { fractions: 5, dosePerFractionGy: 31.7 / 5 },
          biologicalDose: {
            basis: "EQD2",
            valueGy: 71,
            alphaBetaGy: 1.5,
          },
        },
        probability: 0.90,
        probabilityRelation: "≈",
        followUp: "5 years",
        subgroup: "Low/intermediate-risk disease",
      },
      {
        id: "prostate-lowint-95tcp",
        dose: {
          schedule: { fractions: 5, dosePerFractionGy: 36.1 / 5 },
          biologicalDose: {
            basis: "EQD2",
            valueGy: 90,
            alphaBetaGy: 1.5,
          },
        },
        probability: 0.95,
        probabilityRelation: "≈",
        followUp: "5 years",
        subgroup: "Low/intermediate-risk disease",
      },
      {
        id: "prostate-high-90tcp",
        dose: {
          schedule: { fractions: 5, dosePerFractionGy: 37.6 / 5 },
          biologicalDose: {
            basis: "EQD2",
            valueGy: 97,
            alphaBetaGy: 1.5,
          },
        },
        probability: 0.90,
        probabilityRelation: "≈",
        followUp: "5 years",
        subgroup: "High-risk disease",
      },
      {
        id: "prostate-high-95tcp",
        dose: {
          schedule: { fractions: 5, dosePerFractionGy: 38.7 / 5 },
          biologicalDose: {
            basis: "EQD2",
            valueGy: 102,
            alphaBetaGy: 1.5,
          },
        },
        probability: 0.95,
        probabilityRelation: "≈",
        followUp: "5 years",
        subgroup: "High-risk disease",
      },
    ],
    notes: [
      "The source-specific alpha/beta=1.5 Gy is part of the HyTEC TCP model transformation. It is not substituted for HFC's separately curated endpoint-specific alpha/beta evidence.",
    ],
  },
];
