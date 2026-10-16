import type {
  HytecAuditFitVariant,
  HytecOtherFitUncertaintyReview,
} from "../../../domain/hytecOtherFitUncertainty.js";

const parameter = (
  name: "D50" | "TD50" | "gamma50" | "alpha/beta",
  value: number,
  low?: number,
  high?: number | null,
) => ({
  name, value,
  ...(low === undefined ? {} : { ci95: { low, high: high === undefined ? null : high } }),
});

/**
 * Eight other ORIGINAL HyTEC modelling sources (7 outcome sources plus
 * carotid bleeding NTCP). Every variant is SOURCE-only; these are NOT new
 * clinical OutcomeModels or ClinicalConstraints. Source locators are PDF
 * pages counting from 1, supplements named where appropriate.
 */
export const hytecOtherFitUncertaintyReviews: HytecOtherFitUncertaintyReview[] = [
  {
    sourceId:"soltys-2021-hytec-vestibular-tcp",
    endpointId:"vestibular-schwannoma-tumour-control",
    sourceDoi:"10.1016/j.ijrobp.2020.11.019",
    variants:[
      {id:"vs-lq-3to5y",labelRu:"LQ; 3–5-летний контроль",labelEn:"LQ; 3–5-year control",followUp:"3–5 year",doseAxis:"GTV EQD2 with fitted alpha/beta 12.4 Gy",sourceLocator:"Main PDF p5 Figure 1B, p8 discussion",modelFamily:"LQ-Poisson",modelParameters:[
        parameter("D50",3.48,3.15,4.08),parameter("gamma50",.1446,.122,.17),parameter("alpha/beta",12.4,9,19.3)
      ],status:"published-fit-parameter-reproduced-at-selected-source-points",noteRu:"30% TCP при 0 Гр добавлено как взвешенное псевдонаблюдение; не зафиксированное пересечение кривой; при 10 Гр/1 фр результат экстраполирован.",noteEn:"A weighted 30% at 0 Gy is a pseudo-observation, not a forced intercept; 10 Gy/1fx is extrapolation."},
      {id:"vs-lql-3to5y",labelRu:"LQ-L; альтернативная клеточная модель",labelEn:"LQ-L; alternative cell-response model",followUp:"3–5 year",doseAxis:"GTV EQD2 with LQ-L fitted alpha/beta 2.97 Gy",sourceLocator:"Main PDF p8 Figure 2, p9 Table 3",modelFamily:"LQL-Poisson",modelParameters:[
        parameter("D50",5.15,4.67,5.87),parameter("gamma50",.158,.135,.183),parameter("alpha/beta",2.97,1.72,4.27)
      ],status:"published-parameters-not-independently-refit",noteRu:"Другая форма BED даёт резко другое α/β; перенос любой оценки в общий селектор α/β недопустим.",noteEn:"Alternative BED formalism yields a markedly different fitted alpha/beta; neither is a universal coefficient."},
    ],researchOnly:true,sourceConfidenceBandReproduced:false,
  },
  {
    sourceId:"soltys-2021-hytec-spinal-mets-tcp",
    endpointId:"spinal-metastases-local-control",
    sourceDoi:"10.1016/j.ijrobp.2020.11.021",
    variants:[
      {id:"spine-pooled-1to5",labelRu:"Объединённая модель 1–5 фракций",labelEn:"Pooled 1–5 fraction model",followUp:"2-year",doseAxis:"3-fraction equivalent physical dose, LQ alpha/beta 6 Gy",sampleCount:2606,sourceLocator:"Supplement Table E1, DOCX table row 3; main PDF p6 Fig 1D",modelFamily:"logistic",modelParameters:[
        parameter("D50",19.44,18.07,20.53),parameter("gamma50",.8140,.6594,.9741)
      ],status:"published-fit-parameter-reproduced-at-selected-source-points",noteRu:"В исходной объединённой модели α/β=6 Гр задан как допущение; CI для него не опубликован.",noteEn:"Alpha/beta=6 Gy is an assumed conversion constant; no CI was fitted or published for it."},
      {id:"spine-1fx-only",labelRu:"Только одна фракция",labelEn:"Single-fraction subset",followUp:"2-year",doseAxis:"physical prescription dose, 1fx",sampleCount:1474,sourceLocator:"Supplement Table E1, DOCX row 4",modelFamily:"logistic",modelParameters:[
        parameter("D50",12.75,11.46,13.70),parameter("gamma50",.9612,.7249,1.2047)
      ],status:"published-parameters-not-independently-refit",noteRu:"Отдельная однофракционная кривая, не синоним объединённой модели.",noteEn:"Separate 1-fraction fit, not identical to the pooled model."},
      {id:"spine-4fx-only",labelRu:"Только четыре фракции",labelEn:"Four-fraction subset",followUp:"2-year",doseAxis:"physical prescription dose, 4fx",sampleCount:117,sourceLocator:"Supplement Table E1, DOCX row 5",modelFamily:"logistic",modelParameters:[
        parameter("D50",29.09,27.69,29.79),parameter("gamma50",4.4139,2.1562,7.1446)
      ],status:"published-parameters-not-independently-refit",noteRu:"Малая отдельная выборка; физическая доза не заменяется SFED20 либо EQD2.",noteEn:"Small separate cohort; physical 4fx prescription dose, not SFED20 or EQD2."},
      {id:"spine-5fx-only",labelRu:"Только пять фракций",labelEn:"Five-fraction subset",followUp:"2-year",doseAxis:"physical prescription dose, 5fx",sampleCount:94,sourceLocator:"Supplement Table E1, DOCX row 6",modelFamily:"logistic",modelParameters:[
        parameter("D50",21.58,12.08,25.88),parameter("gamma50",.5437,.1240,.9803)
      ],status:"published-parameters-not-independently-refit",noteRu:"Отдельная кривая для 5 фракций; n=94, интервал широкий.",noteEn:"Separate 5fx estimate based on 94 lesions; confidence interval is wide."},
    ],researchOnly:true,sourceConfidenceBandReproduced:false,
  },
  {
    sourceId:"vargo-2021-hytec-hn-reirradiation-tcp",
    endpointId:"head-neck-recurrent-reirradiation-local-control",
    sourceDoi:"10.1016/j.ijrobp.2018.01.044",
    variants:[
      {id:"vargo-lc-1y",labelRu:"Локальный контроль, 1 год",labelEn:"Local control, year 1",followUp:"1-year",doseAxis:"5-fraction equivalent physical dose, LQ alpha/beta 10 Gy",sourceLocator:"Main PDF p7 Table 4 LC 1y",modelFamily:"logistic",modelParameters:[
        parameter("D50",25.5,3.0,null),parameter("gamma50",.17,-.09,.45)
      ],status:"published-fit-parameter-reproduced-at-selected-source-points",noteRu:"Верхняя 95% ДИ D50 НЕ ОГРАНИЧЕНА (N); нижняя граница γ50 отрицательна. Fisher p=0,0685; модель слабая, не пациентский TCP.",noteEn:"D50 CI upper is unbounded (N); gamma50 CI includes negatives. Fisher p=.0685; weak 1-year fit, not individual TCP."},
      {id:"vargo-lc-2y",labelRu:"Локальный контроль, 2 года",labelEn:"Local control, year 2",followUp:"2-year",doseAxis:"5-fraction equivalent physical dose, LQ alpha/beta 10 Gy",sourceLocator:"Main PDF p7 Table 4 LC 2y",modelFamily:"logistic",modelParameters:[
        parameter("D50",45.1,39.1,71.5),parameter("gamma50",.56,.27,.85)
      ],status:"published-fit-parameter-reproduced-at-selected-source-points",noteRu:"Fisher median-split p=0,0015. Отдельная временная точка и кривая.",noteEn:"Fisher median-split p=.0015. Distinct follow-up and curve."},
      {id:"vargo-lc-3y",labelRu:"Локальный контроль, 3 года",labelEn:"Local control, year 3",followUp:"3-year",doseAxis:"5-fraction equivalent physical dose, LQ alpha/beta 10 Gy",sourceLocator:"Main PDF p7 Table 4 LC 3y",modelFamily:"logistic",modelParameters:[
        parameter("D50",49.8,43.7,72.8),parameter("gamma50",.94,.49,1.43)
      ],status:"published-fit-parameter-reproduced-at-selected-source-points",noteRu:"Fisher median-split p=0,0028; модель не корректирует эффект объёма опухоли.",noteEn:"Fisher median-split p=.0028; no adjustment for tumour volume."},
    ],researchOnly:true,sourceConfidenceBandReproduced:false,
  },
  {
    sourceId:"ohri-2021-hytec-liver-local-control",
    endpointId:"liver-metastases-local-control",
    sourceDoi:"10.1016/j.ijrobp.2017.12.288",
    variants:[
      {id:"ohri-liver-2y-bootstrap",labelRu:"Двухлетняя непрерывная модель, бутстрэп",labelEn:"2-year continuous model, bootstrap",followUp:"2-year",doseAxis:"prescription BED10 Gy; 5000 resampling iterations",sourceLocator:"Main PDF p4, section 6 Mathematical/Biological Model",modelFamily:"source-bootstrap",modelParameters:[
        parameter("TD50",16), // original study-fit value (no published parameter CI)
      ],sourceOnlyRiskIntervals:[
        {bed10Gy:80,estimate:.70,ci95:{low:.64,high:.77}},
        {bed10Gy:100,estimate:.76,ci95:{low:.70,high:.82}},
        {bed10Gy:180,estimate:.90,ci95:{low:.85,high:.95}},
      ],status:"source-bootstrap-risk-interval-only",noteRu:"Интервалы 2-летней модели получены 5000 бутстрэп-итераций; не подменять существующие в HFC 3-летние Kaplan–Meier группы 93%/65%. Исходная TCP функция также содержит параметр k=74 Гр без опубликованного параметрического CI.",noteEn:"2-year bootstrap intervals from 5000 resamples, NOT the 3-year Kaplan–Meier 93%/65% strata in HFC. Study fit also uses k=74 Gy, without a parameter CI."},
    ],researchOnly:true,sourceConfidenceBandReproduced:false,
  },
  {
    sourceId:"stumpf-2021-hytec-adrenal-tcp",
    endpointId:"adrenal-metastases-local-control",
    sourceDoi:"10.1016/j.ijrobp.2020.05.062",
    variants:[
      {id:"stumpf-1y-lc",labelRu:"Локальный контроль, 1 год",labelEn:"One-year lesion local control",followUp:"1-year",doseAxis:"EQD2_10 prescription Gy from BED10",sourceLocator:"Main PDF p7 Figure 1 and section 6",modelFamily:"Poisson",modelParameters:[
        parameter("D50",34.6,27.1,45.4),parameter("gamma50",.4996,.248,.814)
      ],status:"published-fit-parameter-reproduced-at-selected-source-points",noteRu:"Исходная кривая LC; при BED10=116,4 Гр получается приблизительно 94,98%. Статистический тест источника P<0,0001.",noteEn:"Original LC curve; at BED10=116.4 Gy, approximately 94.98% LC. Source P<.0001."},
      {id:"stumpf-1y-os-not-lc",labelRu:"Общая выживаемость, 1 год — НЕ локальный контроль",labelEn:"One-year overall survival — NOT local control",followUp:"1-year",doseAxis:"EQD2_10 prescription Gy from BED10",sourceLocator:"Main PDF p8 Figure 2",modelFamily:"Poisson",modelParameters:[
        parameter("D50",44.7,33.5,60.6),parameter("gamma50",.4546,.157,.796)
      ],status:"published-parameters-not-independently-refit",noteRu:"Отдельный исход OS и другая кривая, не источник клинической вероятности LC. Не добавлен в модели HFC.",noteEn:"Separate overall survival endpoint and coefficients; not a local-control estimate nor a new HFC clinical model."},
    ],researchOnly:true,sourceConfidenceBandReproduced:false,
  },
  {
    sourceId:"royce-2021-hytec-prostate-tcp",
    endpointId:"prostate-biochemical-control",
    sourceDoi:"10.1016/j.ijrobp.2020.08.014",
    variants:[
      {id:"royce-5y-low-intermediate",labelRu:"Низкий/промежуточный риск: НЕ ВОСПРОИЗВЕДЕНО",labelEn:"Low/intermediate: SOURCE MISMATCH",followUp:"5-year",doseAxis:"EQD2_1.5 prescription Gy",sourceLocator:"Main PDF p6 Eq2/Table 3 and p7 Figure 1",modelFamily:"Poisson",modelParameters:[
        parameter("D50",20.6,18.9,22.3),parameter("gamma50",.15,.13,.17)
      ],status:"source-numeric-discrepancy-unresolved",noteRu:"Eq2/Table3 дают 77,44% и 83,90% для EQD2 71/90 Гр, тогда как текст сообщает 90/95%; наличие 95% ДИ НЕ устраняет противоречия.",noteEn:"Eq2/Table3 yield 77.44% and 83.90% for EQD2 71/90 Gy versus stated 90/95%; 95% parameter CIs do not resolve the discrepancy."},
      {id:"royce-5y-high",labelRu:"Высокий риск: совпадают выбранные точки",labelEn:"High-risk: selected points reproduced",followUp:"5-year",doseAxis:"EQD2_1.5 prescription Gy",sourceLocator:"Main PDF p6 Eq2/Table 3 and p7 Figure 1",modelFamily:"Poisson",modelParameters:[
        parameter("D50",84.2,81.4,86.8),parameter("gamma50",4.50,2.82,6.53)
      ],status:"published-fit-parameter-reproduced-at-selected-source-points",noteRu:"Для 97/102 Гр EQD2_1.5 совпадают 90/95% (приближённо), но выборка высокого риска очень мала.",noteEn:"97/102 Gy EQD2_1.5 reproduce approximately 90/95%, but the high-risk sample is small."},
    ],researchOnly:true,sourceConfidenceBandReproduced:false,
  },
  {
    sourceId:"mahadevan-2021-hytec-pancreas-tcp",
    endpointId:"pancreas-local-control",
    sourceDoi:"10.1016/j.ijrobp.2020.11.017",
    variants:[
      {id:"mahadevan-unresected-1y",labelRu:"Без резекции, локальный контроль через 1 год",labelEn:"Unresected, 1-year local control",followUp:"1-year",doseAxis:"3-fraction-equivalent physical prescription dose; LQ alpha/beta=10 Gy",sourceLocator:"Main PDF p7, section 6 and Figure 1, Table 2",modelFamily:"logistic",modelParameters:[
        parameter("D50",17.6,8.8,21.5),parameter("gamma50",.64,.27,1.02)
      ],status:"published-fit-parameter-reproduced-at-selected-source-points",noteRu:"Fisher p=0,002; только 8 объединённых точек без операции. R0-резекция — ДРУГАЯ когорта, не кривая подгонки.",noteEn:"Fisher p=.002; only 8 pooled unresected observations. R0-resected outcomes are a DIFFERENT cohort."},
    ],researchOnly:true,sourceConfidenceBandReproduced:false,
  },
  {
    sourceId:"grimm-2021-hytec-major-vessels",
    endpointId:"major-vessel-grade3plus-bleeding",
    sourceDoi:"10.1016/j.ijrobp.2020.12.037",
    variants:[
      {id:"grimm-carotid-pooled-dmax-5fx",labelRu:"Объединённая модель кровотечения G3–5, Dmax",labelEn:"Pooled grade 3–5 bleeding, Dmax",followUp:"not-harmonised",doseAxis:"current SBRT major-vessel Dmax; 5-fraction-equivalent physical Gy",sampleCount:238,sourceLocator:"Main PDF p5 Figure 2, p7 section 6, p8 Table 2 pooled row",modelFamily:"logistic",modelParameters:[
        parameter("TD50",45.7,39.6,64.9),parameter("gamma50",1.1817,.65,1.8)
      ],status:"published-fit-parameter-reproduced-at-selected-source-points",noteRu:"Ориентиры ≈2% при Dmax20 и ≈12% при Dmax30 воспроизводятся, но не являются моделью накопленной RT дозы; 61-случайные D0.5cc и D0.1cc подгонки Table2 — другие выборки/метрики.",noteEn:"~2% at Dmax20 and ~12% at Dmax30 reproduce; NOT cumulative prior RT dose. Table2 D0.5cc/D0.1cc on 61 cases are different models and axes."},
    ],researchOnly:true,sourceConfidenceBandReproduced:false,
  },
] satisfies HytecOtherFitUncertaintyReview[];
