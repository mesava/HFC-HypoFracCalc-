import { useMemo, useState } from "react";
import {
  alphaBetaEstimates,
  endpoints,
  repopulationRateEstimates,
  sources,
} from "../data/evidence/v0.1/index.js";
import {
  getAlphaBetaEstimates,
  getPreferredAlphaBetaEstimate,
} from "../evidence/alphaBetaRegistry.js";
import {
  getPreferredRepopulationEstimate,
  getRepopulationEstimates,
} from "../evidence/repopulationRegistry.js";
import {
  buildTreatmentGapBaseline,
  evaluatePreserveTimeStrategy,
  solveDoseCompensationStrategy,
} from "../workflows/treatmentGap.js";
import {
  buildTreatmentCalendarScenario,
  type TreatmentCalendarScenario,
} from "../workflows/treatmentCalendar.js";
import { localizeWarning, tx } from "./i18n.js";
import {
  endpointLabel,
  formatUiNumber,
  organLabel,
  type Language,
} from "./labels.js";

type ParameterMode = "evidence" | "manual";
type TimeMode = "evidence" | "manual";
type CourseInputMode = "calendar" | "manual";

function signed(
  language: Language,
  value: number,
  digits = 2,
): string {
  if (Math.abs(value) < 1e-10) return "0";
  return `${value > 0 ? "+" : "−"}${formatUiNumber(
    language,
    Math.abs(value),
    digits,
  )}`;
}

function sourceFor(sourceId: string | undefined) {
  if (!sourceId) return undefined;
  return sources.find((source) => source.id === sourceId);
}

export function TreatmentGapView({
  language,
}: {
  language: Language;
}) {
  const tumourEndpoints = useMemo(
    () =>
      endpoints
        .filter(
          (endpoint) =>
            endpoint.role === "tumour" &&
            getAlphaBetaEstimates(endpoint.id).length > 0,
        )
        .sort((a, b) =>
          `${a.organ} ${a.endpoint}`.localeCompare(
            `${b.organ} ${b.endpoint}`,
            "en",
          ),
        ),
    [],
  );

  const [endpointId, setEndpointId] = useState(
    "head-neck-tumour-control",
  );

  const preferredAlpha = getPreferredAlphaBetaEstimate(endpointId);
  const [alphaMode, setAlphaMode] =
    useState<ParameterMode>("evidence");
  const [alphaRecordId, setAlphaRecordId] = useState(
    preferredAlpha?.id ?? "",
  );
  const [manualAlphaBeta, setManualAlphaBeta] = useState("10");

  const preferredTime = getPreferredRepopulationEstimate(endpointId);
  const [timeMode, setTimeMode] = useState<TimeMode>(
    preferredTime ? "evidence" : "manual",
  );
  const [timeRecordId, setTimeRecordId] = useState(
    preferredTime?.id ?? "",
  );
  const [tkOverride, setTkOverride] = useState(
    preferredTime?.kickOffDays?.toString() ?? "",
  );
  const [manualDprolif, setManualDprolif] = useState("0.8");
  const [manualTk, setManualTk] = useState("21");

  const [fractions, setFractions] = useState("35");
  const [dosePerFraction, setDosePerFraction] = useState("2");
  const [courseInputMode, setCourseInputMode] =
    useState<CourseInputMode>("calendar");
  const [startDate, setStartDate] = useState("2026-10-05");
  const [gapStartDate, setGapStartDate] = useState("2026-11-02");
  const [gapEndDate, setGapEndDate] = useState("2026-11-06");
  const [excludedDatesText, setExcludedDatesText] = useState("");
  const [plannedOtt, setPlannedOtt] = useState("46");
  const [deliveredBeforeGap, setDeliveredBeforeGap] =
    useState("20");
  const [gapDays, setGapDays] = useState("5");

  const [bidHours, setBidHours] = useState("8");
  const [compRemainingFractions, setCompRemainingFractions] =
    useState("15");
  const [compActualOtt, setCompActualOtt] = useState("51");

  const alphaRecords = getAlphaBetaEstimates(endpointId);
  const timeRecords = getRepopulationEstimates(endpointId);
  const alphaRecord = alphaBetaEstimates.find(
    (record) => record.id === alphaRecordId,
  );
  const timeRecord = repopulationRateEstimates.find(
    (record) => record.id === timeRecordId,
  );
  const alphaSource = sourceFor(alphaRecord?.sourceId);
  const timeSource = sourceFor(timeRecord?.sourceId);
  const gy = language === "ru" ? "Гр" : "Gy";
  const day = language === "ru" ? "дней" : "days";
  const hour = language === "ru" ? "ч" : "h";

  const calendarCalculation = useMemo(() => {
    if (courseInputMode !== "calendar") {
      return { scenario: undefined as TreatmentCalendarScenario | undefined };
    }

    try {
      const excludedDates = excludedDatesText
        .split(/[\s,;]+/)
        .map((value) => value.trim())
        .filter(Boolean);

      return {
        scenario: buildTreatmentCalendarScenario({
          startDate,
          fractions: Number(fractions),
          gapStartDate,
          gapEndDate,
          ...(excludedDates.length > 0 ? { excludedDates } : {}),
        }),
      };
    } catch (error) {
      return {
        scenario: undefined,
        error:
          error instanceof Error
            ? error.message
            : tx(
                language,
                "Не удалось построить календарь лечения.",
                "The treatment calendar could not be constructed.",
              ),
      };
    }
  }, [
    courseInputMode,
    startDate,
    fractions,
    gapStartDate,
    gapEndDate,
    excludedDatesText,
    language,
  ]);

  function changeEndpoint(nextId: string) {
    setEndpointId(nextId);

    const nextAlpha = getPreferredAlphaBetaEstimate(nextId);
    setAlphaMode(nextAlpha ? "evidence" : "manual");
    setAlphaRecordId(nextAlpha?.id ?? "");

    const nextTime = getPreferredRepopulationEstimate(nextId);
    setTimeMode(nextTime ? "evidence" : "manual");
    setTimeRecordId(nextTime?.id ?? "");
    setTkOverride(nextTime?.kickOffDays?.toString() ?? "");
  }

  const calculation = useMemo(() => {
    try {
      const n = Number(fractions);
      const d = Number(dosePerFraction);
      const calendarScenario = calendarCalculation.scenario;

      if (
        courseInputMode === "calendar" &&
        !calendarScenario
      ) {
        throw new Error(
          calendarCalculation.error ??
            tx(
              language,
              "Календарь лечения содержит ошибку.",
              "The treatment calendar contains an error.",
            ),
        );
      }

      const plannedOverallTreatmentDays =
        calendarScenario?.plannedOverallTreatmentDays ??
        Number(plannedOtt);
      const deliveredFractionsBeforeGap =
        calendarScenario?.deliveredFractionsBeforeGap ??
        Number(deliveredBeforeGap);
      const gap =
        calendarScenario?.gapCalendarDays ??
        Number(gapDays);

      const alphaSelection =
        alphaMode === "manual"
          ? {
              selectionMode: "manual" as const,
              parameter: "alpha-beta" as const,
              value: Number(manualAlphaBeta),
              unit: "Gy" as const,
              rationale: "Manual override from Treatment Gap UI",
            }
          : {
              selectionMode: "evidence" as const,
              parameterRecordId: alphaRecordId,
            };

      let repopulationSelection;
      if (timeMode === "manual") {
        repopulationSelection = {
          selectionMode: "manual" as const,
          rateGyPerDay: Number(manualDprolif),
          kickOffDays: Number(manualTk),
          rationale: "Manual Dprolif/Tk from Treatment Gap UI",
        };
      } else {
        const parsedOverride =
          tkOverride.trim() === "" ? undefined : Number(tkOverride);

        repopulationSelection = {
          selectionMode: "evidence" as const,
          parameterRecordId: timeRecordId,
          ...(parsedOverride !== undefined
            ? { kickOffOverrideDays: parsedOverride }
            : {}),
        };
      }

      const baseline = buildTreatmentGapBaseline({
        endpointId,
        plannedSchedule: {
          fractions: n,
          dosePerFractionGy: d,
        },
        plannedOverallTreatmentDays,
        deliveredFractionsBeforeGap,
        gapDays: gap,
        ...(calendarScenario
          ? {
              uncompensatedOverallTreatmentDays:
                calendarScenario.uncompensatedOverallTreatmentDays,
            }
          : {}),
        alphaBetaSelection: alphaSelection,
        repopulationSelection,
      });

      const weekend = evaluatePreserveTimeStrategy(
        baseline,
        "weekend",
        calendarScenario
          ? {
              actualOverallTreatmentDays:
                calendarScenario.weekendOverallTreatmentDays,
            }
          : undefined,
      );

      let bid:
        | ReturnType<typeof evaluatePreserveTimeStrategy>
        | { error: string };
      try {
        bid = evaluatePreserveTimeStrategy(baseline, "bid", {
          bidInterfractionHours: Number(bidHours),
          ...(calendarScenario
            ? {
                actualOverallTreatmentDays:
                  calendarScenario.bidOverallTreatmentDays,
              }
            : {}),
        });
      } catch (error) {
        bid = {
          error:
            error instanceof Error
              ? error.message
              : tx(
                  language,
                  "Не удалось оценить вариант с двумя фракциями в сутки.",
                  "BID strategy could not be evaluated.",
                ),
        };
      }

      let doseCompensation:
        | ReturnType<typeof solveDoseCompensationStrategy>
        | { error: string };
      try {
        doseCompensation = solveDoseCompensationStrategy(
          baseline,
          {
            remainingFractionsToDeliver: Number(
              compRemainingFractions,
            ),
            actualOverallTreatmentDays: Number(compActualOtt),
          },
        );
      } catch (error) {
        doseCompensation = {
          error:
            error instanceof Error
              ? error.message
              : tx(
                  language,
                  "Не удалось рассчитать компенсацию дозой.",
                  "Dose compensation could not be solved.",
                ),
        };
      }

      return {
        baseline,
        calendarScenario,
        weekend,
        bid,
        doseCompensation,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : tx(
                language,
                "Не удалось построить сценарий компенсации перерыва в лечении.",
                "Treatment Gap scenario could not be constructed.",
              ),
      };
    }
  }, [
    endpointId,
    alphaMode,
    alphaRecordId,
    manualAlphaBeta,
    timeMode,
    timeRecordId,
    tkOverride,
    manualDprolif,
    manualTk,
    fractions,
    dosePerFraction,
    courseInputMode,
    calendarCalculation,
    plannedOtt,
    deliveredBeforeGap,
    gapDays,
    bidHours,
    compRemainingFractions,
    compActualOtt,
    language,
  ]);

  const hasError = "error" in calculation;

  return (
    <main className="gap-workspace">
      <section className="panel gap-config-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{tx(language, "перерывы в лечении", "treatment gap")}</span>
            <h2>
              {tx(
                language,
                "Исходный курс и прерывание",
                "Planned course and interruption",
              )}
            </h2>
          </div>
        </div>

        <label className="field">
          <span>
            {tx(language, "Опухолевый исход", "Tumour endpoint")}
          </span>
          <select
            value={endpointId}
            onChange={(event) => changeEndpoint(event.target.value)}
          >
            {tumourEndpoints.map((item) => (
              <option key={item.id} value={item.id}>
                {organLabel(language, item.organ)} ·{" "}
                {endpointLabel(language, item.id, item.endpoint)}
              </option>
            ))}
          </select>
        </label>

        <div className="gap-grid">
          <label className="field compact-field">
            <span>{tx(language, "План, n", "Planned n")}</span>
            <input
              type="number"
              min="1"
              step="1"
              value={fractions}
              onChange={(event) => setFractions(event.target.value)}
            />
          </label>
          <label className="field compact-field">
            <span>d, {gy}</span>
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
          <label className="field compact-field">
            <span>
              {tx(language, "Плановая общая продолжительность лечения, дни", "Planned OTT, days")}
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={plannedOtt}
              onChange={(event) => setPlannedOtt(event.target.value)}
            />
          </label>
          <label className="field compact-field">
            <span>
              {tx(
                language,
                "Фракций проведено до перерыва",
                "Fractions delivered before gap",
              )}
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={deliveredBeforeGap}
              onChange={(event) =>
                setDeliveredBeforeGap(event.target.value)
              }
            />
          </label>
          <label className="field compact-field">
            <span>
              {tx(language, "Продолжительность перерыва, дни", "Interruption, days")}
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={gapDays}
              onChange={(event) => setGapDays(event.target.value)}
            />
          </label>
        </div>

        <p className="field-note">
          {tx(
            language,
            "Общая продолжительность лечения — это длительность курса в календарных днях в той же конвенции, которая используется локально для клинического расчёта. На этом этапе HFC не пытается самостоятельно восстанавливать даты.",
            "OTT is the overall treatment duration in calendar days using the convention applied locally for the clinical calculation. HFC does not infer treatment dates at this stage.",
          )}
        </p>

        <div className="section-divider" />

        <div className="section-heading compact">
          <div>
            <span className="eyebrow">{tx(language, "радиобиология", "radiobiology")}</span>
            <h2>α/β + time-loss model</h2>
          </div>
        </div>

        <div className="segmented">
          <button
            type="button"
            className={alphaMode === "evidence" ? "selected" : ""}
            onClick={() => setAlphaMode("evidence")}
          >
            {tx(language, "α/β из доказательной базы", "Evidence α/β")}
          </button>
          <button
            type="button"
            className={alphaMode === "manual" ? "selected" : ""}
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
                  {formatUiNumber(language, record.valueGy, 2)} {gy}
                  {record.defaultEligible
                    ? " · preferred"
                    : " · alternative"}
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
              α/β = {formatUiNumber(language, alphaRecord.valueGy, 2)}{" "}
              {gy}
            </strong>
            {alphaRecord.ci95 ? (
              <span>
                95% CI{" "}
                {formatUiNumber(language, alphaRecord.ci95.low, 1)}–
                {formatUiNumber(language, alphaRecord.ci95.high, 1)}{" "}
                {gy}
              </span>
            ) : null}
            {alphaSource ? <small>{alphaSource.citation}</small> : null}
          </div>
        ) : null}

        <div className="segmented gap-segmented">
          <button
            type="button"
            className={timeMode === "evidence" ? "selected" : ""}
            onClick={() => setTimeMode("evidence")}
          >
            {tx(
              language,
              "Dprolif из доказательной базы",
              "Evidence Dprolif",
            )}
          </button>
          <button
            type="button"
            className={timeMode === "manual" ? "selected" : ""}
            onClick={() => setTimeMode("manual")}
          >
            {tx(
              language,
              "свои Dprolif / Tk",
              "custom Dprolif / Tk",
            )}
          </button>
        </div>

        {timeMode === "evidence" ? (
          <>
            <label className="field">
              <span>{tx(language, "Оценка временной поправки", "Time-loss estimate")}</span>
              <select
                value={timeRecordId}
                onChange={(event) => {
                  const id = event.target.value;
                  setTimeRecordId(id);
                  const next = repopulationRateEstimates.find(
                    (record) => record.id === id,
                  );
                  setTkOverride(
                    next?.kickOffDays?.toString() ?? "",
                  );
                }}
              >
                <option value="">
                  {tx(language, "— выбрать —", "— select —")}
                </option>
                {timeRecords.map((record) => (
                  <option key={record.id} value={record.id}>
                    {formatUiNumber(
                      language,
                      record.rateGyPerDay,
                      2,
                    )}{" "}
                    {gy}/{tx(language, "день", "day")}
                    {record.kickOffDays !== undefined
                      ? ` · Tk ${record.kickOffDays} d`
                      : tx(
                          language,
                          " · Tk не определён",
                          " · Tk not defined",
                        )}
                    {record.defaultEligible ? " · preferred" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>
                {tx(
                  language,
                  "Tk для этого расчёта, дни",
                  "Tk for this calculation, days",
                )}
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={tkOverride}
                placeholder={tx(
                  language,
                  "требуется, если в источнике нет Tk",
                  "required if the source provides no Tk",
                )}
                onChange={(event) =>
                  setTkOverride(event.target.value)
                }
              />
              <small>
                {tx(
                  language,
                  "Если значение отличается от публикации, HFC сохраняет источник Dprolif, но явно отмечает Tk как заданный пользователем.",
                  "If the value differs from the publication, HFC preserves Dprolif provenance but marks Tk as user-specified.",
                )}
              </small>
            </label>
          </>
        ) : (
          <div className="two-columns">
            <label className="field">
              <span>Dprolif, {gy} EQD₂/{tx(language, "день", "day")}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={manualDprolif}
                onChange={(event) =>
                  setManualDprolif(event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>Tk, {tx(language, "дни", "days")}</span>
              <input
                type="number"
                min="0"
                step="1"
                value={manualTk}
                onChange={(event) => setManualTk(event.target.value)}
              />
            </label>
          </div>
        )}

        {timeRecord && timeMode === "evidence" ? (
          <div className="evidence-mini">
            <strong>
              Dprolif ={" "}
              {formatUiNumber(language, timeRecord.rateGyPerDay, 2)}{" "}
              {gy} EQD₂/{tx(language, "день", "day")}
            </strong>
            <span>
              Tk{" "}
              {timeRecord.kickOffDays !== undefined
                ? `= ${timeRecord.kickOffDays} ${day}`
                : tx(
                    language,
                    "не определён однозначно",
                    "not uniquely defined",
                  )}
            </span>
            {timeSource ? <small>{timeSource.citation}</small> : null}
          </div>
        ) : null}

        <div className="section-divider" />

        <div className="section-heading compact">
          <div>
            <span className="eyebrow">{tx(language, "параметры стратегий", "strategy inputs")}</span>
            <h2>
              {tx(
                language,
                "Параметры компенсации",
                "Compensation inputs",
              )}
            </h2>
          </div>
        </div>

        <label className="field">
          <span>
            BID:{" "}
            {tx(
              language,
              "интервал между фракциями",
              "interfraction interval",
            )},{" "}
            {hour}
          </span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={bidHours}
            onChange={(event) => setBidHours(event.target.value)}
          />
          <small>
            {tx(
              language,
              "RCR: минимум 6 ч; BCR 2025 рекомендует максимально практичный интервал — около 8 ч и более, когда это возможно.",
              "RCR: minimum 6 h; BCR 2025 recommends the maximum practical interval, about 8 h or longer when feasible.",
            )}
          </small>
        </label>

        <div className="two-columns">
          <label className="field">
            <span>
              {tx(
                language,
                "Число фракций после перерыва для компенсации дозой",
                "Post-gap fractions for dose compensation",
              )}
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={compRemainingFractions}
              onChange={(event) =>
                setCompRemainingFractions(event.target.value)
              }
            />
          </label>
          <label className="field">
            <span>
              {tx(
                language,
                "Фактическая общая продолжительность лечения, дни",
                "Actual OTT, days",
              )}
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={compActualOtt}
              onChange={(event) =>
                setCompActualOtt(event.target.value)
              }
            />
          </label>
        </div>
      </section>

      <section className="panel gap-results-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{tx(language, "сравнение стратегий", "strategy comparison")}</span>
            <h2>
              {tx(
                language,
                "Что происходит с EQD₂ опухоли?",
                "What happens to tumour EQD₂?",
              )}
            </h2>
          </div>
        </div>

        {hasError ? (
          <div className="empty-state">
            <strong>
              {tx(
                language,
                "Нужно уточнить параметры",
                "Inputs need review",
              )}
            </strong>
            <p>{calculation.error}</p>
          </div>
        ) : (
          <>
            <div className="gap-summary-grid">
              <div className="gap-summary-card">
                <span>
                  {tx(
                    language,
                    "Плановый эффективный EQD₂",
                    "Planned effective EQD₂",
                  )}
                </span>
                <strong>
                  {formatUiNumber(
                    language,
                    calculation.baseline.plannedEffectiveEqd2Gy,
                  )}{" "}
                  {gy}
                </strong>
                <small>
                  raw{" "}
                  {formatUiNumber(
                    language,
                    calculation.baseline.plannedRawEqd2Gy,
                  )}{" "}
                  − time{" "}
                  {formatUiNumber(
                    language,
                    calculation.baseline.plannedTimePenaltyGy,
                  )}
                </small>
              </div>

              <div className="gap-summary-card alert">
                <span>
                  {tx(language, "Без компенсации", "No compensation")}
                </span>
                <strong>
                  {formatUiNumber(
                    language,
                    calculation.baseline.uncompensatedEffectiveEqd2Gy,
                  )}{" "}
                  {gy}
                </strong>
                <small>
                  Δ{" "}
                  {signed(
                    language,
                    calculation.baseline
                      .uncompensatedDeltaEffectiveEqd2Gy,
                  )}{" "}
                  {gy} · OTT{" "}
                  {
                    calculation.baseline
                      .uncompensatedOverallTreatmentDays
                  }{" "}
                  d
                </small>
              </div>
            </div>

            <div className="strategy-list">
              <article className="strategy-card preferred-strategy">
                <div className="strategy-card-top">
                  <div>
                    <span className="eyebrow">strategy 1</span>
                    <h3>{tx(language, "Компенсация в выходные", "Weekend recovery")}</h3>
                  </div>
                  <span className="strategy-tag">{tx(language, "приоритет RCR", "RCR first-line")}</span>
                </div>
                <p>
                  {tx(
                    language,
                    "Все исходные фракции и доза за фракцию сохраняются, а курс возвращается к плановой общей продолжительности лечения.",
                    "All original fractions and dose per fraction are preserved and the course returns to the planned OTT.",
                  )}
                </p>
                <div className="strategy-result">
                  <span>Δ {tx(language, "эффективного EQD₂", "effective EQD₂")}</span>
                  <strong>
                    {signed(
                      language,
                      calculation.weekend.deltaEffectiveEqd2Gy,
                    )}{" "}
                    {gy}
                  </strong>
                </div>
                <ul>
                  {calculation.weekend.warnings.map((warning) => (
                    <li key={warning}>
                      {localizeWarning(language, warning)}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="strategy-card">
                <div className="strategy-card-top">
                  <div>
                    <span className="eyebrow">strategy 2</span>
                    <h3>{tx(language, "Компенсация двумя фракциями в сутки", "BID recovery")}</h3>
                  </div>
                  <span className="strategy-tag">{tx(language, "при соблюдении условий", "conditional")}</span>
                </div>
                {"error" in calculation.bid ? (
                  <div className="inline-alert">
                    {calculation.bid.error}
                  </div>
                ) : (
                  <>
                    <div className="strategy-result">
                      <span>Δ {tx(language, "эффективного EQD₂", "effective EQD₂")}</span>
                      <strong>
                        {signed(
                          language,
                          calculation.bid.deltaEffectiveEqd2Gy,
                        )}{" "}
                        {gy}
                      </strong>
                    </div>
                    <ul>
                      {calculation.bid.warnings.map((warning) => (
                        <li key={warning}>
                          {localizeWarning(language, warning)}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </article>

              <article className="strategy-card">
                <div className="strategy-card-top">
                  <div>
                    <span className="eyebrow">strategy 3</span>
                    <h3>{tx(language, "Радиобиологическая компенсация дозой", "Biological dose compensation")}</h3>
                  </div>
                  <span className="strategy-tag">{tx(language, "последний вариант", "last resort")}</span>
                </div>

                {"error" in calculation.doseCompensation ? (
                  <div className="inline-alert">
                    {calculation.doseCompensation.error}
                  </div>
                ) : (
                  <>
                    <div className="strategy-metrics">
                      <div>
                        <span>
                          {tx(language, "Новая доза за фракцию", "New d")}
                        </span>
                        <strong>
                          {formatUiNumber(
                            language,
                            calculation.doseCompensation
                              .requiredDosePerFractionGy,
                            3,
                          )}{" "}
                          {gy}
                        </strong>
                      </div>
                      <div>
                        <span>
                          {tx(
                            language,
                            "Итоговая физическая доза",
                            "Final physical dose",
                          )}
                        </span>
                        <strong>
                          {formatUiNumber(
                            language,
                            calculation.doseCompensation
                              .finalPhysicalDoseGy,
                          )}{" "}
                          {gy}
                        </strong>
                      </div>
                      <div>
                        <span>Δ {tx(language, "эффективного EQD₂", "effective EQD₂")}</span>
                        <strong>
                          {signed(
                            language,
                            calculation.doseCompensation
                              .deltaEffectiveEqd2Gy,
                          )}{" "}
                          {gy}
                        </strong>
                      </div>
                    </div>

                    <ul>
                      {calculation.doseCompensation.warnings.map(
                        (warning) => (
                          <li key={warning}>
                            {localizeWarning(language, warning)}
                          </li>
                        ),
                      )}
                    </ul>
                  </>
                )}
              </article>
            </div>

            {calculation.baseline.warnings.length ? (
              <div className="warning-card">
                <strong>
                  {tx(
                    language,
                    "Предупреждения модели и доказательной базы",
                    "Model / evidence warnings",
                  )}
                </strong>
                <ul>
                  {calculation.baseline.warnings.map((warning) => (
                    <li key={warning}>
                      {localizeWarning(language, warning)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="gap-method-note">
              <strong>
                {tx(language, "Приоритет метода", "Method priority")}
              </strong>
              <p>
                {tx(
                  language,
                  "В соответствии с RCR сначала следует пытаться сохранить исходную общую продолжительность лечения и дозу за фракцию: использовать лечение в выходные дни или, если допустимо, две фракции в сутки. Радиобиологическое увеличение дозы рассматривается, когда ускоренная компенсация невозможна.",
                  "In line with RCR guidance, the first goal is to preserve the original OTT and dose per fraction using weekend treatment or, when appropriate, BID. Biological dose escalation is considered when accelerated compensation is not feasible.",
                )}
              </p>
            </div>
          </>
        )}

        <div className="safety-note">
          <strong>
            {tx(
              language,
              "Модуль «Перерывы в лечении» v0.1 моделирует эффект для опухоли.",
              "Treatment Gap v0.1 models tumour effect.",
            )}
          </strong>
          <p>
            {tx(
              language,
              "Увеличение дозы за фракцию не должно приниматься без отдельной оценки органов риска, неполного восстановления, ограничений доза–объём и клинической допустимости. Следующим этапом станет компенсация с явным учётом органов риска.",
              "An increase in d should not be accepted without a separate assessment of OARs, incomplete repair, dose-volume constraints, and clinical acceptability. OAR-aware compensation is the next development step.",
            )}
          </p>
        </div>
      </section>
    </main>
  );
}
