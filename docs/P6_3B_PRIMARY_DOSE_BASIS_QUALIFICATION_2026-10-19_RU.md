# HFC — P6.3b: научная квалификация дозовой основы десяти time-loss коэффициентов

**Дата:** 19 октября 2026. **Статус:** source-specific gate, документальное решение, не изменение поведения сайта.  
**Ветка:** независима от [чернового PR #95](https://github.com/mesava/HFC-HypoFracCalc-/pull/95); база `develop` `ef4138ef03fa4722a4034a91b86264e35d5f9a09`.  
**Evidence dataset:** `2026.10-v0.2`, `draft`; **нет индивидуального клинического approval**.

## 1. Новый результат: 10 selectable ≠ 10 scientifically EQD2-qualified

Из `src/data/evidence/v0.1/repopulation.ts` и `src/evidence/repopulationRegistry.ts` по состоянию на 19.10:
- Все **14** репопуляционных записей имеют исторический `basis: "EQD2"`, но `basis` в **коде** не доказывает единицу источника.
- **2** deprecated записи H&N и **2** Hinata BED/`tBEDmax` заблокированы в runtime по source ID, включая явный выбор; они **не входят** в нижеследующие десять.
- **10** других записей доступны только с явным выбором (`defaultEligible=false` у всех); **0** универсальных time-loss defaults.
- Только **2 из 10** имеют записанное `kickOffDays` (Roberts `21`, Withers `30`), причём Roberts `Tk` статистически неустановлен (лучшее значение, CI включает 0), а Withers `Tk` — *условие одной из двух моделей*.
- Для остальных **8 из 10** `Tk` не установлен. `resolveRepopulationSelection` выдаёт предупреждение, а `buildTreatmentGapBaseline` запрещает вычисление без явной гипотезы `Tk`.
- **0 из 10 получили независимый original-source equation-level sign-off** для использования опубликованного коэффициента прямо в `EQD2/day` формуле HFC. `0` не означает, что они заведомо ошибочны: это граница предоставленных оригинальных уравнений, а не медицинское заключение об истинной единице каждого rate.

[Таблица квалификации всех 10 источников](P6_3B_ALL_10_TIME_LOSS_SOURCE_UNIT_QUALIFICATION_2026-10-19.csv) содержит source URL, числовой контекст, исходное определение времени и конкретный следующий необходимый документ/формулу. В ней `source_EQD2_equation_and_units_qualified=false` — консервативное решение аудита, а не претензия к авторам публикаций.

## 2. Что удалось подтвердить повторной сверкой оригинальных публикаций

1. **CHART 2001 (2 normal-tissue records):** [Bentzen et al. 2001, PMID 11439207](https://pubmed.ncbi.nlm.nih.gov/11439207/): 0.80 [0.70–1.10] Гр/сут при mucositis; 0.12 [−0.12–0.22] Гр/сут при early skin erythema. Источник — morbidity normal tissue, не репопуляция опухоли. Без full model нельзя заверить единицу **потерянной EQD2** или индивидуальный onset; у skin CI включает ноль.
2. **Roberts 1994 (larynx):** [PMID 8087485](https://pubmed.ncbi.nlm.nih.gov/8087485/): 0.8 [0.5–1.1] extra *total dose*/day для node-negative larynx, Tk best 21 [0–27] дней, статистически значимого lag не показано. Не считать подтверждённым EQD2 нормированием без оригинального уравнения и не переносить на generic HNSCC.
3. **Withers 1995 (tonsil):** [PMID 7558943](https://pubmed.ncbi.nlm.nih.gov/7558943/): 676 пациентов, extra dose 0.53 Гр/сут при начале регенерации до 9 дней против 0.73 Гр/сут при модельном Tk≈30 дней. Текущая HFC-точка 0.73/Tk30 — **один выбранный сценарий**, а не «измеренный Tk» или universal `K_EQD2`.
4. **Hendry 1996 + BCR 2025 (pooled):** [Hendry abstract PMID 8934049](https://pubmed.ncbi.nlm.nih.gov/8934049/) объясняет LQ gap modelling, но **не печатает** `0.64 [0.42–0.86]`. Оригинально предоставленная пользователем *Basic Clinical Radiobiology* 2025 **Table 10.3 / Section 10.6** проверена в P3.11: именно **в учебнике** эта строка `EQD2 Gy/day`, но первичная author-model/CI не восстановлена. Статус: `secondary_textbook_EQD2_assumption_confirmed`, не `primary_equation_validated`.
5. **Bentzen 2000 lung pneumonitis:** [QUANTEC Marks et al. 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC3576042/) сообщает восстановление 0.54±0.21 Гр/сут, где 0.21 — **SE**, не 95% CI; исходный Bentzen 2000 авторский обзор около 0.5. Не переносить на cancer TCP или поздний фиброз.
6. **Geh 2006 oesophageal pCR:** [PMID 16545878](https://pubmed.ncbi.nlm.nih.gov/16545878/), 26 neoadjuvant CRT studies, 1335 пациентов: 0.59 [0.18–0.99] Гр/сут, совместно с эффектами 5-FU и cisplatin в multivariable fit. Это не RT-alone tumour TCP, исходная Gy EQD2 basis не доказана.
7. **Koukourakis 1996 NSCLC:** [PMID 8567332](https://pubmed.ncbi.nlm.nih.gov/8567332/), `NTD` и `NTD-T` при α/β10, 0.45 Гр/сут в общем анализе 153 пациентов, но 0.20 в subgroup без mediastinal disease. Упоминание `>20` treatment days не превращено в универсальный `Tk`.
8. **Thames 2010 prostate:** [PMID 20400191](https://pubmed.ncbi.nlm.nih.gov/20400191/), 0.24 Гр/сут, только low/intermediate risk при ≥70 Гр, nearly constant fraction size. Авторы прямо указывают: их данные не позволяют оценить α/β. Не переносить на arbitrary 3–7 Гр/fx. 52-day analysis cut point — не биологическая оценка `Tk`.
9. **Haviland 2016 breast:** [PMID 27666929](https://pubmed.ncbi.nlm.nih.gov/27666929/): 0.60 [0.10–1.18], гипотезообразующая оценка локорегионарного рецидива, существенно определяется различием трёх- и пятинедельных START-B schedules. Не считать доказанной общей компенсацией гипофракционирования.

В таблице для каждого источника отдельно стоят: опубликованная **величина**, **из чего она получена**, **какое определение дозы было проверено** и **неполученный original paper equation/fitting context**. Это избавляет от ложного бинарного «верен коэффициент / неверен коэффициент».

## 3. Важно: RCR 2019 `BED/day` не равно `EQD2/day`

[RCR 2019, fourth edition, Appendix examples](https://www.rcr.ac.uk/media/z5jgmrhd/rcr-publications_the-timely-delivery-of-radical-radiotherapy-guidelines-for-the-management-of-unscheduled-treatment-interruptions-4th-edition_january-2019.pdf): для демонстрационного H&N времени `K = 0.9 Gy_BED10/day` и `T_delay = 28d`. При **фиксированном** α/β=10 Гр и 2-Гр reference fraction:
```text
K_EQD2_10 = K_BED10 / (1 + 2/10) = 0.9/1.2 = 0.75 Gy_EQD2/day
```
При иллюстративном α/β=3 Гр то же `0.9 Gy_BED3/day` дало бы 0.54 Gy_EQD2/day. Последнее — **только математическое изменение dose basis**, не самостоятельное клиническое значение `K` для конкретной ткани. Без идентичной α/β/source dose definition/endpoint даже этот алгебраический пересчёт **не является валидированным переносом** модели.

Библиотечная BCR 2025 Table 10.3 уже задаёт convention `Dprolif_Gy_EQD2/day` для **своего табличного представления**, но это *secondary derivation*, а не доказательство, что все первичные original source fits использовали идентичные определения или диапазон применимости.

## 4. Нынешнее поведение сайта и перспективы безопасного изменения

**В текущем сайте мы ничего не меняем.** `resolveRepopulationSelection` позволяет явный выбор десяти time-loss rates; предупреждает, что автоматического выбора нет, но пока **не устанавливает** математический source-dose-basis clearance. `TreatmentGap` требует явно выбранный `Tk` у восьми из десяти источников.

Для будущего согласуемого научно-технического изменения предлагается хранить *отдельно*:
- `sourceReportedDoseBasis`: physical_total | BED | NTD-T | EQD2_2Gy | author_defined_normalized | unknown;
- `sourceEquationLocator`, `sourceOriginalMetric`, `alphaBetaDependency`, `fractionSize/OTT range`, `TkEvidenceType`, `CI type`, `fullPrimaryTextReviewed`, `runtimeQualification`;
- сделать source-basis gate: `EQD2_primary_qualified` только по воспроизводимому source equation или проверенной авторской нормировке, `secondary_context_assumed` отдельно, `blocked_incompatible` для Hinata, `archival_only` для deprecated.

**Важное проектное решение, которое ещё потребуется утвердить:** (A) оставить 10 manual-evidence scenarios с видимыми scientific warnings (как сейчас) или (B) блокировать те, у которых source-normalization неизвестна, оставив чисто ручной сценарий с явным обоснованием физика и клиническим signoff. Такое изменение меняет рабочие сценарии и не производится этим PR без отдельного согласования.

## 5. Результат P6.3b

- Описано **10/10** доступных записей с научной единицей первичного источника и отдельной категорией неустранённого риска. **0** получили полного исходного equation-level QA в рамках этого прохода.
- Подтверждены ограничения **2 existing Tk**: один статистически незначимый best fit, другой вариант авторской модели. Остальным **8** требуется явное предположение времени начала.
- Выполнены независимые dimensional unit-тесты по RCR и контроль дефолтов/Hinata/deprecated, без изменения clinical calculations.
- Выдерживается разделение `technical test PASS`, `source text numerically transcribed`, `source dose-basis qualified`, `clinically commissioned`. Последние два отсутствуют.
- **Следующий предметный шаг:** решить роль explicit-only records в интерфейсе (source basis not qualified) и продолжить P6.4 уже с source-first OAR/OutcomeModel expansion без смешения BED и EQD2.

Ни одно новое значение Dprolif, CI или Tk не рекомендовано для clinical treatment-gap compensation без source-specific scientific signoff.
