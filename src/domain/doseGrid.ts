export type Vector3 = readonly [number, number, number];

export interface DoseGridGeometry {
  rows: number;
  columns: number;
  frames: number;

  /**
   * DICOM Pixel Spacing convention:
   * [row spacing, column spacing] in mm.
   */
  pixelSpacingMm: readonly [number, number];

  /** Image Position (Patient) of the first voxel plane, in mm. */
  imagePositionPatientMm: Vector3;

  /**
   * DICOM Image Orientation (Patient):
   * first direction-cosine triplet + second triplet.
   */
  imageOrientationPatient: readonly [
    number,
    number,
    number,
    number,
    number,
    number,
  ];

  /**
   * RTDOSE Grid Frame Offset Vector in mm.
   * Non-uniform frame spacing is therefore preserved.
   */
  gridFrameOffsetVectorMm: readonly number[];

  frameOfReferenceUid?: string;
}

export interface DoseGrid {
  geometry: DoseGridGeometry;

  /**
   * Dose values in Gy, flattened in frame-major order.
   * Length must equal rows * columns * frames.
   */
  doseValuesGy: readonly number[];
}

export interface VoxelDoseCourse {
  id: string;
  label: string;
  role: "previous" | "current";
  fractions: number;
  totalPhysicalDose: DoseGrid;

  /**
   * Explicit model assumption required for conversion from a cumulative
   * RTDOSE-like grid to voxel BED/EQD2.
   *
   * It means the same spatial dose distribution is assumed to be delivered
   * in every fraction, so voxel dose per fraction = total voxel dose / n.
   */
  fractionDoseModel: "uniform-course-fractions";

  /**
   * Explicit user-specified discount of a PREVIOUS course's equieffective
   * contribution. Never inferred from elapsed time.
   */
  recoveryDiscountFraction?: number;
  recoveryRationale?: string;
}

export interface VoxelDoseCourseResult {
  id: string;
  label: string;
  role: "previous" | "current";
  fractions: number;
  maxPhysicalDoseGy: number;
  maxVoxelDosePerFractionGy: number;
  recoveryDiscountFraction: number;
  bed: DoseGrid;
  eqd2: DoseGrid;
  adjustedBed: DoseGrid;
  adjustedEqd2: DoseGrid;
  warnings: string[];
}

export interface VoxelReirradiationResult {
  alphaBetaGy: number;
  geometry: DoseGridGeometry;
  courses: VoxelDoseCourseResult[];
  cumulativeBed: DoseGrid;
  cumulativeEqd2: DoseGrid;
  warnings: string[];
}
