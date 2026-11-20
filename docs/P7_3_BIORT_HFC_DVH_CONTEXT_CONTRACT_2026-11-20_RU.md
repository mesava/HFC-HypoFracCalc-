# HFC P7.3 — контракт научного контекста DVH для будущего BioRT ↔ HFC

**Дата:** 20 ноября 2026. **Статус:** отдельный исследовательский PR поверх `develop`; не клинический выпуск. Основание: [issue #116](https://github.com/mesava/HFC-HypoFracCalc-/issues/116), принятые P7.1/P7.2, [HyTEC P6.2g](P6_2G_29_HYTEC_OAR_PRIMARY_SOURCE_AUDIT_2026-11-02_RU.md), [BioRT integration RFC](https://github.com/mesava/BioRT/blob/main/docs/hfc-integration-rfc.md).

## 1. Границы поставки

Вводится только **версионированное представление метаданных**: [JSON Schema 2020-12](contracts/hfc-dvh-context-v0.1.0.schema.json), TypeScript-контракт `src/research/dvhSourceContextContract.ts`, [синтетический JSON](../tests/fixtures/dvh_source_context_v0_1_synthetic.json) и unit-тесты.

**Это не DVH-calculator, не валидированный экспорт из BioRT, не клинический импорт и не OAR compliance checker.** Никаких численных значений измеренных DVH, исходных индивидуальных DICOM и персональных данных в контракте нет. Для v0.1.0 обязателен `dataClass="synthetic"`. Не следует применять модель к реальному пациенту даже после технического PASS.

## 2. Верифицированные архитектурные предпосылки BioRT (на 20.11.2026)

- `BioRT.Core/DVHResult.cs` / `StructureDVH.cs`: dose arrays в Gy, volume bins в процентах, отдельно `MeanDose` и `MaxDose`; существующие классы **не хранят полного provenance** контуров, RTSTRUCT↔RTDOSE и метрик отдельных опубликованных OAR constraints.
- `BioRT.Core/DoseMetricCalculator.cs`: cumulative DVH binning/interpolation; Dx/Dcc/Vxx require exact definition of %/cc and sampled ROI volume. `Dmax` и `D0.5cc` **не** автоматические эквиваленты.
- `BioRT.IO/DicomFrameOfReferenceGuard.cs`: отклоняет RTDOSE/RTSTRUCT mismatch, включая ROI ReferencedFrameOfReferenceUID; регистрация между разными системами координат не реализована.
- `BioRT/docs/hfc-integration-rfc.md`: BioRT владеет DICOM/геометрией/DVH, HFC — source evidence и радиобиологическими расчетами; отдельные репозитории, локальная интеграция, без облачной передачи пациентских DICOM по умолчанию.

Новый исследовательский контракт **не подключен к BioRT** и не утверждает, что существующий BioRT может автоматически заполнить или независимо верифицировать эти поля. До этого нужны сопоставления с реальными полями .NET, независимые geometry/ROI QA и отдельное одобрение.

## 3. Версия и семантика полей

| Блок | Обязательное содержание | Почему |
|---|---|---|
| `contractVersion` | `hfc-dvh-context/0.1.0` | Не принимать несовместимый формат незаметно |
| `dataClass` | Только `synthetic` | Не пускать пациентские DICOM/идентификаторы в research-файлы |
| `constraintId / endpointId` | Точное соответствие записи HyTEC | `brain-symptomatic-radionecrosis` ≠ `brain-necrosis-edema-any` |
| `roi` | ROI number, name, объёмная основа, модельный контур, `definitionReviewed` | Название RTSTRUCT не подтверждает идентичность структур |
| `geometry` | Пара **синтетических** FoR UID; frame-match, mask QA, registration status | Невозможно сопоставлять структуру и дозу без проверки геометрии |
| `measurement` | Точная метрика, unit, `doseBasis`, side of threshold, DVH cumulative/differential, %/cc, bin width, interpolation, voxel-vs-point Dmax, sampled cc | Нельзя автоматически заменить `VleX` на `Vx`, `Dmax` на D0.03cc, EQD2 на physical Gy |
| `treatment` | fractions, technique, population, previous RT, fraction schedule, **все** Rx targets с явным выбранным target, phase count, multi-course/phase status | Разные мишени могут иметь разные Rx; ReCOG требует provenance фаз и планов |

Отсутствующие измеримые факты представлены только явным `null` или `unknown`, не вычисляются по названию PTV/технике. Для `V(Rx dose)` всегда необходимо указать **конкретный Rx target**, даже если экспорт содержит только одну мишень. Многомишенный RTPLAN без выбора target не проходит сопоставление.

`geometry.registered-reviewed` оставляет `indeterminate`: сам факт регистрации не означает независимой клинической валидации трансформации. Равенство FoR UID и `maskQa=pass` в синтетическом тесте демонстрируют только *декларированный* контекст, не реальную QA.

## 4. Научные запреты и статусная логика

Функция `assessDvhResearchContext(input: unknown)` сначала проверяет типы, ключи, версию и строгую форму JSON, затем связывает ее с **ровно одной из 29 существующих** source records через P7.2.

- `invalid-contract`: другая версия, реальный patient payload, нераспознанные дополнительные ключи, неверная структура/типы/числа или неизвестный source record.
- `incompatible`: подтверждённая несовместимость — разная FoR при `same-frame`, failing geometry QA, BED/EQD2 вместо total physical Gy, неправильный dose/volume unit, другой endpoint, `Vx` vs `VleX`, отсутствующая выбранная Rx target из списка и другие source-domain contradictions.
- `indeterminate`: нет независимой регистрации/маски/ROI QA, неизвестны DVH-конвенции, пример `Dmax` доступен только как voxel sampled maximum, два одновременно облучаемых phase или несколько курсов, оригинальная heterogeneity prostate, reconstructed pooled Milano V12, extrapolated upper spinal cord, нарушение *советующего* расписания Grimm.
- `source-metadata-compatible`: **только** формальные поля выглядят согласованными. **Не** означает source population eligibility, клиническое выполнение OAR-ограничения, валидный contour/dose, валидность TCP/NTCP либо возможную подготовку предписания.

Во всех четырёх случаях без исключений возвращаются:

```text
clinicalUseApproved = false
canAutoEnforce = false
patientRiskCalculated = false
doseVolumeLimitChecked = false
```

Функция **никогда** не получает/сравнивает измеренную дозу с ограничением и не считает риск.

## 5. Критические сценарии для независимой регрессии

- Dmax optic: point maximum не равен sampled voxel maximum; prior RT и число фракций должны совпадать с source cohort.
- Brain SRS: даже совпадающий tissue-inclusive `V12` в части HyTEC source-pooled data имеет оценённую, а не измеренную индивидуальную target-inclusive основу.
- Cord: true spinal cord vs thecal-sac и lower Sahgal vs upper Katsoulakis–Gibbs остаются разными моделями; upper 2–5 fractions LQ-extrapolation не клинический предел.
- Liver: normal liver excluding GTV и spared `VleX` ≥700 cc при ≤X Gy, а не `Vx` above threshold; это не NTCP для liver enzyme.
- Lung: объединённые оба лёгких excluding GTV/IGTV, `V20` в **процентах**; ипсилатеральные лёгкие и %↔cc без объёма не равны.
- Prostate: `V(Rx dose)` только по выбранному prescription target; heterogeneous source contours не превращаются в точные Dmax.
- H&N vessels: Grimm `D0.5cc` nonconsecutive recommendation не следует автоматически приписывать `Dmax` bleeding risk points.
- Two Rx targets, two simultaneous phases, previously irradiated anatomy with/without registration: **не** предлагается автоматического суммирования physical dose, BED/EQD2 или восстановления тканей (TRF).

## 6. Приёмка, дальнейший шаг

**Текущий gate:** npm audit high/critical, TypeScript, Vitest, build и Playwright в CI; отдельные проверки по первичным HyTEC PDF; `evidenceManifest.releaseStatus=draft` и `reviewers=[]` без изменений. Эта итерация сохраняет `main`, UI, все numeric OAR/RCR/TCP/NTCP, ядро BED/EQD2 и исследовательский LKB [PR #97](https://github.com/mesava/HFC-HypoFracCalc-/pull/97) без изменений.

**P7.4 (предложение):** после проверки формата реализовать в **BioRT** отдельный export-adapter, заполняющий только действительно проверенные полями FoR/RTSTRUCT/DVH provenance, показывая `unknown` для отсутствующих; запускать synthetic cross-language golden fixtures C#→JSON→TS; формат применять локально, без выгрузки данных пациентов и автоматической зелёной отметки «passed».

Незакрытые научные задачи: [#56](https://github.com/mesava/HFC-HypoFracCalc-/issues/56), [#59](https://github.com/mesava/HFC-HypoFracCalc-/issues/59), [#104](https://github.com/mesava/HFC-HypoFracCalc-/issues/104), [#107](https://github.com/mesava/HFC-HypoFracCalc-/issues/107).
