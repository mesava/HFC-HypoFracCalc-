import { describe, expect, it } from "vitest";
import fixedSource from "../docs/P6_2I_RCR2024_25_FIXED_REGIMEN_PRIMARY_PDF_AUDIT_2026-11-06.csv?raw";
import complexSource from "../docs/P6_2I_RCR2024_4_COMPLEX_REGIMEN_PRIMARY_PDF_AUDIT_2026-11-06.csv?raw";
import missingSource from "../docs/P6_2I_RCR2024_PRIORITY_MISSING_REGIMENS_2026-11-06.csv?raw";
import { regimenPresets } from "../src/data/regimens/v0.1/index.js";
import { complexRegimenPresets } from "../src/data/regimens/v0.2/index.js";
import { evidenceManifest } from "../src/data/evidence/v0.1/index.js";

function parseCsv(raw:string):Record<string,string>[] {
 const arr:string[][]=[];let cells:string[]=[],field="",quote=false;
 for(let i=0;i<raw.length;i++){
  const c=raw[i]!;
  if(c==='"'){if(quote&&raw[i+1]==='"'){field+='"';i++;}else quote=!quote;}
  else if(c===','&&!quote){cells.push(field);field="";}
  else if((c==='\n'||c==='\r')&&!quote){
   if(c==='\r'&&raw[i+1]==='\n')i++;
   cells.push(field);if(cells.some(x=>x!==""))arr.push(cells);
   cells=[];field="";
  }else field+=c;
 }
 if(quote)throw Error("Unclosed CSV quote");
 if(cells.length||field){cells.push(field);arr.push(cells);}
 const head=arr.shift()!;
 return arr.map((xs,i)=>{
  if(xs.length!==head.length)throw Error("Malformed RCR source CSV row "+i);
  return Object.fromEntries(head.map((h,j)=>[h,xs[j]!]));
 });
}
const fixed=parseCsv(fixedSource);
const complex=parseCsv(complexSource);
const gaps=parseCsv(missingSource);
const sourceSha="9fa1cec2466e52cc50ad46454c146846f1707a2df777867443734fee7db09038";

describe("P6.2i RCR 2024 4th edition original PDF regimen audit",()=>{
 it("matches all 25 fixed regimen doses, grades and source page locators",()=>{
   expect(regimenPresets).toHaveLength(25);
   expect(fixed).toHaveLength(25);
   expect(new Set(fixed.map(x=>x.record_id)).size).toBe(25);
   expect(fixed.map(x=>x.record_id).sort()).toEqual(regimenPresets.map(x=>x.id).sort());
   for(const preset of regimenPresets){
     const row=fixed.find(x=>x.record_id===preset.id)!;
     expect(row.source_filename).toBe("RCR_Dose_Fractionation_4th_ed_2024.pdf");
     expect(row.source_sha256).toBe(sourceSha);
     expect(Number(row.source_pdf_page_1based)).toBeGreaterThan(0);
     expect(Number(row.source_pdf_page_1based)).toBeLessThanOrEqual(184);
     expect(row.rcr_chapter).toBe(preset.chapter);
     expect(row.source_regimen_kind).toBe("fixed_nxd");
     expect(preset.schedule.fractions).toBe(Number(row.source_fractions));
     expect(preset.schedule.fractions*preset.schedule.dosePerFractionGy).toBeCloseTo(Number(row.source_total_dose_gy),10);
     expect(Number(row.hfc_total_dose_gy)).toBe(Number(row.source_total_dose_gy));
     expect(row.source_grade).toBe(preset.recommendationGrade);
     expect(row.hfc_grade).toBe(preset.recommendationGrade);
     expect(row.hfc_intent).toBe(preset.intent);
     expect(row.source_numeric_and_grade_match).toBe("true");
     expect(row.auto_patient_eligibility_approved).toBe("false");
     expect(row.independent_patient_outcome_validation).toBe("false");
     expect((row.clinical_source_eligibility_context??"").length).toBeGreaterThan(18);
   }
   expect(evidenceManifest.releaseStatus).toBe("draft");
 });
 it("matches exact 4 complex source prescriptions without flattening target volumes or dose ranges",()=>{
   expect(complexRegimenPresets).toHaveLength(4);
   expect(complex).toHaveLength(4);
   expect(new Set(complex.map(x=>x.record_id)).size).toBe(4);
   expect(complex.map(x=>x.record_id).sort()).toEqual(complexRegimenPresets.map(x=>x.id).sort());
   const kinds:string[]=[];
   for(const preset of complexRegimenPresets){
     const row=complex.find(x=>x.record_id===preset.id)!;
     expect(row.source_sha256).toBe(sourceSha);
     expect(row.source_grade).toBe(preset.recommendationGrade);
     expect(row.rcr_chapter).toBe(preset.chapter);
     expect("schedule" in preset).toBe(false);
     expect(row.single_fixed_schedule_equivalent).toBe("false");
     expect(row.auto_select_alpha_beta).toBe("false");
     expect(row.clinical_release_approved).toBe("false");
     expect(row.hfc_kind_grade_and_dose_match).toBe("true");
     const original=JSON.parse(row.source_published_prescription_json??"");
     expect(preset.prescription.kind).toBe(original.kind);
     kinds.push(original.kind);
     if(preset.prescription.kind==="dose-range"){
       expect(preset.prescription.fractions).toBe(original.fractions);
       expect(preset.prescription.totalDoseGyRange).toEqual(original.totalDoseGyRange);
     }else if(preset.prescription.kind==="sib"){
       expect(preset.prescription.fractions).toBe(original.fractions);
       expect(preset.prescription.doseLevels.map(x=>({id:x.id,totalDoseGy:x.totalDoseGy}))).toEqual(original.doseLevels);
     }else{
       expect(preset.prescription.phases.map(x=>({
         id:x.id,
         fractions:x.schedule.fractions,
         totalDoseGy:Number((x.schedule.fractions*x.schedule.dosePerFractionGy).toFixed(7)),
       }))).toEqual(original.phases);
     }
   }
   expect(kinds.sort()).toEqual(["dose-range","sequential","sequential","sib"]);
 });
 it("keeps source recommendations distinct by indication, size, timing and target",()=>{
   const get=(id:string)=>fixed.find(x=>x.record_id===id)!;
   expect(get("rcr2024-breast-nonnodal-26gy-5fx").source_pdf_page_1based).toBe("17");
   expect(get("rcr2024-breast-pbi-26gy-5fx").source_pdf_page_1based).toBe("18");
   expect(get("rcr2024-breast-rni-40gy-15fx").source_pdf_page_1based).toBe("23");
   expect(get("rcr2024-prostate-postop-66gy-33fx").source_grade).toBe("C");
   expect(get("rcr2024-nsclc-sabr-favorable-54gy-3fx").clinical_source_eligibility_context).toContain("favorable anatomy");
   expect(get("rcr2024-bone-reirradiation-8gy-1fx").source_grade).toBe("B");
   expect(get("rcr2024-bone-neuropathic-8gy-1fx").source_grade).toBe("A");
   expect(get("rcr2024-brainmets-srs-15gy-1fx").clinical_source_eligibility_context).toContain("31-40mm");
   expect(get("rcr2024-gbm-40gy-15fx").clinical_source_eligibility_context).toContain("KPS60-70");
   expect(complex.find(x=>x.record_id==="rcr2024-breast-boost-sib-48gy-40gy-15fx")!.source_pdf_page_1based).toBe("20");
 });
 it("records at least 11 explicitly source-confirmed missing regimens without silently adding them to HFC",()=>{
   expect(gaps).toHaveLength(11);
   expect(new Set(gaps.map(x=>x.candidate_key)).size).toBe(11);
   const present=new Set([...regimenPresets,...complexRegimenPresets].map(x=>x.id));
   for(const row of gaps){
     expect(row.currently_implemented).toBe("false");
     expect(row.status).toBe("proposed_future_scope_only_not_added_to_code");
     expect(present.has("rcr2024-"+row.candidate_key)).toBe(false);
     expect(Number(row.source_pdf_page_1based)).toBeGreaterThan(0);
     expect(["A","B","C","D"]).toContain(row.source_grade);
     expect((row.blocking_issue_if_incorrectly_flattened??"").length).toBeGreaterThan(18);
   }
   const bid=gaps.find(x=>x.candidate_key==="sclc-stagesI-III-bid-45gy-30fx")!;
   expect(bid.appropriate_data_representation).toBe("BID-calendar");
   expect(bid.blocking_issue_if_incorrectly_flattened).toContain("twice-daily");
   const gbm=gaps.find(x=>x.candidate_key==="gbm-poorps-30gy-6fx")!;
   expect(gbm.appropriate_data_representation).toBe("calendar-dependent-fixed");
   expect(gbm.blocking_issue_if_incorrectly_flattened).toContain("consecutive");
 });
});
