# HFC — HyTEC Full Scientific Audit (P2 working report, 2026-10-08)

> **СТАТУС: В РАБОТЕ / НЕ ПОЛНЫЙ НАУЧНЫЙ АУДИТ.** Заголовок файла соответствует конечному deliverable ТЗ, но ниже документируется только то, что действительно проверено. Клиническое commissioning и независимое второе review не проводились. База `develop` `08fff483c659c6d6d93a4cf5bd96eb0248ec5316`.

## Объём текущего прохода

- Из 40 файлов HyTEC доступны и прочитаны первые страницы всех **20 primary**; начальный текст 15 supplements и 5 letters также проверен. Полное содержимое 40/40 не прочитано по страницам (и не должно получать метку полного аудита).
- DOI для 20 primary извлечены с первых страниц; библиография сопоставлена с `sources.ts`. Использована ранее опубликованная матрица `docs/HYTEC_SOURCE_COVERAGE_2026-10.md` как карта, но **не как доказательство численной валидации**.
- **Независимо повторно прочитаны научные фрагменты из пяти primary:** Redmond, Milano brain, Milano optic, Sahgal spinal, Mahadevan pancreas. Для остальных представлены прежние выборочные результаты с меткой «прежний crosscheck», не «полностью проверено».
- Приложения, формулы fits, неопределённость, исходные когорты, внешние причины потерь пациентов и полный набор `103 evidence records` ещё не завершены.
- `tests/uploadedPrimarySourceRegression.test.ts` существует и содержит selected source assertions, но unit/browser/visual tests в рамках **этого PR не запускались** (проверка статуса GitHub checks потребуется при создании PR).

## P2 матрица всех 20 статей

| Публикация | Что содержит | Что реализовано | Проверено | Что отсутствует/не закрыто | Приоритет |
|---|---|---|---|---|---|
| 01 Grimm — Overview | Область программы HyTEC, типы конечных точек, обобщение доказательств | `sources.ts` как контекст | Проверены титул, авторы, DOI; численной модели для переноса нет | Методика доказательной базы, не клинический коэффициент | Информационный |
| 02 Moiseenko — Modeling primer | Dose–response fitting, статистическая неопределённость | Методическая ссылка | Титул и DOI проверены; численные примеры приложения не воспроизведены | Формулы, likelihood/CI, supplementary | Высокий |
| 03 Song — Biological principles | Механизмы SBRT/SRS, indirect cell death | Теория, без универсального множителя к LQ | Титул и DOI проверены | Отделить гипотезы от клинических fitting assumptions | Средний |
| 04 Marciscano — Immunomodulation | Иммуномодуляция; доклиническая и клиническая база | Контекст | Титул и DOI проверены | Supplement, отсутствие готовой patient-specific модели | Средний |
| 05 Redmond — Brain mets TCP | 1-летний LC по размеру очага, режимам дозирования | `hytec-brain-mets-1y-local-control`: 4 дозо-эффектных точки | Первично сверено PDF стр. 2 (журн. 54) с HFC: >85%, ≈95%, ≈75%, ≈69% | Table 3 (2y, actuarial) и supplementary; provenance для всех точек | Критический приоритет |
| 06 Milano — Brain radionecrosis | 1fx V12, 3fx V20, 5fx V24; риск RN | `hytec-brain-v12-*` и `hytec-brain-v20/v24-*` | Первично сверено PDF стр. 2 (журн. 69): V12 5/10/>15 см³ → ~10/15/20% symptomatic RN; V20/24 <20 см³ | Детальная геометрия объёма, определения RN и полный supplementary | Критический приоритет |
| 07 Milano — Optic pathways | RION, Dmax, исходное RT | `hytec-optic-dmax-*` | Первично сверено PDF стр. 2 (журн. 88): 10/20/25 Gy в 1/3/5 fx без prior RT | Моделируемые <1% при 12 Gy/1fx отделять от более строгой рекомендации; supplement | Критический приоритет |
| 08 Soltys — Vestibular schwannoma | 3–5-летний TCP, LQ/LQ-L альтернативы | `hytec-vestibular-schwannoma-3to5y-tcp` | Титул/DOI проверены; прежний точечный crosscheck (в этом проходе не повторён) | Фактические fitted coefficients/CI и 10 Gy как extrapolated | Высокий |
| 09 Soltys — Spine metastases | 2-летний LC/TCP при spine SBRT | `hytec-spinal-mets-2y-tcp` | Титул/DOI проверены; прежний точечный crosscheck | Endpoint definition, локальные риски и supplementary | Высокий |
| 10 Sahgal — Spinal cord | de novo RM tolerance и повторное SBRT, thecal sac | `hytec-spinal-cord-*`, reirradiation guidance | Первично сверено PDF стр. 1 (журн. 124): суммарный EQD2_2 Dmax ≤70 Gy, текущий ≤25 Gy, ratio ≤0.5, ≥5 мес; lower-risk factors | Не считать временное восстановление доказанным; перепроверить de novo dose/fx 1–5 | Критический приоритет |
| 11 Vargo — H&N reirradiation | Контроль рецидивов при повторном SBRT, D50 модели | `hytec-hn-reirradiation-local-control` | Титул/DOI проверены; существующий отчёт сверяет D50 2y/3y | Доверительные интервалы D50 в UI и полный fit provenance | Высокий |
| 12 Grimm — Carotid/vessels | Кровотечения при H&N SBRT retreatment | `hytec-major-vessel-*` | Титул/DOI проверены; ранее проверялся D0.5cc/пороговый контекст | Не превращать оценочные уровни в универсальную норму; supplement | Критический приоритет |
| 13 Lee — Stage-I NSCLC | LC/TCP, опухолевый размер и BED | `hytec-stage-i-nsclc-*` частично | Титул/DOI проверены; отдельный Ohri 2012 PDF отсутствует | Не выводить функцию от диаметра из нескольких точек; supplementary | Критический приоритет |
| 14 Kong — Lung parenchyma | RILT, MLD, V20, ILD | `hytec-lung-rilt-*` | Титул/DOI проверены; ранее выборочно MLD/V20 | Исходные cohorts/ILD/fractionation и supplementary | Высокий |
| 15 Ohri — Liver tumor LC | LC для первичных опухолей и метастазов, BED10 | `hytec-liver-metastases-bed10-local-control` | Титул/DOI проверены; ранее раздельные 93/65% 3-летнего LC | Модели, CI, комментарии Klement/Ohri | Высокий |
| 16 Miften — Liver DVH toxicity | RILD, normal liver MLD и volume constraints | `hytec-liver-*-mld-*` | Титул/DOI проверены; прежде выборочно 13/18 и 15/20 Gy | Отделить QUANTEC-derived context от собственных fitted constraints | Высокий |
| 17 Mahadevan — Pancreas | 1-летний LC, R0 и unresected, 3fx-equivalent | `hytec-pancreas-1y-local-control` | PDF стр. 2 (журн. 207) и независимый LQ пересчёт 33/5 → 28.225 Gy/3 ≈ 28.2 Gy; 77% / >90% | Сверить все fits, R0 cohort, неопределённость и приложение | Критический приоритет |
| 18 Stumpf — Adrenal | Контроль надпочечников при SBRT | `hytec-adrenal-metastases-1y-tcp` | Титул/DOI проверены; ранее выборочно BED10 около 116.4 Gy и >95% | Достоверность/уверенность fitted risk; stratification | Высокий |
| 19 Royce — Prostate TCP | 5-летний bPFS, риск-группы и SBRT EQD2 | `hytec-prostate-sbrt-5y-tcp` | Титул/DOI проверены; ранее выборочно пары EQD2 71/90 и 97/102 Gy | Раздельные low/intermediate/high cohorts, supplement, CI | Высокий |
| 20 Wang — Prostate toxicity | Bladder/urethra/rectum, toxicity range | `hytec-prostate-sbrt-*` constraints | Титул/DOI проверены; ранее сверялись только диапазоны | Supplement, endpoint, единицы, зависимость от техники и follow-up | Высокий |

## Независимая численная проверка: первичные страницы и отличие рисков от предписаний

### 05. Redmond et al., 2021, DOI 10.1016/j.ijrobp.2020.10.034

**PDF стр. 2 / журн. стр. 54 (Abstract):** размер очага ≤20 мм, 18 Gy/1 fx — **>85%**, 24 Gy/1 fx — **≈95%** LC за 1 год; 21–30 мм, 18 Gy/1 fx — ≈75%; 31–40 мм, 15 Gy/1 fx — ≈69%. В `hytec-brain-mets-1y-local-control` эти четыре точки присутствуют с сопоставимыми знаками вероятности. **Нельзя смешивать** с 2-летним actuarial LC в Table 3 этой же публикации. Перенос непрерывного fit по этим четырём значениям научно не обоснован.

### 06. Milano et al., 2021 (brain), DOI 10.1016/j.ijrobp.2020.08.013

**PDF стр. 2 / журн. стр. 69 (Abstract):** при однофракционной SRS для метастазов **V12 = 5, 10, >15 см³, включая target volume** соответствует ориентировочно 10%, 15%, 20% *symptomatic radionecrosis*. При 3-fx V20 или 5-fx V24 <20 см³ (brain plus target) приводились <10% any necrosis/edema и <4% necrosis requiring resection. В HFC они представлены как `risk-point`, а не универсальный `planning-limit`. При клиническом применении необходимо явно сохранять разницу между brain+target, brain−PTV и другими контурными соглашениями.

### 07. Milano et al., 2021 (optic), DOI 10.1016/j.ijrobp.2018.01.053

**PDF стр. 2 / журн. стр. 88 (Abstract):** при **отсутствии prior RT** предложены 10 Gy/1 fx, 20 Gy/3 fx, 25 Gy/5 fx как максимум дозы на зрительный аппарат. В статье также указан более высокий *модельный* уровень (<1% RION при 12 Gy/1 fx) в смешанном fit, однако авторская рекомендация остаётся 10 Gy/1 fx; эта разница правильно разъяснена в `constraintsHytec.ts`. После предшествующего облучения эти пороги автоматически применять нельзя.

### 10. Sahgal et al., 2021 (spinal cord), DOI 10.1016/j.ijrobp.2019.09.038

**PDF стр. 1 / журн. стр. 124 (Abstract):** ассоциированные с более низким риском миелопатии при повторном SBRT факторы: cumulative *thecal sac* Dmax EQD2 при α/β=2 Gy ≤70 Gy; current SBRT Dmax EQD2_2 ≤25 Gy; отношение current/cumulative ≤0.5; интервал ≥5 мес. Эти ограничения применяются **совместно как reported lower-risk factors**, а не как доказанная функция репарации от времени. HFC reirradiation guidance и существующий regression test содержат 70/25/0.5/5 с такими определениями. Не заменять thecal sac на anatomically contoured spinal cord без оговорки.

### 17. Mahadevan et al., 2021, DOI 10.1016/j.ijrobp.2020.11.017

**PDF стр. 2 / журн. стр. 207 (Abstract):** эквивалент 33 Gy/5 fx составляет ~28.2 Gy/3 fx при α/β=10 Gy, модельный 1y LC без операции ~77%; при R0 у сопоставимых EQD3 порогов >90%. Независимый расчёт классической LQ:

```text
BED10 = 5 × 6.6 × (1 + 6.6/10) = 54.78 Gy
Solve 3d × (1 + d/10) = 54.78 Gy
Equivalent total dose at 3 fractions: 28.225 Gy ≈ 28.2 Gy
```

Разница с округлённым опубликованным значением ≈0.025 Gy, согласуется с округлением. Это проверка эквивалентной дозы, **не независимая реконструкция 77% TCP model fit**.

## Приоритетный реестр расхождений / gap findings

| ID | Severity | Наблюдение | Следующее действие |
|---|---|---|---|
| P2-M01 | Major | 27 библиографических source IDs без прямых первичных файлов, 30 evidence records без локально загруженного первичного source | Получить или подтвердить каждый источник через DOI/оригинал, сохранить запись «не предоставлен» |
| P2-M02 | Major | Нет постраничного источника и воспроизводимого расчёта для каждого из 103 evidence records; отдельные historical validated-state не заменяют независимую проверку | Перейти к record-by-record verification ledger с PDF page/table, endpoint/CI и exact model form |
| P2-M03 | Major | 15 HyTEC supplements + 5 letters не проверены полностью; дискуссии могут содержать научно значимые caveats | Проверить приложения и научные ответы, особенно Ohri–Klement, Song–Brown–Grimm |
| P2-M04 | Major | В Vargo H&N D50 исходные 95% CI задокументированы в prior crosscheck, но не являются полями OutcomeModel, которые UI может показать рядом с оценкой | Проанализировать схему OutcomeModel и способ показывать uncertainty, без добавления непрерывных коэффициентов |
| P2-m05 | Minor | `evidenceCutoffDate=2026-10-07`, при этом 4 контекстные библиографические записи были зарегистрированы позднее; не ясна политика bibliography-only updates | Утвердить отдельно cutoff для численных evidence и дату ревизии библиографии, не подменять версию dataset |
| P2-I06 | Informational | Optic модельные <1% при 12 Gy/1fx отличаются от авторской рекомендованной границы 10 Gy/1fx | Сохранять оба контекста, не повышать Dmax по кривой |
| P2-I07 | Informational | Пункты LC/RN, извлечённые из таблиц, не доказывают пригодность непрерывной TCP/NTCP модели вне обучающей популяции | Оставить discrete/source-specific points, запретить скрытую интерполяцию |

**Confirmed wrong clinical coefficients (this pass): 0.** Это не значит, что все коэффициенты корректны: пока недостаточно проверено для такого вывода. Численные параметры приложения не изменялись.

## Критерии закрытия P2

1. Для 20 primary завершено чтение всех релевантных страниц, figures/tables, методов и расшифровок endpoints.
2. Для 15 supplements и 5 letters завершена постраничная проверка с привязкой к статьям.
3. Каждый реализованный HyTEC value, fit, CI и restriction связан с DOI + PDF page + table/formula + проверенным independent calculation/точкой + test.
4. Подготовлен отдельный `Critical / Major / Minor / Informational` журнал с разрешением всех непроверенных high-risk случаев; independent clinical review ещё потребуется для снятия `draft`.
5. Пока P2 и P3 не оформлены как законченные отчёты, **P4 не начинать**. PR #55 не сливать; DICOM/voxel не трогать.

## Связанные документы

- [P1 полный пофайловый реестр](LITERATURE_MASTER_INVENTORY.md) и [CSV](LITERATURE_MASTER_INVENTORY.csv)
- [Источник 103-record crosswalk](EVIDENCE_103_SOURCE_FILE_MATRIX_2026-10.md)
- [Прошлый выборочный численный crosscheck](SOURCE_NUMERICAL_CROSSCHECK_2026-10.md)
- [Недостающие 27 источников](PRIMARY_SOURCE_GAPS_2026-10.md)
