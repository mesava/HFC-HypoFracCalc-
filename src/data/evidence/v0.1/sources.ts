import type { SourceReference } from "../../../domain/evidence.js";

export const sources = [
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
] satisfies SourceReference[];
