import {
  evidenceManifest,
  sources,
} from "../data/evidence/v0.1/index.js";
import { releaseStatusLabel, tx } from "./i18n.js";
import type { Language } from "./labels.js";

function sourceKindLabel(language: Language, kind: string): string {
  if (language === "en") {
    switch (kind) {
      case "randomized-trial":
        return "Randomized trial";
      case "meta-analysis":
        return "Meta-analysis";
      case "modeling-study":
        return "Modelling study";
      case "systematic-review":
        return "Systematic review";
      case "cohort":
        return "Cohort study";
      case "consensus":
        return "Consensus";
      case "guideline":
        return "Guideline / consensus";
      case "textbook":
        return "Textbook";
      case "other":
        return "Other source";
      default:
        return kind;
    }
  }

  switch (kind) {
    case "randomized-trial":
      return "Рандомизированное исследование";
    case "meta-analysis":
      return "Метаанализ";
    case "modeling-study":
      return "Моделирующее исследование";
    case "systematic-review":
      return "Систематический обзор";
    case "cohort":
      return "Когортное исследование";
    case "consensus":
      return "Консенсус";
    case "guideline":
      return "Рекомендации / консенсус";
    case "textbook":
      return "Учебное издание";
    case "other":
      return "Другой источник";
    default:
      return "Источник";
  }
}

export function AboutSiteView({
  language,
}: {
  language: Language;
}) {
  const orderedSources = [...sources].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return a.citation.localeCompare(b.citation, "en");
  });

  return (
    <main className="about-page">
      <section className="panel about-hero">
        <span className="eyebrow">
          {tx(language, "о сайте", "about")}
        </span>
        <h2>
          {tx(
            language,
            "Зачем создан HFC",
            "Why HFC was created",
          )}
        </h2>
        <p>
          {tx(
            language,
            "HFC создаётся как русскоязычный инструмент клинической радиобиологии для медицинских физиков и радиационных онкологов. Его задача — сделать расчёты BED, EQD₂, параметров фракционной чувствительности и поправок на время лечения прозрачными, воспроизводимыми и связанными с конкретными источниками.",
            "HFC is being developed as a clinical radiobiology tool for medical physicists and radiation oncologists. Its goal is to make BED, EQD₂, fractionation-sensitivity, and treatment-time calculations transparent, reproducible, and explicitly linked to their sources.",
          )}
        </p>
        <p>
          {tx(
            language,
            "Ключевая идея проекта — не хранить биологические параметры как безымянные универсальные константы. По возможности HFC связывает значение с конкретным клиническим исходом, публикацией, доверительным интервалом, областью применимости и ограничениями.",
            "The central idea is to avoid treating biological parameters as anonymous universal constants. Wherever possible, HFC links each value to a specific clinical endpoint, publication, confidence interval, applicability domain, and limitations.",
          )}
        </p>
      </section>

      <section className="about-grid">
        <article className="panel about-card">
          <span className="eyebrow">
            {tx(language, "идея", "idea")}
          </span>
          <h3>
            {tx(
              language,
              "От расчёта к проверяемому решению",
              "From calculation to auditable reasoning",
            )}
          </h3>
          <p>
            {tx(
              language,
              "Обычный BED/EQD₂-калькулятор может дать математически верный результат и при этом скрыть главный клинический вопрос: откуда взялось α/β и подходит ли оно для выбранного исхода. HFC строится так, чтобы источник и допущения были видны одновременно с результатом.",
              "A conventional BED/EQD₂ calculator may be mathematically correct while hiding the main clinical question: where did α/β come from, and is it applicable to the selected endpoint? HFC is designed so the source and assumptions remain visible alongside the result.",
            )}
          </p>
        </article>

        <article className="panel about-card">
          <span className="eyebrow">
            {tx(language, "назначение", "purpose")}
          </span>
          <h3>
            {tx(
              language,
              "Поддержка специалиста, а не назначение лечения",
              "Decision support, not treatment prescription",
            )}
          </h3>
          <p>
            {tx(
              language,
              "HFC предназначен для независимой радиобиологической проверки, сравнения режимов и анализа клинических сценариев. Он не заменяет клинический протокол, DVH, ограничения доза–объём, локальное комиссионирование и профессиональное решение.",
              "HFC is intended for independent radiobiological verification, regimen comparison, and clinical-scenario analysis. It does not replace clinical protocols, DVHs, dose-volume constraints, local commissioning, or professional judgement.",
            )}
          </p>
        </article>

        <article className="panel about-card">
          <span className="eyebrow">
            {tx(language, "принцип", "principle")}
          </span>
          <h3>
            {tx(
              language,
              "Доказательная база отделена от формул",
              "Evidence is separated from equations",
            )}
          </h3>
          <p>
            {tx(
              language,
              "Математическое ядро HFC не содержит скрытых значений α/β, T½ или Dprolif. Эти параметры хранятся отдельно, версионируются и могут обновляться без изменения самих формул.",
              "The mathematical core contains no hidden α/β, T½, or Dprolif defaults. These parameters are stored separately, versioned, and can evolve without changing the equations themselves.",
            )}
          </p>
        </article>

        <article className="panel about-card">
          <span className="eyebrow">
            {tx(language, "статус", "status")}
          </span>
          <h3>{evidenceManifest.datasetVersion}</h3>
          <p>
            {tx(language, "Статус набора данных", "Dataset status")}:{" "}
            <strong>
              {releaseStatusLabel(
                language,
                evidenceManifest.releaseStatus,
              )}
            </strong>
            .
          </p>
          <p>
            {tx(
              language,
              "Текущая версия остаётся рабочей и требует дальнейшей независимой проверки источников, регрессионных тестов и клинической валидации перед использованием как утверждённого локального инструмента.",
              "The current version remains a working draft and requires further independent source verification, regression testing, and clinical validation before use as an approved local clinical tool.",
            )}
          </p>
        </article>
      </section>

      <section className="panel literature-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {tx(language, "литература", "literature")}
            </span>
            <h2>
              {tx(
                language,
                "Источники, используемые в текущей доказательной базе",
                "Sources used by the current evidence dataset",
              )}
            </h2>
          </div>
          <span className="literature-count">
            {orderedSources.length}
          </span>
        </div>

        <p className="literature-intro">
          {tx(
            language,
            "Ниже перечислены публикации и руководства, на которые в настоящий момент ссылаются записи HFC. Список формируется непосредственно из текущего набора данных, поэтому обновляется вместе с доказательной базой.",
            "The publications and guidance documents below are referenced by the current HFC dataset. The list is generated directly from the evidence registry and therefore evolves with the dataset.",
          )}
        </p>

        <div className="literature-list">
          {orderedSources.map((source, index) => (
            <article className="literature-item" key={source.id}>
              <div className="literature-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <div className="literature-meta">
                  <span>{source.year}</span>
                  <span>·</span>
                  <span>
                    {sourceKindLabel(language, source.kind)}
                  </span>
                </div>
                <p>{source.citation}</p>
                <div className="literature-links">
                  {source.doi ? (
                    <a
                      href={`https://doi.org/${source.doi}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      DOI {source.doi}
                    </a>
                  ) : null}
                  {source.pmid ? (
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${source.pmid}/`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      PMID {source.pmid}
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel site-safety about-safety">
        <strong>
          {tx(language, "Важно", "Important")}
        </strong>
        <p>
          {tx(
            language,
            "Наличие публикации в списке литературы означает, что она используется или цитируется текущей доказательной базой HFC. Это не означает, что любое численное значение из этой публикации автоматически считается предпочтительным или клинически применимым.",
            "Inclusion in the literature list means that the publication is used or cited by the current HFC evidence dataset. It does not mean that every numerical value from that publication is automatically preferred or clinically applicable.",
          )}
        </p>
      </section>
    </main>
  );
}
