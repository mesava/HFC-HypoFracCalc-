import { evidenceManifest } from "../data/evidence/v0.1/index.js";

export type SitePage =
  | "home"
  | "quick"
  | "compare"
  | "gap"
  | "methodology";

export function SiteHome({
  onNavigate,
}: {
  onNavigate: (page: SitePage) => void;
}) {
  return (
    <main className="site-home">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">HFC · HypoFracCalc</span>
          <h2>
            Проверяемая радиобиология для сравнения режимов
            фракционирования.
          </h2>
          <p>
            BED/EQD₂, endpoint-specific α/β, uncertainty, treatment gaps
            и прозрачный provenance каждого биологического параметра.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => onNavigate("quick")}
            >
              Открыть Quick EQD
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onNavigate("methodology")}
            >
              Методология и evidence
            </button>
          </div>
        </div>

        <div className="hero-status">
          <span>Текущий dataset</span>
          <strong>{evidenceManifest.datasetVersion}</strong>
          <small>
            {evidenceManifest.releaseStatus} · photon EBRT · evidence cut-off{" "}
            {evidenceManifest.evidenceCutoffDate}
          </small>
        </div>
      </section>

      <section className="site-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">modules</span>
            <h2>Калькуляторы HFC</h2>
          </div>
        </div>

        <div className="module-card-grid">
          <button
            className="module-card"
            type="button"
            onClick={() => onNavigate("quick")}
          >
            <span className="module-index">01</span>
            <strong>Quick EQD</strong>
            <p>
              BED, EQD₂, evidence-selected α/β, ручной override и
              sensitivity по 95% CI.
            </p>
            <span className="module-state ready">готово</span>
          </button>

          <button
            className="module-card"
            type="button"
            onClick={() => onNavigate("compare")}
          >
            <span className="module-index">02</span>
            <strong>Compare Regimens</strong>
            <p>
              2–5 схем, tumour + несколько OAR endpoints, ΔEQD₂ и
              коррелированный sensitivity range.
            </p>
            <span className="module-state ready">готово</span>
          </button>

          <button
            className="module-card"
            type="button"
            onClick={() => onNavigate("gap")}
          >
            <span className="module-index">03</span>
            <strong>Treatment Gap</strong>
            <p>
              OTT, Dprolif/Tk, weekend/BID compensation и решение
              post-gap dose/fraction для tumour equivalence.
            </p>
            <span className="module-state beta">v0.1</span>
          </button>

          <div className="module-card disabled-card">
            <span className="module-index">04</span>
            <strong>Reirradiation</strong>
            <p>
              Cumulative EQD₂/BED, recovery assumptions и несколько
              стратегий dose accumulation.
            </p>
            <span className="module-state planned">следующий этап</span>
          </div>
        </div>
      </section>

      <section className="site-section evidence-principles">
        <div>
          <span className="eyebrow">evidence first</span>
          <h2>Число без источника не становится default.</h2>
        </div>
        <div className="principle-grid">
          <div>
            <strong>Endpoint-specific</strong>
            <p>
              Rectum, GU, breast и другие ткани представлены конкретными
              clinical endpoints, а не одним универсальным α/β на орган.
            </p>
          </div>
          <div>
            <strong>Traceable</strong>
            <p>
              Preferred/alternative estimate, CI, source, applicability
              и ограничения сохраняются вместе с расчётом.
            </p>
          </div>
          <div>
            <strong>Override, not overwrite</strong>
            <p>
              Пользователь может ввести своё значение, но оно остаётся
              manual override и не меняет curated evidence database.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
