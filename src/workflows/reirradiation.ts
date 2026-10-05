import {
  bedGy,
  dosePerFractionForTargetEqdGy,
  eqdGy,
  totalDoseGy,
} from "../core/lq.js";
import type { DoseMetric } from "../domain/constraints.js";
import type {
  CumulativeDoseStrategy,
  ReirradiationClassification,
  ReirradiationCourse,
  ReirradiationCourseResult,
  ReirradiationEvaluationResult,
  ReirradiationScenarioContext,
  RemainingDoseBudgetResult,
} from "../domain/reirradiation.js";

function assertPositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be > 0.`);
  }
}

function assertFraction(
  value: number,
  name: string,
): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${name} must be between 0 and 1.`);
  }
}

function metricKey(metric: DoseMetric): string {
  switch (metric.kind) {
    case "Vx":
      return `Vx:${metric.xGy ?? "?"}`;
    case "custom":
      return `custom:${metric.customLabel?.trim() ?? ""}`;
    default:
      return metric.kind;
  }
}

function validateScalarMetric(
  metric: DoseMetric,
  strategy: CumulativeDoseStrategy,
): void {
  if (metric.kind === "Vx" || metric.kind === "mean-dose") {
    if (strategy !== "image-registration-3d") {
      throw new Error(
        `${metric.kind} is a volumetric metric. Consensus guidance requires full 3D equieffective dose accumulation for cumulative volumetric metrics.`,
      );
    }

    throw new Error(
      `${metric.kind} requires voxel-wise 3D equieffective dose accumulation, which is not implemented in reirradiation v0.1.`,
    );
  }

  if (
    metric.kind === "custom" &&
    (!metric.customLabel || metric.customLabel.trim() === "")
  ) {
    throw new Error(
      "A custom reirradiation dose metric requires a non-empty label.",
    );
  }
}

function recoveryDiscount(
  course: ReirradiationCourse,
): {
  fraction: number;
  rationale?: string;
} {
  if (course.role === "current") {
    if (
      course.recovery !== undefined &&
      course.recovery.mode !== "none"
    ) {
      throw new Error(
        "Recovery may only be applied to previously delivered courses, never to the current course.",
      );
    }
    return { fraction: 0 };
  }

  if (
    course.intervalToCurrentMonths !== undefined &&
    (!Number.isFinite(course.intervalToCurrentMonths) ||
      course.intervalToCurrentMonths < 0)
  ) {
    throw new RangeError(
      "intervalToCurrentMonths must be >= 0 when provided.",
    );
  }

  if (
    course.recovery === undefined ||
    course.recovery.mode === "none"
  ) {
    return { fraction: 0 };
  }

  assertFraction(
    course.recovery.discountFraction,
    "recovery discount fraction",
  );

  if (course.recovery.rationale.trim() === "") {
    throw new Error(
      "A manual recovery discount requires an explicit rationale.",
    );
  }

  return {
    fraction: course.recovery.discountFraction,
    rationale: course.recovery.rationale,
  };
}

function evaluateCourse(
  course: ReirradiationCourse,
  alphaBetaGy: number,
): ReirradiationCourseResult {
  const physicalDoseGy = totalDoseGy(course.schedule);
  const courseBedGy = bedGy(course.schedule, alphaBetaGy);
  const courseEqd2Gy = eqdGy(course.schedule, alphaBetaGy, 2);
  const recovery = recoveryDiscount(course);
  const retainedFraction = 1 - recovery.fraction;

  return {
    id: course.id,
    label: course.label,
    role: course.role,
    physicalDoseGy,
    bedGy: courseBedGy,
    eqd2Gy: courseEqd2Gy,
    recoveryDiscountFraction: recovery.fraction,
    adjustedBedGy: courseBedGy * retainedFraction,
    adjustedEqd2Gy: courseEqd2Gy * retainedFraction,
    ...(course.intervalToCurrentMonths !== undefined
      ? {
          intervalToCurrentMonths:
            course.intervalToCurrentMonths,
        }
      : {}),
    ...(recovery.rationale !== undefined
      ? { recoveryRationale: recovery.rationale }
      : {}),
  };
}

export function classifyReirradiation(
  geometricOverlap: boolean,
  cumulativeDoseToxicityConcern: boolean,
): ReirradiationClassification {
  if (geometricOverlap) return "type-I";
  if (cumulativeDoseToxicityConcern) return "type-II";
  return "repeat-irradiation";
}

function strategyWarnings(
  context: ReirradiationScenarioContext,
): string[] {
  const warnings: string[] = [];

  if (context.strategy === "image-registration-3d") {
    warnings.push(
      "Reirradiation v0.1 does not perform voxel-wise image registration or 3D dose accumulation. The selected 3D strategy is recorded for audit only; scalar course values must not be presented as a completed 3D accumulation.",
    );
  }

  if (
    context.strategy === "conservative-near-max" &&
    context.registrationSuitability !== "unsuitable" &&
    context.registrationSuitability !== "uncertain" &&
    context.previousDoseData === "complete-dicom"
  ) {
    warnings.push(
      "A conservative near-maximum point sum was selected despite complete prior DICOM data. Confirm why spatial cumulative dose evaluation is not appropriate or necessary.",
    );
  }

  if (
    context.strategy === "image-registration-3d" &&
    (context.registrationSuitability === "uncertain" ||
      context.registrationSuitability === "unsuitable")
  ) {
    warnings.push(
      "The selected 3D accumulation strategy conflicts with uncertain or unsuitable registration. A conservative point-based scenario should be considered instead.",
    );
  }

  if (
    context.previousDoseData === "summary-only" ||
    context.previousDoseData === "unknown"
  ) {
    warnings.push(
      "Previous treatment data are incomplete. Cumulative dose evaluation should document the missing information and use an appropriately conservative assessment strategy.",
    );
  }

  return warnings;
}

export function evaluateReirradiationScenario(
  courses: ReirradiationCourse[],
  alphaBetaGy: number,
  context: ReirradiationScenarioContext,
): ReirradiationEvaluationResult {
  assertPositive(alphaBetaGy, "alphaBetaGy");

  if (courses.length < 2) {
    throw new Error(
      "A reirradiation evaluation requires at least one previous course and one current course.",
    );
  }

  const currentCourses = courses.filter(
    (course) => course.role === "current",
  );
  if (currentCourses.length !== 1) {
    throw new Error(
      "A reirradiation evaluation requires exactly one current course.",
    );
  }

  const previousCourses = courses.filter(
    (course) => course.role === "previous",
  );
  if (previousCourses.length === 0) {
    throw new Error(
      "A reirradiation evaluation requires at least one previous course.",
    );
  }

  const expectedMetric = metricKey(courses[0]!.metric);
  for (const course of courses) {
    validateScalarMetric(course.metric, context.strategy);
    if (metricKey(course.metric) !== expectedMetric) {
      throw new Error(
        "All courses must refer to the same dose metric before scalar cumulative equieffective doses can be summed.",
      );
    }
  }

  const results = courses.map((course) =>
    evaluateCourse(course, alphaBetaGy),
  );

  const warnings = strategyWarnings(context);

  warnings.push(
    "Physical doses from separate courses are shown for audit only. Quantitative cumulative OAR evaluation must use consistently rescaled equieffective dose such as EQD2 or BED before summation.",
  );

  const recoveryApplied = results.some(
    (course) => course.recoveryDiscountFraction > 0,
  );
  if (recoveryApplied) {
    warnings.push(
      "A user-specified recovery discount was applied to previously delivered equieffective dose. HFC does not infer recovery automatically from elapsed time.",
    );
  }

  if (
    classifyReirradiation(
      context.geometricOverlap,
      context.cumulativeDoseToxicityConcern,
    ) === "repeat-irradiation"
  ) {
    warnings.push(
      "This scenario has neither geometric overlap nor a stated cumulative-dose toxicity concern and therefore does not meet the ESTRO-EORTC reirradiation definition.",
    );
  }

  if (context.strategy === "conservative-near-max") {
    warnings.push(
      "Near-maximum point-dose addition represents a conservative worst-case scenario and does not establish spatial co-location of dose maxima.",
    );
  }

  return {
    classification: classifyReirradiation(
      context.geometricOverlap,
      context.cumulativeDoseToxicityConcern,
    ),
    strategy: context.strategy,
    metric: courses[0]!.metric,
    alphaBetaGy,
    courses: results,
    cumulativePhysicalDoseGy: results.reduce(
      (sum, course) => sum + course.physicalDoseGy,
      0,
    ),
    cumulativeBedGy: results.reduce(
      (sum, course) => sum + course.adjustedBedGy,
      0,
    ),
    cumulativeEqd2Gy: results.reduce(
      (sum, course) => sum + course.adjustedEqd2Gy,
      0,
    ),
    warnings,
    audit: {
      previousDoseData: context.previousDoseData,
      registrationSuitability:
        context.registrationSuitability,
      recoveryApplied,
    },
  };
}

export function solveRemainingEqd2Budget(
  previousCourses: ReirradiationCourse[],
  metric: DoseMetric,
  cumulativeEqd2LimitGy: number,
  currentFractions: number,
  alphaBetaGy: number,
): RemainingDoseBudgetResult {
  assertPositive(cumulativeEqd2LimitGy, "cumulativeEqd2LimitGy");
  assertPositive(alphaBetaGy, "alphaBetaGy");

  if (
    !Number.isInteger(currentFractions) ||
    currentFractions <= 0
  ) {
    throw new RangeError(
      "currentFractions must be a positive integer.",
    );
  }

  validateScalarMetric(metric, "direct-point-sum");

  if (previousCourses.length === 0) {
    throw new Error(
      "At least one previous course is required to calculate a remaining reirradiation dose budget.",
    );
  }

  const expectedMetric = metricKey(metric);
  const priorResults = previousCourses.map((course) => {
    if (course.role !== "previous") {
      throw new Error(
        "Remaining-dose calculation accepts previous courses only.",
      );
    }
    if (metricKey(course.metric) !== expectedMetric) {
      throw new Error(
        "All previous courses must use the same dose metric as the requested cumulative limit.",
      );
    }
    return evaluateCourse(course, alphaBetaGy);
  });

  const adjustedPriorEqd2Gy = priorResults.reduce(
    (sum, course) => sum + course.adjustedEqd2Gy,
    0,
  );
  const remainingEqd2BudgetGy =
    cumulativeEqd2LimitGy - adjustedPriorEqd2Gy;

  const warnings: string[] = [
    "The remaining dose budget is a mathematical EQD2 budget for the selected metric. It is not an autonomous prescription or proof of clinical safety.",
  ];

  const recoveryApplied = priorResults.some(
    (course) => course.recoveryDiscountFraction > 0,
  );
  if (recoveryApplied) {
    warnings.push(
      "The remaining dose budget depends on user-specified recovery discount assumptions applied to prior equieffective dose.",
    );
  }

  if (remainingEqd2BudgetGy <= 0) {
    warnings.push(
      "The adjusted prior cumulative EQD2 already meets or exceeds the supplied cumulative limit.",
    );

    return {
      basis: "EQD2",
      cumulativeLimitGy: cumulativeEqd2LimitGy,
      adjustedPriorEqd2Gy,
      remainingEqd2BudgetGy,
      fractions: currentFractions,
      alphaBetaGy,
      maximumDosePerFractionGy: null,
      maximumTotalPhysicalDoseGy: null,
      limitAlreadyExceeded: true,
      warnings,
    };
  }

  const maximumDosePerFractionGy =
    dosePerFractionForTargetEqdGy(
      remainingEqd2BudgetGy,
      currentFractions,
      alphaBetaGy,
      2,
    );

  return {
    basis: "EQD2",
    cumulativeLimitGy: cumulativeEqd2LimitGy,
    adjustedPriorEqd2Gy,
    remainingEqd2BudgetGy,
    fractions: currentFractions,
    alphaBetaGy,
    maximumDosePerFractionGy,
    maximumTotalPhysicalDoseGy:
      maximumDosePerFractionGy * currentFractions,
    limitAlreadyExceeded: false,
    warnings,
  };
}
