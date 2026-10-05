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
import { endpointLabelRu, organLabelRu } from "./labels.js";

type ParameterMode = "evidence" | "manual";
type TimeMode = "evidence" | "manual";

function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function signed(value: number, digits = 2): string {
  if (Math.abs(value) < 1e-10) return "0";
  return `${value > 0 ? "+" : "−"}${formatNumber(Math.abs(value), digits)}`;
}

function sourceFor(sourceId: string | undefined) {
  if (!sourceId) return undefined;
  return sources.find((source) => source.id === sourceId);
}

export function TreatmentGapView() {
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
  const [plannedOtt, setPlannedOtt] = useState("46");
  const [deliveredBeforeGap, setDeliveredBeforeGap] =
    useState("20");
  const [gapDays, setGapDays] = useState("5");

  const [bidHours, setBidHours] = useState("8");
  const [compRemainingFractions, setCompRemainingFractions] =
    useState("15");
  const [compActualOtt, setCompActualOtt] = useState("51");

  const endpoint = endpoints.find((item) => item.id === endpointId);
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
      const plannedOverallTreatmentDays = Number(plannedOtt);
      const deliveredFractionsBeforeGap = Number(deliveredBeforeGap);
      const gap = Number(gapDays);

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
        alphaBetaSelection: alphaSelection,
        repopulationSelection,
      });

      const weekend = evaluatePreserveTimeStrategy(
        baseline,
        "weekend",
      );

      let bid:
        | ReturnType<typeof evaluatePreserveTimeStrategy>
        | { error: string };
      try {
        bid = evaluatePreserveTimeStrategy(baseline, "bid", {
          bidInterfractionHours: Number(bidHours),
        });
      } catch (error) {
        bid = {
          error:
            error instanceof Error
              ? error.message
              : "Не удалось оценить BID.",
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
              : "Не удалось решить dose compensation.",
        };
      }

      return {
        baseline,
        weekend,
        bid,
        doseCompensation,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Не удалось построить Treatment Gap scenario.",
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
    plannedOtt,
    deliveredBeforeGap,
    gapDays,
    bidHours,
    compRemainingFractions,
    compActualOtt,
  ]);

  const hasError = "error" in calculation;

  return (
    <main className="gap-workspace">
      <section className="panel gap-config-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">treatment gap</span>
            <h2>Исходный курс и прерывание</h2>
          </div>
        </div>

        <label className="field">
          <span>Опухолевый endpoint</span>
          <select
            value={endpointId}
            onChange={(event) => changeEndpoint(event.target.value)}
          >
            {tumourEndpoints.map((item) => (
              <option key={item.id} value={item.id}>
                {organLabelRu(item.organ)} ·{" "}
                {endpointLabelRu(item.id, item.endpoint)}
              </option>
            ))}
          </select>
        </label>

        <div className="gap-grid">
          <label className="field compact-field">
            <span>План, n</span>
            <input
              type="number"
              min="1"
              step="1"
              value={fractions}
              onChange={(event) => setFractions(event.target.value)}
            />
          </label>
          <label className="field compact-field">
            <span>d, Гр</span>
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
            <span>Плановый OTT, дни</span>
            <input
              type="number"
              min="1"
              step="1"
              value={plannedOtt}
              onChange={(event) => setPlannedOtt(event.target.value)}
            />
          </label>
          <label className="field compact-field">
            <span>Проведено до перерыва</span>
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
            <span>Прерывание, дни</span>
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
          OTT — общая продолжительность курса в календарных днях в той же
          конвенции, которая используется локально для клинического
          расчёта. HFC не пытается сам угадывать даты на этом этапе.
        </p>

        <div className="section-divider" />

        <div className="section-heading compact">
          <div>
            <span className="eyebrow">radiobiology</span>
            <h2>α/β и time-loss model</h2>
          </div>
        </div>

        <div className="segmented">
          <button
            type="button"
            className={alphaMode === "evidence" ? "selected" : ""}
            onClick={() => setAlphaMode("evidence")}
          >
            α/β из evidence
          </button>
          <button
            type="button"
            className={alphaMode === "manual" ? "selected" : ""}
            onClick={() => setAlphaMode("manual")}
          >
            своё α/β
          </button>
        </div>

        {alphaMode === "evidence" ? (
          <label className="field">
            <span>α/β estimate</span>
            <select
              value={alphaRecordId}
              onChange={(event) =>
                setAlphaRecordId(event.target.value)
              }
            >
              <option value="">— выбрать —</option>
              {alphaRecords.map((record) => (
                <option key={record.id} value={record.id}>
                  {formatNumber(record.valueGy, 2)} Гр
                  {record.defaultEligible ? " · preferred" : " · alternative"}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="field">
            <span>Своё α/β, Гр</span>
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
              α/β = {formatNumber(alphaRecord.valueGy, 2)} Гр
            </strong>
            {alphaRecord.ci95 ? (
              <span>
                95% CI {formatNumber(alphaRecord.ci95.low, 1)}–
                {formatNumber(alphaRecord.ci95.high, 1)} Гр
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
            Dprolif из evidence
          </button>
          <button
            type="button"
            className={timeMode === "manual" ? "selected" : ""}
            onClick={() => setTimeMode("manual")}
          >
            свой Dprolif / Tk
          </button>
        </div>

        {timeMode === "evidence" ? (
          <>
            <label className="field">
              <span>Time-loss estimate</span>
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
                <option value="">— выбрать —</option>
                {timeRecords.map((record) => (
                  <option key={record.id} value={record.id}>
                    {formatNumber(record.rateGyPerDay, 2)} Гр/день
                    {record.kickOffDays !== undefined
                      ? ` · Tk ${record.kickOffDays} d`
                      : " · Tk не определён"}
                    {record.defaultEligible ? " · preferred" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Tk для этого расчёта, дни</span>
              <input
                type="number"
                min="0"
                step="1"
                value={tkOverride}
                placeholder="требуется, если в источнике нет Tk"
                onChange={(event) =>
                  setTkOverride(event.target.value)
                }
              />
              <small>
                Если значение отличается от публикации, HFC сохраняет
                provenance Dprolif, но маркирует Tk как user-specified.
              </small>
            </label>
          </>
        ) : (
          <div className="two-columns">
            <label className="field">
              <span>Dprolif, Гр EQD₂/день</span>
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
              <span>Tk, дни</span>
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
              Dprolif = {formatNumber(timeRecord.rateGyPerDay, 2)} Гр
              EQD₂/день
            </strong>
            <span>
              Tk{" "}
              {timeRecord.kickOffDays !== undefined
                ? `= ${timeRecord.kickOffDays} дней`
                : "не определён однозначно"}
            </span>
            {timeSource ? <small>{timeSource.citation}</small> : null}
          </div>
        ) : null}

        <div className="section-divider" />

        <div className="section-heading compact">
          <div>
            <span className="eyebrow">strategy inputs</span>
            <h2>Параметры компенсации</h2>
          </div>
        </div>

        <label className="field">
          <span>BID: интервал между фракциями, ч</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={bidHours}
            onChange={(event) => setBidHours(event.target.value)}
          />
          <small>
            RCR: минимум 6 ч; BCR 2025 рекомендует максимально практичный
            интервал, около 8 ч и более, когда это возможно.
          </small>
        </label>

        <div className="two-columns">
          <label className="field">
            <span>Фракций после gap для dose-compensation</span>
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
            <span>Фактический OTT, дни</span>
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
            <span className="eyebrow">strategy comparison</span>
            <h2>Что происходит с tumour EQD₂?</h2>
          </div>
        </div>

        {hasError ? (
          <div className="empty-state">
            <strong>Нужно уточнить параметры</strong>
            <p>{calculation.error}</p>
          </div>
        ) : (
          <>
            <div className="gap-summary-grid">
              <div className="gap-summary-card">
                <span>Плановый effective EQD₂</span>
                <strong>
                  {formatNumber(
                    calculation.baseline.plannedEffectiveEqd2Gy,
                  )}{" "}
                  Гр
                </strong>
                <small>
                  raw{" "}
                  {formatNumber(
                    calculation.baseline.plannedRawEqd2Gy,
                  )}{" "}
                  − time{" "}
                  {formatNumber(
                    calculation.baseline.plannedTimePenaltyGy,
                  )}
                </small>
              </div>

              <div className="gap-summary-card alert">
                <span>Без компенсации</span>
                <strong>
                  {formatNumber(
                    calculation.baseline.uncompensatedEffectiveEqd2Gy,
                  )}{" "}
                  Гр
                </strong>
                <small>
                  Δ{" "}
                  {signed(
                    calculation.baseline
                      .uncompensatedDeltaEffectiveEqd2Gy,
                  )}{" "}
                  Гр · OTT{" "}
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
                    <h3>Weekend recovery</h3>
                  </div>
                  <span className="strategy-tag">RCR first-line</span>
                </div>
                <p>
                  Все исходные фракции и d сохраняются, курс возвращается
                  к плановому OTT.
                </p>
                <div className="strategy-result">
                  <span>Δ effective EQD₂</span>
                  <strong>
                    {signed(
                      calculation.weekend.deltaEffectiveEqd2Gy,
                    )}{" "}
                    Гр
                  </strong>
                </div>
                <ul>
                  {calculation.weekend.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </article>

              <article className="strategy-card">
                <div className="strategy-card-top">
                  <div>
                    <span className="eyebrow">strategy 2</span>
                    <h3>BID recovery</h3>
                  </div>
                  <span className="strategy-tag">conditional</span>
                </div>
                {"error" in calculation.bid ? (
                  <div className="inline-alert">
                    {calculation.bid.error}
                  </div>
                ) : (
                  <>
                    <div className="strategy-result">
                      <span>Δ effective EQD₂</span>
                      <strong>
                        {signed(
                          calculation.bid.deltaEffectiveEqd2Gy,
                        )}{" "}
                        Гр
                      </strong>
                    </div>
                    <ul>
                      {calculation.bid.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </>
                )}
              </article>

              <article className="strategy-card">
                <div className="strategy-card-top">
                  <div>
                    <span className="eyebrow">strategy 3</span>
                    <h3>Biological dose compensation</h3>
                  </div>
                  <span className="strategy-tag">last resort</span>
                </div>

                {"error" in calculation.doseCompensation ? (
                  <div className="inline-alert">
                    {calculation.doseCompensation.error}
                  </div>
                ) : (
                  <>
                    <div className="strategy-metrics">
                      <div>
                        <span>Новый d</span>
                        <strong>
                          {formatNumber(
                            calculation.doseCompensation
                              .requiredDosePerFractionGy,
                            3,
                          )}{" "}
                          Гр
                        </strong>
                      </div>
                      <div>
                        <span>Итоговая физическая доза</span>
                        <strong>
                          {formatNumber(
                            calculation.doseCompensation
                              .finalPhysicalDoseGy,
                          )}{" "}
                          Гр
                        </strong>
                      </div>
                      <div>
                        <span>Δ effective EQD₂</span>
                        <strong>
                          {signed(
                            calculation.doseCompensation
                              .deltaEffectiveEqd2Gy,
                          )}{" "}
                          Гр
                        </strong>
                      </div>
                    </div>

                    <ul>
                      {calculation.doseCompensation.warnings.map(
                        (warning) => (
                          <li key={warning}>{warning}</li>
                        ),
                      )}
                    </ul>
                  </>
                )}
              </article>
            </div>

            {calculation.baseline.warnings.length ? (
              <div className="warning-card">
                <strong>Model / evidence warnings</strong>
                <ul>
                  {calculation.baseline.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="gap-method-note">
              <strong>Приоритет метода</strong>
              <p>
                В соответствии с RCR, сначала следует пытаться сохранить
                исходные OTT и dose/fraction: weekend treatment или, если
                допустимо, BID. Радиобиологическое увеличение дозы —
                вариант, когда ускоренная компенсация невозможна.
              </p>
            </div>
          </>
        )}

        <div className="safety-note">
          <strong>Treatment Gap v0.1 моделирует tumour effect.</strong>
          <p>
            Увеличение d не должно приниматься без отдельной оценки OAR,
            incomplete repair, dose-volume constraints и клинической
            допустимости. OAR-aware compensation будет следующим этапом.
          </p>
        </div>
      </section>
    </main>
  );
}
