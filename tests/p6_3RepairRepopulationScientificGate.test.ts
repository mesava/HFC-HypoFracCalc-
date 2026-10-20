import {describe, expect, it} from "vitest";
import ledger from "../docs/P6_3_REPAIR_REPOPULATION_20_RECORD_GATE_2026-10-19.csv?raw";
import {repairHalfTimeEstimates,repopulationRateEstimates,evidenceManifest} from "../src/data/evidence/v0.1/index.js";
import {getRepairHalfTimeEstimates, defaultRepairHalfTimeSelection,resolveRepairHalfTimeSelection} from "../src/evidence/repairRegistry.js";
import {getRepopulationEstimates,getRepopulationSourceBlocker,defaultRepopulationSelection,resolveRepopulationSelection} from "../src/evidence/repopulationRegistry.js";
import {bedRateToEqdRate,activeRepopulationDays} from "../src/core/repopulation.js";

function csvRows(input:string):Record<string,string>[] {
 const rows=input.trimEnd().split(/\r?\n/);
 const read=(s:string)=>{let v="",q=false,a:string[]=[];
  for(let i=0;i<s.length;i++){const c=s[i]!;
   if(c==='"'){if(q&&s[i+1]==='"'){v+='"';i++;}else q=!q;}
   else if(c===','&&!q){a.push(v);v="";}else v+=c;
  }
  if(q)throw Error("bad CSV quotation");a.push(v);return a;
 };
 const headers=read(rows[0]!);
 return rows.slice(1).map((s,i)=>{const fields=read(s);if(fields.length!==headers.length)throw Error("P6.3 row "+i);return Object.fromEntries(headers.map((h,j)=>[h,fields[j]!]))});
}
const rows=csvRows(ledger);
describe("P6.3: 6 repair and 14 repopulation scientific dose-basis gating",()=>{
 it("strictly maps all 20 live IDs, preserving dose basis, CI provenance and draft status",()=>{
  const live=[...repairHalfTimeEstimates,...repopulationRateEstimates];
  expect(rows).toHaveLength(20);expect(live).toHaveLength(20);
  expect(new Set(rows.map(x=>x.record_id)).size).toBe(20);
  expect(rows.map(x=>x.record_id).sort()).toEqual(live.map(x=>x.id).sort());
  for(const v of live){
   const r=rows.find(x=>x.record_id===v.id)!;
   expect(r.source_id).toBe(v.sourceId);expect(r.endpoint_id).toBe(v.endpointId);
   expect(r.code_status).toBe(v.status);expect(r.code_defaultEligible).toBe(String(v.defaultEligible));
   expect(r.code_support).toBe(v.support);
   if(v.parameter==="repair-half-time"){
    expect(r.family).toBe("repair-half-time");
    expect(r.code_value).toBe(v.valueHours===undefined?"":String(v.valueHours));
    expect(r.code_range_low).toBe(v.rangeHours?.low===undefined?"":String(v.rangeHours.low));
    expect(r.code_range_high).toBe(v.rangeHours?.high===undefined?"":String(v.rangeHours.high));
   } else {
    expect(r.family).toBe("repopulation-time");expect(r.code_basis).toBe(v.basis);
    expect(Number(r.code_value)).toBe(v.rateGyPerDay);
    expect(r.code_kickOffDays).toBe(v.kickOffDays===undefined?"":String(v.kickOffDays));
   }
   if(v.ci95===undefined){
    expect(r.code_ci95_low).toBe("");expect(r.code_ci95_high).toBe("");
   } else {
    expect(Number(r.code_ci95_low)).toBe(v.ci95.low);
    expect(Number(r.code_ci95_high)).toBe(v.ci95.high);
   }
   expect(r.independent_primary_full_PDF_checked).toBe("false");
   expect(r.automatic_clinical_release).toBe("false");
  }
  expect(evidenceManifest.releaseStatus).toBe("draft");
 });
 it("preserves 3 T-half source defaults and never treats 2..4h qualitative range as a fitted point",()=>{
  const defs=repairHalfTimeEstimates.filter(x=>x.defaultEligible);
  expect(defs.map(x=>x.valueHours)).toEqual([4.9,3.8,4.4]);
  for(const v of defs){
   const sel=defaultRepairHalfTimeSelection(v.endpointId);
   expect(sel?.parameterRecordId).toBe(v.id);
   const resolved=resolveRepairHalfTimeSelection(v.endpointId,sel!);
   expect(resolved.valueHours).toBe(v.valueHours);
  }
  const muc=repairHalfTimeEstimates.find(x=>x.id==="t12-oral-mucositis-bcr2025")!;
  expect(muc.rangeHours).toEqual({low:2,high:4});
  expect(muc.valueHours).toBeUndefined();expect(muc.ci95).toBeUndefined();
  expect(getRepairHalfTimeEstimates(muc.endpointId).map(x=>x.id)).toContain(muc.id);
  expect(()=>resolveRepairHalfTimeSelection(muc.endpointId,{selectionMode:"evidence",parameterRecordId:muc.id})).toThrow(/range or bound/);
 });
 it("independently checks monoexponential residual at six and twelve hours without claiming clinical BID safe",()=>{
  for(const [half,h6,h12] of [
   [4.9,0.4279470,0.1831386],
   [3.8,0.3347350,0.1120475],
   [4.4,0.3886002,0.1510103]
  ] as const){
   const six=Math.exp(-Math.log(2)*6/half),twelve=Math.exp(-Math.log(2)*12/half);
   expect(six).toBeCloseTo(h6,4);expect(twelve).toBeCloseTo(h12,4);
   expect(twelve).toBeCloseTo(six*six,12);
  }
 });
 it("excludes 2 deprecated and 2 incompatible Hinata records in BOTH list and explicit runtime ID",()=>{
  expect(repopulationRateEstimates).toHaveLength(14);
  expect(repopulationRateEstimates.every(x=>x.defaultEligible===false)).toBe(true);
  let usable=0, blocked=0;
  for(const v of repopulationRateEstimates){
    const b=getRepopulationSourceBlocker(v.id);
    const isOld=v.status==="deprecated";
    const isHinata=v.sourceId==="hinata-2001-medulloblastoma-time";
    if(isOld||isHinata){
      blocked++;
      expect(b?.code).toBe(isOld?"deprecated":"incompatible-dose-basis");
      expect(getRepopulationEstimates(v.endpointId).some(x=>x.id===v.id)).toBe(false);
      expect(()=>resolveRepopulationSelection(v.endpointId,{selectionMode:"evidence",parameterRecordId:v.id})).toThrow();
    }else {
      usable++;
      expect(b).toBeUndefined();
    }
    expect(defaultRepopulationSelection(v.endpointId)).toBeUndefined();
  }
  expect(blocked).toBe(4);expect(usable).toBe(10);
  for(const v of repopulationRateEstimates.filter(x=>x.sourceId==="hinata-2001-medulloblastoma-time")){
    expect(v.basis).toBe("EQD2"); // incorrect original source dose basis, protected by runtime blocker
    expect(v.supportReason).toContain("tBED");
  }
 });
 it("illustrates BED/day vs EQD2/day mismatch at 30 x 2Gy, OTT45, never source model re-fit",()=>{
  const rawBed=30*2*(1+2/10), rawEqd=rawBed/(1+2/10);
  expect(rawBed).toBeCloseTo(72,12);expect(rawEqd).toBeCloseTo(60,12);
  for(const [k,tk,expectedBed,expectedEqd,excess] of [
   [0.52,0,23.4,19.5,3.9],
   [0.55,21,13.2,11,2.2]
  ] as const){
   const days=activeRepopulationDays(45,tk);
   const lossBed=k*days,converted=k/(1+2/10),lossEqd=bedRateToEqdRate(k,10)*days;
   expect(lossBed).toBeCloseTo(expectedBed,11);
   expect(lossEqd).toBeCloseTo(expectedEqd,11);
   expect(lossBed-lossEqd).toBeCloseTo(excess,11);
   expect(converted).toBeLessThan(k);
  }
 });
});
