import type {
  ComplexClinicalRegimenPreset,
} from "../../../domain/regimen.js";
import {
  complexRegimenLibraryManifest,
} from "./manifest.js";

const V = complexRegimenLibraryManifest.datasetVersion;
const S = complexRegimenLibraryManifest.sourceId;

export const rcr2024ComplexRegimenPresets = [
  {
    id: "rcr2024-brainmets-srs-under20mm-21to24gy-1fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "20 Brain metastases",
    site: "brain-metastases",
    label: {
      ru: "Метастаз <20 мм: SRS 21–24 Гр × 1",
      en: "<20 mm metastasis: SRS 21–24 Gy × 1",
    },
    indication: {
      ru: "Однофракционная SRS для метастаза головного мозга диаметром менее 20 мм",
      en: "Single-fraction SRS for a brain metastasis smaller than 20 mm",
    },
    intent: "definitive",
    prescription: {
      kind: "dose-range",
      fractions: 1,
      totalDoseGyRange: {
        low: 21,
        high: 24,
      },
    },
    recommendationGrade: "B",
    technique: ["SRS"],
    notes: [
      {
        ru: "Диапазон 21–24 Гр сохранён как диапазон источника; HFC не подменяет его средней дозой.",
        en: "The source range of 21–24 Gy is preserved as a range; HFC does not replace it with a midpoint.",
      },
    ],
    status: "reviewed",
  },
  {
    id: "rcr2024-breast-boost-sib-48gy-40gy-15fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "03 Breast cancer",
    site: "breast",
    label: {
      ru: "Молочная железа: SIB 48/40 Гр за 15 фракций",
      en: "Breast: SIB 48/40 Gy in 15 fractions",
    },
    indication: {
      ru: "Адъювантное облучение молочной железы у пациентов, которым требуется boost",
      en: "Adjuvant breast radiotherapy for patients requiring a boost",
    },
    intent: "adjuvant",
    prescription: {
      kind: "sib",
      fractions: 15,
      doseLevels: [
        {
          id: "boost-volume",
          target: {
            ru: "Boost-объём",
            en: "Boost volume",
          },
          totalDoseGy: 48,
        },
        {
          id: "rest-of-breast",
          target: {
            ru: "Остальная молочная железа",
            en: "Rest of breast",
          },
          totalDoseGy: 40,
        },
      ],
    },
    overallTreatment: {
      ru: "3 недели",
      en: "3 weeks",
    },
    recommendationGrade: "A",
    technique: ["photon EBRT", "SIB"],
    notes: [
      {
        ru: "Два уровня дозы относятся к разным target volumes и не должны сворачиваться в одну дозу за фракцию.",
        en: "The two dose levels belong to different target volumes and must not be collapsed to one dose per fraction.",
      },
    ],
    status: "reviewed",
  },
  {
    id: "rcr2024-breast-boost-sequential-26gy5-plus-13p35gy5",
    datasetVersion: V,
    sourceId: S,
    chapter: "03 Breast cancer",
    site: "breast",
    label: {
      ru: "Молочная железа: 26 Гр / 5 + boost 13,35 Гр / 5",
      en: "Breast: 26 Gy / 5 + 13.35 Gy / 5 boost",
    },
    indication: {
      ru: "Адъювантное облучение молочной железы с последовательным гипофракционированным boost",
      en: "Adjuvant breast radiotherapy with a sequential hypofractionated boost",
    },
    intent: "adjuvant",
    prescription: {
      kind: "sequential",
      phases: [
        {
          id: "whole-breast",
          label: {
            ru: "Основной курс",
            en: "Whole-breast phase",
          },
          target: {
            ru: "Молочная железа",
            en: "Whole breast",
          },
          schedule: {
            fractions: 5,
            dosePerFractionGy: 26 / 5,
          },
        },
        {
          id: "boost",
          label: {
            ru: "Последовательный boost",
            en: "Sequential boost",
          },
          target: {
            ru: "Ложе опухоли / boost-объём",
            en: "Tumour bed / boost volume",
          },
          schedule: {
            fractions: 5,
            dosePerFractionGy: 13.35 / 5,
          },
        },
      ],
    },
    recommendationGrade: "C",
    technique: ["photon EBRT", "sequential boost"],
    notes: [
      {
        ru: "Фазы сохраняются отдельно; суммарная физическая доза разных объёмов не трактуется как единая однородная схема.",
        en: "The phases remain separate; physical doses to different volumes are not treated as one homogeneous schedule.",
      },
    ],
    status: "reviewed",
  },
  {
    id: "rcr2024-breast-boost-sequential-26gy5-plus-12gy4",
    datasetVersion: V,
    sourceId: S,
    chapter: "03 Breast cancer",
    site: "breast",
    label: {
      ru: "Молочная железа: 26 Гр / 5 + boost 12 Гр / 4",
      en: "Breast: 26 Gy / 5 + 12 Gy / 4 boost",
    },
    indication: {
      ru: "Адъювантное облучение молочной железы с последовательным гипофракционированным boost",
      en: "Adjuvant breast radiotherapy with a sequential hypofractionated boost",
    },
    intent: "adjuvant",
    prescription: {
      kind: "sequential",
      phases: [
        {
          id: "whole-breast",
          label: {
            ru: "Основной курс",
            en: "Whole-breast phase",
          },
          target: {
            ru: "Молочная железа",
            en: "Whole breast",
          },
          schedule: {
            fractions: 5,
            dosePerFractionGy: 26 / 5,
          },
        },
        {
          id: "boost",
          label: {
            ru: "Последовательный boost",
            en: "Sequential boost",
          },
          target: {
            ru: "Ложе опухоли / boost-объём",
            en: "Tumour bed / boost volume",
          },
          schedule: {
            fractions: 4,
            dosePerFractionGy: 3,
          },
        },
      ],
    },
    recommendationGrade: "C",
    technique: ["photon EBRT", "sequential boost"],
    notes: [
      {
        ru: "Фазы сохраняются отдельно; HFC не объединяет их автоматически в один n×d preset.",
        en: "The phases remain separate; HFC does not automatically combine them into one n×d preset.",
      },
    ],
    status: "reviewed",
  },
] satisfies ComplexClinicalRegimenPreset[];
