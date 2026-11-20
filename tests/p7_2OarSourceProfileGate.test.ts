import { describe, expect, it } from "vitest";
import { hytecClinicalConstraints, evidenceManifest } from "../src/data/evidence/v0.1/index.js";
import type { ClinicalConstraint } from "../src/domain/constraints.js";
import { assessConstraintSourceContext } from "../src/research/constraintSourceContext.js";
import {
  hytecOarSourceProfiles,
  type HytecMetricMeaning,
  type HytecOarPopulation,
} from "../src/research/hytecOarSourceProfiles.js";

const byId = (id: string): ClinicalConstraint => {
  const record = hytecClinicalConstraints.find(c => c.id === id);
  if (!record) throw Error("Missing constraint " + id);
  return record;
};

const sourceContext = (id: string) => {
  const c = byId(id);
  const p = hytecOarSourceProfiles[id];
  if (!p) throw Error("Missing source profile " + id);
  return {
    metric: c.metric,
    unit: c.unit,
    fractions: c.fractionation?.fractions ?? c.applicability?.fractionCountRange?.min,
    radiationQuality: "photon" as const,
    technique: c.technique?.[0] ?? c.applicability?.technique?.[0],
    priorRadiotherapy: c.priorRadiotherapy === "yes" ? "yes" as const : "none" as const,
    volumeBasis: c.volumeBasis,
    sourceModelContour: c.doseRangeModelProvenance ? "thecal-sac" as const : undefined,
    prescriptionDoseGy: c.metric.kind === "custom" ? 40 : undefined,
    endpointId: c.endpointId,
    patientPopulation: p.populations[0],
    reportingContour: p.contour,
    fractionDeliveryPattern: "nonconsecutive" as const,
    populationReviewed: true,
  };
};

const expectedMetricMeaning = (c: ClinicalConstraint): HytecMetricMeaning => {
  if (c.metric.kind === "Dmax") return "point-maximum";
  if (c.metric.kind === "D0.5cc") return "near-max-D0.5cc";
  if (c.metric.kind === "mean-dose") return "mean-organ-dose";
  if (c.metric.kind === "Vx") return "dose-threshold-volume";
  if (c.metric.kind === "VleX") return "spared-volume-at-or-below-dose";
  if (c.metric.kind === "custom" && c.metric.customLabel === "V(Rx dose)")
    return "prescription-relative-volume";
  throw Error("New source metric requires new source review: " + c.metric.kind);
};

describe("P7.2: original HyTEC source-domain applicability metadata, research-only", () => {
  it("maps exactly all 29 existing source IDs to non-numerical profiles, without duplicates", () => {
    expect(evidenceManifest.releaseStatus).toBe("draft");
    expect(hytecClinicalConstraints).toHaveLength(29);
    const ids = hytecClinicalConstraints.map(c => c.id).sort();
    expect(Object.keys(hytecOarSourceProfiles).sort()).toEqual(ids);
    for (const c of hytecClinicalConstraints) {
      const p = hytecOarSourceProfiles[c.id];
      expect(p).toBeDefined();
      expect(p!.populations.length).toBeGreaterThan(0);
      expect(p!.metricMeaning).toBe(expectedMetricMeaning(c));
      const result = assessConstraintSourceContext(c, sourceContext(c.id));
      expect(result.clinicalUseApproved).toBe(false);
      expect(result.canAutoEnforce).toBe(false);
      expect(result.patientRiskCalculated).toBe(false);
      expect(result.status).not.toBe("incompatible");
    }
  });

  it("identifies normal-liver-minus-GTV for all four primary/metastasis MLD models", () => {
    for (const c of hytecClinicalConstraints.filter(c => c.id.includes("-liver-") && c.metric.kind === "mean-dose")) {
      expect(c.volumeBasis).toBe("normal-liver-minus-gtv");
      expect(hytecOarSourceProfiles[c.id]?.contour).toBe("normal-liver-minus-gtv");
      expect(assessConstraintSourceContext(c, sourceContext(c.id)).status).toBe("source-metadata-compatible");
    }
    const primary = byId("hytec-liver-primary-mld-3fx-13gy");
    const wrong = assessConstraintSourceContext(primary, {
      ...sourceContext(primary.id),
      patientPopulation: "liver-metastasis-sbrt",
    });
    expect(wrong.status).toBe("incompatible");
    expect(wrong.reasons).toContain("source-cohort-mismatch");
  });

  it("requires bilateral combined lungs minus GTV/IGTV for both MLD and V20", () => {
    for (const id of ["hytec-lung-rilt-mean-dose-under8gy", "hytec-lung-rilt-v20-10to15pct"]) {
      const c = byId(id);
      expect(c.volumeBasis).toBe("bilateral-lungs-minus-gtv-or-igtv");
      const result = assessConstraintSourceContext(c, {
        ...sourceContext(id),
        volumeBasis: "brain-minus-target",
      });
      expect(result.status).toBe("incompatible");
      expect(result.reasons).toContain("contour-basis-mismatch");
    }
  });

  it("does not promote V12 brain volume harmonisation to known direct-measured DVH provenance", () => {
    const c = byId("hytec-brain-v12-10cc-symptomatic-rn");
    const r = assessConstraintSourceContext(c, sourceContext(c.id));
    expect(r.status).toBe("indeterminate");
    expect(r.reasons).toContain("source-volume-harmonisation-uncertain");
    const wrong = assessConstraintSourceContext(c, {
      ...sourceContext(c.id),
      reportingContour: "normal-liver-minus-gtv",
    });
    expect(wrong.status).toBe("incompatible");
    expect(wrong.reasons).toContain("source-reporting-contour-mismatch");
  });

  it("keeps time-pattern guidance for major-vessel D0.5cc separate from pooled Dmax risk", () => {
    const c = byId("hytec-major-vessel-d0p5cc-5fx-20gy");
    const p = hytecOarSourceProfiles[c.id]!;
    expect(p.schedule).toBe("nonconsecutive-advised");
    expect(assessConstraintSourceContext(c, sourceContext(c.id)).status)
      .toBe("source-metadata-compatible");
    const daily = assessConstraintSourceContext(c, {
      ...sourceContext(c.id),
      fractionDeliveryPattern: "consecutive",
    });
    expect(daily.status).toBe("indeterminate");
    expect(daily.reasons).toContain("fraction-schedule-differs-from-guidance");
    const dmax = byId("hytec-major-vessel-dmax-5fx-20gy-risk");
    expect(hytecOarSourceProfiles[dmax.id]!.schedule).toBe("not-established-as-common-rule");
    expect(hytecOarSourceProfiles[dmax.id]!.metricMeaning).toBe("point-maximum");
  });

  it("flags cohort and endpoint mismatch independently of metric match", () => {
    const c = byId("hytec-optic-dmax-1fx-10gy");
    const wrong = assessConstraintSourceContext(c, {
      ...sourceContext(c.id),
      endpointId: "brain-symptomatic-radionecrosis",
      patientPopulation: "prostate-sbrt" as HytecOarPopulation,
    });
    expect(wrong.status).toBe("incompatible");
    expect(wrong.reasons).toContain("endpoint-mismatch");
    expect(wrong.reasons).toContain("source-cohort-mismatch");
    const unknown = assessConstraintSourceContext(c, {
      ...sourceContext(c.id),
      patientPopulation: undefined,
      reportingContour: undefined,
    });
    expect(unknown.status).toBe("indeterminate");
    expect(unknown.reasons).toContain("source-cohort-not-provided");
    expect(unknown.reasons).toContain("source-reporting-contour-not-provided");
  });

  it("preserves mixed-model spinal contours and extrapolation caveats", () => {
    const c = byId("hytec-cord-dmax-5fx-25p3gy");
    expect(hytecOarSourceProfiles[c.id]!.contour).toBe("model-dependent-spinal-cord");
    const lower = assessConstraintSourceContext(c, sourceContext(c.id));
    expect(lower.status).toBe("source-metadata-compatible");
    const upper = assessConstraintSourceContext(c, {
      ...sourceContext(c.id),
      sourceModelContour: "true-spinal-cord",
    });
    expect(upper.status).toBe("indeterminate");
    expect(upper.reasons).toContain("extrapolated-model-not-independently-validated");
  });

  it("preserves spared normal liver as unfitted practice rather than a liver-enzyme NTCP", () => {
    const id = "hytec-liver-spared-vle15gy-700cc";
    const c = byId(id);
    const p = hytecOarSourceProfiles[id]!;
    expect(c.guidanceKind).toBe("observational-threshold");
    expect(p.sourceRole).toBe("spared-volume-practice-without-fitted-risk");
    expect(p.populations).toEqual(["primary-hepatic-sbrt", "liver-metastasis-sbrt"]);
    const m = assessConstraintSourceContext(c, {
      ...sourceContext(id),
      patientPopulation: "liver-metastasis-sbrt",
    });
    expect(m.status).toBe("source-metadata-compatible");
    expect(m.patientRiskCalculated).toBe(false);
  });

  it("does not treat heterogeneous prostate Dmax contours as verified equivalent", () => {
    const id = "hytec-prostate-sbrt-urethra-dmax-38to42gy";
    const r = assessConstraintSourceContext(byId(id), sourceContext(id));
    expect(r.status).toBe("indeterminate");
    expect(r.reasons).toContain("source-contour-study-heterogeneity");
    expect(r.canAutoEnforce).toBe(false);
  });
});
