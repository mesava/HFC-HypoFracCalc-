# Аудит покрытия литературы HyTEC и ключевых источников HFC — 2026-10-08

## Метод проверки и пределы утверждения

Сопоставлены:

1. официальное оглавление тематического выпуска *International Journal of Radiation Oncology, Biology, Physics*, 2021, Vol. 110, Issue 1, pp. 1–256, размещённое AAPM: https://www.aapm.org/pubs/hytec/HyTEC.html;
2. machine-readable реестр `src/data/evidence/v0.1/sources.ts`;
3. документы `docs/LITERATURE_PACKAGE_AUDIT.md`, `docs/EVIDENCE_INVENTORY.md`, `docs/OUTCOME_MODELS.md`;
4. реализованные группы `ClinicalConstraint` / `OutcomeModel`.

Важное разграничение:

- **registered** — статья присутствует в реестре, имеет библиографию/DOI, но может не содержать кодируемого количественного параметра;
- **modelled** — в отдельных source-traceable evidence records закодированы применимые данные/точки;
- **partial** — реализована только воспроизводимая часть публикации (не все её таблицы и/или непрерывные модели);
- **context** — теоретическое обоснование без клинических автоматических коэффициентов.

Это **source-coverage audit**, а не полный независимый просмотр всех страниц каждого PDF и не клиническое комиссионирование. Исходный архив пользователя ранее описывался как содержащий 71 файл, но его байты не были повторно доступны в данном рабочем контексте. Поэтому утверждать о проверке каждого из 71 исходных файлов непосредственно в этом проходе нельзя.

## HyTEC: 20 основных научных статей

В официальном выпуске выделяются 4 вводные/теоретические и 16 органо-/нозологически ориентированных статей. Все 20 теперь представлены библиографическими объектами в HFC.

| № | HyTEC статья (кратко) | Source ID | Реальное использование |
|---|---|---|---|
| 1 | Grimm — HyTEC overview | `grimm-2021-hytec-overview` | context — рамки и ограничения систематизации |
| 2 | Moiseenko — dose–response modeling primer | `moiseenko-2021-hytec-modeling-primer` | context — fitting/uncertainty; не автоматически доступный NTCP |
| 3 | Song — biological principles, indirect cell death | `song-2021-hytec-biological-principles` | context — механизмы, не дополнительный коэффициент к LQ |
| 4 | Marciscano — immunomodulation | `marciscano-2021-hytec-immunomodulation` | context — нет patient-specific модели |
| 5 | Redmond — brain metastases TCP | `redmond-2021-hytec-brain-mets-tcp` | modelled: OutcomeModel, клинический контекст |
| 6 | Milano — brain SRS/fSRS tolerance | `milano-2021-hytec-brain` | modelled: ClinicalConstraint (объёмные риск-точки) |
| 7 | Milano — optic-pathway tolerance | `milano-2021-hytec-optic` | modelled: ClinicalConstraint (Dmax по числу фракций) |
| 8 | Soltys — vestibular schwannoma TCP | `soltys-2021-hytec-vestibular-tcp` | modelled: OutcomeModel |
| 9 | Soltys — spinal metastasis TCP | `soltys-2021-hytec-spinal-mets-tcp` | modelled: OutcomeModel |
| 10 | Sahgal — spinal cord tolerance | `sahgal-2021-hytec-spinal-cord` | modelled: ClinicalConstraint + reirradiation guidance |
| 11 | Vargo — H&N reirradiation TCP | `vargo-2021-hytec-hn-reirradiation-tcp` | modelled: 1/2/3-летний LC на 5-fraction-equivalent шкале |
| 12 | Grimm — carotid/major-vessel bleeding | `grimm-2021-hytec-major-vessels` | modelled: ClinicalConstraint; не универсальная NTCP-модель |
| 13 | Lee — stage-I NSCLC local control | `lee-2021-hytec-stage-i-nsclc` | partial: plateau guidance + отдельные явные Ohri size-adjusted examples |
| 14 | Kong — thoracic lung parenchyma | `kong-2021-hytec-lung-parenchyma` | partial: ClinicalConstraint; не patient-specific непрерывный NTCP |
| 15 | Ohri — liver SBRT local control | `ohri-2021-hytec-liver-local-control` | modelled: OutcomeModel, стратификация |
| 16 | Miften — liver dose-volume toxicity | `miften-2021-hytec-liver-toxicity` | partial: ClinicalConstraint; не все fits |
| 17 | Mahadevan — pancreas SBRT local control | `mahadevan-2021-hytec-pancreas-tcp` | partial: OutcomeModel, R0 / unresected отдельно |
| 18 | Stumpf — adrenal TCP | `stumpf-2021-hytec-adrenal-tcp` | modelled: OutcomeModel |
| 19 | Royce — prostate SBRT TCP | `royce-2021-hytec-prostate-tcp` | modelled: OutcomeModel |
| 20 | Wang — prostate SBRT toxicity | `wang-2021-hytec-prostate-toxicity` | partial: ClinicalConstraint, без универсальной непрерывной NTCP |

**Результат библиографии: 20/20 основных HyTEC-статей зарегистрированы.** Это не равно «20/20 моделей полностью запрограммированы». Неполное кодирование отдельных fits отражает ограничения доказательств и область применения.

В конце выпуска идут пять комментариев и ответов на публикации, включая дискуссии о liver local control и indirect/immune effects. Они **не считаются отдельными исходными TCP/NTCP evidence records** и не превращаются в коэффициенты по умолчанию. В будущий bibliographic-discussion index их можно добавить отдельно, если потребуется строгий реестр всей корреспонденции выпуска.

## Остальная ключевая литература, сопоставленная с реестром

| Группа | Представлена в source registry? | Что реализовано / что не подменяем |
|---|---|---|
| Basic Clinical Radiobiology 2025, глава LQ | Да | Теория LQ, BED/EQD₂, repair/repopulation; не все примеры учебника — автоматические значения |
| Раннее BCR 2009, перевод 2014, Handbook 2022 | Упомянуты в методическом аудите, но не каждый отдельным source object | Исторический и физико-методический контекст |
| Vogelius & Bentzen 2020 | Да | Prostate biochemical-control α/β с контекстом/неопределённостью |
| Brand 2021 rectal и Brand 2023 GU | Да | Раздельные клинические endpoint estimates |
| FAST, FAST-Forward 5y и 10y | Да | Клинические режимы / endpoints / long-term context |
| RCR Dose Fractionation 2024 | Да | Regimen Library; preset не выбирает α/β |
| RCR Timely Delivery 2019 | Да | Gap governance/BID/OTT; явный выбор Dprolif/Tk |
| ESTRO–EORTC reirradiation 2022 | Да | Type I / Type II и структура сценариев |
| RCR Principles of Reirradiation 2024 | Да | Кумулятивная эквивалентная доза, явные допущения |
| Appelt/ESTRO cumulative dose 2026 | Да | Стратегии суммирования и регистрационные ограничения |
| Paradis/ReCOG и Zhang case guide 2026 | Да | Reporting/point-dose/3D strategies; без автоматического DICOM summation |
| Samai & Berremdani 2026 | Да | Методическая перепроверка α/β без перезаписи первичных estimates |
| Proton radiobiology/LET/RBE | Отложено | Не входит в photon HFC и не вводится в модель молча |

## Что осталось для настоящего полного «внесли всю литературу»

1. **Регистрацию источника не смешивать с количественной реализацией.** 20/20 HyTEC — библиографически закрыто; основные NTCP fits некоторых статей намеренно представлены лишь частично.
2. **Независимая научная курация остаётся необходимой** для любых новых continuous TCP/NTCP equations. Без воспроизводимых коэффициентов, ковариат, метрик и правил неопределённости их нельзя переносить как пригодные к клиническому расчёту.
3. **Пофайловая сверка исходного архива** ещё требует доступных байтов оригинальных PDF/ZIP и манифеста (имя → DOI/PMID → назначение → статус). Текущий каталог не доказывает, что проверен каждый PDF из ранее описанных 71 файлов.
4. **Пять писем/ответов HyTEC** помечены как commentary, а не численные модели. Это осознанное ограничение, не потерянная переносимая формула.
5. **Voxel EQD₂ / DICOM** остаётся будущим изолированным модулем, не меняет текущую LQ/HyTEC верификацию и не выдаётся за готовый функционал.
6. **Clinical commissioning / independent validation** не завершены; статус evidence dataset остаётся `draft`.

Сверка библиографии добавила только четыре методические ссылки HyTEC без новых дозовых констант, коэффициентов α/β, схем фракционирования или изменённых автоматических clinical defaults.
