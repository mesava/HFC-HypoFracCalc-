import type {
  HytecAuditFitVariant,
  HytecOtherFitUncertaintyReview,
} from "../domain/hytecOtherFitUncertainty.js";
import { tx } from "./i18n.js";
import { formatUiNumber, type Language } from "./labels.js";

function formatParameter(language:Language, value:number):string {
  return formatUiNumber(language,value, String(value).split(".")[1]?.length??0);
}

function displayedConfidenceInterval(
  language:Language,
  p:HytecAuditFitVariant["modelParameters"][number],
):string {
  if (!p.ci95) return tx(language,"95% ДИ параметра не опубликован","Parameter CI not published");
  const low=formatParameter(language,p.ci95.low);
  const high=p.ci95.high===null
    ? tx(language,"верхняя граница не ограничена","upper limit unbounded")
    :formatParameter(language,p.ci95.high);
  return low+" – "+high;
}

function fitDoseAxis(language:Language, r:HytecOtherFitUncertaintyReview, fit:HytecAuditFitVariant):string {
  if (language==="en") return fit.doseAxis;
  switch (r.sourceId) {
    case "soltys-2021-hytec-vestibular-tcp":
      return "Доза GTV в EQD₂; α/β — параметр выбранной клеточной модели";
    case "soltys-2021-hytec-spinal-mets-tcp":
      return fit.id==="spine-pooled-1to5"
        ?"Физическая доза в эквиваленте 3 фракций (LQ, α/β=6 Гр)"
        :"Физическая предписанная доза, "+fit.id.split("-")[1];
    case "vargo-2021-hytec-hn-reirradiation-tcp":
      return "Физическая доза в эквиваленте 5 фракций, LQ α/β=10 Гр";
    case "ohri-2021-hytec-liver-local-control":
      return "BED₁₀ по дозе назначения, двухлетний локальный контроль";
    case "stumpf-2021-hytec-adrenal-tcp":
      return "EQD₂ с α/β=10 Гр из дозы назначения";
    case "royce-2021-hytec-prostate-tcp":
      return "EQD₂ с α/β=1,5 Гр по дозе назначения";
    case "mahadevan-2021-hytec-pancreas-tcp":
      return "Физическая доза в эквиваленте 3 фракций, LQ α/β=10 Гр";
    case "grimm-2021-hytec-major-vessels":
      return "Dmax крупных сосудов, физическая доза в эквиваленте 5 фракций; не накопленная доза";
  }
  return "Дозовая основа указана в первоисточнике";
}

/** Read-only source audit; no interactive individual TCP/NTCP calculation. */
export function HytecOtherFitAuditDetails({
  language,review,
}:{
  language:Language;
  review:HytecOtherFitUncertaintyReview;
}) {
  return (
    <details className="hytec-other-fit-review">
      <summary>{tx(language,
        "Проверка моделей и доверительных интервалов первоисточника",
        "Original-fit reproducibility and parameter CIs",
      )}</summary>
      <p>{tx(language,
        "Эти опубликованные подгонки приведены только для научной проверки. Их параметры, модельные 95% доверительные интервалы и исходные бутстрэп-оценки НЕ образуют валидированный прогноз TCP/NTCP отдельного пациента. Доверительная полоса не воспроизведена: для неё требуются совместные параметры/ковариации и исходные наблюдения.",
        "These source fits are research-only. Their parameters, marginal 95% confidence intervals, and published bootstrap estimates do NOT validate individual patient TCP/NTCP. Confidence bands have not been reproduced without joint likelihood/covariance and underlying observations.",
      )}</p>
      {review.variants.map(variant=>(
        <section className="hytec-fit-variant" key={variant.id}>
          <strong>{language==="ru"?variant.labelRu:variant.labelEn}</strong>
          <p>{fitDoseAxis(language,review,variant)}</p>
          <p>{language==="ru"?variant.noteRu:variant.noteEn}</p>
          <div className="hytec-fit-table-scroll">
            <table className="hytec-fit-table">
              <thead><tr>
                <th>{tx(language,"Параметр","Parameter")}</th>
                <th>{tx(language,"Оценка","Estimate")}</th>
                <th>95% {tx(language,"ДИ параметра","parameter CI")}</th>
              </tr></thead>
              <tbody>
                {variant.modelParameters.map(p=>(
                  <tr key={p.name}>
                    <td>{p.name==="gamma50"?"γ₅₀":p.name==="alpha/beta"?"α/β":p.name.replace("50","₅₀")}</td>
                    <td>{formatParameter(language,p.value)}</td>
                    <td>{displayedConfidenceInterval(language,p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {variant.sourceOnlyRiskIntervals?.length ? (
            <>
              <p>{tx(language,
                "Только опубликованные бутстрэп-оценки двухлетнего контроля, НЕ новые трёхлетние точки HFC:",
                "Source-only 2-year bootstrap LC intervals, NOT additional 3-year HFC outcome points:",
              )}</p>
              <div className="hytec-fit-table-scroll">
                <table className="hytec-fit-table">
                  <thead><tr><th>BED₁₀, {tx(language,"Гр","Gy")}</th>
                    <th>{tx(language,"2-летний контроль","2-year control")}</th>
                    <th>95% {tx(language,"бутстрэп-ДИ","bootstrap CI")}</th></tr></thead>
                  <tbody>{variant.sourceOnlyRiskIntervals.map(p=>(
                    <tr key={p.bed10Gy}>
                      <td>{formatParameter(language,p.bed10Gy)}</td>
                      <td>{formatUiNumber(language,p.estimate*100,0)}%</td>
                      <td>{formatUiNumber(language,p.ci95.low*100,0)}–{formatUiNumber(language,p.ci95.high*100,0)}%</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          ):null}
          <small>{tx(language,"Первоисточник: ","Original: ")}{variant.sourceLocator}</small>
        </section>
      ))}
    </details>
  );
}
