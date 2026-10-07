# Outcome Models — HyTEC v0.1

## Зачем отдельный слой

BED/EQD₂, клинические ограничения и TCP/локальный контроль отвечают на разные вопросы.

- BED/EQD₂ описывают модельную биологическую эквивалентность.
- ClinicalConstraint хранит planning/risk guidance для нормальных тканей.
- OutcomeModel хранит опубликованную связь между дозой и вероятностью опухолевого исхода.

HFC намеренно не смешивает эти сущности.

## Что означает OutcomeModel в HFC

В v0.1 OutcomeModel — это не универсальный калькулятор TCP.

Он представляет курируемый набор опубликованных точек dose–outcome и сохраняет:

- endpoint;
- source;
- evidence form;
- dose/fractionation;
- source-specific BED/EQD₂, если он использован в публикации;
- probability и relation;
- follow-up;
- subgroup;
- признак extrapolation;
- applicability/caveats.

HFC **не интерполирует** между сохранёнными точками и не экстраполирует модель за пределы публикации.

## Evidence forms

### model-derived

Число получено из опубликованной модели/fit источника.

### pooled-observation

Число является объединённым опубликованным outcome estimate без утверждения о непрерывной модели.

### stratified-observation

Сравниваются заранее определённые dose strata/threshold groups. Пример: liver metastases BED10 >100 Gy против ≤100 Gy.

## Source-specific alpha/beta

Некоторые HyTEC analyses преобразуют дозу в BED/EQD₂ с собственным alpha/beta.

Это значение хранится только внутри `biologicalDose.alphaBetaGy` как provenance исходной публикации.

Оно:

- не добавляется в HFC alpha/beta registry;
- не становится preferred/default;
- не подменяет endpoint-specific alpha/beta из отдельной evidence layer.

## Initial HyTEC package

v0.1 включает:

- Redmond 2021 — brain metastases SRS/fSRS, 1-year local control by lesion size;
- Soltys 2021 — vestibular schwannoma SRS/fSRS, 3–5-year TCP;
- Soltys 2021 — spinal metastases SBRT, 2-year TCP;
- Ohri 2021 — liver metastases, BED10-stratified 3-year local control;
- Stumpf 2021 — adrenal metastases, model-derived 1-year local control;
- Royce 2021 — prostate SBRT, 5-year biochemical-control TCP by risk group.

## Что пока не включено

Следующие HyTEC работы требуют отдельной курации перед machine-readable переносом:

- stage I NSCLC local control;
- head-and-neck reirradiation TCP;
- lung parenchyma toxicity;
- liver dose-volume toxicity;
- pancreas SBRT toxicity/outcomes;
- prostate SBRT toxicity;
- carotid blowout.

Причина: эти публикации содержат сочетание fitted models, recommended schedules, heterogeneous endpoints и/или dose-volume correlates. HFC не должен автоматически сводить их к одному числу или одному типу evidence record.

## Безопасность

OutcomeModel не является назначением лечения и не утверждает patient-specific TCP.

Показанная вероятность относится только к опубликованному population/model context. Клиническое решение требует оценки нормальных тканей, геометрии, системной терапии, предшествующего лечения, staging и независимой проверки.
