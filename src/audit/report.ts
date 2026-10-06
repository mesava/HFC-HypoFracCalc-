import type { CompareRegimensAuditRecord } from "./compareRegimensAudit.js";
import type { QuickEqdAuditRecord } from "./quickEqdAudit.js";
import type { TreatmentGapAuditRecord } from "./treatmentGapAudit.js";
import type { ReirradiationAuditRecord } from "../domain/audit.js";

export type PrintableAuditRecord =
  | QuickEqdAuditRecord
  | CompareRegimensAuditRecord
  | TreatmentGapAuditRecord
  | ReirradiationAuditRecord;

export type AuditReportLanguage = "ru" | "en";

function h(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function n(
  value: number | null | undefined,
  language: AuditReportLanguage,
  digits = 2,
): string {
  if (value === null || value === undefined) return "—";
  if (!Number.isFinite(value)) return h(value);
  return value.toLocaleString(
    language === "ru" ? "ru-RU" : "en-US",
    {
      maximumFractionDigits: digits,
      minimumFractionDigits: 0,
    },
  );
}

function t(
  language: AuditReportLanguage,
  ru: string,
  en: string,
): string {
  return language === "ru" ? ru : en;
}

function moduleTitle(
  record: PrintableAuditRecord,
  language: AuditReportLanguage,
): string {
  switch (record.module) {
    case "quick-eqd":
      return t(language, "Быстрый EQD", "Quick EQD");
    case "compare-regimens":
      return t(
        language,
        "Сравнение режимов",
        "Compare Regimens",
      );
    case "treatment-gap":
      return t(
        language,
        "Перерывы в лечении",
        "Treatment Gap",
      );
    case "reirradiation":
      return t(
        language,
        "Повторное облучение",
        "Reirradiation",
      );
  }
}

function sourceList(
  record: PrintableAuditRecord,
  language: AuditReportLanguage,
): string {
  if (record.sources.length === 0) {
    return `<p class="muted">${h(
      t(
        language,
        "Для этого расчёта нет библиографического источника параметра: использовано пользовательское значение.",
        "No parameter bibliography is attached to this calculation because a user-specified value was used.",
      ),
    )}</p>`;
  }

  return `<ol class="sources">${record.sources
    .map(
      (source) =>
        `<li><strong>${h(source.year)}</strong> · ${h(
          source.citation,
        )}${
          source.doi
            ? `<div class="source-id">DOI: ${h(source.doi)}</div>`
            : ""
        }${
          source.pmid
            ? `<div class="source-id">PMID: ${h(source.pmid)}</div>`
            : ""
        }</li>`,
    )
    .join("")}</ol>`;
}

function warningsSection(
  warnings: string[],
  language: AuditReportLanguage,
): string {
  if (warnings.length === 0) {
    return `<div class="ok-box">${h(
      t(
        language,
        "Встроенных предупреждений нет.",
        "No built-in warnings apply.",
      ),
    )}</div>`;
  }

  return `<div class="warning-box"><strong>${h(
    t(language, "Предупреждения", "Warnings"),
  )}</strong><ul>${warnings
    .map((warning) => `<li>${h(warning)}</li>`)
    .join("")}</ul></div>`;
}

function quickBody(
  record: QuickEqdAuditRecord,
  language: AuditReportLanguage,
): string {
  const sensitivity = record.result.alphaBetaSensitivity;
  return `
    <section>
      <h2>${h(t(language, "Входные данные", "Inputs"))}</h2>
      <div class="facts">
        <div><span>${h(t(language, "Орган", "Organ"))}</span><strong>${h(record.endpoint.organ)}</strong></div>
        <div><span>${h(t(language, "Клинический исход", "Clinical endpoint"))}</span><strong>${h(record.endpoint.label)}</strong></div>
        <div><span>α/β</span><strong>${n(record.alphaBeta.valueGy, language, 3)} Gy</strong></div>
        <div><span>${h(t(language, "Источник параметра", "Parameter source"))}</span><strong>${h(record.alphaBeta.selectionMode)}</strong></div>
        <div><span>n</span><strong>${h(record.input.fractions)}</strong></div>
        <div><span>d</span><strong>${n(record.input.dosePerFractionGy, language, 3)} Gy</strong></div>
      </div>
    </section>

    <section>
      <h2>${h(t(language, "Результат", "Result"))}</h2>
      <div class="result-grid">
        <div><span>${h(t(language, "Физическая доза", "Physical dose"))}</span><strong>${n(record.result.totalDoseGy, language)} Gy</strong></div>
        <div class="primary"><span>EQD₂</span><strong>${n(record.result.eqd2Gy, language)} Gy</strong></div>
        <div><span>BED</span><strong>${n(record.result.bedGy, language)} Gy</strong></div>
      </div>
      ${
        sensitivity
          ? `<div class="subsection">
              <h3>${h(
                t(
                  language,
                  "Чувствительность по 95% ДИ α/β",
                  "Sensitivity across the 95% CI of α/β",
                ),
              )}</h3>
              <p>α/β: ${n(
                sensitivity.alphaBetaCi95Gy.low,
                language,
              )}–${n(
                sensitivity.alphaBetaCi95Gy.high,
                language,
              )} Gy</p>
              <p>EQD₂: ${n(
                sensitivity.eqd2Gy.low,
                language,
              )}–${n(
                sensitivity.eqd2Gy.high,
                language,
              )} Gy</p>
              <p>BED: ${n(
                sensitivity.bedGy.low,
                language,
              )}–${
                sensitivity.bedGy.high === null
                  ? "∞"
                  : n(sensitivity.bedGy.high, language)
              } Gy</p>
            </div>`
          : ""
      }
      ${warningsSection(record.result.warnings, language)}
    </section>
  `;
}

function compareBody(
  record: CompareRegimensAuditRecord,
  language: AuditReportLanguage,
): string {
  const regimenHeader = record.regimens
    .map(
      (regimen) =>
        `<th>${h(regimen.label)}${
          regimen.id === record.referenceRegimenId
            ? `<small>${h(
                t(language, "референс", "reference"),
              )}</small>`
            : ""
        }<small>${h(regimen.schedule.fractions)} × ${n(
          regimen.schedule.dosePerFractionGy,
          language,
          3,
        )} Gy</small></th>`,
    )
    .join("");

  const rows = record.endpoints
    .map((entry) => {
      const cells = entry.comparison.cells
        .map(
          (cell) =>
            `<td><strong>${n(
              cell.result.eqd2Gy,
              language,
            )} Gy</strong><small>BED ${n(
              cell.result.bedGy,
              language,
            )} Gy</small><small>ΔEQD₂ ${n(
              cell.deltaEqd2Gy,
              language,
            )} Gy</small></td>`,
        )
        .join("");

      return `<tr>
        <th class="row-head">${h(entry.endpoint.organ)}<br><strong>${h(
          entry.endpoint.label,
        )}</strong><small>α/β = ${n(
          entry.alphaBeta.valueGy,
          language,
          3,
        )} Gy · ${h(entry.alphaBeta.selectionMode)}</small></th>
        ${cells}
      </tr>`;
    })
    .join("");

  const warnings = [
    ...new Set(
      record.endpoints.flatMap((entry) =>
        entry.comparison.cells.flatMap(
          (cell) => cell.result.warnings,
        ),
      ),
    ),
  ];

  return `
    <section>
      <h2>${h(t(language, "Матрица сравнения", "Comparison matrix"))}</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>${h(
            t(language, "Клинический исход", "Endpoint"),
          )}</th>${regimenHeader}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${warningsSection(warnings, language)}
    </section>
  `;
}

function treatmentGapBody(
  record: TreatmentGapAuditRecord,
  language: AuditReportLanguage,
): string {
  const baseline = record.baseline;
  const bid = record.strategies.bid;
  const dose = record.strategies.doseCompensation;

  const strategyRow = (
    label: string,
    value:
      | typeof record.strategies.weekend
      | typeof record.strategies.bid
      | typeof record.strategies.doseCompensation,
  ) => {
    if ("error" in value) {
      return `<tr><th>${h(label)}</th><td colspan="3" class="warning-text">${h(
        value.error,
      )}</td></tr>`;
    }

    return `<tr><th>${h(label)}</th>
      <td>${n(value.actualOverallTreatmentDays, language)} d</td>
      <td>${n(value.finalEffectiveEqd2Gy, language)} Gy</td>
      <td>${n(value.deltaEffectiveEqd2Gy, language)} Gy</td>
    </tr>`;
  };

  const warnings = [
    ...baseline.warnings,
    ...record.strategies.weekend.warnings,
    ...("error" in bid ? [] : bid.warnings),
    ...("error" in dose ? [] : dose.warnings),
    ...(record.calendarScenario?.warnings ?? []),
  ];

  return `
    <section>
      <h2>${h(t(language, "Исходный курс", "Planned course"))}</h2>
      <div class="facts">
        <div><span>${h(t(language, "Орган", "Organ"))}</span><strong>${h(record.endpoint.organ)}</strong></div>
        <div><span>${h(t(language, "Опухолевый исход", "Tumour endpoint"))}</span><strong>${h(record.endpoint.label)}</strong></div>
        <div><span>n × d</span><strong>${h(
          baseline.plannedSchedule.fractions,
        )} × ${n(
          baseline.plannedSchedule.dosePerFractionGy,
          language,
          3,
        )} Gy</strong></div>
        <div><span>α/β</span><strong>${n(
          baseline.alphaBetaGy,
          language,
          3,
        )} Gy</strong></div>
        <div><span>Dprolif</span><strong>${n(
          baseline.dProlifGyPerDay,
          language,
          3,
        )} Gy EQD₂/day</strong></div>
        <div><span>Tk</span><strong>${n(
          baseline.kickOffDays,
          language,
        )} d</strong></div>
        <div><span>${h(t(language, "Плановый OTT", "Planned OTT"))}</span><strong>${n(
          baseline.plannedOverallTreatmentDays,
          language,
        )} d</strong></div>
        <div><span>${h(t(language, "Перерыв", "Gap"))}</span><strong>${n(
          baseline.gapDays,
          language,
        )} d</strong></div>
      </div>
    </section>

    ${
      record.calendarScenario
        ? `<section>
            <h2>${h(
              t(language, "Календарь", "Calendar"),
            )}</h2>
            <div class="facts">
              <div><span>${h(
                t(language, "Начало лечения", "Treatment start"),
              )}</span><strong>${h(
                record.calendarScenario.startDate,
              )}</strong></div>
              <div><span>${h(
                t(language, "Плановый конец", "Planned end"),
              )}</span><strong>${h(
                record.calendarScenario.plannedEndDate,
              )}</strong></div>
              <div><span>${h(
                t(language, "Начало перерыва", "Gap start"),
              )}</span><strong>${h(
                record.calendarScenario.gapStartDate,
              )}</strong></div>
              <div><span>${h(
                t(language, "Конец перерыва", "Gap end"),
              )}</span><strong>${h(
                record.calendarScenario.gapEndDate,
              )}</strong></div>
              <div><span>${h(
                t(language, "Пропущено фракций", "Missed fractions"),
              )}</span><strong>${n(
                record.calendarScenario.missedPlannedFractions,
                language,
              )}</strong></div>
              <div><span>${h(
                t(language, "BID-дней", "BID days"),
              )}</span><strong>${n(
                record.calendarScenario.bidDays,
                language,
              )}</strong></div>
            </div>
          </section>`
        : ""
    }

    <section>
      <h2>${h(t(language, "Сравнение стратегий", "Strategy comparison"))}</h2>
      <table>
        <thead><tr>
          <th>${h(t(language, "Стратегия", "Strategy"))}</th>
          <th>OTT</th>
          <th>${h(t(language, "Эффективный EQD₂", "Effective EQD₂"))}</th>
          <th>ΔEQD₂</th>
        </tr></thead>
        <tbody>
          <tr><th>${h(
            t(language, "Без компенсации", "No compensation"),
          )}</th><td>${n(
            baseline.uncompensatedOverallTreatmentDays,
            language,
          )} d</td><td>${n(
            baseline.uncompensatedEffectiveEqd2Gy,
            language,
          )} Gy</td><td>${n(
            baseline.uncompensatedDeltaEffectiveEqd2Gy,
            language,
          )} Gy</td></tr>
          ${strategyRow(
            t(language, "Выходные", "Weekend recovery"),
            record.strategies.weekend,
          )}
          ${strategyRow(
            t(language, "Две фракции в сутки", "BID recovery"),
            record.strategies.bid,
          )}
          ${strategyRow(
            t(language, "Компенсация дозой", "Dose compensation"),
            record.strategies.doseCompensation,
          )}
        </tbody>
      </table>
      ${warningsSection([...new Set(warnings)], language)}
    </section>
  `;
}

function doseMetricText(
  metric: ReirradiationAuditRecord["metric"],
): string {
  if (metric.kind === "custom") {
    return metric.customLabel || "custom";
  }
  if (metric.kind === "Vx") {
    return metric.xGy !== undefined
      ? `V${metric.xGy}Gy`
      : "Vx";
  }
  return metric.kind;
}

function reirradiationBody(
  record: ReirradiationAuditRecord,
  language: AuditReportLanguage,
): string {
  const rows = record.result.courses
    .map(
      (course) =>
        `<tr>
          <th>${h(course.label)}<small>${h(course.role)}</small></th>
          <td>${n(course.physicalDoseGy, language)} Gy</td>
          <td>${n(course.bedGy, language)} Gy</td>
          <td>${n(course.eqd2Gy, language)} Gy</td>
          <td>${n(course.adjustedEqd2Gy, language)} Gy</td>
        </tr>`,
    )
    .join("");

  const guidance = record.guidance
    ? `<section>
        <h2>${h(
          t(
            language,
            "Специальная проверка для повторного облучения",
            "Reirradiation-specific guidance",
          ),
        )}</h2>
        <p><strong>${h(record.guidance.guidanceId)}</strong></p>
        ${
          record.guidance.applicable
            ? `<table><thead><tr><th>${h(
                t(language, "Критерий", "Criterion"),
              )}</th><th>${h(
                t(language, "Наблюдаемое", "Observed"),
              )}</th><th>${h(
                t(language, "Граница", "Limit"),
              )}</th><th>${h(
                t(language, "Статус", "Status"),
              )}</th></tr></thead><tbody>${record.guidance.criteria
                .map(
                  (criterion) =>
                    `<tr><th>${h(
                      criterion.label,
                    )}</th><td>${n(
                      criterion.observedValue,
                      language,
                      3,
                    )} ${h(
                      criterion.unit ?? "",
                    )}</td><td>${h(
                      criterion.relation ?? "",
                    )} ${n(
                      criterion.limitValue,
                      language,
                      3,
                    )} ${h(
                      criterion.unit ?? "",
                    )}</td><td>${h(
                      criterion.status,
                    )}</td></tr>`,
                )
                .join("")}</tbody></table>`
            : `<div class="warning-box">${h(
                record.guidance.applicabilityReasons.join(
                  " · ",
                ),
              )}</div>`
        }
      </section>`
    : "";

  return `
    <section>
      <h2>${h(t(language, "Контекст", "Context"))}</h2>
      <div class="facts">
        <div><span>${h(t(language, "Орган", "Organ"))}</span><strong>${h(record.endpoint.organ)}</strong></div>
        <div><span>${h(t(language, "Клинический исход", "Clinical endpoint"))}</span><strong>${h(record.endpoint.label)}</strong></div>
        <div><span>${h(t(language, "Дозовая метрика", "Dose metric"))}</span><strong>${h(doseMetricText(record.metric))}</strong></div>
        <div><span>α/β</span><strong>${n(record.alphaBeta.valueGy, language, 3)} Gy</strong></div>
        <div><span>${h(t(language, "Классификация", "Classification"))}</span><strong>${h(record.result.classification)}</strong></div>
        <div><span>${h(t(language, "Способ оценки", "Assessment strategy"))}</span><strong>${h(record.context.strategy)}</strong></div>
      </div>
    </section>

    <section>
      <h2>${h(t(language, "Курсы и кумулятивная доза", "Courses and cumulative dose"))}</h2>
      <table>
        <thead><tr><th>${h(
          t(language, "Курс", "Course"),
        )}</th><th>D</th><th>BED</th><th>EQD₂</th><th>${h(
          t(language, "Скорректированный вклад", "Adjusted contribution"),
        )}</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><th>${h(
          t(language, "Кумулятивно", "Cumulative"),
        )}</th><td>${n(
          record.result.cumulativePhysicalDoseGy,
          language,
        )} Gy</td><td>${n(
          record.result.cumulativeBedGy,
          language,
        )} Gy</td><td colspan="2"><strong>${n(
          record.result.cumulativeEqd2Gy,
          language,
        )} Gy EQD₂</strong></td></tr></tfoot>
      </table>
      ${
        record.budget
          ? `<div class="subsection">
              <h3>${h(
                t(language, "Остаточный EQD₂-бюджет", "Remaining EQD₂ budget"),
              )}</h3>
              <p>${h(
                t(language, "Кумулятивная граница", "Cumulative limit"),
              )}: ${n(record.budget.cumulativeLimitGy, language)} Gy</p>
              <p>${h(
                t(language, "Предыдущий вклад", "Prior contribution"),
              )}: ${n(record.budget.adjustedPriorEqd2Gy, language)} Gy</p>
              <p>${h(
                t(language, "Остаток", "Remaining"),
              )}: ${n(record.budget.remainingEqd2BudgetGy, language)} Gy</p>
            </div>`
          : ""
      }
      ${warningsSection(record.result.warnings, language)}
    </section>
    ${guidance}
  `;
}

function recordBody(
  record: PrintableAuditRecord,
  language: AuditReportLanguage,
): string {
  switch (record.module) {
    case "quick-eqd":
      return quickBody(record, language);
    case "compare-regimens":
      return compareBody(record, language);
    case "treatment-gap":
      return treatmentGapBody(record, language);
    case "reirradiation":
      return reirradiationBody(record, language);
  }
}

export function buildPrintableAuditHtml(
  record: PrintableAuditRecord,
  language: AuditReportLanguage,
): string {
  const title = moduleTitle(record, language);
  const generated = new Date(
    record.generatedAtIso,
  ).toLocaleString(
    language === "ru" ? "ru-RU" : "en-US",
  );

  return `<!doctype html>
<html lang="${language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>HFC — ${h(title)}</title>
<style>
  :root { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #253940; background: #eef3f4; }
  * { box-sizing: border-box; }
  body { margin: 0; }
  .toolbar { position: sticky; top: 0; z-index: 2; display: flex; justify-content: flex-end; padding: 12px 18px; background: rgba(238,243,244,.95); border-bottom: 1px solid #d8e2e5; }
  button { border: 0; border-radius: 8px; padding: 9px 14px; font: inherit; font-weight: 700; cursor: pointer; background: #315c64; color: white; }
  main { width: min(1040px, calc(100% - 32px)); margin: 24px auto 48px; }
  header { padding: 22px 24px; background: #294f57; color: white; border-radius: 16px; }
  header .brand { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; opacity: .75; }
  h1 { margin: 6px 0 10px; font-size: 28px; }
  .meta { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 12px; opacity: .85; }
  section { margin-top: 16px; padding: 18px 20px; background: white; border: 1px solid #dce5e7; border-radius: 14px; }
  h2 { margin: 0 0 14px; font-size: 17px; color: #31545b; }
  h3 { margin: 0 0 9px; font-size: 14px; }
  .facts, .result-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap: 9px; }
  .facts > div, .result-grid > div { padding: 10px 12px; border-radius: 9px; background: #f5f8f8; }
  .facts span, .result-grid span { display: block; color: #6c7c82; font-size: 11px; }
  .facts strong, .result-grid strong { display: block; margin-top: 3px; font-size: 14px; }
  .result-grid .primary { background: #e8f1f2; }
  .subsection { margin-top: 12px; padding: 12px; border-left: 3px solid #7d9da3; background: #f7f9f9; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { padding: 9px; border: 1px solid #dce4e6; vertical-align: top; text-align: left; }
  thead th { background: #eef4f5; color: #405b62; }
  th small, td small { display: block; margin-top: 3px; color: #718086; font-weight: 400; }
  .row-head { min-width: 180px; }
  .table-wrap { overflow-x: auto; }
  .warning-box, .ok-box { margin-top: 12px; padding: 11px 13px; border-radius: 9px; font-size: 11px; line-height: 1.5; }
  .warning-box { background: #fff7f4; border-left: 4px solid #b77d6e; }
  .ok-box { background: #f0f7f2; border-left: 4px solid #759a84; }
  .warning-text { color: #985e50; }
  .sources { padding-left: 20px; font-size: 11px; line-height: 1.5; }
  .sources li { margin-bottom: 10px; }
  .source-id { color: #748187; }
  .muted { color: #748187; font-size: 11px; }
  .safety { border-left: 4px solid #a58f57; background: #fffdf5; }
  footer { margin: 18px 4px; color: #75838a; font-size: 10px; }
  @page { size: A4; margin: 14mm; }
  @media print {
    :root, body { background: white; }
    .toolbar { display: none; }
    main { width: 100%; margin: 0; }
    header { border-radius: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    section { break-inside: avoid; border-radius: 0; }
    .table-wrap { overflow: visible; }
    .warning-box, .ok-box, .facts > div, .result-grid > div, thead th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="toolbar"><button onclick="window.print()">${h(
    t(language, "Печать / сохранить PDF", "Print / save PDF"),
  )}</button></div>
<main>
  <header>
    <div class="brand">HFC · HypoFracCalc</div>
    <h1>${h(title)}</h1>
    <div class="meta">
      <span>${h(
        t(language, "Сформировано", "Generated"),
      )}: ${h(generated)}</span>
      <span>Engine: ${h(record.engineVersion)}</span>
      <span>Evidence: ${h(
        record.evidence.datasetVersion,
      )}</span>
      <span>Schema: ${h(record.schemaVersion)}</span>
    </div>
  </header>

  ${recordBody(record, language)}

  <section>
    <h2>${h(t(language, "Источники", "Sources"))}</h2>
    ${sourceList(record, language)}
  </section>

  <section class="safety">
    <h2>${h(
      t(language, "Назначение и ограничения", "Intended use and limitations"),
    )}</h2>
    <p>${h(record.safetyStatement)}</p>
  </section>

  <footer>
    HFC · ${h(record.module)} · ${h(record.generatedAtIso)}
  </footer>
</main>
</body>
</html>`;
}

export function openPrintableAuditReport(
  record: PrintableAuditRecord,
  language: AuditReportLanguage,
): void {
  const popup = window.open("", "_blank");
  if (!popup) {
    throw new Error(
      "The printable audit report could not be opened. Allow pop-ups for this site and try again.",
    );
  }

  popup.opener = null;
  popup.document.open();
  popup.document.write(
    buildPrintableAuditHtml(record, language),
  );
  popup.document.close();
}
