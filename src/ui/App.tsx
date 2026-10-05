import { useMemo, useState } from "react";
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
import { CompareRegimensView } from "./CompareRegimensView.js";
import { endpointLabelRu, organLabelRu } from "./labels.js";

type ParameterMode = "evidence" | "manual";

function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatCi(
  ci: { low: number; high: number } | undefined,
): string | null {
  if (!ci) return null;
  return `${formatNumber(ci.low, 1)}–${formatNumber(ci.high, 1)} Гр`;
}

function supportLabel(
  support: "supported" | "limited" | "poor-fit",
): string {
  switch (support) {
    case "supported":
      return "хорошая поддержка";
    case "limited":
      return "ограниченная поддержка";
    case "poor-fit":
      return "слабая / нестабильная оценка";
  }
}

function sourceFor(sourceId: string | undefined) {
  if (!sourceId) return undefined;
  return sources.find((source) => source.id === sourceId);
}

export function App() {
  const [activeModule, setActiveModule] = useState<"quick" | "compare">("quick");
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
      return { error: "Число фракций должно быть положительным целым числом." };
    }
    if (!Number.isFinite(d) || d <= 0) {
      return { error: "Доза за фракцию должна быть больше 0 Гр." };
    }

    try {
      if (parameterMode === "manual") {
        const manual = Number(manualAlphaBeta);
        if (!Number.isFinite(manual) || manual <= 0) {
          return { error: "Пользовательское α/β должно быть больше 0 Гр." };
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
          error:
            "Для этого endpoint нет автоматического preferred-значения. Выберите опубликованную оценку или введите своё α/β.",
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
            : "Не удалось выполнить расчёт.",
      };
    }
  }, [
    endpointId,
    fractions,
    dosePerFraction,
    parameterMode,
    recordId,
    manualAlphaBeta,
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

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand-row">
            <div className="brand-mark">HFC</div>
            <div>
              <h1>HypoFracCalc</h1>
              <p>Evidence-traceable radiobiology calculator</p>
            </div>
          </div>
        </div>
        <div className="dataset-chip">
          Photon EBRT · {evidenceManifest.datasetVersion} · draft
        </div>
      </header>

      <nav className="module-nav" aria-label="Модули HFC">
        <button
          className={`module ${activeModule === "quick" ? "active" : ""}`}
          type="button"
          onClick={() => setActiveModule("quick")}
        >
          Quick EQD
        </button>
        <button
          className={`module ${activeModule === "compare" ? "active" : ""}`}
          type="button"
          onClick={() => setActiveModule("compare")}
        >
          Compare regimens
        </button>
        <button className="module" type="button" disabled>
          Treatment gap
        </button>
        <button className="module" type="button" disabled>
          Reirradiation
        </button>
      </nav>

      {activeModule === "quick" ? (
      <main className="workspace">
        <section className="panel input-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">1 · endpoint</span>
              <h2>Что именно мы моделируем?</h2>
            </div>
          </div>

          <label className="field">
            <span>Клинический endpoint</span>
            <select
              value={endpointId}
              onChange={(event) => changeEndpoint(event.target.value)}
            >
              {grouped.map(([organ, items]) => (
                <optgroup key={organ} label={organLabelRu(organ)}>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {endpointLabelRu(item.id, item.endpoint)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <div className="endpoint-summary">
            <strong>{organLabelRu(endpoint?.organ ?? "")}</strong>
            <span>
              {endpointLabelRu(endpointId, endpoint?.endpoint ?? endpointId)}
            </span>
          </div>

          <div className="section-divider" />

          <div className="section-heading compact">
            <div>
              <span className="eyebrow">2 · α/β</span>
              <h2>Параметр фракционной чувствительности</h2>
            </div>
          </div>

          <div className="segmented" role="group" aria-label="Источник α/β">
            <button
              type="button"
              className={parameterMode === "evidence" ? "selected" : ""}
              onClick={() => setParameterMode("evidence")}
            >
              Из evidence database
            </button>
            <button
              type="button"
              className={parameterMode === "manual" ? "selected" : ""}
              onClick={() => setParameterMode("manual")}
            >
              Своё значение
            </button>
          </div>

          {parameterMode === "evidence" ? (
            <label className="field">
              <span>Опубликованная оценка</span>
              <select
                value={recordId}
                onChange={(event) => setRecordId(event.target.value)}
              >
                <option value="">— выбрать оценку —</option>
                {endpointEstimates.map((estimate) => {
                  const preferred =
                    estimate.status === "preferred" &&
                    estimate.defaultEligible;
                  return (
                    <option key={estimate.id} value={estimate.id}>
                      {formatNumber(estimate.valueGy, 2)} Гр
                      {preferred ? " · preferred" : " · alternative"} ·{" "}
                      {supportLabel(estimate.support)}
                    </option>
                  );
                })}
              </select>
            </label>
          ) : (
            <label className="field">
              <span>Пользовательское α/β, Гр</span>
              <input
                type="number"
                min="0.01"
                step="0.1"
                value={manualAlphaBeta}
                onChange={(event) => setManualAlphaBeta(event.target.value)}
              />
              <small>
                Manual override не изменяет evidence database и будет отмечен
                в отчёте.
              </small>
            </label>
          )}

          {parameterMode === "evidence" && selectedEstimate ? (
            <div className="evidence-card">
              <div className="evidence-card-top">
                <div>
                  <span className="evidence-value">
                    α/β = {formatNumber(selectedEstimate.valueGy, 2)} Гр
                  </span>
                  {selectedEstimate.ci95 ? (
                    <span className="ci">
                      95% CI: {formatCi(selectedEstimate.ci95)}
                    </span>
                  ) : (
                    <span className="ci">95% CI: не опубликован</span>
                  )}
                </div>
                <span className={`support-badge ${selectedEstimate.support}`}>
                  {supportLabel(selectedEstimate.support)}
                </span>
              </div>

              {selectedSource ? (
                <div className="source-block">
                  <strong>Источник</strong>
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

              {selectedEstimate.supportReason ? (
                <p className="support-reason">
                  {selectedEstimate.supportReason}
                </p>
              ) : null}

              {selectedEstimate.applicability?.notes?.length ? (
                <details>
                  <summary>Applicability / caveats</summary>
                  <ul>
                    {selectedEstimate.applicability.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          ) : null}

          <div className="section-divider" />

          <div className="section-heading compact">
            <div>
              <span className="eyebrow">3 · fractionation</span>
              <h2>Схема облучения</h2>
            </div>
          </div>

          <div className="two-columns">
            <label className="field">
              <span>Число фракций, n</span>
              <input
                type="number"
                min="1"
                step="1"
                value={fractions}
                onChange={(event) => setFractions(event.target.value)}
              />
            </label>

            <label className="field">
              <span>Доза / фракцию, Гр</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={dosePerFraction}
                onChange={(event) => setDosePerFraction(event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="panel results-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">result</span>
              <h2>BED / EQD₂</h2>
            </div>
          </div>

          {error ? (
            <div className="empty-state">
              <strong>Нужны дополнительные данные</strong>
              <p>{error}</p>
            </div>
          ) : result ? (
            <>
              <div className="metric-grid">
                <div className="metric">
                  <span>Физическая доза</span>
                  <strong>{formatNumber(result.totalDoseGy)} Гр</strong>
                  <small>
                    {result.schedule.fractions} ×{" "}
                    {formatNumber(result.schedule.dosePerFractionGy)} Гр
                  </small>
                </div>

                <div className="metric primary">
                  <span>EQD₂</span>
                  <strong>{formatNumber(result.eqd2Gy)} Гр</strong>
                  <small>α/β = {formatNumber(result.alphaBetaGy)} Гр</small>
                </div>

                <div className="metric">
                  <span>BED</span>
                  <strong>{formatNumber(result.bedGy)} Гр</strong>
                  <small>LQ model</small>
                </div>
              </div>

              {result.alphaBetaSensitivity ? (
                <div className="sensitivity-card">
                  <div>
                    <span className="eyebrow">α/β sensitivity</span>
                    <strong>
                      CI α/β:{" "}
                      {formatNumber(
                        result.alphaBetaSensitivity.alphaBetaCi95Gy.low,
                        1,
                      )}
                      –
                      {formatNumber(
                        result.alphaBetaSensitivity.alphaBetaCi95Gy.high,
                        1,
                      )}{" "}
                      Гр
                    </strong>
                  </div>

                  <div className="sensitivity-values">
                    <div>
                      <span>EQD₂ range</span>
                      <strong>
                        {formatNumber(
                          result.alphaBetaSensitivity.eqd2Gy.low,
                        )}
                        –
                        {formatNumber(
                          result.alphaBetaSensitivity.eqd2Gy.high,
                        )}{" "}
                        Гр
                      </strong>
                    </div>
                    <div>
                      <span>BED range</span>
                      <strong>
                        {formatNumber(
                          result.alphaBetaSensitivity.bedGy.low,
                        )}
                        –
                        {result.alphaBetaSensitivity.bedGy.high === null
                          ? "∞"
                          : formatNumber(
                              result.alphaBetaSensitivity.bedGy.high,
                            )}{" "}
                        Гр
                      </strong>
                    </div>
                  </div>

                  <p>
                    Это sensitivity envelope только по 95% CI α/β, а не полная
                    многопараметрическая неопределённость.
                  </p>
                </div>
              ) : null}

              {result.warnings.length ? (
                <div className="warning-card">
                  <strong>Предупреждения / ограничения</strong>
                  <ul>
                    {result.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="ok-card">
                  Встроенных предупреждений для выбранного расчёта нет.
                </div>
              )}

              <div className="audit-preview">
                <span className="eyebrow">audit preview</span>
                <dl>
                  <div>
                    <dt>Selection</dt>
                    <dd>
                      {result.selectionMode === "evidence"
                        ? "evidence"
                        : "manual override"}
                    </dd>
                  </div>
                  <div>
                    <dt>Parameter record</dt>
                    <dd>{result.parameterRecordId ?? "user-specified"}</dd>
                  </div>
                  <div>
                    <dt>Source</dt>
                    <dd>{result.sourceId ?? "manual"}</dd>
                  </div>
                </dl>
              </div>
            </>
          ) : null}

          <div className="safety-note">
            <strong>Clinical decision-support only.</strong>
            <p>
              HFC не является системой назначения лечения. Результат требует
              независимой проверки и локальной клинической валидации.
            </p>
          </div>
        </section>
      </main>
      ) : (
        <CompareRegimensView />
      )}

    </div>
  );
}
