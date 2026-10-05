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
import { endpointLabelRu, organLabelRu } from "./labels.js";

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

function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function signed(value: number, digits = 2): string {
  const formatted = formatNumber(Math.abs(value), digits);
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
  title,
  selection,
  role,
  onChange,
  onRemove,
}: {
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
            aria-label="Удалить endpoint"
          >
            ×
          </button>
        ) : null}
      </div>

      <label className="field compact-field">
        <span>Endpoint</span>
        <select
          value={selection.endpointId}
          onChange={(event) => changeEndpoint(event.target.value)}
        >
          {[...grouped.entries()].map(([organ, items]) => (
            <optgroup key={organ} label={organLabelRu(organ)}>
              {items.map((endpoint) => (
                <option key={endpoint.id} value={endpoint.id}>
                  {endpointLabelRu(endpoint.id, endpoint.endpoint)}
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
          <option value="none">— выбрать параметр —</option>
          {records.map((estimate) => (
            <option key={estimate.id} value={`record:${estimate.id}`}>
              {formatNumber(estimate.valueGy, 2)} Гр
              {estimate.defaultEligible && estimate.status === "preferred"
                ? " · preferred"
                : " · alternative"}
            </option>
          ))}
          <option value="manual">Своё значение…</option>
        </select>
      </label>

      {selection.choice.mode === "manual" ? (
        <label className="field compact-field">
          <span>Своё α/β, Гр</span>
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
            α/β {formatNumber(record.valueGy, 2)} Гр
            {record.ci95
              ? ` · 95% CI ${formatNumber(record.ci95.low, 1)}–${formatNumber(record.ci95.high, 1)}`
              : ""}
          </span>
          <span className={`support-dot ${record.support}`}>
            {record.support}
          </span>
          {source ? <small>{source.citation}</small> : null}
        </div>
      ) : selection.choice.mode === "none" ? (
        <div className="inline-alert">
          Для этого endpoint HFC не выбирает α/β автоматически. Выберите
          опубликованную оценку или manual override.
        </div>
      ) : (
        <div className="endpoint-evidence-line">
          <span>Manual override</span>
          <small>Будет отмечен как user-specified во всех расчётах.</small>
        </div>
      )}
    </div>
  );
}

export function CompareRegimensView() {
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

  const calculation = useMemo(() => {
    try {
      const parsedRegimens: NamedRegimen[] = regimens.map((regimen) => {
        const fractions = Number(regimen.fractions);
        const dosePerFractionGy = Number(regimen.dosePerFractionGy);

        if (!Number.isInteger(fractions) || fractions <= 0) {
          throw new Error(
            `${regimen.label || regimen.id}: число фракций должно быть положительным целым.`,
          );
        }
        if (
          !Number.isFinite(dosePerFractionGy) ||
          dosePerFractionGy <= 0
        ) {
          throw new Error(
            `${regimen.label || regimen.id}: доза за фракцию должна быть >0 Гр.`,
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
          if (selection.choice.mode === "none") {
            throw new Error(
              `Не выбран α/β для ${endpointLabelRu(
                selection.endpointId,
                selection.endpointId,
              )}.`,
            );
          }

          if (selection.choice.mode === "manual") {
            const value = Number(selection.choice.value);
            if (!Number.isFinite(value) || value <= 0) {
              throw new Error(
                `Manual α/β для ${endpointLabelRu(
                  selection.endpointId,
                  selection.endpointId,
                )} должно быть >0 Гр.`,
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
            : "Не удалось сравнить схемы.",
      };
    }
  }, [regimens, referenceRegimenId, tumour, oars]);

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
        label: `Regimen ${current.length + 1}`,
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

  return (
    <main className="compare-workspace">
      <section className="panel compare-config-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">compare regimens</span>
            <h2>Схемы фракционирования</h2>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={addRegimen}
            disabled={regimens.length >= 5}
          >
            + схема
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
                      : `Схема ${index + 1}`}
                  </span>
                </label>

                {regimens.length > 2 ? (
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => removeRegimen(regimen.id)}
                    aria-label="Удалить схему"
                  >
                    ×
                  </button>
                ) : null}
              </div>

              <div className="regimen-fields">
                <label className="field compact-field regimen-name-field">
                  <span>Название</span>
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
                  <span>d, Гр</span>
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
            <span className="eyebrow">endpoints</span>
            <h2>Tumour + органы риска</h2>
          </div>
        </div>

        <EndpointParameterEditor
          title="Опухолевый endpoint"
          selection={tumour}
          role="tumour"
          onChange={setTumour}
        />

        <div className="oar-list">
          {oars.map((oar, index) => (
            <EndpointParameterEditor
              key={oar.key}
              title={`OAR ${index + 1}`}
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
          + добавить OAR endpoint
        </button>
      </section>

      <section className="panel compare-results-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">matrix</span>
            <h2>Сравнение EQD₂</h2>
          </div>
        </div>

        {error ? (
          <div className="empty-state">
            <strong>Нужно уточнить параметры сравнения</strong>
            <p>{error}</p>
          </div>
        ) : comparison ? (
          <>
            <div className="compare-table-scroll">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Endpoint</th>
                    {comparison.regimens.map((regimen) => (
                      <th key={regimen.id}>
                        <span>{regimen.label}</span>
                        {regimen.id === comparison.referenceRegimenId ? (
                          <em>reference</em>
                        ) : null}
                        <small>
                          {regimen.schedule.fractions} ×{" "}
                          {formatNumber(
                            regimen.schedule.dosePerFractionGy,
                            2,
                          )}{" "}
                          Гр ={" "}
                          {formatNumber(
                            regimen.schedule.fractions *
                              regimen.schedule.dosePerFractionGy,
                            2,
                          )}{" "}
                          Гр
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
                            {endpoint?.role === "tumour" ? "Tumour" : "OAR"}
                          </span>
                          <strong>
                            {endpointLabelRu(
                              endpointComparison.endpointId,
                              endpoint?.endpoint ??
                                endpointComparison.endpointId,
                            )}
                          </strong>
                          <small>
                            {organLabelRu(endpoint?.organ ?? "")}
                          </small>
                          <small>
                            α/β ={" "}
                            {firstCell
                              ? formatNumber(
                                  firstCell.result.alphaBetaGy,
                                  2,
                                )
                              : "—"}{" "}
                            Гр
                            {record?.ci95
                              ? ` [${formatNumber(record.ci95.low, 1)}–${formatNumber(record.ci95.high, 1)}]`
                              : ""}
                          </small>
                          {source ? (
                            <details className="table-source">
                              <summary>Источник</summary>
                              <p>{source.citation}</p>
                            </details>
                          ) : selection?.choice.mode === "manual" ? (
                            <small>user-specified</small>
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
                              {formatNumber(cell.result.eqd2Gy)} Гр
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
                              Δ {signed(cell.deltaEqd2Gy)} Гр
                            </span>

                            {cell.deltaEqd2Sensitivity ? (
                              <small className="delta-range">
                                Δ CI:{" "}
                                {signed(
                                  cell.deltaEqd2Sensitivity.low,
                                )}
                                {" … "}
                                {signed(
                                  cell.deltaEqd2Sensitivity.high,
                                )}{" "}
                                Гр
                              </small>
                            ) : null}

                            <div className="cell-secondary">
                              <span>
                                BED {formatNumber(cell.result.bedGy)} Гр
                              </span>
                              <span>
                                D {formatNumber(cell.result.totalDoseGy)} Гр
                              </span>
                            </div>

                            {cell.result.warnings.length ? (
                              <details className="cell-warning">
                                <summary>
                                  ⚠ {cell.result.warnings.length}
                                </summary>
                                <ul>
                                  {cell.result.warnings.map((warning) => (
                                    <li key={warning}>{warning}</li>
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
                <strong>ΔEQD₂</strong> считается относительно выбранной
                reference-схемы для того же endpoint.
              </p>
              <p>
                <strong>Δ CI</strong> — коррелированный one-parameter
                sensitivity range: обе схемы пересчитываются при одинаковых
                границах 95% CI α/β. Это не полная неопределённость лечения.
              </p>
              <p>
                Положительный Δ для tumour означает большую модельную
                эквивалентную дозу опухоли; положительный Δ для OAR означает
                большую модельную биологическую нагрузку на этот endpoint.
              </p>
            </div>
          </>
        ) : null}

        <div className="safety-note">
          <strong>Не является рекомендацией схемы лечения.</strong>
          <p>
            Сравнение показывает поведение выбранной LQ-модели и evidence
            parameters. Клиническое решение требует dose-volume constraints,
            геометрии, времени лечения и независимой проверки.
          </p>
        </div>
      </section>
    </main>
  );
}
