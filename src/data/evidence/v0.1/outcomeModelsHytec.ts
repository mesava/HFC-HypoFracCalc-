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
  {
    id: "nsclc-stage-i-size-adjusted-2y-tcp",
    sourceId: "ohri-2012-nsclc-size-tcp",
    endpointId: "nsclc-stage-i-local-control",
    status: "reviewed",
    evidenceForm: "model-derived",
    outcomeKind: "TCP",
    technique: ["lung SBRT"],
    priorRadiotherapy: "none",
    population:
      "Stage I NSCLC treated with definitive hypofractionated SBRT in the multi-institutional Elekta Collaborative Lung Research Group dataset.",
    applicability: {
      radiationQuality: "photon",
      technique: ["lung SBRT"],
      followUp: "2-year local control",
      notes: [
        "The primary model uses size-adjusted BED10: sBED = BED10 - 10 × maximum tumour diameter in centimetres.",
        "HFC stores only explicit example predictions published by the source and does not run the continuous sBED TCP formula patient-specifically.",
        "The model was derived predominantly from 3–8 fraction SBRT and should not be extrapolated outside the published domain.",
      ],
    },
    points: [
      {
        id: "nsclc-50gy-5fx-1cm-2y",
        dose: { schedule: { fractions: 5, dosePerFractionGy: 10 } },
        probability: 0.93,
        probabilityRelation: "≈",
        followUp: "2 years",
        subgroup: "Maximum tumour diameter 1 cm",
      },
      {
        id: "nsclc-50gy-5fx-3cm-2y",
        dose: { schedule: { fractions: 5, dosePerFractionGy: 10 } },
        probability: 0.90,
        probabilityRelation: "≈",
        followUp: "2 years",
        subgroup: "Maximum tumour diameter 3 cm",
      },
      {
        id: "nsclc-50gy-5fx-5cm-2y",
        dose: { schedule: { fractions: 5, dosePerFractionGy: 10 } },
        probability: 0.83,
        probabilityRelation: "≈",
        followUp: "2 years",
        subgroup: "Maximum tumour diameter 5 cm",
      },
      {
        id: "nsclc-54gy-3fx-1cm-2y",
        dose: { schedule: { fractions: 3, dosePerFractionGy: 18 } },
        probability: 0.99,
        probabilityRelation: "≈",
        followUp: "2 years",
        subgroup: "Maximum tumour diameter 1 cm",
      },
      {
        id: "nsclc-54gy-3fx-3cm-2y",
        dose: { schedule: { fractions: 3, dosePerFractionGy: 18 } },
        probability: 0.98,
        probabilityRelation: "≈",
        followUp: "2 years",
        subgroup: "Maximum tumour diameter 3 cm",
      },
      {
        id: "nsclc-54gy-3fx-5cm-2y",
        dose: { schedule: { fractions: 3, dosePerFractionGy: 18 } },
        probability: 0.96,
        probabilityRelation: "≈",
        followUp: "2 years",
        subgroup: "Maximum tumour diameter 5 cm",
      },
    ],
    notes: [
      "The later HyTEC stage-I NSCLC review reports model-dependent PTV doses near the asymptotic TCP plateau of approximately 43, 47, and 50 Gy in 3, 4, and 5 fractions for combined T1/T2 disease. HFC registers that HyTEC source separately but does not fabricate a single plateau probability.",
    ],
  },
  {
    id: "hytec-hn-reirradiation-local-control",
    sourceId: "vargo-2021-hytec-hn-reirradiation-tcp",
    endpointId: "head-neck-recurrent-reirradiation-local-control",
    status: "reviewed",
    evidenceForm: "model-derived",
    outcomeKind: "local-control",
    technique: ["head-and-neck SBRT reirradiation"],
    priorRadiotherapy: "yes",
    population:
      "Locally recurrent previously irradiated malignant head-and-neck tumours treated with SBRT in pooled published series.",
    applicability: {
      radiationQuality: "photon",
      technique: ["head-and-neck SBRT reirradiation"],
      followUp: "1–3 year local control",
      notes: [
        "Published doses were converted to five-fraction-equivalent total dose using an LQ transformation with alpha/beta = 10 Gy.",
        "The 1-year dose-response was weak and did not reach conventional statistical significance; 2- and 3-year dose-response fits were statistically significant.",
        "Tumour volume was not included in the pooled logistic model even though several reports suggested worse control for larger lesions.",
        "The model is specific to malignant recurrent head-and-neck reirradiation and should not be applied to primary SBRT, benign disease, or planned boost scenarios.",
      ],
    },
    points: [
      {
        id: "hn-rert-1y-25p6gy5eq-50lc",
        dose: {
          equivalentFractionation: {
            fractions: 5,
            totalDoseGy: 25.6,
            alphaBetaGy: 10,
          },
        },
        probability: 0.50,
        probabilityRelation: "≈",
        followUp: "1 year",
      },
      {
        id: "hn-rert-1y-40p7gy5eq-60lc",
        dose: {
          equivalentFractionation: {
            fractions: 5,
            totalDoseGy: 40.7,
            alphaBetaGy: 10,
          },
        },
        probability: 0.60,
        probabilityRelation: "≈",
        followUp: "1 year",
      },
      {
        id: "hn-rert-2y-d50-45p1gy5eq",
        dose: {
          equivalentFractionation: {
            fractions: 5,
            totalDoseGy: 45.1,
            alphaBetaGy: 10,
          },
        },
        probability: 0.50,
        probabilityRelation: "≈",
        followUp: "2 years",
        notes: ["Published logistic-model D50 point."],
      },
      {
        id: "hn-rert-3y-26p8gy5eq-15lc",
        dose: {
          equivalentFractionation: {
            fractions: 5,
            totalDoseGy: 26.8,
            alphaBetaGy: 10,
          },
        },
        probability: 0.15,
        probabilityRelation: "≈",
        followUp: "3 years",
      },
      {
        id: "hn-rert-3y-44p4gy5eq-40lc",
        dose: {
          equivalentFractionation: {
            fractions: 5,
            totalDoseGy: 44.4,
            alphaBetaGy: 10,
          },
        },
        probability: 0.40,
        probabilityRelation: "≈",
        followUp: "3 years",
      },
      {
        id: "hn-rert-3y-d50-49p8gy5eq",
        dose: {
          equivalentFractionation: {
            fractions: 5,
            totalDoseGy: 49.8,
            alphaBetaGy: 10,
          },
        },
        probability: 0.50,
        probabilityRelation: "≈",
        followUp: "3 years",
        notes: ["Published logistic-model D50 point."],
      },
    ],
    notes: [
      "The source suggests five-fraction-equivalent doses of approximately 40–50 Gy for retreatment according to tumour extent/volume, but HFC presents the dose-response evidence rather than converting it into a patient-specific prescription.",
    ],
  },
  {
    id: "hytec-pancreas-1y-local-control",
    sourceId: "mahadevan-2021-hytec-pancreas-tcp",
    endpointId: "pancreas-local-control",
    status: "reviewed",
    evidenceForm: "model-derived",
    outcomeKind: "local-control",
    technique: ["pancreas SBRT"],
    priorRadiotherapy: "not-reported",
    population:
      "Localized pancreatic cancer treated with hypofractionated SBRT, including unresected and neoadjuvant/resected cohorts in pooled published literature.",
    applicability: {
      radiationQuality: "photon",
      technique: ["pancreas SBRT"],
      followUp: "1-year local control",
      notes: [
        "The pooled model converts schedules to three-fraction-equivalent dose using alpha/beta = 10 Gy.",
        "Resectability and R0 resection materially modify outcome; resected and unresected results must not be pooled into one universal TCP.",
        "The source emphasizes substantial heterogeneity, short follow-up, target-definition uncertainty, and competing-risk limitations.",
      ],
    },
    points: [
      {
        id: "pancreas-unresected-33gy5fx-77lc",
        dose: {
          schedule: { fractions: 5, dosePerFractionGy: 6.6 },
          equivalentFractionation: {
            fractions: 3,
            totalDoseGy: 28.2,
            alphaBetaGy: 10,
          },
        },
        probability: 0.77,
        probabilityRelation: "≈",
        followUp: "1 year",
        subgroup: "Unresected disease",
      },
      {
        id: "pancreas-unresected-36gy3fx-86lc",
        dose: {
          schedule: { fractions: 3, dosePerFractionGy: 12 },
          equivalentFractionation: {
            fractions: 3,
            totalDoseGy: 36,
            alphaBetaGy: 10,
          },
        },
        probability: 0.86,
        probabilityRelation: "≈",
        followUp: "1 year",
        subgroup: "Unresected disease",
      },
      {
        id: "pancreas-r0-33gy5fx-over90lc",
        dose: {
          schedule: { fractions: 5, dosePerFractionGy: 6.6 },
          equivalentFractionation: {
            fractions: 3,
            totalDoseGy: 28.2,
            alphaBetaGy: 10,
          },
        },
        probability: 0.90,
        probabilityRelation: ">",
        followUp: "1 year",
        subgroup: "R0 resection",
        notes: [
          "The source reports >90% 1-year local control with margin-negative resection at or above approximately 28 Gy in three-fraction-equivalent dose.",
        ],
      },
    ],
    notes: [
      "The source reports less than 70% 1-year local control below 24 Gy in three-fraction-equivalent dose, but HFC does not encode that statement as an exact point at 24 Gy.",
    ],
  },
];