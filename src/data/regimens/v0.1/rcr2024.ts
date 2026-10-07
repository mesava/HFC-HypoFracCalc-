import type {
  ClinicalRegimenPreset,
} from "../../../domain/regimen.js";
import {
  regimenLibraryManifest,
} from "./manifest.js";

const V = regimenLibraryManifest.datasetVersion;
const S = regimenLibraryManifest.sourceId;

export const rcr2024RegimenPresets = [
  {
    id: "rcr2024-breast-nonnodal-26gy-5fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "03 Breast cancer",
    site: "breast",
    label: {
      ru: "Молочная железа/грудная стенка 26 Гр / 5",
      en: "Breast/chest wall 26 Gy / 5",
    },
    indication: {
      ru: "Адъювантное облучение ненодальной молочной железы или грудной стенки без немедленной реконструкции",
      en: "Adjuvant radiotherapy of non-nodal breast or chest wall without immediate reconstruction",
    },
    intent: "adjuvant",
    schedule: {
      fractions: 5,
      dosePerFractionGy: 26 / 5,
    },
    overallTreatment: {
      ru: "1 неделя",
      en: "1 week",
    },
    recommendationGrade: "A",
    technique: ["photon EBRT"],
    status: "reviewed",
  },
  {
    id: "rcr2024-breast-pbi-26gy-5fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "03 Breast cancer",
    site: "breast",
    label: {
      ru: "Частичное облучение молочной железы 26 Гр / 5",
      en: "Partial breast irradiation 26 Gy / 5",
    },
    indication: {
      ru: "Частичное облучение молочной железы наружным пучком у подходящих пациентов",
      en: "External-beam partial breast irradiation in suitable patients",
    },
    intent: "adjuvant",
    schedule: {
      fractions: 5,
      dosePerFractionGy: 26 / 5,
    },
    overallTreatment: {
      ru: "1 неделя",
      en: "1 week",
    },
    recommendationGrade: "A",
    technique: ["photon EBRT", "PBI"],
    status: "reviewed",
  },
  {
    id: "rcr2024-breast-rni-40gy-15fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "03 Breast cancer",
    site: "breast",
    label: {
      ru: "Регионарные лимфоузлы 40 Гр / 15",
      en: "Regional nodal irradiation 40 Gy / 15",
    },
    indication: {
      ru: "Регионарное лимфатическое облучение при раке молочной железы",
      en: "Regional nodal irradiation for breast cancer",
    },
    intent: "adjuvant",
    schedule: {
      fractions: 15,
      dosePerFractionGy: 40 / 15,
    },
    overallTreatment: {
      ru: "3 недели",
      en: "3 weeks",
    },
    recommendationGrade: "B",
    technique: ["photon EBRT", "RNI"],
    status: "reviewed",
  },

  {
    id: "rcr2024-prostate-only-60gy-20fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "13 Prostate cancer",
    site: "prostate",
    label: {
      ru: "Простата 60 Гр / 20",
      en: "Prostate 60 Gy / 20",
    },
    indication: {
      ru: "Радикальная лучевая терапия только предстательной железы",
      en: "Definitive prostate-only radiotherapy",
    },
    intent: "definitive",
    schedule: {
      fractions: 20,
      dosePerFractionGy: 3,
    },
    overallTreatment: {
      ru: "4 недели",
      en: "4 weeks",
    },
    recommendationGrade: "A",
    technique: ["photon EBRT"],
    status: "reviewed",
  },
  {
    id: "rcr2024-prostate-sbrt-36p25gy-5fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "13 Prostate cancer",
    site: "prostate",
    label: {
      ru: "Простата SBRT 36,25 Гр / 5",
      en: "Prostate SBRT 36.25 Gy / 5",
    },
    indication: {
      ru: "Стереотаксическая лучевая терапия предстательной железы",
      en: "Stereotactic radiotherapy for prostate cancer",
    },
    intent: "definitive",
    schedule: {
      fractions: 5,
      dosePerFractionGy: 36.25 / 5,
    },
    recommendationGrade: "A",
    technique: ["SBRT"],
    notes: [
      {
        ru: "Preset не задаёт α/β и не определяет показания к ADT.",
        en: "The preset does not select alpha/beta or determine ADT indications.",
      },
    ],
    status: "reviewed",
  },
  {
    id: "rcr2024-prostate-pelvic-nodes-50gy-25fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "13 Prostate cancer",
    site: "prostate",
    label: {
      ru: "Тазовые лимфоузлы 50 Гр / 25",
      en: "Pelvic nodal RT 50 Gy / 25",
    },
    indication: {
      ru: "Облучение тазовых лимфатических узлов при раке предстательной железы",
      en: "Pelvic nodal radiotherapy for prostate cancer",
    },
    intent: "definitive",
    schedule: {
      fractions: 25,
      dosePerFractionGy: 2,
    },
    overallTreatment: {
      ru: "5 недель",
      en: "5 weeks",
    },
    recommendationGrade: "A",
    technique: ["photon EBRT", "pelvic nodal RT"],
    status: "reviewed",
  },
  {
    id: "rcr2024-prostate-pelvic-nodes-46gy-23fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "13 Prostate cancer",
    site: "prostate",
    label: {
      ru: "Тазовые лимфоузлы 46 Гр / 23",
      en: "Pelvic nodal RT 46 Gy / 23",
    },
    indication: {
      ru: "Облучение тазовых лимфатических узлов при раке предстательной железы",
      en: "Pelvic nodal radiotherapy for prostate cancer",
    },
    intent: "definitive",
    schedule: {
      fractions: 23,
      dosePerFractionGy: 2,
    },
    overallTreatment: {
      ru: "4,5 недели",
      en: "4.5 weeks",
    },
    recommendationGrade: "A",
    technique: ["photon EBRT", "pelvic nodal RT"],
    status: "reviewed",
  },
  {
    id: "rcr2024-prostate-postop-66gy-33fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "13 Prostate cancer",
    site: "prostate",
    label: {
      ru: "Послеоперационная ЛТ простаты 66 Гр / 33",
      en: "Postoperative prostate RT 66 Gy / 33",
    },
    indication: {
      ru: "Послеоперационная лучевая терапия ложа предстательной железы",
      en: "Postoperative prostate-bed radiotherapy",
    },
    intent: "postoperative",
    schedule: {
      fractions: 33,
      dosePerFractionGy: 2,
    },
    overallTreatment: {
      ru: "6,5 недели",
      en: "6.5 weeks",
    },
    recommendationGrade: "C",
    technique: ["photon EBRT"],
    status: "reviewed",
  },

  {
    id: "rcr2024-nsclc-sabr-favorable-54gy-3fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "09 Lung cancer",
    site: "lung",
    label: {
      ru: "Периферический NSCLC SABR 54 Гр / 3",
      en: "Peripheral NSCLC SABR 54 Gy / 3",
    },
    indication: {
      ru: "Медицински неоперабельный T1–T2b (≤5 см) N0 NSCLC благоприятной анатомической локализации",
      en: "Medically inoperable T1-T2b (≤5 cm) N0 NSCLC in a favourable anatomical position",
    },
    intent: "definitive",
    schedule: {
      fractions: 3,
      dosePerFractionGy: 18,
    },
    overallTreatment: {
      ru: "5–8 дней",
      en: "5-8 days",
    },
    recommendationGrade: "B",
    technique: ["SABR"],
    status: "reviewed",
  },
  {
    id: "rcr2024-nsclc-sabr-favorable-55gy-5fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "09 Lung cancer",
    site: "lung",
    label: {
      ru: "Периферический NSCLC SABR 55 Гр / 5",
      en: "Peripheral NSCLC SABR 55 Gy / 5",
    },
    indication: {
      ru: "Медицински неоперабельный T1–T2b (≤5 см) N0 NSCLC благоприятной анатомической локализации",
      en: "Medically inoperable T1-T2b (≤5 cm) N0 NSCLC in a favourable anatomical position",
    },
    intent: "definitive",
    schedule: {
      fractions: 5,
      dosePerFractionGy: 11,
    },
    overallTreatment: {
      ru: "10–14 дней",
      en: "10-14 days",
    },
    recommendationGrade: "B",
    technique: ["SABR"],
    status: "reviewed",
  },
  {
    id: "rcr2024-nsclc-sabr-favorable-60gy-8fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "09 Lung cancer",
    site: "lung",
    label: {
      ru: "Периферический NSCLC SABR 60 Гр / 8",
      en: "Peripheral NSCLC SABR 60 Gy / 8",
    },
    indication: {
      ru: "Медицински неоперабельный T1–T2b (≤5 см) N0 NSCLC благоприятной анатомической локализации",
      en: "Medically inoperable T1-T2b (≤5 cm) N0 NSCLC in a favourable anatomical position",
    },
    intent: "definitive",
    schedule: {
      fractions: 8,
      dosePerFractionGy: 7.5,
    },
    overallTreatment: {
      ru: "10–20 дней",
      en: "10-20 days",
    },
    recommendationGrade: "B",
    technique: ["SABR"],
    status: "reviewed",
  },
  {
    id: "rcr2024-nsclc-palliative-goodps-30gy-10fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "09 Lung cancer",
    site: "lung",
    label: {
      ru: "NSCLC паллиативно 30 Гр / 10",
      en: "Palliative NSCLC 30 Gy / 10",
    },
    indication: {
      ru: "Паллиативная лучевая терапия NSCLC при хорошем функциональном статусе",
      en: "Palliative radiotherapy for NSCLC with good performance status",
    },
    intent: "palliative",
    schedule: {
      fractions: 10,
      dosePerFractionGy: 3,
    },
    overallTreatment: {
      ru: "2 недели",
      en: "2 weeks",
    },
    recommendationGrade: "A",
    technique: ["photon EBRT"],
    status: "reviewed",
  },
  {
    id: "rcr2024-nsclc-palliative-goodps-20gy-5fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "09 Lung cancer",
    site: "lung",
    label: {
      ru: "NSCLC паллиативно 20 Гр / 5",
      en: "Palliative NSCLC 20 Gy / 5",
    },
    indication: {
      ru: "Паллиативная лучевая терапия NSCLC при хорошем функциональном статусе",
      en: "Palliative radiotherapy for NSCLC with good performance status",
    },
    intent: "palliative",
    schedule: {
      fractions: 5,
      dosePerFractionGy: 4,
    },
    overallTreatment: {
      ru: "1 неделя",
      en: "1 week",
    },
    recommendationGrade: "A",
    technique: ["photon EBRT"],
    status: "reviewed",
  },
  {
    id: "rcr2024-nsclc-palliative-poorps-10gy-1fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "09 Lung cancer",
    site: "lung",
    label: {
      ru: "NSCLC паллиативно 10 Гр × 1",
      en: "Palliative NSCLC 10 Gy × 1",
    },
    indication: {
      ru: "Паллиативная лучевая терапия NSCLC при плохом функциональном статусе",
      en: "Palliative radiotherapy for NSCLC with poor performance status",
    },
    intent: "palliative",
    schedule: {
      fractions: 1,
      dosePerFractionGy: 10,
    },
    recommendationGrade: "A",
    technique: ["photon EBRT"],
    status: "reviewed",
  },

  {
    id: "rcr2024-bone-pain-8gy-1fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "19 Bone metastases",
    site: "bone-metastases",
    label: {
      ru: "Боль при метастазах в кости 8 Гр × 1",
      en: "Bone metastasis pain 8 Gy × 1",
    },
    indication: {
      ru: "Первичное лечение боли при неосложнённых костных метастазах",
      en: "Initial treatment of pain from uncomplicated bone metastases",
    },
    intent: "palliative",
    schedule: {
      fractions: 1,
      dosePerFractionGy: 8,
    },
    recommendationGrade: "A",
    technique: ["photon EBRT"],
    status: "reviewed",
  },
  {
    id: "rcr2024-bone-reirradiation-8gy-1fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "19 Bone metastases",
    site: "bone-metastases",
    label: {
      ru: "Повторное облучение костного метастаза 8 Гр × 1",
      en: "Bone metastasis reirradiation 8 Gy × 1",
    },
    indication: {
      ru: "Повторное облучение болезненного костного метастаза",
      en: "Reirradiation of painful bone metastases",
    },
    intent: "reirradiation",
    schedule: {
      fractions: 1,
      dosePerFractionGy: 8,
    },
    recommendationGrade: "B",
    technique: ["photon EBRT"],
    notes: [
      {
        ru: "Preset не оценивает кумулятивную дозу; для повторного облучения должен использоваться отдельный workflow HFC.",
        en: "This preset does not assess cumulative dose; HFC's reirradiation workflow must be used separately.",
      },
    ],
    status: "reviewed",
  },
  {
    id: "rcr2024-bone-neuropathic-8gy-1fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "19 Bone metastases",
    site: "bone-metastases",
    label: {
      ru: "Нейропатическая боль при костных метастазах 8 Гр × 1",
      en: "Neuropathic bone metastasis pain 8 Gy × 1",
    },
    indication: {
      ru: "Лечение нейропатической боли, обусловленной костными метастазами",
      en: "Treatment of neuropathic pain from bone metastases",
    },
    intent: "palliative",
    schedule: {
      fractions: 1,
      dosePerFractionGy: 8,
    },
    recommendationGrade: "A",
    technique: ["photon EBRT"],
    status: "reviewed",
  },

  {
    id: "rcr2024-brainmets-wbrt-30gy-10fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "20 Brain metastases",
    site: "brain-metastases",
    label: {
      ru: "WBRT 30 Гр / 10",
      en: "WBRT 30 Gy / 10",
    },
    indication: {
      ru: "Облучение всего головного мозга у пациентов с метастазами, не подходящих для SRS",
      en: "Whole-brain radiotherapy for brain metastases when SRS is not suitable",
    },
    intent: "palliative",
    schedule: {
      fractions: 10,
      dosePerFractionGy: 3,
    },
    overallTreatment: {
      ru: "2 недели",
      en: "2 weeks",
    },
    recommendationGrade: "A",
    technique: ["WBRT"],
    status: "reviewed",
  },
  {
    id: "rcr2024-brainmets-wbrt-20gy-5fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "20 Brain metastases",
    site: "brain-metastases",
    label: {
      ru: "WBRT 20 Гр / 5",
      en: "WBRT 20 Gy / 5",
    },
    indication: {
      ru: "Облучение всего головного мозга у пациентов с метастазами, не подходящих для SRS",
      en: "Whole-brain radiotherapy for brain metastases when SRS is not suitable",
    },
    intent: "palliative",
    schedule: {
      fractions: 5,
      dosePerFractionGy: 4,
    },
    overallTreatment: {
      ru: "1 неделя",
      en: "1 week",
    },
    recommendationGrade: "A",
    technique: ["WBRT"],
    status: "reviewed",
  },
  {
    id: "rcr2024-brainmets-srs-18gy-1fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "20 Brain metastases",
    site: "brain-metastases",
    label: {
      ru: "Метастаз 21–30 мм: SRS 18 Гр × 1",
      en: "21-30 mm metastasis: SRS 18 Gy × 1",
    },
    indication: {
      ru: "Одиночная фракция SRS для метастаза диаметром 21–30 мм",
      en: "Single-fraction SRS for a 21-30 mm brain metastasis",
    },
    intent: "definitive",
    schedule: {
      fractions: 1,
      dosePerFractionGy: 18,
    },
    recommendationGrade: "B",
    technique: ["SRS"],
    status: "reviewed",
  },
  {
    id: "rcr2024-brainmets-srs-15gy-1fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "20 Brain metastases",
    site: "brain-metastases",
    label: {
      ru: "Метастаз 31–40 мм: SRS 15 Гр × 1",
      en: "31-40 mm metastasis: SRS 15 Gy × 1",
    },
    indication: {
      ru: "Одиночная фракция SRS для метастаза диаметром 31–40 мм; RCR предлагает рассмотреть гипофракционированную SRS",
      en: "Single-fraction SRS for a 31-40 mm brain metastasis; RCR advises considering hypofractionated SRS",
    },
    intent: "definitive",
    schedule: {
      fractions: 1,
      dosePerFractionGy: 15,
    },
    recommendationGrade: "B",
    technique: ["SRS"],
    status: "reviewed",
  },
  {
    id: "rcr2024-brainmets-fsrs-30gy-5fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "20 Brain metastases",
    site: "brain-metastases",
    label: {
      ru: "Метастазы головного мозга fSRS 30 Гр / 5",
      en: "Brain metastases fSRS 30 Gy / 5",
    },
    indication: {
      ru: "Гипофракционированная SRS для метастазов головного мозга",
      en: "Hypofractionated SRS for brain metastases",
    },
    intent: "definitive",
    schedule: {
      fractions: 5,
      dosePerFractionGy: 6,
    },
    recommendationGrade: "B",
    technique: ["fSRS"],
    status: "reviewed",
  },
  {
    id: "rcr2024-brainmets-fsrs-35gy-5fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "20 Brain metastases",
    site: "brain-metastases",
    label: {
      ru: "Метастазы головного мозга fSRS 35 Гр / 5",
      en: "Brain metastases fSRS 35 Gy / 5",
    },
    indication: {
      ru: "Гипофракционированная SRS для метастазов головного мозга",
      en: "Hypofractionated SRS for brain metastases",
    },
    intent: "definitive",
    schedule: {
      fractions: 5,
      dosePerFractionGy: 7,
    },
    recommendationGrade: "B",
    technique: ["fSRS"],
    status: "reviewed",
  },

  {
    id: "rcr2024-gbm-60gy-30fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "04 Central nervous system (CNS) tumours",
    site: "glioblastoma",
    label: {
      ru: "Глиобластома 60 Гр / 30",
      en: "Glioblastoma 60 Gy / 30",
    },
    indication: {
      ru: "Радикальная лучевая терапия глиобластомы у подходящих пациентов",
      en: "Definitive radiotherapy for glioblastoma in suitable patients",
    },
    intent: "definitive",
    schedule: {
      fractions: 30,
      dosePerFractionGy: 2,
    },
    overallTreatment: {
      ru: "6 недель",
      en: "6 weeks",
    },
    recommendationGrade: "A",
    technique: ["photon EBRT"],
    notes: [
      {
        ru: "RCR рассматривает режим в контексте ± темозоломида; preset HFC не назначает системную терапию.",
        en: "RCR discusses this schedule in the context of ± temozolomide; the HFC preset does not prescribe systemic therapy.",
      },
    ],
    status: "reviewed",
  },
  {
    id: "rcr2024-gbm-40gy-15fx",
    datasetVersion: V,
    sourceId: S,
    chapter: "04 Central nervous system (CNS) tumours",
    site: "glioblastoma",
    label: {
      ru: "Глиобластома 40 Гр / 15",
      en: "Glioblastoma 40 Gy / 15",
    },
    indication: {
      ru: "Укороченный режим для пожилых или менее сохранных пациентов с глиобластомой",
      en: "Short-course regimen for older or less fit patients with glioblastoma",
    },
    intent: "definitive",
    schedule: {
      fractions: 15,
      dosePerFractionGy: 40 / 15,
    },
    overallTreatment: {
      ru: "3 недели",
      en: "3 weeks",
    },
    recommendationGrade: "A",
    technique: ["photon EBRT"],
    notes: [
      {
        ru: "RCR рассматривает режим в контексте ± темозоломида; preset HFC не назначает системную терапию.",
        en: "RCR discusses this schedule in the context of ± temozolomide; the HFC preset does not prescribe systemic therapy.",
      },
    ],
    status: "reviewed",
  },
] satisfies ClinicalRegimenPreset[];
