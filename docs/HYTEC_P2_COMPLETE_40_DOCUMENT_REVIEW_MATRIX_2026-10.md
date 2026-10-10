# P2 — 40 исходных HyTEC-документов: контроль полноты постраничного научного аудита

**Дата составления: 9 октября 2026, рабочее дополнение к PR #60.** Машиночитаемый реестр: [HYTEC_P2_COMPLETE_40_DOCUMENT_REVIEW_MATRIX_2026-10.csv](HYTEC_P2_COMPLETE_40_DOCUMENT_REVIEW_MATRIX_2026-10.csv). Список **создан из реального `LITERATURE_MASTER_INVENTORY.json`** той же ревизии и содержит 40 исходных объектов: **20 core, 15 supplements, 5 letters**.

## Принцип достоверности отметок

- `extracted_text_screening`: для **15 supplements и 5 letters** извлечённый текст прочитан в предыдущих проходах; это **не** означает постраничную проверку всех embedded figures, scanned graphs, перепечатанных таблиц или byte-identical файла. Для **20 core** ранее проверены первая страница, и в отдельных предметных блоках — выбранные таблицы/рисунки/параметры.
- `selected_primary_values_or_figures_reviewed`: для core с отдельными source-audit отчётами указывает выполненную *выборочную* сверку. Это не полный постраничный scientific review.
- `all_pages_figures_tables_verified=NO` во всех 40 строках. **Нельзя превращать наличие локальной библиографической ссылки, одно проверенное уравнение или зелёный CI в подтверждение всех figures/tables статьи.**
- `all_source_model_CI_independently_reproduced=NO_FULL_INDEPENDENT_MODEL_CI_QA`: проверки 23 fit points + 8 approx points из [73 source-value ledger](HYTEC_P2_RECORD_LEVEL_LEDGER_2026-10.md) **не** эквивалентны независимому восстановлению fitted confidence bands, всех covariance matrix, популяции, цензурирования и каждой цифры приложения.
- `uploaded_original_SHA256_verified=NO`: в архиве/Library нет подтверждённой байтовой оригинальной копии, поэтому даже совпадение DOI публичного PDF не считается пофайловым audit.
- Для писем №21–25 отсутствие отдельного `source_id` в численном коде — ожидаемо: это scientific correspondence, влияющее на интерпретацию и допущения, но **не** дополнительный клинический коэффициент.

## Проводимая верификация конкретного документа: №02 Moiseenko

По первичному пользовательскому PDF и supplement просмотрен **полный извлечённый текст**, а также **изображения PDF pp5–7 Fig2/Fig3/Fig4**. [Отдельный исходный научный отчёт по моделированию неопределённостей](HYTEC_P2_MOISEENKO_UQ_AUDIT_2026-10.md) и [исполняемый unit-regression](../tests/hytecMoiseenkoUncertaintySemantics.test.ts) фиксируют различие **profile-likelihood parameter 95% CI**, **bootstrap parameter 95% CI** и **joint dose-response 95% prediction bands** (n96, events13, 2000 bootstraps). Важно, что `MLD50=6.06Gy` здесь **методический пример, а не новый лимит риска**, а независимое сочетание границ CI для параметров некорректно. В матрице первичная `HyTEC_02` теперь получила особую отметку выборочной визуальной проверки `selected_Fig2_Fig3_Fig4_visual_CI_reviewed`, но **не** полноты каждого изображения и всех исходных формул. Поэтому `all_pages_figures_tables_verified=NO` для неё сохраняется.

## Самый высокий приоритет оставшегося P2

1. **Royce 19** — авторская статья Eq.2/Table3/Fig1 и опубликованные письма 2025. Точное расхождение и открытые запросы сохранены в [P2 fitted audit](HYTEC_P2_FITTED_MODEL_REPRODUCTION_2026-10.md) и [документе статуса обращения к авторам](HYTEC_P2_ROYCE_2025_CORRESPONDENCE_GATE_2026-10.md). Ответ авторов **существует**, но его содержимое **не было получено**: нельзя предполагать исправление `D50` или `γ` без ответа.
2. **Milano brain 06 / optic 07 / Redmond 05** — добрать оригинальные составные фигуры EA, геометрию target-inclusive/target-exclusive, размер опухолей, endpoint-specific CI, reirradiation eligibility; не смешивать source predicted risks и clinical thresholds.
3. **Sahgal 10 / Grimm 12 / Kong 14 / Miften 16** — различие cord/thecal sac, Dmax/D0.5cc, bilateral-minus-GTV/IGTV, normal liver-minus-GTV и `rV15/17` как объёма *ниже* порога. Проверить невоспроизведённые 95% confidence bands, cohort numerators и таблицы протоколов.
4. **Остальные 20 primary и 15 supplements** — последовательная полная проверка каждого `Table/Figure/Equation`, а не только record IDs, из которых извлекались клинические ограничения. Базовые conceptual primary №01/02/03/04 с нулём clinical evidence records тоже требуют проверки: модельные оговорки и физические допущения могут влиять на границы применения HFC.
5. **5 letters** — завершить cross-reference DOI оригиналов, полный фигуральный/табличный контекст и связь каждого возражения с исправляемым или оставляемым допущением.

## Критерий закрытия каждой строки (пока не достигнут)

Для документа `i` заполнить `page_count + binary_sha256 + source DOI + all clinical Table/Figure/Equation page locators + extracted numeric values and 95% CI + result of independent reproduction or explicit nonapplicability + cohort/structure/fraction/endpoint semantics + discrepancies/issues + checker + second-review signoff`. До завершения требуемых полей исходный документ не менять на `verified`. Итоговая марка **P2 scientifically complete** требует 40/40 строк с такими полями *либо* документированным отсутствием/исключением конкретного элемента с решением научного рецензента.

См. [общие gates P1/P2/P3](HFC_SCIENTIFIC_PHASE_GATE_2026-10.md). **P3 полной 103-record базы готов к началу после P2, но ещё не завершён; P4 / release candidate заблокированы.**

## Проверка обратного соответствия

[Автотест матрицы](../tests/hytec40DocumentReviewMatrix.test.ts) проверяет: точное множество 40 уникальных имён из JSON inventory, состав 20/15/5, 40 явных пометок неполной визуальной/CI/архивной верификации. Если документ пропадёт из реестра или отдельный прогресс будет ошибочно объявлен полным, CI должен это обнаружить — до осознанного обновления научного статуса.
