/**
 * P7.2 — research-only semantic profiles derived from the seven original HyTEC
 * source PDFs recorded in docs/P6_2G_ALL_29_HYTEC_OAR_PRIMARY_PDF_CROSSWALK_2026-11-02.csv.
 *
 * This is a CONTEXT dictionary, not a collection of dose constraints or risks.
 * `source-metadata-compatible` NEVER means treatment suitability/clinical QA.
 * No PDF content, patient data, dose values or dose-volume limits are reproduced.
 */

export type HytecOarPopulation =
  | "lesions-near-optic-pathways"
  | "brain-metastases"
  | "de-novo-spine-sbrt"
  | "head-neck-reirradiation"
  | "small-peripheral-lung-sbrt"
  | "primary-hepatic-sbrt"
  | "liver-metastasis-sbrt"
  | "prostate-sbrt";

export type HytecReportingContour =
  | "optic-nerve-or-chiasm"
  | "brain-tissue-including-target"
  | "model-dependent-spinal-cord"
  | "carotid-major-vessel"
  | "both-lungs-minus-gtv-igtv"
  | "normal-liver-minus-gtv"
  | "bladder-source-defined"
  | "urethra-source-defined"
  | "rectum-source-defined";

export type HytecMetricMeaning =
  | "point-maximum"
  | "near-max-D0.5cc"
  | "mean-organ-dose"
  | "dose-threshold-volume"
  | "spared-volume-at-or-below-dose"
  | "prescription-relative-volume";

export interface HytecOarSourceProfile {
  /** Source cohort, NOT automatically evaluated patient eligibility. */
  readonly populations: readonly HytecOarPopulation[];
  /**
   * Exact source contour family. Prostate structures were heterogeneously
   * contoured across studies: a matching name alone is NOT a DVH equivalence.
   */
  readonly contour: HytecReportingContour;
  readonly metricMeaning: HytecMetricMeaning;
  /**
   * This is a recommendation context, not a universal time constraint:
   * Grimm D0.5cc planning guidance suggests avoiding consecutive fractions.
   */
  readonly schedule: "nonconsecutive-advised" | "not-established-as-common-rule";
  /** Documents methodological limitations; never substituted for a fitted NTCP. */
  readonly sourceRole:
    | "planning-guidance"
    | "observational-association"
    | "model-derived-risk-points"
    | "spared-volume-practice-without-fitted-risk";
  readonly contourComparability: "source-specific" | "mixed-or-uncertain";
}

interface ProfileGroup {
  readonly ids: readonly string[];
  readonly profile: HytecOarSourceProfile;
}

const groups = [
  {
    ids: [
      "hytec-optic-dmax-1fx-10gy", "hytec-optic-dmax-3fx-20gy", "hytec-optic-dmax-5fx-25gy",
    ],
    profile: {
      populations: ["lesions-near-optic-pathways"],
      contour: "optic-nerve-or-chiasm",
      metricMeaning: "point-maximum",
      schedule: "not-established-as-common-rule",
      sourceRole: "planning-guidance",
      contourComparability: "source-specific",
    },
  },
  {
    ids: [
      "hytec-brain-v12-5cc-symptomatic-rn",
      "hytec-brain-v12-10cc-symptomatic-rn",
      "hytec-brain-v12-over15cc-symptomatic-rn",
      "hytec-brain-v20-3fx-any-necrosis-edema",
      "hytec-brain-v20-3fx-resection",
      "hytec-brain-v24-5fx-any-necrosis-edema",
      "hytec-brain-v24-5fx-resection",
    ],
    profile: {
      populations: ["brain-metastases"],
      contour: "brain-tissue-including-target",
      metricMeaning: "dose-threshold-volume",
      schedule: "not-established-as-common-rule",
      sourceRole: "model-derived-risk-points",
      contourComparability: "mixed-or-uncertain", // source-pooling harmonised some V12 datasets
    },
  },
  {
    ids: [
      "hytec-cord-dmax-1fx-risk-range", "hytec-cord-dmax-2fx-17gy",
      "hytec-cord-dmax-3fx-20p3gy", "hytec-cord-dmax-4fx-23gy",
      "hytec-cord-dmax-5fx-25p3gy",
    ],
    profile: {
      populations: ["de-novo-spine-sbrt"],
      contour: "model-dependent-spinal-cord",
      metricMeaning: "point-maximum",
      schedule: "not-established-as-common-rule",
      sourceRole: "model-derived-risk-points",
      contourComparability: "mixed-or-uncertain", // thecal-sac vs true-cord endpoints
    },
  },
  {
    ids: ["hytec-major-vessel-d0p5cc-5fx-20gy"],
    profile: {
      populations: ["head-neck-reirradiation"],
      contour: "carotid-major-vessel",
      metricMeaning: "near-max-D0.5cc",
      schedule: "nonconsecutive-advised",
      sourceRole: "planning-guidance",
      contourComparability: "source-specific",
    },
  },
  {
    ids: [
      "hytec-major-vessel-dmax-5fx-20gy-risk",
      "hytec-major-vessel-dmax-5fx-30gy-risk",
    ],
    profile: {
      populations: ["head-neck-reirradiation"],
      contour: "carotid-major-vessel",
      metricMeaning: "point-maximum",
      schedule: "not-established-as-common-rule",
      sourceRole: "model-derived-risk-points",
      contourComparability: "mixed-or-uncertain", // pooled estimates are NOT the D0.5cc guidance
    },
  },
  {
    ids: ["hytec-lung-rilt-mean-dose-under8gy"],
    profile: {
      populations: ["small-peripheral-lung-sbrt"],
      contour: "both-lungs-minus-gtv-igtv",
      metricMeaning: "mean-organ-dose",
      schedule: "not-established-as-common-rule",
      sourceRole: "observational-association",
      contourComparability: "source-specific",
    },
  },
  {
    ids: ["hytec-lung-rilt-v20-10to15pct"],
    profile: {
      populations: ["small-peripheral-lung-sbrt"],
      contour: "both-lungs-minus-gtv-igtv",
      metricMeaning: "dose-threshold-volume",
      schedule: "not-established-as-common-rule",
      sourceRole: "observational-association",
      contourComparability: "source-specific",
    },
  },
  {
    ids: ["hytec-liver-primary-mld-3fx-13gy", "hytec-liver-primary-mld-6fx-18gy"],
    profile: {
      populations: ["primary-hepatic-sbrt"],
      contour: "normal-liver-minus-gtv",
      metricMeaning: "mean-organ-dose",
      schedule: "not-established-as-common-rule",
      sourceRole: "planning-guidance",
      contourComparability: "source-specific",
    },
  },
  {
    ids: ["hytec-liver-metastases-mld-3fx-15gy", "hytec-liver-metastases-mld-6fx-20gy"],
    profile: {
      populations: ["liver-metastasis-sbrt"],
      contour: "normal-liver-minus-gtv",
      metricMeaning: "mean-organ-dose",
      schedule: "not-established-as-common-rule",
      sourceRole: "planning-guidance",
      contourComparability: "source-specific",
    },
  },
  {
    ids: ["hytec-liver-spared-vle15gy-700cc", "hytec-liver-spared-vle17gy-700cc"],
    profile: {
      populations: ["primary-hepatic-sbrt", "liver-metastasis-sbrt"],
      contour: "normal-liver-minus-gtv",
      metricMeaning: "spared-volume-at-or-below-dose",
      schedule: "not-established-as-common-rule",
      sourceRole: "spared-volume-practice-without-fitted-risk",
      contourComparability: "source-specific",
    },
  },
  {
    ids: ["hytec-prostate-sbrt-bladder-vrx-5to10cc"],
    profile: {
      populations: ["prostate-sbrt"],
      contour: "bladder-source-defined",
      metricMeaning: "prescription-relative-volume",
      schedule: "not-established-as-common-rule",
      sourceRole: "observational-association",
      contourComparability: "mixed-or-uncertain",
    },
  },
  {
    ids: ["hytec-prostate-sbrt-urethra-dmax-38to42gy"],
    profile: {
      populations: ["prostate-sbrt"],
      contour: "urethra-source-defined",
      metricMeaning: "point-maximum",
      schedule: "not-established-as-common-rule",
      sourceRole: "observational-association",
      contourComparability: "mixed-or-uncertain",
    },
  },
  {
    ids: ["hytec-prostate-sbrt-rectum-dmax-35to38gy"],
    profile: {
      populations: ["prostate-sbrt"],
      contour: "rectum-source-defined",
      metricMeaning: "point-maximum",
      schedule: "not-established-as-common-rule",
      sourceRole: "observational-association",
      contourComparability: "mixed-or-uncertain",
    },
  },
] as const satisfies readonly ProfileGroup[];

const byId: Record<string, HytecOarSourceProfile> = {};
for (const { ids, profile } of groups) {
  for (const id of ids) {
    if (Object.prototype.hasOwnProperty.call(byId, id))
      throw new Error("Duplicate HyTEC source profile ID: " + id);
    byId[id] = profile;
  }
}
export const hytecOarSourceProfiles: Readonly<Record<string, HytecOarSourceProfile>> =
  Object.freeze(byId);
