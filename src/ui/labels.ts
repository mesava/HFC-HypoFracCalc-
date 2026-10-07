export type Language = "ru" | "en";

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
  Tonsil: "Миндалина",
  "Central nervous system": "Центральная нервная система",
  "Optic pathways": "Зрительные пути",
  Brain: "Головной мозг",
  "Brain metastases": "Метастазы в головной мозг",
  "Carotid/major vessels": "Сонная артерия / крупные сосуды",
  Liver: "Печень",
  Bladder: "Мочевой пузырь",
  Urethra: "Уретра",
  "Vestibular schwannoma": "Вестибулярная шваннома",
  "Spinal metastases": "Метастазы в позвоночник",
  "Liver metastases": "Метастазы в печень",
  "Adrenal metastases": "Метастазы в надпочечник",
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
  "nsclc-local-control": "Локальный контроль немелкоклеточного рака лёгкого",
  "esophagus-pathologic-complete-response": "Патоморфологический полный ответ после предоперационной ХЛТ",
  "spinal-cord-radiation-myelopathy": "Лучевая миелопатия",
  "optic-pathway-radiation-neuropathy": "Лучевая нейропатия зрительных путей",
  "brain-symptomatic-radionecrosis": "Симптомный радионекроз",
  "brain-necrosis-edema-any": "Любой радионекроз или отёк",
  "brain-radionecrosis-resection": "Радионекроз, требующий хирургической резекции",
  "larynx-edema": "Поздний отёк гортани",
  "temporal-lobe-necrosis": "Лучевой некроз",
  "head-neck-larynx-tumour-control": "Опухолевый контроль гортани",
  "head-neck-tonsil-tumour-control": "Опухолевый контроль опухоли миндалины",
  "medulloblastoma-tumour-control": "Опухолевый контроль медуллобластомы",
  "brain-metastases-local-control": "Локальный контроль облучённого метастаза",
  "vestibular-schwannoma-tumour-control": "Опухолевый контроль",
  "spinal-metastases-local-control": "Локальный контроль",
  "liver-metastases-local-control": "Локальный контроль",
  "adrenal-metastases-local-control": "Локальный контроль",
  "major-vessel-grade3plus-bleeding": "Кровотечение G3–5 / carotid blowout syndrome",
  "lung-symptomatic-rilt": "Симптомная лучевая токсичность лёгких",
  "liver-grade3plus-enzyme-toxicity": "Повышение печёночных ферментов G3+",
  "bladder-prostate-sbrt-late-urinary-toxicity": "Поздняя мочевая токсичность / ухудшение качества жизни после SBRT простаты",
  "urethra-prostate-sbrt-late-urinary-toxicity": "Поздняя мочевая токсичность после SBRT простаты",
  "rectum-prostate-sbrt-late-bowel-toxicity": "Поздняя кишечная токсичность после SBRT простаты",
};

export function endpointLabel(
  language: Language,
  id: string,
  englishFallback: string,
): string {
  return language === "ru"
    ? endpointLabelsRu[id] ?? englishFallback
    : englishFallback;
}

export function organLabel(
  language: Language,
  organ: string,
): string {
  return language === "ru" ? organLabelsRu[organ] ?? organ : organ;
}

export function formatUiNumber(
  language: Language,
  value: number,
  digits = 2,
): string {
  return new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
