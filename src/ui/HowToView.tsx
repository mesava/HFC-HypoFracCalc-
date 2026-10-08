import { tx } from "./i18n.js";
import type { Language } from "./labels.js";
import type { SitePage } from "./SiteHome.js";

type GuideTarget = SitePage;

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
                "После ручного изменения схемы связь с исходным шаблоном и его источником очищается.",
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
              "В «Клинических ограничениях» фильтруйте записи по органу, клиническому исходу и числу фракций. Всегда различайте планировочную границу, точку риска и наблюдательный порог. В «Моделях исходов» HFC показывает опубликованные точки без скрытой интерполяции.",
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

      <section className="panel legacy-examples">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {tx(language, "проверочные клинические задачи", "worked validation cases")}
            </span>
            <h2>
              {tx(
                language,
                "Опубликованные примеры расчётов по LQ-модели",
                "Published LQ calculation examples",
              )}
            </h2>
          </div>
        </div>

        <p className="module-lead">
          {tx(
            language,
            "Batyan и соавт. (2023) описали семь учебных задач для LQ-модели. HFC использует их как regression/teaching cases, но не переносит устаревшие биологические значения как скрытые defaults.",
            "Batyan et al. (2023) described seven teaching cases for the LQ model. HFC uses them as regression/teaching cases but does not inherit historical biological values as hidden defaults.",
          )}
        </p>

        <div className="legacy-example-grid">
          <article>
            <span className="module-index">01</span>
            <h3>{tx(language, "Изоэффективная схема", "Isoeffective regimen")}</h3>
            <p>
              {tx(
                language,
                "30 × 2 Гр заменить на 18 фракций при неизменной длительности: α/β=3 Гр → 2,85 Гр/фр; α/β=10 Гр → 3,06 Гр/фр.",
                "Replace 30 × 2 Gy with 18 fractions at unchanged treatment time: α/β=3 Gy → 2.85 Gy/fx; α/β=10 Gy → 3.06 Gy/fx.",
              )}
            </p>
            <button type="button" className="secondary-button" onClick={() => onNavigate("target-eqd")}>
              {tx(language, "Открыть подбор режима", "Open solver")}
            </button>
          </article>

          <article>
            <span className="module-index">02</span>
            <h3>{tx(language, "Подбор числа фракций", "Fraction-count solve")}</h3>
            <p>
              {tx(
                language,
                "При 2,67 Гр/фр для EQD₂=50 Гр статья получает: α/β=4,6 → 17 фр.; 8,8 → 18 фр.; 1,7 → 16 фр. HFC решает это аналитически, без ручного перебора.",
                "At 2.67 Gy/fx for EQD₂=50 Gy the paper gives: α/β=4.6 → 17 fx; 8.8 → 18 fx; 1.7 → 16 fx. HFC solves this analytically rather than by trial-and-error.",
              )}
            </p>
            <button type="button" className="secondary-button" onClick={() => onNavigate("target-eqd")}>
              {tx(language, "Проверить пример", "Check example")}
            </button>
          </article>

          <article>
            <span className="module-index">03</span>
            <h3>{tx(language, "Пропущена фракция", "Missed fraction")}</h3>
            <p>
              {tx(
                language,
                "План 5 × 5 Гр, после двух фракций среда пропущена, закончить нужно в пятницу. При α/β=10 Гр для двух оставшихся фракций получается ≈6,73 Гр/фр.",
                "Plan 5 × 5 Gy; after two fractions Wednesday is missed and treatment must still finish Friday. With α/β=10 Gy, the two remaining fractions are ≈6.73 Gy/fx.",
              )}
            </p>
            <div className="howto-button-row">
              <button type="button" className="secondary-button" onClick={() => onNavigate("course-correction")}>
                {tx(language, "Коррекция курса", "Course correction")}
              </button>
              <button type="button" className="secondary-button" onClick={() => onNavigate("calendar")}>
                {tx(language, "Показать в календаре", "Show in calendar")}
              </button>
            </div>
          </article>

          <article>
            <span className="module-index">04</span>
            <h3>{tx(language, "Двухнедельный перерыв", "Two-week interruption")}</h3>
            <p>
              {tx(
                language,
                "Исторический пример статьи для H&N после 25-й фракции сообщает EQD₂=59,5 Гр. HFC не считает это универсальным эталоном: результат зависит от явно выбранных Dprolif и Tk.",
                "The historical H&N example after fraction 25 reports EQD₂=59.5 Gy. HFC does not treat this as a universal benchmark because the result depends on explicitly selected Dprolif and Tk.",
              )}
            </p>
            <button type="button" className="secondary-button" onClick={() => onNavigate("gap")}>
              {tx(language, "Открыть модуль перерывов", "Open Treatment Gap")}
            </button>
          </article>

          <article>
            <span className="module-index">05</span>
            <h3>{tx(language, "Шесть фракций в неделю", "Six fractions per week")}</h3>
            <p>
              {tx(
                language,
                "В статье субботние фракции используются для сокращения OTT и приводят к EQD₂=64,5 Гр при их исходных допущениях. В HFC такой сценарий удобно сначала собрать визуально в календаре, затем оценить временную модель.",
                "The paper uses Saturday fractions to shorten OTT and reports EQD₂=64.5 Gy under its assumptions. In HFC, first build the schedule visually in the calendar, then evaluate the time model.",
              )}
            </p>
            <button type="button" className="secondary-button" onClick={() => onNavigate("calendar")}>
              {tx(language, "Открыть календарь", "Open calendar")}
            </button>
          </article>

          <article>
            <span className="module-index">06</span>
            <h3>{tx(language, "BID и неполное восстановление", "BID and incomplete repair")}</h3>
            <p>
              {tx(
                language,
                "Исходная статья моделирует переход к 2 фракциям/сут с интервалом 6 ч и отдельно оценивает спинной мозг. HFC использует Thames Hm, но требует явных T½ и Δt; TID доступен только как advanced-моделирование.",
                "The source paper models 2 fractions/day with a 6 h interval and separately evaluates spinal cord effect. HFC uses Thames Hm but requires explicit T½ and Δt; TID is advanced modelling only.",
              )}
            </p>
            <button type="button" className="secondary-button" onClick={() => onNavigate("calendar")}>
              {tx(language, "Смоделировать BID", "Model BID")}
            </button>
          </article>

          <article>
            <span className="module-index">07</span>
            <h3>{tx(language, "Ошибка отпуска дозы", "Dose-delivery error")}</h3>
            <p>
              {tx(
                language,
                "План 33 × 2 Гр. После 20 фракций выяснилось, что фактически отпускали 1,8 Гр. Для оставшихся 13 фракций при α/β=10 Гр требуется ≈2,30 Гр/фр.",
                "Plan 33 × 2 Gy. After 20 fractions it is discovered that 1.8 Gy/fx was actually delivered. For the remaining 13 fractions with α/β=10 Gy, ≈2.30 Gy/fx is required.",
              )}
            </p>
            <button type="button" className="secondary-button" onClick={() => onNavigate("course-correction")}>
              {tx(language, "Открыть пример", "Open example")}
            </button>
          </article>
        </div>

        <p className="legacy-source">
          <a
            href="https://doi.org/10.5772/intechopen.109621"
            target="_blank"
            rel="noreferrer"
          >
            Batyan A, Dziameshka P, Hancharova K, et al. Linear Quadratic Model in the Clinical Practice via the Web-Application. 2023.
          </a>
        </p>
      </section>

      <section className="panel site-safety howto-safety">
        <strong>
          {tx(language, "Перед клиническим использованием", "Before clinical use")}
        </strong>
        <p>
          {tx(
            language,
            "Проверьте соответствие клинического исхода, дозовой метрики, схемы фракционирования и контекста предшествующего облучения исходной публикации. BED/EQD₂ — математическая эквивалентность, а не самостоятельное доказательство клинической эквивалентности. HFC требует независимой проверки и локального комиссионирования.",
            "Verify that endpoint, dose metric, fractionation, and prior-RT context match the source publication. BED/EQD₂ is mathematical equivalence, not independent proof of clinical equivalence. HFC requires independent verification and local commissioning.",
          )}
        </p>
      </section>
    </main>
  );
}
