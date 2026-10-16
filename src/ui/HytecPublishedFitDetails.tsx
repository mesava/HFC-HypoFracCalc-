import type { HytecPublishedFitParameterReview } from "../domain/hytecPublishedFitParameters.js";
import { tx } from "./i18n.js";
import { formatUiNumber, type Language } from "./labels.js";

function sampleLabel(language: Language, fit: HytecPublishedFitParameterReview): string {
  const group: Record<string, [string, string]> = {
    "≤20 mm": ["≤20 мм", "≤20 mm"],
    "21–30 mm": ["21–30 мм", "21–30 mm"],
    "31–40 mm": ["31–40 мм", "31–40 mm"],
    "Figure 5, V12": ["Рис. 5, V12", "Figure 5, V12"],
    "Figure 6A, V14": ["Рис. 6A, V14", "Figure 6A, V14"],
    "Figure 6B, V14": ["Рис. 6B, V14", "Figure 6B, V14"],
  };
  const labels = group[fit.subgroup];
  return labels ? labels[language === "ru" ? 0 : 1] : fit.subgroup;
}

function printedNumber(language: Language, v: number): string {
  const decimals = String(v).split(".")[1]?.length ?? 0;
  return formatUiNumber(language, v, decimals);
}

function parameterLabel(
  language: Language,
  value: number,
  ci: {low: number; high: number},
  valueDigits: number,
  ciDigits: number,
): string {
  return (
    formatUiNumber(language, value, valueDigits) + " (" +
    formatUiNumber(language, ci.low, ciDigits) + "–" +
    formatUiNumber(language, ci.high, ciDigits) + ")"
  );
}

function pValueLabel(language: Language, fit: HytecPublishedFitParameterReview): string {
  const { pValue, relation } = fit.fitComparison;
  const number = pValue === 4.69e-10
    ? (language === "ru" ? "4,69×10⁻¹⁰" : "4.69×10⁻¹⁰")
    : printedNumber(language, pValue);
  return "p " + (relation === "<" ? "< " : "= ") + number;
}

/** Descriptive source parameter intervals, NEVER a calculator or NTCP risk CI. */
export function HytecPublishedFitDetails({
  language,
  fits,
}: {
  language: Language;
  fits: HytecPublishedFitParameterReview[];
}) {
  if (fits.length === 0) return null;
  const fisher = fits.some(f => f.fitComparison.method === "fisher-median-split");
  return (
    <details className="hytec-published-fit-review">
      <summary>
        {tx(
          language,
          "Параметры исходных моделей и 95% ДИ",
          "Published fitted parameters and 95% CIs",
        )}
      </summary>
      <p>
        {tx(
          language,
          "Это 95% профильные доверительные интервалы отдельно для TD₅₀/Vx₅₀ и γ₅₀, а НЕ 95% интервалы вероятности TCP/NTCP. Для расчёта доверительной полосы необходимы совместная функция правдоподобия или ковариации и исходные данные; здесь они недоступны. Представленные параметры только справочные, не используются для индивидуального расчёта.",
          "These are marginal 95% profile-likelihood intervals for TD50/Vx50 and gamma50, NOT 95% confidence intervals for TCP/NTCP. A reliable confidence band requires the joint likelihood/covariance and source data, which are unavailable here. These fits are for source reference only, not individualized prediction.",
        )}
      </p>
      <div className="hytec-fit-table-scroll">
        <table className="hytec-fit-table">
          <thead>
            <tr>
              <th>{tx(language, "Подгруппа / рисунок", "Subgroup / figure")}</th>
              <th>{tx(language, "Наблюдений", "Observations")}</th>
              <th>TD₅₀ / Vx₅₀ (95% {tx(language, "ДИ", "CI")})</th>
              <th>γ₅₀ (95% {tx(language, "ДИ", "CI")})</th>
              <th>{tx(language, "Статистика", "Statistic")}</th>
            </tr>
          </thead>
          <tbody>
            {fits.map(f => (
              <tr key={f.id}>
                <td>{sampleLabel(language, f)}</td>
                <td>{f.sourceObservations === undefined
                  ? "—" : printedNumber(language, f.sourceObservations)}</td>
                <td>{parameterLabel(
                  language, f.midpoint.value, f.midpoint.ci95,
                  f.midpointName === "TD50" ? 2 : 1,
                  f.midpointName === "TD50" ? 2 : 1,
                )}</td>
                <td>{parameterLabel(
                  language, f.slopeGamma50.value, f.slopeGamma50.ci95,
                  f.modelFamily === "log-logistic-sfed" ? 4 : 2, 2,
                )}</td>
                <td>{pValueLabel(language, f)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        {fisher
          ? tx(
            language,
            "p — критерий Фишера после разделения выборки по медиане (Table EA4), не точность прогноза и не тест калибровки индивидуального TCP. Для средней группы p = 0,188.",
            "p — Fisher's exact test after median splitting (Table EA4), not individual predictive accuracy or patient TCP calibration. The medium cohort has p = 0.188.",
          )
          : tx(
            language,
            "p — сравнение логистической модели с постоянной частотой событий по отношению правдоподобия; не проверка точности индивидуального NTCP. Планки погрешностей точек Figures 5–6 имеют 68% биномиальные интервалы, отдельно от 95% ДИ параметров модели.",
            "p — likelihood-ratio comparison with a constant-incidence model, not individual NTCP accuracy. Figure 5–6 bin error bars show 68% binomial intervals, distinct from the 95% model-parameter CIs.",
          )}
      </p>
    </details>
  );
}
