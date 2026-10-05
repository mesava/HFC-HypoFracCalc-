import {
  alphaBetaEstimates,
  endpoints,
  evidenceManifest,
  hytecClinicalConstraints,
  repairHalfTimeEstimates,
  repopulationRateEstimates,
  sources,
} from "../data/evidence/v0.1/index.js";
import { releaseStatusLabel, tx } from "./i18n.js";
import type { Language } from "./labels.js";

export function MethodologyView({
  language,
}: {
  language: Language;
}) {
  const preferredAlpha = alphaBetaEstimates.filter(
    (record) =>
      record.status === "preferred" && record.defaultEligible,
  ).length;
  const secondaryAlpha = alphaBetaEstimates.filter(
    (record) => record.sourceId === "bcr-2025-ch10-tables",
  ).length;

  return (
    <main className="methodology-page">
      <section className="panel methodology-hero">
        <span className="eyebrow">{tx(language, "методология", "methodology")}</span>
        <h2>
          {tx(
            language,
            "Как HFC получает и использует радиобиологические параметры",
            "How HFC obtains and uses radiobiological parameters",
          )}
        </h2>
        <p>
          {tx(
            language,
            "HFC разделяет математическое ядро, доказательную базу и клинические сценарии расчёта. Формулы не содержат скрытых значений по умолчанию для органов; выбор параметра всегда остаётся отдельным проверяемым шагом.",
            "HFC separates the mathematical core, evidence database, and clinical workflows. Equations do not contain hidden organ defaults; parameter selection always remains an explicit, auditable step.",
          )}
        </p>

        <div className="dataset-stat-grid">
          <div>
            <span>{tx(language, "Клинические исходы", "Endpoints")}</span>
            <strong>{endpoints.length}</strong>
          </div>
          <div>
            <span>{tx(language, "Записи α/β", "α/β records")}</span>
            <strong>{alphaBetaEstimates.length}</strong>
          </div>
          <div>
            <span>{tx(language, "α/β с автоматическим выбором", "Auto-default α/β")}</span>
            <strong>{preferredAlpha}</strong>
          </div>
          <div>
            <span>{tx(language, "Записи T½", "T½ records")}</span>
            <strong>{repairHalfTimeEstimates.length}</strong>
          </div>
          <div>
            <span>{tx(language, "Записи Dprolif", "Dprolif records")}</span>
            <strong>{repopulationRateEstimates.length}</strong>
          </div>
          <div>
            <span>
              {tx(
                language,
                "Клинические ограничения",
                "Clinical constraints",
              )}
            </span>
            <strong>{hytecClinicalConstraints.length}</strong>
          </div>
          <div>
            <span>{tx(language, "Источники", "Sources")}</span>
            <strong>{sources.length}</strong>
          </div>
        </div>
      </section>

      <section className="methodology-grid">
        <article className="panel methodology-card">
          <span className="eyebrow">{tx(language, "модель", "model")}</span>
          <h3>LQ / BED / EQD₂</h3>
          <p>
            {tx(
              language,
              "Базовая модель использует линейно-квадратичное представление:",
              "The core model uses the linear-quadratic representation:",
            )}
          </p>
          <code>BED = nd · (1 + d/(α/β))</code>
          <code>EQD₂ = nd · (d + α/β)/(2 + α/β)</code>
          <p>
            {tx(
              language,
              "При высоких дозах за фракцию HFC не переключает модель автоматически, а сохраняет расчёт и добавляет предупреждение об ограничениях применимости.",
              "At high doses per fraction, HFC does not silently switch models; it keeps the calculation and adds an applicability warning.",
            )}
          </p>
        </article>

        <article className="panel methodology-card">
          <span className="eyebrow">{tx(language, "время", "time")}</span>
          <h3>Overall treatment time</h3>
          <p>
            {tx(
              language,
              "Поправка на продолжительность лечения хранится с явным указанием биологической основы. В модуле «Перерывы в лечении» v0.1 используются Dprolif и Tk в единицах EQD₂:",
              "Time loss is stored with an explicit biological-dose basis. Treatment Gap v0.1 uses EQD₂-based Dprolif and Tk:",
            )}
          </p>
          <code>penalty = Dprolif · max(0, OTT − Tk)</code>
          <p>
            {tx(
              language,
              "Dprolif не смешивается с коэффициентом K, заданным в единицах BED. Если Tk неизвестен, программа требует явного пользовательского допущения.",
              "Dprolif is not mixed with BED-based K. If Tk is unknown, the program requires an explicit user assumption.",
            )}
          </p>
        </article>

        <article className="panel methodology-card">
          <span className="eyebrow">{tx(language, "восстановление", "repair")}</span>
          <h3>{tx(language, "Неполное восстановление", "Incomplete repair")}</h3>
          <p>
            {tx(
              language,
              "T½ хранится для конкретного клинического исхода. Значения вида >5 ч или диапазоны 2–4 ч не преобразуются в искусственное точечное значение по умолчанию.",
              "T½ is stored per endpoint. Bounds such as >5 h or ranges such as 2–4 h are not converted into arbitrary point defaults.",
            )}
          </p>
          <p>
            {tx(
              language,
              "Для двух фракций в сутки минимальный интервал RCR 6 ч и более консервативная позиция BCR 2025 отображаются отдельно, а не сливаются в одно правило.",
              "For BID, the RCR 6 h minimum and the more conservative BCR 2025 position are displayed separately rather than collapsed into a single rule.",
            )}
          </p>
        </article>

        <article className="panel methodology-card">
          <span className="eyebrow">
            {tx(language, "повторное облучение", "reirradiation")}
          </span>
          <h3>
            {tx(
              language,
              "Кумулятивная эквивалентная доза",
              "Cumulative equieffective dose",
            )}
          </h3>
          <p>
            {tx(
              language,
              "Перед суммированием каждый курс пересчитывается в BED/EQD₂ с одним и тем же α/β для выбранного клинического исхода. Физические дозы не используются как количественная кумулятивная OAR-доза.",
              "Each course is rescaled to BED/EQD₂ using the same α/β for the selected endpoint before summation. Physical dose is not used as quantitative cumulative OAR dose.",
            )}
          </p>
          <p>
            {tx(
              language,
              "Восстановление между курсами не выводится автоматически из временного интервала: любое снижение вклада предыдущей эквивалентной дозы задаётся пользователем явно и требует обоснования.",
              "Recovery between courses is never inferred automatically from elapsed time: any discount applied to prior equieffective dose is explicit and requires a rationale.",
            )}
          </p>
        </article>

        <article className="panel methodology-card">
          <span className="eyebrow">{tx(language, "неопределённость", "uncertainty")}</span>
          <h3>{tx(language, "Доверительные интервалы", "Confidence intervals")}</h3>
          <p>
            {tx(
              language,
              "95% ДИ α/β используется как однопараметрический диапазон чувствительности. Он не трактуется как полная клиническая неопределённость.",
              "The 95% CI of α/β is used as a one-parameter sensitivity envelope. It is not presented as full clinical uncertainty.",
            )}
          </p>
          <p>
            {tx(
              language,
              "Если ДИ α/β достигает нуля, верхняя граница чувствительности BED становится неограниченной, а EQD₂ рассчитывается через конечный предел при α/β→0+.",
              "If the α/β CI reaches zero, the upper BED sensitivity becomes unbounded, while EQD₂ uses the finite α/β→0+ limit.",
            )}
          </p>
        </article>
      </section>

      <section className="panel evidence-governance">
        <div>
          <span className="eyebrow">{tx(language, "управление набором данных", "dataset governance")}</span>
          <h2>{evidenceManifest.datasetVersion}</h2>
          <p>
            {tx(language, "Статус", "Status")}:{" "}
            <strong>{releaseStatusLabel(language, evidenceManifest.releaseStatus)}</strong>.{" "}
            {tx(
              language,
              "Данные и расчётное ядро версионируются независимо.",
              "Evidence data and the calculation engine are versioned independently.",
            )}
          </p>
        </div>
        <div>
          <p>
            {language === "ru"
              ? "Из " +
                alphaBetaEstimates.length +
                " записей α/β " +
                secondaryAlpha +
                " пока основаны на вторичном источнике Basic Clinical Radiobiology 2025 и по мере необходимости должны заменяться или дополняться независимо проверенными первичными источниками."
              : "Of " +
                alphaBetaEstimates.length +
                " α/β records, " +
                secondaryAlpha +
                " remain secondary-source records from Basic Clinical Radiobiology 2025 and should be replaced or supplemented by independently curated primary sources where clinically important."}
          </p>
          <p>
            {tx(
              language,
              "Набор данных не переводится в статус «проверен» до независимой проверки чисел, регрессионных тестов и проверки владельцем проекта.",
              "The dataset is not promoted to validated until numerical cross-checking, regression tests, and project-owner review are complete.",
            )}
          </p>
        </div>
      </section>

      <section className="panel site-safety">
        <strong>{tx(language, "Назначение", "Intended use")}</strong>
        <p>
          {tx(
            language,
            "HFC разрабатывается как прозрачный инструмент поддержки клинических решений и независимый радиобиологический калькулятор для квалифицированных специалистов лучевой терапии. Он не является системой назначения лечения и не заменяет клинический протокол, ограничения по DVH/доза–объём или независимую проверку.",
            "HFC is being developed as a transparent clinical decision-support / independent radiobiological calculator for qualified radiotherapy professionals. It is not a prescription system and does not replace clinical protocols, DVH/dose-volume constraints, or independent verification.",
          )}
        </p>
      </section>
    </main>
  );
}
