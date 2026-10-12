import { describe, expect, it } from "vitest";
import { bedGy, eqdGy } from "../src/core/lq.js";
import { eqdGyWithIncompleteRepair, thamesHm } from "../src/core/repair.js";
import { correctBiologicalDoseForTreatmentTime } from "../src/core/repopulation.js";
import { calculateEvidenceLq } from "../src/workflows/evidenceLq.js";
import { solveCourseCorrection } from "../src/workflows/courseCorrection.js";
import { solveDosePerFractionForTargetEqd2 } from "../src/workflows/targetEqdSolver.js";

/**
 * Genuine worked examples, externally printed numerical reference values:
 * 2025 Joiner/van der Kogel, Basic Clinical Radiobiology, ch10 pp106–110
 *   Ex10.1, 10.2, 10.4, 10.5, 10.6 (PDF indexed pp121–125).
 * 2014 Основы клинической радиобиологии, Russian 4th English ed translation,
 *   ch9 examples 1–2, printed pp209–210 (PDF indexed pp209–210).
 * Never infer clinical permission from numeric agreement.
 */

function independentEqdByBed(n:number,d:number,ab:number):number {
  // External hand-check route: BED = total physical dose + quadratic term.
  const physical=n*d;
  const quadratic=n*d*d/ab;
  return (physical+quadratic)/(1+2/ab);
}
function independentHmForBid(intervalH:number,halfH:number):number {
  return Math.pow(2,-intervalH/halfH);
}
function bookRounded(value:number,reported:number,toleranceGy:number):void {
  expect(Math.abs(value-reported)).toBeLessThanOrEqual(toleranceGy);
}

describe("Independent literature worked examples from both user-supplied textbooks",()=>{
 it("BCR 2025 Ex 10.1: palliative 1x8 Gy spinal cord with alpha/beta 2 Gy = 20 Gy EQD2",()=>{
  const r=calculateEvidenceLq("spinal-cord-radiation-myelopathy",
    {fractions:1,dosePerFractionGy:8},
    {selectionMode:"manual",parameter:"alpha-beta",value:2,unit:"Gy",rationale:"BCR 2025 p106 Ex10.1 textbook reference; research QA only"});
  expect(r.bedGy).toBe(40);
  expect(r.eqd2Gy).toBe(20);
  expect(r.eqd2Gy).toBe(independentEqdByBed(1,8,2));
  expect(r.selectionMode).toBe("manual");
  expect(r.parameterRecordId).toBeUndefined();
 });
 it("Russian 2014 ch9 Ex 1: 4x5 Gy vertebra and alpha/beta 2 Gy = 35 Gy EQD2",()=>{
  const r=calculateEvidenceLq("spinal-cord-radiation-myelopathy",
    {fractions:4,dosePerFractionGy:5},
    {selectionMode:"manual",parameter:"alpha-beta",value:2,unit:"Gy",rationale:"Joiner & van der Kogel RU 2014 p209 Ex1 textbook reference"});
  expect(r.bedGy).toBe(70);
  expect(r.eqd2Gy).toBe(35);
  expect(r.eqd2Gy).toBe(independentEqdByBed(4,5,2));
 });
 it("BCR 2025 Ex 10.2 RAPID BID: complete repair 51.7 and incomplete 62.4 Gy EQD2",()=>{
  const complete=independentEqdByBed(10,3.85,3.4);
  const hIndependent=independentHmForBid(6,4.4);
  const expectedViaHandBED=(38.5*(3.4+3.85*(1+hIndependent)))/(3.4+2);
  const fromEngine=eqdGyWithIncompleteRepair({
    schedule:{fractions:10,dosePerFractionGy:3.85},
    alphaBetaGy:3.4,fractionsPerDay:2,interfractionIntervalHours:6,repairHalfTimeHours:4.4,
  });
  bookRounded(complete,51.7,.06);
  bookRounded(fromEngine,62.4,.06);
  expect(fromEngine).toBeCloseTo(expectedViaHandBED,10);
  expect(thamesHm(2,6,4.4)).toBeCloseTo(.39,2);
  bookRounded(fromEngine-complete,10.7,.1);
  // Book separately reports 64.9 Gy with Guttenberger's carry-over repair
  // model: NEVER assert this simpler Thames H2 approximation equals 64.9.
  expect(fromEngine).toBeLessThan(64.9);
 });
 it("RU 2014 ch9 Ex 2: 50 Gy complete + 20 Gy BID -> 74.2 at 6h / 73.0 at 8h",()=>{
  for(const [interval,reported] of [[6,74.2],[8,73.0]] as const){
    const fromEngine=50+eqdGyWithIncompleteRepair({
      schedule:{fractions:10,dosePerFractionGy:2},
      alphaBetaGy:1.7,fractionsPerDay:2,interfractionIntervalHours:interval,repairHalfTimeHours:4.4,
    });
    const external=50+20*(1.7+2*(1+independentHmForBid(interval,4.4)))/3.7;
    expect(fromEngine).toBeCloseTo(external,10);
    // Published H_2 was interpolated/rounded to 0.39 and 0.28,
    // so at 8h book's 73.0 and raw exponential result 73.0657 differ ~0.066.
    bookRounded(fromEngine,reported,.11);
  }
  expect(thamesHm(2,8,4.4)).toBeGreaterThan(0);
 });
 it("BCR 2025 Ex 10.4 IAEA ACC: 40 vs 47 days at 0.7 Gy_EQD2/day -> difference 4.9 Gy",()=>{
  const corrected=correctBiologicalDoseForTreatmentTime(
    70,47,40,{basis:"EQD2",rateGyPerDay:.7,kickOffDays:21});
  expect(corrected).toBeCloseTo(74.9,10);
  expect(corrected-70).toBeCloseTo((47-40)*.7,10);
  // Clinical evidence does not authorize this coefficient for generic use.
 });
 it("BCR 2025 Ex 10.5: missed 3rd 5-Gy fraction -> two remaining around 6.7 Gy for tumor alpha/beta 10",()=>{
  const target=independentEqdByBed(3,5,10);
  expect(target).toBe(18.75);
  const x=solveDosePerFractionForTargetEqd2(target,2,10);
  expect(x).toBeCloseTo((-10+Math.sqrt(550))/2,10);
  bookRounded(x,6.7,.05);
  expect(eqdGy({fractions:2,dosePerFractionGy:x},10)).toBeCloseTo(target,9);
  // Rounding to 6.7 (book presentation) is NOT exactly mathematically equieffective.
  expect(eqdGy({fractions:2,dosePerFractionGy:6.7},10)).toBeLessThan(target);
 });
 it("BCR 2025 Ex 10.5: bowel endpoint increases from 37.5 to 38.9 Gy EQD2 if target compensated by 6.7Gy",()=>{
  const original=independentEqdByBed(5,5,4);
  const modified=independentEqdByBed(2,5,4)+independentEqdByBed(2,6.7,4);
  expect(original).toBe(37.5);
  bookRounded(modified,38.9,.06);
  expect(modified).toBeGreaterThan(original);
  expect(eqdGy({fractions:2,dosePerFractionGy:5},4)+eqdGy({fractions:2,dosePerFractionGy:6.7},4)).toBeCloseTo(modified,9);
  // Clinical implication: tumor EQD2 preservation alone says nothing about OAR safety.
 });
 it("BCR 2025 Ex 10.5: subcutis fibrosis 1.7 Gy example rises from approx 45 to 48.5 Gy",()=>{
  const old=independentEqdByBed(5,5,1.7);
  const modified=independentEqdByBed(2,5,1.7)+independentEqdByBed(2,6.7,1.7);
  bookRounded(old,45,.35);
  bookRounded(modified,48.5,.06);
  expect(modified).toBeGreaterThan(old);
 });
 it("BCR 2025 Ex 10.6: early 2x4 Gy delivered by mistake, fixed 36 fractions -> approx 1.72 Gy",()=>{
  const oldPlan=35*2;
  const errorDose=2*4;
  const alphaIndependent=(oldPlan*2-errorDose*4)/(oldPlan-errorDose);
  expect(alphaIndependent).toBeCloseTo(1.74193548387,9);
  const x=solveCourseCorrection({
    plannedSchedule:{fractions:35,dosePerFractionGy:2},
    deliveredFractions:2,
    deliveredDosePerFractionGy:4,
    remainingFractions:36,
    alphaBetaGy:10,
  });
  // HFC solves one chosen alpha/beta and integer n=36, whereas
  // the textbook's alpha/beta-independent 1.74 Gy yields 35.6 fractions,
  // rounded to 36 fractions of 1.72 Gy.
  bookRounded(x.requiredDosePerFractionGy,1.72,.01);
  expect(x.correctedFinalEqd2Gy).toBeCloseTo(x.plannedEqd2Gy,9);
  expect(x.warnings.join(" ")).toMatch(/clinical equivalence|OAR safety/);
 });
 it("rejects numerical input errors and keeps continuously delivered brachy out of reference scope",()=>{
  expect(()=>eqdGy({fractions:0,dosePerFractionGy:5},2)).toThrow();
  expect(()=>eqdGy({fractions:5,dosePerFractionGy:5},0)).toThrow();
  expect(()=>eqdGyWithIncompleteRepair({
    schedule:{fractions:10,dosePerFractionGy:3.85},alphaBetaGy:3.4,
    fractionsPerDay:2,interfractionIntervalHours:0,repairHalfTimeHours:4.4,
  })).toThrow();
  // BCR 2025 Ex 10.3 uses continuous Ir-192 brachy dose-rate
  // (Lea-Catcheside g) and is NOT reproduced as an EBRT EQD2 benchmark.
 });
});
