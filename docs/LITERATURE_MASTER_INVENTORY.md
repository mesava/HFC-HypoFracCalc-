# HFC — Literature Master Inventory (P1, 2026-10-08)

> **Промежуточный доказательный инвентарный реестр, не свидетельство полной численной/клинической валидации.** Baseline: `08fff483c659c6d6d93a4cf5bd96eb0248ec5316` (`develop`), Issue #56. Text-read stage 2026-10-08.

## Метод, единица учёта и границы проверки

- Источники: 69 **отдельно загруженных** научных файлов из Library /HypoFracCalc; сопоставлены с `HYTEC_40_FILE_MANIFEST_2026-10.md`, `ADDITIONAL_29_FILE_MANIFEST_2026-10.md`, `sources.ts` и `EVIDENCE_103_SOURCE_FILE_MATRIX_2026-10.md`.
- Обнаружено файлов из двух манифестов: **69**; файлов с отсутствующим Library-объектом: **0**; повторяющихся точных имён внутри списка: **0**.
- Всего в папке Library отмечено 75 объектов: 69 научных файлов и шесть других (ZIP, HTML, PNG). **Архив `HypoCalc(1).zip` 357271343 байта не раскрыт**: количество его внутренних записей не подтверждено. Не считать архив и отдельные файлы автоматически идентичными.
- В текущем проходе текст первой страницы каждого PDF / вводные строки DOC(X) и XML реально прочитаны, однако **постраничная полная проверка не завершена**; для PDF со сканами сохранён возможный риск неполноты извлечения текста. Восстановить байты файлов через materialize не удалось, поэтому `sha256=null` и **не выполнялось** сравнение дубликатов по SHA-256.
- `in_sources_ts` указывает только регистрацию родительского источника; `evidence_record_count` означает связь с записями, **не проверку их значения**. Названия и авторы получены из `sources.ts`, когда source ID присутствует. Для контекстных объектов без source ID — библиографические поля не считаются подтверждёнными данным реестром (см. имя файла/родительскую публикацию).
- Для первой страницы 20 основных статей HyTEC DOI повторно извлечены из PDF, но таблицы, формулы и 15 приложений требуют независимого покоэффициентного сравнения. DOI и PMID остальных статей пока перечислены из действующего `sources.ts`, а не независимо верифицированы здесь.
- DOI, опубликованный год и год исходного online release могут различаться (напр. HyTEC выпуск 2021, первоначальный DOI 2017–2020; Brand GU online 2022 / print 2023).

## Сводка

| Параметр | Итог |
|---|---:|
| Основные статьи HyTEC | 20 |
| Приложения HyTEC | 15 |
| Письма/ответы HyTEC | 5 |
| Остальная литература и её вложения | 29 |
| Отдельно предоставлено | **69** |
| Сопоставленные source IDs | **20 из 61** |
| Связанные evidence records c исходным source | **38 из 103** |
| Численно полностью подтверждены по всем страницам | **нет основания утверждать** |

## Пофайловая таблица

| № | Исходный файл | Тип | Parent / source ID | Год | DOI | Evidence | Статус |
|---:|---|---|---|---:|---|---:|---|
| 1 | `HyTEC_01_Grimm_2021_Overview.pdf` | primary-publication | `grimm-2021-hytec-overview` | 2021 | 10.1016/j.ijrobp.2020.10.039 | 0 | First text checked; numeric partial/pending |
| 2 | `HyTEC_02_Moiseenko_2021_Dose-response_modeling_primer_supplement.docx` | supplement | `moiseenko-2021-hytec-modeling-primer` | 2021 | 10.1016/j.ijrobp.2020.11.020 | 0 | First text checked; numeric partial/pending |
| 3 | `HyTEC_02_Moiseenko_2021_Dose-response_modeling_primer.pdf` | primary-publication | `moiseenko-2021-hytec-modeling-primer` | 2021 | 10.1016/j.ijrobp.2020.11.020 | 0 | First text checked; numeric partial/pending |
| 4 | `HyTEC_03_Song_2021_Biological_principles_SBRT_SRS.pdf` | primary-publication | `song-2021-hytec-biological-principles` | 2021 | 10.1016/j.ijrobp.2019.02.047 | 0 | First text checked; numeric partial/pending |
| 5 | `HyTEC_04_Marciscano_2021_Immunomodulatory_effects_SBRT_supplement.docx` | supplement | `marciscano-2021-hytec-immunomodulation` | 2021 | 10.1016/j.ijrobp.2019.02.046 | 0 | First text checked; numeric partial/pending |
| 6 | `HyTEC_04_Marciscano_2021_Immunomodulatory_effects_SBRT.pdf` | primary-publication | `marciscano-2021-hytec-immunomodulation` | 2021 | 10.1016/j.ijrobp.2019.02.046 | 0 | First text checked; numeric partial/pending |
| 7 | `HyTEC_05_Redmond_2021_Brain_metastases_TCP_supplement.pdf` | supplement | `redmond-2021-hytec-brain-mets-tcp` | 2021 | 10.1016/j.ijrobp.2020.10.034 | 1 | First text checked; numeric partial/pending |
| 8 | `HyTEC_05_Redmond_2021_Brain_metastases_TCP.pdf` | primary-publication | `redmond-2021-hytec-brain-mets-tcp` | 2021 | 10.1016/j.ijrobp.2020.10.034 | 1 | First text checked; numeric partial/pending |
| 9 | `HyTEC_06_Milano_2021_Brain_tolerance_SRS_supplement_1.doc` | supplement | `milano-2021-hytec-brain` | 2021 | 10.1016/j.ijrobp.2020.08.013 | 7 | First text checked; numeric partial/pending |
| 10 | `HyTEC_06_Milano_2021_Brain_tolerance_SRS_supplement_2.doc` | supplement | `milano-2021-hytec-brain` | 2021 | 10.1016/j.ijrobp.2020.08.013 | 7 | First text checked; numeric partial/pending |
| 11 | `HyTEC_06_Milano_2021_Brain_tolerance_SRS_supplement_3.docx` | supplement | `milano-2021-hytec-brain` | 2021 | 10.1016/j.ijrobp.2020.08.013 | 7 | First text checked; numeric partial/pending |
| 12 | `HyTEC_06_Milano_2021_Brain_tolerance_SRS.pdf` | primary-publication | `milano-2021-hytec-brain` | 2021 | 10.1016/j.ijrobp.2020.08.013 | 7 | First text checked; numeric partial/pending |
| 13 | `HyTEC_07_Milano_2021_Optic_pathways_tolerance_supplement.docx` | supplement | `milano-2021-hytec-optic` | 2021 | 10.1016/j.ijrobp.2018.01.053 | 3 | First text checked; numeric partial/pending |
| 14 | `HyTEC_07_Milano_2021_Optic_pathways_tolerance.pdf` | primary-publication | `milano-2021-hytec-optic` | 2021 | 10.1016/j.ijrobp.2018.01.053 | 3 | First text checked; numeric partial/pending |
| 15 | `HyTEC_08_Soltys_2021_Vestibular_schwannoma_TCP_supplement.docx` | supplement | `soltys-2021-hytec-vestibular-tcp` | 2021 | 10.1016/j.ijrobp.2020.11.019 | 1 | First text checked; numeric partial/pending |
| 16 | `HyTEC_08_Soltys_2021_Vestibular_schwannoma_TCP.pdf` | primary-publication | `soltys-2021-hytec-vestibular-tcp` | 2021 | 10.1016/j.ijrobp.2020.11.019 | 1 | First text checked; numeric partial/pending |
| 17 | `HyTEC_09_Soltys_2021_Spinal_metastases_TCP_supplement.docx` | supplement | `soltys-2021-hytec-spinal-mets-tcp` | 2021 | 10.1016/j.ijrobp.2020.11.021 | 1 | First text checked; numeric partial/pending |
| 18 | `HyTEC_09_Soltys_2021_Spinal_metastases_TCP.pdf` | primary-publication | `soltys-2021-hytec-spinal-mets-tcp` | 2021 | 10.1016/j.ijrobp.2020.11.021 | 1 | First text checked; numeric partial/pending |
| 19 | `HyTEC_10_Sahgal_2021_Spinal_cord_tolerance.pdf` | primary-publication | `sahgal-2021-hytec-spinal-cord` | 2021 | 10.1016/j.ijrobp.2019.09.038 | 6 | First text checked; numeric partial/pending |
| 20 | `HyTEC_11_Vargo_2021_Head-neck_reirradiation_TCP.pdf` | primary-publication | `vargo-2021-hytec-hn-reirradiation-tcp` | 2021 | 10.1016/j.ijrobp.2018.01.044 | 1 | First text checked; numeric partial/pending |
| 21 | `HyTEC_12_Grimm_2021_Carotid_blowout_tolerance_supplement.doc` | supplement | `grimm-2021-hytec-major-vessels` | 2021 | 10.1016/j.ijrobp.2020.12.037 | 3 | First text checked; numeric partial/pending |
| 22 | `HyTEC_12_Grimm_2021_Carotid_blowout_tolerance.pdf` | primary-publication | `grimm-2021-hytec-major-vessels` | 2021 | 10.1016/j.ijrobp.2020.12.037 | 3 | First text checked; numeric partial/pending |
| 23 | `HyTEC_13_Lee_2021_NSCLC_stage_I_local_control_supplement.docx` | supplement | `lee-2021-hytec-stage-i-nsclc` | 2021 | 10.1016/j.ijrobp.2019.03.045 | 0 | First text checked; numeric partial/pending |
| 24 | `HyTEC_13_Lee_2021_NSCLC_stage_I_local_control.pdf` | primary-publication | `lee-2021-hytec-stage-i-nsclc` | 2021 | 10.1016/j.ijrobp.2019.03.045 | 0 | First text checked; numeric partial/pending |
| 25 | `HyTEC_14_Kong_2021_Lung_parenchyma_tolerance_supplement.pdf` | supplement | `kong-2021-hytec-lung-parenchyma` | 2021 | 10.1016/j.ijrobp.2018.11.028 | 2 | First text checked; numeric partial/pending |
| 26 | `HyTEC_14_Kong_2021_Lung_parenchyma_tolerance.pdf` | primary-publication | `kong-2021-hytec-lung-parenchyma` | 2021 | 10.1016/j.ijrobp.2018.11.028 | 2 | First text checked; numeric partial/pending |
| 27 | `HyTEC_15_Ohri_2021_Liver_tumors_local_control.pdf` | primary-publication | `ohri-2021-hytec-liver-local-control` | 2021 | 10.1016/j.ijrobp.2017.12.288 | 1 | First text checked; numeric partial/pending |
| 28 | `HyTEC_16_Miften_2021_Liver_dose-volume_effects.pdf` | primary-publication | `miften-2021-hytec-liver-toxicity` | 2021 | 10.1016/j.ijrobp.2017.12.290 | 6 | First text checked; numeric partial/pending |
| 29 | `HyTEC_17_Mahadevan_2021_Pancreas_SBRT_supplement.doc` | supplement | `mahadevan-2021-hytec-pancreas-tcp` | 2021 | 10.1016/j.ijrobp.2020.11.017 | 1 | First text checked; numeric partial/pending |
| 30 | `HyTEC_17_Mahadevan_2021_Pancreas_SBRT.pdf` | primary-publication | `mahadevan-2021-hytec-pancreas-tcp` | 2021 | 10.1016/j.ijrobp.2020.11.017 | 1 | First text checked; numeric partial/pending |
| 31 | `HyTEC_18_Stumpf_2021_Adrenal_TCP.pdf` | primary-publication | `stumpf-2021-hytec-adrenal-tcp` | 2021 | 10.1016/j.ijrobp.2020.05.062 | 1 | First text checked; numeric partial/pending |
| 32 | `HyTEC_19_Royce_2021_Prostate_TCP_supplement.docx` | supplement | `royce-2021-hytec-prostate-tcp` | 2021 | 10.1016/j.ijrobp.2020.08.014 | 1 | First text checked; numeric partial/pending |
| 33 | `HyTEC_19_Royce_2021_Prostate_TCP.pdf` | primary-publication | `royce-2021-hytec-prostate-tcp` | 2021 | 10.1016/j.ijrobp.2020.08.014 | 1 | First text checked; numeric partial/pending |
| 34 | `HyTEC_20_Wang_2021_Prostate_toxicity_supplement.docx` | supplement | `wang-2021-hytec-prostate-toxicity` | 2021 | 10.1016/j.ijrobp.2020.09.054 | 3 | First text checked; numeric partial/pending |
| 35 | `HyTEC_20_Wang_2021_Prostate_toxicity.pdf` | primary-publication | `wang-2021-hytec-prostate-toxicity` | 2021 | 10.1016/j.ijrobp.2020.09.054 | 3 | First text checked; numeric partial/pending |
| 36 | `HyTEC_21_Klement_2021_Letter_In_regard_to_Ohri.pdf` | scientific-letter | `HyTEC_21` | — | — | 0 | First text checked; numeric partial/pending |
| 37 | `HyTEC_22_Ohri_2021_Letter_Reply_to_Klement.pdf` | scientific-letter | `HyTEC_22` | — | — | 0 | First text checked; numeric partial/pending |
| 38 | `HyTEC_23_Brown_2021_Letter_In_regard_to_Song.pdf` | scientific-letter | `HyTEC_23` | — | — | 0 | First text checked; numeric partial/pending |
| 39 | `HyTEC_24_Song_2021_Letter_Reply_to_Brown_Carlson.pdf` | scientific-letter | `HyTEC_24` | — | — | 0 | First text checked; numeric partial/pending |
| 40 | `HyTEC_25_Grimm_2021_Letter_Reply_to_Song_and_Brown.pdf` | scientific-letter | `HyTEC_25` | — | — | 0 | First text checked; numeric partial/pending |
| 41 | `Appelt_2025_RadiotherOncol_ESTRO_cumulative_dose_supplement.pdf` | supplement | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 42 | `Appelt_2025_RadiotherOncol_ESTRO_cumulative_dose.pdf` | primary-publication | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 43 | `Basic Clinical Radiobiology 2025.pdf` | textbook | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 44 | `bfco191_radiotherapy-treatment-interruptions.pdf` | guideline | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 45 | `Brand_2021_IJROBP_rectal_alpha-beta.pdf` | primary-publication | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 46 | `Brand_2021_IJROBP_rectal_supplement.docx` | supplement | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 47 | `Brand_2022_IJROBP_GU_alpha-beta_supplement.docx` | supplement | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 48 | `Brand_2022_IJROBP_GU_alpha-beta.pdf` | primary-publication | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 49 | `ESTRO-EORTC_2022_LancetOncol_reirradiation_consensus_AAM_Figure_1.pdf` | supplementary-figure | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 50 | `ESTRO-EORTC_2022_LancetOncol_reirradiation_consensus_AAM_Figure_2.pdf` | supplementary-figure | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 51 | `ESTRO-EORTC_2022_LancetOncol_reirradiation_consensus_AAM_Figure_3.pdf` | supplementary-figure | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 52 | `ESTRO-EORTC_2022_LancetOncol_reirradiation_consensus_AAM_Manuscript.pdf` | accepted-manuscript | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 53 | `ESTRO-EORTC_2022_LancetOncol_reirradiation_consensus_AAM_Tables.pdf` | supplementary-tables | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 54 | `FAST_10y_JCO2020.pdf` | primary-publication | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 55 | `FAST-Forward_10y_LancetOncol2026_appendix.pdf` | supplement | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 56 | `FAST-Forward_10y_LancetOncol2026.pdf` | primary-publication | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 57 | `FAST-Forward_5y_Lancet2020_appendix.pdf` | supplement | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 58 | `FAST-Forward_5y_Lancet2020.pdf` | primary-publication | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 59 | `Handbook_of_Radiotherapy_Physics_Theory_and_Practice,_Second_Edition.pdf` | textbook | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 60 | `JoinerM.KogelA.BasicClinicalRadiobiology.pdf` | textbook | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 61 | `Linear-Quadratic-Model-in-the-Clinical-Practice-via-the-Web-Application.pdf` | primary-publication | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 62 | `Quantitative Radiobiology for Proton Therapy.pdf` | textbook | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 63 | `RCR_Dose_Fractionation_4th_ed_2024.pdf` | guideline | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 64 | `RCR_Principles_of_Reirradiation_2024.pdf` | guideline | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 65 | `Vogelius_Bentzen_2020_IJROBP_prostate_alpha-beta.pdf` | primary-publication | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 66 | `Vogelius_Bentzen_2020_IJROBP_prostate_alpha-beta.xml` | publisher-xml | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 67 | `Zhang_2026_PRO_ReCOG_case_guide_supplement.docx` | supplement | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 68 | `Zhang_2026_PRO_ReCOG_case_guide.pdf` | primary-publication | `context` | — | — | 0 | First text checked; numeric partial/pending |
| 69 | `Основы_клинической_радиобиологии.pdf` | textbook | `context` | — | — | 0 | First text checked; numeric partial/pending |

## Отсутствующие материалы и дубликаты

- 27 из 61 объектов библиографического реестра не имеют отдельного прямого файла в данной поставке; приоритетный список — `PRIMARY_SOURCE_GAPS_2026-10.md`.
- **PDF+XML одной публикации Vogelius & Bentzen 2020** — различные представления одной работы, не две независимые публикации; также каждая пара primary + supplement, и набор Figures/Tables ESTRO–EORTC не рассматриваются как отдельные клинические доказательства.
- Совпадения SHA-256, скрытые дубликаты, комплектность приложений, содержимое трёх ZIP и полная идентичность архивных файлов **не проверены**. Нельзя утверждать, что отсутствующих supplements нет.
- Приоритет дальнейшего чтения: (1) HyTEC приложения и 5 писем, (2) все количественные HyTEC records, (3) отсутствующие 27 первичных source IDs, (4) RCR/BCR/FAST/Brand/Vogelius/ESTRO/Appelt.

## Машинные данные

- `docs/LITERATURE_MASTER_INVENTORY.csv` — основные колонки и цитаты (UTF-8)
- `docs/LITERATURE_MASTER_INVENTORY.json` — дополнительно массив `evidence_record_ids`, размер и статусы, без выдуманных checksum.
- Численный научный аудит: `docs/HYTEC_FULL_SCIENTIFIC_AUDIT.md`.
