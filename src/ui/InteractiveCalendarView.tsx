import { useMemo, useState } from "react";
import {
  appendCalendarWeek,
  buildEditableCalendar,
  summarizeEditableCalendar,
  type EditableCalendarDay,
  type EditableFractionsPerDay,
} from "../workflows/interactiveCalendar.js";
import { parseIsoDate } from "../workflows/treatmentCalendar.js";
import { tx } from "./i18n.js";
import { formatUiNumber, type Language } from "./labels.js";

function weekdayLabel(language: Language, date: string) {
  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-GB", {
    weekday: "short",
    timeZone: "UTC",
  }).format(parseIsoDate(date));
}

function dateLabel(language: Language, date: string) {
  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(parseIsoDate(date));
}

type MetricId = "fractions" | "physical" | "eqd2" | "bed" | "ott" | "multi";

function MetricHelp({
  id, label, explanation, language, opened, toggle,
}: {
  id: MetricId; label: string; explanation: string;
  language: Language; opened: boolean; toggle: (id: MetricId) => void;
}) {
  const tipId = `calendar-tip-${id}`;
  return (
    <div className="calendar-metric-help">
      <span className="calendar-metric-label">{label}</span>
      <button
        type="button"
        className="calendar-metric-info"
        aria-label={tx(language, `Что означает «${label}»?`, `What does ${label} mean?`)}
        aria-controls={tipId}
        aria-expanded={opened}
        onClick={() => toggle(id)}
      >ⓘ</button>
      <div
        id={tipId}
        className={`calendar-metric-popover ${opened ? "open" : ""}`}
        role="tooltip"
      >{explanation}</div>
    </div>
  );
}

export function InteractiveCalendarView({ language }: { language: Language }) {
  const [startDate, setStartDate] = useState("2026-10-05");
  const [openedMetric, setOpenedMetric] = useState<MetricId | null>(null);
  const toggleMetric = (id: MetricId) =>
    setOpenedMetric((current) => current === id ? null : id);
  const [plannedFractions, setPlannedFractions] = useState("35");
  const [dosePerFraction, setDosePerFraction] = useState("2");
  const [alphaBeta, setAlphaBeta] = useState("10");
  const [repairHalfTime, setRepairHalfTime] = useState("4.4");
  const [interfractionHours, setInterfractionHours] = useState("8");
  const [days, setDays] = useState<EditableCalendarDay[]>(() =>
    buildEditableCalendar({
      startDate: "2026-10-05",
      plannedFractions: 35,
    }),
  );

  function rebuild() {
    try {
      setDays(
        buildEditableCalendar({
          startDate,
          plannedFractions: Number(plannedFractions),
        }),
      );
    } catch {
      // The summary panel will expose invalid numeric inputs.
    }
  }

  function changeFractions(date: string, delta: -1 | 1) {
    setDays((current) =>
      current.map((day) => {
        if (day.date !== date) return day;
        const next = Math.min(
          3,
          Math.max(0, day.fractions + delta),
        ) as EditableFractionsPerDay;
        return { ...day, fractions: next };
      }),
    );
  }

  const calculation = useMemo(() => {
    try {
      return {
        result: summarizeEditableCalendar(
          days,
          Number(dosePerFraction),
          Number(alphaBeta),
          {
            interfractionIntervalHours: Number(interfractionHours),
            repairHalfTimeHours: Number(repairHalfTime),
          },
        ),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Calculation failed.",
      };
    }
  }, [
    days,
    dosePerFraction,
    alphaBeta,
    interfractionHours,
    repairHalfTime,
  ]);

  const gy = language === "ru" ? "Гр" : "Gy";
  const result = "result" in calculation ? calculation.result : undefined;

  return (
    <main className="calendar-page">
      <section className="panel calendar-config">
        <div>
          <span className="eyebrow">
            {tx(language, "свободный календарь", "free calendar")}
          </span>
          <h2>
            {tx(
              language,
              "Редактируйте курс прямо по дням",
              "Edit the treatment course day by day",
            )}
          </h2>
          <p>
            {tx(
              language,
              "Нажимайте +/− в любом дне: можно удалить фракцию, перенести её на выходной, добавить BID или TID. BED/EQD₂ и общая продолжительность курса пересчитываются сразу.",
              "Use +/− on any day: remove a fraction, move it to a weekend, add BID or TID. BED/EQD₂ and overall treatment time update immediately.",
            )}
          </p>
        </div>

        <div className="calendar-config-grid">
          <label className="field">
            <span>{tx(language, "Дата начала", "Start date")}</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label className="field">
            <span>{tx(language, "Плановое число фракций", "Planned fractions")}</span>
            <input type="number" min="1" value={plannedFractions} onChange={(e) => setPlannedFractions(e.target.value)} />
          </label>
          <label className="field">
            <span>{tx(language, "Доза / фракцию, Гр", "Dose / fraction, Gy")}</span>
            <input type="number" min="0.01" step="0.01" value={dosePerFraction} onChange={(e) => setDosePerFraction(e.target.value)} />
          </label>
          <label className="field">
            <span>α/β, {gy}</span>
            <input type="number" min="0.01" step="0.1" value={alphaBeta} onChange={(e) => setAlphaBeta(e.target.value)} />
          </label>
          <label className="field">
            <span>T½, {tx(language, "ч", "h")}</span>
            <input type="number" min="0.01" step="0.1" value={repairHalfTime} onChange={(e) => setRepairHalfTime(e.target.value)} />
          </label>
          <label className="field">
            <span>Δt, {tx(language, "ч", "h")}</span>
            <input type="number" min="0.01" step="0.5" value={interfractionHours} onChange={(e) => setInterfractionHours(e.target.value)} />
          </label>
        </div>

        <div className="calendar-actions">
          <button type="button" className="primary-button" onClick={rebuild}>
            {tx(language, "Построить стандартный курс", "Build standard course")}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setDays((current) => appendCalendarWeek(current))}
          >
            {tx(language, "+ неделя", "+ week")}
          </button>
        </div>
      </section>

      <section className="panel editable-calendar-panel">
        <div className="calendar-legend">
          <span><i className="legend-dot planned" />{tx(language, "исходно запланировано", "originally planned")}</span>
          <span><i className="legend-dot edited" />{tx(language, "изменено", "edited")}</span>
        </div>

        <div className="editable-calendar-grid">
          {days.map((day) => {
            const edited = day.fractions !== (day.planned ? 1 : 0);
            return (
              <div
                key={day.date}
                className={[
                  "editable-day",
                  day.fractions > 0 ? "on" : "off",
                  edited ? "edited" : "",
                  day.fractions > 1 ? "multi" : "",
                ].filter(Boolean).join(" ")}
              >
                <div className="editable-day-head">
                  <span>{weekdayLabel(language, day.date)}</span>
                  <strong>{dateLabel(language, day.date)}</strong>
                </div>

                <div className="editable-day-dose">
                  <strong>{day.fractions}</strong>
                  <span>{tx(language, "фр.", "fx")}</span>
                </div>

                <div className="editable-day-controls">
                  <button
                    type="button"
                    aria-label={tx(language, "Уменьшить число фракций", "Decrease fractions")}
                    onClick={() => changeFractions(day.date, -1)}
                    disabled={day.fractions === 0}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label={tx(language, "Увеличить число фракций", "Increase fractions")}
                    onClick={() => changeFractions(day.date, 1)}
                    disabled={day.fractions === 3}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel calendar-summary">
        <span className="eyebrow">{tx(language, "сводка", "summary")}</span>
        {"error" in calculation ? (
          <div className="inline-alert">{calculation.error}</div>
        ) : result ? (
          <>
            <div className="metric-grid calendar-metrics">
              <div className="metric">
                <MetricHelp id="fractions" label={tx(language, "Фракций", "Fractions")} explanation={tx(language, "Суммарное число фракций по всем лечебным дням. Дни BID/TID дают две или три фракции.", "Total count of fractions across treatment days. BID/TID days contribute two or three fractions.")} language={language} opened={openedMetric === "fractions"} toggle={toggleMetric} />
                <strong>{result.totalFractions}</strong>
              </div>
              <div className="metric">
                <MetricHelp id="physical" label={tx(language, "Физическая доза", "Physical dose")} explanation={tx(language, "Сумма физической дозы: D = n × d, при одинаковой дозе за фракцию. Пространственное распределение не учитывается.", "Physical total dose: D = n × d, assuming equal dose per fraction. Spatial dose distribution is not modelled.")} language={language} opened={openedMetric === "physical"} toggle={toggleMetric} />
                <strong>{formatUiNumber(language, result.totalPhysicalDoseGy, 2)} {gy}</strong>
              </div>
              <div className="metric primary">
                <MetricHelp id="eqd2" label={"EQD₂"} explanation={tx(language, "Эквивалентная доза в фракциях по 2 Гр: EQD₂ = BED / (1 + 2/(α/β)). Включает поправку на неполное восстановление для BID/TID, но не учитывает репопуляцию за время курса.", "Equivalent dose in 2 Gy fractions: EQD₂ = BED / (1 + 2/(α/β)). Includes incomplete repair for BID/TID but not treatment-time repopulation.")} language={language} opened={openedMetric === "eqd2"} toggle={toggleMetric} />
                <strong>{formatUiNumber(language, result.eqd2Gy, 2)} {gy}</strong>
              </div>
              <div className="metric">
                <MetricHelp id="bed" label={"BED"} explanation={tx(language, "Биологически эффективная доза по LQ-модели. При нескольких фракциях за день учитывается Thames Hm; для одной фракции Hm = 0. Поправка на репопуляцию здесь отсутствует.", "Biologically effective dose under the LQ model. Multiple fractions/day include Thames Hm; for one fraction Hm = 0. No repopulation-time correction is applied here.")} language={language} opened={openedMetric === "bed"} toggle={toggleMetric} />
                <strong>{formatUiNumber(language, result.bedGy, 2)} {gy}</strong>
              </div>
              <div className="metric">
                <MetricHelp id="ott" label={"OTT"} explanation={tx(language, "Общая продолжительность лечения: число прошедших календарных суток между первой и последней фракцией (разность дат, не включительный подсчёт). В этом модуле OTT отображается, но не входит в BED/EQD₂.", "Overall Treatment Time: elapsed calendar days between first and last fractions (date difference, not inclusive day count). Here OTT is displayed but does not modify BED/EQD₂.")} language={language} opened={openedMetric === "ott"} toggle={toggleMetric} />
                <strong>{result.overallTreatmentDays} {tx(language, "дн.", "d")}</strong>
              </div>
              <div className="metric">
                <MetricHelp id="multi" label={"BID / TID"} explanation={tx(language, "Количество дней с двумя (BID) или тремя (TID) фракциями, а не количество самих фракций. Для неполного восстановления используются заданные T½ и Δt.", "Counts of days with two (BID) or three (TID) fractions, not the fraction count. Entered T½ and Δt determine incomplete repair.")} language={language} opened={openedMetric === "multi"} toggle={toggleMetric} />
                <strong>{result.bidDays} / {result.tidDays}</strong>
              </div>
            </div>

            {result.warnings.length > 0 ? (
              <div className="warning-card">
                <ul>{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
              </div>
            ) : null}
          </>
        ) : null}
      </section>

      <section className="panel site-safety">
        <strong>
          {tx(
            language,
            "Advanced calendar — инструмент моделирования",
            "Advanced calendar — modelling tool",
          )}
        </strong>
        <p>
          {tx(
            language,
            "TID оставлен только как расширенная возможность. Для BID/TID HFC применяет Thames Hm к указанным T½ и Δt; эти значения должны соответствовать выбранному клиническому исходу.",
            "TID is exposed only as an advanced option. For BID/TID, HFC applies Thames Hm using the entered T½ and Δt; these values must match the clinical endpoint.",
          )}
        </p>
      </section>
    </main>
  );
}
