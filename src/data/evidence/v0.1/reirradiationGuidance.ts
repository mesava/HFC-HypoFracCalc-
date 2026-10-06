import type { ReirradiationGuidanceSet } from "../../../domain/reirradiationGuidance.js";

export const reirradiationGuidanceSets = [
  {
    id: "hytec-spinal-cord-reirradiation-lower-risk-factors",
    sourceId: "sahgal-2021-hytec-spinal-cord",
    endpointId: "spinal-cord-radiation-myelopathy",
    status: "reviewed",
    evidenceMeaning: "lower-risk-associated-factors",
    alphaBetaGy: 2,
    requiredMetric: "Dmax",
    requiredStructure: "thecal-sac",
    currentFractionCountRange: {
      min: 1,
      max: 5,
    },
    maxPreviousCoursesSupported: 1,
    technique: ["spine SBRT"],
    criteria: [
      {
        id: "cumulative-eqd2-max",
        label: "Cumulative thecal-sac EQD2_2 Dmax",
        quantity: "cumulative-eqd2",
        relation: "<=",
        limitValue: 70,
        unit: "Gy EQD2_2",
      },
      {
        id: "current-sbrt-eqd2-max",
        label: "Current SBRT thecal-sac EQD2_2 Dmax",
        quantity: "current-eqd2",
        relation: "<=",
        limitValue: 25,
        unit: "Gy EQD2_2",
      },
      {
        id: "current-to-cumulative-ratio",
        label:
          "Current SBRT thecal-sac EQD2_2 Dmax / cumulative EQD2_2 Dmax",
        quantity: "current-to-cumulative-ratio",
        relation: "<=",
        limitValue: 0.5,
        unit: "ratio",
      },
      {
        id: "minimum-interval",
        label: "Interval between courses",
        quantity: "interval-months",
        relation: ">=",
        limitValue: 5,
        unit: "months",
        note:
          "The interval is an independent lower-risk factor and must not be converted automatically into a tissue-recovery percentage.",
      },
    ],
    notes: [
      "HyTEC describes these values as factors associated with a lower risk of radiation myelopathy in reirradiation spine SBRT.",
      "The limits are suggestions rather than absolute tolerances, reflecting the limitations of the available clinical data.",
      "The cumulative and current-course values are defined in EQD2 with alpha/beta = 2 Gy.",
      "HFC does not apply a user-specified recovery discount when comparing against this published guidance.",
    ],
  },
] satisfies ReirradiationGuidanceSet[];
