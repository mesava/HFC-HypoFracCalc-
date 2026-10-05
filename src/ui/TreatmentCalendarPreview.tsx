import { useMemo, useState } from "react";
import {
  addCalendarDays,
  isWeekend,
  parseIsoDate,
  type CalendarFractionDay,
  type IsoDate,
  type TreatmentCalendarScenario,
} from "../workflows/treatmentCalendar.js";
import { tx } from "./i18n.js";
import type { Language } from "./labels.js";

type CalendarViewMode =
  | "planned"
  | "uncompensated"
  | "weekend"
  | "bid";

function dateLessThanOrEqual(a: IsoDate, b: IsoDate): boolean {
  return (
    parseIsoDate(a).getTime() <=
    parseIsoDate(b).getTime()
  );
}

function mondayOnOrBefore(date: IsoDate): IsoDate {
  const parsed = parseIsoDate(date);
  const day = parsed.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  return addCalendarDays(date, offset);
}

function sundayOnOrAfter(date: IsoDate): IsoDate {
  const parsed = parseIsoDate(date);
  const day = parsed.getUTCDay();
  const offset = day === 0 ? 0 : 7 - day;
  return addCalendarDays(date, offset);
}

function allDates(start: IsoDate, end: IsoDate): IsoDate[] {
  const values: IsoDate[] = [];
  let cursor = start;
  while (dateLessThanOrEqual(cursor, end)) {
    values.push(cursor);
    cursor = addCalendarDays(cursor, 1);
  }
  return values;
}

function selectedSchedule(
  scenario: TreatmentCalendarScenario,
  mode: CalendarViewMode,
): CalendarFractionDay[] {
  switch (mode) {
    case "planned":
      return scenario.planned;
    case "uncompensated":
      return scenario.uncompensated;
    case "weekend":
      return scenario.weekendRecovery;
    case "bid":
      return scenario.bidRecovery;
  }
}

function modeLabel(
  language: Language,
  mode: CalendarViewMode,
): string {
  switch (mode) {
    case "planned":
      return tx(language, "План", "Planned");
    case "uncompensated":
      return tx(language, "Без компенсации", "No compensation");
    case "weekend":
      return tx(language, "Выходные", "Weekend recovery");
    case "bid":
      return tx(language, "Две фракции/сут", "BID recovery");
  }
}

function monthLabel(
  language: Language,
  date: IsoDate,
): string {
  return new Intl.DateTimeFormat(
    language === "ru" ? "ru-RU" : "en-US",
    {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(parseIsoDate(date));
}

function dayNumber(date: IsoDate): number {
  return parseIsoDate(date).getUTCDate();
}

function inGap(
  date: IsoDate,
  scenario: TreatmentCalendarScenario,
): boolean {
  return (
    dateLessThanOrEqual(scenario.gapStartDate, date) &&
    dateLessThanOrEqual(date, scenario.gapEndDate)
  );
}

export function TreatmentCalendarPreview({
  language,
  scenario,
}: {
  language: Language;
  scenario: TreatmentCalendarScenario;
}) {
  const [mode, setMode] =
    useState<CalendarViewMode>("uncompensated");

  const schedule = selectedSchedule(scenario, mode);
  const scheduleByDate = useMemo(
    () =>
      new Map(
        schedule.map((day) => [day.date, day] as const),
      ),
    [schedule],
  );

  const lastTreatmentDate =
    schedule.at(-1)?.date ?? scenario.plannedEndDate;
  const gridStart = mondayOnOrBefore(scenario.startDate);
  const gridEnd = sundayOnOrAfter(
    dateLessThanOrEqual(
      scenario.plannedEndDate,
      lastTreatmentDate,
    )
      ? lastTreatmentDate
      : scenario.plannedEndDate,
  );
  const dates = allDates(gridStart, gridEnd);

  const weekdayLabels =
    language === "ru"
      ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const monthRangeLabel =
    monthLabel(language, scenario.startDate) +
    (parseIsoDate(lastTreatmentDate).getUTCMonth() !==
    parseIsoDate(scenario.startDate).getUTCMonth()
      ? " — " + monthLabel(language, lastTreatmentDate)
      : "");

  return (
    <div className="treatment-calendar-preview">
      <div className="calendar-preview-top">
        <div>
          <span className="eyebrow">
            {tx(language, "календарь", "calendar")}
          </span>
          <strong>{monthRangeLabel}</strong>
        </div>

        <div className="calendar-mode-switch">
          {(
            [
              "planned",
              "uncompensated",
              "weekend",
              "bid",
            ] as CalendarViewMode[]
          ).map((item) => (
            <button
              type="button"
              key={item}
              className={item === mode ? "active" : ""}
              onClick={() => setMode(item)}
            >
              {modeLabel(language, item)}
            </button>
          ))}
        </div>
      </div>

      <div className="calendar-weekdays">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="calendar-day-grid">
        {dates.map((date) => {
          const treatment = scheduleByDate.get(date);
          const gap = inGap(date, scenario);
          const weekend = isWeekend(date);
          const classNames = [
            "calendar-day",
            weekend ? "weekend" : "",
            gap ? "gap" : "",
            treatment ? "has-treatment" : "",
            treatment?.kind === "weekend-recovery"
              ? "weekend-recovery"
              : "",
            treatment?.kind === "bid-recovery"
              ? "bid-recovery"
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div className={classNames} key={date}>
              <span className="calendar-date-number">
                {dayNumber(date)}
              </span>
              {gap ? (
                <small>
                  {tx(language, "перерыв", "gap")}
                </small>
              ) : null}
              {treatment ? (
                <strong>
                  {treatment.fractions === 2
                    ? "×2"
                    : "●"}
                </strong>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span>
          <i className="legend-dot regular" />
          {tx(language, "фракция", "fraction")}
        </span>
        <span>
          <i className="legend-dot gap" />
          {tx(language, "перерыв", "gap")}
        </span>
        <span>
          <i className="legend-dot weekend" />
          {tx(
            language,
            "компенсация в выходной",
            "weekend recovery",
          )}
        </span>
        <span>
          <i className="legend-dot bid" />
          {tx(
            language,
            "две фракции в сутки",
            "twice daily",
          )}
        </span>
      </div>
    </div>
  );
}
