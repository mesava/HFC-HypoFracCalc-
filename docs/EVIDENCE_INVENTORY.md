# Evidence inventory — HFC 2026.10-v0.1

Дата инвентаризации: **2026-10-06**  
Ветка-основание: `develop` + validation package v0.9  
Статус evidence dataset: **draft**.

## Назначение

Поштучная матрица текущей evidence-базы. Журнал научных решений находится в `docs/EVIDENCE_VALIDATION.md`. Правило sign-off: **первичная публикация или официальный документ имеет приоритет; вторичная сводка может подтверждать число, но не закрывает первичную проверку, если первоисточник доступен.**

## Сводка

| Раздел | Записей |
|---|---:|
| alphaBeta.ts | 30 |
| alphaBetaAdditional.ts | 14 |
| repairHalfTime.ts | 6 |
| repopulation.ts | 13 |
| constraintsHytec.ts | 15 |
| reirradiationGuidance.ts | 1 |
| **Всего** | **79** |

После пакета v0.9 незакрытая очередь первичного sign-off сокращена до **7 записей**. Ни одна pending-запись не является автоматическим default.

## Матрица

`AUTO` — параметр может подставляться автоматически при совпадении endpoint/applicability; `EXPLICIT` — только явный выбор; `n/a` — механизм defaultEligible неприменим.

| Record ID | Endpoint | Число / ДИ / диапазон | Source (kind) | Применимость | Выбор | Support / meaning | Пакет | Validation state |
|---|---|---|---|---|---|---|---:|---|
| `ab-prostate-biochemical-control-vb2020` | `prostate-biochemical-control` | 1.6 Gy [1.3; 2] | `vogelius-bentzen-2020-prostate` (meta-analysis) | definitive prostate EBRT; prior RT: none | AUTO | supported | 1 | validated |
| `ab-rectum-bleeding-g1-brand2021` | `rectum-bleeding-g1plus` | 1.6 Gy [0.9; 2.5] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | AUTO | supported | 1 | validated |
| `ab-rectum-bleeding-g2-brand2021` | `rectum-bleeding-g2plus` | 1.7 Gy [0.7; 3] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | limited | 1 | validated |
| `ab-rectum-frequency-g1-brand2021` | `rectum-stool-frequency-g1plus` | 2.3 Gy [0.9; 5.3] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | limited | 1 | validated |
| `ab-rectum-frequency-g2-brand2021` | `rectum-stool-frequency-g2plus` | 2.7 Gy [0.9; 8.5] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | limited | 1 | validated |
| `ab-rectum-pain-g1-brand2021` | `rectum-pain-g1plus` | 3.6 Gy [0; 839.6] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | poor-fit | 1 | validated |
| `ab-rectum-proctitis-g1-brand2021` | `rectum-proctitis-g1plus` | 2.7 Gy [1.5; 5.4] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | limited | 1 | validated |
| `ab-rectum-proctitis-g2-brand2021` | `rectum-proctitis-g2plus` | 2.7 Gy [1.3; 15.1] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | limited | 1 | validated |
| `ab-rectum-sphincter-g1-brand2021` | `rectum-sphincter-control-g1plus` | 3.1 Gy [1.4; 9.1] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | limited | 1 | validated |
| `ab-rectum-stricture-ulcer-g1-brand2021` | `rectum-stricture-ulcer-g1plus` | 2.5 Gy [0.9; 8.2] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | limited | 1 | validated |
| `ab-gu-dysuria-g1-brand2023` | `gu-dysuria-g1plus` | 2 Gy [1.2; 3.2] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | AUTO | supported | 1 | validated |
| `ab-gu-dysuria-g2-brand2023` | `gu-dysuria-g2plus` | 1.6 Gy [0.1; 36] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | poor-fit | 1 | validated |
| `ab-gu-hematuria-g1-brand2023` | `gu-hematuria-g1plus` | 0.9 Gy [0.1; 2.2] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | AUTO | supported | 1 | validated |
| `ab-gu-hematuria-g2-brand2023` | `gu-hematuria-g2plus` | 0.6 Gy [0.1; 1.7] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | AUTO | supported | 1 | validated |
| `ab-gu-incontinence-g1-brand2023` | `gu-incontinence-g1plus` | 1 Gy [0.1; 17.6] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | poor-fit | 1 | validated |
| `ab-gu-incontinence-g2-brand2023` | `gu-incontinence-g2plus` | 1.5 Gy [0.1; 6.2] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | limited | 1 | validated |
| `ab-gu-reduced-flow-g1-brand2023` | `gu-reduced-flow-stricture-g1plus` | 1.9 Gy [0.1; 424.6] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | limited | 1 | validated |
| `ab-gu-reduced-flow-g2-brand2023` | `gu-reduced-flow-stricture-g2plus` | 0.7 Gy [0.1; 991.9] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | poor-fit | 1 | validated |
| `ab-gu-frequency-g1-brand2023` | `gu-urine-frequency-g1plus` | 1.9 Gy [0.1; 997.8] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | poor-fit | 1 | validated |
| `ab-gu-frequency-g2-brand2023` | `gu-urine-frequency-g2plus` | 3.3 Gy [0.1; 996] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT; 2–3 Gy/fx; 19–37 fx; no prior RT | EXPLICIT | poor-fit | 1 | validated |
| `ab-breast-photo-fast2020` | `breast-photographic-appearance` | 2.7 Gy [1.5; 3.9] | `brunt-2020-fast-10y` (randomized-trial) | FAST whole-breast EBRT; 5–25 fx; 2–6 Gy/fx; no prior RT | AUTO | supported | 1 | validated |
| `ab-breast-photo-fast2020-adjusted` | `breast-photographic-appearance` | 2.5 Gy [1.1; 3.9] | `brunt-2020-fast-10y` (randomized-trial) | FAST whole-breast EBRT; 5–25 fx; 2–6 Gy/fx; no prior RT | EXPLICIT | supported | 1 | validated |
| `ab-breast-any-nte-fast2020` | `breast-physician-any-nte-fast` | 2.5 Gy [1.8; 3.3] | `brunt-2020-fast-10y` (randomized-trial) | FAST whole-breast EBRT; 5–25 fx; 2–6 Gy/fx; no prior RT | AUTO | supported | 1 | validated |
| `ab-breast-shrinkage-fast2020` | `breast-shrinkage` | 2.7 Gy [1.9; 3.5] | `brunt-2020-fast-10y` (randomized-trial) | FAST whole-breast EBRT; 5–25 fx; 2–6 Gy/fx; no prior RT | AUTO | supported | 1 | validated |
| `ab-breast-induration-fast2020` | `breast-induration` | 1.6 Gy [0; 4.4] | `brunt-2020-fast-10y` (randomized-trial) | FAST whole-breast EBRT; 5–25 fx; 2–6 Gy/fx; no prior RT | EXPLICIT | limited | 1 | validated |
| `ab-breast-telangiectasia-fast2020` | `breast-telangiectasia` | 3.1 Gy [2.3; 3.9] | `brunt-2020-fast-10y` (randomized-trial) | FAST whole-breast EBRT; 5–25 fx; 2–6 Gy/fx; no prior RT | AUTO | supported | 1 | validated |
| `ab-breast-edema-fast2020` | `breast-edema` | 1.9 Gy | `brunt-2020-fast-10y` (randomized-trial) | FAST whole-breast EBRT; 5–25 fx; 2–6 Gy/fx; no prior RT | EXPLICIT | limited | 1 | validated |
| `ab-breast-ibr-fastforward2026-adjusted` | `breast-ipsilateral-recurrence` | 3.3 Gy [1.9; 4.9] | `brunt-2026-fast-forward-10y` (randomized-trial) | FAST-Forward whole-breast/chest-wall; 5–15 fx; no prior RT | AUTO | supported | 1 | validated |
| `ab-breast-ibr-fastforward2026-unadjusted` | `breast-ipsilateral-recurrence` | 3.4 Gy [1.6; 5.2] | `brunt-2026-fast-forward-10y` (randomized-trial) | FAST-Forward whole-breast/chest-wall; 5–15 fx; no prior RT | EXPLICIT | supported | 1 | validated |
| `ab-breast-chestwall-any-ae-fastforward2026` | `breast-chestwall-any-ae-fastforward` | 2.1 Gy [1.6; 2.6] | `brunt-2026-fast-forward-10y` (randomized-trial) | FAST-Forward whole-breast/chest-wall; 5–15 fx; no prior RT | AUTO | supported | 1 | validated |
| `ab-oral-mucosa-mucositis-denham1995` | `oral-mucosa-mucositis` | 9.3 Gy [5.8; 17.9] | `denham-1995-oropharyngeal-mucosa` (modeling-study) | head-and-neck radiotherapy; prior RT: not-reported | AUTO | supported | 4 | validated |
| `ab-skin-erythema-bcr2025` | `skin-erythema` | 8.8 Gy [6.9; 11.6] | `turesson-thames-1989-skin` (modeling-study) | postmastectomy skin irradiation; prior RT: none | AUTO | supported | 4 | validated |
| `ab-skin-telangiectasia-bcr2025` | `skin-telangiectasia` | 2.6 Gy [2.2; 3.3] | `bentzen-turesson-thames-1990-telangiectasia` (modeling-study) | postmastectomy radiotherapy; prior RT: none | AUTO | supported | 4 | validated |
| `ab-subcutis-fibrosis-bcr2025` | `subcutis-fibrosis` | 1.7 Gy [0.6; 2.6] | `bentzen-overgaard-1991-postmastectomy` (modeling-study) | postmastectomy radiotherapy; prior RT: none | AUTO | supported | 4 | validated |
| `ab-bowel-stricture-perforation-bcr2025` | `bowel-stricture-perforation` | 3.9 Gy [2.5; 5.3] | `bcr-2025-ch10-tables` (textbook) | photon clinical data; prior RT not reported | EXPLICIT | limited | 4 | validated |
| `ab-bowel-various-late-dische1999` | `bowel-various-late-effects` | 4.3 Gy [2.2; 9.6] | `dische-1999-cervix-late-bowel` (randomized-trial) | pelvic radiotherapy; prior RT: none | EXPLICIT | limited | 4 | validated |
| `ab-lung-pneumonitis-bentzen2000` | `lung-pneumonitis` | 4 Gy [2.2; 5.8] | `bentzen-skoczylas-bernier-2000-lung` (other) | thoracic radiotherapy; prior RT: not-reported | EXPLICIT | limited | 4 | validated |
| `ab-lung-fibrosis-dubray1995` | `lung-radiological-fibrosis` | 3.1 Gy [-0.2; 8.5] | `dubray-1995-lung-fibrosis` (cohort) | mantle-field thoracic radiotherapy; prior RT: none | EXPLICIT | limited | 4 | validated |
| `ab-hn-late-effects-stuschke1999` | `head-neck-various-late-effects` | 4 Gy [3.3; 5] | `stuschke-thames-1999-head-neck` (meta-analysis) | head-and-neck EBRT, hyperfractionation; prior RT: none | AUTO | supported | 4 | validated |
| `ab-hn-tumour-control-stuschke1999` | `head-neck-tumour-control` | 10.5 Gy [6.5; 29] | `stuschke-thames-1999-head-neck` (meta-analysis) | head-and-neck EBRT, hyperfractionation; prior RT: none | AUTO | supported | 4 | validated |
| `ab-nsclc-stage-i-stuschke2010` | `nsclc-stage-i-local-control` | 8.2 Gy [7; 9.4] | `stuschke-pottgen-2010-nsclc` (other) | conventional EBRT, SBRT; prior RT: none | EXPLICIT | limited | 4 | validated |
| `ab-esophagus-pcr-geh2006` | `esophagus-pathologic-complete-response` | 4.9 Gy [1.5; 17] | `geh-2006-esophagus` (systematic-review) | preoperative chemoradiotherapy; prior RT: none | EXPLICIT | limited | 4 | validated |
| `ab-spinal-cord-myelopathy-jin2015` | `spinal-cord-radiation-myelopathy` | 3.7 Gy [2.2; 8.2] | `jin-2015-spinal-cord` (meta-analysis) | prior RT: mixed | EXPLICIT | limited | 4 | validated |
| `ab-spinal-cord-myelopathy-schultheiss2008` | `spinal-cord-radiation-myelopathy` | 0.87 Gy [0.54; 1.19] | `schultheiss-2008-spinal-cord` (modeling-study) | once-daily fractionation; prior RT: none | EXPLICIT | limited | 4 | validated |
| `t12-laryngeal-edema-chart1999` | `larynx-edema` | 4.9 h [3.2; 6.4] | `bentzen-saunders-dische-1999-repair` (modeling-study) | head-and-neck EBRT, multiple fractions per day; prior RT: none | AUTO | supported | 2 | validated-primary |
| `t12-skin-telangiectasia-chart1999` | `skin-telangiectasia` | 3.8 h [2.5; 4.6] | `bentzen-saunders-dische-1999-repair` (modeling-study) | head-and-neck EBRT, multiple fractions per day; prior RT: none | AUTO | supported | 2 | validated-primary |
| `t12-subcutis-fibrosis-chart1999` | `subcutis-fibrosis` | 4.4 h [3.8; 4.9] | `bentzen-saunders-dische-1999-repair` (modeling-study) | head-and-neck EBRT, multiple fractions per day; prior RT: none | AUTO | supported | 2 | validated-primary |
| `t12-oral-mucositis-bcr2025` | `oral-mucosa-mucositis` | 2–4 h | `bentzen-ruifrok-thames-1996-repair` (modeling-study) | head-and-neck EBRT, multiple fractions per day; prior RT: not-reported | EXPLICIT | limited | 2/6 | validated-primary |
| `t12-spinal-cord-myelopathy-bcr2025` | `spinal-cord-radiation-myelopathy` | >5 h | `bcr-2025-ch10-tables` (textbook) | prior RT: not-reported | EXPLICIT | limited | 2 | secondary-confirmed-primary-signoff-pending |
| `t12-temporal-lobe-necrosis-bcr2025` | `temporal-lobe-necrosis` | >4 h | `bcr-2025-ch10-tables` (textbook) | prior RT: not-reported | EXPLICIT | limited | 2 | secondary-confirmed-primary-signoff-pending |
| `dprolif-mucosa-chart2001` | `oral-mucosa-mucositis` | 0.8 Gy EQD2/day [0.7; 1.1]; Tk not fixed | `bentzen-saunders-dische-bond-2001-early` (randomized-trial) | head-and-neck EBRT; prior RT: none | EXPLICIT | supported | 2 | validated-primary |
| `dprolif-skin-erythema-chart2001` | `skin-erythema` | 0.12 Gy EQD2/day [-0.12; 0.22]; Tk not fixed | `bentzen-saunders-dische-bond-2001-early` (randomized-trial) | head-and-neck EBRT; prior RT: none | EXPLICIT | limited | 2 | validated-primary |
| `dprolif-hn-various-bcr2025` | `head-neck-tumour-control` | 0.8 Gy EQD2/day [0.5; 1.1]; Tk 21 d | `bcr-2025-ch10-tables` (textbook) | radical head-and-neck EBRT; prior RT: none | EXPLICIT | supported | 2 | bcr-model-checked-primary-signoff-pending |
| `dprolif-hn-various-alternative-bcr2025` | `head-neck-tumour-control` | 0.64 Gy EQD2/day [0.42; 0.86]; Tk not fixed | `bcr-2025-ch10-tables` (textbook) | radical head-and-neck EBRT; prior RT: not-reported | EXPLICIT | supported | — | primary-source-audit-pending |
| `dprolif-hn-larynx-bcr2025` | `head-neck-larynx-tumour-control` | 0.74 Gy EQD2/day [0.3; 1.2]; Tk not fixed | `bcr-2025-ch10-tables` (textbook) | larynx EBRT; prior RT: not-reported | EXPLICIT | limited | — | primary-source-audit-pending |
| `dprolif-hn-tonsil-bcr2025` | `head-neck-tonsil-tumour-control` | 0.73 Gy EQD2/day; Tk 30 d | `withers-1995-tonsil-time` (cohort) | tonsil/oropharynx EBRT; prior RT: not-reported | EXPLICIT | limited | 6 | validated-primary |
| `dprolif-lung-pneumonitis-bentzen2000` | `lung-pneumonitis` | 0.54 Gy EQD2/day [0.13; 0.95]; Tk not fixed | `bentzen-skoczylas-bernier-2000-lung` (other) | thoracic radiotherapy; prior RT: not-reported | EXPLICIT | limited | — | primary-source-audit-pending |
| `dprolif-esophagus-pcr-geh2006` | `esophagus-pathologic-complete-response` | 0.59 Gy EQD2/day [0.18; 0.99]; Tk not fixed | `geh-2006-esophagus` (systematic-review) | preoperative chemoradiotherapy; prior RT: none | EXPLICIT | limited | 6 | validated-primary |
| `dprolif-nsclc-bcr2025` | `nsclc-local-control` | 0.45 Gy EQD2/day; Tk not fixed | `koukourakis-1996-nsclc-time` (cohort) | lung EBRT; prior RT: not-reported | EXPLICIT | limited | 6 | validated-primary |
| `dprolif-medulloblastoma-bcr2025` | `medulloblastoma-tumour-control` | 0.52 Gy EQD2/day [0.29; 0.75]; Tk 0 d | `hinata-2001-medulloblastoma-time` (modeling-study) | craniospinal/local radiotherapy; prior RT: none | EXPLICIT | limited | 6 | validated-primary |
| `dprolif-medulloblastoma-tk21-hinata2001` | `medulloblastoma-tumour-control` | 0.55 Gy EQD2/day [0.3; 0.8]; Tk 21 d | `hinata-2001-medulloblastoma-time` (modeling-study) | craniospinal/local radiotherapy; prior RT: none | EXPLICIT | limited | 6 | validated-primary |
| `dprolif-prostate-bcr2025` | `prostate-biochemical-control` | 0.24 Gy EQD2/day [0.03; 0.44]; Tk not fixed | `thames-2010-prostate-time` (cohort) | prostate EBRT; prior RT: none | EXPLICIT | limited | — | primary-source-audit-pending |
| `dprolif-breast-bcr2025` | `breast-ipsilateral-recurrence` | 0.6 Gy EQD2/day [0.1; 1.18]; Tk not fixed | `haviland-2016-breast-time` (modeling-study) | breast EBRT; prior RT: none | EXPLICIT | limited | 6 | validated-primary |
| `hytec-optic-dmax-1fx-10gy` | `optic-pathway-radiation-neuropathy` | Dmax; <=10 Gy; 1 fx | `milano-2021-hytec-optic` (systematic-review) | SRS; 1 fx; prior RT: none | n/a | planning-limit | 3 | validated |
| `hytec-optic-dmax-3fx-20gy` | `optic-pathway-radiation-neuropathy` | Dmax; <=20 Gy; 3 fx | `milano-2021-hytec-optic` (systematic-review) | fSRS; 3 fx; prior RT: none | n/a | planning-limit | 3 | validated |
| `hytec-optic-dmax-5fx-25gy` | `optic-pathway-radiation-neuropathy` | Dmax; <=25 Gy; 5 fx | `milano-2021-hytec-optic` (systematic-review) | fSRS; 5 fx; prior RT: none | n/a | planning-limit | 3 | validated |
| `hytec-brain-v12-5cc-symptomatic-rn` | `brain-symptomatic-radionecrosis` | Vx(12 Gy); ≈5 cc; 1 fx | `milano-2021-hytec-brain` (systematic-review) | SRS; 1 fx; prior RT: not-reported | n/a | risk-point | 3 | validated |
| `hytec-brain-v12-10cc-symptomatic-rn` | `brain-symptomatic-radionecrosis` | Vx(12 Gy); ≈10 cc; 1 fx | `milano-2021-hytec-brain` (systematic-review) | SRS; 1 fx; prior RT: not-reported | n/a | risk-point | 3 | validated |
| `hytec-brain-v12-over15cc-symptomatic-rn` | `brain-symptomatic-radionecrosis` | Vx(12 Gy); >15 cc; 1 fx | `milano-2021-hytec-brain` (systematic-review) | SRS; 1 fx; prior RT: not-reported | n/a | risk-point | 3 | validated |
| `hytec-brain-v20-3fx-any-necrosis-edema` | `brain-necrosis-edema-any` | Vx(20 Gy); <20 cc; 3 fx | `milano-2021-hytec-brain` (systematic-review) | fSRS; 3 fx | n/a | risk-point | 3 | validated |
| `hytec-brain-v20-3fx-resection` | `brain-radionecrosis-resection` | Vx(20 Gy); <20 cc; 3 fx | `milano-2021-hytec-brain` (systematic-review) | fSRS; 3 fx | n/a | risk-point | 3 | validated |
| `hytec-brain-v24-5fx-any-necrosis-edema` | `brain-necrosis-edema-any` | Vx(24 Gy); <20 cc; 5 fx | `milano-2021-hytec-brain` (systematic-review) | fSRS; 5 fx | n/a | risk-point | 3 | validated |
| `hytec-brain-v24-5fx-resection` | `brain-radionecrosis-resection` | Vx(24 Gy); <20 cc; 5 fx | `milano-2021-hytec-brain` (systematic-review) | fSRS; 5 fx | n/a | risk-point | 3 | validated |
| `hytec-cord-dmax-1fx-risk-range` | `spinal-cord-radiation-myelopathy` | Dmax; 12.4–14 Gy; 1 fx | `sahgal-2021-hytec-spinal-cord` (systematic-review) | spine SBRT; 1 fx; prior RT: none | n/a | risk-point | 3 | validated |
| `hytec-cord-dmax-2fx-17gy` | `spinal-cord-radiation-myelopathy` | Dmax; 17–19.3 Gy; 2 fx | `sahgal-2021-hytec-spinal-cord` (systematic-review) | spine SBRT; 2 fx; prior RT: none | n/a | risk-point | 3 | validated |
| `hytec-cord-dmax-3fx-20p3gy` | `spinal-cord-radiation-myelopathy` | Dmax; 20.3–23.1 Gy; 3 fx | `sahgal-2021-hytec-spinal-cord` (systematic-review) | spine SBRT; 3 fx; prior RT: none | n/a | risk-point | 3 | validated |
| `hytec-cord-dmax-4fx-23gy` | `spinal-cord-radiation-myelopathy` | Dmax; 23–26.2 Gy; 4 fx | `sahgal-2021-hytec-spinal-cord` (systematic-review) | spine SBRT; 4 fx; prior RT: none | n/a | risk-point | 3 | validated |
| `hytec-cord-dmax-5fx-25p3gy` | `spinal-cord-radiation-myelopathy` | Dmax; 25.3–28.8 Gy; 5 fx | `sahgal-2021-hytec-spinal-cord` (systematic-review) | spine SBRT; 5 fx; prior RT: none | n/a | risk-point | 3 | validated |
| `hytec-spinal-cord-reirradiation-lower-risk-factors` | `spinal-cord-radiation-myelopathy` | α/β 2 Gy; Dmax; thecal-sac | `sahgal-2021-hytec-spinal-cord` (systematic-review) | spine SBRT; structure: thecal-sac | n/a | lower-risk-associated-factors | 3/5 | validated |

## Незакрытая очередь

| Record ID | Что ещё требуется |
|---|---|
| `t12-spinal-cord-myelopathy-bcr2025` | BCR 2025 and ICRU 89 independently report T½ >5 h from Dische & Saunders 1989, but the accessible primary abstract does not contain the numerical lower bound; retain pending until primary full-text verification. |
| `t12-temporal-lobe-necrosis-bcr2025` | BCR 2025 and ICRU 89 independently report T½ >4 h from Lee et al. 1999; the accessible primary abstract supports clinically important incomplete repair but not the exact >4 h bound. |
| `dprolif-hn-various-bcr2025` | Roberts et al. 1994 directly supports 0.8 Gy/day [0.5–1.1] and best Tk 21 d [0–27] in node-negative laryngeal cancer; broad H&N applicability remains pending. |
| `dprolif-hn-various-alternative-bcr2025` | Hendry et al. 1996 is the cited pooled/modelled source for 0.64 Gy/day [0.42–0.86]; exact numerical primary/full-text verification remains pending. |
| `dprolif-hn-larynx-bcr2025` | BCR attributes 0.74 [0.30–1.2] to Robertson et al. 1998, but accessible Robertson 1998 larynx analyses report different time-factor formulations; exact originating analysis must be resolved before sign-off. |
| `dprolif-lung-pneumonitis-bentzen2000` | Primary review confirms a pneumonitis time effect around 0.5 Gy/day, but exact 0.54 [0.13–0.95] was not visible in the accessible primary abstract/full text; keep pending. |
| `dprolif-prostate-bcr2025` | Primary Thames 2010 confirms 0.24 Gy/day and that 52 d was an OTT analysis cut point, not a biological Tk. The code now removes Tk=52; exact CI/full-text sign-off remains pending. |

## Изменения пакета v0.9

- T½ орального мукозита 2–4 ч переведён с BCR secondary provenance на Bentzen/Ruifrok/Thames 1996.
- Tonsil Dprolif 0.73 Gy/day, Tk 30 d переведён на Withers et al. 1995.
- Esophageal pCR Dprolif 0.59 [0.18–0.99] Gy/day закрыт по Geh et al. 2006.
- NSCLC 0.45 Gy/day переведён на Koukourakis et al. 1996 и отвязан от неверно узкого endpoint stage-I.
- Medulloblastoma больше не хранит «0.52 при Tk 0 или 21»: первичные модели разделены на 0.52 [0.29–0.75] при Tk=0 и 0.55 [0.30–0.80] при Tk=21.
- Breast Dprolif 0.60 [0.10–1.18] Gy/day переведён на Haviland/START 2016; explicit-only сохранён.
- Для prostate 0.24 Gy/day число 52 d больше не используется как Tk: это аналитический cut point overall treatment time в Thames 2010.
- `releaseStatus` остаётся `draft`.
