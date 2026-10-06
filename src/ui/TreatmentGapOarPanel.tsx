import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  alphaBetaEstimates,
  endpoints,
  repairHalfTimeEstimates,
  sources,
} from "../data/evidence/v0.1/index.js";
import {
  getAlphaBetaEstimates,
  getPreferredAlphaBetaEstimate,
} from "../evidence/alphaBetaRegistry.js";
import {
  getPreferredRepairHalfTimeEstimate,
  getRepairHalfTimeEstimates,
} from "../evidence/repairRegistry.js";
import type { DoseMetric, DoseMetricKind } from "../domain/constraints.js";
import {
  buildTreatmentGapOarAuditEntry,
  type TreatmentGapOarAuditEntry,
} from "../audit/treatmentGapOarAudit.js";
import type { DoseCompensationStrategyResult } from "../workflows/treatmentGap.js";
import type { TreatmentCalendarScenario } from "../workflows/treatmentCalendar.js";
import {
  compareOarCalendarStrategy,
  evaluateOarDoseCompensation,
  proportionalOarDosePerFraction,
} from "../workflows/treatmentGapOar.js";
import { estimateChoiceLabel, localizeWarning, tx } from "./i18n.js";
import {
  endpointLabel,
  formatUiNumber,
  organLabel,
  type Language,
} from "./labels.js";

type ParameterMode = "evidence" | "manual";
type OarPostGapDoseMode = "manual" | "proportional";

function signed(
  language: Language,
  value: number,
  digits = 2,
): string {
  if (Math.abs(value) < 1e-10) return "0";
  return (
    (value > 0 ? "+" : "−") +
    formatUiNumber(language, Math.abs(value), digits)
  );
}

function sourceFor(sourceId: string | undefined) {
  if (!sourceId) return undefined;
  return sources.find((source) => source.id === sourceId);
}

interface TreatmentGapOarSharedProps {
  language: Language;
  calendarScenario?: TreatmentCalendarScenario;
  plannedFractions: number;
  deliveredFractionsBeforeGap: number;
  plannedTargetDosePerFractionGy: number;
  bidInterfractionHours: number;
  doseCompensation?: DoseCompensationStrategyResult;
}

interface TreatmentGapOarPanelProps
  extends TreatmentGapOarSharedProps {
  onAuditEntriesChange?: (
    entries: TreatmentGapOarAuditEntry[],
  ) => void;
}

type OarAuditChangeHandler = (
  cardId: number,
  entry: TreatmentGapOarAuditEntry,
) => void;

function TreatmentGapOarCard({
  cardId,
  index,
  onRemove,
  onAuditChange,
  language,
  calendarScenario,
  plannedFractions,
  deliveredFractionsBeforeGap,
  plannedTargetDosePerFractionGy,
  bidInterfractionHours,
  doseCompensation,
}: TreatmentGapOarSharedProps & {
  cardId: number;
  index: number;
  onRemove?: () => void;
  onAuditChange: OarAuditChangeHandler;
}) {
  const normalEndpoints = useMemo(
    () =>
      endpoints
        .filter(
          (endpoint) =>
            endpoint.role === "normal-tissue" &&
            getAlphaBetaEstimates(endpoint.id).length > 0,
        )
        .sort((a, b) =>
          (a.organ + " " + a.endpoint).localeCompare(
            b.organ + " " + b.endpoint,
            "en",
          ),
        ),
    [],
  );

  const [endpointId, setEndpointId] =
    useState("larynx-edema");

  const initialAlpha =
    getPreferredAlphaBetaEstimate(endpointId);
  const [alphaMode, setAlphaMode] =
    useState<ParameterMode>(
      initialAlpha ? "evidence" : "manual",
    );
  const [alphaRecordId, setAlphaRecordId] = useState(
    initialAlpha?.id ?? "",
  );
  const [manualAlphaBeta, setManualAlphaBeta] = useState("3");

  const initialRepair =
    getPreferredRepairHalfTimeEstimate(endpointId);
  const [repairMode, setRepairMode] =
    useState<ParameterMode>(
      initialRepair ? "evidence" : "manual",
    );
  const [repairRecordId, setRepairRecordId] = useState(
    initialRepair?.id ?? "",
  );
  const [manualRepairHalfTime, setManualRepairHalfTime] =
    useState("4.4");

  const [metricKind, setMetricKind] =
    useState<Exclude<DoseMetricKind, "Vx">>("Dmax");
  const [customMetricLabel, setCustomMetricLabel] = useState("");
  const [plannedOarDosePerFraction, setPlannedOarDosePerFraction] =
    useState("1");
  const [postGapDoseMode, setPostGapDoseMode] =
    useState<OarPostGapDoseMode>("manual");
  const [manualPostGapOarDose, setManualPostGapOarDose] =
    useState("1");

  const alphaRecords = getAlphaBetaEstimates(endpointId);
  const repairRecords = getRepairHalfTimeEstimates(endpointId);
  const alphaRecord = alphaBetaEstimates.find(
    (record) => record.id === alphaRecordId,
  );
  const repairRecord = repairHalfTimeEstimates.find(
    (record) => record.id === repairRecordId,
  );
  const alphaSource = sourceFor(alphaRecord?.sourceId);
  const repairSource = sourceFor(repairRecord?.sourceId);
  const gy = language === "ru" ? "Гр" : "Gy";

  const auditMetric = useMemo<DoseMetric>(
    () =>
      metricKind === "custom"
        ? {
            kind: "custom",
            customLabel: customMetricLabel.trim(),
          }
        : { kind: metricKind },
    [metricKind, customMetricLabel],
  );

  const auditAlphaSelection = useMemo(
    () =>
      alphaMode === "manual"
        ? {
            selectionMode: "manual" as const,
            parameter: "alpha-beta" as const,
            value: Number(manualAlphaBeta),
            unit: "Gy" as const,
            rationale:
              "Manual OAR alpha/beta from Treatment Gap UI",
          }
        : {
            selectionMode: "evidence" as const,
            parameterRecordId: alphaRecordId,
          },
    [alphaMode, alphaRecordId, manualAlphaBeta],
  );

  const auditRepairSelection = useMemo(
    () =>
      repairMode === "manual"
        ? {
            selectionMode: "manual" as const,
            parameter: "repair-half-time" as const,
            value: Number(manualRepairHalfTime),
            unit: "hours" as const,
            rationale:
              "Manual OAR repair half-time from Treatment Gap UI",
          }
        : {
            selectionMode: "evidence" as const,
            parameterRecordId: repairRecordId,
          },
    [
      repairMode,
      repairRecordId,
      manualRepairHalfTime,
    ],
  );

  function changeEndpoint(nextId: string) {
    setEndpointId(nextId);

    const nextAlpha = getPreferredAlphaBetaEstimate(nextId);
    setAlphaMode(nextAlpha ? "evidence" : "manual");
    setAlphaRecordId(nextAlpha?.id ?? "");

    const nextRepair =
      getPreferredRepairHalfTimeEstimate(nextId);
    setRepairMode(nextRepair ? "evidence" : "manual");
    setRepairRecordId(nextRepair?.id ?? "");
  }

  const calculation = useMemo(() => {
    try {
      const plannedOarD = Number(
        plannedOarDosePerFraction,
      );
      const metric = auditMetric;
      const alphaSelection = auditAlphaSelection;
      const repairSelection = auditRepairSelection;

      let weekend;
      let bid;

      if (calendarScenario) {
        weekend = compareOarCalendarStrategy({
          endpointId,
          metric,
          plannedCalendar: calendarScenario.planned,
          strategyCalendar:
            calendarScenario.weekendRecovery,
          dosePerFractionGy: plannedOarD,
          alphaBetaSelection: alphaSelection,
        });

        try {
          bid = compareOarCalendarStrategy({
            endpointId,
            metric,
            plannedCalendar: calendarScenario.planned,
            strategyCalendar: calendarScenario.bidRecovery,
            dosePerFractionGy: plannedOarD,
            alphaBetaSelection: alphaSelection,
            repairHalfTimeSelection: repairSelection,
            bidInterfractionHours,
          });
        } catch (error) {
          bid = {
            error:
              error instanceof Error
                ? localizeWarning(language, error.message)
                : tx(
                    language,
                    "Не удалось оценить влияние двух фракций в сутки на орган риска.",
                    "The BID OAR effect could not be evaluated.",
                  ),
          };
        }
      }

      let doseCompensationOar;
      let postGapOarD;

      if (doseCompensation) {
        postGapOarD =
          postGapDoseMode === "proportional"
            ? proportionalOarDosePerFraction(
                plannedOarD,
                plannedTargetDosePerFractionGy,
                doseCompensation.requiredDosePerFractionGy,
              )
            : Number(manualPostGapOarDose);

        doseCompensationOar =
          evaluateOarDoseCompensation({
            endpointId,
            metric,
            deliveredFractionsBeforeGap,
            remainingFractions:
              doseCompensation.remainingFractionsToDeliver,
            plannedDosePerFractionGy: plannedOarD,
            postGapDosePerFractionGy: postGapOarD,
            alphaBetaSelection: alphaSelection,
          });
      }

      return {
        weekend,
        bid,
        doseCompensationOar,
        postGapOarD,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? localizeWarning(language, error.message)
            : tx(
                language,
                "Не удалось выполнить расчёт для органа риска.",
                "The OAR calculation could not be completed.",
              ),
      };
    }
  }, [
    endpointId,
    auditMetric,
    auditAlphaSelection,
    auditRepairSelection,
    plannedOarDosePerFraction,
    postGapDoseMode,
    manualPostGapOarDose,
    calendarScenario,
    plannedTargetDosePerFractionGy,
    deliveredFractionsBeforeGap,
    bidInterfractionHours,
    doseCompensation,
    language,
  ]);

  const endpoint = endpoints.find(
    (item) => item.id === endpointId,
  );
  const error = "error" in calculation
    ? calculation.error
    : undefined;

  const auditEntry = useMemo(
    () =>
      buildTreatmentGapOarAuditEntry({
        cardId,
        endpointId,
        metric: auditMetric,
        inputState: {
          plannedOarDosePerFraction,
          postGapDoseMode,
          manualPostGapOarDose,
          alphaMode,
          alphaRecordId,
          manualAlphaBeta,
          repairMode,
          repairRecordId,
          manualRepairHalfTime,
          bidInterfractionHours,
        },
        alphaSelection: auditAlphaSelection,
        repairSelection: auditRepairSelection,
        calculation,
      }),
    [
      cardId,
      endpointId,
      auditMetric,
      plannedOarDosePerFraction,
      postGapDoseMode,
      manualPostGapOarDose,
      alphaMode,
      alphaRecordId,
      manualAlphaBeta,
      repairMode,
      repairRecordId,
      manualRepairHalfTime,
      bidInterfractionHours,
      auditAlphaSelection,
      auditRepairSelection,
      calculation,
    ],
  );

  useEffect(() => {
    onAuditChange(cardId, auditEntry);
  }, [cardId, auditEntry, onAuditChange]);

  return (
    <section className="gap-oar-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {tx(
              language,
              "орган риска " + index,
              "organ at risk " + index,
            )}
          </span>
          <h2>
            {tx(
              language,
              "Как компенсация меняет биологическую нагрузку?",
              "How does compensation change biological burden?",
            )}
          </h2>
        </div>
        {onRemove ? (
          <button
            type="button"
            className="icon-button"
            onClick={onRemove}
            aria-label={tx(
              language,
              "Удалить орган риска",
              "Remove organ at risk",
            )}
          >
            ×
          </button>
        ) : null}
      </div>

      <p className="oar-intro">
        {tx(
          language,
          "HFC не предполагает, что доза на орган риска равна предписанной дозе. Введите дозу за фракцию для выбранной клинически значимой метрики органа риска.",
          "HFC does not assume that OAR dose equals prescription dose. Enter the dose per fraction for the clinically relevant OAR metric being evaluated.",
        )}
      </p>

      <label className="field">
        <span>
          {tx(
            language,
            "Клинический исход органа риска",
            "OAR clinical endpoint",
          )}
        </span>
        <select
          value={endpointId}
          onChange={(event) =>
            changeEndpoint(event.target.value)
          }
        >
          {normalEndpoints.map((item) => (
            <option key={item.id} value={item.id}>
              {organLabel(language, item.organ)} ·{" "}
              {endpointLabel(
                language,
                item.id,
                item.endpoint,
              )}
            </option>
          ))}
        </select>
      </label>

      <div className="two-columns">
        <label className="field">
          <span>
            {tx(
              language,
              "Дозовая метрика",
              "Dose metric",
            )}
          </span>
          <select
            value={metricKind}
            onChange={(event) =>
              setMetricKind(
                event.target.value as Exclude<DoseMetricKind, "Vx">,
              )
            }
          >
            <option value="Dmax">Dmax</option>
            <option value="D0.03cc">D0.03cc</option>
            <option value="D0.1cc">D0.1cc</option>
            <option value="D1cc">D1cc</option>
            <option value="D2cc">D2cc</option>
            <option value="mean-dose">
              {tx(language, "Средняя доза", "Mean dose")}
            </option>
            <option value="custom">
              {tx(language, "Другая дозовая метрика", "Custom dose metric")}
            </option>
          </select>
        </label>

        <label className="field">
          <span>
            {tx(
              language,
              "Доза на выбранную метрику за фракцию, Гр",
              "Dose to selected metric per fraction, Gy",
            )}
          </span>
          <input
            type="number"
            min="0.001"
            step="0.01"
            value={plannedOarDosePerFraction}
            onChange={(event) =>
              setPlannedOarDosePerFraction(
                event.target.value,
              )
            }
          />
        </label>

        {metricKind === "custom" ? (
          <label className="field">
            <span>
              {tx(
                language,
                "Название дозовой метрики",
                "Dose metric label",
              )}
            </span>
            <input
              value={customMetricLabel}
              placeholder={tx(
                language,
                "например: D0.5cc",
                "e.g. D0.5cc",
              )}
              onChange={(event) =>
                setCustomMetricLabel(event.target.value)
              }
            />
          </label>
        ) : null}

        <label className="field">
          <span>
            {tx(
              language,
              "Опухолевая доза за фракцию, Гр",
              "Target dose per fraction, Gy",
            )}
          </span>
          <input
            value={formatUiNumber(
              language,
              plannedTargetDosePerFractionGy,
              3,
            )}
            readOnly
          />
        </label>
      </div>

      <div className="segmented">
        <button
          type="button"
          className={
            alphaMode === "evidence" ? "selected" : ""
          }
          onClick={() => setAlphaMode("evidence")}
        >
          {tx(
            language,
            "α/β из доказательной базы",
            "Evidence α/β",
          )}
        </button>
        <button
          type="button"
          className={
            alphaMode === "manual" ? "selected" : ""
          }
          onClick={() => setAlphaMode("manual")}
        >
          {tx(language, "своё α/β", "custom α/β")}
        </button>
      </div>

      {alphaMode === "evidence" ? (
        <label className="field">
          <span>{tx(language, "Оценка α/β", "α/β estimate")}</span>
          <select
            value={alphaRecordId}
            onChange={(event) =>
              setAlphaRecordId(event.target.value)
            }
          >
            <option value="">
              {tx(language, "— выбрать —", "— select —")}
            </option>
            {alphaRecords.map((record) => (
              <option key={record.id} value={record.id}>
                {formatUiNumber(
                  language,
                  record.valueGy,
                  2,
                )}{" "}
                {gy}
                {" · "}
                {estimateChoiceLabel(
                  language,
                  record.defaultEligible,
                )}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="field">
          <span>
            {tx(language, "Своё α/β, Гр", "Custom α/β, Gy")}
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
        </label>
      )}

      {alphaRecord && alphaMode === "evidence" ? (
        <div className="evidence-mini">
          <strong>
            α/β ={" "}
            {formatUiNumber(
              language,
              alphaRecord.valueGy,
              2,
            )}{" "}
            {gy}
          </strong>
          {alphaRecord.ci95 ? (
            <span>
              95% {tx(language, "ДИ", "CI")}{" "}
              {formatUiNumber(
                language,
                alphaRecord.ci95.low,
                1,
              )}
              –
              {formatUiNumber(
                language,
                alphaRecord.ci95.high,
                1,
              )}{" "}
              {gy}
            </span>
          ) : null}
          {alphaSource ? (
            <small>{alphaSource.citation}</small>
          ) : null}
        </div>
      ) : null}

      {calendarScenario?.bidDays ? (
        <>
          <div className="section-divider" />
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">
                {tx(
                  language,
                  "неполное восстановление",
                  "incomplete repair",
                )}
              </span>
              <h2>
                T½ · {calendarScenario.bidDays}{" "}
                {tx(
                  language,
                  "дней с двумя фракциями",
                  "BID days",
                )}
              </h2>
            </div>
          </div>

          <div className="segmented">
            <button
              type="button"
              className={
                repairMode === "evidence"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setRepairMode("evidence")
              }
            >
              {tx(
                language,
                "T½ из доказательной базы",
                "Evidence T½",
              )}
            </button>
            <button
              type="button"
              className={
                repairMode === "manual"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setRepairMode("manual")
              }
            >
              {tx(language, "своё T½", "custom T½")}
            </button>
          </div>

          {repairMode === "evidence" ? (
            <label className="field">
              <span>
                {tx(
                  language,
                  "Время полувосстановления",
                  "Repair half-time",
                )}
              </span>
              <select
                value={repairRecordId}
                onChange={(event) =>
                  setRepairRecordId(event.target.value)
                }
              >
                <option value="">
                  {tx(language, "— выбрать —", "— select —")}
                </option>
                {repairRecords.map((record) => (
                  <option
                    key={record.id}
                    value={record.id}
                  >
                    {record.valueHours !== undefined
                      ? formatUiNumber(
                          language,
                          record.valueHours,
                          2,
                        ) + " " + tx(language, "ч", "h")
                      : record.qualifier === "lower-bound"
                        ? "> " +
                          formatUiNumber(
                            language,
                            record.rangeHours?.low ?? 0,
                            1,
                          ) +
                          " " +
                          tx(language, "ч", "h")
                        : tx(
                            language,
                            "диапазон",
                            "range",
                          )}
                  </option>
                ))}
              </select>
              <small>
                {tx(
                  language,
                  "Диапазон или нижняя граница не превращаются автоматически в точечное T½: для расчёта потребуется своё численное значение.",
                  "A range or lower bound is never converted automatically into a point T½; an explicit numerical value is required for calculation.",
                )}
              </small>
            </label>
          ) : (
            <label className="field">
              <span>
                {tx(
                  language,
                  "Своё T½, ч",
                  "Custom T½, h",
                )}
              </span>
              <input
                type="number"
                min="0.01"
                step="0.1"
                value={manualRepairHalfTime}
                onChange={(event) =>
                  setManualRepairHalfTime(
                    event.target.value,
                  )
                }
              />
            </label>
          )}

          {repairRecord &&
          repairMode === "evidence" ? (
            <div className="evidence-mini">
              <strong>
                T½{" "}
                {repairRecord.valueHours !== undefined
                  ? "= " +
                    formatUiNumber(
                      language,
                      repairRecord.valueHours,
                      2,
                    ) +
                    " " +
                    tx(language, "ч", "h")
                  : tx(
                      language,
                      "не задано точечным значением",
                      "is not a point estimate",
                    )}
              </strong>
              {repairSource ? (
                <small>{repairSource.citation}</small>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}

      <div className="section-divider" />

      <div className="oar-strategy-results">
        {error ? (
          <div className="inline-alert">{error}</div>
        ) : (
          <>
            {calculation.weekend ? (
              <div className="oar-result-card">
                <span>
                  {tx(
                    language,
                    "Лечение в выходные",
                    "Weekend recovery",
                  )}
                </span>
                <strong>
                  ΔEQD₂{" "}
                  {signed(
                    language,
                    calculation.weekend.deltaEqd2Gy,
                  )}{" "}
                  {gy}
                </strong>
                <small>
                  ΔBED{" "}
                  {signed(
                    language,
                    calculation.weekend.deltaBedGy,
                  )}{" "}
                  {gy}
                </small>
              </div>
            ) : null}

            {calculation.bid ? (
              "error" in calculation.bid ? (
                <div className="oar-result-card warning">
                  <span>
                    {tx(
                      language,
                      "Две фракции в сутки",
                      "BID recovery",
                    )}
                  </span>
                  <p>{calculation.bid.error}</p>
                </div>
              ) : (
                <div className="oar-result-card">
                  <span>
                    {tx(
                      language,
                      "Две фракции в сутки",
                      "BID recovery",
                    )}
                  </span>
                  <strong>
                    ΔEQD₂{" "}
                    {signed(
                      language,
                      calculation.bid.deltaEqd2Gy,
                    )}{" "}
                    {gy}
                  </strong>
                  <small>
                    ΔBED{" "}
                    {signed(
                      language,
                      calculation.bid.deltaBedGy,
                    )}{" "}
                    {gy}
                  </small>
                  {calculation.bid.strategy.repairHalfTimeHours ? (
                    <small>
                      T½{" "}
                      {formatUiNumber(
                        language,
                        calculation.bid.strategy
                          .repairHalfTimeHours,
                        2,
                      )}{" "}
                      {tx(language, "ч", "h")}
                    </small>
                  ) : null}
                </div>
              )
            ) : null}
          </>
        )}
      </div>

      {doseCompensation ? (
        <div className="oar-dose-compensation">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">
                {tx(
                  language,
                  "компенсация дозой",
                  "dose compensation",
                )}
              </span>
              <h2>
                {tx(
                  language,
                  "Как задать дозу на орган риска после перерыва?",
                  "How should post-gap OAR dose be entered?",
                )}
              </h2>
            </div>
          </div>

          <div className="segmented">
            <button
              type="button"
              className={
                postGapDoseMode === "manual"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setPostGapDoseMode("manual")
              }
            >
              {tx(
                language,
                "Ввести явно",
                "Enter explicitly",
              )}
            </button>
            <button
              type="button"
              className={
                postGapDoseMode === "proportional"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setPostGapDoseMode("proportional")
              }
            >
              {tx(
                language,
                "Пропорциональное масштабирование",
                "Proportional scaling",
              )}
            </button>
          </div>

          {postGapDoseMode === "manual" ? (
            <label className="field">
              <span>
                {tx(
                  language,
                  "Доза на выбранную метрику после перерыва, Гр/фракцию",
                  "Post-gap dose to selected metric, Gy/fraction",
                )}
              </span>
              <input
                type="number"
                min="0.001"
                step="0.01"
                value={manualPostGapOarDose}
                onChange={(event) =>
                  setManualPostGapOarDose(
                    event.target.value,
                  )
                }
              />
            </label>
          ) : (
            <div className="inline-alert">
              {tx(
                language,
                "HFC масштабирует дозу на орган риска в той же пропорции, что и опухолевую дозу за фракцию. Это явное пользовательское допущение, а не свойство плана лечения.",
                "HFC scales OAR dose in the same proportion as target dose per fraction. This is an explicit user assumption, not a property inferred from the treatment plan.",
              )}
            </div>
          )}

          {!error &&
          calculation.doseCompensationOar ? (
            <div className="oar-dose-result">
              <div>
                <span>
                  {tx(
                    language,
                    "Доза после перерыва",
                    "Post-gap OAR dose",
                  )}
                </span>
                <strong>
                  {formatUiNumber(
                    language,
                    calculation.postGapOarD ?? 0,
                    3,
                  )}{" "}
                  {gy}/{tx(language, "фракцию", "fraction")}
                </strong>
              </div>
              <div>
                <span>ΔEQD₂</span>
                <strong>
                  {signed(
                    language,
                    calculation.doseCompensationOar
                      .deltaEqd2Gy,
                  )}{" "}
                  {gy}
                </strong>
              </div>
              <div>
                <span>ΔBED</span>
                <strong>
                  {signed(
                    language,
                    calculation.doseCompensationOar
                      .deltaBedGy,
                  )}{" "}
                  {gy}
                </strong>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!error && calculation.bid && !("error" in calculation.bid) ? (
        <details className="oar-warning-details">
          <summary>
            {tx(
              language,
              "Предупреждения и допущения расчёта органа риска",
              "OAR warnings and assumptions",
            )}
          </summary>
          <ul>
            {calculation.bid.warnings.map((warning) => (
              <li key={warning}>
                {localizeWarning(language, warning)}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <div className="safety-note">
        <strong>
          {tx(
            language,
            "Это модель выбранной дозовой метрики, а не автоматическая проверка ограничения органа риска.",
            "This models the selected dose metric; it is not an automatic OAR constraint check.",
          )}
        </strong>
        <p>
          {tx(
            language,
            "Результат необходимо сопоставлять с подходящим клиническим ограничением доза–объём. HFC не делает вывод о допустимости режима только по ΔEQD₂.",
            "The result must be compared with an appropriate clinical dose-volume constraint. HFC does not declare a regimen acceptable from ΔEQD₂ alone.",
          )}
        </p>
      </div>

      <small className="oar-context-line">
        {organLabel(language, endpoint?.organ ?? "")} ·{" "}
        {endpointLabel(
          language,
          endpointId,
          endpoint?.endpoint ?? endpointId,
        )} · {metricKind === "custom"
          ? customMetricLabel || tx(language, "другая метрика", "custom metric")
          : metricKind} · n={plannedFractions}
      </small>
    </section>
  );
}

export function TreatmentGapOarPanel(
  props: TreatmentGapOarPanelProps,
) {
  const {
    onAuditEntriesChange,
    ...sharedProps
  } = props;
  const [cardIds, setCardIds] = useState([1]);
  const [nextCardId, setNextCardId] = useState(2);
  const [auditEntriesById, setAuditEntriesById] =
    useState<Record<number, TreatmentGapOarAuditEntry>>(
      {},
    );

  const updateAuditEntry = useCallback<
    OarAuditChangeHandler
  >((cardId, entry) => {
    setAuditEntriesById((current) => {
      if (current[cardId] === entry) return current;
      return {
        ...current,
        [cardId]: entry,
      };
    });
  }, []);

  useEffect(() => {
    if (!onAuditEntriesChange) return;

    const ordered = cardIds
      .map((cardId) => auditEntriesById[cardId])
      .filter(
        (
          entry,
        ): entry is TreatmentGapOarAuditEntry =>
          entry !== undefined,
      );
    onAuditEntriesChange(ordered);
  }, [
    cardIds,
    auditEntriesById,
    onAuditEntriesChange,
  ]);

  function addCard() {
    if (cardIds.length >= 5) return;
    setCardIds((current) => [...current, nextCardId]);
    setNextCardId((value) => value + 1);
  }

  function removeCard(cardId: number) {
    setCardIds((current) =>
      current.filter((item) => item !== cardId),
    );
    setAuditEntriesById((current) => {
      const next = { ...current };
      delete next[cardId];
      return next;
    });
  }

  return (
    <section className="gap-oar-panel">
      <div className="gap-oar-panel-heading">
        <div>
          <span className="eyebrow">
            {tx(
              sharedProps.language,
              "органы риска",
              "organs at risk",
            )}
          </span>
          <h2>
            {tx(
              sharedProps.language,
              "Оценка биологической нагрузки",
              "Biological burden assessment",
            )}
          </h2>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={addCard}
          disabled={cardIds.length >= 5}
        >
          {tx(
            sharedProps.language,
            "+ добавить орган риска",
            "+ add OAR",
          )}
        </button>
      </div>

      <div className="gap-oar-card-list">
        {cardIds.map((id, index) => (
          <TreatmentGapOarCard
            key={id}
            {...sharedProps}
            cardId={id}
            index={index + 1}
            onAuditChange={updateAuditEntry}
            {...(cardIds.length > 1
              ? {
                  onRemove: () => removeCard(id),
                }
              : {})}
          />
        ))}
      </div>
    </section>
  );
}

