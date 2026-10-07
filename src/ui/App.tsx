import { useEffect, useMemo, useState } from "react";
import {
  alphaBetaEstimates,
  endpoints,
  evidenceManifest,
  sources,
} from "../data/evidence/v0.1/index.js";
import {
  getAlphaBetaEstimates,
  getPreferredAlphaBetaEstimate,
} from "../evidence/alphaBetaRegistry.js";
import { calculateEvidenceLq } from "../workflows/evidenceLq.js";
import { buildQuickEqdAuditRecord } from "../audit/quickEqdAudit.js";
import { serializeAuditEnvelope } from "../audit/envelope.js";
import { openPrintableAuditReport } from "../audit/report.js";
import { AboutSiteView } from "./AboutSiteView.js";
import { AuditReplayView } from "./AuditReplayView.js";
import { CompareRegimensView } from "./CompareRegimensView.js";
import { ClinicalConstraintsView } from "./ClinicalConstraintsView.js";
import { confidenceIntervalLabel, estimateChoiceLabel, localizeWarning, releaseStatusLabel, selectionModeLabel, supportLabel, tx, userSpecifiedLabel } from "./i18n.js";
import {
  endpointLabel,
  formatUiNumber,
  organLabel,
  type Language,
} from "./labels.js";
import { MethodologyView } from "./MethodologyView.js";
import { HowToView } from "./HowToView.js";
import { OutcomeModelsView } from "./OutcomeModelsView.js";
import { SiteHome, type SitePage } from "./SiteHome.js";
import { TreatmentGapView } from "./TreatmentGapView.js";
import { ReirradiationView } from "./ReirradiationView.js";
import { downloadJsonFile } from "./download.js";
import { CalculatorsHubView } from "./CalculatorsHubView.js";
import { CourseCorrectionView } from "./CourseCorrectionView.js";
import { TargetEqdSolverView } from "./TargetEqdSolverView.js";
import { InteractiveCalendarView } from "./InteractiveCalendarView.js";
import {
  AppearanceControls,
  type ColorTheme,
  type DesignStyle,
} from "./AppearanceControls.js";

type ParameterMode = "evidence" | "manual";

function sourceFor(sourceId: string | undefined) {
  if (!sourceId) return undefined;
  return sources.find((source) => source.id === sourceId);
}

export function App() {
  const [language, setLanguage] = useState<Language>("ru");
  const [activeModule, setActiveModule] = useState<SitePage>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const stored = window.localStorage.getItem("hfc-color-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  const [designStyle, setDesignStyle] = useState<DesignStyle>(() => {
    const stored = window.localStorage.getItem("hfc-design-style");
    return stored === "journal" || stored === "compact"
      ? stored
      : "clinical";
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = "HFC — HypoFracCalc";

    const metaDescription = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (metaDescription) {
      metaDescription.content = tx(
        language,
        "HFC — русскоязычный калькулятор клинической радиобиологии для BED, EQD₂, сравнения режимов, перерывов лечения и повторного облучения.",
        "HFC — an evidence-traceable clinical radiobiology calculator for BED, EQD₂, regimen comparison, treatment gaps, and reirradiation.",
      );
    }
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.theme = colorTheme;
    document.documentElement.dataset.design = designStyle;
    window.localStorage.setItem("hfc-color-theme", colorTheme);
    window.localStorage.setItem("hfc-design-style", designStyle);
  }, [colorTheme, designStyle]);

  const availableEndpoints = useMemo(
    () =>
      endpoints
        .filter((endpoint) => getAlphaBetaEstimates(endpoint.id).length > 0)
        .sort((a, b) =>
          `${a.organ} ${a.endpoint}`.localeCompare(
            `${b.organ} ${b.endpoint}`,
            "en",
          ),
        ),
    [],
  );

  const [endpointId, setEndpointId] = useState(
    "prostate-biochemical-control",
  );
  const initialPreferred = getPreferredAlphaBetaEstimate(endpointId);
  const [parameterMode, setParameterMode] =
    useState<ParameterMode>("evidence");
  const [recordId, setRecordId] = useState(initialPreferred?.id ?? "");
  const [manualAlphaBeta, setManualAlphaBeta] = useState("3");
  const [fractions, setFractions] = useState("5");
  const [dosePerFraction, setDosePerFraction] = useState("7.25");

  const endpoint = endpoints.find((item) => item.id === endpointId);
  const endpointEstimates = getAlphaBetaEstimates(endpointId);
  const selectedEstimate = alphaBetaEstimates.find(
    (record) => record.id === recordId,
  );
  const selectedSource = sourceFor(selectedEstimate?.sourceId);

  const calculation = useMemo(() => {
    const n = Number(fractions);
    const d = Number(dosePerFraction);

    if (!Number.isInteger(n) || n <= 0) {
      return {
        error: tx(
          language,
          "Число фракций должно быть положительным целым числом.",
          "The number of fractions must be a positive integer.",
        ),
      };
    }
    if (!Number.isFinite(d) || d <= 0) {
      return {
        error: tx(
          language,
          "Доза за фракцию должна быть больше 0 Гр.",
          "Dose per fraction must be greater than 0 Gy.",
        ),
      };
    }

    try {
      if (parameterMode === "manual") {
        const manual = Number(manualAlphaBeta);
        if (!Number.isFinite(manual) || manual <= 0) {
          return {
            error: tx(
              language,
              "Пользовательское α/β должно быть больше 0 Гр.",
              "User-specified α/β must be greater than 0 Gy.",
            ),
          };
        }

        return {
          result: calculateEvidenceLq(
            endpointId,
            { fractions: n, dosePerFractionGy: d },
            {
              selectionMode: "manual",
              parameter: "alpha-beta",
              value: manual,
              unit: "Gy",
              rationale: "Manual override from Quick EQD UI",
            },
          ),
        };
      }

      if (!recordId) {
        return {
          error: tx(
            language,
            "Для этого клинического исхода нет автоматически выбранного предпочтительного значения. Выберите опубликованную оценку или введите своё α/β.",
            "This endpoint has no automatic preferred value. Select a published estimate or enter a custom α/β.",
          ),
        };
      }

      return {
        result: calculateEvidenceLq(
          endpointId,
          { fractions: n, dosePerFractionGy: d },
          {
            selectionMode: "evidence",
            parameterRecordId: recordId,
          },
        ),
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : tx(
                language,
                "Не удалось выполнить расчёт.",
                "The calculation could not be completed.",
              ),
      };
    }
  }, [
    endpointId,
    fractions,
    dosePerFraction,
    parameterMode,
    recordId,
    manualAlphaBeta,
    language,
  ]);

  const result = "result" in calculation ? calculation.result : undefined;
  const error = "error" in calculation ? calculation.error : undefined;

  function changeEndpoint(nextId: string) {
    setEndpointId(nextId);
    setParameterMode("evidence");
    const preferred = getPreferredAlphaBetaEstimate(nextId);
    setRecordId(preferred?.id ?? "");
  }

  const grouped = useMemo(() => {
    const map = new Map<string, typeof availableEndpoints>();
    for (const item of availableEndpoints) {
      const current = map.get(item.organ) ?? [];
      current.push(item);
      map.set(item.organ, current);
    }
    return [...map.entries()];
  }, [availableEndpoints]);

  const gy = language === "ru" ? "Гр" : "Gy";

  function currentQuickEqdAudit() {
    if (!result) return undefined;
    return buildQuickEqdAuditRecord(
      new Date().toISOString(),
      result,
    );
  }

  async function downloadQuickEqdAudit() {
    const record = currentQuickEqdAudit();
    if (!record) return;
    downloadJsonFile(
      "HFC_quick_eqd_audit",
      await serializeAuditEnvelope(record),
      record.generatedAtIso,
    );
  }

  function printQuickEqdAudit() {
    const record = currentQuickEqdAudit();
    if (!record) return;
    openPrintableAuditReport(record, language);
  }

  const pageLabel = (page: SitePage): string => {
    switch (page) {
      case "home":
        return tx(language, "Главная", "Home");
      case "calculators":
        return tx(language, "Калькуляторы", "Calculators");
      case "quick":
        return tx(language, "Быстрый EQD", "Quick EQD");
      case "target-eqd":
        return tx(language, "Подбор режима по EQD₂", "Target EQD₂ solver");
      case "course-correction":
        return tx(language, "Коррекция курса", "Course correction");
      case "calendar":
        return tx(language, "Интерактивный календарь", "Interactive calendar");
      case "compare":
        return tx(language, "Сравнение режимов", "Compare Regimens");
      case "gap":
        return tx(language, "Перерывы в лечении", "Treatment Gap");
      case "constraints":
        return tx(
          language,
          "Клинические ограничения",
          "Clinical Constraints",
        );
      case "outcomes":
        return tx(
          language,
          "Клинические исходы HyTEC",
          "HyTEC clinical outcomes",
        );
      case "reirradiation":
        return tx(
          language,
          "Повторное облучение",
          "Reirradiation",
        );
      case "audit":
        return tx(
          language,
          "Проверка сохранённого расчёта",
          "Verify saved calculation",
        );
      case "guide":
        return tx(language, "Как пользоваться?", "How to use");
      case "methodology":
        return tx(language, "Методология", "Methodology");
      case "about":
        return tx(language, "О сайте", "About");
    }
  };

  const navigate = (page: SitePage) => {
    setActiveModule(page);
    setMobileMenuOpen(false);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  };

  return (
    <div className="app-shell">
      <header className="topbar site-topbar">
        <button
          className="brand-button"
          type="button"
          onClick={() => navigate("home")}
          aria-label={tx(language, "Главная HFC", "HFC home")}
        >
          <div className="brand-row">
            <div className="brand-mark">HFC</div>
            <div>
              <h1>HypoFracCalc</h1>
              <p>
                {tx(
                  language,
                  "Радиобиология фотонной ДЛТ с отслеживаемой доказательной базой",
                  "Evidence-traceable photon radiobiology",
                )}
              </p>
            </div>
          </div>
        </button>

        <div className="topbar-actions">
          <div
            className="language-switch"
            role="group"
            aria-label={tx(language, "Язык", "Language")}
          >
            <button
              type="button"
              className={language === "ru" ? "active" : ""}
              onClick={() => setLanguage("ru")}
              aria-pressed={language === "ru"}
            >
              RU
            </button>
            <button
              type="button"
              className={language === "en" ? "active" : ""}
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
            >
              EN
            </button>
          </div>

          <AppearanceControls
            language={language}
            colorTheme={colorTheme}
            designStyle={designStyle}
            onColorThemeChange={setColorTheme}
            onDesignStyleChange={setDesignStyle}
          />
          <div className="dataset-chip">
            {tx(language, "Фотонная ДЛТ", "Photon EBRT")}
          </div>
        </div>
      </header>

      <nav
        className="module-nav site-nav"
        aria-label={tx(language, "Разделы HFC", "HFC sections")}
      >
        <button
          className={`module ${activeModule === "home" ? "active" : ""}`}
          type="button"
          onClick={() => navigate("home")}
        >
          {tx(language, "Главная", "Home")}
        </button>
        <button
          className={`module ${activeModule === "guide" ? "active" : ""}`}
          type="button"
          onClick={() => navigate("guide")}
        >
          {tx(language, "Как пользоваться?", "How to use")}
        </button>
        <button
          className={`module ${
            [
              "calculators",
              "quick",
              "compare",
              "target-eqd",
              "course-correction",
              "calendar",
              "gap",
              "reirradiation",
            ].includes(activeModule)
              ? "active"
              : ""
          }`}
          type="button"
          onClick={() => navigate("calculators")}
        >
          {tx(language, "Калькуляторы", "Calculators")}
        </button>
        <button
          className={`module ${
            ["methodology", "constraints", "outcomes", "audit"].includes(
              activeModule,
            )
              ? "active"
              : ""
          }`}
          type="button"
          onClick={() => navigate("methodology")}
        >
          {tx(language, "Методология", "Methodology")}
        </button>
        <button
          className={`module ${activeModule === "about" ? "active" : ""}`}
          type="button"
          onClick={() => navigate("about")}
        >
          {tx(language, "О сайте", "About")}
        </button>
      </nav>

      <div className="mobile-nav">
        <button
          className="mobile-nav-trigger"
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-site-menu"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span className="mobile-nav-caption">
            {tx(language, "Раздел", "Section")}
          </span>
          <strong>{pageLabel(activeModule)}</strong>
          <span
            className={`mobile-nav-chevron ${mobileMenuOpen ? "open" : ""}`}
            aria-hidden="true"
          >
            ⌄
          </span>
        </button>

        {mobileMenuOpen ? (
          <div
            id="mobile-site-menu"
            className="mobile-nav-menu"
            role="navigation"
            aria-label={tx(language, "Разделы HFC", "HFC sections")}
          >
            {(
              [
                "home",
                "guide",
                "calculators",
                "methodology",
                "about",
              ] as SitePage[]
            ).map((page) => (
              <button
                key={page}
                type="button"
                className={page === activeModule ? "active" : ""}
                onClick={() => navigate(page)}
              >
                {pageLabel(page)}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {activeModule === "home" ? (
        <SiteHome language={language} onNavigate={navigate} />
      ) : activeModule === "guide" ? (
        <HowToView language={language} onNavigate={navigate} />
      ) : activeModule === "calculators" ? (
        <CalculatorsHubView language={language} onNavigate={navigate} />
      ) : activeModule === "target-eqd" ? (
        <TargetEqdSolverView language={language} />
      ) : activeModule === "course-correction" ? (
        <CourseCorrectionView language={language} />
      ) : activeModule === "calendar" ? (
        <InteractiveCalendarView language={language} />
      ) : activeModule === "quick" ? (
        <main className="workspace">
          <section className="panel input-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">1 · {tx(language, "исход", "endpoint")}</span>
                <h2>
                  {tx(
                    language,
                    "Что именно мы моделируем?",
                    "What are we modelling?",
                  )}
                </h2>
              </div>
            </div>

            <label className="field">
              <span>
                {tx(language, "Клинический исход", "Clinical endpoint")}
              </span>
              <select
                value={endpointId}
                onChange={(event) => changeEndpoint(event.target.value)}
              >
                {grouped.map(([organ, items]) => (
                  <optgroup
                    key={organ}
                    label={organLabel(language, organ)}
                  >
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {endpointLabel(
                          language,
                          item.id,
                          item.endpoint,
                        )}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <div className="endpoint-summary">
              <strong>{organLabel(language, endpoint?.organ ?? "")}</strong>
              <span>
                {endpointLabel(
                  language,
                  endpointId,
                  endpoint?.endpoint ?? endpointId,
                )}
              </span>
            </div>

            <div className="section-divider" />

            <div className="section-heading compact">
              <div>
                <span className="eyebrow">2 · α/β</span>
                <h2>
                  {tx(
                    language,
                    "Параметр фракционной чувствительности",
                    "Fractionation-sensitivity parameter",
                  )}
                </h2>
              </div>
            </div>

            <div
              className="segmented"
              role="group"
              aria-label={tx(language, "Источник α/β", "α/β source")}
            >
              <button
                type="button"
                className={parameterMode === "evidence" ? "selected" : ""}
                onClick={() => setParameterMode("evidence")}
              >
                {tx(
                  language,
                  "Из доказательной базы",
                  "Evidence database",
                )}
              </button>
              <button
                type="button"
                className={parameterMode === "manual" ? "selected" : ""}
                onClick={() => setParameterMode("manual")}
              >
                {tx(language, "Своё значение", "Custom value")}
              </button>
            </div>

            {parameterMode === "evidence" ? (
              <label className="field">
                <span>
                  {tx(
                    language,
                    "Опубликованная оценка",
                    "Published estimate",
                  )}
                </span>
                <select
                  value={recordId}
                  onChange={(event) => setRecordId(event.target.value)}
                >
                  <option value="">
                    {tx(
                      language,
                      "— выбрать оценку —",
                      "— select estimate —",
                    )}
                  </option>
                  {endpointEstimates.map((estimate) => {
                    const preferred =
                      estimate.status === "preferred" &&
                      estimate.defaultEligible;
                    return (
                      <option key={estimate.id} value={estimate.id}>
                        {formatUiNumber(
                          language,
                          estimate.valueGy,
                          2,
                        )}{" "}
                        {gy}
                        {" · "}
                        {estimateChoiceLabel(language, preferred)}{" "}
                        · {supportLabel(language, estimate.support)}
                      </option>
                    );
                  })}
                </select>
              </label>
            ) : (
              <label className="field">
                <span>
                  {tx(
                    language,
                    "Пользовательское α/β, Гр",
                    "Custom α/β, Gy",
                  )}
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.1"
                  value={manualAlphaBeta}
                  onChange={(event) =>
                    setManualAlphaBeta(event.target.value)
                  }
                />
                <small>
                  {tx(
                    language,
                    "Пользовательское значение не изменяет доказательную базу и будет явно отмечено в отчёте.",
                    "A manual override does not modify the evidence database and will be recorded in the audit.",
                  )}
                </small>
              </label>
            )}

            {parameterMode === "evidence" && selectedEstimate ? (
              <div className="evidence-card">
                <div className="evidence-card-top">
                  <div>
                    <span className="evidence-value">
                      α/β ={" "}
                      {formatUiNumber(
                        language,
                        selectedEstimate.valueGy,
                        2,
                      )}{" "}
                      {gy}
                    </span>
                    {selectedEstimate.ci95 ? (
                      <span className="ci">
                        {confidenceIntervalLabel(language)}:{" "}
                        {formatUiNumber(
                          language,
                          selectedEstimate.ci95.low,
                          1,
                        )}
                        –
                        {formatUiNumber(
                          language,
                          selectedEstimate.ci95.high,
                          1,
                        )}{" "}
                        {gy}
                      </span>
                    ) : (
                      <span className="ci">
                        {confidenceIntervalLabel(language)}:{" "}
                        {tx(
                          language,
                          "не опубликован",
                          "not reported",
                        )}
                      </span>
                    )}
                  </div>
                  <span
                    className={`support-badge ${selectedEstimate.support}`}
                  >
                    {supportLabel(
                      language,
                      selectedEstimate.support,
                    )}
                  </span>
                </div>

                {selectedSource ? (
                  <div className="source-block">
                    <strong>
                      {tx(language, "Источник", "Source")}
                    </strong>
                    <p>{selectedSource.citation}</p>
                    <div className="source-meta">
                      {selectedSource.doi ? (
                        <a
                          href={`https://doi.org/${selectedSource.doi}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          DOI {selectedSource.doi}
                        </a>
                      ) : null}
                      <span>{selectedSource.year}</span>
                    </div>
                  </div>
                ) : null}

                {selectedEstimate.supportReason && language === "en" ? (
                  <p className="support-reason">
                    {selectedEstimate.supportReason}
                  </p>
                ) : null}

                {selectedEstimate.applicability?.notes?.length &&
                language === "en" ? (
                  <details>
                    <summary>Applicability / caveats</summary>
                    <ul>
                      {selectedEstimate.applicability.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </details>
                ) : null}

                {language === "ru" &&
                (selectedEstimate.supportReason ||
                  selectedEstimate.applicability?.notes?.length) ? (
                  <p className="support-reason">
                    Подробные ограничения применимости этой оценки будут
                    переведены в русскую версию базы данных; до этого
                    первичным источником остаётся указанная публикация.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="section-divider" />

            <div className="section-heading compact">
              <div>
                <span className="eyebrow">3 · {tx(language, "фракционирование", "fractionation")}</span>
                <h2>
                  {tx(
                    language,
                    "Схема облучения",
                    "Fractionation schedule",
                  )}
                </h2>
              </div>
            </div>

            <div className="two-columns">
              <label className="field">
                <span>
                  {tx(
                    language,
                    "Число фракций, n",
                    "Number of fractions, n",
                  )}
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={fractions}
                  onChange={(event) => setFractions(event.target.value)}
                />
              </label>

              <label className="field">
                <span>
                  {tx(
                    language,
                    "Доза / фракцию, Гр",
                    "Dose / fraction, Gy",
                  )}
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={dosePerFraction}
                  onChange={(event) =>
                    setDosePerFraction(event.target.value)
                  }
                />
              </label>
            </div>
          </section>

          <section className="panel results-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{tx(language, "результат", "result")}</span>
                <h2>BED / EQD₂</h2>
              </div>
              {result ? (
                <div className="audit-actions">
                  <button
                    type="button"
                    className="secondary-button audit-download-button"
                    onClick={downloadQuickEqdAudit}
                  >
                    {tx(
                      language,
                      "Скачать аудит JSON",
                      "Download audit JSON",
                    )}
                  </button>
                  <button
                    type="button"
                    className="secondary-button audit-print-button"
                    onClick={printQuickEqdAudit}
                  >
                    {tx(
                      language,
                      "Печатный отчёт",
                      "Printable report",
                    )}
                  </button>
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="empty-state">
                <strong>
                  {tx(
                    language,
                    "Нужны дополнительные данные",
                    "Additional input is required",
                  )}
                </strong>
                <p>{error}</p>
              </div>
            ) : result ? (
              <>
                <div className="metric-grid">
                  <div className="metric">
                    <span>
                      {tx(
                        language,
                        "Физическая доза",
                        "Physical dose",
                      )}
                    </span>
                    <strong>
                      {formatUiNumber(language, result.totalDoseGy)}{" "}
                      {gy}
                    </strong>
                    <small>
                      {result.schedule.fractions} ×{" "}
                      {formatUiNumber(
                        language,
                        result.schedule.dosePerFractionGy,
                      )}{" "}
                      {gy}
                    </small>
                  </div>

                  <div className="metric primary">
                    <span>EQD₂</span>
                    <strong>
                      {formatUiNumber(language, result.eqd2Gy)} {gy}
                    </strong>
                    <small>
                      α/β ={" "}
                      {formatUiNumber(language, result.alphaBetaGy)}{" "}
                      {gy}
                    </small>
                  </div>

                  <div className="metric">
                    <span>BED</span>
                    <strong>
                      {formatUiNumber(language, result.bedGy)} {gy}
                    </strong>
                    <small>{tx(language, "LQ-модель", "LQ model")}</small>
                  </div>
                </div>

                {result.alphaBetaSensitivity ? (
                  <div className="sensitivity-card">
                    <div>
                      <span className="eyebrow">α/β {tx(language, "чувствительность", "sensitivity")}</span>
                      <strong>
                        CI α/β:{" "}
                        {formatUiNumber(
                          language,
                          result.alphaBetaSensitivity.alphaBetaCi95Gy
                            .low,
                          1,
                        )}
                        –
                        {formatUiNumber(
                          language,
                          result.alphaBetaSensitivity.alphaBetaCi95Gy
                            .high,
                          1,
                        )}{" "}
                        {gy}
                      </strong>
                    </div>

                    <div className="sensitivity-values">
                      <div>
                        <span>{tx(language, "Диапазон EQD₂", "EQD₂ range")}</span>
                        <strong>
                          {formatUiNumber(
                            language,
                            result.alphaBetaSensitivity.eqd2Gy.low,
                          )}
                          –
                          {formatUiNumber(
                            language,
                            result.alphaBetaSensitivity.eqd2Gy.high,
                          )}{" "}
                          {gy}
                        </strong>
                      </div>
                      <div>
                        <span>{tx(language, "Диапазон BED", "BED range")}</span>
                        <strong>
                          {formatUiNumber(
                            language,
                            result.alphaBetaSensitivity.bedGy.low,
                          )}
                          –
                          {result.alphaBetaSensitivity.bedGy.high ===
                          null
                            ? "∞"
                            : formatUiNumber(
                                language,
                                result.alphaBetaSensitivity.bedGy
                                  .high,
                              )}{" "}
                          {gy}
                        </strong>
                      </div>
                    </div>

                    <p>
                      {tx(
                        language,
                        "Это диапазон чувствительности только по 95% ДИ α/β, а не полная многопараметрическая неопределённость.",
                        "This is a sensitivity envelope based only on the 95% CI of α/β, not a full multiparameter uncertainty analysis.",
                      )}
                    </p>
                  </div>
                ) : null}

                {result.warnings.length ? (
                  <div className="warning-card">
                    <strong>
                      {tx(
                        language,
                        "Предупреждения / ограничения",
                        "Warnings / limitations",
                      )}
                    </strong>
                    <ul>
                      {result.warnings.map((warning) => (
                        <li key={warning}>
                          {localizeWarning(language, warning)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="ok-card">
                    {tx(
                      language,
                      "Встроенных предупреждений для выбранного расчёта нет.",
                      "No built-in warnings apply to the selected calculation.",
                    )}
                  </div>
                )}

                <div className="audit-preview">
                  <span className="eyebrow">{tx(language, "предпросмотр аудита", "audit preview")}</span>
                  <dl>
                    <div>
                      <dt>{tx(language, "Выбор параметра", "Selection")}</dt>
                      <dd>
                        {selectionModeLabel(
                          language,
                          result.selectionMode,
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>{tx(language, "Запись параметра", "Parameter record")}</dt>
                      <dd>
                        {result.parameterRecordId ??
                          userSpecifiedLabel(language)}
                      </dd>
                    </div>
                    <div>
                      <dt>{tx(language, "Источник", "Source")}</dt>
                      <dd>{result.sourceId ?? "manual"}</dd>
                    </div>
                  </dl>
                </div>
              </>
            ) : null}

            <div className="safety-note">
              <strong>
                {tx(
                  language,
                  "Только для поддержки клинических решений.",
                  "Clinical decision-support only.",
                )}
              </strong>
              <p>
                {tx(
                  language,
                  "HFC не является системой назначения лечения. Результат требует независимой проверки и локальной клинической валидации.",
                  "HFC is not a treatment prescription system. Results require independent verification and local clinical validation.",
                )}
              </p>
            </div>
          </section>
        </main>
      ) : activeModule === "compare" ? (
        <CompareRegimensView language={language} />
      ) : activeModule === "gap" ? (
        <TreatmentGapView language={language} />
      ) : activeModule === "constraints" ? (
        <ClinicalConstraintsView language={language} />
      ) : activeModule === "outcomes" ? (
        <OutcomeModelsView language={language} />
      ) : activeModule === "reirradiation" ? (
        <ReirradiationView language={language} />
      ) : activeModule === "audit" ? (
        <AuditReplayView language={language} />
      ) : activeModule === "methodology" ? (
        <MethodologyView language={language} onNavigate={navigate} />
      ) : (
        <AboutSiteView language={language} />
      )}

      <footer className="site-footer">
        <div>
          <strong>HFC · HypoFracCalc</strong>
          <span>
            {tx(
              language,
              "Прозрачный инструмент поддержки клинических решений для радиобиологии фотонной ДЛТ.",
              "Transparent clinical decision-support for photon radiobiology.",
            )}
          </span>
        </div>
        <div>
          <span>{evidenceManifest.datasetVersion}</span>
          <span>·</span>
          <button
            type="button"
            onClick={() => navigate("guide")}
          >
            {tx(language, "Как пользоваться?", "How to use")}
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => navigate("methodology")}
          >
            {tx(
              language,
              "Доказательная база и методология",
              "Evidence & methodology",
            )}
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => navigate("audit")}
          >
            {tx(
              language,
              "Проверка расчёта",
              "Verify calculation",
            )}
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => navigate("about")}
          >
            {tx(language, "О сайте", "About")}
          </button>
        </div>
      </footer>
    </div>
  );
}
