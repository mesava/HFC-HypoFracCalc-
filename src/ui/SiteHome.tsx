import { evidenceManifest } from "../data/evidence/v0.1/index.js";
import { releaseStatusLabel, tx } from "./i18n.js";
import type { Language } from "./labels.js";

export type SitePage =
  | "home"
  | "guide"
  | "quick"
  | "compare"
  | "gap"
  | "constraints"
  | "outcomes"
  | "reirradiation"
  | "audit"
  | "methodology"
  | "about";

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
              "BED/EQD₂, α/β для конкретных клинических исходов, неопределённость, перерывы в лечении и прозрачное происхождение каждого биологического параметра.",
              "BED/EQD₂, endpoint-specific α/β, uncertainty, treatment gaps, and transparent provenance for every biological parameter.",
            )}
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => onNavigate("quick")}
            >
              {tx(language, "Открыть быстрый расчёт EQD", "Open Quick EQD")}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onNavigate("guide")}
            >
              {tx(language, "Как пользоваться?", "How to use")}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onNavigate("methodology")}
            >
              {tx(
                language,
                "Методология и доказательная база",
                "Methodology and evidence",
              )}
            </button>
          </div>
        </div>

        <div className="hero-status">
          <span>{tx(language, "Текущий набор данных", "Current dataset")}</span>
          <strong>{evidenceManifest.datasetVersion}</strong>
          <small>
            {releaseStatusLabel(language, evidenceManifest.releaseStatus)} · {tx(language, "фотонная ДЛТ", "photon EBRT")} · {tx(language, "дата отсечения данных", "evidence cut-off")}{" "}
            {evidenceManifest.evidenceCutoffDate}
          </small>
        </div>
      </section>

      <section className="site-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{tx(language, "модули", "modules")}</span>
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
            <strong>{tx(language, "Быстрый EQD", "Quick EQD")}</strong>
            <p>
              {tx(
                language,
                "BED, EQD₂, выбор α/β из доказательной базы, ручное значение и анализ чувствительности по 95% ДИ.",
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
            <strong>{tx(language, "Сравнение режимов", "Compare Regimens")}</strong>
            <p>
              {tx(
                language,
                "2–5 схем, опухолевый исход и несколько исходов для органов риска, ΔEQD₂ и коррелированный диапазон чувствительности.",
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
            <strong>{tx(language, "Перерывы в лечении", "Treatment Gap")}</strong>
            <p>
              {tx(
                language,
                "Календарь лечения, Dprolif/Tk, компенсация за счёт выходных дней или двух фракций в сутки, расчёт опухолевого эффекта и отдельная оценка выбранной дозовой метрики органа риска.",
                "Treatment calendar, Dprolif/Tk, weekend/BID compensation, tumour-effect modelling, and explicit evaluation of a selected OAR dose metric.",
              )}
            </p>
            <span className="module-state beta">v0.2-dev</span>
          </button>

          <button
            className="module-card"
            type="button"
            onClick={() => onNavigate("constraints")}
          >
            <span className="module-index">04</span>
            <strong>
              {tx(
                language,
                "Клинические ограничения",
                "Clinical Constraints",
              )}
            </strong>
            <p>
              {tx(
                language,
                "Доза–объём–риск с явным типом доказательства, числом фракций, источником и областью применимости. Расширенный набор HyTEC v0.2.",
                "Dose-volume-risk evidence with explicit evidence type, fractionation, source, and applicability. Expanded HyTEC v0.2 dataset.",
              )}
            </p>
            <span className="module-state beta">v0.2</span>
          </button>

          <button
            className="module-card"
            type="button"
            onClick={() => onNavigate("outcomes")}
          >
            <span className="module-index">05</span>
            <strong>
              {tx(
                language,
                "Модели клинических исходов",
                "Outcome Models",
              )}
            </strong>
            <p>
              {tx(
                language,
                "Опубликованные TCP/локальный контроль из HyTEC с дозой, сроком наблюдения, подгруппой и типом доказательства — без скрытой интерполяции.",
                "Published HyTEC TCP/local-control evidence with dose, follow-up, subgroup, and evidence form — without hidden interpolation.",
              )}
            </p>
            <span className="module-state beta">v0.1</span>
          </button>

          <button
            className="module-card"
            type="button"
            onClick={() => onNavigate("reirradiation")}
          >
            <span className="module-index">06</span>
            <strong>{tx(language, "Повторное облучение", "Reirradiation")}</strong>
            <p>
              {tx(
                language,
                "Кумулятивные EQD₂/BED, тип I/II, явные допущения о восстановлении и отдельная проверка критериев HyTEC для повторного облучения спинного мозга.",
                "Cumulative EQD₂/BED, type I/II classification, explicit recovery assumptions, and a dedicated HyTEC spinal reirradiation assessment.",
              )}
            </p>
            <span className="module-state beta">v0.2-dev</span>
          </button>
        </div>
      </section>

      <section className="site-section evidence-principles">
        <div>
          <span className="eyebrow">{tx(language, "доказательность прежде всего", "evidence first")}</span>
          <h2>
            {tx(
              language,
              "Число без источника не становится значением по умолчанию.",
              "A number without a source does not become a default.",
            )}
          </h2>
        </div>
        <div className="principle-grid">
          <div>
            <strong>{tx(language, "Привязка к клиническому исходу", "Endpoint-specific")}</strong>
            <p>
              {tx(
                language,
                "Прямая кишка, мочеполовая система, молочная железа и другие ткани представлены конкретными клиническими исходами, а не одним универсальным α/β для всего органа.",
                "Rectum, GU, breast, and other tissues are represented by specific clinical endpoints rather than one universal organ-level α/β.",
              )}
            </p>
          </div>
          <div>
            <strong>{tx(language, "Прослеживаемость", "Traceable")}</strong>
            <p>
              {tx(
                language,
                "Предпочтительная или альтернативная оценка, доверительный интервал, источник, область применимости и ограничения сохраняются вместе с расчётом.",
                "Preferred/alternative estimate, CI, source, applicability, and caveats remain attached to the calculation.",
              )}
            </p>
          </div>
          <div>
            <strong>{tx(language, "Переопределение без перезаписи", "Override, not overwrite")}</strong>
            <p>
              {tx(
                language,
                "Пользователь может ввести своё значение, но оно остаётся пользовательским переопределением и не изменяет курируемую доказательную базу.",
                "Users may enter a custom value, but it remains a manual override and does not alter the curated evidence database.",
              )}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
