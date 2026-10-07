import { useMemo, useState } from "react";
import {
  alphaBetaEstimates,
  endpoints,
  sources,
} from "../data/evidence/v0.1/index.js";
import {
  getAlphaBetaEstimates,
  getPreferredAlphaBetaEstimate,
} from "../evidence/alphaBetaRegistry.js";
import {
  compareRegimens,
  type ComparisonEndpoint,
  type NamedRegimen,
} from "../workflows/compareRegimens.js";
import { buildCompareRegimensAuditRecord } from "../audit/compareRegimensAudit.js";
import { serializeAuditEnvelope } from "../audit/envelope.js";
import { openPrintableAuditReport } from "../audit/report.js";
import { confidenceIntervalLabel, estimateChoiceLabel, localizeWarning, tx, userSpecifiedLabel } from "./i18n.js";
import {
  endpointLabel,
  formatUiNumber,
  organLabel,
  type Language,
} from "./labels.js";
import { downloadJsonFile } from "./download.js";

interface UiRegimen {
  id: string;
  label: string;
  fractions: string;
  dosePerFractionGy: string;
}

type ParameterChoice =
  | { mode: "none" }
  | { mode: "record"; recordId: string }
  | { mode: "manual"; value: string };

interface UiEndpointSelection {
  key: string;
  endpointId: string;
  choice: ParameterChoice;
}

function signed(
  language: Language,
  value: number,
  digits = 2,
): string {
  const formatted = formatUiNumber(language, Math.abs(value), digits);
  if (Math.abs(value) < 1e-10) return "0";
  return value > 0 ? `+${formatted}` : `−${formatted}`;
}

function initialChoice(endpointId: string): ParameterChoice {
  const preferred = getPreferredAlphaBetaEstimate(endpointId);
  return preferred
    ? { mode: "record", recordId: preferred.id }
    : { mode: "none" };
}

function makeEndpoint(
  key: string,
  endpointId: string,
): UiEndpointSelection {
  return {
    key,
    endpointId,
    choice: initialChoice(endpointId),
  };
}

function selectedRecord(selection: UiEndpointSelection) {
  const choice = selection.choice;
  if (choice.mode !== "record") return undefined;
  return alphaBetaEstimates.find(
    (record) => record.id === choice.recordId,
  );
}

function sourceFor(sourceId: string | undefined) {
  if (!sourceId) return undefined;
  return sources.find((source) => source.id === sourceId);
}

function EndpointParameterEditor({
  language,
  title,
  selection,
  role,
  onChange,
  onRemove,
}: {
  language: Language;
  title: string;
  selection: UiEndpointSelection;
  role: "tumour" | "normal-tissue";
  onChange: (next: UiEndpointSelection) => void;
  onRemove?: () => void;
}) {
  const availableEndpoints = endpoints
    .filter(
      (endpoint) =>
        endpoint.role === role &&
        getAlphaBetaEstimates(endpoint.id).length > 0,
    )
    .sort((a, b) =>
      `${a.organ} ${a.endpoint}`.localeCompare(
        `${b.organ} ${b.endpoint}`,
        "en",
      ),
    );

  const records = getAlphaBetaEstimates(selection.endpointId);
  const record = selectedRecord(selection);
  const source = sourceFor(record?.sourceId);
  const gy = language === "ru" ? "Гр" : "Gy";

  const grouped = new Map<string, typeof availableEndpoints>();
  for (const endpoint of availableEndpoints) {
    const current = grouped.get(endpoint.organ) ?? [];
    current.push(endpoint);
    grouped.set(endpoint.organ, current);
  }

  function changeEndpoint(endpointId: string) {
    onChange({
      ...selection,
      endpointId,
      choice: initialChoice(endpointId),
    });
  }

  return (
    <div className="compare-endpoint-editor">
      <div className="compare-endpoint-heading">
        <div>
          <span className="eyebrow">{role === "tumour" ? "tumour" : "OAR"}</span>
          <strong>{title}</strong>
        </div>
        {onRemove ? (
          <button
            className="icon-button"
            type="button"
            onClick={onRemove}
            aria-label={tx(language, "Удалить клинический исход", "Remove endpoint")}
          >
            ×
          </button>
        ) : null}
      </div>

      <label className="field compact-field">
        <span>{tx(language, "Клинический исход", "Endpoint")}</span>
        <select
          value={selection.endpointId}
          onChange={(event) => changeEndpoint(event.target.value)}
        >
          {[...grouped.entries()].map(([organ, items]) => (
            <optgroup
              key={organ}
              label={organLabel(language, organ)}
            >
              {items.map((endpoint) => (
                <option key={endpoint.id} value={endpoint.id}>
                  {endpointLabel(
                    language,
                    endpoint.id,
                    endpoint.endpoint,
                  )}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label className="field compact-field">
        <span>α/β</span>
        <select
          value={
            selection.choice.mode === "record"
              ? `record:${selection.choice.recordId}`
              : selection.choice.mode
          }
          onChange={(event) => {
            const value = event.target.value;
            if (value === "manual") {
              onChange({
                ...selection,
                choice: { mode: "manual", value: "3" },
              });
            } else if (value === "none") {
              onChange({ ...selection, choice: { mode: "none" } });
            } else {
              onChange({
                ...selection,
                choice: {
                  mode: "record",
                  recordId: value.replace(/^record:/, ""),
                },
              });
            }
          }}
        >
          <option value="none">
            {tx(language, "— выбрать параметр —", "— select parameter —")}
          </option>
          {records.map((estimate) => (
            <option key={estimate.id} value={`record:${estimate.id}`}>
              {formatUiNumber(language, estimate.valueGy, 2)} {gy}
              {" · "}
              {estimateChoiceLabel(
                language,
                estimate.defaultEligible &&
                  estimate.status === "preferred",
              )}
            </option>
          ))}
          <option value="manual">
            {tx(language, "Своё значение…", "Custom value…")}
          </option>
        </select>
      </label>

      {selection.choice.mode === "manual" ? (
        <label className="field compact-field">
          <span>
            {tx(language, "Своё α/β, Гр", "Custom α/β, Gy")}
          </span>
          <input
            type="number"
            min="0.01"
            step="0.1"
            value={selection.choice.value}
            onChange={(event) =>
              onChange({
                ...selection,
                choice: { mode: "manual", value: event.target.value },
              })
            }
          />
        </label>
      ) : null}

      {record ? (
        <div className="endpoint-evidence-line">
          <span>
            α/β {formatUiNumber(language, record.valueGy, 2)} {gy}
            {record.ci95
              ? ` · ${confidenceIntervalLabel(language)} ${formatUiNumber(language, record.ci95.low, 1)}–${formatUiNumber(language, record.ci95.high, 1)}`
              : ""}
          </span>
          <span className={`support-dot ${record.support}`}>
            {record.support}
          </span>
          {source ? <small>{source.citation}</small> : null}
        </div>
      ) : selection.choice.mode === "none" ? (
        <div className="inline-alert">
          {tx(
            language,
            "Для этого клинического исхода HFC не выбирает α/β автоматически. Выберите опубликованную оценку или задайте своё значение.",
            "HFC does not automatically select α/β for this endpoint. Choose a published estimate or use a manual override.",
          )}
        </div>
      ) : (
        <div className="endpoint-evidence-line">
          <span>{tx(language, "Пользовательское значение", "Manual override")}</span>
          <small>
            {tx(
              language,
              "Во всех расчётах будет явно отмечено как значение, заданное пользователем.",
              "It will be recorded as user-specified in all calculations.",
            )}
          </small>
        </div>
      )}
    </div>
  );
}

export function CompareRegimensView({
  language,
}: {
  language: Language;
}) {
  const [regimens, setRegimens] = useState<UiRegimen[]>([
    {
      id: "r1",
      label: "Reference",
      fractions: "30",
      dosePerFractionGy: "2",
    },
    {
      id: "r2",
      label: "Moderate HF",
      fractions: "20",
      dosePerFractionGy: "3",
    },
    {
      id: "r3",
      label: "Ultra-HF",
      fractions: "5",
      dosePerFractionGy: "7.25",
    },
  ]);
  const [referenceRegimenId, setReferenceRegimenId] = useState("r1");
  const [nextRegimenId, setNextRegimenId] = useState(4);
  const [tumour, setTumour] = useState<UiEndpointSelection>(
    makeEndpoint("tumour", "prostate-biochemical-control"),
  );
  const [oars, setOars] = useState<UiEndpointSelection[]>([
    makeEndpoint("oar-1", "rectum-bleeding-g1plus"),
    makeEndpoint("oar-2", "gu-dysuria-g1plus"),
  ]);
  const [nextOarId, setNextOarId] = useState(3);
  const gy = language === "ru" ? "Гр" : "Gy";

  const calculation = useMemo(() => {
    try {
      const parsedRegimens: NamedRegimen[] = regimens.map((regimen) => {
        const fractions = Number(regimen.fractions);
        const dosePerFractionGy = Number(regimen.dosePerFractionGy);

        if (!Number.isInteger(fractions) || fractions <= 0) {
          throw new Error(
            tx(
              language,
              `${regimen.label || regimen.id}: число фракций должно быть положительным целым.`,
              `${regimen.label || regimen.id}: fraction count must be a positive integer.`,
            ),
          );
        }
        if (
          !Number.isFinite(dosePerFractionGy) ||
          dosePerFractionGy <= 0
        ) {
          throw new Error(
            tx(
              language,
              `${regimen.label || regimen.id}: доза за фракцию должна быть >0 Гр.`,
              `${regimen.label || regimen.id}: dose per fraction must be >0 Gy.`,
            ),
          );
        }

        return {
          id: regimen.id,
          label: regimen.label.trim() || regimen.id,
          schedule: {
            fractions,
            dosePerFractionGy,
          },
        };
      });

      const uiEndpoints = [tumour, ...oars];
      const endpointRequests: ComparisonEndpoint[] = uiEndpoints.map(
        (selection) => {
          const endpoint = endpoints.find(
            (item) => item.id === selection.endpointId,
          );
          const label = endpointLabel(
            language,
            selection.endpointId,
            endpoint?.endpoint ?? selection.endpointId,
          );

          if (selection.choice.mode === "none") {
            throw new Error(
              tx(
                language,
                `Не выбран α/β для ${label}.`,
                `No α/β has been selected for ${label}.`,
              ),
            );
          }

          if (selection.choice.mode === "manual") {
            const value = Number(selection.choice.value);
            if (!Number.isFinite(value) || value <= 0) {
              throw new Error(
                tx(
                  language,
                  `Пользовательское α/β для ${label} должно быть >0 Гр.`,
                  `Manual α/β for ${label} must be >0 Gy.`,
                ),
              );
            }

            return {
              endpointId: selection.endpointId,
              selection: {
                selectionMode: "manual",
                parameter: "alpha-beta",
                value,
                unit: "Gy",
                rationale: "Manual override from Compare Regimens UI",
              },
            };
          }

          return {
            endpointId: selection.endpointId,
            selection: {
              selectionMode: "evidence",
              parameterRecordId: selection.choice.recordId,
            },
          };
        },
      );

      return {
        result: compareRegimens(
          parsedRegimens,
          endpointRequests,
          referenceRegimenId,
        ),
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : tx(
                language,
                "Не удалось сравнить схемы.",
                "The regimens could not be compared.",
              ),
      };
    }
  }, [regimens, referenceRegimenId, tumour, oars, language]);

  const comparison =
    "result" in calculation ? calculation.result : undefined;
  const error = "error" in calculation ? calculation.error : undefined;

  function updateRegimen(id: string, patch: Partial<UiRegimen>) {
    setRegimens((current) =>
      current.map((regimen) =>
        regimen.id === id ? { ...regimen, ...patch } : regimen,
      ),
    );
  }

  function addRegimen() {
    if (regimens.length >= 5) return;
    const id = `r${nextRegimenId}`;
    setNextRegimenId((value) => value + 1);
    setRegimens((current) => [
      ...current,
      {
        id,
        label:
          language === "ru"
            ? `Режим ${current.length + 1}`
            : `Regimen ${current.length + 1}`,
        fractions: "5",
        dosePerFractionGy: "5",
      },
    ]);
  }

  function removeRegimen(id: string) {
    if (regimens.length <= 2) return;
    setRegimens((current) => current.filter((item) => item.id !== id));
    if (referenceRegimenId === id) {
      const nextReference = regimens.find((item) => item.id !== id);
      if (nextReference) setReferenceRegimenId(nextReference.id);
    }
  }

  function addOar() {
    if (oars.length >= 6) return;
    const key = `oar-${nextOarId}`;
    setNextOarId((value) => value + 1);
    setOars((current) => [
      ...current,
      makeEndpoint(key, "lung-pneumonitis"),
    ]);
  }

  const uiSelections = [tumour, ...oars];

  function currentCompareAudit() {
    if (!comparison) return undefined;
    return buildCompareRegimensAuditRecord(
      new Date().toISOString(),
      comparison,
    );
  }

  async function downloadCompareAudit() {
    const record = currentCompareAudit();
    if (!record) return;
    downloadJsonFile(
      "HFC_compare_regimens_audit",
      await serializeAuditEnvelope(record),
      record.generatedAtIso,
    );
  }

  function printCompareAudit() {
    const record = currentCompareAudit();
    if (!record) return;
    openPrintableAuditReport(record, language);
  }

  return (
    <main className="compare-workspace">
      <section className="panel compare-config-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{tx(language, "сравнение режимов", "compare regimens")}</span>
            <h2>
              {tx(
                language,
                "Режимы фракционирования",
                "Fractionation regimens",
              )}
            </h2>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={addRegimen}
            disabled={regimens.length >= 5}
          >
            {tx(language, "+ режим", "+ regimen")}
          </button>
        </div>

        <div className="regimen-editor-list">
          {regimens.map((regimen, index) => (
            <div
              className={`regimen-editor ${
                regimen.id === referenceRegimenId ? "reference" : ""
              }`}
              key={regimen.id}
            >
              <div className="regimen-editor-top">
                <label className="reference-radio">
                  <input
                    type="radio"
                    name="reference-regimen"
                    checked={regimen.id === referenceRegimenId}
                    onChange={() => setReferenceRegimenId(regimen.id)}
                  />
                  <span>
                    {regimen.id === referenceRegimenId
                      ? "Reference"
                      : tx(
                          language,
                          `Режим ${index + 1}`,
                          `Regimen ${index + 1}`,
                        )}
                  </span>
                </label>

                {regimens.length > 2 ? (
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => removeRegimen(regimen.id)}
                    aria-label={tx(
                      language,
                      "Удалить режим",
                      "Remove regimen",
                    )}
                  >
                    ×
                  </button>
                ) : null}
              </div>

              <div className="regimen-fields">
                <label className="field compact-field regimen-name-field">
                  <span>{tx(language, "Название", "Name")}</span>
                  <input
                    value={regimen.label}
                    onChange={(event) =>
                      updateRegimen(regimen.id, {
                        label: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="field compact-field">
                  <span>n</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={regimen.fractions}
                    onChange={(event) =>
                      updateRegimen(regimen.id, {
                        fractions: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="field compact-field">
                  <span>d, {gy}</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={regimen.dosePerFractionGy}
                    onChange={(event) =>
                      updateRegimen(regimen.id, {
                        dosePerFractionGy: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="section-divider" />

        <div className="section-heading compact">
          <div>
            <span className="eyebrow">{tx(language, "клинические исходы", "endpoints")}</span>
            <h2>
              {tx(
                language,
                "Опухоль + органы риска",
                "Tumour + organs at risk",
              )}
            </h2>
          </div>
        </div>

        <EndpointParameterEditor
          language={language}
          title={tx(
            language,
            "Опухолевый исход",
            "Tumour endpoint",
          )}
          selection={tumour}
          role="tumour"
          onChange={setTumour}
        />

        <div className="oar-list">
          {oars.map((oar, index) => (
            <EndpointParameterEditor
              key={oar.key}
              language={language}
              title={tx(language, `Орган риска ${index + 1}`, `OAR ${index + 1}`)}
              selection={oar}
              role="normal-tissue"
              onChange={(next) =>
                setOars((current) =>
                  current.map((item) =>
                    item.key === next.key ? next : item,
                  ),
                )
              }
              {...(oars.length > 1
                ? {
                    onRemove: () =>
                      setOars((current) =>
                        current.filter((item) => item.key !== oar.key),
                      ),
                  }
                : {})}
            />
          ))}
        </div>

        <button
          type="button"
          className="secondary-button full-width-button"
          onClick={addOar}
          disabled={oars.length >= 6}
        >
          {tx(
            language,
            "+ добавить исход для органа риска",
            "+ add OAR endpoint",
          )}
        </button>
      </section>

      <section className="panel compare-results-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{tx(language, "матрица", "matrix")}</span>
            <h2>{tx(language, "Сравнение EQD₂", "EQD₂ comparison")}</h2>
          </div>
          {comparison ? (
            <div className="audit-actions">
              <button
                type="button"
                className="secondary-button audit-download-button"
                onClick={downloadCompareAudit}
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
                onClick={printCompareAudit}
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
                "Нужно уточнить параметры сравнения",
                "Comparison inputs need review",
              )}
            </strong>
            <p>{error}</p>
          </div>
        ) : comparison ? (
          <>
            <div className="compare-table-scroll">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>{tx(language, "Клинический исход", "Endpoint")}</th>
                    {comparison.regimens.map((regimen) => (
                      <th key={regimen.id}>
                        <span>{regimen.label}</span>
                        {regimen.id === comparison.referenceRegimenId ? (
                          <em>reference</em>
                        ) : null}
                        <small>
                          {regimen.schedule.fractions} ×{" "}
                          {formatUiNumber(
                            language,
                            regimen.schedule.dosePerFractionGy,
                            2,
                          )}{" "}
                          {gy} ={" "}
                          {formatUiNumber(
                            language,
                            regimen.schedule.fractions *
                              regimen.schedule.dosePerFractionGy,
                            2,
                          )}{" "}
                          {gy}
                        </small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.endpoints.map((endpointComparison, rowIndex) => {
                    const selection = uiSelections[rowIndex];
                    const endpoint = endpoints.find(
                      (item) =>
                        item.id === endpointComparison.endpointId,
                    );
                    const firstCell = endpointComparison.cells[0];
                    const record =
                      firstCell?.result.parameterRecordId !== undefined
                        ? alphaBetaEstimates.find(
                            (item) =>
                              item.id ===
                              firstCell.result.parameterRecordId,
                          )
                        : undefined;
                    const source = sourceFor(firstCell?.result.sourceId);

                    return (
                      <tr key={endpointComparison.endpointId}>
                        <th className="endpoint-cell">
                          <span
                            className={`role-chip ${
                              endpoint?.role === "tumour"
                                ? "tumour"
                                : "normal"
                            }`}
                          >
                            {endpoint?.role === "tumour" ? tx(language, "Опухоль", "Tumour") : tx(language, "Орган риска", "OAR")}
                          </span>
                          <strong>
                            {endpointLabel(
                              language,
                              endpointComparison.endpointId,
                              endpoint?.endpoint ??
                                endpointComparison.endpointId,
                            )}
                          </strong>
                          <small>
                            {organLabel(language, endpoint?.organ ?? "")}
                          </small>
                          <small>
                            α/β ={" "}
                            {firstCell
                              ? formatUiNumber(
                                  language,
                                  firstCell.result.alphaBetaGy,
                                  2,
                                )
                              : "—"}{" "}
                            {gy}
                            {record?.ci95
                              ? ` [${formatUiNumber(language, record.ci95.low, 1)}–${formatUiNumber(language, record.ci95.high, 1)}]`
                              : ""}
                          </small>
                          {source ? (
                            <details className="table-source">
                              <summary>
                                {tx(language, "Источник", "Source")}
                              </summary>
                              <p>{source.citation}</p>
                            </details>
                          ) : selection?.choice.mode === "manual" ? (
                            <small>{userSpecifiedLabel(language)}</small>
                          ) : null}
                        </th>

                        {endpointComparison.cells.map((cell) => (
                          <td
                            key={cell.regimenId}
                            className={
                              cell.isReference ? "reference-cell" : ""
                            }
                          >
                            <span className="cell-label">EQD₂</span>
                            <strong className="cell-eqd">
                              {formatUiNumber(
                                language,
                                cell.result.eqd2Gy,
                              )}{" "}
                              {gy}
                            </strong>

                            <span
                              className={`delta-value ${
                                cell.deltaEqd2Gy > 0
                                  ? "positive"
                                  : cell.deltaEqd2Gy < 0
                                    ? "negative"
                                    : ""
                              }`}
                            >
                              Δ {signed(language, cell.deltaEqd2Gy)} {gy}
                            </span>

                            {cell.deltaEqd2Sensitivity ? (
                              <small className="delta-range">
                                Δ CI:{" "}
                                {signed(
                                  language,
                                  cell.deltaEqd2Sensitivity.low,
                                )}
                                {" … "}
                                {signed(
                                  language,
                                  cell.deltaEqd2Sensitivity.high,
                                )}{" "}
                                {gy}
                              </small>
                            ) : null}

                            <div className="cell-secondary">
                              <span>
                                BED{" "}
                                {formatUiNumber(
                                  language,
                                  cell.result.bedGy,
                                )}{" "}
                                {gy}
                              </span>
                              <span>
                                D{" "}
                                {formatUiNumber(
                                  language,
                                  cell.result.totalDoseGy,
                                )}{" "}
                                {gy}
                              </span>
                            </div>

                            {cell.result.warnings.length ? (
                              <details className="cell-warning">
                                <summary>
                                  ⚠ {cell.result.warnings.length}
                                </summary>
                                <ul>
                                  {cell.result.warnings.map((warning) => (
                                    <li key={warning}>
                                      {localizeWarning(
                                        language,
                                        warning,
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            ) : null}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="comparison-legend">
              <p>
                <strong>ΔEQD₂</strong>{" "}
                {tx(
                  language,
                  "считается относительно выбранного опорного режима для того же клинического исхода.",
                  "is calculated relative to the selected reference regimen for the same endpoint.",
                )}
              </p>
              <p>
                <strong>Δ CI</strong>{" "}
                {tx(
                  language,
                  "— коррелированный однопараметрический диапазон чувствительности: оба режима пересчитываются при одинаковых границах 95% ДИ α/β. Это не полная неопределённость лечения.",
                  "is a correlated one-parameter sensitivity range: both regimens are recalculated at the same 95% CI α/β boundaries. It is not full treatment uncertainty.",
                )}
              </p>
              <p>
                {tx(
                  language,
                  "Положительный Δ для опухоли означает большую модельную эквивалентную дозу опухоли; положительный Δ для органа риска означает большую модельную биологическую нагрузку для выбранного клинического исхода.",
                  "A positive Δ for tumour means a higher modelled tumour-equivalent dose; a positive Δ for an OAR means a higher modelled biological burden for that endpoint.",
                )}
              </p>
            </div>
          </>
        ) : null}

        <div className="safety-note">
          <strong>
            {tx(
              language,
              "Не является рекомендацией режима лечения.",
              "Not a treatment-regimen recommendation.",
            )}
          </strong>
          <p>
            {tx(
              language,
              "Сравнение показывает поведение выбранной LQ-модели и параметров доказательной базы. Клиническое решение требует ограничений доза–объём, учёта геометрии, времени лечения и независимой проверки.",
              "The comparison shows the behaviour of the selected LQ model and evidence parameters. Clinical decisions require dose-volume constraints, geometry, treatment timing, and independent verification.",
            )}
          </p>
        </div>
      </section>
    </main>
  );
}
