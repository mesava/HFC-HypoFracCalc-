import { useMemo, useState } from "react";
import {
  endpoints,
  hytecOutcomeModels,
  sources,
} from "../data/evidence/v0.1/index.js";
import type {
  OutcomeEvidenceForm,
  OutcomeModel,
  OutcomeProbabilityKind,
  OutcomeProbabilityPoint,
} from "../domain/outcomeModels.js";
import { tx } from "./i18n.js";
import {
  endpointLabel,
  formatUiNumber,
  organLabel,
  type Language,
} from "./labels.js";

function sourceFor(sourceId: string) {
  return sources.find(
    (source) => source.id === sourceId,
  );
}

function evidenceFormLabel(
  language: Language,
  form: OutcomeEvidenceForm,
): string {
  switch (form) {
    case "model-derived":
      return tx(
        language,
        "модельная оценка",
        "model-derived",
      );
    case "pooled-observation":
      return tx(
        language,
        "объединённое наблюдение",
        "pooled observation",
      );
    case "stratified-observation":
      return tx(
        language,
        "стратифицированное наблюдение",
        "stratified observation",
      );
  }
}

function outcomeKindLabel(
  language: Language,
  kind: OutcomeProbabilityKind,
): string {
  switch (kind) {
    case "TCP":
      return "TCP";
    case "local-control":
      return tx(
        language,
        "локальный контроль",
        "local control",
      );
    case "biochemical-control":
      return tx(
        language,
        "биохимический контроль",
        "biochemical control",
      );
  }
}

function probabilityLabel(
  language: Language,
  point: OutcomeProbabilityPoint,
): string {
  const percent = point.probability * 100;
  return (
    (point.probabilityRelation ?? "≈") +
    " " +
    formatUiNumber(
      language,
      percent,
      Number.isInteger(percent) ? 0 : 1,
    ) +
    "%"
  );
}

function doseLabel(
  language: Language,
  point: OutcomeProbabilityPoint,
): string {
  const parts: string[] = [];
  const schedule = point.dose.schedule;
  if (schedule) {
    const total =
      schedule.fractions *
      schedule.dosePerFractionGy;
    parts.push(
      `${schedule.fractions} × ${formatUiNumber(
        language,
        schedule.dosePerFractionGy,
        2,
      )} ${language === "ru" ? "Гр" : "Gy"} = ${formatUiNumber(
        language,
        total,
        2,
      )} ${language === "ru" ? "Гр" : "Gy"}`,
    );
  }

  const equivalent = point.dose.equivalentFractionation;
  if (equivalent) {
    const gy = language === "ru" ? "Гр" : "Gy";
    const label =
      language === "ru"
        ? `${equivalent.fractions}-фр эквивалент`
        : `${equivalent.fractions}-fx equivalent`;
    const alphaBeta =
      equivalent.alphaBetaGy === undefined
        ? ""
        : ` (α/β = ${formatUiNumber(
            language,
            equivalent.alphaBetaGy,
            1,
          )} ${gy})`;
    parts.push(
      `${label} = ${formatUiNumber(
        language,
        equivalent.totalDoseGy,
        1,
      )} ${gy}${alphaBeta}`,
    );
  }

  const biological = point.dose.biologicalDose;
  if (biological) {
    parts.push(
      `${biological.basis}${biological.alphaBetaGy === 10
        ? "₁₀"
        : ""} = ${formatUiNumber(
        language,
        biological.valueGy,
        1,
      )} ${language === "ru" ? "Гр" : "Gy"} (α/β = ${formatUiNumber(
        language,
        biological.alphaBetaGy,
        1,
      )} ${language === "ru" ? "Гр" : "Gy"})`,
    );
  }

  if (point.dose.totalDoseGyRange) {
    parts.push(
      `${formatUiNumber(
        language,
        point.dose.totalDoseGyRange.low,
        1,
      )}–${formatUiNumber(
        language,
        point.dose.totalDoseGyRange.high,
        1,
      )} ${language === "ru" ? "Гр" : "Gy"}`,
    );
  }

  return parts.join(" · ") || "—";
}

function subgroupLabel(
  language: Language,
  value: string | undefined,
): string {
  if (!value) return "—";
  if (language === "en") return value;

  const labels: Record<string, string> = {
    "Maximum tumour diameter ≤20 mm":
      "Максимальный диаметр опухоли ≤20 мм",
    "Maximum tumour diameter 21–30 mm":
      "Максимальный диаметр опухоли 21–30 мм",
    "Maximum tumour diameter 31–40 mm":
      "Максимальный диаметр опухоли 31–40 мм",
    "BED10 >100 Gy": "BED₁₀ >100 Гр",
    "BED10 ≤100 Gy": "BED₁₀ ≤100 Гр",
    "Low/intermediate-risk disease":
      "Низкий/промежуточный риск",
    "High-risk disease": "Высокий риск",
    "Unresected disease": "Без хирургического удаления",
    "R0 resection": "R0-резекция",
    "Maximum tumour diameter 1 cm": "Максимальный диаметр опухоли 1 см",
    "Maximum tumour diameter 3 cm": "Максимальный диаметр опухоли 3 см",
    "Maximum tumour diameter 5 cm": "Максимальный диаметр опухоли 5 см",
  };
  return labels[value] ?? value;
}

function followUpLabel(
  language: Language,
  value: string,
): string {
  if (language === "en") return value;
  const labels: Record<string, string> = {
    "1 year": "1 год",
    "2 years": "2 года",
    "3 years": "3 года",
    "3–5 years": "3–5 лет",
    "5 years": "5 лет",
    "1-year local control":
      "локальный контроль через 1 год",
    "2-year local control":
      "локальный контроль через 2 года",
    "3-year local control":
      "локальный контроль через 3 года",
    "3–5 year tumour control":
      "опухолевый контроль через 3–5 лет",
    "5-year freedom from biochemical relapse":
      "5-летняя свобода от биохимического рецидива",
  };
  return labels[value] ?? value;
}

function priorRtLabel(
  language: Language,
  value: OutcomeModel["priorRadiotherapy"],
): string {
  switch (value) {
    case "none":
      return tx(
        language,
        "без предшествующей ЛТ",
        "no prior RT",
      );
    case "yes":
      return tx(
        language,
        "повторное облучение",
        "prior RT",
      );
    case "mixed":
      return tx(
        language,
        "смешанная выборка",
        "mixed",
      );
    case "not-reported":
      return tx(
        language,
        "неоднозначно",
        "not clearly reported",
      );
    default:
      return tx(
        language,
        "не указано",
        "not specified",
      );
  }
}

export function OutcomeModelsView({
  language,
}: {
  language: Language;
}) {
  const endpointIds = useMemo(
    () =>
      new Set(
        hytecOutcomeModels.map(
          (model) => model.endpointId,
        ),
      ),
    [],
  );

  const availableEndpoints = useMemo(
    () =>
      endpoints
        .filter((endpoint) =>
          endpointIds.has(endpoint.id),
        )
        .sort((a, b) =>
          (a.organ + " " + a.endpoint).localeCompare(
            b.organ + " " + b.endpoint,
            "en",
          ),
        ),
    [endpointIds],
  );

  const [endpointId, setEndpointId] = useState(
    "brain-metastases-local-control",
  );

  const models = useMemo(
    () =>
      hytecOutcomeModels.filter(
        (model) =>
          model.endpointId === endpointId,
      ),
    [endpointId],
  );

  const endpoint = endpoints.find(
    (candidate) => candidate.id === endpointId,
  );

  return (
    <main className="constraints-page">
      <section className="panel constraints-hero">
        <span className="eyebrow">
          {tx(
            language,
            "HyTEC · модели исходов",
            "HyTEC · outcome models",
          )}
        </span>
        <h2>
          {tx(
            language,
            "Доза → вероятность исхода без подмены клинической рекомендации",
            "Dose → outcome probability without pretending it is a recommendation",
          )}
        </h2>
        <p>
          {tx(
            language,
            "OutcomeModel хранит опубликованные TCP/локальный контроль вместе с дозой, временем наблюдения, подгруппой, типом доказательства и источником. HFC не интерполирует между точками и не превращает модельный TCP в назначение лечения.",
            "OutcomeModel stores published TCP/local-control evidence together with dose, follow-up, subgroup, evidence form, and source. HFC does not interpolate between points or turn modelled TCP into a treatment prescription.",
          )}
        </p>
        <div className="constraints-caution">
          <strong>
            {tx(
              language,
              "Расширенный пакет исходов",
              "Expanded outcome package",
            )}
          </strong>
          <span>
            {tx(
              language,
              "Включены метастазы в головной мозг, вестибулярная шваннома, метастазы в позвоночник, печень и надпочечник, SBRT простаты, NSCLC I стадии, повторное SBRT-облучение рецидивов головы и шеи и SBRT поджелудочной железы. Эквивалентные схемы из публикаций отображаются отдельно от реально доставленных режимов; source-specific α/β остаётся частью provenance модели и не становится α/β по умолчанию.",
              "Includes brain metastases, vestibular schwannoma, spinal/liver/adrenal metastases, prostate SBRT, stage-I NSCLC, recurrent head-and-neck SBRT reirradiation, and pancreatic SBRT. Source-transformed equivalent schedules are displayed separately from delivered schedules; source-specific alpha/beta remains model provenance and never becomes an HFC default.",
            )}
          </span>
        </div>
      </section>

      <section className="panel constraints-browser">
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
              setEndpointId(event.target.value)
            }
          >
            {availableEndpoints.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {organLabel(
                  language,
                  item.organ,
                )}{" "}
                ·{" "}
                {endpointLabel(
                  language,
                  item.id,
                  item.endpoint,
                )}
              </option>
            ))}
          </select>
        </label>

        <div className="constraints-context-line">
          <strong>
            {organLabel(
              language,
              endpoint?.organ ?? "",
            )}
          </strong>
          <span>
            {endpointLabel(
              language,
              endpointId,
              endpoint?.endpoint ?? endpointId,
            )}
          </span>
        </div>

        <div className="constraint-card-list">
          {models.map((model) => {
            const source = sourceFor(
              model.sourceId,
            );

            return (
              <article
                className="constraint-card outcome-model-card"
                key={model.id}
              >
                <div className="constraint-card-top">
                  <div>
                    <span className="constraint-guidance-kind">
                      {evidenceFormLabel(
                        language,
                        model.evidenceForm,
                      )}
                    </span>
                    <strong>
                      {outcomeKindLabel(
                        language,
                        model.outcomeKind,
                      )}
                    </strong>
                  </div>
                  <div className="constraint-risk">
                    <span>
                      {tx(
                        language,
                        "Точки",
                        "Points",
                      )}
                    </span>
                    <strong>
                      {model.points.length}
                    </strong>
                  </div>
                </div>

                <dl className="constraint-meta">
                  <div>
                    <dt>
                      {tx(
                        language,
                        "Методика",
                        "Technique",
                      )}
                    </dt>
                    <dd>
                      {model.technique.join(", ")}
                    </dd>
                  </div>
                  <div>
                    <dt>
                      {tx(
                        language,
                        "Предшествующая ЛТ",
                        "Prior RT",
                      )}
                    </dt>
                    <dd>
                      {priorRtLabel(
                        language,
                        model.priorRadiotherapy,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>
                      {tx(
                        language,
                        "Наблюдение",
                        "Follow-up",
                      )}
                    </dt>
                    <dd>
                      {model.applicability?.followUp
                        ? followUpLabel(
                            language,
                            model.applicability.followUp,
                          )
                        : "—"}
                    </dd>
                  </div>
                </dl>

                {model.id === "hytec-prostate-sbrt-5y-tcp" ? (
                  <p className="outcome-source-discrepancy">
                    {tx(
                      language,
                      "Научная проверка: для группы низкого/промежуточного риска опубликованные вероятности согласуются с текстом и графиком Royce et al., но не воспроизводятся из уравнения (2) с параметрами Table 3. Это не независимо подтверждённая непрерывная TCP-модель; расхождение источника остаётся открытым. Точка EQD₂ 71 Гр дополнительно выходит за пределы исследованного диапазона.",
                      "Scientific audit: the reported low/intermediate-risk probabilities agree with the text and figure in Royce et al., but cannot be reproduced from equation (2) and Table 3 parameters. This is not an independently validated continuous TCP model; the source inconsistency remains unresolved. The EQD2 71 Gy point is also outside the observed dose range.",
                    )}
                  </p>
                ) : null}

                <div className="outcome-point-table-scroll">
                  <table className="outcome-point-table">
                    <thead>
                      <tr>
                        <th>
                          {tx(
                            language,
                            "Подгруппа",
                            "Subgroup",
                          )}
                        </th>
                        <th>
                          {tx(
                            language,
                            "Доза",
                            "Dose",
                          )}
                        </th>
                        <th>
                          {tx(
                            language,
                            "Исход",
                            "Outcome",
                          )}
                        </th>
                        <th>
                          {tx(
                            language,
                            "Срок",
                            "Time",
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {model.points.map(
                        (point) => (
                          <tr key={point.id}>
                            <td>
                              {subgroupLabel(
                                language,
                                point.subgroup,
                              )}
                              {point.extrapolated ? (
                                <small className="outcome-extrapolated">
                                  {tx(
                                    language,
                                    "экстраполяция",
                                    "extrapolated",
                                  )}
                                </small>
                              ) : null}
                            </td>
                            <td>
                              {doseLabel(
                                language,
                                point,
                              )}
                            </td>
                            <td>
                              <strong>
                                {probabilityLabel(
                                  language,
                                  point,
                                )}
                              </strong>
                            </td>
                            <td>
                              {followUpLabel(
                                language,
                                point.followUp,
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                {model.notes?.length &&
                language === "en" ? (
                  <ul className="outcome-model-notes">
                    {model.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                ) : null}

                {source ? (
                  <div className="constraint-source">
                    <span>
                      {tx(
                        language,
                        "Источник",
                        "Source",
                      )}
                    </span>
                    <p>{source.citation}</p>
                    <div>
                      {source.doi ? (
                        <a
                          href={
                            "https://doi.org/" +
                            source.doi
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          DOI {source.doi}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel site-safety">
        <strong>
          {tx(
            language,
            "Не калькулятор TCP для конкретного пациента",
            "Not a patient-specific TCP calculator",
          )}
        </strong>
        <p>
          {tx(
            language,
            "На этом этапе HFC показывает курируемые опубликованные outcome points. Он не выполняет скрытую интерполяцию, не экстраполирует за пределы публикации и не смешивает эти данные с OAR constraints или α/β defaults.",
            "At this stage HFC displays curated published outcome points. It does not silently interpolate, extrapolate beyond the publication, or mix these data with OAR constraints or alpha/beta defaults.",
          )}
        </p>
      </section>
    </main>
  );
}
