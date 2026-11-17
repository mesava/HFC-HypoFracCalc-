import { describe, expect, it } from "vitest";
import reCogRows from "../docs/P6_RECOG_2026_25_STANDARD_TO_HFC_CROSSWALK_2026-11-06.csv?raw";
import { sources, evidenceManifest } from "../src/data/evidence/v0.1/index.js";
import { bedGy, eqdGy } from "../src/core/lq.js";
import { evaluateReirradiationScenario } from "../src/workflows/reirradiation.js";
import type { ReirradiationCourse, ReirradiationScenarioContext } from "../src/domain/reirradiation.js";

function parseCsv(data: string): Record<string,string>[] {
 const rows:string[][]=[];let cells:string[]=[],field="",q=false;
 for(let i=0;i<data.length;i++){
   const c=data[i]!;
   if(c==='"'){if(q&&data[i+1]==='"'){field+='"';i++;}else q=!q;}
   else if(c===','&&!q){cells.push(field);field="";}
   else if((c==='\n'||c==='\r')&&!q){
     if(c==='\r'&&data[i+1]==='\n')i++;
     cells.push(field);if(cells.some(x=>x!==""))rows.push(cells);
     cells=[];field="";
   }else field+=c;
 }
 if(q)throw new Error("unterminated CSV quote");
 if(cells.length||field){cells.push(field);rows.push(cells);}
 const headers=rows.shift()!;
 return rows.map((v,i)=>{
   if(v.length!==headers.length)throw new Error("ReCOG primary CSV row "+i);
   return Object.fromEntries(headers.map((h,j)=>[h,v[j]!]));
 });
}
const rows=parseCsv(reCogRows);
const context:ReirradiationScenarioContext={
 geometricOverlap:true,cumulativeDoseToxicityConcern:true,
 previousDoseData:"summary-only",registrationSuitability:"uncertain",
 strategy:"direct-point-sum"
};
const metric={kind:"D0.1cc"} as const;
function course(id:string,role:"previous"|"current",gy:number,n:number,discount=0):ReirradiationCourse{
 return {id,label:id,role,metric,schedule:{fractions:n,dosePerFractionGy:gy/n},
   ...(role==="previous" ? {recovery:discount>0?
       {mode:"manual-discount" as const,discountFraction:discount,rationale:"Arbitrary source-equation test only; not a patient TRF"}:
       {mode:"none" as const}} : {})};
}

describe("P6.ReCOG 2026 original Elsevier PDF standards (Paradis, Appelt et al.)",()=>{
 it("recognises exactly one existing HFC primary-method source and page-anchored, 25-row recommendations",()=>{
   expect(rows).toHaveLength(25);
   expect(new Set(rows.map(r=>r.recommendation_id)).size).toBe(25);
   const primary=sources.filter(s=>s.id==="paradis-2026-recog-consensus");
   expect(primary).toHaveLength(1);
   expect(primary[0]?.doi).toBe("10.1016/S1470-2045(25)00562-5");
   expect(primary[0]?.citation).toContain("Appelt");
   const separate=sources.find(s=>s.id==="appelt-2026-cumulative-dose-reirradiation");
   expect(separate?.doi).toBe("10.1016/j.radonc.2025.111313");
   for(const r of rows){
     expect(r.source_id).toBe(primary[0]?.id);
     expect(r.original_pdf_sha256).toBe("95da5699b2eae39c2dde89ba8c01ae46454ac330d3db6ef9be6c50a2c2c1ba88");
     expect(Number(r.original_pdf_page)).toBeGreaterThanOrEqual(2);
     expect(Number(r.original_pdf_page)).toBeLessThanOrEqual(6);
     expect(r.doi).toBe(primary[0]?.doi);
     expect(r.full_clinical_ReCOG_reporting_approved).toBe("false");
     expect((r.source_requirement_paraphrase??"").length).toBeGreaterThan(15);
   }
   expect(rows.filter(r=>r.hfc_current_coverage==="present")).toHaveLength(6);
   expect(rows.filter(r=>r.hfc_current_coverage==="partial")).toHaveLength(11);
   expect(rows.filter(r=>r.hfc_current_coverage==="missing")).toHaveLength(8);
   expect(evidenceManifest.releaseStatus).toBe("draft");
 });
 it("requires separate EQD2 conversion of nonconcurrent phases (e103, Figure independent numerical fixture)",()=>{
   const prior=eqdGy({fractions:10,dosePerFractionGy:2},3);
   const next=eqdGy({fractions:5,dosePerFractionGy:5},3);
   const correct=prior+next;
   const incorrect=eqdGy({fractions:15,dosePerFractionGy:3},3);
   expect(prior).toBeCloseTo(20,12);
   expect(next).toBeCloseTo(40,12);
   expect(correct).toBeCloseTo(60,12);
   expect(incorrect).toBeCloseTo(54,12);
   expect(correct).not.toBeCloseTo(incorrect,5);
 });
 it("distinguishes same-day combined voxel dose from two independent fraction bioeffects (e103)",()=>{
   const once=bedGy({fractions:1,dosePerFractionGy:4},3);
   const artificiallySeparate=2*bedGy({fractions:1,dosePerFractionGy:2},3);
   expect(once).toBeCloseTo(28/3,12);
   expect(artificiallySeparate).toBeCloseTo(20/3,12);
   expect(once).toBeGreaterThan(artificiallySeparate);
   // This is a theoretical anti-example, NOT proof of clinical multi-plan voxel support.
   expect(rows.find(r=>r.recommendation_id==="R04")?.hfc_current_coverage).toBe("missing");
 });
 it("applies explicitly supplied TRF only to prior EQD2, without applying to current dose (e103)",()=>{
   const discounted=evaluateReirradiationScenario([
     course("prior","previous",40,20,.25),
     course("new","current",20,10)
   ],3,context);
   const unchanged=evaluateReirradiationScenario([
     course("prior","previous",40,20,0),
     course("new","current",20,10)
   ],3,context);
   expect(discounted.courses[0]?.adjustedEqd2Gy).toBeCloseTo(30,12);
   expect(discounted.courses[1]?.adjustedEqd2Gy).toBeCloseTo(20,12);
   expect(discounted.cumulativeEqd2Gy).toBeCloseTo(50,12);
   expect(unchanged.cumulativeEqd2Gy).toBeCloseTo(60,12);
   expect(discounted.audit.recoveryApplied).toBe(true);
   expect(unchanged.audit.recoveryApplied).toBe(false);
   expect(()=>evaluateReirradiationScenario([
     course("prior","previous",40,20),
     {...course("new","current",20,10),recovery:{mode:"manual-discount",discountFraction:.25,rationale:"Wrong course"}}
   ],3,context)).toThrow(/previously delivered courses/);
 });
 it("never represents unavailable 3D dose accumulation and Vx DVH as completed by a scalar calculation",()=>{
   const plans=[course("prior","previous",40,20),course("new","current",20,10)];
   const modeled=evaluateReirradiationScenario(plans,3,{
     ...context,previousDoseData:"complete-dicom",
     registrationSuitability:"rigid-suitable",strategy:"image-registration-3d"
   });
   expect(modeled.warnings.some(w=>w.includes("does not perform voxel-wise"))).toBe(true);
   expect(()=>evaluateReirradiationScenario(
     plans.map(x=>({...x,metric:{kind:"Vx" as const,xGy:20}})),
     3,{...context,strategy:"image-registration-3d"}
   )).toThrow(/voxel-wise/);
   expect(rows.find(r=>r.recommendation_id==="R23")?.hfc_current_coverage).toBe("missing");
   expect(rows.find(r=>r.recommendation_id==="R25")?.hfc_current_coverage).toBe("missing");
 });
});
