import { useMemo, useState } from "react";
import {
  alphaBetaEstimates,
  endpoints,
  sources,
} from "../data/evidence/v0.1/index.js";
import type { DoseMetric, DoseMetricKind } from "../domain/constraints.js";
import type {
  CumulativeDoseStrategy,
  PreviousDoseDataAvailability,
  RegistrationSuitability,
  ReirradiationCourse,
} from "../domain/reirradiation.js";
import {
  getAlphaBetaEstimates,
  getPreferredAlphaBetaEstimate,
} from "../evidence/alphaBetaRegistry.js";
import {
  evaluateEvidenceReirradiationScenario,
  solveEvidenceRemainingEqd2Budget,
} from "../workflows/evidenceReirradiation.js";
import { assessHytecSpinalCordReirradiation } from "../workflows/reirradiationGuidance.js";
import {
  estimateChoiceLabel,
  localizeWarning,
  tx,
} from "./i18n.js";
import {
  endpointLabel,
  formatUiNumber,
  organLabel,
  type Language,
} from "./labels.js";

type ParameterMode = "evidence" | "manual";
type RecoveryMode = "none" | "manual";

interface UiPreviousCourse {
  id: string;
  label: string;
  fractions: string;
  dosePerFractionGy: string;
  intervalMonths: string;
  recoveryMode: RecoveryMode;
  recoveryPercent: string;
  recoveryRationale: string;
}

function sourceFor(sourceId: string | undefined) {
  if (!sourceId) return undefined;
  return sources.find((source) => source.id === sourceId);
}

function strategyLabel(
  language: Language,
  value: CumulativeDoseStrategy,
): string {
  switch (value) {
    case "direct-point-sum":
      return tx(
        language,
        "Прямое суммирование точечной дозы",
        "Direct point-dose summation",
      );
    case "overlap-point-sum":
      return tx(
        language,
        "Точечное суммирование в области перекрытия",
        "Point-dose summation in overlap",
      );
    case "conservative-near-max":
      return tx(
        language,
        "Консервативное суммирование околомаксимальных доз",
        "Conservative near-maximum summation",
      );
    case "image-registration-3d":
      return tx(
        language,
        "Трёхмерное суммирование с регистрацией",
        "Image-registration-based 3D accumulation",
      );
  }
}

function classificationLabel(
  language: Language,
  value: "type-I" | "type-II" | "repeat-irradiation",
): string {
  switch (value) {
    case "type-I":
      return tx(
        language,
        "Повторное облучение типа I",
        "Type I reirradiation",
      );
    case "type-II":
      return tx(
        language,
        "Повторное облучение типа II",
        "Type II reirradiation",
      );
    case "repeat-irradiation":
      return tx(
        language,
        "Повторное облучение вне определения ESTRO–EORTC",
        "Repeat irradiation outside the reirradiation definition",
      );
  }
}

function metricLabel(
  language: Language,
  metric: DoseMetric,
): string {
  if (metric.kind === "custom") {
    return (
      metric.customLabel ||
      tx(language, "Другая дозовая метрика", "Custom dose metric")
    );
  }
  return metric.kind;
}

export function ReirradiationView({
  language,
}: {
  language: Language;
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
    useState("subcutis-fibrosis");
  const initialPreferred =
    getPreferredAlphaBetaEstimate(endpointId);
  const [parameterMode, setParameterMode] =
    useState<ParameterMode>(
      initialPreferred ? "evidence" : "manual",
    );
  const [recordId, setRecordId] = useState(
    initialPreferred?.id ?? "",
  );
  const [manualAlphaBeta, setManualAlphaBeta] =
    useState("3");

  const [metricKind, setMetricKind] =
    useState<Exclude<DoseMetricKind, "Vx" | "mean-dose">>(
      "D0.1cc",
    );
  const [customMetricLabel, setCustomMetricLabel] =
    useState("");

  const [previousCourses, setPreviousCourses] = useState<
    UiPreviousCourse[]
  >([
    {
      id: "prior-1",
      label: "Предыдущий курс 1",
      fractions: "30",
      dosePerFractionGy: "1.5",
      intervalMonths: "24",
      recoveryMode: "none",
      recoveryPercent: "0",
      recoveryRationale: "",
    },
  ]);
  const [nextPreviousId, setNextPreviousId] = useState(2);

  const [currentFractions, setCurrentFractions] =
    useState("5");
  const [currentDosePerFraction, setCurrentDosePerFraction] =
    useState("4");

  const [geometricOverlap, setGeometricOverlap] =
    useState(true);
  const [
    cumulativeDoseToxicityConcern,
    setCumulativeDoseToxicityConcern,
  ] = useState(true);
  const [previousDoseData, setPreviousDoseData] =
    useState<PreviousDoseDataAvailability>("summary-only");
  const [registrationSuitability, setRegistrationSuitability] =
    useState<RegistrationSuitability>("uncertain");
  const [strategy, setStrategy] =
    useState<CumulativeDoseStrategy>(
      "conservative-near-max",
    );

  const [cumulativeLimit, setCumulativeLimit] = useState("");
  const [
    confirmThecalSacDmax,
    setConfirmThecalSacDmax,
  ] = useState(false);

  const endpoint = endpoints.find(
    (item) => item.id === endpointId,
  );
  const endpointEstimates = getAlphaBetaEstimates(endpointId);
  const selectedEstimate = alphaBetaEstimates.find(
    (record) => record.id === recordId,
  );
  const selectedSource = sourceFor(selectedEstimate?.sourceId);
  const gy = language === "ru" ? "Гр" : "Gy";

  const metric: DoseMetric =
    metricKind === "custom"
      ? {
          kind: "custom",
          customLabel: customMetricLabel.trim(),
        }
      : { kind: metricKind };

  function changeEndpoint(nextId: string) {
    setEndpointId(nextId);
    const preferred = getPreferredAlphaBetaEstimate(nextId);
    setParameterMode(preferred ? "evidence" : "manual");
    setRecordId(preferred?.id ?? "");
  }

  function updatePrevious(
    id: string,
    patch: Partial<UiPreviousCourse>,
  ) {
    setPreviousCourses((current) =>
      current.map((course) =>
        course.id === id
          ? { ...course, ...patch }
          : course,
      ),
    );
  }

  function addPreviousCourse() {
    if (previousCourses.length >= 4) return;
    const id = "prior-" + nextPreviousId;
    setNextPreviousId((value) => value + 1);
    setPreviousCourses((current) => [
      ...current,
      {
        id,
        label:
          language === "ru"
            ? "Предыдущий курс " + (current.length + 1)
            : "Previous course " + (current.length + 1),
        fractions: "25",
        dosePerFractionGy: "1",
        intervalMonths: "12",
        recoveryMode: "none",
        recoveryPercent: "0",
        recoveryRationale: "",
      },
    ]);
  }

  const calculation = useMemo(() => {
    try {
      if (
        metric.kind === "custom" &&
        (!metric.customLabel ||
          metric.customLabel.trim() === "")
      ) {
        throw new Error(
          tx(
            language,
            "Для пользовательской дозовой метрики требуется название.",
            "A custom dose metric requires a label.",
          ),
        );
      }

      if (parameterMode === "evidence" && !recordId) {
        throw new Error(
          tx(
            language,
            "Выберите опубликованное значение α/β или задайте его вручную.",
            "Select a published α/β estimate or enter a manual value.",
          ),
        );
      }

      if (
        parameterMode === "manual" &&
        (!Number.isFinite(Number(manualAlphaBeta)) ||
          Number(manualAlphaBeta) <= 0)
      ) {
        throw new Error(
          tx(
            language,
            "Пользовательское α/β должно быть больше 0 Гр.",
            "Manual α/β must be greater than 0 Gy.",
          ),
        );
      }

      for (const course of previousCourses) {
        if (
          !Number.isInteger(Number(course.fractions)) ||
          Number(course.fractions) <= 0
        ) {
          throw new Error(
            tx(
              language,
              "Число фракций каждого предыдущего курса должно быть положительным целым числом.",
              "Each previous course must have a positive integer fraction count.",
            ),
          );
        }
        if (
          !Number.isFinite(Number(course.dosePerFractionGy)) ||
          Number(course.dosePerFractionGy) <= 0
        ) {
          throw new Error(
            tx(
              language,
              "Доза за фракцию каждого предыдущего курса должна быть больше 0 Гр.",
              "Each previous course dose per fraction must be greater than 0 Gy.",
            ),
          );
        }
        if (
          course.recoveryMode === "manual" &&
          course.recoveryRationale.trim() === ""
        ) {
          throw new Error(
            tx(
              language,
              "Для ручного допущения о восстановлении необходимо указать обоснование.",
              "A manual recovery assumption requires a rationale.",
            ),
          );
        }
      }

      if (
        !Number.isInteger(Number(currentFractions)) ||
        Number(currentFractions) <= 0
      ) {
        throw new Error(
          tx(
            language,
            "Число фракций текущего курса должно быть положительным целым числом.",
            "Current-course fraction count must be a positive integer.",
          ),
        );
      }

      if (
        !Number.isFinite(Number(currentDosePerFraction)) ||
        Number(currentDosePerFraction) <= 0
      ) {
        throw new Error(
          tx(
            language,
            "Доза за фракцию текущего курса должна быть больше 0 Гр.",
            "Current-course dose per fraction must be greater than 0 Gy.",
          ),
        );
      }

      if (
        cumulativeLimit.trim() !== "" &&
        (!Number.isFinite(Number(cumulativeLimit)) ||
          Number(cumulativeLimit) <= 0)
      ) {
        throw new Error(
          tx(
            language,
            "Кумулятивная граница EQD₂ должна быть больше 0 Гр.",
            "The cumulative EQD₂ limit must be greater than 0 Gy.",
          ),
        );
      }

      const selection =
        parameterMode === "manual"
          ? {
              selectionMode: "manual" as const,
              parameter: "alpha-beta" as const,
              value: Number(manualAlphaBeta),
              unit: "Gy" as const,
              rationale:
                "Manual alpha/beta from reirradiation UI",
            }
          : {
              selectionMode: "evidence" as const,
              parameterRecordId: recordId,
            };

      const parsedPrevious: ReirradiationCourse[] =
        previousCourses.map((course) => {
          const interval =
            course.intervalMonths.trim() === ""
              ? undefined
              : Number(course.intervalMonths);

          return {
            id: course.id,
            label: course.label,
            role: "previous" as const,
            schedule: {
              fractions: Number(course.fractions),
              dosePerFractionGy: Number(
                course.dosePerFractionGy,
              ),
            },
            metric,
            ...(interval !== undefined
              ? { intervalToCurrentMonths: interval }
              : {}),
            recovery:
              course.recoveryMode === "manual"
                ? {
                    mode: "manual-discount" as const,
                    discountFraction:
                      Number(course.recoveryPercent) / 100,
                    rationale:
                      course.recoveryRationale.trim(),
                  }
                : { mode: "none" as const },
          };
        });

      const current: ReirradiationCourse = {
        id: "current",
        label:
          language === "ru"
            ? "Текущий курс"
            : "Current course",
        role: "current",
        schedule: {
          fractions: Number(currentFractions),
          dosePerFractionGy: Number(
            currentDosePerFraction,
          ),
        },
        metric,
      };

      const result =
        evaluateEvidenceReirradiationScenario(
          endpointId,
          [...parsedPrevious, current],
          {
            geometricOverlap,
            cumulativeDoseToxicityConcern,
            previousDoseData,
            registrationSuitability,
            strategy,
          },
          selection,
        );

      let budget;
      if (cumulativeLimit.trim() !== "") {
        budget = solveEvidenceRemainingEqd2Budget(
          endpointId,
          parsedPrevious,
          metric,
          Number(cumulativeLimit),
          Number(currentFractions),
          selection,
        );
      }

      return {
        result,
        budget,
        courses: [...parsedPrevious, current],
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? localizeWarning(language, error.message)
            : tx(
                language,
                "Не удалось выполнить расчёт повторного облучения.",
                "The reirradiation calculation could not be completed.",
              ),
      };
    }
  }, [
    endpointId,
    parameterMode,
    recordId,
    manualAlphaBeta,
    metricKind,
    customMetricLabel,
    previousCourses,
    currentFractions,
    currentDosePerFraction,
    geometricOverlap,
    cumulativeDoseToxicityConcern,
    previousDoseData,
    registrationSuitability,
    strategy,
    cumulativeLimit,
    language,
  ]);

  const result =
    "result" in calculation ? calculation.result : undefined;
  const budget =
    "result" in calculation ? calculation.budget : undefined;
  const error =
    "error" in calculation ? calculation.error : undefined;
  const parsedCourses =
    "result" in calculation ? calculation.courses : undefined;

  const hytecSpinalGuidance = useMemo(() => {
    if (
      endpointId !== "spinal-cord-radiation-myelopathy" ||
      !parsedCourses
    ) {
      return undefined;
    }

    return assessHytecSpinalCordReirradiation(
      parsedCourses,
      confirmThecalSacDmax,
    );
  }, [
    endpointId,
    parsedCourses,
    confirmThecalSacDmax,
  ]);

  return (
    <main className="reirradiation-page">
      <section className="panel reirradiation-hero">
        <span className="eyebrow">
          {tx(
            language,
            "повторное облучение",
            "reirradiation",
          )}
        </span>
        <h2>
          {tx(
            language,
            "Кумулятивный EQD₂/BED без скрытых допущений о восстановлении",
            "Cumulative EQD₂/BED without hidden recovery assumptions",
          )}
        </h2>
        <p>
          {tx(
            language,
            "Каждый курс сначала пересчитывается в эквивалентную дозу с одним и тем же α/β для выбранного клинического исхода. Восстановление ткани никогда не выводится автоматически из временного интервала.",
            "Each course is first converted to equieffective dose using the same α/β for the selected endpoint. Tissue recovery is never inferred automatically from elapsed time.",
          )}
        </p>
      </section>

      <section className="reirradiation-grid">
        <section className="panel reirradiation-config">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {tx(language, "контекст", "context")}
              </span>
              <h2>
                {tx(
                  language,
                  "Классификация и способ оценки",
                  "Classification and assessment method",
                )}
              </h2>
            </div>
          </div>

          <div className="reirradiation-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={geometricOverlap}
                onChange={(event) =>
                  setGeometricOverlap(event.target.checked)
                }
              />
              <span>
                {tx(
                  language,
                  "Есть геометрическое перекрытие с ранее облучённым объёмом",
                  "There is geometric overlap with a previously irradiated volume",
                )}
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={cumulativeDoseToxicityConcern}
                onChange={(event) =>
                  setCumulativeDoseToxicityConcern(
                    event.target.checked,
                  )
                }
              />
              <span>
                {tx(
                  language,
                  "Кумулятивная доза вызывает опасение по токсичности",
                  "Cumulative dose raises a toxicity concern",
                )}
              </span>
            </label>
          </div>

          <div className="two-columns">
            <label className="field">
              <span>
                {tx(
                  language,
                  "Данные предыдущего курса",
                  "Previous treatment data",
                )}
              </span>
              <select
                value={previousDoseData}
                onChange={(event) =>
                  setPreviousDoseData(
                    event.target
                      .value as PreviousDoseDataAvailability,
                  )
                }
              >
                <option value="complete-dicom">
                  {tx(
                    language,
                    "Полные DICOM-данные",
                    "Complete DICOM data",
                  )}
                </option>
                <option value="incomplete-reconstructable">
                  {tx(
                    language,
                    "Неполные, но курс можно реконструировать",
                    "Incomplete but reconstructable",
                  )}
                </option>
                <option value="summary-only">
                  {tx(
                    language,
                    "Только выписка / сводка доз",
                    "Plan summary only",
                  )}
                </option>
                <option value="unknown">
                  {tx(
                    language,
                    "Данные существенно неполные",
                    "Substantially incomplete",
                  )}
                </option>
              </select>
            </label>

            <label className="field">
              <span>
                {tx(
                  language,
                  "Пригодность регистрации изображений",
                  "Image-registration suitability",
                )}
              </span>
              <select
                value={registrationSuitability}
                onChange={(event) =>
                  setRegistrationSuitability(
                    event.target
                      .value as RegistrationSuitability,
                  )
                }
              >
                <option value="not-assessed">
                  {tx(
                    language,
                    "Не оценена",
                    "Not assessed",
                  )}
                </option>
                <option value="rigid-suitable">
                  {tx(
                    language,
                    "Подходит жёсткая регистрация",
                    "Rigid registration suitable",
                  )}
                </option>
                <option value="deformable-validated">
                  {tx(
                    language,
                    "Деформируемая регистрация проверена",
                    "Validated deformable registration",
                  )}
                </option>
                <option value="uncertain">
                  {tx(language, "Неопределённо", "Uncertain")}
                </option>
                <option value="unsuitable">
                  {tx(
                    language,
                    "Регистрация непригодна",
                    "Registration unsuitable",
                  )}
                </option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>
              {tx(
                language,
                "Способ оценки кумулятивной дозы",
                "Cumulative-dose assessment strategy",
              )}
            </span>
            <select
              value={strategy}
              onChange={(event) =>
                setStrategy(
                  event.target.value as CumulativeDoseStrategy,
                )
              }
            >
              {(
                [
                  "direct-point-sum",
                  "overlap-point-sum",
                  "conservative-near-max",
                  "image-registration-3d",
                ] as CumulativeDoseStrategy[]
              ).map((item) => (
                <option key={item} value={item}>
                  {strategyLabel(language, item)}
                </option>
              ))}
            </select>
          </label>

          <div className="section-divider" />

          <label className="field">
            <span>
              {tx(
                language,
                "Клинический исход",
                "Clinical endpoint",
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
                    event.target.value as Exclude<
                      DoseMetricKind,
                      "Vx" | "mean-dose"
                    >,
                  )
                }
              >
                <option value="Dmax">Dmax</option>
                <option value="D0.03cc">D0.03cc</option>
                <option value="D0.1cc">D0.1cc</option>
                <option value="D1cc">D1cc</option>
                <option value="D2cc">D2cc</option>
                <option value="custom">
                  {tx(
                    language,
                    "Другая дозовая метрика",
                    "Custom dose metric",
                  )}
                </option>
              </select>
            </label>

            {metricKind === "custom" ? (
              <label className="field">
                <span>
                  {tx(
                    language,
                    "Название метрики",
                    "Metric label",
                  )}
                </span>
                <input
                  value={customMetricLabel}
                  placeholder="D0.5cc"
                  onChange={(event) =>
                    setCustomMetricLabel(event.target.value)
                  }
                />
              </label>
            ) : (
              <div className="metric-context-card">
                <span>
                  {tx(
                    language,
                    "Суммируется одна и та же метрика",
                    "Same metric across courses",
                  )}
                </span>
                <strong>{metricLabel(language, metric)}</strong>
              </div>
            )}
          </div>

          <div className="segmented">
            <button
              type="button"
              className={
                parameterMode === "evidence"
                  ? "selected"
                  : ""
              }
              onClick={() => setParameterMode("evidence")}
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
                parameterMode === "manual"
                  ? "selected"
                  : ""
              }
              onClick={() => setParameterMode("manual")}
            >
              {tx(language, "своё α/β", "custom α/β")}
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
                onChange={(event) =>
                  setRecordId(event.target.value)
                }
              >
                <option value="">
                  {tx(language, "— выбрать —", "— select —")}
                </option>
                {endpointEstimates.map((estimate) => (
                  <option key={estimate.id} value={estimate.id}>
                    {formatUiNumber(
                      language,
                      estimate.valueGy,
                      2,
                    )}{" "}
                    {gy} ·{" "}
                    {estimateChoiceLabel(
                      language,
                      estimate.status === "preferred" &&
                        estimate.defaultEligible,
                    )}
                  </option>
                ))}
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
            </label>
          )}

          {selectedEstimate &&
          parameterMode === "evidence" ? (
            <div className="evidence-mini">
              <strong>
                α/β ={" "}
                {formatUiNumber(
                  language,
                  selectedEstimate.valueGy,
                  2,
                )}{" "}
                {gy}
              </strong>
              {selectedSource ? (
                <small>{selectedSource.citation}</small>
              ) : null}
            </div>
          ) : null}

          <div className="section-divider" />

          <div className="section-heading compact">
            <div>
              <span className="eyebrow">
                {tx(
                  language,
                  "предыдущие курсы",
                  "previous courses",
                )}
              </span>
              <h2>
                {tx(
                  language,
                  "Доза на выбранную метрику",
                  "Dose to the selected metric",
                )}
              </h2>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={addPreviousCourse}
              disabled={previousCourses.length >= 4}
            >
              {tx(
                language,
                "+ курс",
                "+ course",
              )}
            </button>
          </div>

          <div className="prior-course-list">
            {previousCourses.map((course, index) => (
              <div className="prior-course-card" key={course.id}>
                <div className="prior-course-heading">
                  <input
                    value={course.label}
                    onChange={(event) =>
                      updatePrevious(course.id, {
                        label: event.target.value,
                      })
                    }
                  />
                  {previousCourses.length > 1 ? (
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() =>
                        setPreviousCourses((current) =>
                          current.filter(
                            (item) =>
                              item.id !== course.id,
                          ),
                        )
                      }
                      aria-label={tx(
                        language,
                        "Удалить предыдущий курс",
                        "Remove previous course",
                      )}
                    >
                      ×
                    </button>
                  ) : null}
                </div>

                <div className="three-columns">
                  <label className="field compact-field">
                    <span>n</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={course.fractions}
                      onChange={(event) =>
                        updatePrevious(course.id, {
                          fractions: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="field compact-field">
                    <span>d, {gy}</span>
                    <input
                      type="number"
                      min="0.001"
                      step="0.01"
                      value={course.dosePerFractionGy}
                      onChange={(event) =>
                        updatePrevious(course.id, {
                          dosePerFractionGy:
                            event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="field compact-field">
                    <span>
                      {tx(
                        language,
                        "Интервал до текущего курса, мес.",
                        "Interval to current course, months",
                      )}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={course.intervalMonths}
                      onChange={(event) =>
                        updatePrevious(course.id, {
                          intervalMonths:
                            event.target.value,
                        })
                      }
                    />
                  </label>
                </div>

                <div className="segmented">
                  <button
                    type="button"
                    className={
                      course.recoveryMode === "none"
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      updatePrevious(course.id, {
                        recoveryMode: "none",
                      })
                    }
                  >
                    {tx(
                      language,
                      "Без учёта восстановления",
                      "No recovery credit",
                    )}
                  </button>
                  <button
                    type="button"
                    className={
                      course.recoveryMode === "manual"
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      updatePrevious(course.id, {
                        recoveryMode: "manual",
                      })
                    }
                  >
                    {tx(
                      language,
                      "Задать восстановление вручную",
                      "Manual recovery assumption",
                    )}
                  </button>
                </div>

                {course.recoveryMode === "manual" ? (
                  <div className="recovery-grid">
                    <label className="field">
                      <span>
                        {tx(
                          language,
                          "Снижение вклада предыдущего EQD₂/BED, %",
                          "Discount of prior EQD₂/BED contribution, %",
                        )}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={course.recoveryPercent}
                        onChange={(event) =>
                          updatePrevious(course.id, {
                            recoveryPercent:
                              event.target.value,
                          })
                        }
                      />
                    </label>
                    <label className="field">
                      <span>
                        {tx(
                          language,
                          "Обоснование допущения",
                          "Rationale",
                        )}
                      </span>
                      <input
                        value={course.recoveryRationale}
                        placeholder={tx(
                          language,
                          "обязательное поле",
                          "required",
                        )}
                        onChange={(event) =>
                          updatePrevious(course.id, {
                            recoveryRationale:
                              event.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                ) : null}

                <small className="recovery-note">
                  {tx(
                    language,
                    "Временной интервал сохраняется для аудита и сам по себе не меняет дозу.",
                    "The time interval is stored for audit and never changes dose automatically.",
                  )}
                </small>
              </div>
            ))}
          </div>

          <div className="section-divider" />

          <div className="section-heading compact">
            <div>
              <span className="eyebrow">
                {tx(language, "текущий курс", "current course")}
              </span>
              <h2>
                {metricLabel(language, metric)}
              </h2>
            </div>
          </div>

          <div className="two-columns">
            <label className="field">
              <span>
                {tx(
                  language,
                  "Число фракций",
                  "Number of fractions",
                )}
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={currentFractions}
                onChange={(event) =>
                  setCurrentFractions(event.target.value)
                }
              />
            </label>
            <label className="field">
              <span>
                {tx(
                  language,
                  "Доза на метрику за фракцию, Гр",
                  "Dose to metric per fraction, Gy",
                )}
              </span>
              <input
                type="number"
                min="0.001"
                step="0.01"
                value={currentDosePerFraction}
                onChange={(event) =>
                  setCurrentDosePerFraction(
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        </section>

        <section className="panel reirradiation-results">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {tx(language, "результат", "result")}
              </span>
              <h2>
                {tx(
                  language,
                  "Кумулятивная эквивалентная доза",
                  "Cumulative equieffective dose",
                )}
              </h2>
            </div>
          </div>

          {error ? (
            <div className="empty-state">
              <strong>
                {tx(
                  language,
                  "Нужно уточнить данные",
                  "Inputs need review",
                )}
              </strong>
              <p>{error}</p>
            </div>
          ) : result ? (
            <>
              <div className="reirradiation-classification">
                <span>
                  {tx(
                    language,
                    "Классификация",
                    "Classification",
                  )}
                </span>
                <strong>
                  {classificationLabel(
                    language,
                    result.classification,
                  )}
                </strong>
                <small>
                  {strategyLabel(language, result.strategy)}
                </small>
              </div>

              <div className="metric-grid reirradiation-metrics">
                <div className="metric primary">
                  <span>
                    {tx(
                      language,
                      "Кумулятивный EQD₂",
                      "Cumulative EQD₂",
                    )}
                  </span>
                  <strong>
                    {formatUiNumber(
                      language,
                      result.cumulativeEqd2Gy,
                    )}{" "}
                    {gy}
                  </strong>
                  <small>
                    α/β ={" "}
                    {formatUiNumber(
                      language,
                      result.alphaBetaGy,
                      2,
                    )}{" "}
                    {gy}
                  </small>
                </div>
                <div className="metric">
                  <span>
                    {tx(
                      language,
                      "Кумулятивный BED",
                      "Cumulative BED",
                    )}
                  </span>
                  <strong>
                    {formatUiNumber(
                      language,
                      result.cumulativeBedGy,
                    )}{" "}
                    {gy}
                  </strong>
                  <small>
                    {metricLabel(language, result.metric)}
                  </small>
                </div>
                <div className="metric">
                  <span>
                    {tx(
                      language,
                      "Сумма физических доз",
                      "Sum of physical doses",
                    )}
                  </span>
                  <strong>
                    {formatUiNumber(
                      language,
                      result.cumulativePhysicalDoseGy,
                    )}{" "}
                    {gy}
                  </strong>
                  <small>
                    {tx(
                      language,
                      "только для аудита",
                      "audit only",
                    )}
                  </small>
                </div>
              </div>

              <div className="reirradiation-course-table-wrap">
                <table className="reirradiation-course-table">
                  <thead>
                    <tr>
                      <th>
                        {tx(language, "Курс", "Course")}
                      </th>
                      <th>D</th>
                      <th>BED</th>
                      <th>EQD₂</th>
                      <th>
                        {tx(
                          language,
                          "Вклад после допущения",
                          "Adjusted contribution",
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.courses.map((course) => (
                      <tr key={course.id}>
                        <th>{course.label}</th>
                        <td>
                          {formatUiNumber(
                            language,
                            course.physicalDoseGy,
                          )}{" "}
                          {gy}
                        </td>
                        <td>
                          {formatUiNumber(
                            language,
                            course.bedGy,
                          )}
                        </td>
                        <td>
                          {formatUiNumber(
                            language,
                            course.eqd2Gy,
                          )}
                        </td>
                        <td>
                          {formatUiNumber(
                            language,
                            course.adjustedEqd2Gy,
                          )}{" "}
                          {gy}
                          {course.recoveryDiscountFraction >
                          0 ? (
                            <small>
                              −
                              {formatUiNumber(
                                language,
                                course.recoveryDiscountFraction *
                                  100,
                                0,
                              )}
                              %
                            </small>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="section-divider" />

              <div className="section-heading compact">
                <div>
                  <span className="eyebrow">
                    {tx(
                      language,
                      "остаточный бюджет",
                      "remaining budget",
                    )}
                  </span>
                  <h2>
                    {tx(
                      language,
                      "Решить относительно текущего курса",
                      "Solve for the current course",
                    )}
                  </h2>
                </div>
              </div>

              <label className="field">
                <span>
                  {tx(
                    language,
                    "Кумулятивная граница EQD₂ для этой же метрики, Гр",
                    "Cumulative EQD₂ limit for the same metric, Gy",
                  )}
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.1"
                  value={cumulativeLimit}
                  placeholder={tx(
                    language,
                    "не задана",
                    "not set",
                  )}
                  onChange={(event) =>
                    setCumulativeLimit(event.target.value)
                  }
                />
                <small>
                  {tx(
                    language,
                    "HFC не подставляет клиническую границу автоматически: она должна быть выбрана из подходящего источника или локального протокола.",
                    "HFC does not insert a clinical cumulative limit automatically; it must come from an applicable source or local protocol.",
                  )}
                </small>
              </label>

              {budget ? (
                <div className="remaining-budget-card">
                  <div>
                    <span>
                      {tx(
                        language,
                        "Предыдущий вклад",
                        "Adjusted prior contribution",
                      )}
                    </span>
                    <strong>
                      {formatUiNumber(
                        language,
                        budget.adjustedPriorEqd2Gy,
                      )}{" "}
                      {gy}
                    </strong>
                  </div>
                  <div>
                    <span>
                      {tx(
                        language,
                        "Остаток EQD₂",
                        "Remaining EQD₂",
                      )}
                    </span>
                    <strong>
                      {formatUiNumber(
                        language,
                        budget.remainingEqd2BudgetGy,
                      )}{" "}
                      {gy}
                    </strong>
                  </div>
                  <div>
                    <span>
                      {tx(
                        language,
                        "Максимальная d для текущего курса",
                        "Maximum current d",
                      )}
                    </span>
                    <strong>
                      {budget.maximumDosePerFractionGy ===
                      null
                        ? "—"
                        : formatUiNumber(
                            language,
                            budget.maximumDosePerFractionGy,
                            3,
                          ) +
                          " " +
                          gy}
                    </strong>
                  </div>
                </div>
              ) : null}

              {result.warnings.length ? (
                <div className="warning-card">
                  <strong>
                    {tx(
                      language,
                      "Предупреждения и допущения",
                      "Warnings and assumptions",
                    )}
                  </strong>
                  <ul>
                    {result.warnings.map((warning) => (
                      <li key={warning}>
                        {localizeWarning(
                          language,
                          warning,
                        )}
                      </li>
                    ))}
                    {budget?.warnings.map((warning) => (
                      <li key={"budget-" + warning}>
                        {localizeWarning(
                          language,
                          warning,
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="reirradiation-method-note">
                <strong>
                  {tx(
                    language,
                    "Основные источники метода",
                    "Core method sources",
                  )}
                </strong>
                {[
                  "andratschke-2022-estro-eortc-reirradiation",
                  "appelt-2026-cumulative-dose-reirradiation",
                  "paradis-2026-recog-consensus",
                  "zhang-2026-recog-case-guide",
                  "rcr-2024-principles-reirradiation",
                ].map((sourceId) => {
                  const source = sourceFor(sourceId);
                  if (!source) return null;
                  return (
                    <p key={sourceId}>{source.citation}</p>
                  );
                })}
              </div>
            </>
          ) : null}

          <div className="safety-note">
            <strong>
              {tx(
                language,
                "Не является автоматическим разрешением на повторное облучение.",
                "Not an automatic clearance for reirradiation.",
              )}
            </strong>
            <p>
              {tx(
                language,
                "Кумулятивный EQD₂/BED зависит от пространственного соответствия доз, выбранной метрики, α/β, качества предыдущих данных, регистрации и любых допущений о восстановлении. Итог требует независимой проверки.",
                "Cumulative EQD₂/BED depends on spatial dose correspondence, selected metric, α/β, prior-data quality, registration, and any recovery assumptions. Independent review remains required.",
              )}
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
