import { eqdGy } from "../core/lq.js";
import { reirradiationGuidanceSets } from "../data/evidence/v0.1/index.js";
import type { ReirradiationCourse } from "../domain/reirradiation.js";
import type {
  ReirradiationGuidanceAssessment,
  ReirradiationGuidanceCriterion,
  ReirradiationGuidanceCriterionDefinition,
  ReirradiationGuidanceQuantity,
} from "../domain/reirradiationGuidance.js";

const HYTEC_SPINAL_GUIDANCE_ID =
  "hytec-spinal-cord-reirradiation-lower-risk-factors";

function guidanceRecord() {
  const record = reirradiationGuidanceSets.find(
    (candidate) => candidate.id === HYTEC_SPINAL_GUIDANCE_ID,
  );
  if (!record) {
    throw new Error(
      "Evidence dataset error: HyTEC spinal reirradiation guidance record is missing.",
    );
  }
  return record;
}

function observedValueFor(
  quantity: ReirradiationGuidanceQuantity,
  previousEqd2: number,
  currentEqd2: number,
  intervalMonths: number | undefined,
): number | undefined {
  const cumulativeEqd2 = previousEqd2 + currentEqd2;

  switch (quantity) {
    case "cumulative-eqd2":
      return cumulativeEqd2;
    case "current-eqd2":
      return currentEqd2;
    case "current-to-cumulative-ratio":
      return cumulativeEqd2 > 0
        ? currentEqd2 / cumulativeEqd2
        : undefined;
    case "interval-months":
      return intervalMonths;
  }
}

function evaluateCriterion(
  definition: ReirradiationGuidanceCriterionDefinition,
  observedValue: number | undefined,
): ReirradiationGuidanceCriterion {
  if (
    observedValue === undefined ||
    !Number.isFinite(observedValue)
  ) {
    return {
      id: definition.id,
      label: definition.label,
      status: "not-assessable",
      relation: definition.relation,
      limitValue: definition.limitValue,
      unit: definition.unit,
      ...(definition.note
        ? { note: definition.note }
        : {}),
    };
  }

  const met =
    definition.relation === "<="
      ? observedValue <= definition.limitValue
      : observedValue >= definition.limitValue;

  return {
    id: definition.id,
    label: definition.label,
    status: met ? "met" : "not-met",
    observedValue,
    relation: definition.relation,
    limitValue: definition.limitValue,
    unit: definition.unit,
    ...(definition.note
      ? { note: definition.note }
      : {}),
  };
}

/**
 * Evaluates the HyTEC spinal-cord factors associated with lower risk of
 * radiation myelopathy for reirradiation spine SBRT.
 *
 * The evidence record defines EQD2_2 (alpha/beta = 2 Gy), thecal-sac Dmax,
 * 1-5 current SBRT fractions, one previous course, and four simultaneous
 * factors. User recovery discounts are deliberately ignored because the
 * published guidance is not defined on a recovery-discounted basis.
 */
export function assessHytecSpinalCordReirradiation(
  courses: ReirradiationCourse[],
  metricConfirmedAsThecalSacDmax: boolean,
): ReirradiationGuidanceAssessment {
  const guidance = guidanceRecord();
  const warnings = [...guidance.notes];
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

  if (
    previous.length !==
    guidance.maxPreviousCoursesSupported
  ) {
    applicabilityReasons.push(
      "This HyTEC reirradiation assessment is limited in HFC v0.1 to one previous course plus one current SBRT course.",
    );
  }

  if (
    courses.some(
      (course) =>
        course.metric.kind !== guidance.requiredMetric,
    )
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
    (currentCourse.schedule.fractions <
      guidance.currentFractionCountRange.min ||
      currentCourse.schedule.fractions >
        guidance.currentFractionCountRange.max)
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
      guidanceId: guidance.id,
      sourceId: guidance.sourceId,
      endpointId: guidance.endpointId,
      applicable: false,
      applicabilityReasons,
      criteria: [],
      allAssessableCriteriaMet: null,
      warnings,
      calculationBasis: {
        alphaBetaGy: guidance.alphaBetaGy,
        metric: guidance.requiredMetric,
        structure: guidance.requiredStructure,
        recoveryDiscountApplied: false,
      },
    };
  }

  const previousCourse = previous[0]!;
  const previousEqd2 = eqdGy(
    previousCourse.schedule,
    guidance.alphaBetaGy,
    2,
  );
  const currentEqd2 = eqdGy(
    currentCourse.schedule,
    guidance.alphaBetaGy,
    2,
  );

  const criteria = guidance.criteria.map((definition) =>
    evaluateCriterion(
      definition,
      observedValueFor(
        definition.quantity,
        previousEqd2,
        currentEqd2,
        previousCourse.intervalToCurrentMonths,
      ),
    ),
  );

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
    guidanceId: guidance.id,
    sourceId: guidance.sourceId,
    endpointId: guidance.endpointId,
    applicable: true,
    applicabilityReasons: [],
    criteria,
    allAssessableCriteriaMet,
    warnings,
    calculationBasis: {
      alphaBetaGy: guidance.alphaBetaGy,
      metric: guidance.requiredMetric,
      structure: guidance.requiredStructure,
      recoveryDiscountApplied: false,
    },
  };
}
