import {
  alphaBetaEstimates,
  endpoints,
  evidenceManifest,
  repairHalfTimeEstimates,
  repopulationRateEstimates,
  sources,
} from "../data/evidence/v0.1/index.js";

export function MethodologyView() {
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
        <h2>Как HFC получает и использует радиобиологические параметры</h2>
        <p>
          HFC разделяет математическое ядро, evidence database и
          клинические workflows. Формулы не содержат скрытых organ
          defaults; выбор параметра всегда остаётся отдельным
          проверяемым шагом.
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
            <span>Sources</span>
            <strong>{sources.length}</strong>
          </div>
        </div>
      </section>

      <section className="methodology-grid">
        <article className="panel methodology-card">
          <span className="eyebrow">model</span>
          <h3>LQ / BED / EQD₂</h3>
          <p>
            Базовая модель использует линейно-квадратичное
            представление:
          </p>
          <code>BED = nd · (1 + d/(α/β))</code>
          <code>EQD₂ = nd · (d + α/β)/(2 + α/β)</code>
          <p>
            При высоких дозах за фракцию HFC не переключает модель
            автоматически, а сохраняет расчёт и добавляет
            applicability warning.
          </p>
        </article>

        <article className="panel methodology-card">
          <span className="eyebrow">time</span>
          <h3>Overall treatment time</h3>
          <p>
            Time-loss хранится с явной биологической основой. В
            Treatment Gap v0.1 используются EQD₂-based Dprolif и Tk:
          </p>
          <code>
            penalty = Dprolif · max(0, OTT − Tk)
          </code>
          <p>
            Dprolif не смешивается с BED-based K. Если Tk неизвестен,
            программа требует явного пользовательского допущения.
          </p>
        </article>

        <article className="panel methodology-card">
          <span className="eyebrow">repair</span>
          <h3>Incomplete repair</h3>
          <p>
            T½ хранится endpoint-specific. Значения вида &gt;5 ч или
            диапазоны 2–4 ч не преобразуются в искусственный point
            default.
          </p>
          <p>
            Для BID RCR minimum 6 h и более консервативная позиция BCR
            2025 отображаются отдельно, а не сливаются в одно правило.
          </p>
        </article>

        <article className="panel methodology-card">
          <span className="eyebrow">uncertainty</span>
          <h3>Confidence intervals</h3>
          <p>
            95% CI α/β используется как one-parameter sensitivity
            envelope. Это не объявляется полной клинической
            неопределённостью.
          </p>
          <p>
            Если CI α/β достигает нуля, BED upper sensitivity
            становится unbounded, а EQD₂ рассчитывается через конечный
            предел при α/β→0+.
          </p>
        </article>
      </section>

      <section className="panel evidence-governance">
        <div>
          <span className="eyebrow">dataset governance</span>
          <h2>{evidenceManifest.datasetVersion}</h2>
          <p>
            Статус: <strong>{evidenceManifest.releaseStatus}</strong>.
            Данные и calculation engine версионируются независимо.
          </p>
        </div>
        <div>
          <p>
            Из {alphaBetaEstimates.length} записей α/β{" "}
            {secondaryAlpha} пока остаются secondary-source records из
            Basic Clinical Radiobiology 2025 и должны по мере
            необходимости заменяться/дополняться independently curated
            primary sources.
          </p>
          <p>
            Dataset не переводится в validated до независимой проверки
            чисел, regression tests и project-owner review.
          </p>
        </div>
      </section>

      <section className="panel site-safety">
        <strong>Intended use</strong>
        <p>
          HFC разрабатывается как transparent clinical
          decision-support / independent radiobiological calculator для
          квалифицированных специалистов лучевой терапии. Он не является
          prescription system и не заменяет клинический протокол,
          DVH/dose-volume constraints или независимую проверку.
        </p>
      </section>
    </main>
  );
}
