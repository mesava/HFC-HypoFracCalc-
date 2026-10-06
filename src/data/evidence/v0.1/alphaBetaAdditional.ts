import type {
  AlphaBetaEstimate,
  ApplicabilityDomain,
} from "../../../domain/evidence.js";

const photonClinical: ApplicabilityDomain = {
  radiationQuality: "photon",
  priorRadiotherapy: "not-reported",
};

export const alphaBetaAdditionalEstimates = [
  {
    id: "ab-oral-mucosa-mucositis-denham1995",
    endpointId: "oral-mucosa-mucositis",
    sourceId: "denham-1995-oropharyngeal-mucosa",
    parameter: "alpha-beta",
    valueGy: 9.3,
    ci95: { level: 0.95, low: 5.8, high: 17.9 },
    status: "preferred",
    defaultEligible: true,
    support: "supported",
    supportReason:
      "Direct clinical analysis of human oropharyngeal mucosal reactions; the 2025 textbook identifies 9.3 Gy as a clinical estimate for mucositis.",
    applicability: {
      radiationQuality: "photon",
      technique: ["head-and-neck radiotherapy"],
      priorRadiotherapy: "not-reported",
      notes: [
        "Acute mucosal endpoint. Do not use this value for late mucosal injury or tumour control.",
      ],
    },
  },
  {
    id: "ab-skin-erythema-bcr2025",
    endpointId: "skin-erythema",
    sourceId: "turesson-thames-1989-skin",
    parameter: "alpha-beta",
    valueGy: 8.8,
    ci95: { level: 0.95, low: 6.9, high: 11.6 },
    status: "preferred",
    defaultEligible: true,
    support: "supported",
    supportReason:
      "Human postmastectomy skin fractionation data from Turesson and Thames (1989); the 8.8 Gy estimate and 95% interval are reproduced in Basic Clinical Radiobiology 2025.",
    applicability: {
      radiationQuality: "photon",
      technique: ["postmastectomy skin irradiation"],
      priorRadiotherapy: "none",
      population:
        "Breast-cancer patients in prospective human-skin fractionation studies.",
      notes: [
        "Acute erythema endpoint. The source also demonstrates clinically important time and incomplete-repair effects, so alpha/beta alone does not capture all schedule dependence.",
      ],
    },
  },
  {
    id: "ab-skin-telangiectasia-bcr2025",
    endpointId: "skin-telangiectasia",
    sourceId: "bentzen-turesson-thames-1990-telangiectasia",
    parameter: "alpha-beta",
    valueGy: 2.6,
    ci95: { level: 0.95, low: 2.2, high: 3.3 },
    status: "preferred",
    defaultEligible: true,
    support: "supported",
    supportReason:
      "Direct graded-response clinical analysis of postmastectomy telangiectasia; the 2.6 Gy estimate and 95% interval are reproduced in Basic Clinical Radiobiology 2025.",
    applicability: {
      radiationQuality: "photon",
      technique: ["postmastectomy radiotherapy"],
      priorRadiotherapy: "none",
      population:
        "Postmastectomy patients with prospectively scored late telangiectasia.",
      notes: [
        "Late skin/vascular endpoint; do not substitute for acute erythema or other late normal-tissue endpoints.",
      ],
    },
  },
  {
    id: "ab-subcutis-fibrosis-bcr2025",
    endpointId: "subcutis-fibrosis",
    sourceId: "bentzen-overgaard-1991-postmastectomy",
    parameter: "alpha-beta",
    valueGy: 1.7,
    ci95: { level: 0.95, low: 0.6, high: 2.6 },
    status: "preferred",
    defaultEligible: true,
    support: "supported",
    supportReason:
      "Clinical postmastectomy fractionation analysis; the subcutaneous-fibrosis alpha/beta estimate 1.7 Gy (0.6-2.6) is reproduced in Basic Clinical Radiobiology 2025.",
    applicability: {
      radiationQuality: "photon",
      technique: ["postmastectomy radiotherapy"],
      priorRadiotherapy: "none",
      population:
        "Postmastectomy patients in historical two-schedule fractionation cohorts.",
      notes: [
        "Late subcutaneous-fibrosis endpoint. Retain the published uncertainty and do not generalize it to all late normal tissues.",
      ],
    },
  },
  {
    id: "ab-bowel-stricture-perforation-bcr2025",
    endpointId: "bowel-stricture-perforation",
    sourceId: "bcr-2025-ch10-tables",
    parameter: "alpha-beta",
    valueGy: 3.9,
    ci95: { level: 0.95, low: 2.5, high: 5.3 },
    status: "preferred",
    defaultEligible: false,
    support: "limited",
    supportReason:
      "Endpoint-specific historical human estimate summarized in Basic Clinical Radiobiology 2025; the originating Deore et al. analysis has not yet been independently curated to the level required for automatic selection.",
    applicability: photonClinical,
  },
  {
    id: "ab-bowel-various-late-dische1999",
    endpointId: "bowel-various-late-effects",
    sourceId: "dische-1999-cervix-late-bowel",
    parameter: "alpha-beta",
    valueGy: 4.3,
    ci95: { level: 0.95, low: 2.2, high: 9.6 },
    status: "preferred",
    defaultEligible: false,
    support: "limited",
    supportReason:
      "Historical randomized cervix-radiotherapy dataset yielded an alpha/beta estimate for composite late intestinal morbidity; the endpoint is broad and the interval is wide, so HFC requires explicit user selection.",
    applicability: {
      radiationQuality: "photon",
      technique: ["pelvic radiotherapy"],
      priorRadiotherapy: "none",
      population:
        "Patients with stage IIb-III cervical carcinoma in a historical randomized hyperbaric-oxygen/fractionation trial.",
      notes: [
        "Use only as a late intestinal morbidity estimate; it is not a modern DVH-based bowel constraint.",
      ],
    },
  },
  {
    id: "ab-lung-pneumonitis-bentzen2000",
    endpointId: "lung-pneumonitis",
    sourceId: "bentzen-skoczylas-bernier-2000-lung",
    parameter: "alpha-beta",
    valueGy: 4.0,
    ci95: { level: 0.95, low: 2.2, high: 5.8 },
    status: "preferred",
    defaultEligible: false,
    support: "limited",
    supportReason:
      "Clinical-data synthesis of human lung reactions rather than one independently validated endpoint-specific primary fit; retained for explicit selection but not automatic use.",
    applicability: {
      radiationQuality: "photon",
      technique: ["thoracic radiotherapy"],
      priorRadiotherapy: "not-reported",
    },
  },
  {
    id: "ab-lung-fibrosis-dubray1995",
    endpointId: "lung-radiological-fibrosis",
    sourceId: "dubray-1995-lung-fibrosis",
    parameter: "alpha-beta",
    valueGy: 3.1,
    ci95: { level: 0.95, low: -0.2, high: 8.5 },
    status: "preferred",
    defaultEligible: false,
    support: "limited",
    supportReason:
      "Clinical Hodgkin-disease fractionation analysis; the confidence interval crosses zero, so the estimate is not eligible for automatic selection.",
    applicability: {
      radiationQuality: "photon",
      technique: ["mantle-field thoracic radiotherapy"],
      dosePerFractionGyRange: { min: 1.5, max: 2.5 },
      priorRadiotherapy: "none",
      population:
        "Stage I-II Hodgkin disease patients treated in historical EORTC protocols.",
      notes: [
        "Endpoint was radiological lung change on follow-up chest radiographs, not symptomatic pneumonitis.",
      ],
    },
  },
  {
    id: "ab-hn-late-effects-stuschke1999",
    endpointId: "head-neck-various-late-effects",
    sourceId: "stuschke-thames-1999-head-neck",
    parameter: "alpha-beta",
    valueGy: 4.0,
    ci95: { level: 0.95, low: 3.3, high: 5.0 },
    status: "preferred",
    defaultEligible: true,
    support: "supported",
    supportReason:
      "Quantitative estimate of grade 2+ late normal-tissue effects from a randomized hyperfractionation trial included in the joint analysis.",
    applicability: {
      radiationQuality: "photon",
      technique: ["head-and-neck EBRT", "hyperfractionation"],
      priorRadiotherapy: "none",
      notes: [
        "Composite late-effects endpoint; do not substitute for a structure-specific OAR parameter when a better endpoint-specific estimate exists.",
      ],
    },
  },
  {
    id: "ab-hn-tumour-control-stuschke1999",
    endpointId: "head-neck-tumour-control",
    sourceId: "stuschke-thames-1999-head-neck",
    parameter: "alpha-beta",
    valueGy: 10.5,
    ci95: { level: 0.95, low: 6.5, high: 29.0 },
    status: "preferred",
    defaultEligible: true,
    support: "supported",
    supportReason:
      "Joint analysis of five randomized head-and-neck hyperfractionation trials yielded alpha/beta 10.5 Gy (6.5-29) for tumour control.",
    applicability: {
      radiationQuality: "photon",
      technique: ["head-and-neck EBRT", "hyperfractionation"],
      priorRadiotherapy: "none",
      population:
        "Head-and-neck carcinoma patients meeting eligibility criteria of historical randomized hyperfractionation trials.",
      notes: [
        "The broad CI must be displayed; this is not a universal alpha/beta for every head-and-neck histology/subsite.",
      ],
    },
  },
  {
    id: "ab-nsclc-stage-i-stuschke2010",
    endpointId: "nsclc-stage-i-local-control",
    sourceId: "stuschke-pottgen-2010-nsclc",
    parameter: "alpha-beta",
    valueGy: 8.2,
    ci95: { level: 0.95, low: 7.0, high: 9.4 },
    status: "preferred",
    defaultEligible: false,
    support: "limited",
    supportReason:
      "Cross-study comparison of conventional fractionation and high-dose SBRT; the source explicitly notes that the apparent alpha/beta can reflect repopulation and hypoxia differences, so HFC requires explicit selection.",
    applicability: {
      radiationQuality: "photon",
      technique: ["conventional EBRT", "SBRT"],
      dosePerFractionGyRange: { min: 1.8, max: 30 },
      priorRadiotherapy: "none",
      population: "Stage I NSCLC clinical series.",
      notes: [
        "High-dose SBRT schedules contributed to the estimate. HFC must retain the high-dose LQ warning when the selected regimen exceeds the strongest simple-LQ evidence range.",
      ],
    },
  },
  {
    id: "ab-esophagus-pcr-geh2006",
    endpointId: "esophagus-pathologic-complete-response",
    sourceId: "geh-2006-esophagus",
    parameter: "alpha-beta",
    valueGy: 4.9,
    ci95: { level: 0.95, low: 1.5, high: 17.0 },
    status: "preferred",
    defaultEligible: false,
    support: "limited",
    supportReason:
      "Systematic overview of heterogeneous preoperative chemoradiotherapy trials; the estimate is tied to pathologic complete response, concurrent chemotherapy and treatment-time effects, with a broad CI, so it is not automatic.",
    applicability: {
      radiationQuality: "photon",
      technique: ["preoperative chemoradiotherapy"],
      priorRadiotherapy: "none",
      systemicTherapy: "5-FU/cisplatin-containing regimens varied across included trials",
      population:
        "Patients in 26 preoperative oesophageal chemoradiotherapy trials.",
      notes: [
        "Do not generalize this 4.9 Gy estimate to definitive radiotherapy tumour control without an explicit user decision.",
      ],
    },
  },
  {
    id: "ab-spinal-cord-myelopathy-jin2015",
    endpointId: "spinal-cord-radiation-myelopathy",
    sourceId: "jin-2015-spinal-cord",
    parameter: "alpha-beta",
    valueGy: 3.7,
    ci95: { level: 0.95, low: 2.2, high: 8.2 },
    status: "reviewed",
    defaultEligible: false,
    support: "limited",
    supportReason:
      "Patient-data fit from a pooled animal/human analysis; the result differs materially from other human analyses and from the approximately 2 Gy value often used clinically.",
    applicability: {
      radiationQuality: "photon",
      priorRadiotherapy: "mixed",
      notes: [
        "No automatic HFC default is assigned because published human estimates are inconsistent.",
        "Basic Clinical Radiobiology 2025 notes historical human data suggesting alpha/beta <3.3 Gy and uses 2 Gy in a worked spinal-cord example based partly on animal evidence.",
      ],
    },
  },
  {
    id: "ab-spinal-cord-myelopathy-schultheiss2008",
    endpointId: "spinal-cord-radiation-myelopathy",
    sourceId: "schultheiss-2008-spinal-cord",
    parameter: "alpha-beta",
    valueGy: 0.87,
    ci95: { level: 0.95, low: 0.54, high: 1.19 },
    status: "reviewed",
    defaultEligible: false,
    support: "limited",
    supportReason:
      "Human cervical-cord dose-response model based on a small number of aggregated data points; the source explicitly cautions against uncritical application to hyperfractionation.",
    applicability: {
      radiationQuality: "photon",
      technique: ["once-daily fractionation"],
      priorRadiotherapy: "none",
      notes: [
        "The cervical-cord model reported alpha/beta 0.87 Gy with 95% CI 0.54-1.19 Gy.",
        "Retained as an alternative published human estimate, not as an automatic calculation default; the source cautions against uncritical application to hyperfractionation.",
      ],
    },
  },
] satisfies AlphaBetaEstimate[];
