import { describe, expect, it } from "vitest";
import crosswalk from "../docs/P6_2C_30_PRIMARY_ALPHA_BETA_SOURCE_CODE_RECONCILIATION_2026-11-01.csv?raw";
import { alphaBetaEstimates, evidenceManifest } from "../src/data/evidence/v0.1/index.js";

function readCsv(raw: string): Record<string,string>[] {
 const rr:string[][]=[]; let parts:string[]=[],cell="",quoted=false;
 for(let i=0;i<raw.length;i++){const ch=raw[i]!;
   if(ch==='"'){if(quoted&&raw[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
   else if(ch===','&&!quoted){parts.push(cell);cell="";}
   else if((ch==='\n'||ch==='\r')&&!quoted){
    if(ch==='\r'&&raw[i+1]==='\n')i++;
    parts.push(cell);if(parts.some(x=>x!==""))rr.push(parts);
    parts=[];cell="";
   } else cell+=ch;
 }
 if(quoted)throw Error("Unclosed CSV quote");
 if(parts.length||cell){parts.push(cell);rr.push(parts);}
 const head=rr.shift()!;
 return rr.map((a,i)=>{if(a.length!==head.length)throw Error("CSV row "+i);return Object.fromEntries(head.map((k,j)=>[k,a[j]!]))});
}
const entries=readCsv(crosswalk);
const idsBySource=Object.fromEntries(entries.reduce((m,r)=>{
  const n=r.primary_filename;const arr=m.get(n)||[];arr.push(r);m.set(n,arr);return m;
},new Map<string,Record<string,string>[]>())) as Record<string,Record<string,string>[]>;

describe("P6.2c original-page alpha/beta primary source numerical gate",()=>{
 it("maps 30 independently copied published α/β rows to exactly 30 live records",()=>{
  expect(alphaBetaEstimates).toHaveLength(44);expect(entries).toHaveLength(30);
  expect(new Set(entries.map(x=>x.record_id)).size).toBe(30);
  const live=new Map(alphaBetaEstimates.map(x=>[x.id,x]));
  for(const row of entries){
    const x=live.get(row.record_id);
    expect(x, row.record_id).toBeDefined();
    expect(x!.sourceId).toBe(row.source_id);
    expect(x!.valueGy).toBe(Number(row.source_alpha_beta_gy));
    if(row.source_ci95_low_gy===""&&row.source_ci95_high_gy===""){
      expect(x!.ci95).toBeUndefined();
    }else {
      expect(x!.ci95?.low).toBe(Number(row.source_ci95_low_gy));
      expect(x!.ci95?.high).toBe(Number(row.source_ci95_high_gy));
    }
    expect(x!.defaultEligible).toBe(row.auto_select_in_current_HFC==="true");
    expect(row.record_code_numeric_match).toBe("true");
    expect(row.clinical_fit_refit_2026_11_01).toBe("false");
    expect(row.full_population_commissioning).toBe("false");
    expect(row.source_sha256_verified_2026_11_01).toMatch(/^[a-f0-9]{64}$/);
  }
  expect(evidenceManifest.releaseStatus).toBe("draft");
 });
 it("preserves all source page/table coverage and endpoint-specific provenance",()=>{
  expect(Object.keys(idsBySource)).toHaveLength(5);
  const group=(part:string)=>entries.filter(x=>x.primary_filename.includes(part));
  expect(group("Vogelius")).toHaveLength(1);
  expect(group("Brand_2021")).toHaveLength(9);
  expect(group("Brand_2022")).toHaveLength(10);
  expect(group("FAST_10y")).toHaveLength(7);
  expect(group("FAST-Forward")).toHaveLength(3);
  for(const x of entries){
    expect(Number(x.source_pdf_page_1based)).toBeGreaterThan(0);
    expect(x.source_table_or_figure.length).toBeGreaterThan(12);
    expect(x.source_model_applicability.length).toBeGreaterThan(20);
  }
 });
 it("retains poor-fit/uncertain models and refuses to invent CI or interchangeable FAST schedule",()=>{
  const row=(id: string)=>entries.find(x=>x.record_id===id)!;
  expect(row("ab-rectum-pain-g1-brand2021").source_ci95_high_gy).toBe("839.6");
  expect(row("ab-rectum-pain-g1-brand2021").auto_select_in_current_HFC).toBe("false");
  expect(row("ab-gu-frequency-g1-brand2023").source_ci95_high_gy).toBe("997.8");
  expect(row("ab-gu-frequency-g1-brand2023").auto_select_in_current_HFC).toBe("false");
  expect(row("ab-breast-induration-fast2020").source_ci95_low_gy).toBe("0");
  expect(row("ab-breast-edema-fast2020").source_ci95_low_gy).toBe("");
  expect(row("ab-breast-edema-fast2020").source_ci95_high_gy).toBe("");
  expect(row("ab-breast-photo-fast2020").source_model_applicability).toContain("once_weekly");
  expect(row("ab-breast-ibr-fastforward2026-adjusted").source_model_applicability).toContain("one_week");
  expect(row("ab-breast-photo-fast2020").source_model_applicability).not.toBe(row("ab-breast-ibr-fastforward2026-adjusted").source_model_applicability);
 });
 it("does not mistake Vogelius manuscript cohort discrepancy for alpha-beta mismatch",()=>{
  const a=entries.find(x=>x.record_id==="ab-prostate-biochemical-control-vb2020")!;
  expect(Number(a.source_alpha_beta_gy)).toBe(1.6);
  expect(Number(a.source_ci95_low_gy)).toBe(1.3);
  expect(Number(a.source_ci95_high_gy)).toBe(2.0);
  expect(9146+2238).toBe(11384);
  expect(13384-(9146+2238)).toBe(2000);
 });
});
