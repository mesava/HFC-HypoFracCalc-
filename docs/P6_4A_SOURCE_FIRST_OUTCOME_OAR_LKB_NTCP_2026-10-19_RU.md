# HFC — P6.4a: source-first расширение OutcomeModel / OAR и изолированный LKB-NTCP prototype

**19.10.2026; статус: исследовательская ветка и новый научный аудит.**  
Baseline: `develop ef4138ef03fa4722a4034a91b86264e35d5f9a09`. **Никакой клинический коэффициент в `src/data/evidence` не меняется, версии dataset остаются `draft`.**

## 1. Контроль исходного объёма

Реально по исходным .ts-файлам сопоставлено **9 OutcomeModels и 40 их опубликованных точек** (4+6+8+2+1+4+6+6+3), **29 HyTEC clinical constraints**, **25 fixed RCR2024 regimens** и **4 complex RCR2024 regimens**. В outcomes Royce уже содержит **2** явно помеченных несоответствия `sourceReproducibility="unresolved-equation-table-mismatch"` и остаётся в отдельном [P6.1/#93](https://github.com/mesava/HFC-HypoFracCalc-/pull/93) gate. Ohri NSCLC хранит авторские проценты, но численно формула расходится с одной из шести опубликованных оценок (93% vs ≈94.8%) — нельзя закрывать [issue #59](https://github.com/mesava/HFC-HypoFracCalc-/issues/59) без первичной авторской проверки.

Полная 38-строчная карта существующих записей: [P6.4 source-classified gate](P6_4A_38_LIVE_OUTCOME_OAR_SOURCE_GATES_2026-10-19.csv). У каждого ряда `individual_treatment_planning_certified=false` и `source_dose_metric_harmonized_for_patient_DVH=false`. Последнее **не** означает, что опубликованная исходная метрика неверна; означает, что независимое сопоставление с произвольным patient DVH не выполнено.

Важные source-specific различия:
- **Redmond brain SRS**: PTV-margin prescription vs isocentre or mean tumour dose, source `SFED20`, не общий `alpha/beta` HFC.
- **Milano brain V12/V20/V24**: `target-inclusive tissue` vs `brain-minus-target`; некоторые опубликованные V12 точки получены через study-level harmonization, **не** индивидуальное измерение пациентского DVH.
- **Sahgal spinal cord**: диапазоны из различных моделей и contour (thecal sac/true cord), **не** 95% CI и не один универсальный предел.
- **Miften liver**: `VleX >= 700cc` spared *normal liver* vs `D700cc` (неэквивалентно); mean-liver-dose depends on disease population.
- **Grimm major vessel**: планировочный `D0.5cc` и риск-пункты `Dmax` — разные метрики; контекст повторного SBRT.
- **Wang prostate SBRT**: observational ranges, не категорический hard constraint.

Исходная документация `OUTCOME_MODELS.md`, `CONSTRAINTS.md`, `REGIMEN_LIBRARY.md` уже содержит эти разграничения. P6.4 не переименовывает их в NTCP модели и не добавляет ложную вероятность NTCP из единичного порога.

## 2. Литература для реально нового направления NTCP

### Candidate 1 — Gulliford et al., 2012, G2 rectal bleeding

[Original author abstract PMID 22119373](https://pubmed.ncbi.nlm.nih.gov/22119373/), [DOI 10.1016/j.radonc.2011.10.022](https://doi.org/10.1016/j.radonc.2011.10.022).

388 пациентов MRC-RT01 (prostate 3D-CRT; 64 vs 74 Гр arms), пять rectal endpoints с раздельной моделью Lyman–Kutcher–Burman. **Для названной авторами Grade-2 rectal bleeding** published maximum-likelihood fit:

`TD50(1)=68.5 Gy [95% CI 66.8..70.8]`, `m=0.15 [0.13..0.17]`, `n=0.13 [0.10..0.17]`.

Числа **воспроизведены из официального author abstract**, но fulltext/table, точная dose normalization (rectum contour, original per-bin dose and trial prescription), parameter covariance, bootstrap/leave-one-out and independent clinical validation **НЕ воспроизведены**. Интересно именно наличие endpoint-specific **n**: модель нельзя подменять обобщённой `rectum NTCP`.

### Candidate 2 — Semenenko & Li, 2008, symptomatic lung pneumonitis

[PMID 18199912](https://pubmed.ncbi.nlm.nih.gov/18199912/). Мета-анализ опубликованных cohorts; для **paired whole lung** source assumed `n=1`, `m=0.41 [0.38..0.45]`, `TD50=29.9 [28.2..31.8] Gy`. При отличных от 2-Gy fractionation источники пересчитывали mean dose в **EQD2, α/β=3 Gy**. Эти модельные assumptions не дают права механически переносить модель на heterogeneous SABR DVH. **n=1 fixed assumption, not measured CI**.

### Candidate 3 — Semenenko & Li, 2008, xerostomia

Тот же [PMID 18199912](https://pubmed.ncbi.nlm.nih.gov/18199912/): stimulated salivary flow below 25% within six months; `n=1` fixed, `m=0.53 [0.45..0.65]`, `TD50=31.4 [29.1..34.0] Gy`. Нельзя подменять этот endpoint врачебным grade≥2 xerostomia или поздней субъективной сухостью рта.

Контрпример переносимости — [external QUANTEC rectal-bleeding validation PMID 20831493](https://pubmed.ncbi.nlm.nih.gov/20831493/): в 159 оцененных 3D-CRT пациентах AUC QUANTEC≈0.61, что показывает ограниченную discriminative ability. Это **другая проверяемая модель**, не прямое внешнее валидирование коэффициентов Gulliford; нельзя смешивать.

Все кандидаты перечислены в [3-row candidate registry](P6_4A_LKB_NTCP_RESEARCH_CANDIDATES_2026-10-19.csv), **вне клинической evidence registry**, без HFC auto-selection.

## 3. Реальный математический компонент (не клиническая функция)

Добавлен **изолированный** `src/research/lkbNtcpPrototype.ts` с функцией `evaluateResearchLkbExample`, не импортируемой браузерной страницей и калькулятором. Вход — только заранее заданный **дифференциальный DVH** (пары Gy и **volumeFraction 0..1**, сумма 1), плюс явно переданные `TD50,m,n`. Возвращает `D_eff`, `t`, normal-CDF model probability. Без DICOM, без контура, без автоматических BED/EQD2 conversions и **без patient risk statement**.

Уравнения (для источников с LKB DVH model):

```math
D_eff = (sum_i v_i * D_i^(1/n))^n
t = (D_eff - TD50) / (m * TD50)
P_model = Phi(t)
```

При `n=1` это weighted mean. При однородном дозовом поле `D_eff=D`. `TD50` дает `P_model=0.5`, только внутри математических предпосылок модели.

**Независимые synthetic fixtures** (рассчитаны отдельно через стандартную normal CDF, не из clinical patient DVH):
- `[68.5 Gy, v=1]` ⇒ `D_eff=68.5`, `P=0.5`.
- `[60Gy,v=0.5;70Gy,v=0.5]` при Gulliford `n=.13,m=.15,TD50=68.5` ⇒ `D_eff=66.22402066544781`, `P=0.4123490362321194`.
- `[60Gy,v=0.25;70Gy,v=0.75]` ⇒ `D_eff=68.28593087658744`, `P=0.49168904656670886`.
- При `n=1` на `[60,70]×[0.5,0.5]` ⇒ `D_eff=65`.

Тесты проверяют math monotonicity, uniformity, input volume normalization, strict finite positivity, dose-bound ranges, and that source research candidates **are not linked** to HFC clinical datasets.

**Технический CI passed ≠ source model clinically validated.** Primary fitting inputs/CI covariance, original rectal contour/DVH convention, correction of non-standard fraction sizes, confounders (systemic therapy, endpoint grade), external calibration and ethics/local commissioning are mandatory before any future clinical UI or use.

## 4. P6.4b scientific roadmap — gated

| Очередь | Реальное действие | Стоп-условие |
|---|---|---|
| P6.4b.1 | Получить original fulltext Gulliford/RT01, source LKB equation/table and contours; independent retrospective DVH reproduction & uncertainty | Абстракт и synthetic examples **недостаточны** для clinical integration |
| P6.4b.2 | Оценить Semenenko lung/parotid endpoint and volume basis and EQD2 conversion; compare competing QUANTEC fit parameter sets | Не переносить `n=1` на high-dose SABR без source validation |
| P6.4b.3 | OAR metric-specific DVH evaluator: `Vx`, `VleX`, `D0.5cc`, `Dmax`; explicit contoured structure and fraction count | Не считать clinical constraint risk point hard constraint / NTCP |
| P6.4b.4 | RCR2024 coverage: сверить **25 fixed + 4 complex** с оригинальными разделами RCR 2024 (22 tumour-site chapters), затем добавить только проверенные отсутствующие regimes | Не превращать SIB/sequential в одну `n×d` схему или назначенный α/β |
| P6.4b.5 | Дальнейшая интеграция HFC vs BioRT/TCP-NTCP calculator (отдельный проект) после согласования архитектуры | Нет patient data/model validation, no UI or clinical production import |

**Итог P6.4a:** новые клинические вероятности, CI, α/β, HyTEC threshold или RCR regimens **не добавлялись**. Добавлена **воспроизводимая исследовательская математическая функция** и структурный scientific approval gate. Данные и сайт остаются в `draft`. 
