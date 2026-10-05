import {
  alphaBetaEstimates,
  endpoints,
  evidenceManifest,
  repairHalfTimeEstimates,
  repopulationRateEstimates,
  sources,
} from "../data/evidence/v0.1/index.js";
import { tx } from "./i18n.js";
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
        <span className="eyebrow">methodology</span>
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
            "HFC разделяет математическое ядро, evidence database и клинические workflows. Формулы не содержат скрытых organ defaults; выбор параметра всегда остаётся отдельным проверяемым шагом.",
            "HFC separates the mathematical core, evidence database, and clinical workflows. Equations do not contain hidden organ defaults; parameter selection always remains an explicit, auditable step.",
          )}
        </p>

        <div className="dataset-stat-grid">
          <div>
            <span>Endpoints</span>
            <strong>{endpoints.length}</strong>
          </div>
          <div>
            <span>α/β records</span>
            <strong>{alphaBetaEstimates.length}</strong>
          </div>
          <div>
            <span>Auto-default α/β</span>
            <strong>{preferredAlpha}</strong>
          </div>
          <div>
            <span>T½ records</span>
            <strong>{repairHalfTimeEstimates.length}</strong>
          </div>
          <div>
            <span>Dprolif records</span>
            <strong>{repopulationRateEstimates.length}</strong>
          </div>
          <div>
            <span>{tx(language, "Источники", "Sources")}</span>
            <strong>{sources.length}</strong>
          </div>
        </div>
      </section>

      <section className="methodology-grid">
        <article className="panel methodology-card">
          <span className="eyebrow">model</span>
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
              "При высоких дозах за фракцию HFC не переключает модель автоматически, а сохраняет расчёт и добавляет applicability warning.",
              "At high doses per fraction, HFC does not silently switch models; it keeps the calculation and adds an applicability warning.",
            )}
          </p>
        </article>

        <article className="panel methodology-card">
          <span className="eyebrow">time</span>
          <h3>Overall treatment time</h3>
          <p>
            {tx(
              language,
              "Time-loss хранится с явной биологической основой. В Treatment Gap v0.1 используются EQD₂-based Dprolif и Tk:",
              "Time loss is stored with an explicit biological-dose basis. Treatment Gap v0.1 uses EQD₂-based Dprolif and Tk:",
            )}
          </p>
          <code>penalty = Dprolif · max(0, OTT − Tk)</code>
          <p>
            {tx(
              language,
              "Dprolif не смешивается с BED-based K. Если Tk неизвестен, программа требует явного пользовательского допущения.",
              "Dprolif is not mixed with BED-based K. If Tk is unknown, the program requires an explicit user assumption.",
            )}
          </p>
        </article>

        <article className="panel methodology-card">
          <span className="eyebrow">repair</span>
          <h3>Incomplete repair</h3>
          <p>
            {tx(
              language,
              "T½ хранится endpoint-specific. Значения вида >5 ч или диапазоны 2–4 ч не преобразуются в искусственный point default.",
              "T½ is stored per endpoint. Bounds such as >5 h or ranges such as 2–4 h are not converted into arbitrary point defaults.",
            )}
          </p>
          <p>
            {tx(
              language,
              "Для BID минимум RCR 6 h и более консервативная позиция BCR 2025 отображаются отдельно, а не сливаются в одно правило.",
              "For BID, the RCR 6 h minimum and the more conservative BCR 2025 position are displayed separately rather than collapsed into a single rule.",
            )}
          </p>
        </article>

        <article className="panel methodology-card">
          <span className="eyebrow">uncertainty</span>
          <h3>Confidence intervals</h3>
          <p>
            {tx(
              language,
              "95% CI α/β используется как one-parameter sensitivity envelope. Это не объявляется полной клинической неопределённостью.",
              "The 95% CI of α/β is used as a one-parameter sensitivity envelope. It is not presented as full clinical uncertainty.",
            )}
          </p>
          <p>
            {tx(
              language,
              "Если CI α/β достигает нуля, BED upper sensitivity становится unbounded, а EQD₂ рассчитывается через конечный предел при α/β→0+.",
              "If the α/β CI reaches zero, the upper BED sensitivity becomes unbounded, while EQD₂ uses the finite α/β→0+ limit.",
            )}
          </p>
        </article>
      </section>

      <section className="panel evidence-governance">
        <div>
          <span className="eyebrow">dataset governance</span>
          <h2>{evidenceManifest.datasetVersion}</h2>
          <p>
            {tx(language, "Статус", "Status")}:{" "}
            <strong>{evidenceManifest.releaseStatus}</strong>.{" "}
            {tx(
              language,
              "Данные и calculation engine версионируются независимо.",
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
                " пока остаются secondary-source records из Basic Clinical Radiobiology 2025 и должны по мере необходимости заменяться или дополняться independently curated primary sources."
              : "Of " +
                alphaBetaEstimates.length +
                " α/β records, " +
                secondaryAlpha +
                " remain secondary-source records from Basic Clinical Radiobiology 2025 and should be replaced or supplemented by independently curated primary sources where clinically important."}
          </p>
          <p>
            {tx(
              language,
              "Dataset не переводится в validated до независимой проверки чисел, regression tests и project-owner review.",
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
            "HFC разрабатывается как прозрачный clinical decision-support / независимый радиобиологический калькулятор для квалифицированных специалистов лучевой терапии. Он не является prescription system и не заменяет клинический протокол, DVH/dose-volume constraints или независимую проверку.",
            "HFC is being developed as a transparent clinical decision-support / independent radiobiological calculator for qualified radiotherapy professionals. It is not a prescription system and does not replace clinical protocols, DVH/dose-volume constraints, or independent verification.",
          )}
        </p>
      </section>
    </main>
  );
}
