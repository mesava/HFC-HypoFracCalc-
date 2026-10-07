import { tx } from "./i18n.js";
import type { Language } from "./labels.js";
import type { SitePage } from "./SiteHome.js";

type GuideTarget = Extract<
  SitePage,
  "quick" | "compare" | "gap" | "constraints" | "outcomes" | "reirradiation" | "audit"
>;

export function HowToView({
  language,
  onNavigate,
}: {
  language: Language;
  onNavigate: (page: GuideTarget) => void;
}) {
  const gy = language === "ru" ? "Гр" : "Gy";

  return (
    <main className="howto-page">
      <section className="panel howto-hero">
        <span className="eyebrow">
          {tx(language, "как пользоваться", "how to use")}
        </span>
        <h2>
          {tx(
            language,
            "От клинического вопроса к проверяемому расчёту",
            "From a clinical question to an auditable calculation",
          )}
        </h2>
        <p>
          {tx(
            language,
            "HFC лучше использовать не как «калькулятор одного числа», а как последовательность: выбрать клинический исход → проверить источник параметра → задать схему → прочитать предупреждения → сохранить аудит.",
            "HFC works best as a sequence rather than a one-number calculator: choose the clinical endpoint → verify parameter provenance → enter the schedule → read warnings → save the audit.",
          )}
        </p>
        <div className="howto-rule">
          <strong>
            {tx(language, "Главное правило", "Main rule")}
          </strong>
          <span>
            {tx(
              language,
              "Сначала выберите клинический исход и доказательную основу, и только затем интерпретируйте BED/EQD₂.",
              "Choose the clinical endpoint and evidence basis first; only then interpret BED/EQD₂.",
            )}
          </span>
        </div>
      </section>

      <section className="panel howto-steps">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {tx(language, "быстрый старт", "quick start")}
            </span>
            <h2>
              {tx(language, "Четыре шага", "Four steps")}
            </h2>
          </div>
        </div>

        <div className="howto-step-grid">
          <article>
            <span>01</span>
            <strong>
              {tx(language, "Сформулируйте вопрос", "Define the question")}
            </strong>
            <p>
              {tx(
                language,
                "Например: сравнить два режима для конкретного опухолевого исхода, оценить последствия перерыва или суммировать одну и ту же дозовую метрику при повторном облучении.",
                "For example: compare two regimens for a specific tumour endpoint, evaluate a treatment interruption, or combine the same dose metric across reirradiation courses.",
              )}
            </p>
          </article>

          <article>
            <span>02</span>
            <strong>
              {tx(language, "Проверьте параметр", "Verify the parameter")}
            </strong>
            <p>
              {tx(
                language,
                "Смотрите α/β, T½, Dprolif/Tk, источник, доверительный интервал и область применимости. Значение пользователя остаётся отдельным допущением.",
                "Review α/β, T½, Dprolif/Tk, source, confidence interval, and applicability. A user-entered value remains a separate assumption.",
              )}
            </p>
          </article>

          <article>
            <span>03</span>
            <strong>
              {tx(language, "Введите дозу корректно", "Enter dose correctly")}
            </strong>
            <p>
              {tx(
                language,
                "Для органов риска используйте реальную выбранную дозовую метрику — Dmax, D0.1cc, D2cc и т.п., а не автоматически предписанную дозу на мишень.",
                "For OARs use the actual selected dose metric — Dmax, D0.1cc, D2cc, etc. — not the target prescription dose by default.",
              )}
            </p>
          </article>

          <article>
            <span>04</span>
            <strong>
              {tx(language, "Сохраните проверяемый след", "Keep an auditable trail")}
            </strong>
            <p>
              {tx(
                language,
                "Прочитайте предупреждения, скачайте audit JSON или печатный отчёт и при необходимости воспроизведите расчёт в разделе «Проверка аудита».",
                "Read warnings, download the audit JSON or printable report, and replay the calculation in Audit Replay when needed.",
              )}
            </p>
          </article>
        </div>
      </section>

      <section className="howto-example-grid">
        <article className="panel howto-example">
          <div className="howto-example-head">
            <span className="module-index">01</span>
            <div>
              <span className="eyebrow">BED / EQD₂</span>
              <h3>{tx(language, "Пример: Быстрый EQD", "Example: Quick EQD")}</h3>
            </div>
          </div>
          <p>
            {tx(
              language,
              "Учебный пример: биохимический контроль при раке простаты, 5 × 7.25 Гр. Если выбрана опубликованная оценка α/β = 1.6 Гр (Vogelius & Bentzen 2020), HFC получает:",
              "Educational example: prostate biochemical control, 5 × 7.25 Gy. With the published α/β = 1.6 Gy estimate (Vogelius & Bentzen 2020), HFC gives:",
            )}
          </p>
          <div className="howto-metrics">
            <div>
              <span>BED</span>
              <strong>200.51 {gy}</strong>
            </div>
            <div>
              <span>EQD₂</span>
              <strong>89.11 {gy}</strong>
            </div>
          </div>
          <p className="howto-caveat">
            {tx(
              language,
              "Это пример работы LQ-модели, а не утверждение о клинической взаимозаменяемости режимов.",
              "This demonstrates the LQ calculation; it is not a statement that regimens are clinically interchangeable.",
            )}
          </p>
          <button type="button" className="secondary-button" onClick={() => onNavigate("quick")}>
            {tx(language, "Открыть Быстрый EQD", "Open Quick EQD")}
          </button>
        </article>

        <article className="panel howto-example">
          <div className="howto-example-head">
            <span className="module-index">02</span>
            <div>
              <span className="eyebrow">
                {tx(language, "сравнение", "comparison")}
              </span>
              <h3>
                {tx(language, "Пример: два режима", "Example: two regimens")}
              </h3>
            </div>
          </div>
          <p>
            {tx(
              language,
              "Добавьте 2–5 фиксированных схем, выберите один опухолевый исход и при необходимости несколько исходов для органов риска. HFC покажет BED/EQD₂ и ΔEQD₂ относительно выбранной референсной схемы.",
              "Add 2–5 fixed schedules, choose one tumour endpoint and, when needed, several OAR endpoints. HFC shows BED/EQD₂ and ΔEQD₂ relative to the selected reference regimen.",
            )}
          </p>
          <ul>
            <li>
              {tx(
                language,
                "RCR preset заполняет схему, но не выбирает α/β.",
                "An RCR preset fills the schedule but does not choose α/β.",
              )}
            </li>
            <li>
              {tx(
                language,
                "После ручного изменения схемы provenance preset очищается.",
                "Editing the schedule manually clears preset provenance.",
              )}
            </li>
          </ul>
          <button type="button" className="secondary-button" onClick={() => onNavigate("compare")}>
            {tx(language, "Открыть сравнение", "Open comparison")}
          </button>
        </article>

        <article className="panel howto-example">
          <div className="howto-example-head">
            <span className="module-index">03</span>
            <div>
              <span className="eyebrow">
                {tx(language, "перерыв", "treatment gap")}
              </span>
              <h3>
                {tx(
                  language,
                  "Пример: пропущенные фракции",
                  "Example: missed fractions",
                )}
              </h3>
            </div>
          </div>
          <p>
            {tx(
              language,
              "Для курса 70 Гр / 35 фракций задайте реальные даты начала и перерыва. Затем явно выберите подходящую Dprolif/Tk-модель или введите локальное значение с обоснованием.",
              "For a 70 Gy / 35-fraction course, enter the real start and interruption dates. Then explicitly choose an appropriate Dprolif/Tk model or enter a justified local value.",
            )}
          </p>
          <ol>
            <li>{tx(language, "Сначала оцените вариант без компенсации.", "First evaluate no compensation.")}</li>
            <li>{tx(language, "Затем — выходные дни или BID, если это допустимо.", "Then consider weekends or BID when appropriate.")}</li>
            <li>{tx(language, "Для OAR вводите его собственную дозовую метрику.", "For an OAR enter its own dose metric.")}</li>
          </ol>
          <button type="button" className="secondary-button" onClick={() => onNavigate("gap")}>
            {tx(language, "Открыть Перерывы", "Open Treatment Gap")}
          </button>
        </article>

        <article className="panel howto-example">
          <div className="howto-example-head">
            <span className="module-index">04</span>
            <div>
              <span className="eyebrow">
                {tx(language, "повторное облучение", "reirradiation")}
              </span>
              <h3>
                {tx(
                  language,
                  "Пример: одна и та же D0.1cc",
                  "Example: the same D0.1cc metric",
                )}
              </h3>
            </div>
          </div>
          <p>
            {tx(
              language,
              "Учебный пример при α/β = 3 Гр без восстановления: предыдущая D0.1cc = 30 Гр / 10 фракций даёт EQD₂ = 36 Гр; текущая D0.1cc = 25 Гр / 5 фракций — EQD₂ = 40 Гр; математическая сумма = 76 Гр EQD₂.",
              "Educational example with α/β = 3 Gy and no recovery: previous D0.1cc = 30 Gy / 10 fractions gives EQD₂ = 36 Gy; current D0.1cc = 25 Gy / 5 fractions gives EQD₂ = 40 Gy; the mathematical sum is 76 Gy EQD₂.",
            )}
          </p>
          <p className="howto-caveat">
            {tx(
              language,
              "Суммировать можно только сопоставимую метрику. Эта сумма не является автоматически допустимым клиническим пределом и не доказывает пространственное совпадение дозы.",
              "Only a comparable metric can be combined. The sum is not automatically a clinical tolerance limit and does not prove spatial dose co-location.",
            )}
          </p>
          <button type="button" className="secondary-button" onClick={() => onNavigate("reirradiation")}>
            {tx(language, "Открыть Повторное облучение", "Open Reirradiation")}
          </button>
        </article>

        <article className="panel howto-example">
          <div className="howto-example-head">
            <span className="module-index">05</span>
            <div>
              <span className="eyebrow">HyTEC</span>
              <h3>
                {tx(
                  language,
                  "Ограничения и модели исходов",
                  "Constraints and outcome models",
                )}
              </h3>
            </div>
          </div>
          <p>
            {tx(
              language,
              "В «Клинических ограничениях» фильтруйте записи по органу, endpoint и числу фракций. Всегда различайте planning limit, risk point и observational threshold. В «Моделях исходов» HFC показывает опубликованные точки без скрытой интерполяции.",
              "In Clinical Constraints filter by organ, endpoint, and fractionation. Always distinguish a planning limit, risk point, and observational threshold. Outcome Models displays published points without hidden interpolation.",
            )}
          </p>
          <div className="howto-button-row">
            <button type="button" className="secondary-button" onClick={() => onNavigate("constraints")}>
              {tx(language, "Ограничения", "Constraints")}
            </button>
            <button type="button" className="secondary-button" onClick={() => onNavigate("outcomes")}>
              {tx(language, "Модели исходов", "Outcome Models")}
            </button>
          </div>
        </article>

        <article className="panel howto-example">
          <div className="howto-example-head">
            <span className="module-index">06</span>
            <div>
              <span className="eyebrow">
                {tx(language, "аудит", "audit")}
              </span>
              <h3>
                {tx(
                  language,
                  "Как проверить сохранённый расчёт",
                  "How to verify a saved calculation",
                )}
              </h3>
            </div>
          </div>
          <p>
            {tx(
              language,
              "Скачайте audit JSON из поддерживаемого калькулятора, затем загрузите его в «Проверку аудита». HFC проверит SHA-256 envelope, версии engine/evidence и повторно выполнит расчёт.",
              "Download an audit JSON from a supported calculator and upload it to Audit Replay. HFC verifies the SHA-256 envelope, engine/evidence versions, and recalculates the result.",
            )}
          </p>
          <p className="howto-caveat">
            {tx(
              language,
              "SHA-256 подтверждает целостность файла, но не является цифровой подписью пользователя или учреждения.",
              "SHA-256 checks file integrity; it is not a digital signature of a user or institution.",
            )}
          </p>
          <button type="button" className="secondary-button" onClick={() => onNavigate("audit")}>
            {tx(language, "Открыть Проверку аудита", "Open Audit Replay")}
          </button>
        </article>
      </section>

      <section className="panel site-safety howto-safety">
        <strong>
          {tx(language, "Перед клиническим использованием", "Before clinical use")}
        </strong>
        <p>
          {tx(
            language,
            "Проверьте соответствие endpoint, dose metric, fractionation и prior-RT context исходной публикации. BED/EQD₂ — математическая эквивалентность, а не самостоятельное доказательство клинической эквивалентности. HFC требует независимой проверки и локального комиссионирования.",
            "Verify that endpoint, dose metric, fractionation, and prior-RT context match the source publication. BED/EQD₂ is mathematical equivalence, not independent proof of clinical equivalence. HFC requires independent verification and local commissioning.",
          )}
        </p>
      </section>
    </main>
  );
}
