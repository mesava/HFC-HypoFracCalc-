# Evidence inventory — HFC 2026.10-v0.2

Дата актуализации: **2026-10-07**  
Post-RC snapshot: `hytec-outcomes-v0.2`  
Статус dataset: **draft**.

## Результат инвентарного аудита

Проверка существующей evidence-базы завершена по принципу: первичный/официальный источник → endpoint → число → неопределённость → применимость → право автоматического выбора. Непроверяемые исторические записи не удаляются физически, чтобы не ломать старые JSON-аудиты, но получают `status: deprecated` и скрываются из новых пользовательских выборов.

| Раздел | Записей |
|---|---:|
| alphaBeta.ts | 30 |
| alphaBetaAdditional.ts | 14 |
| repairHalfTime.ts | 6 |
| repopulation.ts | 14 |
| constraintsHytec.ts | 29 |
| outcomeModelsHytec.ts | 9 |
| reirradiationGuidance.ts | 1 |
| **Всего** | **103** |
| Активных | 99 |
| Deprecated для audit replay | 4 |
| Pending primary sign-off | **0** |

Важно: **pending = 0 не означает clinical release**. Технические CI/browser/audit/release-review gates уже пройдены; `releaseStatus` остаётся `draft` до независимой клинической валидации, локального комиссионирования и governance-решения.

## Матрица

| Record ID | Endpoint | Число / диапазон | Source | Applicability | Dataset status | Выбор | Support | Пакет | Validation state |
|---|---|---|---|---|---|---|---|---:|---|
| `ab-prostate-biochemical-control-vb2020` | `prostate-biochemical-control` | 1.6 Gy [1.3; 2] | `vogelius-bentzen-2020-prostate` (meta-analysis) | definitive prostate EBRT; prior RT: none | preferred | AUTO | supported | 1 | validated |
| `ab-rectum-bleeding-g1-brand2021` | `rectum-bleeding-g1plus` | 1.6 Gy [0.9; 2.5] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT | preferred | AUTO | supported | 1 | validated |
| `ab-rectum-bleeding-g2-brand2021` | `rectum-bleeding-g2plus` | 1.7 Gy [0.7; 3] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT | preferred | EXPLICIT | limited | 1 | validated |
| `ab-rectum-frequency-g1-brand2021` | `rectum-stool-frequency-g1plus` | 2.3 Gy [0.9; 5.3] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT | preferred | EXPLICIT | limited | 1 | validated |
| `ab-rectum-frequency-g2-brand2021` | `rectum-stool-frequency-g2plus` | 2.7 Gy [0.9; 8.5] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT | preferred | EXPLICIT | limited | 1 | validated |
| `ab-rectum-pain-g1-brand2021` | `rectum-pain-g1plus` | 3.6 Gy [0; 839.6] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT | reviewed | EXPLICIT | poor-fit | 1 | validated |
| `ab-rectum-proctitis-g1-brand2021` | `rectum-proctitis-g1plus` | 2.7 Gy [1.5; 5.4] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT | preferred | EXPLICIT | limited | 1 | validated |
| `ab-rectum-proctitis-g2-brand2021` | `rectum-proctitis-g2plus` | 2.7 Gy [1.3; 15.1] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT | preferred | EXPLICIT | limited | 1 | validated |
| `ab-rectum-sphincter-g1-brand2021` | `rectum-sphincter-control-g1plus` | 3.1 Gy [1.4; 9.1] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT | preferred | EXPLICIT | limited | 1 | validated |
| `ab-rectum-stricture-ulcer-g1-brand2021` | `rectum-stricture-ulcer-g1plus` | 2.5 Gy [0.9; 8.2] | `brand-2021-chhip-rectal` (modeling-study) | CHHiP prostate EBRT/IMRT | preferred | EXPLICIT | limited | 1 | validated |
| `ab-gu-dysuria-g1-brand2023` | `gu-dysuria-g1plus` | 2 Gy [1.2; 3.2] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT | preferred | AUTO | supported | 1 | validated |
| `ab-gu-dysuria-g2-brand2023` | `gu-dysuria-g2plus` | 1.6 Gy [0.1; 36] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT | reviewed | EXPLICIT | poor-fit | 1 | validated |
| `ab-gu-hematuria-g1-brand2023` | `gu-hematuria-g1plus` | 0.9 Gy [0.1; 2.2] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT | preferred | AUTO | supported | 1 | validated |
| `ab-gu-hematuria-g2-brand2023` | `gu-hematuria-g2plus` | 0.6 Gy [0.1; 1.7] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT | preferred | AUTO | supported | 1 | validated |
| `ab-gu-incontinence-g1-brand2023` | `gu-incontinence-g1plus` | 1 Gy [0.1; 17.6] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT | reviewed | EXPLICIT | poor-fit | 1 | validated |
| `ab-gu-incontinence-g2-brand2023` | `gu-incontinence-g2plus` | 1.5 Gy [0.1; 6.2] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT | reviewed | EXPLICIT | limited | 1 | validated |
| `ab-gu-reduced-flow-g1-brand2023` | `gu-reduced-flow-stricture-g1plus` | 1.9 Gy [0.1; 424.6] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT | reviewed | EXPLICIT | limited | 1 | validated |
| `ab-gu-reduced-flow-g2-brand2023` | `gu-reduced-flow-stricture-g2plus` | 0.7 Gy [0.1; 991.9] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT | reviewed | EXPLICIT | poor-fit | 1 | validated |
| `ab-gu-frequency-g1-brand2023` | `gu-urine-frequency-g1plus` | 1.9 Gy [0.1; 997.8] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT | reviewed | EXPLICIT | poor-fit | 1 | validated |
| `ab-gu-frequency-g2-brand2023` | `gu-urine-frequency-g2plus` | 3.3 Gy [0.1; 996] | `brand-2023-chhip-gu` (modeling-study) | CHHiP prostate EBRT/IMRT | reviewed | EXPLICIT | poor-fit | 1 | validated |
| `ab-breast-photo-fast2020` | `breast-photographic-appearance` | 2.7 Gy [1.5; 3.9] | `brunt-2020-fast-10y` (randomized-trial) | FAST whole-breast | preferred | AUTO | supported | 1 | validated |
| `ab-breast-photo-fast2020-adjusted` | `breast-photographic-appearance` | 2.5 Gy [1.1; 3.9] | `brunt-2020-fast-10y` (randomized-trial) | FAST whole-breast | reviewed | EXPLICIT | supported | 1 | validated |
| `ab-breast-any-nte-fast2020` | `breast-physician-any-nte-fast` | 2.5 Gy [1.8; 3.3] | `brunt-2020-fast-10y` (randomized-trial) | FAST whole-breast | preferred | AUTO | supported | 1 | validated |
| `ab-breast-shrinkage-fast2020` | `breast-shrinkage` | 2.7 Gy [1.9; 3.5] | `brunt-2020-fast-10y` (randomized-trial) | FAST whole-breast | preferred | AUTO | supported | 1 | validated |
| `ab-breast-induration-fast2020` | `breast-induration` | 1.6 Gy [0; 4.4] | `brunt-2020-fast-10y` (randomized-trial) | FAST whole-breast | preferred | EXPLICIT | limited | 1 | validated |
| `ab-breast-telangiectasia-fast2020` | `breast-telangiectasia` | 3.1 Gy [2.3; 3.9] | `brunt-2020-fast-10y` (randomized-trial) | FAST whole-breast | preferred | AUTO | supported | 1 | validated |
| `ab-breast-edema-fast2020` | `breast-edema` | 1.9 Gy | `brunt-2020-fast-10y` (randomized-trial) | FAST whole-breast | preferred | EXPLICIT | limited | 1 | validated |
| `ab-breast-ibr-fastforward2026-adjusted` | `breast-ipsilateral-recurrence` | 3.3 Gy [1.9; 4.9] | `brunt-2026-fast-forward-10y` (randomized-trial) | FAST-Forward breast/chest-wall | preferred | AUTO | supported | 1 | validated |
| `ab-breast-ibr-fastforward2026-unadjusted` | `breast-ipsilateral-recurrence` | 3.4 Gy [1.6; 5.2] | `brunt-2026-fast-forward-10y` (randomized-trial) | FAST-Forward breast/chest-wall | reviewed | EXPLICIT | supported | 1 | validated |
| `ab-breast-chestwall-any-ae-fastforward2026` | `breast-chestwall-any-ae-fastforward` | 2.1 Gy [1.6; 2.6] | `brunt-2026-fast-forward-10y` (randomized-trial) | FAST-Forward breast/chest-wall | preferred | AUTO | supported | 1 | validated |
| `ab-oral-mucosa-mucositis-denham1995` | `oral-mucosa-mucositis` | 9.3 Gy [5.8; 17.9] | `denham-1995-oropharyngeal-mucosa` (modeling-study) | head-and-neck radiotherapy; prior RT: not-reported | preferred | AUTO | supported | 4 | validated |
| `ab-skin-erythema-bcr2025` | `skin-erythema` | 8.8 Gy [6.9; 11.6] | `turesson-thames-1989-skin` (modeling-study) | postmastectomy skin irradiation; prior RT: none | preferred | AUTO | supported | 4 | validated |
| `ab-skin-telangiectasia-bcr2025` | `skin-telangiectasia` | 2.6 Gy [2.2; 3.3] | `bentzen-turesson-thames-1990-telangiectasia` (modeling-study) | postmastectomy radiotherapy; prior RT: none | preferred | AUTO | supported | 4 | validated |
| `ab-subcutis-fibrosis-bcr2025` | `subcutis-fibrosis` | 1.7 Gy [0.6; 2.6] | `bentzen-overgaard-1991-postmastectomy` (modeling-study) | postmastectomy radiotherapy; prior RT: none | preferred | AUTO | supported | 4 | validated |
| `ab-bowel-stricture-perforation-bcr2025` | `bowel-stricture-perforation` | 3.9 Gy [2.5; 5.3] | `bcr-2025-ch10-tables` (textbook) | photon clinical data | preferred | EXPLICIT | limited | 4 | validated |
| `ab-bowel-various-late-dische1999` | `bowel-various-late-effects` | 4.3 Gy [2.2; 9.6] | `dische-1999-cervix-late-bowel` (randomized-trial) | pelvic radiotherapy; prior RT: none | preferred | EXPLICIT | limited | 4 | validated |
| `ab-lung-pneumonitis-bentzen2000` | `lung-pneumonitis` | 4 Gy [2.2; 5.8] | `bentzen-skoczylas-bernier-2000-lung` (systematic-review) | thoracic radiotherapy; prior RT: not-reported | preferred | EXPLICIT | limited | 4 | validated |
| `ab-lung-fibrosis-dubray1995` | `lung-radiological-fibrosis` | 3.1 Gy [-0.2; 8.5] | `dubray-1995-lung-fibrosis` (cohort) | mantle-field thoracic radiotherapy; prior RT: none | preferred | EXPLICIT | limited | 4 | validated |
| `ab-hn-late-effects-stuschke1999` | `head-neck-various-late-effects` | 4 Gy [3.3; 5] | `stuschke-thames-1999-head-neck` (meta-analysis) | head-and-neck EBRT, hyperfractionation; prior RT: none | preferred | AUTO | supported | 4 | validated |
| `ab-hn-tumour-control-stuschke1999` | `head-neck-tumour-control` | 10.5 Gy [6.5; 29] | `stuschke-thames-1999-head-neck` (meta-analysis) | head-and-neck EBRT, hyperfractionation; prior RT: none | preferred | AUTO | supported | 4 | validated |
| `ab-nsclc-stage-i-stuschke2010` | `nsclc-stage-i-local-control` | 8.2 Gy [7; 9.4] | `stuschke-pottgen-2010-nsclc` (other) | conventional EBRT, SBRT; prior RT: none | preferred | EXPLICIT | limited | 4 | validated |
| `ab-esophagus-pcr-geh2006` | `esophagus-pathologic-complete-response` | 4.9 Gy [1.5; 17] | `geh-2006-esophagus` (systematic-review) | preoperative chemoradiotherapy; prior RT: none | preferred | EXPLICIT | limited | 4 | validated |
| `ab-spinal-cord-myelopathy-jin2015` | `spinal-cord-radiation-myelopathy` | 3.7 Gy [2.2; 8.2] | `jin-2015-spinal-cord` (meta-analysis) | prior RT: mixed | reviewed | EXPLICIT | limited | 4 | validated |
| `ab-spinal-cord-myelopathy-schultheiss2008` | `spinal-cord-radiation-myelopathy` | 0.87 Gy [0.54; 1.19] | `schultheiss-2008-spinal-cord` (modeling-study) | once-daily fractionation; prior RT: none | reviewed | EXPLICIT | limited | 4 | validated |
| `t12-laryngeal-edema-chart1999` | `larynx-edema` | 4.9 h [3.2; 6.4] | `bentzen-saunders-dische-1999-repair` (modeling-study) | head-and-neck EBRT, multiple fractions per day; prior RT: none | preferred | AUTO | supported | 2 | validated-primary |
| `t12-skin-telangiectasia-chart1999` | `skin-telangiectasia` | 3.8 h [2.5; 4.6] | `bentzen-saunders-dische-1999-repair` (modeling-study) | head-and-neck EBRT, multiple fractions per day; prior RT: none | preferred | AUTO | supported | 2 | validated-primary |
| `t12-subcutis-fibrosis-chart1999` | `subcutis-fibrosis` | 4.4 h [3.8; 4.9] | `bentzen-saunders-dische-1999-repair` (modeling-study) | head-and-neck EBRT, multiple fractions per day; prior RT: none | preferred | AUTO | supported | 2 | validated-primary |
| `t12-oral-mucositis-bcr2025` | `oral-mucosa-mucositis` | 2–4 h | `bentzen-ruifrok-thames-1996-repair` (modeling-study) | head-and-neck EBRT, multiple fractions per day; prior RT: not-reported | reviewed | EXPLICIT | limited | 2/6 | validated-primary |
| `t12-spinal-cord-myelopathy-bcr2025` | `spinal-cord-radiation-myelopathy` | >5 h | `bcr-2025-ch10-tables` (textbook) | prior RT: not-reported | deprecated | EXPLICIT | poor-fit | 7 | deprecated-secondary-unverified |
| `t12-temporal-lobe-necrosis-bcr2025` | `temporal-lobe-necrosis` | >4 h | `bcr-2025-ch10-tables` (textbook) | prior RT: not-reported | deprecated | EXPLICIT | poor-fit | 7 | deprecated-secondary-unverified |
| `dprolif-mucosa-chart2001` | `oral-mucosa-mucositis` | 0.8 Gy EQD2/day [0.7; 1.1]; Tk not fixed | `bentzen-saunders-dische-bond-2001-early` (randomized-trial) | head-and-neck EBRT; prior RT: none | reviewed | EXPLICIT | supported | 2 | validated-primary |
| `dprolif-skin-erythema-chart2001` | `skin-erythema` | 0.12 Gy EQD2/day [-0.12; 0.22]; Tk not fixed | `bentzen-saunders-dische-bond-2001-early` (randomized-trial) | head-and-neck EBRT; prior RT: none | reviewed | EXPLICIT | limited | 2 | validated-primary |
| `dprolif-hn-various-bcr2025` | `head-neck-tumour-control` | 0.8 Gy EQD2/day [0.5; 1.1]; Tk 21 d | `bcr-2025-ch10-tables` (textbook) | radical head-and-neck EBRT; prior RT: none | deprecated | EXPLICIT | limited | 7 | deprecated-context-mismatch |
| `dprolif-hn-various-alternative-bcr2025` | `head-neck-tumour-control` | 0.64 Gy EQD2/day [0.42; 0.86]; Tk not fixed | `hendry-1996-missed-days` (modeling-study) | radical head-and-neck EBRT; prior RT: not-reported | reviewed | EXPLICIT | limited | 7 | validated-modelled-synthesis |
| `dprolif-hn-larynx-bcr2025` | `head-neck-larynx-tumour-control` | 0.74 Gy EQD2/day [0.3; 1.2]; Tk not fixed | `bcr-2025-ch10-tables` (textbook) | larynx EBRT; prior RT: not-reported | deprecated | EXPLICIT | poor-fit | 7 | deprecated-untraceable-summary |
| `dprolif-larynx-roberts1994` | `head-neck-larynx-tumour-control` | 0.8 Gy EQD2/day [0.5; 1.1]; Tk 21 d | `roberts-1994-larynx-time` (modeling-study) | larynx EBRT; prior RT: none | reviewed | EXPLICIT | supported | 7 | validated-primary |
| `dprolif-hn-tonsil-bcr2025` | `head-neck-tonsil-tumour-control` | 0.73 Gy EQD2/day; Tk 30 d | `withers-1995-tonsil-time` (cohort) | tonsil/oropharynx EBRT; prior RT: not-reported | reviewed | EXPLICIT | limited | 6 | validated-primary |
| `dprolif-lung-pneumonitis-bentzen2000` | `lung-pneumonitis` | 0.54 Gy EQD2/day; Tk not fixed | `bentzen-skoczylas-bernier-2000-lung` (systematic-review) | thoracic radiotherapy; prior RT: not-reported | reviewed | EXPLICIT | limited | 7 | validated-review |
| `dprolif-esophagus-pcr-geh2006` | `esophagus-pathologic-complete-response` | 0.59 Gy EQD2/day [0.18; 0.99]; Tk not fixed | `geh-2006-esophagus` (systematic-review) | preoperative chemoradiotherapy; prior RT: none | reviewed | EXPLICIT | limited | 6 | validated-primary |
| `dprolif-nsclc-bcr2025` | `nsclc-local-control` | 0.45 Gy EQD2/day; Tk not fixed | `koukourakis-1996-nsclc-time` (cohort) | lung EBRT; prior RT: not-reported | reviewed | EXPLICIT | limited | 6 | validated-primary |
| `dprolif-medulloblastoma-bcr2025` | `medulloblastoma-tumour-control` | 0.52 Gy EQD2/day [0.29; 0.75]; Tk 0 d | `hinata-2001-medulloblastoma-time` (modeling-study) | craniospinal/local radiotherapy; prior RT: none | reviewed | EXPLICIT | limited | 6 | validated-primary |
| `dprolif-medulloblastoma-tk21-hinata2001` | `medulloblastoma-tumour-control` | 0.55 Gy EQD2/day [0.3; 0.8]; Tk 21 d | `hinata-2001-medulloblastoma-time` (modeling-study) | craniospinal/local radiotherapy; prior RT: none | reviewed | EXPLICIT | limited | 6 | validated-primary |
| `dprolif-prostate-bcr2025` | `prostate-biochemical-control` | 0.24 Gy EQD2/day; Tk not fixed | `thames-2010-prostate-time` (cohort) | prostate EBRT; prior RT: none | reviewed | EXPLICIT | limited | 7 | validated-primary-point-only |
| `dprolif-breast-bcr2025` | `breast-ipsilateral-recurrence` | 0.6 Gy EQD2/day [0.1; 1.18]; Tk not fixed | `haviland-2016-breast-time` (modeling-study) | breast EBRT; prior RT: none | reviewed | EXPLICIT | limited | 6 | validated-primary |
| `hytec-optic-dmax-1fx-10gy` | `optic-pathway-radiation-neuropathy` | <=10 Gy; 1 fx | `milano-2021-hytec-optic` (systematic-review) | SRS; prior RT: none | reviewed | n/a | planning-limit | 3 | validated |
| `hytec-optic-dmax-3fx-20gy` | `optic-pathway-radiation-neuropathy` | <=20 Gy; 3 fx | `milano-2021-hytec-optic` (systematic-review) | fSRS; prior RT: none | reviewed | n/a | planning-limit | 3 | validated |
| `hytec-optic-dmax-5fx-25gy` | `optic-pathway-radiation-neuropathy` | <=25 Gy; 5 fx | `milano-2021-hytec-optic` (systematic-review) | fSRS; prior RT: none | reviewed | n/a | planning-limit | 3 | validated |
| `hytec-brain-v12-5cc-symptomatic-rn` | `brain-symptomatic-radionecrosis` | ≈5 cc; 1 fx | `milano-2021-hytec-brain` (systematic-review) | SRS; prior RT: not-reported | reviewed | n/a | risk-point | 3 | validated |
| `hytec-brain-v12-10cc-symptomatic-rn` | `brain-symptomatic-radionecrosis` | ≈10 cc; 1 fx | `milano-2021-hytec-brain` (systematic-review) | SRS; prior RT: not-reported | reviewed | n/a | risk-point | 3 | validated |
| `hytec-brain-v12-over15cc-symptomatic-rn` | `brain-symptomatic-radionecrosis` | >15 cc; 1 fx | `milano-2021-hytec-brain` (systematic-review) | SRS; prior RT: not-reported | reviewed | n/a | risk-point | 3 | validated |
| `hytec-brain-v20-3fx-any-necrosis-edema` | `brain-necrosis-edema-any` | <20 cc; 3 fx | `milano-2021-hytec-brain` (systematic-review) | fSRS | reviewed | n/a | risk-point | 3 | validated |
| `hytec-brain-v20-3fx-resection` | `brain-radionecrosis-resection` | <20 cc; 3 fx | `milano-2021-hytec-brain` (systematic-review) | fSRS | reviewed | n/a | risk-point | 3 | validated |
| `hytec-brain-v24-5fx-any-necrosis-edema` | `brain-necrosis-edema-any` | <20 cc; 5 fx | `milano-2021-hytec-brain` (systematic-review) | fSRS | reviewed | n/a | risk-point | 3 | validated |
| `hytec-brain-v24-5fx-resection` | `brain-radionecrosis-resection` | <20 cc; 5 fx | `milano-2021-hytec-brain` (systematic-review) | fSRS | reviewed | n/a | risk-point | 3 | validated |
| `hytec-cord-dmax-1fx-risk-range` | `spinal-cord-radiation-myelopathy` | 12.4–14 Gy; 1 fx | `sahgal-2021-hytec-spinal-cord` (systematic-review) | spine SBRT; prior RT: none | reviewed | n/a | risk-point | 3 | validated |
| `hytec-cord-dmax-2fx-17gy` | `spinal-cord-radiation-myelopathy` | 17–19.3 Gy; 2 fx | `sahgal-2021-hytec-spinal-cord` (systematic-review) | spine SBRT; prior RT: none | reviewed | n/a | risk-point | 3 | validated |
| `hytec-cord-dmax-3fx-20p3gy` | `spinal-cord-radiation-myelopathy` | 20.3–23.1 Gy; 3 fx | `sahgal-2021-hytec-spinal-cord` (systematic-review) | spine SBRT; prior RT: none | reviewed | n/a | risk-point | 3 | validated |
| `hytec-cord-dmax-4fx-23gy` | `spinal-cord-radiation-myelopathy` | 23–26.2 Gy; 4 fx | `sahgal-2021-hytec-spinal-cord` (systematic-review) | spine SBRT; prior RT: none | reviewed | n/a | risk-point | 3 | validated |
| `hytec-cord-dmax-5fx-25p3gy` | `spinal-cord-radiation-myelopathy` | 25.3–28.8 Gy; 5 fx | `sahgal-2021-hytec-spinal-cord` (systematic-review) | spine SBRT; prior RT: none | reviewed | n/a | risk-point | 3 | validated |
| `hytec-spinal-cord-reirradiation-lower-risk-factors` | `spinal-cord-radiation-myelopathy` | α/β 2 Gy; Dmax | `sahgal-2021-hytec-spinal-cord` (systematic-review) | spine SBRT | reviewed | n/a | lower-risk-associated-factors | 3/5 | validated |

| `hytec-brain-mets-1y-local-control` | `brain-metastases-local-control` | 4 source-model points by lesion size | `redmond-2021-hytec-brain-mets-tcp` | SRS/fSRS | reviewed | n/a | outcome-model | 8 | validated |
| `hytec-vestibular-schwannoma-3to5y-tcp` | `vestibular-schwannoma-tumour-control` | 6 TCP points | `soltys-2021-hytec-vestibular-tcp` | SRS/fSRS | reviewed | n/a | outcome-model | 8 | validated |
| `hytec-spinal-mets-2y-tcp` | `spinal-metastases-local-control` | 8 TCP points | `soltys-2021-hytec-spinal-mets-tcp` | spine SBRT | reviewed | n/a | outcome-model | 8 | validated |
| `hytec-liver-metastases-bed10-local-control` | `liver-metastases-local-control` | BED10 >100 vs <=100 Gy | `ohri-2021-hytec-liver-local-control` | liver SBRT | reviewed | n/a | stratified outcome | 8 | validated |
| `hytec-adrenal-metastases-1y-tcp` | `adrenal-metastases-local-control` | >95% at BED10 about 116.4 Gy | `stumpf-2021-hytec-adrenal-tcp` | adrenal SBRT | reviewed | n/a | outcome-model | 8 | validated |
| `hytec-prostate-sbrt-5y-tcp` | `prostate-biochemical-control` | 4 risk-group TCP points | `royce-2021-hytec-prostate-tcp` | prostate SBRT | reviewed | n/a | outcome-model | 8 | validated |
| `nsclc-stage-i-size-adjusted-2y-tcp` | `nsclc-stage-i-local-control` | 6 explicit 2-y TCP examples by 1/3/5 cm tumour diameter at 50 Gy/5 and 54 Gy/3 | `ohri-2012-nsclc-size-tcp` | stage I NSCLC SBRT | reviewed | n/a | outcome-model | 11 | validated-primary |
| `hytec-hn-reirradiation-local-control` | `head-neck-recurrent-reirradiation-local-control` | 6 model points on a 5-fraction-equivalent dose scale | `vargo-2021-hytec-hn-reirradiation-tcp` | recurrent previously irradiated H&N SBRT | reviewed | n/a | outcome-model | 11 | validated |
| `hytec-pancreas-1y-local-control` | `pancreas-local-control` | 33 Gy/5 → 77%; 36 Gy/3 → 86% unresected; >90% with R0 context at ~28.2 Gy/3fx-equivalent | `mahadevan-2021-hytec-pancreas-tcp` | pancreas SBRT | reviewed | n/a | outcome-model | 11 | validated |
| `hytec-major-vessel-d0p5cc-5fx-20gy` | `major-vessel-grade3plus-bleeding` | D0.5cc <20 Gy; 5 fx | `grimm-2021-hytec-major-vessels` | H&N SBRT reirradiation | reviewed | n/a | planning-limit | 9 | validated |
| `hytec-major-vessel-dmax-5fx-20gy-risk` | `major-vessel-grade3plus-bleeding` | Dmax about 20 Gy; about 2% risk | `grimm-2021-hytec-major-vessels` | H&N SBRT reirradiation | reviewed | n/a | risk-point | 9 | validated |
| `hytec-major-vessel-dmax-5fx-30gy-risk` | `major-vessel-grade3plus-bleeding` | Dmax about 30 Gy; about 12% risk | `grimm-2021-hytec-major-vessels` | H&N SBRT reirradiation | reviewed | n/a | risk-point | 9 | validated |
| `hytec-lung-rilt-mean-dose-under8gy` | `lung-symptomatic-rilt` | Dmean <8 Gy | `kong-2021-hytec-lung-parenchyma` | lung SBRT; 3-5 fx | reviewed | n/a | observational-threshold | 9 | validated |
| `hytec-lung-rilt-v20-10to15pct` | `lung-symptomatic-rilt` | V20 <10-15% | `kong-2021-hytec-lung-parenchyma` | lung SBRT; 3-5 fx | reviewed | n/a | observational-threshold | 9 | validated |
| `hytec-liver-primary-mld-3fx-13gy` | `liver-grade3plus-enzyme-toxicity` | Dmean <=13 Gy; 3 fx | `miften-2021-hytec-liver-toxicity` | primary liver disease | reviewed | n/a | planning-limit | 9 | validated |
| `hytec-liver-primary-mld-6fx-18gy` | `liver-grade3plus-enzyme-toxicity` | Dmean <=18 Gy; 6 fx | `miften-2021-hytec-liver-toxicity` | primary liver disease | reviewed | n/a | planning-limit | 9 | validated |
| `hytec-liver-metastases-mld-3fx-15gy` | `liver-grade3plus-enzyme-toxicity` | Dmean <=15 Gy; 3 fx | `miften-2021-hytec-liver-toxicity` | metastatic liver lesions | reviewed | n/a | planning-limit | 9 | validated |
| `hytec-liver-metastases-mld-6fx-20gy` | `liver-grade3plus-enzyme-toxicity` | Dmean <=20 Gy; 6 fx | `miften-2021-hytec-liver-toxicity` | metastatic liver lesions | reviewed | n/a | planning-limit | 9 | validated |
| `hytec-liver-spared-vle15gy-700cc` | `liver-grade3plus-enzyme-toxicity` | V<=15 Gy >=700 cc | `miften-2021-hytec-liver-toxicity` | liver SBRT; 3-6 fx | reviewed | n/a | observational-threshold | 9 | validated |
| `hytec-liver-spared-vle17gy-700cc` | `liver-grade3plus-enzyme-toxicity` | V<=17 Gy >=700 cc | `miften-2021-hytec-liver-toxicity` | liver SBRT; 3-6 fx | reviewed | n/a | observational-threshold | 9 | validated |
| `hytec-prostate-sbrt-bladder-vrx-5to10cc` | `bladder-prostate-sbrt-late-urinary-toxicity` | V(Rx) <5-10 cc | `wang-2021-hytec-prostate-toxicity` | prostate SBRT; 4-5 fx | reviewed | n/a | observational-threshold | 9 | validated |
| `hytec-prostate-sbrt-urethra-dmax-38to42gy` | `urethra-prostate-sbrt-late-urinary-toxicity` | Dmax <38-42 Gy | `wang-2021-hytec-prostate-toxicity` | prostate SBRT; 4-5 fx | reviewed | n/a | observational-threshold | 9 | validated |
| `hytec-prostate-sbrt-rectum-dmax-35to38gy` | `rectum-prostate-sbrt-late-bowel-toxicity` | Dmax <35-38 Gy | `wang-2021-hytec-prostate-toxicity` | prostate SBRT; 4-5 fx | reviewed | n/a | observational-threshold | 9 | validated |

## Итог v0.10

- Вторичные bounds T½ для spinal cord (>5 h) и temporal lobe (>4 h) переведены в `deprecated`: точные bounds не удалось честно восстановить из указанного primary record, а более позднее моделирование показывает широкую неопределённость.
- Broad H&N 0.8 Gy/day, Tk 21 d сохранён только для replay; первичная Roberts 1994 относится к node-negative laryngeal cancer.
- Добавлен активный explicit-only larynx record Roberts 1994: 0.8 Gy/day [0.5–1.1], best Tk 21 d.
- BCR larynx 0.74 [0.30–1.20] deprecated: идентифицированные Robertson 1998 analyses не воспроизводят эту пару; HFC не подменяет её другим числом.
- H&N 0.64 [0.42–0.86] сохранён как modelled pooled synthesis Hendry 1996, explicit-only.
- Pneumonitis 0.54 Gy/day сохранён; машинный 95% CI удалён, поскольку доступные источники сообщают 0.54 ± 0.21 как 1 SE, а старый CI был производным.
- Prostate 0.24 Gy/day сохранён как primary-supported point estimate; 95% CI убран из machine-readable field до курации полного первичного текста.
- Ни одна deprecated или ограниченно подтверждённая запись не является AUTO.
