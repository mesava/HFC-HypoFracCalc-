export type IsoDate = string;

export interface CalendarFractionDay {
  date: IsoDate;
  fractions: 1 | 2;
  kind: "regular" | "weekend-recovery" | "bid-recovery";
}

export interface TreatmentCalendarScenario {
  startDate: IsoDate;
  plannedEndDate: IsoDate;
  gapStartDate: IsoDate;
  gapEndDate: IsoDate;
  gapCalendarDays: number;
  plannedFractions: number;
  deliveredFractionsBeforeGap: number;
  missedPlannedFractions: number;
  remainingFractionsAfterGap: number;
  planned: CalendarFractionDay[];
  uncompensated: CalendarFractionDay[];
  weekendRecovery: CalendarFractionDay[];
  bidRecovery: CalendarFractionDay[];
  plannedOverallTreatmentDays: number;
  uncompensatedOverallTreatmentDays: number;
  weekendOverallTreatmentDays: number;
  bidOverallTreatmentDays: number;
  weekendRecoveredFractions: number;
  bidRecoveredFractions: number;
  bidDays: number;
  warnings: string[];
}

export interface TreatmentCalendarInput {
  startDate: IsoDate;
  fractions: number;
  gapStartDate: IsoDate;
  gapEndDate: IsoDate;
  excludedDates?: IsoDate[];
}

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer.`);
  }
}

export function parseIsoDate(value: IsoDate): Date {
  if (!isoDatePattern.test(value)) {
    throw new RangeError(`Invalid ISO date: ${value}`);
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month! - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid calendar date: ${value}`);
  }
  return date;
}

export function toIsoDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

export function addCalendarDays(
  date: IsoDate,
  days: number,
): IsoDate {
  if (!Number.isInteger(days)) {
    throw new RangeError("days must be an integer.");
  }
  const parsed = parseIsoDate(date);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return toIsoDate(parsed);
}

export function calendarDaySpan(
  startDate: IsoDate,
  endDate: IsoDate,
): number {
  const start = parseIsoDate(startDate).getTime();
  const end = parseIsoDate(endDate).getTime();
  if (end < start) {
    throw new RangeError("endDate must not precede startDate.");
  }
  return Math.floor((end - start) / 86_400_000) + 1;
}

export function isWeekend(date: IsoDate): boolean {
  const day = parseIsoDate(date).getUTCDay();
  return day === 0 || day === 6;
}

function dateLessThan(a: IsoDate, b: IsoDate): boolean {
  return parseIsoDate(a).getTime() < parseIsoDate(b).getTime();
}

function dateLessThanOrEqual(
  a: IsoDate,
  b: IsoDate,
): boolean {
  return parseIsoDate(a).getTime() <= parseIsoDate(b).getTime();
}

function dateInRange(
  date: IsoDate,
  start: IsoDate,
  end: IsoDate,
): boolean {
  return (
    dateLessThanOrEqual(start, date) &&
    dateLessThanOrEqual(date, end)
  );
}

function nextAllowedDate(
  fromDate: IsoDate,
  predicate: (date: IsoDate) => boolean,
  excluded: Set<IsoDate>,
): IsoDate {
  let current = fromDate;
  for (let guard = 0; guard < 1000; guard += 1) {
    if (!excluded.has(current) && predicate(current)) {
      return current;
    }
    current = addCalendarDays(current, 1);
  }
  throw new Error("Unable to find an allowed treatment date.");
}

function generateOnePerWeekday(
  startDate: IsoDate,
  fractions: number,
  excluded: Set<IsoDate>,
): CalendarFractionDay[] {
  const days: CalendarFractionDay[] = [];
  let cursor = startDate;

  while (days.length < fractions) {
    const next = nextAllowedDate(
      cursor,
      (date) => !isWeekend(date),
      excluded,
    );
    days.push({
      date: next,
      fractions: 1,
      kind: "regular",
    });
    cursor = addCalendarDays(next, 1);
  }

  return days;
}

function ott(days: CalendarFractionDay[]): number {
  if (days.length === 0) {
    throw new Error("Treatment calendar cannot be empty.");
  }
  return calendarDaySpan(days[0]!.date, days.at(-1)!.date);
}

function preGapDays(
  planned: CalendarFractionDay[],
  gapStartDate: IsoDate,
): CalendarFractionDay[] {
  return planned.filter((day) =>
    dateLessThan(day.date, gapStartDate),
  );
}

function scheduleRemainingWeekdays(
  resumeDate: IsoDate,
  remainingFractions: number,
  excluded: Set<IsoDate>,
): CalendarFractionDay[] {
  return generateOnePerWeekday(
    resumeDate,
    remainingFractions,
    excluded,
  );
}

function scheduleWeekendRecovery(
  resumeDate: IsoDate,
  plannedEndDate: IsoDate,
  remainingFractions: number,
  excluded: Set<IsoDate>,
): {
  days: CalendarFractionDay[];
  weekendRecoveredFractions: number;
} {
  const regularCandidates: IsoDate[] = [];
  const weekendCandidates: IsoDate[] = [];

  let cursor = resumeDate;
  while (dateLessThanOrEqual(cursor, plannedEndDate)) {
    if (!excluded.has(cursor)) {
      if (isWeekend(cursor)) weekendCandidates.push(cursor);
      else regularCandidates.push(cursor);
    }
    cursor = addCalendarDays(cursor, 1);
  }

  const requiredWeekendFractions = Math.max(
    0,
    remainingFractions - regularCandidates.length,
  );
  const usedWeekendDates = weekendCandidates.slice(
    0,
    requiredWeekendFractions,
  );

  const scheduledWithinPlan = [
    ...regularCandidates.map((date) => ({
      date,
      fractions: 1 as const,
      kind: "regular" as const,
    })),
    ...usedWeekendDates.map((date) => ({
      date,
      fractions: 1 as const,
      kind: "weekend-recovery" as const,
    })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, remainingFractions);

  let remaining =
    remainingFractions - scheduledWithinPlan.length;
  const appended: CalendarFractionDay[] = [];
  cursor = addCalendarDays(plannedEndDate, 1);

  while (remaining > 0) {
    const next = nextAllowedDate(
      cursor,
      () => true,
      excluded,
    );
    appended.push({
      date: next,
      fractions: 1,
      kind: isWeekend(next)
        ? "weekend-recovery"
        : "regular",
    });
    remaining -= 1;
    cursor = addCalendarDays(next, 1);
  }

  const days = [...scheduledWithinPlan, ...appended].sort(
    (a, b) => a.date.localeCompare(b.date),
  );

  return {
    days,
    weekendRecoveredFractions: days.filter(
      (day) => day.kind === "weekend-recovery",
    ).length,
  };
}

function scheduleBidRecovery(
  resumeDate: IsoDate,
  plannedEndDate: IsoDate,
  remainingFractions: number,
  excluded: Set<IsoDate>,
): {
  days: CalendarFractionDay[];
  bidRecoveredFractions: number;
  bidDays: number;
} {
  const withinPlan: IsoDate[] = [];
  let cursor = resumeDate;

  while (dateLessThanOrEqual(cursor, plannedEndDate)) {
    if (!excluded.has(cursor) && !isWeekend(cursor)) {
      withinPlan.push(cursor);
    }
    cursor = addCalendarDays(cursor, 1);
  }

  const days: CalendarFractionDay[] = [];
  const extraNeededWithinPlan = Math.max(
    0,
    remainingFractions - withinPlan.length,
  );
  let extrasRemaining = Math.min(
    extraNeededWithinPlan,
    withinPlan.length,
  );
  let fractionsScheduled = 0;

  for (const date of withinPlan) {
    if (fractionsScheduled >= remainingFractions) break;
    const useBid =
      extrasRemaining > 0 &&
      fractionsScheduled + 2 <= remainingFractions;
    days.push({
      date,
      fractions: useBid ? 2 : 1,
      kind: useBid ? "bid-recovery" : "regular",
    });
    fractionsScheduled += useBid ? 2 : 1;
    if (useBid) extrasRemaining -= 1;
  }

  cursor = addCalendarDays(plannedEndDate, 1);
  while (fractionsScheduled < remainingFractions) {
    const next = nextAllowedDate(
      cursor,
      (date) => !isWeekend(date),
      excluded,
    );
    const fractionsLeft =
      remainingFractions - fractionsScheduled;
    const useBid = fractionsLeft >= 2;
    days.push({
      date: next,
      fractions: useBid ? 2 : 1,
      kind: useBid ? "bid-recovery" : "regular",
    });
    fractionsScheduled += useBid ? 2 : 1;
    cursor = addCalendarDays(next, 1);
  }

  const bidDays = days.filter(
    (day) => day.fractions === 2,
  ).length;

  return {
    days,
    bidRecoveredFractions: bidDays,
    bidDays,
  };
}

export function buildTreatmentCalendarScenario(
  input: TreatmentCalendarInput,
): TreatmentCalendarScenario {
  assertPositiveInteger(input.fractions, "fractions");
  parseIsoDate(input.startDate);
  parseIsoDate(input.gapStartDate);
  parseIsoDate(input.gapEndDate);

  if (
    dateLessThan(input.gapEndDate, input.gapStartDate)
  ) {
    throw new RangeError(
      "gapEndDate must not precede gapStartDate.",
    );
  }

  const excluded = new Set<IsoDate>(
    input.excludedDates ?? [],
  );
  for (const date of excluded) parseIsoDate(date);

  const planned = generateOnePerWeekday(
    input.startDate,
    input.fractions,
    excluded,
  );
  const plannedEndDate = planned.at(-1)!.date;

  if (dateLessThan(plannedEndDate, input.gapStartDate)) {
    throw new RangeError(
      "The interruption starts after the planned treatment has ended.",
    );
  }

  const deliveredBefore = preGapDays(
    planned,
    input.gapStartDate,
  );
  const deliveredFractionsBeforeGap =
    deliveredBefore.reduce(
      (sum, day) => sum + day.fractions,
      0,
    );

  const missedPlannedFractions = planned.filter((day) =>
    dateInRange(
      day.date,
      input.gapStartDate,
      input.gapEndDate,
    ),
  ).length;

  if (missedPlannedFractions === 0) {
    throw new RangeError(
      "The interruption interval does not contain any planned treatment fraction.",
    );
  }

  const remainingFractionsAfterGap =
    input.fractions - deliveredFractionsBeforeGap;
  const resumeDate = addCalendarDays(
    input.gapEndDate,
    1,
  );

  const uncompensatedPostGap = scheduleRemainingWeekdays(
    resumeDate,
    remainingFractionsAfterGap,
    excluded,
  );
  const uncompensated = [
    ...deliveredBefore,
    ...uncompensatedPostGap,
  ];

  const weekendPostGap = scheduleWeekendRecovery(
    resumeDate,
    plannedEndDate,
    remainingFractionsAfterGap,
    excluded,
  );
  const weekendRecovery = [
    ...deliveredBefore,
    ...weekendPostGap.days,
  ];

  const bidPostGap = scheduleBidRecovery(
    resumeDate,
    plannedEndDate,
    remainingFractionsAfterGap,
    excluded,
  );
  const bidRecovery = [
    ...deliveredBefore,
    ...bidPostGap.days,
  ];

  const warnings: string[] = [];
  if (excluded.size > 0) {
    warnings.push(
      "User-specified excluded dates were treated as unavailable treatment days in all calendar strategies.",
    );
  }

  return {
    startDate: input.startDate,
    plannedEndDate,
    gapStartDate: input.gapStartDate,
    gapEndDate: input.gapEndDate,
    gapCalendarDays: calendarDaySpan(
      input.gapStartDate,
      input.gapEndDate,
    ),
    plannedFractions: input.fractions,
    deliveredFractionsBeforeGap,
    missedPlannedFractions,
    remainingFractionsAfterGap,
    planned,
    uncompensated,
    weekendRecovery,
    bidRecovery,
    plannedOverallTreatmentDays: ott(planned),
    uncompensatedOverallTreatmentDays:
      ott(uncompensated),
    weekendOverallTreatmentDays:
      ott(weekendRecovery),
    bidOverallTreatmentDays: ott(bidRecovery),
    weekendRecoveredFractions:
      weekendPostGap.weekendRecoveredFractions,
    bidRecoveredFractions:
      bidPostGap.bidRecoveredFractions,
    bidDays: bidPostGap.bidDays,
    warnings,
  };
}
