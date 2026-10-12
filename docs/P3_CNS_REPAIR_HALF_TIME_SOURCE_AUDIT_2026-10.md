# P3.5 — T½ репарации ЦНС: две исторические неподтверждённые границы (9 октября 2026)

**Статус: сравнительный аудит по доступным официальным первичным публикационным аннотациям. Не full-text PDF QA и не независимая подгонка модели.** Это продолжение P3.4 в действующем черновом PR #60. Численные параметры клинического калькулятора не изменяются.

## Источники: точный DOI / PMID / объект проверки

1. **Bender ET (единственный автор по издателю и PubMed).** Brain necrosis after fractionated radiation therapy: is the halftime for repair longer than we thought? *Med Phys.* 2012;39(11):7055–7061. DOI [10.1118/1.4762562](https://doi.org/10.1118/1.4762562); PMID [23127096](https://pubmed.ncbi.nlm.nih.gov/23127096/). **Results официального авторского abstract** сообщает **T½ brain necrosis monoexponential 38.1 h (range 6.9–76 h)**, **T½ spinal cord myelopathy 4.1 h (range 0–8 h)**. В Methods указано моделирование клинических дозо-эффектных данных методом нелинейной регрессии с несколькими альтернативными описаниями репарации. Abstract не именует эти интервалы статистически 95% CI; **не превращать “range” в доверительный интервал** и не переносить 38.1 h на височную долю без оригинальной популяционно- и локально-специфичной проверки.
2. **Lee AWM et al.** Effect of time, dose, and fractionation on temporal lobe necrosis following radiotherapy for nasopharyngeal carcinoma. *IJROBP.* 1998;40(1):35–42. DOI [10.1016/S0360-3016(97)00580-4](https://doi.org/10.1016/S0360-3016(97)00580-4), PMID [9422555](https://pubmed.ncbi.nlm.nih.gov/9422555/). **Abstract Methods/Results**: 1008 NPC patients; high fraction-size signal; estimated **α/β=2.9 Gy, CI −1.8…7.6 Gy** is **not** repair T½. Explicit T½ >4h could **not** be verified from the accessible abstract.
3. **Lee AWM et al.** Factors affecting risk of symptomatic temporal lobe necrosis: significance of fractional dose and treatment time. *IJROBP.* 2002;53(1):75–85. DOI [10.1016/S0360-3016(02)02711-6](https://doi.org/10.1016/S0360-3016(02)02711-6); PMID [12007944](https://pubmed.ncbi.nlm.nih.gov/12007944/). **Abstract Methods/Results**: 1032 NPC patients, 984 daily-only, 48 had BID during part of course, 24 symptomatic TLN events (18 daily; 6 BID), adjusted **BID hazard ratio 13 (95% CI 3–54)**. Этот HR показывает клиническую ассоциацию, **не задаёт T½=4 h и не является доказательством границы T½>4 h**. Конкретное отношение рисков нельзя корректно трансформировать в T½ без дозовой геометрии и регрессионной модели.
4. **BCR 2025, Chapter 10** — вторичный источник, прямой `Basic Clinical Radiobiology 2025.pdf` значится в пользовательском инвентаре как предоставленный, но точная страница таблицы и объяснение происхождения исторических границ **>5h cord** и **>4h temporal lobe** по исходным байтам PDF не сверены. Не менять `user_file_supplied=true` на основании отсутствия текстовой проверки.

## Post-record решения без изменения численных данных

| HFC evidence ID | Историческая запись | Публикационный контекст | Обоснованное действие |
|---|---|---|---|
| `t12-spinal-cord-myelopathy-bcr2025` | `rangeHours.low=5`, `lower-bound` | Bender 2012 spinal myelopathy **4.1 (0–8) h**, не подтверждает фиксированный порог >5 h | **Оставить deprecated, defaultEligible=false**, не подменять 5 на 4.1 без отдельной P4 доказательной и клинической оценки |
| `t12-temporal-lobe-necrosis-bcr2025` | `rangeHours.low=4`, `lower-bound` | Bender brain necrosis **38.1 (6.9–76) h** относится к широкому brain endpoint; Lee TLN cohort reports fractionation/BID effect **без отдельного T½ >4h** | **Оставить deprecated, defaultEligible=false**; не присваивать brain-necrosis 38.1 h специфически temporal-lobe estimate |

Важно: между неопределённостью опубликованной модели и непосредственным численным противоречием нет тождества. Этот этап не доказывает, что оригинальный вторичный BCR-источник был «ошибочным»; устанавливается, что **проверенные доступные первичные abstract сами по себе не подтверждают** именно исторические пороги HFC. Прямой BCR page-level pass и получение полных исходных работ необходимы до окончательного решения.

## Библиографическая находка

В `src/data/evidence/v0.1/sources.ts` исходная запись `bender-2012-cns-repair` ошибочно называла `Bender ET, Tomé WA`. В официальных PubMed и Wiley для DOI `10.1118/1.4762562` указан **только Edward T. Bender**. Исправлена **библиографическая атрибуция**, идентичность DOI/PMID, количественные параметры и модель репарации не изменены. Отдельный regression-test защищает правильное имя и не позволяет ошибочно приписать Bender 2012 характеристику «source validates temporal T½».

## Воспроизводимость / ограничения

[Crosswalk primary source ↔ legacy record](P3_CNS_REPAIR_SOURCE_CONTRADICTION_LEDGER_2026-10.csv) хранит библиографические и модельные сведения отдельно от исходных `rangeHours`; [source regression](../tests/p3CnsRepairSourceConflict.test.ts) не допускает замены исходного T½ на HR, а 95% CI на неопределённый `range` или возвращения обеих записей в активный выбор.

После P3.5 все **6 repair-half-time evidence IDs** имеют explicit external literature review states (**3 matched point/MC intervals**, **1 matched qualitative range**, **2 source-abstract contradiction/unsupported historical bound**), но **ни один из 6 не получил независимо подтверждённый клинический release status**. Полная база: **20 P3 source-table/CI**, **39 отдельный P2 source review**, **6 ограниченных external primary abstract findings**, **38 P3 quantitative pending** = 103. Из 38 pending **13** имеют пользовательский источник, **25** не имеют. Coverage из пакета остаётся неизменным: **73/103**.

**Открытые вопросы**: первоначальный secondary BCR source page и ссылки, full figure/equation parameter identification, различение mono/bi/reciprocal repair, independent reconstruction covariance/uncertainty and modern clinical relevance, separate endpoint clinical dose distribution (true cord vs thecal sac, temporal-lobe volume), second reviewer and clinical commissioning. Никакого заявления validated/approved.
