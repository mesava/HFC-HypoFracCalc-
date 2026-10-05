import { evidenceManifest } from "../data/evidence/v0.1/index.js";
import { tx } from "./i18n.js";
import type { Language } from "./labels.js";

export type SitePage =
  | "home"
  | "quick"
  | "compare"
  | "gap"
  | "methodology";

export function SiteHome({
  language,
  onNavigate,
}: {
  language: Language;
  onNavigate: (page: SitePage) => void;
}) {
  return (
    <main className="site-home">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">HFC · HypoFracCalc</span>
          <h2>
            {tx(
              language,
              "Проверяемая радиобиология для сравнения режимов фракционирования.",
              "Traceable radiobiology for fractionation-regimen comparison.",
            )}
          </h2>
          <p>
            {tx(
              language,
              "BED/EQD₂, endpoint-specific α/β, неопределённость, treatment gaps и прозрачный provenance каждого биологического параметра.",
              "BED/EQD₂, endpoint-specific α/β, uncertainty, treatment gaps, and transparent provenance for every biological parameter.",
            )}
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => onNavigate("quick")}
            >
              {tx(language, "Открыть Quick EQD", "Open Quick EQD")}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onNavigate("methodology")}
            >
              {tx(
                language,
                "Методология и evidence",
                "Methodology and evidence",
              )}
            </button>
          </div>
        </div>

        <div className="hero-status">
          <span>{tx(language, "Текущий dataset", "Current dataset")}</span>
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
            <h2>{tx(language, "Калькуляторы HFC", "HFC calculators")}</h2>
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
              {tx(
                language,
                "BED, EQD₂, выбор α/β из evidence database, ручной override и sensitivity по 95% CI.",
                "BED, EQD₂, evidence-selected α/β, manual override, and 95% CI sensitivity.",
              )}
            </p>
            <span className="module-state ready">
              {tx(language, "готово", "ready")}
            </span>
          </button>

          <button
            className="module-card"
            type="button"
            onClick={() => onNavigate("compare")}
          >
            <span className="module-index">02</span>
            <strong>Compare Regimens</strong>
            <p>
              {tx(
                language,
                "2–5 схем, tumour + несколько OAR endpoints, ΔEQD₂ и коррелированный sensitivity range.",
                "2–5 regimens, tumour + multiple OAR endpoints, ΔEQD₂ and correlated sensitivity range.",
              )}
            </p>
            <span className="module-state ready">
              {tx(language, "готово", "ready")}
            </span>
          </button>

          <button
            className="module-card"
            type="button"
            onClick={() => onNavigate("gap")}
          >
            <span className="module-index">03</span>
            <strong>Treatment Gap</strong>
            <p>
              {tx(
                language,
                "OTT, Dprolif/Tk, weekend/BID compensation и решение post-gap dose/fraction для tumour equivalence.",
                "OTT, Dprolif/Tk, weekend/BID compensation, and post-gap dose/fraction solution for tumour equivalence.",
              )}
            </p>
            <span className="module-state beta">v0.1</span>
          </button>

          <div className="module-card disabled-card">
            <span className="module-index">04</span>
            <strong>Reirradiation</strong>
            <p>
              {tx(
                language,
                "Кумулятивные EQD₂/BED, recovery assumptions и несколько стратегий dose accumulation.",
                "Cumulative EQD₂/BED, recovery assumptions, and multiple dose-accumulation strategies.",
              )}
            </p>
            <span className="module-state planned">
              {tx(language, "следующий этап", "planned")}
            </span>
          </div>
        </div>
      </section>

      <section className="site-section evidence-principles">
        <div>
          <span className="eyebrow">evidence first</span>
          <h2>
            {tx(
              language,
              "Число без источника не становится default.",
              "A number without a source does not become a default.",
            )}
          </h2>
        </div>
        <div className="principle-grid">
          <div>
            <strong>Endpoint-specific</strong>
            <p>
              {tx(
                language,
                "Rectum, GU, breast и другие ткани представлены конкретными clinical endpoints, а не одним универсальным α/β на орган.",
                "Rectum, GU, breast, and other tissues are represented by specific clinical endpoints rather than one universal organ-level α/β.",
              )}
            </p>
          </div>
          <div>
            <strong>Traceable</strong>
            <p>
              {tx(
                language,
                "Preferred/alternative estimate, CI, source, applicability и ограничения сохраняются вместе с расчётом.",
                "Preferred/alternative estimate, CI, source, applicability, and caveats remain attached to the calculation.",
              )}
            </p>
          </div>
          <div>
            <strong>Override, not overwrite</strong>
            <p>
              {tx(
                language,
                "Пользователь может ввести своё значение, но оно остаётся manual override и не меняет curated evidence database.",
                "Users may enter a custom value, but it remains a manual override and does not alter the curated evidence database.",
              )}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
