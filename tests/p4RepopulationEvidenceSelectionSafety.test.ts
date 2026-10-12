import { describe, expect, it } from "vitest";
import { repopulationRateEstimates, evidenceManifest } from "../src/data/evidence/v0.1/index.js";
import { getRepopulationEstimates, getPreferredRepopulationEstimate, resolveRepopulationSelection } from "../src/evidence/repopulationRegistry.js";
import { buildTreatmentGapBaseline } from "../src/workflows/treatmentGap.js";

/**
 * P4 fail-closed safety containment. This does not estimate the original
 * Hinata tBEDmax endpoint or clinically validate a BED-to-EQD2 conversion.
 * Previous recorded evidence remains available for audit and comparison,
 * while new dose-compensation calculations cannot use unsafe source IDs.
 */
const deprecated=[
  "dprolif-hn-various-bcr2025",
  "dprolif-hn-larynx-bcr2025",
] as const;
const tBedModels=[
  "dprolif-medulloblastoma-bcr2025",
  "dprolif-medulloblastoma-tk21-hinata2001",
] as const;
const record=(id:string)=>{
  const r=repopulationRateEstimates.find(x=>x.id===id);
  if(!r)throw Error("Missing legacy scientific source "+id);
  return r;
};
describe("P4 repopulation evidence fail-closed runtime selection",()=>{
  it("keeps all four blocked historical estimates in the source archive without listing them for new calculations",()=>{
    expect(repopulationRateEstimates).toHaveLength(14);
    for(const id of [...deprecated,...tBedModels]){
      const r=record(id);
      expect(r.defaultEligible).toBe(false);
      expect(getRepopulationEstimates(r.endpointId).some(x=>x.id===id)).toBe(false);
      expect(getPreferredRepopulationEstimate(r.endpointId)?.id).not.toBe(id);
    }
    for(const id of deprecated)expect(record(id).status).toBe("deprecated");
    for(const id of tBedModels){
      expect(record(id).sourceId).toBe("hinata-2001-medulloblastoma-time");
      // Historical data basis metadata are intentionally not silently rewritten.
      expect(record(id).basis).toBe("EQD2");
    }
  });
  it("rejects deprecated explicit evidence selections even when their IDs are known",()=>{
    for(const id of deprecated){
      const r=record(id);
      expect(() => resolveRepopulationSelection(r.endpointId,{
        selectionMode:"evidence",parameterRecordId:id,
      })).toThrow(/deprecated.*cannot be used/i);
    }
  });
  it("rejects Hinata BED/day estimates submitted as EQD2/day regardless of the Tk assumption",()=>{
    for(const id of tBedModels){
      const r=record(id);
      expect(() => resolveRepopulationSelection(r.endpointId,{
        selectionMode:"evidence",parameterRecordId:id,
      })).toThrow(/Hinata tBEDmax.*BED.*EQD2/i);
      expect(() => resolveRepopulationSelection(r.endpointId,{
        selectionMode:"evidence",parameterRecordId:id,kickOffOverrideDays:40,
      })).toThrow(/Hinata tBEDmax.*BED.*EQD2/i);
    }
  });
  it("blocks unsafe selections before Treatment Gap can produce compensated clinical-looking doses",()=>{
    for(const id of [...deprecated,...tBedModels]){
      const r=record(id);
      expect(() => buildTreatmentGapBaseline({
        endpointId:r.endpointId,
        plannedSchedule:{fractions:25,dosePerFractionGy:2},
        plannedOverallTreatmentDays:35,
        deliveredFractionsBeforeGap:10,
        gapDays:5,
        alphaBetaSelection:{selectionMode:"manual",parameter:"alpha-beta",value:10,unit:"Gy"},
        repopulationSelection:{selectionMode:"evidence",parameterRecordId:id},
      })).toThrow(/deprecated|Hinata tBEDmax/);
    }
  });
  it("preserves manual explicit sensitivity analysis and unmodified numeric arithmetic",()=>{
    const manual=resolveRepopulationSelection("head-neck-tumour-control",{
      selectionMode:"manual",rateGyPerDay:.8,kickOffDays:21,
      rationale:"Historical academic test only; not an endorsed generic HN model",
    });
    expect(manual.selectionMode).toBe("manual");
    expect(manual.basis).toBe("EQD2");
    expect(manual.parameterRecord).toBeUndefined();
    expect(manual.warnings.join(" ")).toMatch(/User-specified.*overrides/);
    const baseline=buildTreatmentGapBaseline({
      endpointId:"head-neck-tumour-control",
      plannedSchedule:{fractions:35,dosePerFractionGy:2},
      plannedOverallTreatmentDays:46,
      deliveredFractionsBeforeGap:20,
      gapDays:7,
      repopulationSelection:{
        selectionMode:"manual",rateGyPerDay:.8,kickOffDays:21,
        rationale:"Historical test source sensitivity only",
      },
    });
    expect(baseline.uncompensatedDeltaEffectiveEqd2Gy).toBeCloseTo(-5.6,10);
    expect(baseline.repopulationSelectionMode).toBe("manual");
    expect(baseline.repopulationRecordId).toBeUndefined();
    expect(baseline.warnings.join(" ")).toMatch(/overrides/);
    expect(evidenceManifest.releaseStatus).toBe("draft");
  });
});
