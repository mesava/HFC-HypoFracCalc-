import { describe, expect, it } from "vitest";
import csv from "../docs/P3_HINATA_2001_DOSE_BASIS_COUNTEREXAMPLES_2026-10.csv?raw";
import { repopulationRateEstimates } from "../src/data/evidence/v0.1/index.js";
import { activeRepopulationDays, bedRateToEqdRate, repopulationPenaltyGy } from "../src/core/repopulation.js";
import { eqdGy } from "../src/core/lq.js";

/** Paper PMID 11383644 original source gamma/alpha in time-adjusted BED tBEDmax.
 * Pure dimensional counterexample: not a source full PDF fit, NOT patient dose.
 */
const arr=csv.trimEnd().split(/\r?\n/),h=arr[0]!.split(",");
const rows=arr.slice(1).map(s=>{const parts=s.split(",");if(parts.length!==h.length)throw Error("Bad P3 Hinata CSV");return Object.fromEntries(h.map((k,i)=>[k,parts[i]!])) as Record<string,string>});
describe("P3.9 Hinata original BED/tBEDmax dose-basis mismatch negative control",()=>{
 it("demonstrates exact algebraic BED/EQD2 loss mismatch in two FIXED TOY examples",()=>{
  expect(rows).toHaveLength(2);
  for(const row of rows){
   const rec=repopulationRateEstimates.find(x=>x.id===row.record_id);
   if(!rec)throw Error("Missing Hinata HFC record");
   const ab=Number(row.toy_alpha_beta_Gy),n=Number(row.toy_fractions),d=Number(row.toy_fraction_dose_Gy),ott=Number(row.toy_OTT_days),tk=Number(row.Tk_days),k=Number(row.source_gamma_alpha_GyBED_day);
   const bed=n*d*(1+d/ab),eqd=eqdGy({fractions:n,dosePerFractionGy:d},ab);
   expect(bed).toBeCloseTo(Number(row.toy_raw_BED_Gy),12);
   expect(eqd).toBeCloseTo(Number(row.toy_raw_EQD2_Gy),12);
   expect(activeRepopulationDays(ott,tk)).toBe(Number(row.toy_active_days));
   const bedLoss=repopulationPenaltyGy(ott,{basis:"BED",rateGyPerDay:k,kickOffDays:tk});
   const actualImplementationEqdLoss=repopulationPenaltyGy(ott,{basis:"EQD2",rateGyPerDay:k,kickOffDays:tk});
   const dimensionallyConvertedEqdLoss=activeRepopulationDays(ott,tk)*bedRateToEqdRate(k,ab);
   expect(bedLoss).toBeCloseTo(Number(row.toy_source_BED_penalty_GyBED),10);
   expect(dimensionallyConvertedEqdLoss).toBeCloseTo(Number(row.toy_source_final_time_EQD2_penalty_GyEQD2),10);
   expect(actualImplementationEqdLoss).toBeCloseTo(Number(row.toy_HFC_current_EQD2_penalty_GyEQD2),10);
   expect(actualImplementationEqdLoss-dimensionallyConvertedEqdLoss).toBeCloseTo(Number(row.toy_excess_loss_GyEQD2),10);
   expect(row.source_tBEDmax_reproduced).toBe("false");
   expect(row.original_PDF_binary_visual_verified).toBe("false");
   expect(row.clinical_release_approved).toBe("false");
   // EXISTING HFC source records still have EQD2 basis (scientifically BLOCKED).
   expect(rec.basis).toBe("EQD2");
   expect(rec.rateGyPerDay).toBe(k);
   expect(rec.kickOffDays).toBe(tk);
   expect(rec.defaultEligible).toBe(false);
   expect(rec.supportReason).toMatch(/tBED endpoint can occur BEFORE|maximum-tBED endpoint can occur BEFORE/);
  }
 });
 it("shows mathematical maximum-of-history can differ from terminal tBED on prolonged toy timeline",()=>{
   const kBed=.55,ab=10,d=2,loss=(day:number)=>kBed*day;
   // No patient data: toy 2 Gy at t=0, t=1, t=30 with Tk=0.
   const before=[0,1,30].map((day,i)=>(i+1)*d*(1+d/ab)-loss(day));
   expect(before[1]).toBeGreaterThan(before[2]!);
   expect(Math.max(...before)).toBeCloseTo(before[1]!,12);
   expect(before[2]).toBeLessThan(0);
 });
});
