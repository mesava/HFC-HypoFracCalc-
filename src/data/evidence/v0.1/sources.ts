import type { SourceReference } from "../../../domain/evidence.js";

export const sources = [
  {
    id: "rcr-2019-timely-delivery",
    citation:
      "The Royal College of Radiologists. The timely delivery of radical radiotherapy: guidelines for the management of unscheduled treatment interruptions. Fourth edition. London: The Royal College of Radiologists; 2019. Ref No. BFCO(19)1.",
    year: 2019,
    kind: "guideline",
    notes:
      "Guidance for prevention and management of unscheduled interruptions in radical radiotherapy, including accelerated scheduling, biological compensation, governance and audit.",
  },
  {
    id: "andratschke-2022-estro-eortc-reirradiation",
    citation:
      "Andratschke N, Willmann J, Appelt AL, et al. European Society for Radiotherapy and Oncology and European Organisation for Research and Treatment of Cancer consensus on re-irradiation: definition, reporting, and clinical decision making. Lancet Oncol. 2022;23(10):e469-e478.",
    year: 2022,
    doi: "10.1016/S1470-2045(22)00447-8",
    pmid: "36174633",
    kind: "consensus",
    notes:
      "Validated methodological source. Defines reirradiation as a new radiotherapy course with geometric overlap of previously irradiated volumes (type I) or without geometric overlap when cumulative dose raises toxicity concerns (type II); repeat irradiation without either feature is reported separately.",
  },
  {
    id: "rcr-2024-principles-reirradiation",
    citation:
      "The Royal College of Radiologists. Principles of reirradiation. London: The Royal College of Radiologists; 2024.",
    year: 2024,
    kind: "guideline",
    notes:
      "Validated guidance source. Previous dose should be converted to BED or EQD2 before cumulative assessment; alpha/beta and cumulative equieffective dose should be recorded; manual calculations should be independently checked; normal-tissue recovery is uncertain and any discount to prior dose is a documented clinician judgement rather than an automatic function of elapsed time.",
  },
  {
    id: "appelt-2026-cumulative-dose-reirradiation",
    citation:
      "Appelt AL, Andrzejewski P, Hoffmann L, et al. Cumulative dose evaluation in clinical reirradiation - Consensus guidance on technical considerations by the ESTRO reirradiation focus group. Radiother Oncol. 2026;214:111313.",
    year: 2026,
    doi: "10.1016/j.radonc.2025.111313",
    pmid: "41318002",
    kind: "consensus",
    notes:
      "Validated technical consensus source. Cumulative OAR evaluation requires radiobiological rescaling to equieffective dose before quantitative summation. Physical 3D doses from different courses should not be quantitatively summed. Registration must be assessed patient-specifically; if spatial accumulation is unsuitable or unavailable, a conservative point/near-maximum strategy is acceptable. Any recovery factor is applied explicitly to previously delivered equieffective dose and uncertainties, QA and peer review should be documented.",
  },
  {
    id: "paradis-2026-recog-consensus",
    citation:
      "Paradis KC, Appelt AL, Bentzen SM, et al. Reirradiation Collaborative Group (ReCOG) consensus on standards for dose evaluation and reporting in patients with multiple courses of radiation therapy. Lancet Oncol. 2026;27(2):e101-e110.",
    year: 2026,
    doi: "10.1016/S1470-2045(25)00562-5",
    pmid: "41643699",
    kind: "consensus",
    notes:
      "Validated international consensus on cumulative dose evaluation, documentation and reporting across multiple radiotherapy courses. Supports image-registration-based and point-dose-based approaches chosen according to data availability, anatomy, uncertainty and institutional resources, with explicit reporting of recovery assumptions and cumulative-dose methodology.",
  },
  {
    id: "zhang-2026-recog-case-guide",
    citation:
      "Zhang C, Mayo CS, Matrosic CK, et al. A Case-Based Guide: Demonstrating the Reirradiation Collaborative Group (ReCOG) Consensus for Dosimetric Assessment and Reporting in Reirradiation. Pract Radiat Oncol. 2026. Published online April 14, 2026.",
    year: 2026,
    doi: "10.1016/j.prro.2026.03.010",
    pmid: "41985779",
    kind: "consensus",
    notes:
      "Validated case-based implementation of ReCOG. Demonstrates three cumulative-dose strategies: direct point-dose summation, point-dose summation within overlap regions, and image-registration-based 3D equieffective dose summation; selection depends on available data, resources and patient-specific considerations.",
  },
  {
    id: "milano-2021-hytec-optic",
    citation:
      "Milano MT, Grimm J, Soltys SG, et al. Single- and Multi-Fraction Stereotactic Radiosurgery Dose Tolerances of the Optic Pathways. Int J Radiat Oncol Biol Phys. 2021;110(1):87-99.",
    year: 2021,
    doi: "10.1016/j.ijrobp.2018.01.053",
    pmid: "29534899",
    kind: "systematic-review",
    notes:
      "HyTEC pooled analysis of radiation-induced optic neuropathy after SRS/fSRS. Prior irradiation substantially increased risk; numerical planning guidance is therefore restricted here to patients without prior radiotherapy.",
  },
  {
    id: "milano-2021-hytec-brain",
    citation:
      "Milano MT, Grimm J, Niemierko A, et al. Single- and Multifraction Stereotactic Radiosurgery Dose/Volume Tolerances of the Brain. Int J Radiat Oncol Biol Phys. 2021;110(1):68-86.",
    year: 2021,
    doi: "10.1016/j.ijrobp.2020.08.013",
    pmid: "32921513",
    kind: "systematic-review",
    notes:
      "HyTEC pooled dose-volume analysis for radionecrosis/edema after SRS/fSRS, with separate risk relationships for single-fraction V12 and fractionated V20/V24.",
  },
  {
    id: "sahgal-2021-hytec-spinal-cord",
    citation:
      "Sahgal A, Chang JH, Ma L, et al. Spinal Cord Dose Tolerance to Stereotactic Body Radiation Therapy. Int J Radiat Oncol Biol Phys. 2021;110(1):124-136.",
    year: 2021,
    doi: "10.1016/j.ijrobp.2019.09.038",
    pmid: "31606528",
    kind: "systematic-review",
    notes:
      "HyTEC review and modelling of spinal-cord dose tolerance for de novo and reirradiation spine SBRT.",
  },
  {
    id: "vogelius-bentzen-2020-prostate",
    citation:
      "Vogelius IR, Bentzen SM. Diminishing returns from ultra-hypofractionated radiation therapy for prostate cancer. Int J Radiat Oncol Biol Phys. 2020;107(2):299-304.",
    year: 2020,
    doi: "10.1016/j.ijrobp.2020.01.010",
    pmid: "31987958",
    kind: "meta-analysis",
    notes:
      "Meta-analysis of 14 randomized EBRT trials including 13,384 patients; biochemical control endpoint.",
  },
  {
    id: "brand-2021-chhip-rectal",
    citation:
      "Brand DH, Brüningk SC, Wilkins A, et al. Estimates of Alpha/Beta Ratios for Individual Late Rectal Toxicity Endpoints: An Analysis of the CHHiP Trial. Int J Radiat Oncol Biol Phys. 2021;110(2):596-608.",
    year: 2021,
    doi: "10.1016/j.ijrobp.2020.12.041",
    kind: "modeling-study",
    notes:
      "Endpoint-specific LKB-EQD2 modelling of late rectal toxicity using CHHiP randomized-trial data.",
  },
  {
    id: "brand-2023-chhip-gu",
    citation:
      "Brand DH, Brüningk SC, Wilkins A, et al. The Fraction Size Sensitivity of Late Genitourinary Toxicity: Analysis of Alpha/Beta Ratios in the CHHiP Trial. Int J Radiat Oncol Biol Phys. 2023;115(2):327-336.",
    year: 2023,
    doi: "10.1016/j.ijrobp.2022.08.030",
    kind: "modeling-study",
    notes:
      "Endpoint-specific LKB-EQD2 modelling of late GU toxicity using CHHiP randomized-trial data; published online in 2022 and in volume 115 in 2023.",
  },
  {
    id: "brunt-2020-fast-10y",
    citation:
      "Brunt AM, Haviland JS, Sydenham M, et al. Ten-Year Results of FAST: A Randomized Controlled Trial of 5-Fraction Whole-Breast Radiotherapy for Early Breast Cancer. J Clin Oncol. 2020;38:3261-3272.",
    year: 2020,
    doi: "10.1200/JCO.19.02750",
    kind: "randomized-trial",
    notes:
      "Ten-year FAST analysis with alpha/beta estimates for photographic and physician-assessed late breast normal-tissue endpoints.",
  },
  {
    id: "brunt-2020-fast-forward-5y",
    citation:
      "Brunt AM, Haviland JS, Wheatley DA, et al. Hypofractionated breast radiotherapy for 1 week versus 3 weeks (FAST-Forward): 5-year efficacy and late normal tissue effects results from a multicentre, non-inferiority, randomised, phase 3 trial. Lancet. 2020;395:1613-1626.",
    year: 2020,
    doi: "10.1016/S0140-6736(20)30932-6",
    kind: "randomized-trial",
    notes:
      "Five-year FAST-Forward clinical validation of 40 Gy/15 fractions versus 27 Gy/5 and 26 Gy/5 fractions.",
  },
  {
    id: "brunt-2026-fast-forward-10y",
    citation:
      "Brunt AM, Cafferty FH, Kirby AM, et al. Hypofractionated breast radiotherapy for 1 week versus 3 weeks (FAST-Forward): 10-year efficacy and late normal tissue effects from a multicentre, open-label, non-inferiority, phase 3, randomised controlled trial and 5-year efficacy results from a randomised axillary substudy. Lancet Oncol. 2026;27:686-698.",
    year: 2026,
    doi: "10.1016/S1470-2045(26)00076-8",
    kind: "randomized-trial",
    notes:
      "Ten-year FAST-Forward analysis; Appendix Table D5 reports alpha/beta estimates for ipsilateral breast recurrence and a composite clinician-reported breast/chest-wall normal-tissue endpoint.",
  },
  {
    id: "bcr-2025-ch10-tables",
    citation:
      "Bentzen SM, Joiner MC. The linear-quadratic approach in clinical practice. In: Basic Clinical Radiobiology. 6th ed. 2025. Chapter 10.",
    year: 2025,
    doi: "10.1201/9781003278337-10",
    kind: "textbook",
    notes:
      "Secondary evidence source for Tables 10.1-10.3. Historical estimates sourced through this record remain explicitly identified as textbook-summary evidence unless the originating paper is separately curated.",
  },
  {
    id: "turesson-thames-1989-skin",
    citation:
      "Turesson I, Thames HD. Repair capacity and kinetics of human skin during fractionated radiotherapy: erythema, desquamation, and telangiectasia after 3 and 5 year's follow-up. Radiother Oncol. 1989;15(2):169-188.",
    year: 1989,
    doi: "10.1016/0167-8140(89)90131-X",
    pmid: "2762590",
    kind: "modeling-study",
    notes:
      "Prospective clinical fractionation data in human skin after postmastectomy radiotherapy. The BCR 2025 table reports the erythema alpha/beta estimate 8.8 Gy (6.9-11.6) from this source; the PubMed abstract reports acute-skin alpha/beta values in the same clinical range and emphasizes time/repair effects.",
  },
  {
    id: "bentzen-turesson-thames-1990-telangiectasia",
    citation:
      "Bentzen SM, Turesson I, Thames HD. Fractionation sensitivity and latency of telangiectasia after postmastectomy radiotherapy: a graded-response analysis. Radiother Oncol. 1990;18(2):95-106.",
    year: 1990,
    doi: "10.1016/0167-8140(90)90135-J",
    pmid: "2367694",
    kind: "modeling-study",
    notes:
      "Clinical graded-response fractionation analysis of telangiectasia after postmastectomy radiotherapy. BCR 2025 reports alpha/beta 2.6 Gy (2.2-3.3) from this source.",
  },
  {
    id: "bentzen-overgaard-1991-postmastectomy",
    citation:
      "Bentzen SM, Overgaard M. Relationship between early and late normal-tissue injury after postmastectomy radiotherapy. Radiother Oncol. 1991;20(3):159-165.",
    year: 1991,
    doi: "10.1016/0167-8140(91)90092-U",
    pmid: "1852907",
    kind: "modeling-study",
    notes:
      "Clinical postmastectomy fractionation analysis of late skin/subcutaneous effects. BCR 2025 reports the subcutaneous-fibrosis alpha/beta estimate 1.7 Gy (0.6-2.6) from this source; the paper also reports a separate telangiectasia reanalysis.",
  },
  {
    id: "stuschke-thames-1999-head-neck",
    citation:
      "Stuschke M, Thames HD. Fractionation sensitivities and dose-control relations of head and neck carcinomas: analysis of the randomized hyperfractionation trials. Radiother Oncol. 1999;51(2):113-121.",
    year: 1999,
    doi: "10.1016/S0167-8140(99)00042-0",
    pmid: "10435801",
    kind: "meta-analysis",
    notes:
      "Joint analysis of five randomized hyperfractionation trials; reports tumour alpha/beta 10.5 Gy (6.5-29) and late-effects estimate 4.0 Gy (3.3-5.0).",
  },
  {
    id: "stuschke-pottgen-2010-nsclc",
    citation:
      "Stuschke M, Pöttgen C. Altered fractionation schemes in radiotherapy. Front Radiat Ther Oncol. 2010;42:150-156.",
    year: 2010,
    doi: "10.1159/000262470",
    pmid: "19955801",
    kind: "other",
    notes:
      "Clinical dose-effect comparison of conventional fractionation and SBRT for stage I NSCLC; reports apparent alpha/beta 8.2 Gy (7.0-9.4).",
  },
  {
    id: "geh-2006-esophagus",
    citation:
      "Geh JI, Bond SJ, Bentzen SM, Glynne-Jones R. Systematic overview of preoperative (neoadjuvant) chemoradiotherapy trials in oesophageal cancer: evidence of a radiation and chemotherapy dose response. Radiother Oncol. 2006;78(3):236-244.",
    year: 2006,
    doi: "10.1016/j.radonc.2006.01.009",
    pmid: "16545878",
    kind: "systematic-review",
    notes:
      "Twenty-six preoperative chemoradiotherapy trials (1335 patients); alpha/beta 4.9 Gy (1.5-17) for pathologic complete response and time-loss estimate 0.59 Gy/day (0.18-0.99).",
  },
  {
    id: "bentzen-skoczylas-bernier-2000-lung",
    citation:
      "Bentzen SM, Skoczylas JZ, Bernier J. Quantitative clinical radiobiology of early and late lung reactions. Int J Radiat Biol. 2000;76(4):453-462.",
    year: 2000,
    doi: "10.1080/095530000138448",
    pmid: "10815624",
    kind: "other",
    notes:
      "Clinical-data synthesis used in Basic Clinical Radiobiology for lung pneumonitis alpha/beta and Dprolif estimates.",
  },
  {
    id: "dubray-1995-lung-fibrosis",
    citation:
      "Dubray B, Henry-Amar M, Meerwaldt JH, et al. Radiation-induced lung damage after thoracic irradiation for Hodgkin's disease: the role of fractionation. Radiother Oncol. 1995;36(3):211-217.",
    year: 1995,
    doi: "10.1016/0167-8140(95)01606-H",
    pmid: "8532908",
    kind: "cohort",
    notes:
      "Clinical fractionation analysis using radiological lung changes after mantle irradiation.",
  },
  {
    id: "denham-1995-oropharyngeal-mucosa",
    citation:
      "Denham JW, Hamilton CS, Simpson SA, et al. Acute reaction parameters for human oropharyngeal mucosa. Radiother Oncol. 1995;35(2):129-137.",
    year: 1995,
    doi: "10.1016/0167-8140(95)01545-R",
    pmid: "7569021",
    kind: "modeling-study",
    notes:
      "Clinical study of acute oropharyngeal mucosal reactions and radiobiological parameters.",
  },
  {
    id: "dische-1999-cervix-late-bowel",
    citation:
      "Dische S, Saunders MI, Sealy R, et al. Carcinoma of the cervix and the use of hyperbaric oxygen with radiotherapy: a report of a randomised controlled trial. Radiother Oncol. 1999;53(2):93-98.",
    year: 1999,
    doi: "10.1016/S0167-8140(99)00124-3",
    pmid: "10665784",
    kind: "randomized-trial",
    notes:
      "Randomized cervix trial; late intestinal morbidity analysis reported alpha/beta 4.3 Gy.",
  },
  {
    id: "jin-2015-spinal-cord",
    citation:
      "Jin JY, Huang Y, Brown SL, et al. Radiation dose-fractionation effects in spinal cord: comparison of animal and human data. J Radiat Oncol. 2015;4(3):225-233.",
    year: 2015,
    doi: "10.1007/s13566-015-0212-9",
    pmid: "26366252",
    kind: "meta-analysis",
    notes:
      "Pooled published animal and patient data; patient-data alpha/beta estimate 3.7 Gy (2.2-8.2).",
  },
  {
    id: "schultheiss-2008-spinal-cord",
    citation:
      "Schultheiss TE. The radiation dose-response of the human spinal cord. Int J Radiat Oncol Biol Phys. 2008;71(5):1455-1459.",
    year: 2008,
    doi: "10.1016/j.ijrobp.2007.11.075",
    pmid: "18243570",
    kind: "modeling-study",
    notes:
      "Human cervical cord dose-response analysis; alpha/beta estimate 0.87 Gy. The paper cautions against uncritical application to hyperfractionation.",
  },
  {
    id: "bentzen-saunders-dische-1999-repair",
    citation:
      "Bentzen SM, Saunders MI, Dische S. Repair halftimes estimated from observations of treatment-related morbidity after CHART or conventional radiotherapy in head and neck cancer. Radiother Oncol. 1999;53(3):219-226.",
    year: 1999,
    doi: "10.1016/S0167-8140(99)00151-6",
    pmid: "10660202",
    kind: "modeling-study",
    notes:
      "CHART morbidity analysis; repair half-times 4.9 h for laryngeal edema, 3.8 h for skin telangiectasia and 4.4 h for subcutaneous fibrosis.",
  },
  {
    id: "bentzen-saunders-dische-bond-2001-early",
    citation:
      "Bentzen SM, Saunders MI, Dische S, Bond SJ. Radiotherapy-related early morbidity in head and neck cancer: quantitative clinical radiobiology as deduced from the CHART trial. Radiother Oncol. 2001;60(2):123-135.",
    year: 2001,
    doi: "10.1016/S0167-8140(01)00358-9",
    pmid: "11439207",
    kind: "randomized-trial",
    notes:
      "CHART early-morbidity analysis; reports Dprolif 0.80 Gy/day (0.7-1.1) for mucosa and 0.12 Gy/day (-0.12-0.22) for skin erythema.",
  },
] satisfies SourceReference[];
