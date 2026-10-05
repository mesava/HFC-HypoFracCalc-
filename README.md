# HFC — HypoFracCalc

**HFC (HypoFracCalc)** — веб-калькулятор клинической радиобиологии для дистанционной лучевой терапии фотонными пучками с отслеживаемой доказательной базой.

Проект вырос из полезных клинических идей, реализованных в `hypo-calc`, но HFC разрабатывается как независимая реализация со следующими принципами:

- биологические параметры привязаны к конкретным клиническим endpoint, а не только к органу;
- для каждого параметра сохраняется источник;
- явно отображаются неопределённость и ограничения применимости;
- математическое ядро, evidence database и пользовательский интерфейс разделены;
- пользовательские значения сохраняются как manual override, а не изменяют доказательную базу;
- расчёты должны быть воспроизводимыми и пригодными для аудита.

> HFC разрабатывается как инструмент **clinical decision-support / независимой радиобиологической проверки** для специалистов лучевой терапии. Это **не система назначения лечения**.

## Язык сайта

Основной язык HFC — **русский**.

Сайт ориентирован прежде всего на русскоязычное сообщество медицинских физиков и радиационных онкологов. В интерфейсе предусмотрено переключение:

```
RU | EN
```

Русская версия является основной. Английская версия предназначена для международного использования и обмена результатами.

## Текущее состояние сайта

| Модуль | Статус | Назначение |
|---|---|---|
| Главная | реализовано | Обзор проекта и модулей |
| Quick EQD | реализовано | BED, EQD₂, выбор α/β из evidence database или вручную |
| Compare Regimens | реализовано | Сравнение 2–5 схем для tumour и нескольких OAR endpoints |
| Treatment Gap | v0.1 | OTT, Dprolif/Tk, weekend/BID compensation, решение post-gap dose/fraction |
| Методология | реализовано | Формулы, структура evidence database и ограничения |
| Reirradiation | запланировано | Кумулятивная эквивалентная доза и стратегии dose accumulation |

Подробности по сайту и публикации: [docs/SITE.md](docs/SITE.md).

## Математическое ядро

Базовая LQ-модель:

```
BED = n d (1 + d/(α/β))

EQDx = n d (d + α/β)/(x + α/β)
```

Для EQD₂:

```
x = 2 Gy
```

Реализованы:

- физическая доза;
- BED;
- EQDx / EQD₂;
- обратный расчёт дозы за фракцию для заданного EQD;
- Thames Hm для incomplete repair;
- correction primitives для overall treatment time;
- high-dose LQ warnings;
- расчёты sensitivity по 95% CI α/β.

Математическое ядро не зависит от React/UI.

## Evidence-first модель параметров

Биологические параметры не зашиваются непосредственно в формулы или UI.

Текущий draft dataset содержит:

- endpoint-specific α/β;
- 95% CI, где он опубликован;
- уровень поддержки оценки;
- preferred / alternative / non-default records;
- DOI/PMID и библиографию;
- applicability notes;
- T½ repair;
- EQD₂-based Dprolif и Tk.

Уже курированы данные для:

- prostate biochemical control — Vogelius & Bentzen 2020;
- rectal toxicity — CHHiP / Brand et al. 2021;
- GU toxicity — CHHiP / Brand et al. 2023;
- breast — FAST и FAST-Forward, включая 10-летние данные 2026;
- head-and-neck tumour control и late effects;
- NSCLC;
- lung pneumonitis/fibrosis;
- bowel late effects;
- oral mucositis;
- skin/subcutaneous endpoints;
- oesophageal pathologic complete response;
- spinal-cord myelopathy.

**Опубликованное число не становится default автоматически.**

Например, для spinal cord в текущем наборе имеются существенно различающиеся человеческие оценки α/β, поэтому HFC не выбирает одно значение самостоятельно: пользователь должен явно выбрать источник или использовать manual override.

Документация dataset:
[src/data/evidence/v0.1/README.md](src/data/evidence/v0.1/README.md)

## Пользовательские значения

В поддерживаемых workflows пользователь может заменить curated parameter собственным значением.

Manual override:

- не изменяет evidence database;
- существует только внутри конкретного расчёта;
- маркируется как `user-specified`;
- может содержать rationale.

Это позволяет использовать локальный протокол или проводить sensitivity analysis без потери provenance.

## Неопределённость

HFC пока рассчитывает **one-parameter sensitivity**, а не полную клиническую неопределённость.

Для α/β с опубликованным 95% CI расчёт повторяется на его границах.

Если CI α/β достигает или пересекает 0 Gy:

- BED становится неограниченным при α/β → 0;
- верхняя sensitivity boundary для BED обозначается как unbounded;
- для EQD₂ используется конечный предел при α/β → 0+.

В Compare Regimens sensitivity для ΔEQD₂ является **коррелированной**: одна и та же граница α/β применяется одновременно к обеим сравниваемым схемам.

## Treatment Gap v0.1

Модуль основан на:

- RCR *The timely delivery of radical radiotherapy*, 4th edition;
- *Basic Clinical Radiobiology*, 6th edition, 2025.

Приоритет логики:

1. по возможности сохранить исходные OTT и dose/fraction;
2. использовать weekend recovery;
3. при допустимости рассмотреть BID;
4. только если accelerated compensation невозможна — рассматривать изменение биологической дозы.

Явно учитываются:

- RCR: минимальный BID interval **6 h**;
- BCR 2025: максимально практичный interval, около **8 h и более**, когда возможно;
- RCR: BID не рекомендуется при fraction size существенно выше **2.2 Gy**;
- linear Dprolif correction получает предупреждение при больших OTT extrapolations.

Первый автоматический time-loss default:

```
HNSCC
Dprolif = 0.80 Gy EQD2/day
95% CI  = 0.50–1.10
Tk      = 21 days
```

Dose-compensation solver восстанавливает **tumour effective EQD₂** для заданных пользователем final OTT и числа оставшихся фракций.

Он **не делает вывод об OAR safety по prescription dose**.

Подробнее: [docs/TREATMENT_GAP.md](docs/TREATMENT_GAP.md).

## Архитектура

```
src/
├─ core/
│  ├─ lq.ts
│  ├─ repair.ts
│  ├─ repopulation.ts
│  └─ validation.ts
│
├─ domain/
│  ├─ evidence.ts
│  └─ constraints.ts
│
├─ data/evidence/v0.1/
│  ├─ alphaBeta*.ts
│  ├─ repairHalfTime.ts
│  ├─ repopulation.ts
│  ├─ endpoints.ts
│  ├─ sources.ts
│  └─ manifest.ts
│
├─ evidence/
│  ├─ alphaBetaRegistry.ts
│  └─ repopulationRegistry.ts
│
├─ workflows/
│  ├─ evidenceLq.ts
│  ├─ compareRegimens.ts
│  └─ treatmentGap.ts
│
└─ ui/
   ├─ App.tsx
   ├─ SiteHome.tsx
   ├─ CompareRegimensView.tsx
   ├─ TreatmentGapView.tsx
   ├─ MethodologyView.tsx
   └─ styles.css
```

Дополнительная документация:

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/EVIDENCE_MODEL.md](docs/EVIDENCE_MODEL.md)
- [docs/LITERATURE_REVIEW.md](docs/LITERATURE_REVIEW.md)
- [docs/SITE.md](docs/SITE.md)

## Ветки и `main`

`main` — стабильная production-ветка проекта.

Разработка ведётся в отдельных feature/integration branches и проходит через pull request + CI. Это позволяет не публиковать неподтверждённые изменения непосредственно на основной сайт.

После проверки релиза изменения попадают в `main`, а GitHub Pages собирает production-сайт именно из `main`.

## Локальный запуск

Требуется Node.js 22+.

```bash
npm install
npm run dev
```

Проверка:

```bash
npm run typecheck
npm test
npm run build
```

## Публикация сайта

В репозитории есть workflow:

```
.github/workflows/deploy-pages.yml
```

После push/merge в `main` он:

1. выполняет typecheck;
2. запускает tests;
3. собирает Vite;
4. публикует `dist/` через GitHub Pages.

В настройках репозитория GitHub Pages должен быть выбран источник **GitHub Actions**.

## Версионирование

Calculation engine и evidence dataset версионируются независимо.

Пример:

```
HFC engine:       0.x
Evidence dataset: 2026.10-v0.1
```

Исторический расчёт в дальнейшем должен оставаться воспроизводимым после обновления evidence database.

## Текущий scope

Входит:

- megavoltage photon EBRT;
- LQ-based fractionation comparison;
- treatment interruption modelling;
- evidence-traceable biological parameters.

Пока не входит:

- proton/RBE modelling;
- brachytherapy dose-rate models;
- validated OAR-aware Treatment Gap compensation;
- voxel-wise DICOM EQD₂ accumulation;
- reirradiation;
- prescription/autonomous clinical recommendations.

## Intended use и безопасность

HFC предназначен для квалифицированных специалистов лучевой терапии как прозрачный инструмент расчёта и decision-support.

Для клинического применения необходимы:

- независимая проверка;
- локальный commissioning;
- документированный governance;
- проверка применимых dose-volume constraints;
- клиническое решение специалиста.

Математическая эквивалентность BED/EQD₂ сама по себе **не означает клиническую взаимозаменяемость режимов**.

## Лицензия

MIT — см. [LICENSE](LICENSE).
