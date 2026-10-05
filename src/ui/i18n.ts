import type { Language } from "./labels.js";

export function tx(
  language: Language,
  ru: string,
  en: string,
): string {
  return language === "ru" ? ru : en;
}

export function supportLabel(
  language: Language,
  support: "supported" | "limited" | "poor-fit",
): string {
  if (language === "en") {
    switch (support) {
      case "supported":
        return "supported";
      case "limited":
        return "limited support";
      case "poor-fit":
        return "poor / unstable estimate";
    }
  }

  switch (support) {
    case "supported":
      return "хорошая поддержка";
    case "limited":
      return "ограниченная поддержка";
    case "poor-fit":
      return "слабая / нестабильная оценка";
  }
}

const warningMapRu = new Map<string, string>([
  [
    "Dose per fraction is below the approximate 1 Gy lower boundary of the range with strong clinical support for simple LQ extrapolation.",
    "Доза за фракцию ниже примерно 1 Гр — нижней границы диапазона с наиболее сильной клинической поддержкой простой LQ-экстраполяции.",
  ],
  [
    "Dose per fraction exceeds 15 Gy; this is a strong extrapolation of the simple LQ model and must be interpreted cautiously.",
    "Доза за фракцию превышает 15 Гр: это выраженная экстраполяция простой LQ-модели, требующая осторожной интерпретации.",
  ],
  [
    "Dose per fraction exceeds the approximate 1–10 Gy range with strongest clinical support for the simple LQ model.",
    "Доза за фракцию превышает приблизительный диапазон 1–10 Гр, для которого простая LQ-модель имеет наиболее сильную клиническую поддержку.",
  ],
  [
    "User-specified alpha/beta overrides the curated evidence dataset for this calculation.",
    "Пользовательское α/β заменяет curated evidence value только для этого расчёта.",
  ],
  [
    "This estimate is retained for transparency but is not eligible for automatic default selection.",
    "Оценка сохранена для прозрачности, но не может выбираться автоматически как default.",
  ],
  [
    "The reported alpha/beta confidence interval reaches or crosses 0 Gy. BED becomes unbounded as alpha/beta approaches 0, so the upper BED sensitivity bound is reported as unbounded. EQD2 uses the finite alpha/beta→0+ limit.",
    "Опубликованный CI α/β достигает или пересекает 0 Гр. При α/β→0 BED становится неограниченным, поэтому верхняя граница BED sensitivity обозначается как unbounded; для EQD₂ используется конечный предел при α/β→0+.",
  ],
  [
    "User-specified Dprolif/Tk overrides the curated evidence dataset for this calculation.",
    "Пользовательские Dprolif/Tk заменяют curated evidence values только для этого расчёта.",
  ],
  [
    "Tk is user-specified for this calculation while Dprolif remains evidence-sourced.",
    "Tk задан пользователем, тогда как Dprolif остаётся evidence-sourced.",
  ],
  [
    "No single Tk value is available for this evidence record; time correction requires an explicit kick-off assumption.",
    "Для этой evidence record нет единственного значения Tk; для time correction требуется явное допущение о kick-off time.",
  ],
  [
    "The interruption exceeds one week. Basic Clinical Radiobiology 2025 cautions that simple linear Dprolif correction is most defensible for relatively small overall-time differences and should not be extrapolated casually over multi-week changes.",
    "Прерывание превышает одну неделю. Basic Clinical Radiobiology 2025 подчёркивает, что простая линейная коррекция Dprolif наиболее обоснована при небольших различиях overall treatment time и не должна бездумно экстраполироваться на многонедельные изменения.",
  ],
  [
    "RCR allows a minimum 6-hour BID interval, while Basic Clinical Radiobiology 2025 recommends the maximum practical interval, at least about 8 hours and preferably longer when feasible.",
    "RCR допускает минимальный BID-интервал 6 ч, тогда как Basic Clinical Radiobiology 2025 рекомендует максимально практичный интервал — около 8 ч и более, когда это возможно.",
  ],
  [
    "RCR does not recommend twice-daily compensation when fraction size is significantly greater than 2.2 Gy.",
    "RCR не рекомендует BID-компенсацию, если доза за фракцию существенно превышает 2,2 Гр.",
  ],
  [
    "This strategy preserves tumour EQD2 and overall treatment time only if all planned fractions can actually be delivered within the original finish date. Late-tissue incomplete repair must be assessed separately for relevant OAR endpoints.",
    "Стратегия сохраняет tumour EQD₂ и overall treatment time только если все запланированные фракции реально можно провести до исходной даты окончания. Incomplete repair поздних нормальных тканей необходимо оценивать отдельно для соответствующих OAR endpoints.",
  ],
  [
    "Weekend treatment preserves the planned fraction size and overall treatment time if operationally feasible; RCR identifies this as the preferred form of compensation before changing biological dose.",
    "Weekend treatment сохраняет плановую дозу за фракцию и overall treatment time, если это организационно возможно; RCR рассматривает такой подход как предпочтительный до изменения биологической дозы.",
  ],
  [
    "This strategy solves tumour EQD2 equivalence only. It does not prove normal-tissue safety or clinical acceptability.",
    "Эта стратегия решает только задачу эквивалентности tumour EQD₂. Она не доказывает безопасность для нормальных тканей или клиническую допустимость.",
  ],
  [
    "The solved post-gap fraction size is higher than planned. RCR notes that preserving tumour effect by increasing fraction size can worsen the therapeutic index and increase late-normal-tissue effect.",
    "Рассчитанная post-gap доза за фракцию выше плановой. RCR отмечает, что сохранение tumour effect за счёт увеличения fraction size может ухудшать therapeutic index и усиливать поздние эффекты нормальных тканей.",
  ],
  [
    "The solved dose per fraction exceeds 10 Gy; simple LQ extrapolation is increasingly uncertain and site-specific high-dose evidence is required.",
    "Рассчитанная доза за фракцию превышает 10 Гр; неопределённость простой LQ-экстраполяции возрастает, необходима site-specific high-dose evidence.",
  ],
  [
    "The overall-treatment-time extension exceeds one week; the simple linear Dprolif approximation becomes increasingly uncertain.",
    "Удлинение overall treatment time превышает одну неделю; неопределённость простой линейной аппроксимации Dprolif возрастает.",
  ],
]);

export function localizeWarning(
  language: Language,
  warning: string,
): string {
  if (language === "en") return warning;
  return warningMapRu.get(warning) ?? warning;
}

export function languageName(language: Language): string {
  return language === "ru" ? "Русский" : "English";
}
