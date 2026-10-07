# Аудит исходного пакета литературы HFC

## Назначение

Этот документ фиксирует роль литературы из исходного пакета `HypoCalc.zip` в архитектуре HFC.

Принцип проекта: **не каждый документ должен превращаться в численный параметр**. Источники разделяются на:

1. теоретический фундамент;
2. первичные/клинические источники параметров;
3. рекомендации и clinical presets;
4. dose-volume / outcome evidence;
5. справочные и исторические материалы.

Число не переносится в HFC только потому, что оно встречается в обзоре или учебнике. Когда возможно, сводное значение проверяется по первичной публикации.

## 1. Теоретический фундамент

### Basic Clinical Radiobiology, 6th ed., 2025

**Статус: используется непосредственно.**

Основной теоретический каркас текущего HFC:

- LQ model;
- BED и EQD₂;
- endpoint-specific α/β;
- incomplete repair;
- T½;
- treatment-time correction;
- Dprolif/Tk;
- ограничения применимости моделей.

Глава 10 уже представлена в source registry как `bcr-2025-ch10-tables`, но HFC не принимает все табличные значения как автоматические defaults: спорные значения проходят отдельную primary-source проверку.

### Basic Clinical Radiobiology, 4th ed., 2009

**Статус: исторический/контрольный источник.**

Используется как предшествующая редакция для сопоставления терминологии и развития моделей. Для новых параметров приоритет имеет 6-е издание 2025 и первичные публикации.

### Русское издание «Основы клинической радиобиологии», 2014

**Статус: русскоязычная версия 4-го английского издания; справочный источник.**

Не рассматривается как независимый источник коэффициентов.

### Handbook of Radiotherapy Physics: Theory and Practice, 2nd ed., 2022

**Статус: физико-методологический фон.**

Полезен для общей радиотерапевтической физики и связи физической/биологической дозы, но не используется как источник endpoint-specific клинических коэффициентов.

### Linear Quadratic Model in the Clinical Practice via the Web-Application

**Статус: исторический источник идеи/предшественник продукта.**

Документ описывает подход исходного web-калькулятора `hypo-calc`. HFC развивается независимо: формулы и особенно клинические коэффициенты проверяются по современной литературе и не копируются из приложения как авторитетный источник.

### Quantitative Radiobiology for Proton Therapy, 2024

**Статус: отложено по области применения.**

Текущая evidence-v0.1 HFC ориентирована на photon external-beam radiotherapy. Книга важна для будущего proton/RBE/LET слоя, но её модели не должны незаметно смешиваться с текущей photon-моделью.

## 2. Endpoint-specific α/β и breast hypofractionation

| Источник | Текущее использование |
| --- | --- |
| Vogelius & Bentzen 2020 | Да — prostate biochemical control α/β |
| Brand et al. 2021 + supplement | Да — endpoint-specific late rectal toxicity |
| Brand et al. 2022/2023 + supplement | Да — endpoint-specific GU toxicity |
| FAST 10-year 2020 | Да — breast normal-tissue α/β |
| FAST-Forward 5-year 2020 + appendix | Да — clinical validation |
| FAST-Forward 10-year 2026 + appendix | Да — long-term validation и endpoint-specific model estimates |

Эти публикации входят в текущий evidence registry и validation inventory.

## 3. Treatment interruptions

### RCR Timely Delivery, 4th ed., 2019

**Статус: используется непосредственно.**

Определяет клиническую логику Treatment Gap, правила ускорения, минимальный интервал при BID и governance.

При этом HFC различает:

- BED-based `K`;
- EQD₂-based `Dprolif`.

Они не считаются взаимозаменяемыми.

## 4. Reirradiation

| Источник | Текущее использование |
| --- | --- |
| ESTRO–EORTC consensus 2022 | Да — definitions/type I/type II/clinical decision framework |
| RCR Principles of Reirradiation 2024 | Да |
| Appelt et al. ESTRO cumulative-dose consensus 2025/2026 + supplement | Да |
| Zhang et al. ReCOG case guide 2026 + supplement | Да |

Дополнительно к исходному архиву HFC использует **Paradis et al. ReCOG consensus 2026** как более общий международный consensus source.

## 5. RCR Dose Fractionation, 4th ed., 2024

**Статус до текущего этапа: архитектурно учтён, но ещё не превращён в machine-readable regimen dataset.**

Документ предназначен для следующего этапа:

- regimen presets;
- site/intent metadata;
- total dose / number of fractions / overall schedule;
- grade of recommendation;
- regression/golden tests.

Ключевое правило HFC:

> regimen preset не выбирает α/β автоматически.

Preset описывает клинически применяемую схему, а биологический параметр остаётся отдельным endpoint-specific evidence selection.

## 6. HyTEC package

Исходный архив содержит практически полный тематический пакет HyTEC 2021. Текущая реализация **не кодирует весь пакет сразу**.

### Уже machine-readable

| HyTEC | Статус |
| --- | --- |
| Milano — Brain tolerance SRS | Включён: V12/V20/V24 risk points |
| Milano — Optic pathways tolerance | Включён: Dmax 1/3/5 fx |
| Sahgal — Spinal cord tolerance | Включён: de novo SBRT risk ranges + reirradiation guidance |

### Используется как архитектурный/методологический контекст

- HyTEC overview;
- dose-response modelling primer;
- biological principles of SBRT/SRS.

Они поддерживают решение не сводить high-dose evidence к одному EQD₂ и хранить dose metric, fractionation, endpoint, risk и prior-RT context отдельно.

### OutcomeModel v0.1 — machine-readable

После первичной сверки пакета отдельно реализованы:

- brain metastases TCP;
- vestibular schwannoma TCP;
- spinal metastases TCP;
- liver metastases BED10-stratified local control;
- adrenal metastases TCP;
- prostate SBRT TCP.

Source-specific α/β, использованный авторами для BED/EQD₂, хранится только как provenance модели и не становится HFC α/β default.

### ClinicalConstraint v0.2 — machine-readable

Дополнительно закодированы с сохранением типа доказательства:

- carotid/major-vessel bleeding guidance при head-and-neck SBRT reirradiation;
- lung parenchyma symptomatic RILT observational thresholds;
- liver SBRT mean-liver-dose objectives;
- prostate SBRT bladder/urethra/rectum suggested thresholds.

### Ещё не закодировано полностью

Следующие работы не потеряны, но требуют дальнейшей курации или расширения schema:

- head-and-neck reirradiation TCP;
- stage-I NSCLC local control;
- pancreas SBRT outcomes;
- отдельные detailed NTCP fits из prostate toxicity, если будет доказана польза их воспроизводимого переноса.

HyTEC immunomodulatory paper и письма/ответы 21–25 рассматриваются как контекст дискуссии, а не самостоятельные численные defaults.

## 7. Что добавлено сверх исходного пакета

В ходе evidence validation HFC дополнил исходный архив первичными источниками, необходимыми для проверки сводных таблиц и неоднозначных параметров, включая:

- Bentzen/Ruifrok/Thames repair;
- Withers tonsil time effect;
- Koukourakis NSCLC time effect;
- Hinata medulloblastoma;
- Haviland breast time effect;
- Thames prostate overall treatment time;
- Roberts/Robertson larynx;
- Hendry missed-days model;
- Turesson/Bentzen normal-tissue fractionation;
- Stuschke, Geh, Dubray, Denham, Dische, Jin, Schultheiss;
- Paradis et al. ReCOG 2026.

Это намеренное усиление исходной базы, а не замена пользовательского пакета интернет-источниками.

## 8. Вывод

Исходный пакет **учтён как фундамент проекта**, но степень реализации различается:

- теория LQ/BED/EQD₂/repair/repopulation — реализована;
- endpoint-specific α/β из ключевых статей — реализована;
- Treatment Gap — реализован;
- Reirradiation — реализован;
- выбранные HyTEC constraints — реализованы;
- RCR regimen library — следующий этап;
- полный HyTEC TCP/NTCP/outcome layer — будущий этап;
- proton-specific quantitative radiobiology — вне текущего photon scope.

Таким образом, отсутствие отдельной записи в `sources.ts` не всегда означает, что источник забыт. Но для каждого будущего клинического численного объекта должен существовать явный machine-readable source/provenance.
