import {
  useCallback,
  useMemo,
  useState,
} from "react";
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
import { buildTreatmentGapAuditRecord } from "../audit/treatmentGapAudit.js";
import type { TreatmentGapOarAuditEntry } from "../audit/treatmentGapOarAudit.js";
import { serializeAuditRecord } from "../audit/common.js";
import { openPrintableAuditReport } from "../audit/report.js";
import {
  buildTreatmentCalendarScenario,
  type TreatmentCalendarScenario,
} from "../workflows/treatmentCalendar.js";
import { confidenceIntervalLabel, estimateChoiceLabel, localizeWarning, tx } from "./i18n.js";
import { TreatmentCalendarPreview } from "./TreatmentCalendarPreview.js";
import { TreatmentGapOarPanel } from "./TreatmentGapOarPanel.js";
import { downloadJsonFile } from "./download.js";
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
  const initialTimeRecords = getRepopulationEstimates(endpointId);
  const [timeMode, setTimeMode] = useState<TimeMode>(
    preferredTime || initialTimeRecords.length > 0
      ? "evidence"
      : "manual",
  );
  const [timeRecordId, setTimeRecordId] = useState(
    preferredTime?.id ?? "",
  );
  const [tkOverride, setTkOverride] = useState(
    preferredTime?.kickOffDays?.toString() ?? "",
  );
  const [manualDprolif, setManualDprolif] = useState("");
  const [manualTk, setManualTk] = useState("");

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
  const [oarAuditEntries, setOarAuditEntries] =
    useState<TreatmentGapOarAuditEntry[]>([]);

  const handleOarAuditEntriesChange = useCallback(
    (entries: TreatmentGapOarAuditEntry[]) => {
      setOarAuditEntries(entries);
    },
    [],
  );

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
    const nextTimeRecords = getRepopulationEstimates(nextId);
    setTimeMode(
      nextTime || nextTimeRecords.length > 0
        ? "evidence"
        : "manual",
    );
    setTimeRecordId(nextTime?.id ?? "");
    setTkOverride(nextTime?.kickOffDays?.toString() ?? "");
    setManualDprolif("");
    setManualTk("");
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
        if (
          manualDprolif.trim() === "" ||
          manualTk.trim() === ""
        ) {
          throw new Error(
            tx(
              language,
              "Введите Dprolif и Tk явно или выберите опубликованную модель.",
              "Enter Dprolif and Tk explicitly or select a published model.",
            ),
          );
        }

        repopulationSelection = {
          selectionMode: "manual" as const,
          rateGyPerDay: Number(manualDprolif),
          kickOffDays: Number(manualTk),
          rationale: "Manual Dprolif/Tk from Treatment Gap UI",
        };
      } else {
        if (timeRecordId.trim() === "") {
          throw new Error(
            tx(
              language,
              "Выберите опубликованную модель Dprolif/Tk.",
              "Select a published Dprolif/Tk model.",
            ),
          );
        }

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

      const doseCompensationInput = {
        remainingFractionsToDeliver: Number(
          compRemainingFractions,
        ),
        actualOverallTreatmentDays: Number(compActualOtt),
      };

      let doseCompensation:
        | ReturnType<typeof solveDoseCompensationStrategy>
        | { error: string };
      try {
        doseCompensation = solveDoseCompensationStrategy(
          baseline,
          doseCompensationInput,
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

      const excludedDates = excludedDatesText
        .split(/[\s,;]+/)
        .map((value) => value.trim())
        .filter(Boolean);

      return {
        baseline,
        calendarScenario,
        weekend,
        bid,
        doseCompensation,
        alphaSelection,
        repopulationSelection,
        doseCompensationInput,
        bidInterfractionHours: Number(bidHours),
        ...(calendarScenario
          ? {
              calendarInput: {
                startDate,
                fractions: n,
                gapStartDate,
                gapEndDate,
                ...(excludedDates.length > 0
                  ? { excludedDates }
                  : {}),
              },
            }
          : {
              manualDurationInput: {
                plannedOverallTreatmentDays,
                deliveredFractionsBeforeGap,
                gapDays: gap,
              },
            }),
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
    startDate,
    gapStartDate,
    gapEndDate,
    excludedDatesText,
    language,
  ]);

  const hasError = "error" in calculation;

  function currentTreatmentGapAudit() {
    if (hasError) return undefined;

    return buildTreatmentGapAuditRecord({
      generatedAtIso: new Date().toISOString(),
      endpointId,
      courseInputMode,
      alphaSelection: calculation.alphaSelection,
      repopulationSelection:
        calculation.repopulationSelection,
      baseline: calculation.baseline,
      weekend: calculation.weekend,
      bid: calculation.bid,
      doseCompensation:
        calculation.doseCompensation,
      bidInterfractionHours:
        calculation.bidInterfractionHours,
      doseCompensationInput:
        calculation.doseCompensationInput,
      oars: oarAuditEntries,
      ...("calendarInput" in calculation &&
      calculation.calendarInput
        ? { calendarInput: calculation.calendarInput }
        : {}),
      ...(calculation.calendarScenario
        ? {
            calendarScenario:
              calculation.calendarScenario,
          }
        : {}),
      ...("manualDurationInput" in calculation &&
      calculation.manualDurationInput
        ? {
            manualDurationInput:
              calculation.manualDurationInput,
          }
        : {}),
    });
  }

  function downloadTreatmentGapAudit() {
    const record = currentTreatmentGapAudit();
    if (!record) return;

    downloadJsonFile(
      "HFC_treatment_gap_audit",
      serializeAuditRecord(record),
      record.generatedAtIso,
    );
  }

  function printTreatmentGapAudit() {
    const record = currentTreatmentGapAudit();
    if (!record) return;
    openPrintableAuditReport(record, language);
  }

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
        </div>

        <div className="segmented gap-input-mode">
          <button
            type="button"
            className={courseInputMode === "calendar" ? "selected" : ""}
            onClick={() => setCourseInputMode("calendar")}
          >
            {tx(language, "По календарю", "Calendar")}
          </button>
          <button
            type="button"
            className={courseInputMode === "manual" ? "selected" : ""}
            onClick={() => setCourseInputMode("manual")}
          >
            {tx(language, "Ввести длительность вручную", "Manual duration")}
          </button>
        </div>

        {courseInputMode === "calendar" ? (
          <>
            <div className="calendar-input-grid">
              <label className="field compact-field">
                <span>
                  {tx(language, "Начало лечения", "Treatment start")}
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </label>
              <label className="field compact-field">
                <span>
                  {tx(language, "Начало перерыва", "Gap starts")}
                </span>
                <input
                  type="date"
                  value={gapStartDate}
                  onChange={(event) =>
                    setGapStartDate(event.target.value)
                  }
                />
              </label>
              <label className="field compact-field">
                <span>
                  {tx(language, "Конец перерыва", "Gap ends")}
                </span>
                <input
                  type="date"
                  value={gapEndDate}
                  onChange={(event) =>
                    setGapEndDate(event.target.value)
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>
                {tx(
                  language,
                  "Дополнительные нерабочие даты",
                  "Additional unavailable dates",
                )}
              </span>
              <input
                value={excludedDatesText}
                placeholder={tx(
                  language,
                  "например: 2026-11-04, 2026-11-12",
                  "e.g. 2026-11-04, 2026-11-12",
                )}
                onChange={(event) =>
                  setExcludedDatesText(event.target.value)
                }
              />
              <small>
                {tx(
                  language,
                  "Выходные суббота/воскресенье учитываются автоматически. Здесь указываются плановые нерабочие даты, например праздники. Неплановый технический простой следует включать в период перерыва, а не исключать из исходного плана.",
                  "Saturday/Sunday weekends are handled automatically. Add public holidays, maintenance days, or other dates when treatment is unavailable.",
                )}
              </small>
            </label>

            {calendarCalculation.error ? (
              <div className="inline-alert">
                {calendarCalculation.error}
              </div>
            ) : calendarCalculation.scenario ? (
              <>
                <div className="calendar-summary-grid">
                <div>
                  <span>
                    {tx(language, "Плановый конец", "Planned end")}
                  </span>
                  <strong>
                    {calendarCalculation.scenario.plannedEndDate}
                  </strong>
                  <small>
                    {calendarCalculation.scenario.plannedOverallTreatmentDays}{" "}
                    {tx(language, "дней", "days")}
                  </small>
                </div>
                <div>
                  <span>
                    {tx(
                      language,
                      "Пропущено фракций",
                      "Missed fractions",
                    )}
                  </span>
                  <strong>
                    {calendarCalculation.scenario.missedPlannedFractions}
                  </strong>
                  <small>
                    {calendarCalculation.scenario.gapCalendarDays}{" "}
                    {tx(
                      language,
                      "календарных дней перерыва",
                      "calendar gap days",
                    )}
                  </small>
                </div>
                <div>
                  <span>
                    {tx(
                      language,
                      "Без компенсации",
                      "No compensation",
                    )}
                  </span>
                  <strong>
                    {
                      calendarCalculation.scenario
                        .uncompensatedOverallTreatmentDays
                    }{" "}
                    {tx(language, "дней", "days")}
                  </strong>
                  <small>
                    {calendarCalculation.scenario.uncompensated.at(-1)?.date}
                  </small>
                </div>
                <div>
                  <span>
                    {tx(
                      language,
                      "Лечение в выходные",
                      "Weekend recovery",
                    )}
                  </span>
                  <strong>
                    {
                      calendarCalculation.scenario
                        .weekendOverallTreatmentDays
                    }{" "}
                    {tx(language, "дней", "days")}
                  </strong>
                  <small>
                    {calendarCalculation.scenario.weekendRecoveredFractions}{" "}
                    {tx(
                      language,
                      "фракций в выходные",
                      "weekend fractions",
                    )}
                  </small>
                </div>
                <div>
                  <span>
                    {tx(
                      language,
                      "Две фракции в сутки",
                      "BID recovery",
                    )}
                  </span>
                  <strong>
                    {calendarCalculation.scenario.bidOverallTreatmentDays}{" "}
                    {tx(language, "дней", "days")}
                  </strong>
                  <small>
                    {calendarCalculation.scenario.bidDays}{" "}
                    {tx(
                      language,
                      "дней с двумя фракциями",
                      "BID days",
                    )}
                  </small>
                </div>
              </div>
                <TreatmentCalendarPreview
                  language={language}
                  scenario={calendarCalculation.scenario}
                />
              </>
            ) : null}
          </>
        ) : (
          <>
            <div className="gap-grid">
              <label className="field compact-field">
                <span>
                  {tx(
                    language,
                    "Плановая общая продолжительность лечения, дни",
                    "Planned OTT, days",
                  )}
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
                  {tx(
                    language,
                    "Продолжительность перерыва, дни",
                    "Interruption, days",
                  )}
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
                "При ручном режиме HFC использует введённую общую продолжительность лечения и не восстанавливает реальные даты фракций.",
                "In manual mode HFC uses the entered treatment duration and does not reconstruct actual fraction dates.",
              )}
            </p>
          </>
        )}

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
              α/β = {formatUiNumber(language, alphaRecord.valueGy, 2)}{" "}
              {gy}
            </strong>
            {alphaRecord.ci95 ? (
              <span>
                {confidenceIntervalLabel(language)}{" "}
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
                    {record.defaultEligible
                      ? " · " + estimateChoiceLabel(language, true)
                      : ""}
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
          {!hasError ? (
            <div className="audit-actions">
              <button
                type="button"
                className="secondary-button audit-download-button"
                onClick={downloadTreatmentGapAudit}
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
                onClick={printTreatmentGapAudit}
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

            <TreatmentGapOarPanel
              language={language}
              onAuditEntriesChange={
                handleOarAuditEntriesChange
              }
              {...(calculation.calendarScenario
                ? {
                    calendarScenario:
                      calculation.calendarScenario,
                  }
                : {})}
              plannedFractions={
                calculation.baseline.plannedSchedule.fractions
              }
              deliveredFractionsBeforeGap={
                calculation.baseline.deliveredFractionsBeforeGap
              }
              plannedTargetDosePerFractionGy={
                calculation.baseline.plannedSchedule
                  .dosePerFractionGy
              }
              bidInterfractionHours={Number(bidHours)}
              {...("error" in calculation.doseCompensation
                ? {}
                : {
                    doseCompensation:
                      calculation.doseCompensation,
                  })}
            />
          </>
        )}

        <div className="safety-note">
          <strong>
            {tx(
              language,
              "Модуль моделирует опухолевый эффект и отдельно позволяет оценить выбранную дозовую метрику органа риска.",
              "Treatment Gap v0.1 models tumour effect.",
            )}
          </strong>
          <p>
            {tx(
              language,
              "Даже при совпадении EQD₂ опухоли клиническая допустимость зависит от дозы на органы риска, ограничений доза–объём, геометрии и других факторов. Панель органа риска не заменяет DVH и клинические ограничения.",
              "An increase in d should not be accepted without a separate assessment of OARs, incomplete repair, dose-volume constraints, and clinical acceptability. OAR-aware compensation is the next development step.",
            )}
          </p>
        </div>
      </section>
    </main>
  );
}
