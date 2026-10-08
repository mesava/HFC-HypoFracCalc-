# HFC — научная контрольная точка P1/P2/P3 перед P4 и release candidate

**Состояние на 08–09.10.2026; источник истины — draft PR #60.** Эта таблица оценивает только прослеживаемость и готовность к независимому исследовательскому рецензированию. **Ни один коэффициент не считается автоматически клинически утверждённым.**

## Техническое состояние

| Контроль | Проверенный статус |
|---|---|
| Репозиторий / публичный сайт | `mesava/HFC-HypoFracCalc-`, GitHub Pages; основной выпуск `0.1.0-rc.1` |
| `main` / `develop` | Одинаковая базовая ветка `08fff483c659c6d6d93a4cf5bd96eb0248ec5316`. Новые научные замечания не слиты |
| Научный PR | **#60, DRAFT**, head branch `audit-p1-p2-scientific-review-20261008`. UI design PR #55 не затронут |
| Evidence dataset | `2026.10-v0.2`, **`releaseStatus: draft`**; старые per-record `validated` метки означают прежнюю техническую работу, НЕ прохождение нынешнего строгого source-by-source scientific P2/P3 |
| CI | Проверяется на каждом коммите. TypeScript/Vitest/Playwright successful run нужен как техническое, но **недостаточное** условие клинической валидации |

## Что завершено по P1/P2, что не завершено

1. **P1 пофайловый реестр:** 69 отдельных пользовательских документов инвентаризованы (20 HyTEC primary / 15 supplements / 5 letters / 29 other). Названия, типы, предполагаемый DOI, локальный доступ и ссылка на source IDs зафиксированы. **Нельзя объявить P1 окончательным**: пользовательский ZIP ~357 MB не удалось получить в исходных байтах; SHA256 и проверка точного содержимого полного архива отсутствуют, часть официальных AAPM PDF читалась вместо файлов Library.
2. **P2 HyTEC source-linked ledger:** 73 реализованных clinical source records = **34 HyTEC `OutcomeModel.points` + 6 Ohri2012 NSCLC non-HyTEC example points + 29 HyTEC `ClinicalConstraint` + 4 Sahgal `ReirradiationGuidance` criteria**. Прямой файл в переданном комплекте есть для **67/73** records; **6 Ohri2012** без оригинала.
3. **Классификация всех 73, без locator-only:** воспроизведено **23 fitted точки**, приблизительно сверены **8**, клинический source/endpoint/contour/guidance-specific обзор **34**, нерешённые Royce **2**; **5** Ohri2012 NSCLC examples проверены по внешнему открытому авторскому первоисточнику, **1** пример имеет расхождение напечатанных значений и напечатанной функции. Итого: `23+8+34+2+5+1=73`. **Клинический source-reviewed (34) не означает patient-level refit или полную 95% CI QA.**
4. **Главные расхождения P2:** Royce low/intermediate 5y prostate TCP Eq(2)+Table3 не совпадает с Fig1 и текстом; опубликованы Chen letter DOI `10.1016/j.ijrobp.2025.06.3898` и author reply DOI `10.1016/j.ijrobp.2025.06.3899`, однако **полный ответ авторов не получен**, поэтому нельзя исправлять γ по догадке. Mahadevan R0 printed 90% vs narrative >90%; Miften 700cc rVdose без независимой fitted NTCP; Grimm 5fx D0.5cc guideline ≠ pooled Dmax 2% fit; Milano brain volume includes target; Sahgal cord/thecal sac differing structures + LQ extrapolation; Kong ILD/contour nonuniformity.
5. **P2 постраничные figures/tables:** первичные 20 HyTEC, 15 supplement и 5 letters доступны по инвентарю, однако не доказано, что **каждый рисунок, численный элемент таблицы и 95% CI** сверены визуально с исходными страницами и независимо пересчитаны. Нельзя считать P2 научно **закрытым**. 73-row source-review closed ≠ P2 scientifically complete.
6. **Независимое рецензирование:** нет утверждённого second medical physicist + radiation oncologist sign-off с протоколом отклонений; конечный endpoint/dose-volume metric local commissioning не проведён. Эти работы нельзя заменить зелёным CI.

## Пересечение с полной доказательной базой из 103 records

Это **другая выборка**: [103-record matrix](EVIDENCE_103_SOURCE_FILE_MATRIX_2026-10.md) учитывает `alphaBetaEstimate`, `repairHalfTime`, `repopulationRate` и смежные записи исходного evidence data model. В комплекте **73 из 103** имеют source ID с полученным пользовательским файлом, **30 из 103** прямого файла **не имеют**. Это **не то же самое**, что 73 HyTEC-related `OutcomeModel.points + ClinicalConstraint + ReirradiationGuidance` records.

| Группа из 30 без файла в поставке | Число records | Приоритет следующего P3 source work |
|---|---:|---|
| α/β, source-specific endpoint | **13** | Высокий: endpoints кожа/фиброз/лёгкие/пищевод/спинной мозг и независимые клинические дробления; наличие вторичного BCR не гарантирует прямую цифру |
| T½ repair | **4** | Очень высокий для учета неполного восстановления, интервалов между фракциями и тканеспецифичных temporal models |
| Time penalty / repopulation dose `Dprolif` | **12** | Очень высокий при использовании инструмента компенсации перерывов; отличать population mean, radiobiological source and uncertainty |
| Остальные / source Ohri2012 | **1** | Требует оригинала. **Не путать** эту одну запись в матрице 103 с шестью отдельными model points в реестре 73 |

Важна научная интерпретация: *первый комплект содержит 69 файлов, но отсутствие прямого документа для одного Source ID ещё не доказывает ошибку коэффициента*. Не добавлять «исправленные» α/β/T½/Dprolif без первоисточника и отдельного независимого расчёта.

## Новый вход в P2.14: проверка каждой из 40 исходных HyTEC публикаций

Созданы [сплошная матрица всех 40 source files](HYTEC_P2_COMPLETE_40_DOCUMENT_REVIEW_MATRIX_2026-10.csv) и [пояснения](HYTEC_P2_COMPLETE_40_DOCUMENT_REVIEW_MATRIX_2026-10.md), состав сверяется автотестом с 69-entry P1 inventory JSON. Проверяемые исходные объекты: **20 core + 15 supplements + 5 letters**. **Все 40** требуют дополнительного критерия `full figure/table/image/CI/page QA`; это не отменяет уже проведённые выборочные проверки статей, 15/15 extracted supplement texts, 5/5 letter texts или 73-record semantic classifications. Без full-page source review G2 остаётся OPEN.

Для критического P2-C21 оформлен [Royce response verification gate](HYTEC_P2_ROYCE_2025_CORRESPONDENCE_GATE_2026-10.md): по PubMed и Red Journal подтверждён DOI ответа `10.1016/j.ijrobp.2025.06.3899` от 2025, но **полный текст не получен**, поэтому причины ошибки опубликованного low/intermediate Eq/Table/figure установить нельзя. Изменять коэффициенты в P4 преждевременно.

## P2.16 — первичный Ohri 2012 NSCLC найден, но есть внутреннее численное расхождение

Внешне доступен **авторский опубликованный оригинальный текст** DOI `10.1016/j.ijrobp.2012.04.040`, `PMCID: PMC3867931`, https://pmc.ncbi.nlm.nih.gov/articles/PMC3867931/ . **Факт отсутствия файла в пользовательском ZIP сохраняется**: исходная поставка по-прежнему покрывает 67 из 73 HyTEC-related records, но для 6 записей Ohri2012 теперь существует внешний легальный full-text, что позволяет независимую проверку. PDF/ZIP SHA256 и постраничный visual QA отсутствуют.

Исходная функция `TCP_2y=logistic((BED10−10Gy/cm·L)/31Gy)` из опубликованных коэффициентов воспроизводит **5 из 6** напечатанных примеров в пределах 0.6 п.п., но для `50Gy/5fx, L=1cm` даёт **94.8006%** против напечатанных **93%**. В HFC 93% сохранено и UI сообщает об открытом несовпадении. [Подробный научный аудит](HYTEC_P2_OHRI_2012_NSCLC_EXTERNAL_PRIMARY_AUDIT_2026-10.md), [source regression](../tests/hytecOhri2012NsclcPrimaryModel.test.ts). Для клинического применения model constraints по опубликованному диапазону также исключают **1fx, <8Gy/fx и >2 недель**; кумулятивная вероятность за 2 года не переносится на 5y endpoint.

**Контроль G3 НЕ закрыт**: проблема Royce остаётся, Ohri2012 имеет внутреннее source discrepancy, нет второго рецензента. G1/G2/4/5/6/7 без изменений.

## P3 начат: 20 source-table checks в полной базе из 103 (09.10.2026)

В режиме **source-by-source numerical P3**, напрямую по предоставленным пользователем PDF (не по интернет-сниппетам), проверены:

- [P3.1 — Brand CHHiP 2021 rectal и 2023 GU](P3_BRAND_CHHIP_19_ENDPOINT_PRIMARY_AUDIT_2026-10.md): **9/9 + 10/10** оригинальных fitted α/β и 95% percentile-bootstrap CI, включая оценку поддержки endpoint/default selection и предельной ширины CI. [19-строчная матрица](P3_BRAND_CHHIP_19_ENDPOINT_PRIMARY_CROSSCHECK_2026-10.csv), [test](../tests/p3BrandChhipAlphaBetaPrimaryAudit.test.ts).
- [P3.2 — Vogelius & Bentzen 2020](P3_VOGELIUS_BENTZEN_PROSTATE_PRIMARY_AUDIT_2026-10.md): **1/1** pooled prostate biochemical-control α/β=1.6Gy (95% CI **1.3–2.0**), но **random-effects sensitivity CI 0.8–2.4**; высокая гетерогенность I²=70% и meta-regression fraction size slope 0.57 Gy/Gy. [test](../tests/p3VogeliusBentzenProstatePrimaryAudit.test.ts).

**20/103** из полного evidence set получили **дополнительный текущий P3 source-table / CI crosscheck**. Это не означает, что остальные 83 «не проверялись никогда», но именно **полный строгий P3-протокол и независимая клиническая валидация для них не завершены**. **19+1 относятся к числу уже имевшихся 103 записей**, никакого расширения clinical dataset или нового alpha/beta default не произошло. В частности, общее наличие исходного файла по-прежнему **73/103**, отсутствие отдельного файла — **30/103**. Ранее проверенные P2 HyTEC `OutcomeModel`/constraints составляют **другую** выборку.

**Не завершено:** FAST/FAST-Forward 10y, остальные эпителиальные и OAR-specific alpha/beta первоисточники, T½ repair, Dprolif/K/Tk сопоставимость, BCR книжные secondary estimates, full CI source pages и 30 отсутствующих originals. Нет основания поднять `draft` или автоматически merge PR #60.

## Release gates (обязательные до вывода P4/RC)

| Gate | Условие снятия | Статус |
|---|---|---|
| **G1 P1 binary provenance** | ZIP и доступные оригиналы проверены SHA256, file-title↔DOI сопоставлены; версионирование supplements/letters | **OPEN** |
| **G2 P2 source completeness** | Для каждого из 20 core, 15 supplements, 5 letters проставлены `page/figure/table/equation/endpoint/metric/contour/CI` и результат независимого анализа или явно *неприменимо* | **OPEN** |
| **G3 P2 high-risk conflicts** | Royce Eq/Table/Fig issue разрешено по полному author reply либо точкам назначен ограничительный статус; для Ohri2012 (внешний первичный fulltext теперь доступен) должно быть научно разрешено 93% vs 94.8% и завершён независимый review остальных 5 source examples | **OPEN** |
| **G4 full 103-record P3** | Каждый record полной базы имеет source locator и собственную независимую проверку либо явный blocker; все 30 file-gaps обработаны; проверены FAST/FAST-Forward/Brand/Vogelius/RCR/HyTEC/BCR | **OPEN** |
| **G5 independent review** | Второй медицинский физик + клинический радиотерапевт проверяют numeric output, выбор модели, противопоказания и предупреждения; подписан разбор ошибок | **OPEN** |
| **G6 software regression and local commissioning** | `npm ci`, unit/typecheck/build, Playwright, manual reference cases, clinical OAR contour/DVH QA и документированная проверка локальной применимости | **PARTIAL** |
| **G7 publication** | Проверенный P4 data-only PR, release notes, signed acceptance, `develop→main` и Pages deploy только после G1–G6 | **BLOCKED** |

**Рекомендованная последовательность:** завершить остающийся full-page/CI pass и high-risk blockers P2 → сформировать полный P3 аудит 103 entries → согласовать корректировки P4 только по документированным discrepancy → передать на независимое научно-клиническое ревью → пройти release gates. **Никакого автоматического merge PR#60 и #55, backend/voxel/DICOM или patient-use release сейчас не требуется.**
