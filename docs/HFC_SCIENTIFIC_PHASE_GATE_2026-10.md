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
3. **Классификация всех 73, без locator-only:** независимое воспроизведение **23 fitted точек**, приблизительный source-fit crosscheck **8**, source paper internal contradiction Royce **2**, клинический source/endpoint/contour/guidance-specific обзор **34**, первоисточник Ohri2012 отсутствует для **6**. Арифметически: `23+8+2+34+6=73`. **Клинический source-reviewed (34) не означает численное refit или полный 95% confidence interval QA.**
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

## Release gates (обязательные до вывода P4/RC)

| Gate | Условие снятия | Статус |
|---|---|---|
| **G1 P1 binary provenance** | ZIP и доступные оригиналы проверены SHA256, file-title↔DOI сопоставлены; версионирование supplements/letters | **OPEN** |
| **G2 P2 source completeness** | Для каждого из 20 core, 15 supplements, 5 letters проставлены `page/figure/table/equation/endpoint/metric/contour/CI` и результат независимого анализа или явно *неприменимо* | **OPEN** |
| **G3 P2 high-risk conflicts** | Royce Eq/Table/Fig issue научно разрешено по полному author reply либо модель помечена unusable/deprecated; шесть Ohri2012 точек подтверждены оригиналом либо деактивированы при согласованном P4 решении | **OPEN** |
| **G4 full 103-record P3** | Каждый record полной базы имеет source locator и собственную независимую проверку либо явный blocker; все 30 file-gaps обработаны; проверены FAST/FAST-Forward/Brand/Vogelius/RCR/HyTEC/BCR | **OPEN** |
| **G5 independent review** | Второй медицинский физик + клинический радиотерапевт проверяют numeric output, выбор модели, противопоказания и предупреждения; подписан разбор ошибок | **OPEN** |
| **G6 software regression and local commissioning** | `npm ci`, unit/typecheck/build, Playwright, manual reference cases, clinical OAR contour/DVH QA и документированная проверка локальной применимости | **PARTIAL** |
| **G7 publication** | Проверенный P4 data-only PR, release notes, signed acceptance, `develop→main` и Pages deploy только после G1–G6 | **BLOCKED** |

**Рекомендованная последовательность:** завершить остающийся full-page/CI pass и high-risk blockers P2 → сформировать полный P3 аудит 103 entries → согласовать корректировки P4 только по документированным discrepancy → передать на независимое научно-клиническое ревью → пройти release gates. **Никакого автоматического merge PR#60 и #55, backend/voxel/DICOM или patient-use release сейчас не требуется.**
