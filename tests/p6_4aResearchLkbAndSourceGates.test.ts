import {describe,expect,it} from "vitest";
import {evaluateResearchLkbExample} from "../src/research/lkbNtcpPrototype.js";
import modelCsv from "../docs/P6_4A_38_LIVE_OUTCOME_OAR_SOURCE_GATES_2026-10-19.csv?raw";
import candidatesCsv from "../docs/P6_4A_LKB_NTCP_RESEARCH_CANDIDATES_2026-10-19.csv?raw";
import {hytecOutcomeModels,hytecClinicalConstraints,evidenceManifest} from "../src/data/evidence/v0.1/index.js";
import {regimenPresets} from "../src/data/regimens/v0.1/index.js";
import {complexRegimenPresets} from "../src/data/regimens/v0.2/index.js";

function csvRows(text:string):Record<string,string>[]{
 const ll=text.trimEnd().split(/\r?\n/);
 const parse=(line:string):string[]=>{const out:string[]=[];let cell="",q=false;
  for(let i=0;i<line.length;i++){const c=line[i]!;
   if(c==='"'){if(q&&line[i+1]==='"'){cell+='"';i++;}else q=!q;}
   else if(c===','&&!q){out.push(cell);cell="";}else cell+=c;
  }
  if(q)throw new Error("unclosed CSV");out.push(cell);return out;
 };
 const headers=parse(ll[0]!);
 return ll.slice(1).map((line,i)=>{const vals=parse(line);if(vals.length!==headers.length)throw Error("CSV row "+i);return Object.fromEntries(headers.map((k,j)=>[k,vals[j]!]))});
}
const rows=csvRows(modelCsv),candidates=csvRows(candidatesCsv);
const G={td50Gy:68.5,m:0.15,n:0.13};
describe("P6.4a isolated research-only LKB NTCP mathematics",()=>{
 it("matches independently calculated synthetic uniform and two-bin DVH reference values",()=>{
  const uniform=evaluateResearchLkbExample([{doseGy:68.5,volumeFraction:1}],G);
  expect(uniform.effectiveDoseGy).toBeCloseTo(68.5,11);
  expect(uniform.t).toBeCloseTo(0,11);expect(uniform.probability).toBe(0.5);
  const half=evaluateResearchLkbExample([{doseGy:60,volumeFraction:0.5},{doseGy:70,volumeFraction:0.5}],G);
  expect(half.effectiveDoseGy).toBeCloseTo(66.22402066544781,9);
  expect(half.probability).toBeCloseTo(0.4123490362321194,6);
  const high=evaluateResearchLkbExample([{doseGy:60,volumeFraction:0.25},{doseGy:70,volumeFraction:0.75}],G);
  expect(high.effectiveDoseGy).toBeCloseTo(68.28593087658744,9);
  expect(high.probability).toBeCloseTo(0.49168904656670886,6);
 });
 it("obeys uniform and n=1 mean limits and never interprets Gy as volume percent",()=>{
  const linear=evaluateResearchLkbExample([{doseGy:60,volumeFraction:0.5},{doseGy:70,volumeFraction:0.5}],{...G,n:1});
  expect(linear.effectiveDoseGy).toBeCloseTo(65,10);
  for(const n of [0.05,0.13,0.5,1,2]){
   const u=evaluateResearchLkbExample([{doseGy:45,volumeFraction:0.3},{doseGy:45,volumeFraction:0.7}],{...G,n});
   expect(u.effectiveDoseGy).toBeCloseTo(45,9);
  }
  expect(()=>evaluateResearchLkbExample([{doseGy:60,volumeFraction:50},{doseGy:70,volumeFraction:50}],G)).toThrow(/sum to one/);
 });
 it("is dose-monotonic for a fixed differential DVH and requires proper valid inputs",()=>{
  const lo=evaluateResearchLkbExample([{doseGy:40,volumeFraction:0.3},{doseGy:65,volumeFraction:0.7}],G);
  const hi=evaluateResearchLkbExample([{doseGy:45,volumeFraction:0.3},{doseGy:70,volumeFraction:0.7}],G);
  expect(hi.effectiveDoseGy).toBeGreaterThan(lo.effectiveDoseGy);
  expect(hi.probability).toBeGreaterThan(lo.probability);
  expect(lo.effectiveDoseGy).toBeGreaterThanOrEqual(40);
  expect(hi.effectiveDoseGy).toBeLessThanOrEqual(70);
  for(const n of [0,-1,Infinity,NaN])expect(()=>evaluateResearchLkbExample([{doseGy:60,volumeFraction:1}],{...G,n})).toThrow();
  for(const m of [0,-1,Infinity,NaN])expect(()=>evaluateResearchLkbExample([{doseGy:60,volumeFraction:1}],{...G,m})).toThrow();
  for(const td50Gy of [0,-1,Infinity,NaN])expect(()=>evaluateResearchLkbExample([{doseGy:60,volumeFraction:1}],{...G,td50Gy})).toThrow();
  expect(()=>evaluateResearchLkbExample([],G)).toThrow();
  expect(()=>evaluateResearchLkbExample([{doseGy:-1,volumeFraction:1}],G)).toThrow();
  expect(()=>evaluateResearchLkbExample([{doseGy:60,volumeFraction:NaN}],G)).toThrow();
  expect(()=>evaluateResearchLkbExample([{doseGy:60,volumeFraction:0}],G)).toThrow();
  expect(()=>evaluateResearchLkbExample([{doseGy:60,volumeFraction:1.01}],G)).toThrow();
 });
 it("source candidates remain research-only and verify source-specific endpoints and fixed n",()=>{
  expect(candidates).toHaveLength(3);
  const rect=candidates.find(x=>x.id==="gulliford2012-rectal-bleeding-G2")!;
  expect([Number(rect.td50),Number(rect.m),Number(rect.n)]).toEqual([68.5,0.15,0.13]);
  expect(rect.pmid).toBe("22119373");
  expect(rect.status).toMatch(/research_candidate/);
  const lung=candidates.find(x=>x.id==="semenenko2008-lung-symptomatic-pneumonitis")!;
  const saliva=candidates.find(x=>x.id==="semenenko2008-parotid-xerostomia")!;
  expect(lung.nstatus).toBe("fixed_assumption_n1");
  expect(saliva.nstatus).toBe("fixed_assumption_n1");
  expect([Number(lung.td50),Number(lung.m),Number(lung.n)]).toEqual([29.9,0.41,1]);
  expect([Number(saliva.td50),Number(saliva.m),Number(saliva.n)]).toEqual([31.4,0.53,1]);
  expect(candidates.every(x=>!hytecOutcomeModels.some(m=>m.sourceId===x.id))).toBe(true);
  expect(evidenceManifest.releaseStatus).toBe("draft");
 });
});
describe("P6.4a live source classes: not an unqualified clinical TCP/NTCP release",()=>{
 it("exactly reconciles nine OutcomeModels, 40 points and 29 distinct OAR constraints",()=>{
  expect(hytecOutcomeModels).toHaveLength(9);
  expect(hytecClinicalConstraints).toHaveLength(29);
  expect(rows).toHaveLength(38);
  const alive=[...hytecOutcomeModels,...hytecClinicalConstraints];
  expect(rows.map(r=>r.record_id).sort()).toEqual(alive.map(x=>x.id).sort());
  expect(new Set(rows.map(r=>r.record_id)).size).toBe(38);
  expect(hytecOutcomeModels.reduce((acc,m)=>acc+m.points.length,0)).toBe(40);
  for(const m of hytecOutcomeModels){
   const r=rows.find(x=>x.record_id===m.id)!;
   expect(r.family).toBe("outcome-model");
   expect(r.endpoint_id).toBe(m.endpointId);expect(r.source_id).toBe(m.sourceId);
   expect(r.representation).toBe(m.evidenceForm);
   expect(Number(r.published_point_count)).toBe(m.points.length);
   expect(Number(r.source_discrepancy_count)).toBe(m.points.filter(p=>p.sourceReproducibility==="unresolved-equation-table-mismatch").length);
  }
  for(const c of hytecClinicalConstraints){
   const r=rows.find(x=>x.record_id===c.id)!;
   expect(r.family).toBe("clinical-constraint");
   expect(r.endpoint_id).toBe(c.endpointId);expect(r.source_id).toBe(c.sourceId);
   expect(r.representation).toBe(c.guidanceKind);expect(r.dose_metric_or_outcome_kind).toBe(c.metric.kind);
  }
  expect(rows.every(r=>r.individual_treatment_planning_certified==="false")).toBe(true);
  expect(rows.every(r=>r.source_dose_metric_harmonized_for_patient_DVH==="false")).toBe(true);
 });
 it("enforces source discrepancy gates and preserves complex RCR prescription structure",()=>{
  const royce=rows.find(x=>x.record_id==="hytec-prostate-sbrt-5y-tcp")!;
  expect(royce.source_discrepancy_count).toBe("2");
  const nsclc=rows.find(x=>x.record_id==="nsclc-stage-i-size-adjusted-2y-tcp")!;
  expect(nsclc.risk_category).toContain("ohri_author_reported_vs_formula");
  const brain=rows.filter(r=>r.risk_category==="target_inclusive_Vx_not_brain_minus_PTV");
  expect(brain).toHaveLength(7);
  expect(regimenPresets).toHaveLength(25);expect(complexRegimenPresets).toHaveLength(4);
  expect(new Set([...regimenPresets,...complexRegimenPresets].map(r=>r.id)).size).toBe(29);
  expect(new Set(complexRegimenPresets.map(r=>r.prescription.kind))).toEqual(new Set(["dose-range","sequential","sib"]));
 });
});
