import { assessLqApplicability } from "../core/lq.js";
import type {
  DoseGrid,
  DoseGridGeometry,
  Vector3,
  VoxelDoseCourse,
  VoxelDoseCourseResult,
  VoxelReirradiationResult,
} from "../domain/doseGrid.js";

export interface DoseGridGeometryTolerance {
  positionMm: number;
  spacingMm: number;
  frameOffsetMm: number;
  directionCosine: number;
}

export const defaultDoseGridGeometryTolerance:
  DoseGridGeometryTolerance = {
    positionMm: 1e-3,
    spacingMm: 1e-4,
    frameOffsetMm: 1e-3,
    directionCosine: 1e-6,
  };

function assertFinite(
  value: number,
  name: string,
): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite.`);
  }
}

function assertPositive(
  value: number,
  name: string,
): void {
  assertFinite(value, name);
  if (value <= 0) {
    throw new RangeError(`${name} must be > 0.`);
  }
}

function assertPositiveInteger(
  value: number,
  name: string,
): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(
      `${name} must be a positive integer.`,
    );
  }
}

function assertNonNegativeDose(
  value: number,
  index: number,
): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(
      `doseValuesGy[${index}] must be finite and >= 0.`,
    );
  }
}

function vectorNorm(vector: Vector3): number {
  return Math.sqrt(
    vector[0] ** 2 +
      vector[1] ** 2 +
      vector[2] ** 2,
  );
}

function dot(a: Vector3, b: Vector3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function validateOrientation(
  orientation: DoseGridGeometry["imageOrientationPatient"],
): void {
  orientation.forEach((value, index) =>
    assertFinite(
      value,
      `imageOrientationPatient[${index}]`,
    ),
  );

  const first: Vector3 = [
    orientation[0],
    orientation[1],
    orientation[2],
  ];
  const second: Vector3 = [
    orientation[3],
    orientation[4],
    orientation[5],
  ];

  if (
    Math.abs(vectorNorm(first) - 1) > 1e-3 ||
    Math.abs(vectorNorm(second) - 1) > 1e-3
  ) {
    throw new RangeError(
      "Image Orientation (Patient) direction vectors must be unit vectors within 1e-3.",
    );
  }

  if (Math.abs(dot(first, second)) > 1e-3) {
    throw new RangeError(
      "Image Orientation (Patient) direction vectors must be orthogonal within 1e-3.",
    );
  }
}

export function doseGridVoxelCount(
  geometry: DoseGridGeometry,
): number {
  return (
    geometry.rows *
    geometry.columns *
    geometry.frames
  );
}

export function validateDoseGrid(
  grid: DoseGrid,
): void {
  const geometry = grid.geometry;

  assertPositiveInteger(geometry.rows, "rows");
  assertPositiveInteger(geometry.columns, "columns");
  assertPositiveInteger(geometry.frames, "frames");

  if (
    geometry.gridFrameOffsetVectorMm.length !==
    geometry.frames
  ) {
    throw new RangeError(
      "gridFrameOffsetVectorMm length must equal the number of frames.",
    );
  }

  geometry.pixelSpacingMm.forEach((value, index) =>
    assertPositive(value, `pixelSpacingMm[${index}]`),
  );
  geometry.imagePositionPatientMm.forEach(
    (value, index) =>
      assertFinite(
        value,
        `imagePositionPatientMm[${index}]`,
      ),
  );
  geometry.gridFrameOffsetVectorMm.forEach(
    (value, index) =>
      assertFinite(
        value,
        `gridFrameOffsetVectorMm[${index}]`,
      ),
  );
  validateOrientation(
    geometry.imageOrientationPatient,
  );

  const expected = doseGridVoxelCount(geometry);
  if (grid.doseValuesGy.length !== expected) {
    throw new RangeError(
      `Dose grid contains ${grid.doseValuesGy.length} values but geometry requires ${expected}.`,
    );
  }

  grid.doseValuesGy.forEach(assertNonNegativeDose);
}

function close(
  a: number,
  b: number,
  tolerance: number,
): boolean {
  return Math.abs(a - b) <= tolerance;
}

function arraysClose(
  a: readonly number[],
  b: readonly number[],
  tolerance: number,
): boolean {
  return (
    a.length === b.length &&
    a.every((value, index) =>
      close(value, b[index]!, tolerance),
    )
  );
}

export function doseGridGeometryMatches(
  a: DoseGridGeometry,
  b: DoseGridGeometry,
  tolerance = defaultDoseGridGeometryTolerance,
): boolean {
  if (
    a.rows !== b.rows ||
    a.columns !== b.columns ||
    a.frames !== b.frames
  ) {
    return false;
  }

  if (
    a.frameOfReferenceUid &&
    b.frameOfReferenceUid &&
    a.frameOfReferenceUid !== b.frameOfReferenceUid
  ) {
    return false;
  }

  return (
    arraysClose(
      a.pixelSpacingMm,
      b.pixelSpacingMm,
      tolerance.spacingMm,
    ) &&
    arraysClose(
      a.imagePositionPatientMm,
      b.imagePositionPatientMm,
      tolerance.positionMm,
    ) &&
    arraysClose(
      a.imageOrientationPatient,
      b.imageOrientationPatient,
      tolerance.directionCosine,
    ) &&
    arraysClose(
      a.gridFrameOffsetVectorMm,
      b.gridFrameOffsetVectorMm,
      tolerance.frameOffsetMm,
    )
  );
}

export function assertSameDoseGridGeometry(
  reference: DoseGridGeometry,
  candidate: DoseGridGeometry,
  tolerance = defaultDoseGridGeometryTolerance,
): void {
  if (
    !doseGridGeometryMatches(
      reference,
      candidate,
      tolerance,
    )
  ) {
    throw new Error(
      "Dose grids do not share the same geometry. Voxel accumulation v0.1 requires already registered/resampled grids with matching rows, columns, frames, spacing, position, orientation, frame offsets, and compatible Frame of Reference.",
    );
  }
}

function gridWithValues(
  geometry: DoseGridGeometry,
  values: number[],
): DoseGrid {
  return {
    geometry,
    doseValuesGy: values,
  };
}

export function scaleDoseGrid(
  grid: DoseGrid,
  factor: number,
): DoseGrid {
  validateDoseGrid(grid);
  assertFinite(factor, "factor");
  if (factor < 0) {
    throw new RangeError("factor must be >= 0.");
  }

  return gridWithValues(
    grid.geometry,
    grid.doseValuesGy.map((value) => value * factor),
  );
}

export function addDoseGrids(
  grids: readonly DoseGrid[],
): DoseGrid {
  if (grids.length === 0) {
    throw new Error(
      "At least one dose grid is required for accumulation.",
    );
  }

  grids.forEach(validateDoseGrid);
  const reference = grids[0]!;
  for (const grid of grids.slice(1)) {
    assertSameDoseGridGeometry(
      reference.geometry,
      grid.geometry,
    );
  }

  const values = new Array<number>(
    reference.doseValuesGy.length,
  ).fill(0);

  for (const grid of grids) {
    grid.doseValuesGy.forEach((value, index) => {
      values[index] = values[index]! + value;
    });
  }

  return gridWithValues(reference.geometry, values);
}

export function convertPhysicalDoseGridToBed(
  totalPhysicalDose: DoseGrid,
  fractions: number,
  alphaBetaGy: number,
): DoseGrid {
  validateDoseGrid(totalPhysicalDose);
  assertPositiveInteger(fractions, "fractions");
  assertPositive(alphaBetaGy, "alphaBetaGy");

  return gridWithValues(
    totalPhysicalDose.geometry,
    totalPhysicalDose.doseValuesGy.map((totalDoseGy) => {
      if (totalDoseGy === 0) return 0;
      const dosePerFractionGy =
        totalDoseGy / fractions;
      return (
        totalDoseGy *
        (1 + dosePerFractionGy / alphaBetaGy)
      );
    }),
  );
}

export function convertPhysicalDoseGridToEqd2(
  totalPhysicalDose: DoseGrid,
  fractions: number,
  alphaBetaGy: number,
): DoseGrid {
  const bed = convertPhysicalDoseGridToBed(
    totalPhysicalDose,
    fractions,
    alphaBetaGy,
  );
  const denominator = 1 + 2 / alphaBetaGy;

  return gridWithValues(
    bed.geometry,
    bed.doseValuesGy.map(
      (value) => value / denominator,
    ),
  );
}

function maxDose(grid: DoseGrid): number {
  return grid.doseValuesGy.reduce(
    (maximum, value) => Math.max(maximum, value),
    0,
  );
}

function recoveryDiscount(
  course: VoxelDoseCourse,
): number {
  const value =
    course.recoveryDiscountFraction ?? 0;
  assertFinite(
    value,
    "recoveryDiscountFraction",
  );
  if (value < 0 || value > 1) {
    throw new RangeError(
      "recoveryDiscountFraction must be between 0 and 1.",
    );
  }

  if (course.role === "current" && value > 0) {
    throw new Error(
      "Recovery discount may only be applied to previous courses, never to the current course.",
    );
  }

  if (
    value > 0 &&
    (!course.recoveryRationale ||
      course.recoveryRationale.trim() === "")
  ) {
    throw new Error(
      "A voxel recovery discount requires an explicit rationale.",
    );
  }

  return value;
}

function evaluateCourse(
  course: VoxelDoseCourse,
  alphaBetaGy: number,
): VoxelDoseCourseResult {
  if (
    course.fractionDoseModel !==
    "uniform-course-fractions"
  ) {
    throw new Error(
      "Unsupported voxel fraction-dose model.",
    );
  }

  assertPositiveInteger(course.fractions, "fractions");
  validateDoseGrid(course.totalPhysicalDose);

  const bed = convertPhysicalDoseGridToBed(
    course.totalPhysicalDose,
    course.fractions,
    alphaBetaGy,
  );
  const eqd2 = convertPhysicalDoseGridToEqd2(
    course.totalPhysicalDose,
    course.fractions,
    alphaBetaGy,
  );
  const discount = recoveryDiscount(course);
  const retained = 1 - discount;
  const maxPhysicalDoseGy = maxDose(
    course.totalPhysicalDose,
  );
  const maxVoxelDosePerFractionGy =
    maxPhysicalDoseGy / course.fractions;

  const warnings = [
    "Voxel BED/EQD2 conversion assumes the total course dose distribution is delivered with the same spatial pattern in every fraction, so voxel dose per fraction equals total voxel dose divided by the course fraction count.",
  ];

  if (maxVoxelDosePerFractionGy > 0) {
    warnings.push(
      ...assessLqApplicability(
        maxVoxelDosePerFractionGy,
      ).messages,
    );
  }

  if (discount > 0) {
    warnings.push(
      "A user-specified recovery discount was applied after voxel-wise equieffective dose conversion. It was not inferred from elapsed time.",
    );
  }

  return {
    id: course.id,
    label: course.label,
    role: course.role,
    fractions: course.fractions,
    maxPhysicalDoseGy,
    maxVoxelDosePerFractionGy,
    recoveryDiscountFraction: discount,
    bed,
    eqd2,
    adjustedBed: scaleDoseGrid(bed, retained),
    adjustedEqd2: scaleDoseGrid(eqd2, retained),
    warnings,
  };
}

export function evaluateVoxelReirradiation(
  courses: readonly VoxelDoseCourse[],
  alphaBetaGy: number,
): VoxelReirradiationResult {
  assertPositive(alphaBetaGy, "alphaBetaGy");

  if (courses.length < 2) {
    throw new Error(
      "Voxel reirradiation evaluation requires at least one previous course and one current course.",
    );
  }

  const current = courses.filter(
    (course) => course.role === "current",
  );
  if (current.length !== 1) {
    throw new Error(
      "Voxel reirradiation evaluation requires exactly one current course.",
    );
  }

  const previous = courses.filter(
    (course) => course.role === "previous",
  );
  if (previous.length === 0) {
    throw new Error(
      "Voxel reirradiation evaluation requires at least one previous course.",
    );
  }

  const referenceGeometry =
    courses[0]!.totalPhysicalDose.geometry;
  for (const course of courses) {
    assertSameDoseGridGeometry(
      referenceGeometry,
      course.totalPhysicalDose.geometry,
    );
  }

  const results = courses.map((course) =>
    evaluateCourse(course, alphaBetaGy),
  );

  return {
    alphaBetaGy,
    geometry: referenceGeometry,
    courses: results,
    cumulativeBed: addDoseGrids(
      results.map((course) => course.adjustedBed),
    ),
    cumulativeEqd2: addDoseGrids(
      results.map((course) => course.adjustedEqd2),
    ),
    warnings: [
      "Voxel accumulation v0.1 performs no image registration, deformation, interpolation, or resampling. All input grids must already represent the same anatomical coordinate system and matching voxel geometry.",
      "Matching grid geometry is necessary but does not prove anatomically valid registration between treatment courses.",
      "Physical dose grids are not summed as the clinical cumulative OAR dose. Each course is converted voxel-wise to BED/EQD2 before accumulation.",
    ],
  };
}
