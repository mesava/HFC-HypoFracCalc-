import { describe, expect, it } from "vitest";
import {
  hytecClinicalConstraints, hytecOutcomeModels, sources,
  reirradiationGuidanceSets,
} from "../src/data/evidence/v0.1/index.js";
import { queryClinicalConstraints, validateConstraintDataset }
  from "../src/evidence/constraintRegistry.js";

/**
 * HyTEC batch 05 (source manuscripts 10–16), re-read directly from user
 * uploaded PDF/DOC/DOCX, 2026-10-15. These are scientific REGRESSION
 * checks for source provenance, NOT commissioned clinical predictions.
 * Sahgal 2019.09.038 Table3/4; Vargo 2018.01.044 Table4;
 * Grimm 2020.12.037 Fig2/Table2 + supplement Table A1;
 * Lee 2019.03.045 abstract/Table2 + supplement cohort table;
 * Kong 2018.11.028 recommendations + S-Table3;
 * Ohri 2017.12.288 Figure3; Miften 2017.12.290 recommendations.
 */
const row=(id:string)=>hytecClinicalConstraints.find(c=>c.id===id)!;
describe("HyTEC batch05 geometry and evidence-scope safety",()=>{
  it("locks Miften spared-volume rVdose to liver-minus-GTV, not Vx>=threshold",()=>{
    for(const [id,xGy] of [
      ["hytec-liver-spared-vle15gy-700cc",15],
      ["hytec-liver-spared-vle17gy-700cc",17],
    ] as const){
      const r=row(id);
      expect(r.metric).toEqual({kind:"VleX",xGy});
      expect(r.volumeBasis).toBe("normal-liver-minus-gtv");
      expect(r.value).toBe(700);
      expect(r.unit).toBe("cc");
      expect(r.relation).toBe(">=");
      expect(r.guidanceKind).toBe("observational-threshold");
      expect(r.estimatedRisk).toBeUndefined();
    }
    expect(queryClinicalConstraints({
      metricKind:"VleX",volumeBasis:"normal-liver-minus-gtv"
    }).filter(c=>c.sourceId==="miften-2021-hytec-liver-toxicity"))
      .toHaveLength(2);
    expect(queryClinicalConstraints({
      metricKind:"VleX",volumeBasis:"target-inclusive-tissue"
    }).filter(c=>c.sourceId==="miften-2021-hytec-liver-toxicity"))
      .toHaveLength(0);
  });

  it("locks Kong V20 to bilateral-lungs-minus-GTV-or-IGTV, not brain or liver Vx",()=>{
    const v20=row("hytec-lung-rilt-v20-10to15pct");
    expect(v20.metric).toEqual({kind:"Vx",xGy:20});
    expect(v20.unit).toBe("%");
    expect(v20.valueRange).toEqual({low:10,high:15});
    expect(v20.guidanceKind).toBe("observational-threshold");
    expect(v20.volumeBasis).toBe("bilateral-lungs-minus-gtv-or-igtv");
    expect(queryClinicalConstraints({
      metricKind:"Vx",volumeBasis:"bilateral-lungs-minus-gtv-or-igtv",
    }).filter(c=>c.sourceId==="kong-2021-hytec-lung-parenchyma"))
      .toHaveLength(1);
    expect(queryClinicalConstraints({
      metricKind:"Vx",volumeBasis:"target-inclusive-tissue",
    }).some(c=>c.id===v20.id)).toBe(false);
    expect(() => validateConstraintDataset()).not.toThrow();
  });

  it("does not promote Lee's fitted alpha/beta values into general NSCLC clinical outcomes",()=>{
    const lee=sources.find(s=>s.id==="lee-2021-hytec-stage-i-nsclc")!;
    expect(lee).toBeDefined();
    expect(lee.doi).toBe("10.1016/j.ijrobp.2019.03.045");
    expect(hytecOutcomeModels.every(m=>m.sourceId!==lee.id)).toBe(true);
    // Lee T1/T2 regrowth fits yield alpha/beta about 24.8/19 Gy,
    // with chi2/ndf>1 and heterogeneous isocenter conversion;
    // these estimates are NOT universal tumor radiobiology parameters.
  });

  it("preserves distinct Sahgal true-cord/thecal-sac and Grimm Dmax/D0.5cc metrics",()=>{
    const spinal=hytecClinicalConstraints.filter(c=>
      c.sourceId==="sahgal-2021-hytec-spinal-cord");
    expect(spinal.filter(c=>c.guidanceKind==="risk-point")).toHaveLength(5);
    expect(row("hytec-cord-dmax-1fx-risk-range").valueRange)
      .toEqual({low:12.4,high:14});
    const re=reirradiationGuidanceSets.find(r=>
      r.id==="hytec-spinal-cord-reirradiation-lower-risk-factors")!;
    expect(re.requiredStructure).toBe("thecal-sac");
    expect(re.requiredMetric).toBe("Dmax");
    expect(re.criteria).toHaveLength(4);
    const bleed20=row("hytec-major-vessel-dmax-5fx-20gy-risk");
    const guide=row("hytec-major-vessel-d0p5cc-5fx-20gy");
    expect(bleed20.metric.kind).toBe("Dmax");
    expect(guide.metric.kind).toBe("D0.5cc");
    expect(bleed20.estimatedRisk).toBe(.02);
    expect(guide.estimatedRisk).toBeUndefined();
    expect(sources.find(s=>s.id===guide.sourceId)?.doi)
      .toBe("10.1016/j.ijrobp.2020.12.037");
  });

  it("retains Vargo time-scoped TCP and Ohri 3-year KM rather than 2-year fit",()=>{
    const hn=hytecOutcomeModels.find(m=>
      m.id==="hytec-hn-reirradiation-local-control")!;
    expect(hn.points).toHaveLength(6);
    expect(hn.priorRadiotherapy).toBe("yes");
    const liver=hytecOutcomeModels.find(m=>
      m.id==="hytec-liver-metastases-bed10-local-control")!;
    expect(liver.evidenceForm).toBe("stratified-observation");
    expect(liver.points.map(p=>p.probability)).toEqual([.93,.65]);
    expect(liver.points.every(p=>p.followUp==="3 years")).toBe(true);
  });
});
