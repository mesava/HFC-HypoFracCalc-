# HFC — HyTEC Full Scientific Audit (P2 working report, 2026-10-08)

> **СТАТУС: В РАБОТЕ / НЕ ПОЛНЫЙ НАУЧНЫЙ АУДИТ.** Заголовок файла соответствует конечному deliverable ТЗ, но ниже документируется только то, что действительно проверено. Клиническое commissioning и независимое второе review не проводились. База `develop` `08fff483c659c6d6d93a4cf5bd96eb0248ec5316`.

## Объём текущего прохода

- Из 40 файлов HyTEC проверены первые страницы всех **20 primary**; извлечённый текст **всех 15 supplements и 5 letters** теперь прочитан (включая продолжения двух длинных приложений). Все числовые таблицы и графики **визуально и запись за записью не сверены**; полное содержание 20 primary тоже ещё не прошло сквозной постраничный аудит.
- DOI для 20 primary извлечены с первых страниц; библиография сопоставлена с `sources.ts`. Использована ранее опубликованная матрица `docs/HYTEC_SOURCE_COVERAGE_2026-10.md` как карта, но **не как доказательство численной валидации**.
- **Независимо повторно прочитаны научные фрагменты из пяти primary:** Redmond, Milano brain, Milano optic, Sahgal spinal, Mahadevan pancreas. Для остальных представлены прежние выборочные результаты с меткой «прежний crosscheck», не «полностью проверено».
- Приложения теперь просмотрены по тексту, но числовые fits/CI, объёмы, модельные графики, исходные когорты и полный набор `103 evidence records` ещё не прошли индивидуальную независимую проверку.
- `tests/uploadedPrimarySourceRegression.test.ts` расширен на pooled spinal TCP из приложения Soltys и семантику brain-plus-target; предыдущий CI PR №60 до изменения прошёл успешно. CI нового commit требуется подтвердить отдельно; независимое клиническое commissioning не проводилось.

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
| P2-M03 | Major | Текст 15/15 supplements и 5/5 letters теперь просмотрен, но числовые таблицы, изображения и все переносимые данные не валидированы визуально/по записям | Постраничная визуальная проверка + ledger, особенно Milano brain, Redmond EA4, Kong, Ohri–Klement |
| P2-M04 | Major | В Vargo H&N D50 исходные 95% CI задокументированы в prior crosscheck, но не являются полями OutcomeModel, которые UI может показать рядом с оценкой | Проанализировать схему OutcomeModel и способ показывать uncertainty, без добавления непрерывных коэффициентов |
| P2-m05 | Minor | `evidenceCutoffDate=2026-10-07`, при этом 4 контекстные библиографические записи были зарегистрированы позднее; не ясна политика bibliography-only updates | Утвердить отдельно cutoff для численных evidence и дату ревизии библиографии, не подменять версию dataset |
| P2-I06 | Informational | Optic модельные <1% при 12 Gy/1fx отличаются от авторской рекомендованной границы 10 Gy/1fx | Сохранять оба контекста, не повышать Dmax по кривой |
| P2-I07 | Informational | Пункты LC/RN, извлечённые из таблиц, не доказывают пригодность непрерывной TCP/NTCP модели вне обучающей популяции | Оставить discrete/source-specific points, запретить скрытую интерполяцию |

**Confirmed wrong clinical coefficients (this pass): 0.** Это не значит, что все коэффициенты корректны: пока недостаточно проверено для такого вывода. Численные параметры приложения не изменялись.

## Этап P2.2: дополнения и научная корреспонденция (новая проверка)

Подробный [отчёт 15/15 supplements + 5/5 letters, Soltys spine logistic и семантика V12](HYTEC_P2_SUPPLEMENT_AND_LETTER_REVIEW_2026-10.md).

**Независимый расчёт по Soltys spinal metastases Supplement Table 1**: `n=2606`, `D50=19.44 Gy (18.07–20.53)`, `γ50=0.8140 (0.6594–0.9741)`, `α/β=6 Gy`, доза на оси — **3-fraction-equivalent**, а не физическая доза в произвольных фракциях. Для восьми сохранённых приблизительных HFC-точек разница с математическим pooled fit составляет от 0.01 до **1.70 п.п.**; наибольшая при 20 Gy/1fx (HFC ≈90%, fit 88.30%). Это не доказанная численная ошибка: требуется дополнительно установить правила опубликованного округления в основном тексте. `40 Gy/5fx` остаётся extrapolated. Добавлен регрессионный тест независимого расчёта и тест на target-inclusive V12/V20/V24.

**Ключевые findings от новых PDF/DOC**:
1. Milano Fig E1–E3 смешивает *tissue V12* и *brain V12* (исключая мишень) с отдельными fit-исправлениями. Одного универсального `Vx` без contour semantics недостаточно для автоматического применения.
2. Redmond Supplemental EA1–EA3 рассчитывает **BED20**; не переносить fitted coefficients на BED10 без полноценной повторной модельной верификации.
3. Письма Ohri–Klement демонстрируют model-selection dispute для *primary liver*; HFC хранит две **стратифицированные категории метастазов печени**, а не универсальный fitted TCP.
4. Письмо Grimm et al. подчёркивает ограниченную переносимость LQ >≈10 Gy/fx и недопустимость далёкой экстраполяции вне опубликованных клинических областей.
5. Moiseenko Supplement E1: `MLD50=6.06 Gy` — иллюстрация sigmoid fitting, а не клинический лимит лёгкого.

**P2 остаётся открыт.** Значения клинических коэффициентов, dataset manifest, пользовательские пороги и auto-defaults не изменялись; не путать CI tests и независимое второе clinical review.

## P2.3: Индивидуальная карта происхождения HyTEC-значений и научные аннотации

Добавлены [73-строчный реестр](HYTEC_P2_RECORD_LEVEL_LEDGER_2026-10.csv) и [методическое пояснение](HYTEC_P2_RECORD_LEVEL_LEDGER_2026-10.md): **34** точки **восьми** OutcomeModel с источниками HyTEC, **6** точек девятой, отдельной Ohri 2012 NSCLC модели, **29** ClinicalConstraint и **4** отдельные reirradiation criteria. Таким образом, 73 записи в реестре: **67 связанных с HyTEC и 6 без предоставленного первичного Ohri 2012 PDF**. Наличие локального файла и страниц подтверждено; model fits, plots и CI построчно ещё не валидированы.

### Royce prostate TCP — подтверждённый недостающий маркер экстраполяции

В `HyTEC_19_Royce_2021_Prostate_TCP.pdf`, **PDF pp. 6–7, Figure 1 caption**, авторы указывают отсутствие в исследованных когортах EQD2 <≈80 Gy и не рекомендуют клинических выводов вне доступного интервала. При этом `prostate-lowint-90tcp` означает 71 Gy EQD2(α/β=1.5), ≈90% 5-year FFBR. **Числа не изменены**, только добавлены `extrapolated: true` и объяснение на основе source. Этот флаг выводится в UI как «экстраполяция». Дописан regression test. Одновременно сохраняется ограничение модели для high-risk cohorts (всего 85 пациентов в Figure 1).

### Miften liver SBRT — слабая статистическая поддержка модели риска

В `HyTEC_16_Miften_2021_Liver_dose-volume_effects.pdf`, **p.7 Fig.1**, модель probit токсичности liver enzymes grade≥3 vs MLD **не статистически значима (P=0.10)**, несмотря на то что авторы рекомендуют **QUANTEC** MLD objectives 13/18 Gy (primary liver 3/6fx) и 15/20 Gy (metastases 3/6fx) и предполагают риск <20% (PDF p.9). Во все четыре записи добавлена оговорка; **числа, тип planning-limit и risk relation оставлены без изменений**. Нет оснований объявлять эти пороги надёжным индивидуальным NTCP-предсказанием.

### Доказательность и завершение этапа

- `text_anchor_only_not_independently_fitted`: источник и место есть, но вся математика/CI/популяция не валидированы индивидуально;
- `primary_not_supplied`: шесть point records Ohri 2012 NSCLC не имеют предоставленного исходного PDF;
- `draft` и запрет на P4 остаются; ни одна корректировка probability/constraint, радиобиологического движка или клинического default не проводилась.
- После этого прохода имеются **три** явных point-level флага `extrapolated`: vestibular 10Gy/1fx, spinal mets 40Gy/5fx, prostate low-intermediate 71 Gy EQD2.

## P2.4 — независимое математическое воспроизведение HyTEC и критическое противоречие Royce

Полный [source-parameter audit](HYTEC_P2_FITTED_MODEL_REPRODUCTION_2026-10.md) и исполняемые [тесты](../tests/hytecFittedModelsIndependent.test.ts).

- **Grimm, H&N сосуды:** pooled logistic TD50=45.7 Gy, γ50=1.1817 даёт риск grade 3–5 BE **1.9723% при Dmax 20 Gy** и **12.0308% при 30 Gy**, воспроизводя 2/2 числовые risk points HFC. Нельзя смешивать с отдельно рекомендованным `D0.5cc <20 Gy`.
- **Vargo, H&N TCP:** logistic D50/γ50 из Table 4 для 1/2/3-year local control воспроизводят **6/6** HFC approximate values с отклонением менее **0.07 п.п.**; 1-year fit статистически слабый.
- **Stumpf, adrenal TCP:** опубликованная Poisson-модель при `BED10=116.4 Gy` и `EQD2_10=97.0 Gy` даёт **94.9809%**, фактически ≈95%, HFC сохраняет формулировку авторов `>95%` без изобретения значащих цифр. 95% CI относится к параметрам и/или fit, а не к универсальному порогу.
- **Royce, prostate:** оригинальная типографская `Eq.2` и `Table 3` визуально сверены с публичным PDF AAPM. Для low/intermediate-risk `D50=20.6 Gy`, `γ=0.15`, `TCP = 2^{−exp[eγ(1−EQD2/D50)]}` дают **77.44% при EQD2=71 Gy и 83.90% при EQD2=90 Gy**, а авторы пишут **90% и 95%**. Разница **−12.56 и −11.10 процентных пункта**. Тот же расчёт с high-risk параметрами `D50=84.2, γ=4.50` даёт 89.77% при 97 Gy и 94.91% при 102 Gy — согласуется с авторскими 90%/95%. Это **Critical P2-C21**, не отсутствие навыка программирования и не основание изменить опубликованные значения HFC.
- **Научная переписка 2025 года:** Quan Chen, DOI `10.1016/j.ijrobp.2025.06.3898`, опубликованная критика параметров low/intermediate Royce; ответ Mavroidis/Royce/Chen, DOI `10.1016/j.ijrobp.2025.06.3899`, существует, но его **полный текст ещё не получен**. Установить содержание ответа — обязательное действие перед решением о корректировках. Возможность corrigendum не доказана.
- Оба low/intermediate пункта HFC оставлены со значениями статьи и пометкой `unresolved source-level mismatch` в данных; пользовательские страницы выдают **двуязычное предупреждение**. Никаких непрерывных TCP/NTCP-моделей не включено; evidence остаётся `draft`.

**Невыполнено:** восстановление исходной ML fit по patient/study data, covariance и 95% confidence bands, проверка ещё не аудированных endpoint-моделей, 2025 ответ авторов и независимый clinical review.

## P2.5 — Redmond brain TCP и Milano brain NTCP / семантика контуров

**Детальный отчёт:** [HYTEC_P2_REDMOND_MILANO_AUDIT_2026-10.md](HYTEC_P2_REDMOND_MILANO_AUDIT_2026-10.md), [регрессионные тесты](../tests/hytecRedmondMilanoRegression.test.ts), [обновлённый 73-строчный ledger](HYTEC_P2_RECORD_LEVEL_LEDGER_2026-10.csv).

**Redmond et al. 2021**, PDF supplemental **Table EA4 pp.8–9**: для 1-year LC/1–5fx по размеру (small/medium/large) `TD50` 11.21/12.44/9.15 Gy SFED20, `g50` 0.9749/0.7617/0.4089. Лог-логистическое `P=1/(1+(TD50/D_SFED20)^(4*g50))` при однократных дозах воспроизводит четыре HFC brain-metastasis point values: **86.37%** vs >85% (18 Gy, ≤20mm), **95.11%** vs ≈95% (24 Gy, ≤20mm), **75.50%** vs ≈75% (18 Gy, 21–30mm), **69.18%** vs ≈69% (15 Gy, 31–40mm). Максимальная разница с указанной границей/округлённым процентом 1.38 п.п. **Все числа в HFC сохранены**. Отличие `1-year` от `2-year` моделей и применение `SFED20` отдельно защищены тестом. Исходный supplemental PDF доступен для текстового просмотра, но его **визуальное изображение page 8–9 недоступно**; нельзя выдавать эту стадию за visual QA или joint-CI reconstruction.

**Milano et al. 2021**, PDF pp.4–5 и **page 12, Table 3** (страница проверена визуально): Table 3 содержит четыре отдельные модели: `any necrosis` V12 5cc **3.6%** (Chin/Inoue/Peng) versus **19.6%** (Korytko), `any necrosis` V14 5cc **4.1%** и `grade 3 requiring resection` V14 5cc **0.4%**. ЭТО НЕ 10% симптоматического радионекроза из pooled abstract / summary V12=5cc. Между volume semantics `tissue Vx including target` и `brain-minus-GTV/PTV`, а также endpoints `any` / `symptomatic` / `resection` нельзя ставить знак равенства. Семь Milano HyTEC-risk records проверены на правильный endpoint, 3fx/5fx и target-inclusive notes; **не все их числовые fitted estimates независимо реконструированы**. Показано новое двуязычное предупреждение в интерфейсе с браузерным тестом.

В 73-row ledger P2 теперь: **15 fitted anchor reproduced; 8 rounded pooled fit checked; 2 unresolved source discrepancy Royce; 7 Milano endpoint/contour checked but no fit; 35 primary text locator only; 6 primary Ohri 2012 missing**. P2 ещё не закрыт; коэффициенты и клинические пороги не изменены, стадия остаётся `draft`.

## P2.6 — моделирование Milano: 9 значений Table 3 и визуальная QA Fig. 5/6

Клинический смысл и независимый расчёт документированы в [P2.5 Redmond/Milano](HYTEC_P2_REDMOND_MILANO_AUDIT_2026-10.md), [9-строчном отдельном provenance CSV](HYTEC_P2_MILANO_FIT_REPRODUCTION_2026-10.csv) и [Vitest](../tests/hytecRedmondMilanoRegression.test.ts).

Визуально сверены **оригинальные PDF-страницы 7, 8, 11, 12** Milano 2021 (печатные стр. 74, 75, 78, 79), включая **Eq. (3)**, Fig. 5, Fig. 6A/B, Table 2 и Table 3. Для моделей V12/V14 использовано экспоненциальное логистическое выражение `P=1/[1+exp(-4γ50(V/V50-1))]`; оно **не совпадает** с `log(V)`-моделью ранее опубликованных Fig. 1–4. Не использовать `V50` как дозу в Гр — параметр имеет размерность **см³**, а `V` есть объём ткани, содержащий мишень.

- **Fig. 5 V12 (grade 1–3 edema/necrosis)**: `V50=63.2 cm³ (95% CI 49.2–97.0)`, `γ50=.87 (0.74–1.03)`; опубликованы 3,6/4,8/8,6% для `V=5/10/20 cm³`, численно воспроизведены **3,899/5,072/8,481%** (макс. отличие 0,299 п.п.).
- **Fig. 6A V14 (grade 1–3 edema/necrosis)**: `V50=45.8 (33.0–106.2) cm³`, `γ50=.88 (.68–1.11)`; 4,1/6,0/12,1% → **4,166/6,001/12,101%**, макс. 0,066 п.п.
- **Fig. 6B V14 (grade 3 surgery-required pathology-confirmed necrosis)**: `V50=42.6 (33.8–75.5) cm³`, `γ50=1.58 (1.17–2.09)`; 0,4/0,8/3,4% → **0,377/0,787/3,380%**, макс. 0,024 п.п.

**9 из 9** source-model/table combinations совместимы с округлёнными результатами; Fig. 5 нельзя объявить точным совпадением (до **0,30 п.п.**). Исключённая авторами из pooled Fig.5 когорта **Korytko** имеет собственные 19,6/25,8/41,5% и **не может быть объединена** с другим fit. Модель Fig. 6B опирается на иной клинический endpoint, чем Fig. 6A. Отдельно подтверждены исходные эквивалентности V12 1fx → V19.6 3fx/V24.4 5fx и V14 1fx → V23.1 3fx/V28.8 5fx по LQ **α/β=2 Гр** при округлении, без переноса с `brain+target` на `brain−target`.

**Эти девять точек — новый отдельный АУДИТОРСКИЙ реестр, НЕ новые девять clinical constraints и НЕ увеличение 73-строчного реестра уже реализованных HFC evidence records.** Для семи действующих Milano `ClinicalConstraint` проверена семантика исхода/объёма, но индивидуальные значения не были автоматически получены из Fig5/6: 10/15/20%-symptomatic В12 происходит из другого анализа источника. **Ни одна точка HFC, клинический порог или коэффициент не изменены.** Не сделано re-fitting, CI response bands, независимое комиссионирование. PR №60 остаётся draft.

**Royce 2025:** повторный поиск DOI **10.1016/j.ijrobp.2025.06.3899** подтвердил научный ответ Mavroidis/Royce/Chen по PubMed, но полного текста в проверенных источниках не получил (publisher 403/paywall). Блокер `P2-C21` не закрыт и не заменён предполагаемым коэффициентом.

## P2.7 — Milano optic pathways RION: probit model + клинические Dmax-рекомендации

Отчёт [HYTEC_P2_OPTIC_RION_REPRODUCTION_2026-10.md](HYTEC_P2_OPTIC_RION_REPRODUCTION_2026-10.md), [Vitest regression](../tests/hytecOpticRionReproduction.test.ts). Исходный пользовательский файл `HyTEC_07_Milano_2021_Optic_pathways_tolerance.pdf` не дал читаемого text index, поэтому использован **публичный AAPM original author PDF** (pp6/9; Table3 p9 проверена визуально) и проверено совпадение с опубликованной статьёй DOI 10.1016/j.ijrobp.2018.01.053; не выдавать отдельную early PDF за пофайлово верифицированный локальный PDF.

**Probit model** on `EQD2_(α/β=1.6 Gy)` с `TD50=157.3 Gy` (95% formal parameter CI 157.2–157.4), `γ50=1.31` (1.30–1.32) независимо воспроизводит Table3 pooled **1%/2%/5% risk EQD2 ≈46.0/59.1/79.0 Gy**. В модели 1% при **12.1 Gy/1fx, 20.0 Gy/3fx, 25.1 Gy/5fx**. Однако **отдельная 1fx-only модель** показывает 1% при **10 Gy/1fx** (EQD2 32.2 Gy), и **клиническая рекомендация авторов — Dmax 10/20/25 Gy** при 1/3/5 фракциях соответственно, только если optic nerve/chiasm **не облучались ранее**. Это защищено unit/regression и явным двуязычным предупреждением на сайте. Менять 10→12.1 недопустимо.

Предшествующая RT повышает исходный RION риск примерно в 10 раз в **грубом объединённом анализе**, но источник прямо отказывается от точных NTCP и Dmax рекомендаций для reirradiation. Запрещено автоматически переносить 10/20/25 на ранее облучённый зрительный нерв или использовать `10×` как индивидуальный множитель дозы/NTCP. Точный `α/β=1.6` — **только параметр источника, не новый HFC default**. Заявленные формально крайне узкие CI двух модельных параметров не доказывают узкую неопределённость риска для пациента.

На уровне 73-строчного ledger три optic records переведены из «source anchor only» в «source-recommended threshold and pooled fit checked»; общий счёт не меняется: **15 reproduced source-model anchors, 8 rounded-fit, 2 Royce conflict, 7 Milano brain semantically checked, 3 optic Dmax separately checked, 32 unverified beyond locators, 6 missing original**. Стадия P2 не завершена, P4 и выпуск остаются заблокированы.

## P2.8 — Sahgal spinal cord: Table 3 / Table 4 и клинически критичные семантические границы

**Подробный [научный отчёт P2.8](HYTEC_P2_SAHGAL_SPINAL_AUDIT_2026-10.md)**, [25 ячеек оригинальной Table 4 — CSV](HYTEC_P2_SAHGAL_TABLE4_EQD2_LEDGER_2026-10.csv), [source test](../tests/hytecSahgalSpinalSourceConsistency.test.ts), [интеграционный тест HyTEC reirradiation](../tests/reirradiationGuidance.test.ts). Визуально проверены исходные **PDF p8 (Table 3)** и **PDF p11 (Table 4)**, DOI 10.1016/j.ijrobp.2019.09.038.

**De novo, 5/5 имеющихся risk-point records:** Table 3 содержит раздельные `Sahgal / thecal sac` Dmax 12.4/17.0/20.3/23.0/25.3Gy и `Katsoulakis–Gibbs / true cord` 14.0/19.3/23.1/26.2/28.8Gy при 1–5fx. Для 2–5fx верхние KG значения по сноске Table3 являются **LQ-экстраполяцией** от 14Gy/1fx, а **не независимо рекомендованными** пределами для thecal sac. Пересчёт `EQD2_2=D*(D/n+2)/4` даёт ~44.5Gy для нижней колонки и ~56.0Gy для верхней (разброс до ~0.21Gy EQD2 вследствие округления). `1–5%` — размах приблизительных оценок разных моделей, **не CI**. Дополнены source notes и видимое двуязычное предупреждение UI; исходные численные данные не менялись.

**Reirradiation, 4/4 lower-risk criteria records:** 4 фактора из раздела 7 исходника `thecal sac EQD2_2 cumulative≤70Gy`, `current≤25Gy`, `current/cumulative≤.5`, `interval≥5 mo` проверены против имеющегося workflow; подтверждение `thecal-sac Dmax`, `α/β=2` и отсутствие time-recovery discount сохранены. Все **25 ячеек Table4** (22 напечатанные дозы + 3 `N/A`) занесены в отдельный CSV и условно пересчитаны. Например, **если** физические 50Gy/25fx прошлого курса отражали настоящий `thecal-sac Dmax`, то указанное авторами в Table4 повторное 14Gy/3fx суммарно даёт **73,333Gy EQD2₂**, выше независимого lower-risk фактора 70Gy. При этом **Table4 prior RT prescription и реальный прежний thecal-sac Dmax не обязаны совпадать** — обнаруженное расхождение **не подтверждает ошибку авторов** и не является клиническим вердиктом; необходимы исходный DVH, геометрическая регистрация и фактическая доза. Физический пример из Table4 не переводится в `automatic safe pass`. Добавлены source regression + workflow integration test, двуязычное предупреждение в Reirradiation UI. Для `18Gy/5fx` текущий `EQD2_2=25.2`, и нельзя округлять исходные физические дозы перед сопоставлением с 25Gy.

**После прохода:** 9 ранее существовавших Sahgal records переведены из `locator-only` в специализированные статусы source-table / structure / software-math QA (5 de novo + 4 reirr). **Ledger по-прежнему 73:** 15 воспроизведённых исходных model points + 8 approximate Soltys + 2 unresolved Royce + 7 Milano brain semantics + 3 optic guidance+model + 9 Sahgal structural+math + 23 remaining primary anchor only + 6 Ohri2012 original not supplied. Эти статусы НЕ означают, что диапазоны риска, CI и истинные зависимости NTCP уже валидированы; выпуск и PR merge по-прежнему заблокированы.

## P2.9 — Kong lung SBRT: G2+ RILT, bilateral contour, ILD и Table 5 model heterogeneity

Первичный пользовательский Kong HyTEC 2021 (DOI 10.1016/j.ijrobp.2018.11.028, PDF 16p) и supplement 11p проверены по relevant тексту, таблицам и изображениям: Table3 p4, Fig1 p5, Fig3 p7, Table4 p8, Table5 pp11–12, Fig4 p13, supplemental S-Table3 p10. Полная визуальная QA Fig2 PDF p6 недоступна (текст доступен). Подробности: [P2.9 научный отчёт](HYTEC_P2_KONG_LUNG_AUDIT_2026-10.md), [audit-only two-source-probit comparison](HYTEC_P2_KONG_MODEL_HETEROGENEITY_2026-10.csv), [regression tests](../tests/hytecKongLungSourceRegression.test.ts).

**Два существующих HFC observational records** `MLD<8Gy` и `combined-lung V20<10–15%` соответствуют рекомендациям, но относятся к преимущественно **small peripheral tumor SBRT 3–5fx** и риску **symptomatic G2+ RILT** (пневмонит/фиброз), а не абсолютному индивидуальному безопасному NTCP. Обязательно совпадение `paired/bilateral lungs minus GTV` (или `IGTV` при free breathing 4DCT), а не `ipsilateral-only`, `lung−PTV` и `whole-lung including GTV`; Fig1 одного и того же плана даёт **7.7Gy ipsilateral-minus-GTV vs 4.6Gy bilateral-minus-GTV**. Наблюдения не доказывают универсальный 10–15% риск, и `V20<12%` из одного анализа не должен вытеснять source summary.

**ILD:** в Table4, endpoint G3–5 RP (не G2+ RILT), четыре исследования дают наблюдённые события при ILD **2/3, 9/13, 2/20, 9/28**, против без ILD **5/125, 2/104, 2/137, 10/476**; диапазоны сильно неоднородны и не пригодны для универсального ILD risk multiplier. **Table5:** source-specific `Ong n18 combined-minus-PTV MLD D50=7.9Gy γ50=4.85` против `Borst combined-minus-GTV D50=14.9Gy γ50=.82` создают *разные* расчетные probit risk при одном условном MLD8Gy; они **не** HFC clinical NTCP. Отдельный S-Table3 описывает protocol-specific RTOG trial metrics, не общие Kong рекомендации.

**Программные последствия:** два Kong records дополнены точной population/applicability provenance; source risk/doses не менялись. Добавлено RU/EN clinical caution в `ClinicalConstraintsView` и Playwright тест. Новые unit-тесты проверяют contour effect, четыре ILD cohorts, независимые single-cohort fits и отсутствие несанкционированной трансформации наблюдательных порогов. Два source-record ID получили статус `source_document_figure_endpoint_scope_checked_nonuniversal` вместо locator-only.

**Итого 73 реализованные записи по окончании этого прохода:** 15 fit reproduced, 8 rounded fit, 2 Royce conflict, 7 Milano brain endpoint/contour, 3 optic guideline/probit, 9 Sahgal structural/arithmetic, **2 Kong scope/figure audited**, 21 source-locator only и 6 Ohri2012 original missing. Независимой реконструкции risk confidence bands, individual lung DVHs и source-level universal fit нет; dataset остаётся draft, P2 незавершён.

## P2.10–P2.11 — Soltys vestibular LQ и Mahadevan pancreas

**Soltys vestibular 2021**: [source model report](HYTEC_P2_SOLTYS_VESTIBULAR_AUDIT_2026-10.md), [unit regression](../tests/hytecVestibularSoltysReproduction.test.ts). По исходному пользовательскому PDF p5 Fig1, p7 Eq(1–2), p8 Fig2, p9 Table3, supplement E2/E3 воспроизведены **6/6** HFC LQ точек 3–5y TCP в пределах **0,057 процентного пункта**. Source fit: `α/β=12.4Gy (95% CI 9–19.3)`, `EQD2_50=3.48Gy (3.15–4.08)`, `γ50=.1446 (.122–.17)`; `TCP=exp(-ln2*exp((2γ50/ln2)*(1−EQD2/EQD2_50)))`. Публикационная `TCP(0)=30%` — *псевдоточка с весом*, не фиксированный пересекающий точку fit (при EQD2=0 функция ≈34,923%). 10Gy/1fx экстраполирован ниже анализируемого диапазона; исключены **NF2** и repeat-SRS. Альтернативный **LQ-L** fit (`α/β=2.97Gy`) даёт другие TCP, его коэффициенты не переносились в HFC. Источник объединяет 3y/5y endpoints и имеет невысокое качество исходных DVH. Добавлены RU/EN предупреждение в интерфейсе и browser QA без изменения численных значений.

**Mahadevan pancreas 2021**: [source model report](HYTEC_P2_MAHADEVAN_PANCREAS_AUDIT_2026-10.md), [unit regression](../tests/hytecMahadevanPancreasSourceRegression.test.ts). Пользовательский original PDF p6 Fig1, p7 Table2/функция, p8 клинические выводы, приложение E1 сверены. **Unresected 2/2** HFC точки независимо воспроизведены из опубликованной `TCP=1/(1+(D50/D3eq)^(4γ50))`, `α/β=10Gy`, `D50=17.6Gy (95% CI 8.8–21.5)`, `γ50=.64 (.27–1.02)`: `33Gy/5fx -> D3eq=28.225Gy -> 77.014%` и `36Gy/3fx -> 86.200%`. Третья HFC запись относится к **R0 resection** и **не derived из этой логистической кривой**: source Table2 сообщает округлённые **90%**, prose сообщает **>90%**, три R0-серии имеют weighted average ≈96%. Не изменять `>` или клиническую точку до независимого научного разрешения precision/reporting differences; отдельный UI warning и browser test. В исходнике неодинаковое Kaplan–Meier time origin, selection/surgery bias и OAR/target movement; joint clinical CI не reconstructed.

**Обновлённый 73-row HFC ledger:** **23 reproduced source fits, 8 approximate, 2 Royce unresolved, 7 Milano brain semantic, 3 Milano optic source reviewed, 9 Sahgal structural/arithmetic, 2 Kong scope-reviewed, 1 Mahadevan R0 averaged no-fit, 12 remaining source text only, 6 missing original Ohri2012**. Воспроизведение printed fit parameters не равно re-fit пациентских исходов/95%-band и не даёт разрешения на clinical release. Math engine, численные clinic entries и статус `draft` не менялись.

## P2.12 — Ohri liver SBRT: source-level BED10 strata and 3y KM versus 2y logistic model

Точный источник: Ohri et al. 2021 DOI 10.1016/j.ijrobp.2017.12.288. Файл пользовательской Library не удалось получить как readable text или rendered page, **поэтому открыт официальный DOI-идентичный оригинальный AAPM PDF**, https://www.aapm.org/pubs/protected_files/HyTEC/21/HyTEC_15_TCP_Liver.pdf, оригинальная PDF p5 Figure3 сверена визуально, текст PDF pp1–5 и Eq1/Fig4 — дополнительно по оригиналу. **Byte-to-byte сравнение двух PDF не выполнялось.** Отдельный [научный отчёт P2.12](HYTEC_P2_OHRI_LIVER_METASTASES_AUDIT_2026-10.md), [unit regression](../tests/hytecOhriLiverStrataSourceRegression.test.ts).

Две существующие HFC точки `BED10>100 Gy → 3y LC 93%` и `BED10≤100 Gy → 3y LC 65%` подтверждены как **стратифицированные Kaplan–Meier оценки по 141 и 149 очагам метастазов печени**, log-rank **P<.001**, n290. Данные источника — 13 включённых статей, n721 очаг/642 пациента, n431 первичных HCC+CCA (в 3y LC ~86%, сравнение по BED P=.972). Метастатические когорты преимущественно колоректальные (~56% очагов). Оценки **не формируют непрерывную 3y-TCP-кривую и не означают мгновенный скачок probability на пороге 100 Гр BED10**.

Тот же документ **публикует отдельный 2y fitted TCP(BED10) logistic**, source `TCD50=16 Gy`, `k=74 Gy`, прогнозы ~70/76/90% для BED10=80/100/180Gy и source bootstrap 5000; этот **двухлетний fit нельзя подменять трёхлетними группами**, и он не активирован в HFC. Упоминание отсутствия clear dose-response для первичных HCC/CCA не доказывает общей независимости TCP от дозы/размера; в публикации не были доступны individual tumour sizes, competing-risk подход не использован. Добавлены source provenance notes, RU/EN видимое предупреждение и Playwright+unit safeguards. Source ClinicalProbability data (93/65%) сохранены.

С учётом P2.10–P2.12 актуальный **73-record ledger**: **23 reproduced model points, 8 rounded approximate, 2 Royce contradicted, 7 Milano brain semantics, 3 optic fit/recommended, 9 Sahgal spine/reirr, 2 Kong lung source verified, 1 Mahadevan R0 group mean, 2 Ohri liver KM strata checked, 10 primary text locators not yet verified, 6 missing Ohri2012 primary**. P2 открыт; к 103 evidence full audit и клинической валидации ещё не приступали. Без изменения математического ядра или численных дозно-исходных данных.

## P2.13 — десять Miften/Wang/Grimm OAR records, source-guidance QA (08.10.2026)

**Отчёт:** [HYTEC_P2_MIFTEN_WANG_GRIMM_OAR_AUDIT_2026-10.md](HYTEC_P2_MIFTEN_WANG_GRIMM_OAR_AUDIT_2026-10.md), [исходные регрессионные тесты](../tests/hytecRemainingOarSourceAudit.test.ts), [бразуерные проверки](../e2e/hfc.constraints-v02.pw.ts). Официальные полнотекстовые AAPM статьи сравнивались по DOI; SHA исходных пользовательских PDF **не проверен**. Код не содержит новых клинических доз и не повышает доказательный статус этих ограничений до validated.

**Miften liver (6 записям присвоены source-reviewed статусы):** PDF Fig.1/Table3 p6–7, рекомендации p8. QUANTEC нормальная печень **Liver minus GTV**, mean dose primary lesions 3fx≤13Gy/6fx≤18Gy; liver metastases 3fx≤15Gy/6fx≤20Gy. Авторская **слабая non-significant probit** G3+ liver enzymes `17/288 events, D50=40.8Gy (25.5–∞), γ50=.95 (.58–1.44), P=.10` не валидирует четыре порога как индивидуальное NTCP. Модельные значения для физической MLD 13/15/18/20Gy ~5.23/6.61/9.16/11.24% приводятся **как арифметическая проверка fitted формулы, не пациентская вероятность**. Критерий `rV≤15/17Gy≥700cc` — обратный spared-volume **нормальная печень без GTV**, источник прямо не смог fitted его как самостоятельную dose-response; описанный `11/118≈9.3%` G3+ общих GI событий — **не** G3+ liver enzymes.

**Wang prostate (3 source-suggested записи):** PDF Conclusions и Table4: при SBRT ~35–40Gy за 4–5fx bladder **`V(Rx dose)<5–10 cc` (абсолютный объём в см³ при уровне предписанной физической дозы)**, urethra Dmax<38–42Gy, rectum Dmax<35–38Gy. Авторы **не** сообщают универсальную валидированную tolerable dose/NTCP-функцию для этих разных endpoints и методов описания объёмов; значение мочевого пузыря не означает «5–10Gy». Исходные `observational-threshold` сохранены.

**Grimm major vessels (1 source-suggested запись):** PDF Table2/Conclusions: `D0.5cc<20Gy` при head/neck SBRT reirradiation, **5fx**, при необходимости также уменьшить V20–30 и соблюдать неежедневное фракционирование. Эта рекомендованная `D0.5cc`-метрика **не равна** pooled `Dmax` модели, где `Dmax=20Gy` даёт ~2% G3–5 bleeding: отдельная модель `D0.5cc TD50=53.7Gy, γ50=.5756, n61, P=.182` не достигла значимости. Не назначать 2% при `D0.5cc=20Gy`. Последние три группы дополнены RU/EN UI context + source-unit и browser tests.

**Результат status-audit 73 существующих entries:** **23 source-fit-model anchors reproduced**, 8 approx, 2 Royce unresolved, 7 Milano brain endpoint/contour source-reviewed, 3 optic guidance, 9 Sahgal spinal, 2 Kong lung, 1 Mahadevan R0 study average, 2 Ohri metastases KM study strata, **4 Miften QUANTEC + 2 liver rVdose + 3 Wang + 1 Grimm guidance verified at source semantic level**, **0 locator-only**, **6 Ohri2012 NSCLC original primary not supplied**. Сумма категорий **73**. **Ноль locator-only не означает, что P2 завершён:** всё ещё не получены все PDF-изображения/поля, полный CI reconstruction/independent patient-level fitting, все 15 supplements и 5 correspondence визуально/таблично проверены, и сохраняется критическое source-disagreement Royce. Судебная оценка / clinical release заблокированы до независимого научно-клинического рецензирования.

**Важное различие с [103-record evidence matrix](EVIDENCE_103_SOURCE_FILE_MATRIX_2026-10.md):** цифра **73 здесь** — количество HyTEC-подобных *point/constraint/criterion записей*, из которых **67** имеют файлы в пользовательском пакете и **6** нет. В другой таблице цифра **73 из 103** означает количество всех категорий evidence, для source ID которых есть файл в комплекте (а **30** без). Совпадение «73» в двух разных выборках случайно, **это разные множества, их нельзя отождествлять**. Более широкий crosswalk нужен для P3.

## P2.14 — проверка полноты 40 HyTEC источников и 2025 Royce correspondence blocker

По исходному [P1 inventory JSON](LITERATURE_MASTER_INVENTORY.json) создан [40-document coverage CSV](HYTEC_P2_COMPLETE_40_DOCUMENT_REVIEW_MATRIX_2026-10.csv) и [инструкция по закрытию](HYTEC_P2_COMPLETE_40_DOCUMENT_REVIEW_MATRIX_2026-10.md). В матрице **20 core papers / 15 supplements / 5 letters**; для каждого сохраняются filename, DOI, source ID, выбранный научный отчёт, уже проведённый screening и отдельные явные `NO` для полной визуальной page/figure/table QA, независимой проверки **всех** исходных model CI и SHA256 оригиналов. Новый [Vitest regression](../tests/hytec40DocumentReviewMatrix.test.ts) сверяет точные 40 filenames с JSON inventory и предотвращает исчезновение source object без обновления матрицы. Эти поля описывают **незавершённую** работу: completion `0/40` на уровне всех требований, **не** `0/40` прочитанных текстов или отдельных математических проверок.

**Royce correspondence 2025:** подтверждены авторы/DOI/печатные страницы письма Chen `10.1016/j.ijrobp.2025.06.3898` и ответа Mavroidis–Royce–Chen `10.1016/j.ijrobp.2025.06.3899` через publisher TOC/PubMed; публичный excerpt письма указывает на low/intermediate fit discrepancy, однако полный ответ авторов **не получен** (публичный Red Journal fulltext ответил 403, ResearchGate предлагает Request PDF). Подробный [Royce full-text and author-questions gate](HYTEC_P2_ROYCE_2025_CORRESPONDENCE_GATE_2026-10.md). Нет оснований менять исходную таблицу `D50=20.6Gy, γ=0.15` на «исправленные» параметры по догадке; кодовый warning и 2 unresolved records сохранены. **P2-C21 остаётся Critical и OPEN.**

После P2.13 73 реализованные HyTEC и смежные clinical records имеют source-status и автоматическую проверку CSV. При этом 73-row point ledger, 40-file P2 coverage matrix и 103-record alpha/beta/repair/proliferation source matrix — **три самостоятельных множества**. Для P2 требуется закрыть оставшиеся полные file-level/CI/source-correction gates и второй clinical review; не выдавать окончание первичной классификации за завершение P2.

## P2.15 — Moiseenko dose-response modeling primer: source statistical confidence gates

По исходным пользовательским `HyTEC_02_Moiseenko_2021_Dose-response_modeling_primer.pdf` и `_supplement.docx` проверен полный доступный извлечённый текст и **оригинальные изображения основного PDF pp5–7 Fig2–4**. [Научный отчёт](HYTEC_P2_MOISEENKO_UQ_AUDIT_2026-10.md), [source regression](../tests/hytecMoiseenkoUncertaintySemantics.test.ts). Исходные данные методического примера n96, G2+ lung pneumonitis events13; logistic physical MLD50=6.06Gy, γ50=1.19; 95% profile likelihood marginal parameter CI для D50 5.05–9.04Gy и gamma .73–1.77, но 95% bootstrap parameter CI после **2000** реплик D50 5.20–8.70 и gamma .79–1.89. Значимость демонстрационного fitted association LRT: MLL=-31.41, LLnull=-38.07, 2ΔLL=13.32, p≈.0003. Эти числа **не NTCP tolerance HFC**.

**Строгое правило научной неопределённости**: CI отдельных fitted parameter values не являются joint model CI, а их декартово произведение по углам прямоугольника не является 95% confidence band для NTCP при дозе пациента; требуются **совместные fitted пары из bootstrap/likelihood** и оценка prediction quantiles на конкретной оси. Рисунки Fig3/4 прямо демонстрируют корреляцию и бананообразные формы joint parameter regions; Fig2 содержит отдельные 68%/95% model prediction bands. При отсутствии patient-level data нельзя подменять эти диапазоны независимым mixing lower/upper `D50` и `γ50` и объявлять в HFC риском с validated CI. Наличие significant fit не отменяет неопределённость и риск экстраполяции.

Публикация №02 переведена из отметки «только initial first page» в [40-file completion matrix](HYTEC_P2_COMPLETE_40_DOCUMENT_REVIEW_MATRIX_2026-10.csv) в `entire_extracted_text_screened_not_all_visual` с отдельным `selected_Fig2_Fig3_Fig4_visual_CI_reviewed`. **Это ещё не полная постраничная image/table QA**, поэтому P2 остаётся OPEN и численный механизм клинического сайта не затронут.

## Критерии закрытия P2

1. Для 20 primary завершено чтение всех релевантных страниц, figures/tables, методов и расшифровок endpoints.
2. Для 15 supplements и 5 letters завершена постраничная проверка с привязкой к статьям.
3. Каждый реализованный HyTEC value, fit, CI и restriction связан с DOI + PDF page + table/formula + проверенным independent calculation/точкой + test.
4. Подготовлен отдельный `Critical / Major / Minor / Informational` журнал с разрешением всех непроверенных high-risk случаев; independent clinical review ещё потребуется для снятия `draft`.
5. Пока P2 и P3 не оформлены как законченные отчёты, **P4 не начинать**. PR #55 не сливать; DICOM/voxel не трогать.

## Связанные документы

- [P1 полный пофайловый реестр](LITERATURE_MASTER_INVENTORY.md) и [CSV](LITERATURE_MASTER_INVENTORY.csv)
- [73-line P2 record-level ledger](HYTEC_P2_RECORD_LEVEL_LEDGER_2026-10.md) и [CSV](HYTEC_P2_RECORD_LEVEL_LEDGER_2026-10.csv)
- [Источник 103-record crosswalk](EVIDENCE_103_SOURCE_FILE_MATRIX_2026-10.md)
- [Прошлый выборочный численный crosscheck](SOURCE_NUMERICAL_CROSSCHECK_2026-10.md)
- [Недостающие 27 источников](PRIMARY_SOURCE_GAPS_2026-10.md)
