# Дополнительная литература HFC: 29 файлов — инвентаризация 2026-10-08

Эта таблица охватывает **29** не-HyTEC-файлов, полученных отдельно после завершения загрузки. По каждому установлена семейная принадлежность публикации и текущая роль в реестре HFC.

| № | Файл | Соответствующий source ID / роль |
|---:|---|---|
| 1 | `Appelt_2025_RadiotherOncol_ESTRO_cumulative_dose_supplement.pdf` | appelt-2026-cumulative-dose-reirradiation |
| 2 | `Appelt_2025_RadiotherOncol_ESTRO_cumulative_dose.pdf` | appelt-2026-cumulative-dose-reirradiation |
| 3 | `Basic Clinical Radiobiology 2025.pdf` | bcr-2025-ch10-tables (глава 10) |
| 4 | `bfco191_radiotherapy-treatment-interruptions.pdf` | rcr-2019-timely-delivery |
| 5 | `Brand_2021_IJROBP_rectal_alpha-beta.pdf` | brand-2021-chhip-rectal |
| 6 | `Brand_2021_IJROBP_rectal_supplement.docx` | brand-2021-chhip-rectal |
| 7 | `Brand_2022_IJROBP_GU_alpha-beta_supplement.docx` | brand-2023-chhip-gu |
| 8 | `Brand_2022_IJROBP_GU_alpha-beta.pdf` | brand-2023-chhip-gu |
| 9 | `ESTRO-EORTC_2022_LancetOncol_reirradiation_consensus_AAM_Figure_1.pdf` | andratschke-2022-estro-eortc-reirradiation |
| 10 | `ESTRO-EORTC_2022_LancetOncol_reirradiation_consensus_AAM_Figure_2.pdf` | andratschke-2022-estro-eortc-reirradiation |
| 11 | `ESTRO-EORTC_2022_LancetOncol_reirradiation_consensus_AAM_Figure_3.pdf` | andratschke-2022-estro-eortc-reirradiation |
| 12 | `ESTRO-EORTC_2022_LancetOncol_reirradiation_consensus_AAM_Manuscript.pdf` | andratschke-2022-estro-eortc-reirradiation |
| 13 | `ESTRO-EORTC_2022_LancetOncol_reirradiation_consensus_AAM_Tables.pdf` | andratschke-2022-estro-eortc-reirradiation |
| 14 | `FAST_10y_JCO2020.pdf` | brunt-2020-fast-10y |
| 15 | `FAST-Forward_10y_LancetOncol2026_appendix.pdf` | brunt-2026-fast-forward-10y |
| 16 | `FAST-Forward_10y_LancetOncol2026.pdf` | brunt-2026-fast-forward-10y |
| 17 | `FAST-Forward_5y_Lancet2020_appendix.pdf` | brunt-2020-fast-forward-5y |
| 18 | `FAST-Forward_5y_Lancet2020.pdf` | brunt-2020-fast-forward-5y |
| 19 | `Handbook_of_Radiotherapy_Physics_Theory_and_Practice,_Second_Edition.pdf` | справочная физика, отдельного source object нет |
| 20 | `JoinerM.KogelA.BasicClinicalRadiobiology.pdf` | историческая базовая литература, отдельного source object нет |
| 21 | `Linear-Quadratic-Model-in-the-Clinical-Practice-via-the-Web-Application.pdf` | batyan-2023-hypocalc-webapp |
| 22 | `Quantitative Radiobiology for Proton Therapy.pdf` | вне photon scope (proton RBE/LET) |
| 23 | `RCR_Dose_Fractionation_4th_ed_2024.pdf` | rcr-2024-dose-fractionation |
| 24 | `RCR_Principles_of_Reirradiation_2024.pdf` | rcr-2024-principles-reirradiation |
| 25 | `Vogelius_Bentzen_2020_IJROBP_prostate_alpha-beta.pdf` | vogelius-bentzen-2020-prostate |
| 26 | `Vogelius_Bentzen_2020_IJROBP_prostate_alpha-beta.xml` | vogelius-bentzen-2020-prostate |
| 27 | `Zhang_2026_PRO_ReCOG_case_guide_supplement.docx` | zhang-2026-recog-case-guide |
| 28 | `Zhang_2026_PRO_ReCOG_case_guide.pdf` | zhang-2026-recog-case-guide |
| 29 | `Основы_клинической_радиобиологии.pdf` | перевод BCR 4-го изд., отдельного source object нет |

### Правила интерпретации

- Документ «Brand 2022 GU» является онлайн-изданием статьи 2022 г. с выпуском журнала 2023 г.; идентификатор `brand-2023-chhip-gu` не означает потерю исходной версии.
- Аналогично источник Appelt 2025 может числиться в реестре по финальному году журнального выпуска.
- XML и PDF Vogelius/Bentzen относятся к одной первичной публикации и должны проверяться совместно.
- FAST-Forward 10-летний supplement явно помечен как **исправленный 24.08.2026**. Приоритет отдать исправленной таблице D5.
- RCR документы — нормативно-клиническое руководство/библиотека вариантов, но не источник универсальных опухолевых α/β.
- Старый BCR, русское переиздание и Handbook — научная/методическая база, но их отсутствие как отдельных объектов `sources.ts` не означает потерю клинических коэффициентов; нужно верифицировать конкретные цитируемые главы.
- Книга по протонам сознательно отложена за пределы текущей фотонной версии HFC, без внесения RBE по умолчанию.
- Два примера Zhang 2026 и приложение содержат институциональные TRF/ограничения: использовать как способы оценки, **не** как универсальные клинические коэффициенты.
- Полная постраничная независимая сверка всех чисел данных 29 файлов пока не завершена — см. [SOURCE_NUMERICAL_CROSSCHECK_2026-10.md](SOURCE_NUMERICAL_CROSSCHECK_2026-10.md).

Таким образом, отдельно получено **40 HyTEC + 29 других = 69** файлов. Не путать число файлов (включает приложения, рисунки и копии XML/PDF) с числом уникальных научных публикаций.
