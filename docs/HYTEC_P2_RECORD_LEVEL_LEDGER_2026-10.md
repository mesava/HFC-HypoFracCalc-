# P2 — построчный реестр численных записей HyTEC и смежной модели (2026-10-08)

**Статус: рабочий контроль происхождения, НЕ полная клиническая/численная валидация.**

Основной машиночитаемый реестр: [HYTEC_P2_RECORD_LEVEL_LEDGER_2026-10.csv](HYTEC_P2_RECORD_LEVEL_LEDGER_2026-10.csv). Каждая строка имеет `id`, исходную запись кода `parent_id`, `source_id`, локальный первичный файл, ориентир на страницу/таблицу, значение HFC, endpoint, follow-up, характер ограничения, `extrapolated` и поле `verification_status`.

## Что инвентаризовано автоматически из текущего audit PR

| Раздел | Всего | С привязанным загруженным первичным документом | Без загруженного первоисточника |
|---|---:|---:|---:|
| `OutcomeModel.points` — HyTEC | 34 | 34 | 0 |
| `OutcomeModel.points` — Ohri 2012 NSCLC (смежная модель) | 6 | 0 | 6 |
| `ClinicalConstraint` HyTEC | 29 | 29 | 0 |
| Критерии `ReirradiationGuidance` Sahgal | 4 | 4 | 0 |
| **Итого построчных записей** | **73** | **67** | **6** |

## Статус научно-источниковой проверки (обновление P2.16)

Реестр **73 реализованных HyTEC + related Ohri2012 записей** различает ссылку на первоисточник, независимую арифметическую воспроизводимость и клиническую валидацию. Статусы групп **взаимоисключающие**; первичные численные проверки **не** равны модели для пациента.

| verification_status | Записей | Смысл |
|---|---:|---|
| `published_fit_point_reproduced_secondary_review_pending` | **23** | Vargo 6; Grimm 2; Stumpf 1; Royce high-risk 2; Redmond 4; **Soltys vestibular LQ 6**; **Mahadevan pancreas unresected 2**. Воспроизведены из опубликованных коэффициентов/уравнений с учётом округления; не patient-level re-fit |
| `published_fit_approx_checked_rounded_point` | **8** | Soltys spine pooled fit, приблизительные точки (до 1,70 п.п. отличия) |
| `UNRESOLVED_primary_source_equation_table_narrative_disagreement` | **2** | Royce prostate low/intermediate, Table3 + Eq2 не воспроизводят текст/рисунок; научная переписка 2025 не закрыта |
| `published_summary_endpoint_and_contour_checked_no_independent_fit` | **7** | Milano brain V12/V20/V24: проверены endpoint/target-inclusive volume, не индивидуальная NTCP |
| `published_optic_dmax_objective_and_pooled_probit_checked_no_prior_rt` | **3** | Milano optic: 10/20/25 Gy Dmax recommendation и отдельная pooled RION probit модель; не относится к уже облучённому зрительному аппарату |
| `visual_table3_contour_and_LQ_math_checked_fit_uncertain` | **5** | Sahgal de novo: Table3 и LQ-эквивалентность, разные структуры в верхней и нижней колонках |
| `visual_table4_four_factor_and_software_math_checked_provenance_open` | **4** | Sahgal reirradiation: 4 lower-risk фактора, Table4 и software проверены; фактическая previous thecal sac Dmax неизвестна |
| `source_document_figure_endpoint_scope_checked_nonuniversal` | **2** | Kong lung MLD/V20: проверен билиатеральный контур, GTV/IGTV, G2+ и ILD, без универсальной модели NTCP |
| `source_reported_R0_group_average_checked_not_fitted` | **1** | Mahadevan pancreas **R0**: Table2 округляет до 90%, текст >90%; оценка по трём R0-исследованиям, **не** fitted unresected TCP |
| `source_stratified_KM_cohort_checked_not_fitted` | **2** | Ohri liver metastases: 3-летние Kaplan–Meier BED10 >100 vs ≤100 по n141/n149 очагам, отдельная 2-летняя fitted TCP не импортирована |
| `source_reviewed_QUANTEC_mld_probit_nonsignificant` | **4** | Miften: 13/18/15/20 Gy QUANTEC MLD рекомендации source-reviewed, pooled liver-enzyme NTCP fit **P=.10, незначим**; не четыре самостоятельно fitted risk points |
| `source_reviewed_reverse_volume_700cc_unmodelled` | **2** | Miften: `rV15/rV17≥700cc` spared normal liver−GTV — **нет** отдельного NTCP fit; 11/118 source GI adverse events не есть liver-enzyme toxicity |
| `source_reviewed_prostate_suggested_not_fitted` | **3** | Wang: bladder `V(Rx) <5–10cc`, urethra Dmax<38–42Gy, rectum Dmax<35–38Gy — source *suggested*, не универсальные tolerated limits |
| `source_reviewed_carotid_D0p5cc_guidance_not_Dmax_risk` | **1** | Grimm: `D0.5cc<20Gy/5fx` conservative suggestion ≠ pooled `Dmax=20Gy` predicted bleeding 2%; отдельная D0.5cc model P=.182 |
| `source_text_anchor_only_not_independently_fitted` | **0** | Не осталось записей, ограниченных только ссылкой на первоисточник; **это не значит, что каждая source model/CI прошла независимую полную валидацию** |
| `external_primary_formula_reproduced_rounded_review_pending` | **5** | Ohri 2012 NSCLC: найден открытый оригинальный авторский текст PMC3867931 (не получен в исходных 69 файлах); 5/6 публикационных 2y TCP-примеров согласуются с формулой в пределах ~0.6 п.п. |
| `UNRESOLVED_source_example_vs_published_rounded_fit` | **1** | Ohri 2012 при 50Gy/5fx, 1 см: печатное 93% против 94.8006% из напечатанной fitted формулы; исходное число HFC сохранено без исправления |
| `primary_not_supplied` | **0** | Нет неразысканных исходных primary по данным 73 записей; 6 из них **по-прежнему не поставлены в пользовательском наборе** и не имеют ZIP SHA256 |
| **Итого** | **73** | Научная база остаётся `draft` |

**P2.13 — первичные Miften/Wang/Grimm:** завершена [проверка 10 оставшихся записей OAR](HYTEC_P2_MIFTEN_WANG_GRIMM_OAR_AUDIT_2026-10.md). Источники подтверждают исходные планировочные метрики, но сами 10 records нельзя объявить валидированными NTCP: Miften `Dmean` основана на QUANTEC/незначимой fitted модели для энзимов, `≥700cc` — reverse spared-volume без собственного fit; Wang — предложенные ограничения для 35–40Gy/4–5fx, мочевой пузырь `V(Rx)` в абсолютных см³; Grimm `D0.5cc` не приравнивается к независимому `Dmax` fit. Оригинальные Library PDFs не удалось повторно прочитать по байтам, использованы официальные AAPM копии той же публикации/DOI. **0 locator-only** означает завершённую первичную *классификацию происхождения*, **не** постраничную QA всех моделей, 95%-CI и клинический выпуск.

**Последние аудиты:**
- [P2.10 Soltys vestibular](HYTEC_P2_SOLTYS_VESTIBULAR_AUDIT_2026-10.md): 6/6 LQ Poisson TCP значений при α/β12.4Gy, D50=3.48Gy, γ50=.1446; максимальная разница 0.057 п.п.; 10Gy/1fx экстраполировано, LQ-L fit отличается и не заменяет LQ.
- [P2.11 Mahadevan pancreas](HYTEC_P2_MAHADEVAN_PANCREAS_AUDIT_2026-10.md): 2/2 unresected fitted points, α/β10 D3eq, D50=17.6Gy γ50=.64; R0 результат — отдельно усреднённый, Table2 90% vs prose >90% без самостоятельной R0 dose-response.


**P2.12 Ohri liver:** [официальный первичный AAPM PDF и научный аудит](HYTEC_P2_OHRI_LIVER_METASTASES_AUDIT_2026-10.md), Figure3 визуально проверена: две **3-летние актюарные** оценки **93% при BED10>100 (141 очаг)** и **65% при BED10≤100 (149 очагов)**, P<.001. У первичных HCC/CCA различия по этой границе не найдено (P=.972); авторская **2-летняя логистическая TCP-кривая** — отдельная модель, не источник наших 3-летних процентов. Пользовательский файл оказался недоступен для текстовой/постраничной проверки, поэтому использован официальный доступный AAPM PDF с DOI; file checksum сравнение остаётся открытым.

Четыре дополнительных результата Redmond (1y LC, модель 1–5fx на оси SFED20): 18 Гр/1fx ≤20 мм → **86,374%**, 24 Гр/1fx ≤20 мм → **95,113%**, 18 Гр/1fx 21–30 мм → **75,504%**, 15 Гр/1fx 31–40 мм → **69,178%**. Данные согласуются с HFC без численной корректировки; новые тесты и полноценные условия применимости: [P2.5 Redmond/Milano](HYTEC_P2_REDMOND_MILANO_AUDIT_2026-10.md). Для семи Milano brain risk-point выполнена проверка контуров и endpoint по статье и визуально Table 3, но **ни один их fitted patient-level NTCP-вывод не объявлен независимо воспроизведённым**.

**Дополнительный optic RION pass:** полные Table 3 и probit воспроизведены из AAPM author PDF (открытый оригинальный текст; загруженный в Library локальный PDF недоступен через извлечение текста). При `EQD2_(α/β=1.6) = 46.0 Gy` pooled модель даёт ≈1%: **12.1 Gy/1fx**, **20.0 Gy/3fx**, **25.1 Gy/5fx**. Авторы рекомендуют более строгие `Dmax ≤10 Gy/1fx, ≤20 Gy/3fx, ≤25 Gy/5fx` **только без предыдущей ЛТ**. Подробности: [P2.7 Optic RION](HYTEC_P2_OPTIC_RION_REPRODUCTION_2026-10.md).

**Новый Sahgal de novo / reirradiation pass:** исходная [Table 3 (PDF p8) и Table 4 (PDF p11) визуально сверены](HYTEC_P2_SAHGAL_SPINAL_AUDIT_2026-10.md), все [25 source Table4 ячеек](HYTEC_P2_SAHGAL_TABLE4_EQD2_LEDGER_2026-10.csv) (22 дозы + 3 N/A) проверены. Верхние KG значения 2–5fx **LQ экстраполированы**, не эквивалентны рекомендованным thecal-sac Dmax. Для условного прежнего thecal-sac Dmax 50Gy/25fx и текущего 14Gy/3fx получается 73,333Gy EQD2₂; критерий cum≤70 не выполнен. **Указанная ранее для мишени доза может не быть фактическим Dmax оболочки** — не делать клинических выводов без проверки истории и геометрии.

**P2.9 Kong lung:** выполнена визуальная сверка Figure1, Table3–5, Figure3/4, supplement S-Table3; [отчёт](HYTEC_P2_KONG_LUNG_AUDIT_2026-10.md) и [audit-only сравнение двух разных source-specific probit models](HYTEC_P2_KONG_MODEL_HETEROGENEITY_2026-10.csv). Авторские <8Gy bilateral MLD и <10–15% V20 — *observational* для преимущественно небольших периферических 3–5fx SBRT; требуется определение обоих лёгких за вычетом GTV или IGTV, и исключение клинически неоднородных ситуаций. ILD сильно изменяет RILT risk. Ни два наблюдательных порога, ни проценты риска не заменены параметрами узких отдельных когорт.

Детали уравнений, параметров, CI и расхождений: [HYTEC_P2_MODEL_REPRODUCTION_2026-10.md](HYTEC_P2_MODEL_REPRODUCTION_2026-10.md). **Особенно важно:** опубликованная формула Пуассона Royce *воспроизводит* high-risk predictions, но при low/intermediate даёт **77,44% вместо ≈90%** и **83,90% вместо ≈95%**; исходные 90/95% HFC сохранены только как **точки из текста и Figure 1**, со специальным предупреждением на сайте. Корректировка `gamma` на основании обратного подбора запрещена до авторского разъяснения или независимого re-fit. Никакая из этих записей пока не прошла независимый клинический commissioning.

Полный охват **67 из 67 HyTEC-объектов на уровне «локальный первичный файл + место, где искать»** — это не статистическая/графическая проверка всех 67. В прежнем общем наборе остаются **103 evidence records** разных типов, в том числе α/β, repair и repopulation: эта таблица не заменяет полную матрицу [EVIDENCE_103_SOURCE_FILE_MATRIX_2026-10.md](EVIDENCE_103_SOURCE_FILE_MATRIX_2026-10.md).

`verification_status=source_text_anchor_only_not_independently_fitted` означает: в первичном документе проверен соответствующий абзац/таблица как место происхождения группы, но **не** восстановлены likelihood fit, CI каждого параметра, извлечение figure/curve либо все клинические исключения. `primary_not_supplied` означает отсутствие оригинальной первичной работы в текущем комплекте. Колонка `visual_tables_and_ci_verified=no` намеренно сохраняется, пока исследователь не закончит независимый visual/table/CI pass.

## Конкретные находки при построчной сверке

### 1. Royce et al., prostate SBRT — подтверждённая ошибка аннотации диапазона модели, исправлена

- Primary: `HyTEC_19_Royce_2021_Prostate_TCP.pdf`, PDF **стр. 6–7, Figure 1 и подпись**, а также Table 3.
- Авторы приводят для low/intermediate-risk оценку **5-летнего FFBR/TCP ≈90% при EQD2(α/β=1.5)=71 Gy** (31.7 Gy/5fx), **но прямо предупреждают, что в использованных когортах не было доз <≈80 Gy EQD2**; соответствующий участок кривой затенён, и клинические выводы делать не следует.
- HFC сохраняет численную точку `prostate-lowint-90tcp` **без изменения дозы 71 Gy или 90%**, но теперь ставит `extrapolated: true` и исходный page-level warning. GUI `src/ui/OutcomeModelsView.tsx` действительно визуализирует этот флаг как «экстраполяция / extrapolated». Добавлен regression test.
- `prostate-lowint-95tcp` при 90 Gy и два high-risk пункта не переклассифицированы без дополнительных доказательств. Основное ограничение high-risk: всего **85 пациентов в 3 сериях** для Figure 1, клиническая переносимость ограничена.

### 2. Miften et al., liver SBRT — отсутствие значимого fitted NTCP

- Primary: `HyTEC_16_Miften_2021_Liver_dose-volume_effects.pdf`, PDF **стр. 7 Fig. 1**: исследовательский probit-fit grade ≥3 liver-enzyme toxicity vs MLD **не достигает статистической значимости (P=0.10)**; нельзя исключить отсутствие зависимости.
- PDF **стр. 9**: QUANTEC-origin MLD objectives **13/18 Gy при 3/6fx primary** и **15/20 Gy при 3/6fx metastatic liver**, которые авторы оценивают как вероятно дающие риск <20%. Это **квалифицированная оценка**, а не хорошо откалиброванная индивидуальная NTCP.
- Ко всем четырём записям HFC добавлена существенная оговорка о `P=0.10`; исходные дозы, формы поля `estimatedRisk: 0.20` и `planning-limit` **сохранены**. Неподтверждённая независимая вероятность не вводилась.
- Отдельно PDF стр. 9: 700 cc normal liver receiving ≤15/17 Gy описано как исследовательская практика, **данных было недостаточно для формального анализа dose-volume endpoint**; поэтому HFC оставляет `observational-threshold`.

### 3. Проверка значения `extrapolated` во всех OutcomeModels

Флаг теперь присутствует в трёх точках:
- `vs-10gy-1fx` — Soltys vestibular: ниже интервала с пригодными данными по дозо-ответу.
- `spine-90tcp-40gy-5fx` — Soltys spine: прямо обозначенная авторами экстраполяция.
- `prostate-lowint-90tcp` — Royce: 71 Gy EQD2 ниже исследованного ~80 Gy.

Другие HyTEC-модельные точки **всё ещё требуют проверку внешнего диапазона в каждом основном fit**, даже если в коде флаг отсутствует. Отсутствие флага НЕ означает валидации или клинической применимости.

### 4. Дополнительные семантические ограничения

- **Sahgal spinal cord:** PDF стр. 8, Table 3 противопоставляет `thecal sac` (Sahgal) и `true spinal cord` (Katsoulakis–Gibbs), а диапазон 12.4–14 Gy/1fx и прочие ряды относятся к разным моделям/структурам. Следует избегать объединения их как 95% CI.
- **Grimm major vessels:** PDF стр. 8 (Section 8) советует *пытаться* удерживать D0.5cc <20 Gy/5fx; статья прямо описывает компромисс относительно target coverage. Риск Dmax 2% при 20 Gy и 12% при 30 Gy — другая pooled-модель, не тождественная D0.5cc и без количественного добавления предшествующей RT-дозы.
- **Milano brain:** V12 = tissue (мишень + прочее) отличается от `brain minus target`; смешанные исследования осложняют fitting. Значения в HFC — риск-точки, не безусловные планировочные пределы.
- **Vargo H&N:** PDF стр. 6–7; 1-летний fitted trend не достигает формальной значимости, 2–3-летние fit значимее. Шесть `OutcomeModel.points` не образуют разрешение автоматически экстраполировать TCP.
- **Ohri 2012 NSCLC:** [новый аудиторский отчет](HYTEC_P2_OHRI_2012_NSCLC_EXTERNAL_PRIMARY_AUDIT_2026-10.md): найден открытый первичный NIH author manuscript (PMC3867931) при том, что файл отсутствует в исходных 69. Пять примеров из 6 согласуются с опубликованной fitted формулой с точностью <0.6 п.п.; шестой `50Gy/5fx, 1cm` имеет открытое расхождение 93% vs 94.8006%. Независимая post-page PDF и covariance CI QA остаётся OPEN.

## Следующая независимая работа

1. **Частично выполнено:** независимый пересчёт из опубликованных параметров для Vargo/Grimm/Stumpf/Royce high-risk, приближённая Soltys spine и выявление неразрешённого Royce low/intermediate. Далее получить авторское уточнение Royce и продолжить Redmond, Milano и другие fit/CI; не путать проверку табличных параметров с независимым переобучением моделей.
2. Визуальная проверка PDF-графиков и широких таблиц (Redmond EA4, Sahgal Table 3, Royce Figure 1, Miften Figure 1 и приложения Milano).
3. Провести запись-за-записью crosscheck остальных 103-объектных evidence types, дополнительно получить отсутствующие первичные документы и безопасно проверить ZIP оригиналов (текущие исходные байты недоступны).
4. Второй независимый clinical reviewer до публикации `validated`. PR остаётся draft, P4 и выпуск нельзя инициировать на основании одной этой таблицы.
