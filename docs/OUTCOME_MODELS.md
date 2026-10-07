# Outcome Models — HyTEC v0.2

## Зачем отдельный слой

BED/EQD₂, клинические ограничения и TCP/локальный контроль отвечают на разные вопросы.

- BED/EQD₂ описывают модельную биологическую эквивалентность.
- ClinicalConstraint хранит planning/risk guidance для нормальных тканей.
- OutcomeModel хранит опубликованную связь между дозой и вероятностью опухолевого исхода.

HFC намеренно не смешивает эти сущности.

## Что означает OutcomeModel в HFC

В v0.2 OutcomeModel — это не универсальный калькулятор TCP.

Он представляет курируемый набор опубликованных точек dose–outcome и сохраняет:

- endpoint;
- source;
- evidence form;
- dose/fractionation;
- source-specific BED/EQD₂, если он использован в публикации;
- source-reported equivalent fractionation, если публикация нормализует разные схемы к условному числу фракций;
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

## Expanded HyTEC outcome package

v0.2 включает девять source-traceable моделей/наборов точек:

- Redmond 2021 — brain metastases SRS/fSRS, 1-year local control by lesion size;
- Soltys 2021 — vestibular schwannoma SRS/fSRS, 3–5-year TCP;
- Soltys 2021 — spinal metastases SBRT, 2-year TCP;
- Ohri 2021 — liver metastases, BED10-stratified 3-year local control;
- Stumpf 2021 — adrenal metastases, model-derived 1-year local control;
- Royce 2021 — prostate SBRT, 5-year biochemical-control TCP by risk group;
- Ohri 2012 — stage-I NSCLC: шесть опубликованных 2-year TCP examples для 50 Gy/5 и 54 Gy/3 с учётом диаметра 1/3/5 cm;
- Vargo/HyTEC — recurrent previously irradiated head-and-neck malignancy: 1-, 2- и 3-year local-control points на опубликованной 5-fraction-equivalent шкале;
- Mahadevan/HyTEC — pancreatic SBRT: 1-year local-control points с раздельным представлением unresected и R0-resected disease.

Для stage-I NSCLC более поздняя HyTEC review Lee 2021 также зарегистрирована как источник. Она сообщает model-dependent PTV doses около plateau TCP (примерно 43/47/50 Gy для 3/4/5 fractions), но не задаёт одну универсальную вероятность plateau, поэтому HFC **не создаёт искусственную probability point** из этой рекомендации. Численные точки v0.2 для NSCLC взяты из воспроизводимых опубликованных примеров первичной модели Ohri 2012.

## Equivalent fractionation

Для H&N reirradiation и pancreatic SBRT публикации нормализуют неоднородные схемы к условной 5- или 3-фракционной дозе через LQ с source-specific α/β=10 Gy.

HFC хранит это в `equivalentFractionation`, отдельно от `schedule`:

- `schedule` означает реально описанный режим;
- `equivalentFractionation` означает трансформированную дозовую шкалу источника;
- source-specific α/β остаётся provenance модели и **не переносится** в общий HFC alpha/beta registry.

## Что пока не включено

Lung parenchyma, liver, prostate SBRT toxicity и carotid/major-vessel evidence уже представлены в отдельном слое `ClinicalConstraint v0.2`. В OutcomeModel HFC пока сознательно не кодирует все возможные непрерывные NTCP fits и не превращает неоднородные dose-volume корреляции в универсальные patient-specific probability calculators.

Причина та же: перенос допускается только там, где endpoint, dose metric, population context и модель можно воспроизвести без скрытых допущений.

## Безопасность

OutcomeModel не является назначением лечения и не утверждает patient-specific TCP.

Показанная вероятность относится только к опубликованному population/model context. Клиническое решение требует оценки нормальных тканей, геометрии, системной терапии, предшествующего лечения, staging и независимой проверки.
