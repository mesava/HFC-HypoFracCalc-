# HFC 0.1.0-rc.1 — release candidate

Дата подготовки: 2026-10-07.

## Назначение

Этот release candidate фиксирует первую целостную версию HFC перед переносом `release-v0.1-dev → main`.

RC не меняет основной принцип проекта: HFC является инструментом радиобиологического расчёта, проверки и аудита, а не системой автоматического назначения лечения.

## Что входит

### Радиобиологическое ядро

- BED/EQD₂ для фиксированных фотонных схем;
- endpoint-specific выбор α/β из versioned evidence dataset;
- явные manual overrides;
- sensitivity при наличии опубликованного 95% ДИ.

### Compare Regimens

- 2–5 фиксированных схем;
- один опухолевый endpoint и несколько OAR endpoints;
- source-traceable α/β;
- audit export и replay;
- RCR 2024 fixed-regimen presets.

### Regimen Library

- v0.1: фиксированные RCR 2024 prescriptions, представимые одной парой `n × d`;
- v0.2: отдельные complex prescriptions без неявного сведения к одной схеме:
  - dose ranges;
  - sequential boost;
  - simultaneous integrated boost.

Complex prescriptions пока являются структурированными source-backed references. Они не передаются автоматически в fixed-schedule Compare Regimens.

### OutcomeModel / HyTEC

Machine-readable source-traceable опухолевые outcome records, включая:

- brain metastases;
- vestibular schwannoma;
- spinal metastases;
- liver metastases;
- adrenal metastases;
- prostate SBRT.

Источник-специфические модельные допущения не превращаются автоматически в универсальные HFC defaults.

### Clinical Constraints v0.2

HyTEC records с явным разделением:

- planning limits;
- modelled risk points;
- observational thresholds.

Текущий набор охватывает, среди прочего:

- optic pathways;
- brain radionecrosis;
- spinal cord;
- lung SBRT;
- liver SBRT;
- prostate SBRT toxicity;
- major vessels/carotid при H&N SBRT reirradiation.

Диапазоны и контекст применимости сохраняются без искусственного сведения к одной точке.

### Treatment Gap

- календарь курса;
- стратегии компенсации;
- evidence/manual Dprolif и Tk;
- OAR modelling;
- repair-half-time safety;
- audit/replay.

Исторические широкие временные параметры не используются как скрытые defaults.

### Reirradiation

- Type I / Type II context;
- cumulative BED/EQD₂;
- recovery только как явное допущение;
- remaining EQD₂ budget;
- HyTEC spinal reirradiation context;
- audit/replay с schema 1.1 user confirmations.

### Audit

- audit envelope;
- SHA-256 integrity check;
- legacy schema compatibility;
- import + recalculation/replay;
- engine/evidence version comparison;
- tamper detection.

## Автоматизированные release gates

Для RC обязательны:

1. `npm ci`;
2. `npm audit --audit-level=high`;
3. TypeScript typecheck;
4. unit tests;
5. production build;
6. Playwright browser regression;
7. visual acceptance capture.

GitHub Actions выполняет эти проверки для ветки `release-v0.1-dev`.

## Evidence status

Evidence dataset на стадии RC остаётся `draft`.

Это намеренно: технический release candidate не должен автоматически превращать курируемую доказательную базу в нормативный клинический источник.

## Что не входит в v0.1

- DICOM RT Dose/RT Structure import;
- voxel-wise BED/EQD₂ accumulation;
- deformable dose accumulation;
- автоматическое TCP/NTCP из DICOM;
- автоматический выбор recovery;
- автоматическая проверка DVH как полноценный treatment-planning QA engine;
- proton/RBE modelling;
- brachytherapy dose-rate modelling;
- autonomous treatment recommendation.

Эти направления относятся к следующим версиям и требуют отдельной валидации.

## Условие переноса в main

Перенос RC в `main` выполняется только после зелёного automated CI и release review без блокирующих дефектов. Независимая клиническая проверка остаётся обязательной частью commissioning перед использованием результатов HFC для реальных клинических решений.
