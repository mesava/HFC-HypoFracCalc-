# HFC — P6 Integration Gate & Technical RC Readiness

**Дата:** 6 ноября 2026. **Статус:** `develop`, научный пакет P6.1–P6.3b интегрирован; **не является клиническим допуском**. Версия `package.json=0.1.0-rc.1`; evidence dataset `2026.10-v0.2`, `releaseStatus=draft`, `reviewers=[]`.

## 1. Область интеграции: PR 93–97

| PR | Решение на 6 ноября | Изменённые файлы | Научная граница |
|---|---|---|---|
| [#93](https://github.com/mesava/HFC-HypoFracCalc-/pull/93) — P6.1 Royce/Ohri | **Merged → develop** | 2 `docs/` | Несовпадения опубликованной формулы/таблицы остаются; [Ohri #59](https://github.com/mesava/HFC-HypoFracCalc-/issues/59), [Royce #104](https://github.com/mesava/HFC-HypoFracCalc-/issues/104) |
| [#94](https://github.com/mesava/HFC-HypoFracCalc-/pull/94) — P6.2a–i | **Merged → develop** | 24 `docs/`, 8 `tests/` | 66/69 первоначальных файлов, 33/61 source IDs и 73/103 live records представлены в повторной загрузке; это file coverage, не model refit. Issue [#56](https://github.com/mesava/HFC-HypoFracCalc-/issues/56) открыт |
| [#95](https://github.com/mesava/HFC-HypoFracCalc-/pull/95) — P6.3 | **Merged → develop** | 2 `docs/`, 1 `tests/` | 6 T½ + 14 Dprolif, осторожность в трактовке onset/units |
| [#96](https://github.com/mesava/HFC-HypoFracCalc-/pull/96) — P6.3b | **Merged → develop** | 2 `docs/`, 1 `tests/` | 10 explicit-only time-loss; original dose normalization EQD2/day не доказана для всех |
| [#97](https://github.com/mesava/HFC-HypoFracCalc-/pull/97) — P6.4a | **Draft, NOT merged** | `src/research/`, `docs/`, `tests/` | Исследовательский LKB/NTCP, не клинический интерфейс, нет независимых fit/covariance/external cohort validation |

**Граница сделанных изменений:** 4 merge PR (#93–96) добавляют исключительно научные документы и автоматические тесты; **нет правок `src/`, `package.json`, клинических коэффициентов, алгоритмов или HTML/CSS**. Присутствие исходных данных в `develop` ничего не «повышает» в `reviewed`, `validated` или `releaseStatus`.

### 1.1 Проверяемый объём

- **Первичный документный комплект:** 66 из 69 исторических файлов доступны на уровне байтов; 40/40 прежних HyTEC SHA-256 совпадают и 26 новых SHA-256 зафиксированы. Три недостающих документа: `Handbook_of_Radiotherapy_Physics_Theory_and_Practice,_Second_Edition.pdf`, `Linear-Quadratic-Model-in-the-Clinical-Practice-via-the-Web-Application.pdf`, `Quantitative Radiobiology for Proton Therapy.pdf`. Для них нет бинарной сверки, закрывать #56 нельзя.
- **61 библиографический источник / 103 численные записи:** 33 source IDs и 73 live records имеют файл в повторно загруженном *историческом* корпусе. Другие источники могут быть проверены внешне/отдельно; нельзя приравнивать 28 source IDs и 30 records без файла в этой загрузке к «ошибочным» или «непроверенным».
- **44 α/β:** 30 записей численно сверены с первичными загруженными PDF-таблицами, 12 с вторичной таблицей BCR 2025, ещё 2 альтернативные оценки миелопатии требуют точного первоисточника. Полные статистические refits не выполнялись.
- **6 T½ + 14 Dprolif:** все 20 получили построчные source-status gates по BCR2025; 19 соответствуют соответствующим строкам, альтернативная точка Hinata 0.55 не является отдельной строкой BCR. `Tk=52` для простаты не доказано биологическим временем onset. Отсутствующая первичная EQD2 normalization не скрывается.
- **HyTEC:** 29/29 OAR clinical-constraint source crosswalk; 9 OutcomeModel sets/40 опубликованных points проверены на соответствие P2 provenance ledger (8 оригинальных HyTEC groups + один внешний Ohri 2012). Это не 40 независимых fitted model reproductions.
- **RCR2024:** 25 fixed и 4 complex режима имеют совпадающие дозы, фракции и Grade с PDF исходника; выявлены 11 приоритетных кандидатов для будущего расширения, **не** добавленных в приложение.
- **Нерешённые источниковые несоответствия:** Royce low/intermediate 90/95% не воспроизводятся Eq.(2) с опубликованными параметрами; Ohri при 50Gy/5fx/1cm печатает 93%, его же sBED equation даёт ≈94.8%.

### 1.2 Новый первичный документ ReCOG (6 ноября 2026)

Получен **оригинал** Paradis KC, Appelt AL, Bentzen SM et al., *Lancet Oncology* 2026;27:e101–e110, DOI `10.1016/S1470-2045(25)00562-5`. Этот же `sourceId=paradis-2026-recog-consensus` уже присутствовал в HFC, поэтому **не** добавлять вторую библиографическую запись. SHA-256 оригинала `95da5699b2eae39c2dde89ba8c01ae46454ac330d3db6ef9be6c50a2c2c1ba88`; см. [25-point source-to-reporting audit](P6_RECOG_2026_APPELT_PARADIS_PRIMARY_PDF_AUDIT_2026-11-06_RU.md). Присланный PDF **не совпадает ни с одним из трёх исторически недоступных файлов** в issue #56, поэтому счётчик 66/69 сохраняется.

Рекомендации e103–e106 требуют корректной фазовой EQDX, контроля регистраций, uncertainty/ROI reporting и структуры Figure 2. HFC реализует только скалярную модель с явной manual TRF и предупреждением о несуществующей 3D-аккумуляции. Для полноценного клинического отчёта остаются **8 отсутствующих / 11 частичных** пунктов из 25 рассмотренных требований, см. [#107](https://github.com/mesava/HFC-HypoFracCalc-/issues/107). Сохраняется `draft`; это **не** препятствие для учебной документации, но клинический gate закрыт.

## 2. Release gates и права на утверждение

| Критерий | Текущий факт | Gate |
|---|---|---|
| Регрессии/сборка исходных 4 PR | Все 4 head CI были зелёными | PASS historical, но обязателен повторный **integrated develop CI** |
| Научные данные и клиническая логика неизменны | Да, 4 PR только docs/tests | PASS |
| Source-provenance документирована | Есть; явные 66/69 и source tiers | PARTIAL, #56 открыт |
| Dose-basis Dprolif и parameter domains | Требуются original-equation checks 10 selectable | BLOCKED for clinical use |
| Royce/Ohri | #104 и #59 открыты | BLOCKED for affected model claiming reproducible predictions |
| Research LKB / patient-specific TCP/NTCP | Исследовательская ветка, не клиническая | EXCLUDED from technical stable release |
| Репликация clinical endpoints, commissioning, local approval | Нет cohort fit/clinical signoff, `reviewers=[]` | NOT APPROVED |
| Публичная ветка `main` | Не получает P6 scientific changes автоматически | Keep independently gated |

**Два возможных уровня релиза:**

1. **Technical research RC:** после зелёного integrated develop CI и review документации возможно представить новую версию для *исследовательских/учебных целей*, сохраняя все предупреждения и `draft`. Наличие научных issues само по себе не запрещает публикацию документации, но должно оставаться видимым.
2. **Clinical release:** **не разрешён**; нужно независимое подтверждение первичных формул/единиц/доменов, проверка широкого набора клинических случаев и локальное commissioning/QA, утверждённые пользователем и организацией. Готовый CI и «29/29» не заменяют их.

### 2.1 Следующий порядок

1. **Проверить интегрированный CI на `develop` после #93–96**, включая TypeScript, npm audit, Vitest, production build и Playwright. Не объявлять PASS до фактического результата.
2. Проверить что ключевые математические/regression cases сохранились. Связать source-matrix 44+20+29+40+29 с манифестами и документацией; README публикует уровни подтверждения, не придумывает clinical validation.
3. Отдельно провести code-review research LKB из #97: generalized EUD, contour basis, DVH bin definitions, dose per fraction / fraction count, model-specific TD50/m/n covariance и source-fitting. Пока **не** смешивать с клинической частью.
4. На release ветке проверить изменения `develop→main` и решить отдельно, переносить ли только docs/tests или часть технических функций. Никакой автоматической публикации на основном сайте.
5. Завершить #56, #59, #104 **по мере появления оригинальных доказательств**; не закрывать для создания видимости готовности.

## 3. Обязательные запреты и caveats

- Не именовать `reviewed` как `clinically validated`; not-for-patient-treatment banner сохранять.
- Не менять клинические значения по одному вторичному учебнику без дозовой основы первичного fit.
- Не выдавать опубликованные risk points за индивидуальный NTCP.
- Не терять целевой контур (Sahgal thecal sac vs true cord; Milano brain including target; Miften spared liver VleX vs D700cc) и source time patterns (RCR BID, alternate-day, SIB/sequential).
- Не объявлять 11 новых режимов уже реализованными; это source-verified предложения для будущей библиотеки.
- Не загружать авторские PDF в публичный GitHub.

## 4. Основные ссылки

- [P6.1 Royce/Ohri](P6_1_ROYCE_OHRI_PRIMARY_SOURCE_DISCREPANCY_2026-10-19_RU.md)
- [P6.2b загрузка и бинарная сверка](P6_2B_SOURCE_BINARY_RECONCILIATION_2026-11-01_RU.md)
- [P6.2c α/β первичные публикации](P6_2C_PRIMARY_ALPHA_BETA_30_RECORD_AUDIT_2026-11-01_RU.md)
- [P6.2d BCR secondary](P6_2D_BCR2025_14_ADDITIONAL_ALPHA_BETA_REVIEW_2026-11-01_RU.md)
- [P6.2e/f T½ и Dprolif](P6_2E_F_REPAIR_REPOP_SOURCE_DOSE_BASIS_2026-11-01_RU.md)
- [P6.2g 29 OAR](P6_2G_29_HYTEC_OAR_PRIMARY_SOURCE_AUDIT_2026-11-02_RU.md)
- [P6.2h 9 models/40 points](P6_2H_9_OUTCOME_40_POINT_PRIMARY_PROVENANCE_2026-11-02_RU.md)
- [P6.2i 29 RCR](P6_2I_RCR2024_REGIMEN_29_PRIMARY_SOURCE_AUDIT_2026-11-06_RU.md)
- [P6.3 source parameters](P6_3_REPAIR_REPOPULATION_SCIENTIFIC_AUDIT_2026-10-19_RU.md)
- [P6.3b source dose basis](P6_3B_PRIMARY_DOSE_BASIS_QUALIFICATION_2026-10-19_RU.md)
