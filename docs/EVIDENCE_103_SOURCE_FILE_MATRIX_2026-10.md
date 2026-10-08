# HFC — матрица исходных файлов для всех 103 evidence records (2026-10-08)

## Принцип проверки

Это **второй, независимый от `evidenceValidationInventory` признак**: был ли прямой первичный файл передан пользователем в новой поставке из 69 файлов. Обозначение «Получен» означает **наличие конкретного файла**, а не сверку каждой таблицы или клиническую валидность коэффициента. «Не получен» означает отсутствие отдельного первоисточника в этом наборе; ранее выполненная проверка через DOI/другие источники может существовать.

- Поступило: **40 HyTEC + 29 других файлов**, связанные с **34 из 61 source IDs**.
- Среди **103 клинических evidence records**, **73 опираются на source ID с полученным первичным файлом**, **30 — на source ID без отдельного файла в данном наборе**.
- `validation state` ниже — **предшествующий репозиторный статус**, а **не** заключение новой пофайловой проверки.
- В частности, состояние `validated` не гарантирует source-by-source независимое подтверждение в рамках предоставленных PDF.
- Дубликаты PDF/XML, supplements и рисунки сгруппированы под родительской публикацией, но не считаются самостоятельными клиническими коэффициентами.

## Полная матрица

| Record ID | Source ID | Файл в поставке | Первый первичный файл / причина | Прежняя validation state |
|---|---|---|---|---|
| `ab-prostate-biochemical-control-vb2020` | `vogelius-bentzen-2020-prostate` | Получен | `Vogelius_Bentzen_2020_IJROBP_prostate_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-rectum-bleeding-g1-brand2021` | `brand-2021-chhip-rectal` | Получен | `Brand_2021_IJROBP_rectal_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-rectum-bleeding-g2-brand2021` | `brand-2021-chhip-rectal` | Получен | `Brand_2021_IJROBP_rectal_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-rectum-frequency-g1-brand2021` | `brand-2021-chhip-rectal` | Получен | `Brand_2021_IJROBP_rectal_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-rectum-frequency-g2-brand2021` | `brand-2021-chhip-rectal` | Получен | `Brand_2021_IJROBP_rectal_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-rectum-pain-g1-brand2021` | `brand-2021-chhip-rectal` | Получен | `Brand_2021_IJROBP_rectal_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-rectum-proctitis-g1-brand2021` | `brand-2021-chhip-rectal` | Получен | `Brand_2021_IJROBP_rectal_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-rectum-proctitis-g2-brand2021` | `brand-2021-chhip-rectal` | Получен | `Brand_2021_IJROBP_rectal_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-rectum-sphincter-g1-brand2021` | `brand-2021-chhip-rectal` | Получен | `Brand_2021_IJROBP_rectal_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-rectum-stricture-ulcer-g1-brand2021` | `brand-2021-chhip-rectal` | Получен | `Brand_2021_IJROBP_rectal_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-gu-dysuria-g1-brand2023` | `brand-2023-chhip-gu` | Получен | `Brand_2022_IJROBP_GU_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-gu-dysuria-g2-brand2023` | `brand-2023-chhip-gu` | Получен | `Brand_2022_IJROBP_GU_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-gu-hematuria-g1-brand2023` | `brand-2023-chhip-gu` | Получен | `Brand_2022_IJROBP_GU_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-gu-hematuria-g2-brand2023` | `brand-2023-chhip-gu` | Получен | `Brand_2022_IJROBP_GU_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-gu-incontinence-g1-brand2023` | `brand-2023-chhip-gu` | Получен | `Brand_2022_IJROBP_GU_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-gu-incontinence-g2-brand2023` | `brand-2023-chhip-gu` | Получен | `Brand_2022_IJROBP_GU_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-gu-reduced-flow-g1-brand2023` | `brand-2023-chhip-gu` | Получен | `Brand_2022_IJROBP_GU_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-gu-reduced-flow-g2-brand2023` | `brand-2023-chhip-gu` | Получен | `Brand_2022_IJROBP_GU_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-gu-frequency-g1-brand2023` | `brand-2023-chhip-gu` | Получен | `Brand_2022_IJROBP_GU_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-gu-frequency-g2-brand2023` | `brand-2023-chhip-gu` | Получен | `Brand_2022_IJROBP_GU_alpha-beta.pdf` (+1 связанных) | `validated` |
| `ab-breast-photo-fast2020` | `brunt-2020-fast-10y` | Получен | `FAST_10y_JCO2020.pdf` | `validated` |
| `ab-breast-photo-fast2020-adjusted` | `brunt-2020-fast-10y` | Получен | `FAST_10y_JCO2020.pdf` | `validated` |
| `ab-breast-any-nte-fast2020` | `brunt-2020-fast-10y` | Получен | `FAST_10y_JCO2020.pdf` | `validated` |
| `ab-breast-shrinkage-fast2020` | `brunt-2020-fast-10y` | Получен | `FAST_10y_JCO2020.pdf` | `validated` |
| `ab-breast-induration-fast2020` | `brunt-2020-fast-10y` | Получен | `FAST_10y_JCO2020.pdf` | `validated` |
| `ab-breast-telangiectasia-fast2020` | `brunt-2020-fast-10y` | Получен | `FAST_10y_JCO2020.pdf` | `validated` |
| `ab-breast-edema-fast2020` | `brunt-2020-fast-10y` | Получен | `FAST_10y_JCO2020.pdf` | `validated` |
| `ab-breast-ibr-fastforward2026-adjusted` | `brunt-2026-fast-forward-10y` | Получен | `FAST-Forward_10y_LancetOncol2026_appendix.pdf` (+1 связанных) | `validated` |
| `ab-breast-ibr-fastforward2026-unadjusted` | `brunt-2026-fast-forward-10y` | Получен | `FAST-Forward_10y_LancetOncol2026_appendix.pdf` (+1 связанных) | `validated` |
| `ab-breast-chestwall-any-ae-fastforward2026` | `brunt-2026-fast-forward-10y` | Получен | `FAST-Forward_10y_LancetOncol2026_appendix.pdf` (+1 связанных) | `validated` |
| `ab-oral-mucosa-mucositis-denham1995` | `denham-1995-oropharyngeal-mucosa` | **Не получен** | Нет отдельного первичного файла | `validated` |
| `ab-skin-erythema-bcr2025` | `turesson-thames-1989-skin` | **Не получен** | Нет отдельного первичного файла | `validated` |
| `ab-skin-telangiectasia-bcr2025` | `bentzen-turesson-thames-1990-telangiectasia` | **Не получен** | Нет отдельного первичного файла | `validated` |
| `ab-subcutis-fibrosis-bcr2025` | `bentzen-overgaard-1991-postmastectomy` | **Не получен** | Нет отдельного первичного файла | `validated` |
| `ab-bowel-stricture-perforation-bcr2025` | `bcr-2025-ch10-tables` | Получен | `Basic Clinical Radiobiology 2025.pdf` | `validated` |
| `ab-bowel-various-late-dische1999` | `dische-1999-cervix-late-bowel` | **Не получен** | Нет отдельного первичного файла | `validated` |
| `ab-lung-pneumonitis-bentzen2000` | `bentzen-skoczylas-bernier-2000-lung` | **Не получен** | Нет отдельного первичного файла | `validated` |
| `ab-lung-fibrosis-dubray1995` | `dubray-1995-lung-fibrosis` | **Не получен** | Нет отдельного первичного файла | `validated` |
| `ab-hn-late-effects-stuschke1999` | `stuschke-thames-1999-head-neck` | **Не получен** | Нет отдельного первичного файла | `validated` |
| `ab-hn-tumour-control-stuschke1999` | `stuschke-thames-1999-head-neck` | **Не получен** | Нет отдельного первичного файла | `validated` |
| `ab-nsclc-stage-i-stuschke2010` | `stuschke-pottgen-2010-nsclc` | **Не получен** | Нет отдельного первичного файла | `validated` |
| `ab-esophagus-pcr-geh2006` | `geh-2006-esophagus` | **Не получен** | Нет отдельного первичного файла | `validated` |
| `ab-spinal-cord-myelopathy-jin2015` | `jin-2015-spinal-cord` | **Не получен** | Нет отдельного первичного файла | `validated` |
| `ab-spinal-cord-myelopathy-schultheiss2008` | `schultheiss-2008-spinal-cord` | **Не получен** | Нет отдельного первичного файла | `validated` |
| `t12-laryngeal-edema-chart1999` | `bentzen-saunders-dische-1999-repair` | **Не получен** | Нет отдельного первичного файла | `validated-primary` |
| `t12-skin-telangiectasia-chart1999` | `bentzen-saunders-dische-1999-repair` | **Не получен** | Нет отдельного первичного файла | `validated-primary` |
| `t12-subcutis-fibrosis-chart1999` | `bentzen-saunders-dische-1999-repair` | **Не получен** | Нет отдельного первичного файла | `validated-primary` |
| `t12-oral-mucositis-bcr2025` | `bentzen-ruifrok-thames-1996-repair` | **Не получен** | Нет отдельного первичного файла | `validated-primary` |
| `t12-spinal-cord-myelopathy-bcr2025` | `bcr-2025-ch10-tables` | Получен | `Basic Clinical Radiobiology 2025.pdf` | `deprecated-secondary-unverified` |
| `t12-temporal-lobe-necrosis-bcr2025` | `bcr-2025-ch10-tables` | Получен | `Basic Clinical Radiobiology 2025.pdf` | `deprecated-secondary-unverified` |
| `dprolif-mucosa-chart2001` | `bentzen-saunders-dische-bond-2001-early` | **Не получен** | Нет отдельного первичного файла | `validated-primary` |
| `dprolif-skin-erythema-chart2001` | `bentzen-saunders-dische-bond-2001-early` | **Не получен** | Нет отдельного первичного файла | `validated-primary` |
| `dprolif-hn-various-bcr2025` | `bcr-2025-ch10-tables` | Получен | `Basic Clinical Radiobiology 2025.pdf` | `deprecated-context-mismatch` |
| `dprolif-hn-various-alternative-bcr2025` | `hendry-1996-missed-days` | **Не получен** | Нет отдельного первичного файла | `validated-modelled-synthesis` |
| `dprolif-hn-larynx-bcr2025` | `bcr-2025-ch10-tables` | Получен | `Basic Clinical Radiobiology 2025.pdf` | `deprecated-untraceable-summary` |
| `dprolif-larynx-roberts1994` | `roberts-1994-larynx-time` | **Не получен** | Нет отдельного первичного файла | `validated-primary` |
| `dprolif-hn-tonsil-bcr2025` | `withers-1995-tonsil-time` | **Не получен** | Нет отдельного первичного файла | `validated-primary` |
| `dprolif-lung-pneumonitis-bentzen2000` | `bentzen-skoczylas-bernier-2000-lung` | **Не получен** | Нет отдельного первичного файла | `validated-review` |
| `dprolif-esophagus-pcr-geh2006` | `geh-2006-esophagus` | **Не получен** | Нет отдельного первичного файла | `validated-primary` |
| `dprolif-nsclc-bcr2025` | `koukourakis-1996-nsclc-time` | **Не получен** | Нет отдельного первичного файла | `validated-primary` |
| `dprolif-medulloblastoma-bcr2025` | `hinata-2001-medulloblastoma-time` | **Не получен** | Нет отдельного первичного файла | `validated-primary` |
| `dprolif-medulloblastoma-tk21-hinata2001` | `hinata-2001-medulloblastoma-time` | **Не получен** | Нет отдельного первичного файла | `validated-primary` |
| `dprolif-prostate-bcr2025` | `thames-2010-prostate-time` | **Не получен** | Нет отдельного первичного файла | `validated-primary-point-only` |
| `dprolif-breast-bcr2025` | `haviland-2016-breast-time` | **Не получен** | Нет отдельного первичного файла | `validated-primary` |
| `hytec-optic-dmax-1fx-10gy` | `milano-2021-hytec-optic` | Получен | `HyTEC_07_Milano_2021_Optic_pathways_tolerance.pdf` (+1 связанных) | `validated` |
| `hytec-optic-dmax-3fx-20gy` | `milano-2021-hytec-optic` | Получен | `HyTEC_07_Milano_2021_Optic_pathways_tolerance.pdf` (+1 связанных) | `validated` |
| `hytec-optic-dmax-5fx-25gy` | `milano-2021-hytec-optic` | Получен | `HyTEC_07_Milano_2021_Optic_pathways_tolerance.pdf` (+1 связанных) | `validated` |
| `hytec-brain-v12-5cc-symptomatic-rn` | `milano-2021-hytec-brain` | Получен | `HyTEC_06_Milano_2021_Brain_tolerance_SRS.pdf` (+3 связанных) | `validated` |
| `hytec-brain-v12-10cc-symptomatic-rn` | `milano-2021-hytec-brain` | Получен | `HyTEC_06_Milano_2021_Brain_tolerance_SRS.pdf` (+3 связанных) | `validated` |
| `hytec-brain-v12-over15cc-symptomatic-rn` | `milano-2021-hytec-brain` | Получен | `HyTEC_06_Milano_2021_Brain_tolerance_SRS.pdf` (+3 связанных) | `validated` |
| `hytec-brain-v20-3fx-any-necrosis-edema` | `milano-2021-hytec-brain` | Получен | `HyTEC_06_Milano_2021_Brain_tolerance_SRS.pdf` (+3 связанных) | `validated` |
| `hytec-brain-v20-3fx-resection` | `milano-2021-hytec-brain` | Получен | `HyTEC_06_Milano_2021_Brain_tolerance_SRS.pdf` (+3 связанных) | `validated` |
| `hytec-brain-v24-5fx-any-necrosis-edema` | `milano-2021-hytec-brain` | Получен | `HyTEC_06_Milano_2021_Brain_tolerance_SRS.pdf` (+3 связанных) | `validated` |
| `hytec-brain-v24-5fx-resection` | `milano-2021-hytec-brain` | Получен | `HyTEC_06_Milano_2021_Brain_tolerance_SRS.pdf` (+3 связанных) | `validated` |
| `hytec-cord-dmax-1fx-risk-range` | `sahgal-2021-hytec-spinal-cord` | Получен | `HyTEC_10_Sahgal_2021_Spinal_cord_tolerance.pdf` | `validated` |
| `hytec-cord-dmax-2fx-17gy` | `sahgal-2021-hytec-spinal-cord` | Получен | `HyTEC_10_Sahgal_2021_Spinal_cord_tolerance.pdf` | `validated` |
| `hytec-cord-dmax-3fx-20p3gy` | `sahgal-2021-hytec-spinal-cord` | Получен | `HyTEC_10_Sahgal_2021_Spinal_cord_tolerance.pdf` | `validated` |
| `hytec-cord-dmax-4fx-23gy` | `sahgal-2021-hytec-spinal-cord` | Получен | `HyTEC_10_Sahgal_2021_Spinal_cord_tolerance.pdf` | `validated` |
| `hytec-cord-dmax-5fx-25p3gy` | `sahgal-2021-hytec-spinal-cord` | Получен | `HyTEC_10_Sahgal_2021_Spinal_cord_tolerance.pdf` | `validated` |
| `hytec-spinal-cord-reirradiation-lower-risk-factors` | `sahgal-2021-hytec-spinal-cord` | Получен | `HyTEC_10_Sahgal_2021_Spinal_cord_tolerance.pdf` | `validated` |
| `hytec-brain-mets-1y-local-control` | `redmond-2021-hytec-brain-mets-tcp` | Получен | `HyTEC_05_Redmond_2021_Brain_metastases_TCP.pdf` (+1 связанных) | `validated` |
| `hytec-vestibular-schwannoma-3to5y-tcp` | `soltys-2021-hytec-vestibular-tcp` | Получен | `HyTEC_08_Soltys_2021_Vestibular_schwannoma_TCP.pdf` (+1 связанных) | `validated` |
| `hytec-spinal-mets-2y-tcp` | `soltys-2021-hytec-spinal-mets-tcp` | Получен | `HyTEC_09_Soltys_2021_Spinal_metastases_TCP.pdf` (+1 связанных) | `validated` |
| `hytec-liver-metastases-bed10-local-control` | `ohri-2021-hytec-liver-local-control` | Получен | `HyTEC_15_Ohri_2021_Liver_tumors_local_control.pdf` | `validated` |
| `hytec-adrenal-metastases-1y-tcp` | `stumpf-2021-hytec-adrenal-tcp` | Получен | `HyTEC_18_Stumpf_2021_Adrenal_TCP.pdf` | `validated` |
| `hytec-prostate-sbrt-5y-tcp` | `royce-2021-hytec-prostate-tcp` | Получен | `HyTEC_19_Royce_2021_Prostate_TCP.pdf` (+1 связанных) | `validated` |
| `nsclc-stage-i-size-adjusted-2y-tcp` | `ohri-2012-nsclc-size-tcp` | **Не получен** | Нет отдельного первичного файла | `validated-primary` |
| `hytec-hn-reirradiation-local-control` | `vargo-2021-hytec-hn-reirradiation-tcp` | Получен | `HyTEC_11_Vargo_2021_Head-neck_reirradiation_TCP.pdf` | `validated` |
| `hytec-pancreas-1y-local-control` | `mahadevan-2021-hytec-pancreas-tcp` | Получен | `HyTEC_17_Mahadevan_2021_Pancreas_SBRT.pdf` (+1 связанных) | `validated` |
| `hytec-major-vessel-d0p5cc-5fx-20gy` | `grimm-2021-hytec-major-vessels` | Получен | `HyTEC_12_Grimm_2021_Carotid_blowout_tolerance.pdf` (+1 связанных) | `validated` |
| `hytec-major-vessel-dmax-5fx-20gy-risk` | `grimm-2021-hytec-major-vessels` | Получен | `HyTEC_12_Grimm_2021_Carotid_blowout_tolerance.pdf` (+1 связанных) | `validated` |
| `hytec-major-vessel-dmax-5fx-30gy-risk` | `grimm-2021-hytec-major-vessels` | Получен | `HyTEC_12_Grimm_2021_Carotid_blowout_tolerance.pdf` (+1 связанных) | `validated` |
| `hytec-lung-rilt-mean-dose-under8gy` | `kong-2021-hytec-lung-parenchyma` | Получен | `HyTEC_14_Kong_2021_Lung_parenchyma_tolerance.pdf` (+1 связанных) | `validated` |
| `hytec-lung-rilt-v20-10to15pct` | `kong-2021-hytec-lung-parenchyma` | Получен | `HyTEC_14_Kong_2021_Lung_parenchyma_tolerance.pdf` (+1 связанных) | `validated` |
| `hytec-liver-primary-mld-3fx-13gy` | `miften-2021-hytec-liver-toxicity` | Получен | `HyTEC_16_Miften_2021_Liver_dose-volume_effects.pdf` | `validated` |
| `hytec-liver-primary-mld-6fx-18gy` | `miften-2021-hytec-liver-toxicity` | Получен | `HyTEC_16_Miften_2021_Liver_dose-volume_effects.pdf` | `validated` |
| `hytec-liver-metastases-mld-3fx-15gy` | `miften-2021-hytec-liver-toxicity` | Получен | `HyTEC_16_Miften_2021_Liver_dose-volume_effects.pdf` | `validated` |
| `hytec-liver-metastases-mld-6fx-20gy` | `miften-2021-hytec-liver-toxicity` | Получен | `HyTEC_16_Miften_2021_Liver_dose-volume_effects.pdf` | `validated` |
| `hytec-liver-spared-vle15gy-700cc` | `miften-2021-hytec-liver-toxicity` | Получен | `HyTEC_16_Miften_2021_Liver_dose-volume_effects.pdf` | `validated` |
| `hytec-liver-spared-vle17gy-700cc` | `miften-2021-hytec-liver-toxicity` | Получен | `HyTEC_16_Miften_2021_Liver_dose-volume_effects.pdf` | `validated` |
| `hytec-prostate-sbrt-bladder-vrx-5to10cc` | `wang-2021-hytec-prostate-toxicity` | Получен | `HyTEC_20_Wang_2021_Prostate_toxicity.pdf` (+1 связанных) | `validated` |
| `hytec-prostate-sbrt-urethra-dmax-38to42gy` | `wang-2021-hytec-prostate-toxicity` | Получен | `HyTEC_20_Wang_2021_Prostate_toxicity.pdf` (+1 связанных) | `validated` |
| `hytec-prostate-sbrt-rectum-dmax-35to38gy` | `wang-2021-hytec-prostate-toxicity` | Получен | `HyTEC_20_Wang_2021_Prostate_toxicity.pdf` (+1 связанных) | `validated` |

## Научная интерпретация

1. **Приоритет 1 — 30 records без первичного файла:** проверить по доступному оригинальному DOI/PDF до объявления независимой валидации; особенно параметры **α/β**, **T½**, **Dprolif/Tk** и Ohri 2012 (NSCLC size-adjusted TCP).
2. **Приоритет 2 — 73 records с файлом:** сверить по точным страницам/таблицам, включая follow-up, дозовую метрику (Dmax/D0.1cc/Vx/MLD/BED/EQD₂), риск-группы, фракционирование, CI, prior RT, technique и supplements. Имеющиеся spot checks: [SOURCE_NUMERICAL_CROSSCHECK_2026-10.md](SOURCE_NUMERICAL_CROSSCHECK_2026-10.md).
3. **Разделение статусов:** `source-file-present`, `numeric-checked`, `methodologically-validated`, `commissioned` — разные критерии. Ни этот документ, ни CI не подтверждают последние два автоматически.
4. **Только опубликованные опорные точки:** нельзя превращать наблюдательные группы, модельную экстраполяцию или локальную институциональную методику в автоматически применимый клинический предел.
5. **После подтверждения:** добавить точную страницу/таблицу/формулу и вторую независимую проверку конкретного record ID. Evidence dataset остаётся `draft`.

Исходные манифесты: [HyTEC 40 файлов](HYTEC_40_FILE_MANIFEST_2026-10.md), [прочие 29 файлов](ADDITIONAL_29_FILE_MANIFEST_2026-10.md), [недостающие 27 источников](PRIMARY_SOURCE_GAPS_2026-10.md). Этот документ содержит **все 103 ID** из [EVIDENCE_INVENTORY.md](EVIDENCE_INVENTORY.md), а не выборку.
