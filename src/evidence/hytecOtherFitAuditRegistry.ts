import {
  endpoints, hytecClinicalConstraints, hytecOtherFitUncertaintyReviews,
  hytecOutcomeModels, sources,
} from "../data/evidence/v0.1/index.js";
import type { HytecOtherFitUncertaintyReview } from "../domain/hytecOtherFitUncertainty.js";

/** Source-integrity gates, not a licence for continuous patient predictions. */
export function validateHytecOtherFitUncertaintyReviews(
  reviews: HytecOtherFitUncertaintyReview[] = hytecOtherFitUncertaintyReviews,
): void {
  const sourcesSeen = new Set<string>();
  const variantIds = new Set<string>();
  for (const review of reviews) {
    if (sourcesSeen.has(review.sourceId)) throw Error("Duplicate HyTEC fit source "+review.sourceId);
    sourcesSeen.add(review.sourceId);
    const source = sources.find(s=>s.id===review.sourceId);
    if (!source || source.doi !== review.sourceDoi) {
      throw Error("Source/DOI mismatch "+review.sourceId);
    }
    if (!endpoints.some(x=>x.id===review.endpointId)) throw Error("Missing endpoint "+review.endpointId);
    if (review.researchOnly !== true || review.sourceConfidenceBandReproduced !== false) {
      throw Error("Forbidden source clinical confidence-band claim "+review.sourceId);
    }
    for (const variant of review.variants) {
      if (variantIds.has(variant.id)) throw Error("Duplicate HyTEC model variation "+variant.id);
      variantIds.add(variant.id);
      if (!variant.sourceLocator || !variant.doseAxis || !variant.noteRu || !variant.noteEn) {
        throw Error("Missing source/clinical caveat for "+variant.id);
      }
      if (variant.sampleCount !== undefined &&
          (!Number.isInteger(variant.sampleCount) || variant.sampleCount <= 0)) {
        throw Error("Invalid sample count "+variant.id);
      }
      for (const p of variant.modelParameters) {
        if (!Number.isFinite(p.value) || p.value <= 0) {
          throw Error("Invalid fit parameter "+variant.id);
        }
        if (p.ci95) {
          const {low,high}=p.ci95;
          if (!Number.isFinite(low) || low>p.value ||
              (high !== null && (!Number.isFinite(high) || high<p.value))) {
            throw Error("Invalid published source interval "+variant.id);
          }
        }
      }
      for (const point of variant.sourceOnlyRiskIntervals??[]) {
        if (!(point.bed10Gy>0 && point.estimate>=0 && point.estimate<=1 &&
          point.ci95.low>=0 && point.ci95.low<=point.estimate &&
          point.ci95.high>=point.estimate && point.ci95.high<=1)) {
          throw Error("Invalid original bootstrap estimate "+variant.id);
        }
      }
      if (variant.modelFamily==="source-bootstrap" &&
          (!variant.sourceOnlyRiskIntervals?.length ||
           variant.followUp!=="2-year")) {
        throw Error("Ohri source-only bootstrap must be 2-year "+variant.id);
      }
      if (variant.status==="source-numeric-discrepancy-unresolved" &&
          review.sourceId!=="royce-2021-hytec-prostate-tcp") {
        throw Error("Unrelated source mismatch "+variant.id);
      }
    }
  }
  const clinicalSourceIds=new Set([
    ...hytecOutcomeModels.map(x=>x.sourceId),
    ...hytecClinicalConstraints.map(x=>x.sourceId),
  ]);
  for (const id of sourcesSeen) {
    if (!clinicalSourceIds.has(id)) throw Error("Unlinked clinical source "+id);
  }
}
