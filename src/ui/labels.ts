export const organLabelsRu: Record<string, string> = {
  Prostate: "Предстательная железа",
  Rectum: "Прямая кишка",
  "Genitourinary tract": "Мочеполовая система",
  Breast: "Молочная железа",
  "Breast/chest wall": "Молочная железа / грудная стенка",
  "Oral/oropharyngeal mucosa": "Слизистая полости рта / ротоглотки",
  Skin: "Кожа",
  "Skin/vasculature": "Кожа / сосуды",
  "Subcutaneous tissue": "Подкожная клетчатка",
  Bowel: "Кишечник",
  Lung: "Лёгкие",
  "Head and neck normal tissues": "Нормальные ткани головы и шеи",
  "Head and neck": "Опухоли головы и шеи",
  Esophagus: "Пищевод",
  "Spinal cord": "Спинной мозг",
  Larynx: "Гортань",
  "Temporal lobe": "Височная доля",
  "Central nervous system": "Центральная нервная система",
};

export const endpointLabelsRu: Record<string, string> = {
  "prostate-biochemical-control": "Биохимический контроль после радикальной ДЛТ",

  "rectum-bleeding-g1plus": "Кровотечение G1+",
  "rectum-bleeding-g2plus": "Кровотечение G2+",
  "rectum-stool-frequency-g1plus": "Учащение стула G1+",
  "rectum-stool-frequency-g2plus": "Учащение стула G2+",
  "rectum-pain-g1plus": "Боль G1+",
  "rectum-proctitis-g1plus": "Проктит G1+",
  "rectum-proctitis-g2plus": "Проктит G2+",
  "rectum-sphincter-control-g1plus": "Нарушение контроля сфинктера G1+",
  "rectum-stricture-ulcer-g1plus": "Стриктура / язва G1+",

  "gu-dysuria-g1plus": "Дизурия G1+",
  "gu-dysuria-g2plus": "Дизурия G2+",
  "gu-hematuria-g1plus": "Гематурия G1+",
  "gu-hematuria-g2plus": "Гематурия G2+",
  "gu-incontinence-g1plus": "Недержание мочи G1+",
  "gu-incontinence-g2plus": "Недержание мочи G2+",
  "gu-reduced-flow-stricture-g1plus": "Снижение потока / стриктура G1+",
  "gu-reduced-flow-stricture-g2plus": "Снижение потока / стриктура G2+",
  "gu-urine-frequency-g1plus": "Учащённое мочеиспускание G1+",
  "gu-urine-frequency-g2plus": "Учащённое мочеиспускание G2+",

  "breast-ipsilateral-recurrence": "Ипсилатеральный рецидив опухоли",
  "breast-photographic-appearance": "Изменение внешнего вида груди по фотографии",
  "breast-physician-any-nte-fast": "Любой умеренный/выраженный поздний эффект (FAST)",
  "breast-shrinkage": "Уменьшение объёма груди",
  "breast-induration": "Индурация / фиброз",
  "breast-telangiectasia": "Телеангиэктазия",
  "breast-edema": "Отёк груди",
  "breast-chestwall-any-ae-fastforward": "Любой поздний эффект груди / грудной стенки (FAST-Forward)",

  "oral-mucosa-mucositis": "Острый мукозит",
  "skin-erythema": "Острая эритема",
  "skin-telangiectasia": "Поздняя телеангиэктазия",
  "subcutis-fibrosis": "Поздний фиброз",
  "bowel-stricture-perforation": "Поздняя стриктура / перфорация",
  "bowel-various-late-effects": "Различные поздние кишечные осложнения",
  "lung-pneumonitis": "Лучевой пневмонит",
  "lung-radiological-fibrosis": "Радиологический фиброз / поздние изменения",
  "head-neck-various-late-effects": "Различные поздние эффекты",
  "head-neck-tumour-control": "Локорегионарный / опухолевый контроль",
  "nsclc-stage-i-local-control": "Локальный контроль NSCLC I стадии",
  "esophagus-pathologic-complete-response": "Патоморфологический полный ответ после предоперационной ХЛТ",
  "spinal-cord-radiation-myelopathy": "Лучевая миелопатия",
  "larynx-edema": "Поздний отёк гортани",
  "temporal-lobe-necrosis": "Лучевой некроз",
  "head-neck-larynx-tumour-control": "Опухолевый контроль гортани",
  "head-neck-tonsil-tumour-control": "Опухолевый контроль опухоли миндалины",
  "medulloblastoma-tumour-control": "Опухолевый контроль медуллобластомы",
};

export function endpointLabelRu(id: string, fallback: string): string {
  return endpointLabelsRu[id] ?? fallback;
}

export function organLabelRu(organ: string): string {
  return organLabelsRu[organ] ?? organ;
}
