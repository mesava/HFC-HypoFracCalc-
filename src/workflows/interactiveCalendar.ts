import { thamesHm } from "../core/repair.js";
import {
  addCalendarDays,
  calendarDaySpan,
  isWeekend,
  parseIsoDate,
  toIsoDate,
  type IsoDate,
} from "./treatmentCalendar.js";

export type EditableFractionsPerDay = 0 | 1 | 2 | 3;

export interface EditableCalendarDay {
  date: IsoDate;
  fractions: EditableFractionsPerDay;
  planned: boolean;
}

export interface EditableCalendarInput {
  startDate: IsoDate;
  plannedFractions: number;
  extraWeeks?: number;
}

export interface EditableCalendarSummary {
  totalFractions: number;
  treatmentDays: number;
  totalPhysicalDoseGy: number;
  bedGy: number;
  eqd2Gy: number;
  overallTreatmentDays: number;
  bidDays: number;
  tidDays: number;
  warnings: string[];
}

function mondayOnOrBefore(date: IsoDate): IsoDate {
  const parsed = parseIsoDate(date);
  const jsDay = parsed.getUTCDay();
  const offset = jsDay === 0 ? 6 : jsDay - 1;
  parsed.setUTCDate(parsed.getUTCDate() - offset);
  return toIsoDate(parsed);
}

export function buildEditableCalendar(
  input: EditableCalendarInput,
): EditableCalendarDay[] {
  if (!Number.isInteger(input.plannedFractions) || input.plannedFractions <= 0) {
    throw new RangeError("plannedFractions must be a positive integer.");
  }

  const extraWeeks = input.extraWeeks ?? 2;
  if (!Number.isInteger(extraWeeks) || extraWeeks < 0) {
    throw new RangeError("extraWeeks must be a non-negative integer.");
  }

  const firstGridDate = mondayOnOrBefore(input.startDate);
  const weeks = Math.ceil(input.plannedFractions / 5) + extraWeeks;
  const days: EditableCalendarDay[] = [];
  let remaining = input.plannedFractions;

  for (let index = 0; index < weeks * 7; index += 1) {
    const date = addCalendarDays(firstGridDate, index);
    const beforeStart = date < input.startDate;
    const shouldTreat =
      !beforeStart && !isWeekend(date) && remaining > 0;
    days.push({
      date,
      fractions: shouldTreat ? 1 : 0,
      planned: shouldTreat,
    });
    if (shouldTreat) remaining -= 1;
  }

  return days;
}

export function appendCalendarWeek(
  days: EditableCalendarDay[],
): EditableCalendarDay[] {
  if (days.length === 0) {
    throw new RangeError("calendar must contain at least one day.");
  }
  const start = addCalendarDays(days.at(-1)!.date, 1);
  return [
    ...days,
    ...Array.from({ length: 7 }, (_, index) => ({
      date: addCalendarDays(start, index),
      fractions: 0 as EditableFractionsPerDay,
      planned: false,
    })),
  ];
}

export function summarizeEditableCalendar(
  days: EditableCalendarDay[],
  dosePerFractionGy: number,
  alphaBetaGy: number,
  options?: {
    interfractionIntervalHours?: number;
    repairHalfTimeHours?: number;
  },
): EditableCalendarSummary {
  if (!Number.isFinite(dosePerFractionGy) || dosePerFractionGy <= 0) {
    throw new RangeError("dosePerFractionGy must be > 0.");
  }
  if (!Number.isFinite(alphaBetaGy) || alphaBetaGy <= 0) {
    throw new RangeError("alphaBetaGy must be > 0.");
  }

  const treatment = days.filter((day) => day.fractions > 0);
  if (treatment.length === 0) {
    throw new RangeError("calendar must contain at least one treatment day.");
  }

  const hasMultiFractionDays = treatment.some((day) => day.fractions > 1);
  const interval = options?.interfractionIntervalHours;
  const halfTime = options?.repairHalfTimeHours;

  if (
    hasMultiFractionDays &&
    (!Number.isFinite(interval) ||
      interval === undefined ||
      interval <= 0 ||
      !Number.isFinite(halfTime) ||
      halfTime === undefined ||
      halfTime <= 0)
  ) {
    throw new RangeError(
      "Positive interfraction interval and repair half-time are required for BID/TID calendar days.",
    );
  }

  let totalFractions = 0;
  let bedGy = 0;
  let bidDays = 0;
  let tidDays = 0;

  for (const day of treatment) {
    const m = day.fractions;
    totalFractions += m;
    if (m === 2) bidDays += 1;
    if (m === 3) tidDays += 1;

    const hm =
      m > 1
        ? thamesHm(m, interval!, halfTime!)
        : 0;
    bedGy +=
      m *
      dosePerFractionGy *
      (1 + (dosePerFractionGy * (1 + hm)) / alphaBetaGy);
  }

  const warnings: string[] = [];
  if (bidDays > 0 || tidDays > 0) {
    warnings.push(
      "Incomplete-repair correction assumes equally spaced fractions within each treatment day and complete repair before the next daily group.",
    );
  }
  if (tidDays > 0) {
    warnings.push(
      "Three fractions per day are exposed only as an advanced modelling option; clinical use requires protocol-specific justification.",
    );
  }

  return {
    totalFractions,
    treatmentDays: treatment.length,
    totalPhysicalDoseGy: totalFractions * dosePerFractionGy,
    bedGy,
    eqd2Gy: bedGy / (1 + 2 / alphaBetaGy),
    overallTreatmentDays:
      calendarDaySpan(treatment[0]!.date, treatment.at(-1)!.date) - 1,
    bidDays,
    tidDays,
    warnings,
  };
}
