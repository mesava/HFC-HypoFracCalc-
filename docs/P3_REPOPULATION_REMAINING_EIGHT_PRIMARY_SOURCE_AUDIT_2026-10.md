# P3.7: остаточные восемь параметров репопуляции (10.10.2026)

Аудит выполнен по аннотациям **оригинальных публикаций**, где ниже указано, и отдельно по вторичному QUANTEC. Это не независимая проверка полного PDF, конкретных уравнений или применимости EQD2; численные коэффициенты HFC не менялись. Source file archive SHA and scientific release approval remain open.

| ID | Verified original / secondary locator | Finding |
|---|---|---|
| dprolif-hn-tonsil-bcr2025 | Withers 1995 PMID 7558943; DOI 10.1016/0360-3016(95)00228-Q; Abstract Results | 676 cases; 0.73 Gy/day if delayed onset ~30 days; alternative 0.53 Gy/day with proliferation starting within 9 days. HFC uses the former assumption only. No primary 95% CI |
| dprolif-esophagus-pcr-geh2006 | Geh 2006 PMID 16545878 DOI 10.1016/j.radonc.2006.01.009 Abstract Results | HFC 0.59 [0.18,0.99] Gy/day matches; 26 preoperative CRT trials 1335 patients, endpoint pCR, not RT-alone local control |
| dprolif-nsclc-bcr2025 | Koukourakis 1996 PMID 8567332 DOI 10.1016/0360-3016(95)02102-7 Abstract Methods/Results | HFC 0.45 Gy/day matches pooled 153 patient analysis; subgroup 0.20 Gy/day without mediastinal involvement, NTD-T alpha/beta=10, after treatment duration beyond 20 days, not universal Tk |
| dprolif-prostate-bcr2025 | Thames 2010 PMID 20400191 DOI 10.1016/j.radonc.2010.03.020 Abstract Results | 0.24 Gy/day matched low/intermediate-risk at >=70 Gy; 52-day comparison threshold not biological Tk, no source abstract 95% CI |
| dprolif-lung-pneumonitis-bentzen2000 | Bentzen 2000 PMID 10815624 DOI 10.1080/095530000138448 primary review Abstract Conclusions; QUANTEC Marks 2010 PMC3576042 | Original says around 0.5 Gy/day; QUANTEC **secondary** gives exactly 0.54 ± 0.21 Gy/day **one SE, NOT source 95% CI**. Pneumonitis, not fibrosis |

Three source records **remain numeric-primary pending**. BCR 2025 generalized HN 0.8 Tk21 cannot be inferred from Roberts' node-negative larynx series; it remains deprecated. BCR larynx 0.74 [0.30–1.20] differs from original Robertson four-centre larynx gamma/alpha 0.89 [0.35–1.43] (PMID 9457816), possibly distinct modelling/case mix, and remains deprecated. Hendry 1996 (PMID 8934049) abstract compares LQ missed-day compensation but **does not print** 0.64 [0.42–0.86]; independent 2013 article PMC4784425 **quotes** that estimate, not enough for source table/figure signoff.

Clinical units: original extra physical dose/day, NTD-T time correction, a BED gamma/alpha coefficient, and an EQD2 time penalty are **not** interchangeable by numeric equality. Hinata tBED blocker P3-C03 remains open. The HFC code resolver for repopulation exposes a second blocker P3-C07: deprecated records can be resolved by explicit ID even when standard lists hide them. Documented only; behavioral fix needs separately approved P4 scope. All HFC values/statuses/defaultEligible and calculations remain unchanged.

**103 review statuses:** 20 full primary table/CI transcriptions; 39 separately P2-reviewed entries; 6 repair abstract; 7 time-loss original abstract CI; 3 time-loss original point-only; 1 approximate original/QUANTEC exact; 27 pending (24 other alpha/beta, 3 time-loss). User primary file supplied 73/103, pending 13 supplied vs 14 absent. Clinical status remains draft. Primary full-publisher-PDF and dose-basis signoff remain mandatory.
