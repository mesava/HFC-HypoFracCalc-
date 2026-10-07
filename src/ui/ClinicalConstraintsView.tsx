import { useMemo, useState } from "react";
import {
  endpoints,
  hytecClinicalConstraints,
  sources,
} from "../data/evidence/v0.1/index.js";
import type {
  ClinicalConstraint,
  ClinicalGuidanceKind,
  DoseMetric,
} from "../domain/constraints.js";
import { tx } from "./i18n.js";
import {
  endpointLabel,
  formatUiNumber,
  organLabel,
  type Language,
} from "./labels.js";

function sourceFor(sourceId: string) {
  return sources.find((source) => source.id === sourceId);
}

function guidanceLabel(
  language: Language,
  kind: ClinicalGuidanceKind,
): string {
  switch (kind) {
    case "planning-limit":
      return tx(
        language,
        "планировочная граница",
        "planning limit",
      );
    case "risk-point":
      return tx(language, "точка риска", "risk point");
    case "observational-threshold":
      return tx(
        language,
        "наблюдательный порог",
        "observational threshold",
      );
  }
}

function metricLabel(metric: DoseMetric): string {
  if (metric.kind === "Vx") {
    return "V" + (metric.xGy ?? "?");
  }
  if (metric.kind === "mean-dose") {
    return "Dmean";
  }
  if (metric.kind === "custom") {
    return metric.customLabel ?? "custom";
  }
  return metric.kind;
}

function unitLabel(
  language: Language,
  unit: ClinicalConstraint["unit"],
): string {
  if (language === "ru" && unit === "cc") return "см³";
  if (language === "ru" && unit === "Gy") return "Гр";
  return unit;
}

function constraintValue(
  language: Language,
  constraint: ClinicalConstraint,
): string {
  if (constraint.valueRange) {
    return (
      constraint.relation +
      " " +
      formatUiNumber(language, constraint.valueRange.low, 1) +
      "–" +
      formatUiNumber(language, constraint.valueRange.high, 1) +
      " " +
      unitLabel(language, constraint.unit)
    );
  }
  if (constraint.value === undefined) return "—";
  return (
    constraint.relation +
    " " +
    formatUiNumber(
      language,
      constraint.value,
      constraint.unit === "Gy" ? 1 : 0,
    ) +
    " " +
    unitLabel(language, constraint.unit)
  );
}

function riskValue(
  language: Language,
  constraint: ClinicalConstraint,
): string {
  if (constraint.estimatedRiskRange) {
    return (
      (constraint.riskRelation ?? "") +
      (constraint.riskRelation ? " " : "") +
      formatUiNumber(
        language,
        constraint.estimatedRiskRange.low * 100,
        0,
      ) +
      "–" +
      formatUiNumber(
        language,
        constraint.estimatedRiskRange.high * 100,
        0,
      ) +
      "%"
    );
  }

  if (constraint.estimatedRisk === undefined) {
    return tx(language, "не указана", "not reported");
  }

  return (
    (constraint.riskRelation ?? "≈") +
    " " +
    formatUiNumber(
      language,
      constraint.estimatedRisk * 100,
      0,
    ) +
    "%"
  );
}

function priorRtLabel(
  language: Language,
  value: ClinicalConstraint["priorRadiotherapy"],
): string {
  switch (value) {
    case "none":
      return tx(
        language,
        "без предшествующей лучевой терапии",
        "no prior radiotherapy",
      );
    case "yes":
      return tx(
        language,
        "после предшествующей лучевой терапии",
        "prior radiotherapy",
      );
    case "mixed":
      return tx(language, "смешанная выборка", "mixed");
    case "not-reported":
      return tx(
        language,
        "не указано однозначно",
        "not clearly reported",
      );
    default:
      return tx(language, "не указано", "not specified");
  }
}

export function ClinicalConstraintsView({
  language,
}: {
  language: Language;
}) {
  const endpointIds = useMemo(
    () =>
      new Set(
        hytecClinicalConstraints.map(
          (constraint) => constraint.endpointId,
        ),
      ),
    [],
  );

  const availableEndpoints = useMemo(
    () =>
      endpoints
        .filter((endpoint) => endpointIds.has(endpoint.id))
        .sort((a, b) =>
          (a.organ + " " + a.endpoint).localeCompare(
            b.organ + " " + b.endpoint,
            "en",
          ),
        ),
    [endpointIds],
  );

  const [endpointId, setEndpointId] = useState(
    "optic-pathway-radiation-neuropathy",
  );
  const [fractionFilter, setFractionFilter] =
    useState<string>("all");

  const fractionOptions = useMemo(
    () =>
      [
        ...new Set(
          hytecClinicalConstraints
            .filter(
              (constraint) =>
                constraint.endpointId === endpointId,
            )
            .map(
              (constraint) =>
                constraint.fractionation?.fractions,
            )
            .filter(
              (value): value is number =>
                value !== undefined,
            ),
        ),
      ].sort((a, b) => a - b),
    [endpointId],
  );

  const filtered = useMemo(
    () =>
      hytecClinicalConstraints.filter(
        (constraint) =>
          constraint.endpointId === endpointId &&
          (fractionFilter === "all" ||
            constraint.fractionation?.fractions ===
              Number(fractionFilter)),
      ),
    [endpointId, fractionFilter],
  );

  const endpoint = endpoints.find(
    (candidate) => candidate.id === endpointId,
  );

  function changeEndpoint(nextId: string) {
    setEndpointId(nextId);
    setFractionFilter("all");
  }

  return (
    <main className="constraints-page">
      <section className="panel constraints-hero">
        <span className="eyebrow">
          {tx(
            language,
            "клинические ограничения",
            "clinical constraints",
          )}
        </span>
        <h2>
          {tx(
            language,
            "Доза, объём и риск — вместе с контекстом",
            "Dose, volume, and risk with their context",
          )}
        </h2>
        <p>
          {tx(
            language,
            "HFC не превращает все опубликованные числа в универсальные «пределы». Планировочная граница, точка риска и наблюдательный порог хранятся как разные типы доказательств.",
            "HFC does not convert every published number into a universal tolerance. Planning limits, risk points, and observational thresholds are stored as different evidence types.",
          )}
        </p>
        <div className="constraints-caution">
          <strong>
            {tx(
              language,
              "Начальный набор: HyTEC",
              "Initial dataset: HyTEC",
            )}
          </strong>
          <span>
            {tx(
              language,
              "Набор включает зрительные пути, головной мозг, спинной мозг, лёгкие, печень, токсичность prostate SBRT и крупные сосуды при повторном облучении. Рядом с каждым числом явно указан тип доказательства.",
              "The dataset covers optic pathways, brain, spinal cord, lung, liver, prostate-SBRT toxicity, and major-vessel reirradiation. Every number is explicitly labelled by evidence type.",
            )}
          </span>
        </div>
      </section>

      <section className="panel constraints-browser">
        <div className="constraints-filter-grid">
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
              {availableEndpoints.map((item) => (
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

          <label className="field">
            <span>
              {tx(
                language,
                "Число фракций",
                "Number of fractions",
              )}
            </span>
            <select
              value={fractionFilter}
              onChange={(event) =>
                setFractionFilter(event.target.value)
              }
            >
              <option value="all">
                {tx(language, "все", "all")}
              </option>
              {fractionOptions.map((fractions) => (
                <option
                  key={fractions}
                  value={String(fractions)}
                >
                  {fractions}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="constraints-context-line">
          <strong>
            {organLabel(language, endpoint?.organ ?? "")}
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
          {filtered.map((constraint) => {
            const source = sourceFor(constraint.sourceId);
            return (
              <article
                className="constraint-card"
                key={constraint.id}
              >
                <div className="constraint-card-top">
                  <div>
                    <span className="constraint-guidance-kind">
                      {guidanceLabel(
                        language,
                        constraint.guidanceKind,
                      )}
                    </span>
                    <strong>
                      {metricLabel(constraint.metric)}{" "}
                      {constraintValue(
                        language,
                        constraint,
                      )}
                    </strong>
                  </div>
                  <div className="constraint-risk">
                    <span>
                      {tx(
                        language,
                        "Оценка риска",
                        "Risk estimate",
                      )}
                    </span>
                    <strong>
                      {riskValue(language, constraint)}
                    </strong>
                  </div>
                </div>

                <dl className="constraint-meta">
                  <div>
                    <dt>
                      {tx(
                        language,
                        "Фракционирование",
                        "Fractionation",
                      )}
                    </dt>
                    <dd>
                      {constraint.fractionation?.fractions ??
                        "—"}{" "}
                      {tx(language, "фр.", "fx")}
                    </dd>
                  </div>
                  <div>
                    <dt>
                      {tx(
                        language,
                        "Предшествующее облучение",
                        "Prior radiotherapy",
                      )}
                    </dt>
                    <dd>
                      {priorRtLabel(
                        language,
                        constraint.priorRadiotherapy,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>
                      {tx(language, "Методика", "Technique")}
                    </dt>
                    <dd>
                      {constraint.technique?.join(", ") ?? "—"}
                    </dd>
                  </div>
                </dl>

                {source ? (
                  <div className="constraint-source">
                    <span>
                      {tx(language, "Источник", "Source")}
                    </span>
                    <p>{source.citation}</p>
                    <div>
                      {source.doi ? (
                        <a
                          href={"https://doi.org/" + source.doi}
                          target="_blank"
                          rel="noreferrer"
                        >
                          DOI {source.doi}
                        </a>
                      ) : null}
                      {source.pmid ? (
                        <a
                          href={
                            "https://pubmed.ncbi.nlm.nih.gov/" +
                            source.pmid +
                            "/"
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          PMID {source.pmid}
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
            "Как интерпретировать эти числа",
            "How to interpret these numbers",
          )}
        </strong>
        <p>
          {tx(
            language,
            "Точка риска описывает связь «доза–объём–исход» и не является автоматически рекомендуемым ограничением. Планировочная граница также действует только в области применимости публикации. HFC намеренно показывает тип доказательства рядом с числом.",
            "A risk point describes a dose-volume-outcome relationship and is not automatically a recommended constraint. A planning limit is also valid only within the publication's applicability domain. HFC deliberately displays the evidence type next to each number.",
          )}
        </p>
      </section>
    </main>
  );
}
