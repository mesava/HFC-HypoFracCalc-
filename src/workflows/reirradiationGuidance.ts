import { eqdGy } from "../core/lq.js";
import type { ReirradiationCourse } from "../domain/reirradiation.js";
import type {
  ReirradiationGuidanceAssessment,
  ReirradiationGuidanceCriterion,
} from "../domain/reirradiationGuidance.js";

const SOURCE_ID = "sahgal-2021-hytec-spinal-cord";
const GUIDANCE_ID = "hytec-spinal-cord-reirradiation-lower-risk-factors";
const ENDPOINT_ID = "spinal-cord-radiation-myelopathy";
const ALPHA_BETA_GY = 2;

function criterion(
  id: string,
  label: string,
  observedValue: number | undefined,
  relation: "<=" | ">=",
  limitValue: number,
  unit: "Gy EQD2_2" | "ratio" | "months",
  note?: string,
): ReirradiationGuidanceCriterion {
  if (
    observedValue === undefined ||
    !Number.isFinite(observedValue)
  ) {
    return {
      id,
      label,
      status: "not-assessable",
      relation,
      limitValue,
      unit,
      ...(note ? { note } : {}),
    };
  }

  const met =
    relation === "<="
      ? observedValue <= limitValue
      : observedValue >= limitValue;

  return {
    id,
    label,
    status: met ? "met" : "not-met",
    observedValue,
    relation,
    limitValue,
    unit,
    ...(note ? { note } : {}),
  };
}

/**
 * Evaluates the lower-risk factors reported in the HyTEC spinal-cord review
 * for reirradiation spine SBRT.
 *
 * This deliberately uses raw EQD2_2 with alpha/beta = 2 and ignores any
 * user-entered recovery discount. The published guidance is defined on that
 * basis and must not silently inherit a separate recovery assumption.
 */
export function assessHytecSpinalCordReirradiation(
  courses: ReirradiationCourse[],
  metricConfirmedAsThecalSacDmax: boolean,
): ReirradiationGuidanceAssessment {
  const warnings: string[] = [
    "HyTEC describes these values as factors associated with a lower risk of radiation myelopathy; they are suggestions rather than absolute tolerance limits.",
  ];
  const applicabilityReasons: string[] = [];

  const previous = courses.filter(
    (course) => course.role === "previous",
  );
  const current = courses.filter(
    (course) => course.role === "current",
  );

  if (current.length !== 1) {
    applicabilityReasons.push(
      "Exactly one current course is required.",
    );
  }

  if (previous.length !== 1) {
    applicabilityReasons.push(
      "This HyTEC reirradiation assessment is limited in HFC v0.1 to one previous course plus one current SBRT course.",
    );
  }

  if (
    courses.some((course) => course.metric.kind !== "Dmax")
  ) {
    applicabilityReasons.push(
      "The HyTEC guidance is defined for thecal-sac point maximum dose (Dmax).",
    );
  }

  if (!metricConfirmedAsThecalSacDmax) {
    applicabilityReasons.push(
      "The user must explicitly confirm that the entered Dmax represents the thecal-sac maximum dose.",
    );
  }

  const currentCourse = current[0];

  if (
    currentCourse &&
    (currentCourse.schedule.fractions < 1 ||
      currentCourse.schedule.fractions > 5)
  ) {
    applicabilityReasons.push(
      "The current SBRT course must contain 1 to 5 fractions for this HyTEC guidance.",
    );
  }

  if (
    courses.some(
      (course) =>
        course.recovery !== undefined &&
        course.recovery.mode === "manual-discount" &&
        course.recovery.discountFraction > 0,
    )
  ) {
    warnings.push(
      "User-specified recovery discounts are ignored for this HyTEC comparison. The published criteria are evaluated using raw cumulative EQD2_2.",
    );
  }

  const applicable = applicabilityReasons.length === 0;

  if (!applicable || !currentCourse || previous.length !== 1) {
    return {
      guidanceId: GUIDANCE_ID,
      sourceId: SOURCE_ID,
      endpointId: ENDPOINT_ID,
      applicable: false,
      applicabilityReasons,
      criteria: [],
      allAssessableCriteriaMet: null,
      warnings,
      calculationBasis: {
        alphaBetaGy: ALPHA_BETA_GY,
        metric: "Dmax",
        structure: "thecal-sac",
        recoveryDiscountApplied: false,
      },
    };
  }

  const previousCourse = previous[0]!;
  const previousEqd2 = eqdGy(
    previousCourse.schedule,
    ALPHA_BETA_GY,
    2,
  );
  const currentEqd2 = eqdGy(
    currentCourse.schedule,
    ALPHA_BETA_GY,
    2,
  );
  const cumulativeEqd2 = previousEqd2 + currentEqd2;
  const ratio =
    cumulativeEqd2 > 0 ? currentEqd2 / cumulativeEqd2 : undefined;
  const intervalMonths =
    previousCourse.intervalToCurrentMonths;

  const criteria = [
    criterion(
      "cumulative-eqd2-max",
      "Cumulative thecal-sac EQD2_2 Dmax",
      cumulativeEqd2,
      "<=",
      70,
      "Gy EQD2_2",
    ),
    criterion(
      "current-sbrt-eqd2-max",
      "Current SBRT thecal-sac EQD2_2 Dmax",
      currentEqd2,
      "<=",
      25,
      "Gy EQD2_2",
    ),
    criterion(
      "current-to-cumulative-ratio",
      "Current SBRT EQD2_2 / cumulative EQD2_2 ratio",
      ratio,
      "<=",
      0.5,
      "ratio",
    ),
    criterion(
      "minimum-interval",
      "Interval between courses",
      intervalMonths,
      ">=",
      5,
      "months",
      "The interval is stored independently and is not converted into an automatic tissue-recovery percentage.",
    ),
  ];

  const assessable = criteria.filter(
    (item) => item.status !== "not-assessable",
  );
  const allAssessableCriteriaMet =
    assessable.length === criteria.length
      ? assessable.every((item) => item.status === "met")
      : null;

  if (
    criteria.some(
      (item) => item.status === "not-assessable",
    )
  ) {
    warnings.push(
      "One or more HyTEC factors could not be assessed because the required input was missing.",
    );
  }

  return {
    guidanceId: GUIDANCE_ID,
    sourceId: SOURCE_ID,
    endpointId: ENDPOINT_ID,
    applicable: true,
    applicabilityReasons: [],
    criteria,
    allAssessableCriteriaMet,
    warnings,
    calculationBasis: {
      alphaBetaGy: ALPHA_BETA_GY,
      metric: "Dmax",
      structure: "thecal-sac",
      recoveryDiscountApplied: false,
    },
  };
}
