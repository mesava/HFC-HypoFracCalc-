# HFC P7.2 — структурированные условия применимости OAR (HyTEC 2021)

**Дата:** 20.11.2026. **Статус:** исследовательский stacked PR поверх P7.1, не опубликовано на основном сайте. **Клинический статус:** dataset `2026.10-v0.2`, `releaseStatus=draft`, commissioning не выполнен.

## 1. Основание: первоисточники, а не заимствованные табличные пределы

Опора на ранее верифицированные семь полных HyTEC PDF и их конкретные страницы: [P6.2g source audit](P6_2G_29_HYTEC_OAR_PRIMARY_SOURCE_AUDIT_2026-11-02_RU.md), [матрица 29/29, включая SHA-256 и PDF-страницы](P6_2G_ALL_29_HYTEC_OAR_PRIMARY_PDF_CROSSWALK_2026-11-02.csv). Аудит P6.2g удостоверяет source-to-code трансляцию, **не** статистический refit и **не** валидацию индивидуального NTCP.

P7.2 **не добавляет** числовых ограничений и **не** выводит рекомендуемых доз. 29 научных записей остаются теми же; строки OAR, `estimatedRisk`, диапазоны, `guidanceKind`, `metric`, `fractionation`, `sourceId`, `endpointId` и BED/EQD2 не меняются. Изменяются лишь 5 `volumeBasis` в существующем справочнике, служебная матрица происхождения и изолированный от UI исследовательский код.

## 2. Пять источниково обоснованных дополнений `volumeBasis`

| Record ID | Source/исходные страницы (из P6.2g) | Структурированный контур |
|---|---|---|
| `hytec-lung-rilt-mean-dose-under8gy` | Kong, HyTEC_14, PDF p2,5,14 | `bilateral-lungs-minus-gtv-or-igtv` — *оба* лёгких за вычетом GTV или IGTV; не ипсилатеральное лёгкое и не lungs-minus-PTV |
| `hytec-liver-primary-mld-3fx-13gy` | Miften, HyTEC_16, PDF p8,9 | `normal-liver-minus-gtv` |
| `hytec-liver-primary-mld-6fx-18gy` | Miften, HyTEC_16, PDF p8,9 | `normal-liver-minus-gtv` |
| `hytec-liver-metastases-mld-3fx-15gy` | Miften, HyTEC_16, PDF p8,9 | `normal-liver-minus-gtv` |
| `hytec-liver-metastases-mld-6fx-20gy` | Miften, HyTEC_16, PDF p8,9 | `normal-liver-minus-gtv` |

Эти определения уже находились в исходных описаниях/notes и P6.2g; раньше они **не были machine-readable** для mean-dose. После дополнения средняя доза не может считаться source-comparable, если supplied contour — иной. Тот же источник для печени имеет ограничения статистической модели (17/288 grade 3+ enzyme events, `P=0.10`); явный контур **не превращает** параметр в индивидуальную оценку риска.

## 3. Независимый контекстный реестр P7.2

Исследовательский `src/research/hytecOarSourceProfiles.ts` сопоставляет **29/29** существующих идентификаторов с типизированными признаками:

- **Source population (группа)** — brain metastases, lesions near optic pathways, de novo spine SBRT, head/neck reirradiation, small peripheral lung SBRT, liver primary/metastatic или prostate SBRT. У spared-liver имеются две допускаемые категории, поскольку это практика планирования, а не самостоятельный fit для одного типа опухоли. Совпадение категории **не равно** подходящему пациенту.
- **Dose-reporting contour** — optic nerve/chiasm, target-inclusive brain, model-specific thecal sac/true cord, carotid vessel, both lungs minus GTV/IGTV, normal liver minus GTV, source-defined bladder/urethra/rectum.
- **Dose statistic** — точечный Dmax, D0.5cc, mean dose, Vx, VleX (объём, сохранённый при дозе ≤X) или V(Rx dose); никакой взаимозаменяемости.
- **Смысл** — planning guidance, model-derived risk points, observational association или insufficient-fit spared-volume practice. Это исследовательские категории, а не автоматические tolerance/NTCP.
- **Fraction schedule** — только `hytec-major-vessel-d0p5cc-5fx-20gy` имеет явную пометку `nonconsecutive-advised`; у остальных нет доказанного общего schedule rule. В частности, нельзя автоматически приписывать pooled Dmax 20/30 Gy моделям тот же temporal risk.

Ключевые научные ограничения: target-inclusive HyTEC brain V12 частично строился на агрегировании измеренных/оценённых target volumes (поэтому P7 выдаёт `indeterminate` даже при совпадении имени контура); spinal cord Table 3 соединяет **разные модели и структуры**, true-cord 2–5fx upper — LQ extrapolation, а не отдельный клинически доказанный tolerance; D0.5cc vessel guidance ≠ pooled Dmax 20/30 risk; VleX печени ≠ Vx; неопределённость prostate source contour остается `indeterminate`.

## 4. Новые проверки (только исследовательский слой)

`assessConstraintSourceContext` теперь кроме P7.1 metric/unit/fractions/technique/priorRT/volumeBasis принимает:

- `endpointId` (нельзя подменить симптоматический радионекроз на иной endpoint);
- `patientPopulation` вместе с ручным `populationReviewed`;
- `reportingContour` (класс reporting contour; его указание **не** валидирует DICOM-сегментацию);
- `fractionDeliveryPattern` для ограниченного по времени H&N SBRT planning guidance.

Вывод: `incompatible`, `indeterminate`, `source-metadata-compatible`. Несоответствие source-популяции, endpoint или контуру — incompatible; неизвестное поле, heterogeneity, модельная экстраполяция и source-guidance schedule mismatch — indeterminate. **Даже при `source-metadata-compatible` всегда `canAutoEnforce=false`, `clinicalUseApproved=false`, `patientRiskCalculated=false`.** Никакой автоматической проверки «допустимой дозы» в результате не появляется.

## 5. Тесты, проверка и ограничения поставки

- Новый `tests/p7_2OarSourceProfileGate.test.ts`: полный coverage всех 29 научных ID, классы dose metrics, явные пять MLD, ошибочная популяция liver primary vs metastatic, heterogeneity brain/prostate, разные OAR endpoint, nonconsecutive vessel advice, spinal model-contour.
- Обновлены P7.1 тесты и P6.2g provenance test, чтобы все `live_volume_basis` в source-crosswalk совпадали с кодом, а MLD больше не считался «неструктурированным».
- В исходной матрице P6.2g актуализированы только **5 существующих `live_volume_basis`**, а не количественные критерии или source SHA.
- Данный PR не вносит DICOM/DVH import, не считает дозы или NTCP, не меняет UI, значения Rx, TRF, ReCOG и научные `draft` статусы.
- Исследовательский PR P7.1 должен отдельно пройти review и быть интегрирован только после технической приёмки; P7.2 остаётся stacked PR, **не** сливать напрямую в `main`.

## 6. Следующий этап (P7.3)

Разработать без автоматической клинической приёмки **структуру импорта контекстных DVH-метаданных из BioRT**: явные RTSTRUCT идентификаторы/contour QA, дозовую основу (total physical Gy vs per-fraction vs EQD2), границы числа фракций, интервал при reirradiation, volume basis, предписание, endpoint, unknown handling. Начинать с synthetic fixtures и cross-language tests; DICOM-to-patient расчёты и количественные clinical comparisons — только после независимой физической/клинической QA.

Открытыми остаются [#56](https://github.com/mesava/HFC-HypoFracCalc-/issues/56), [#59](https://github.com/mesava/HFC-HypoFracCalc-/issues/59), [#104](https://github.com/mesava/HFC-HypoFracCalc-/issues/104), [#107](https://github.com/mesava/HFC-HypoFracCalc-/issues/107) и отдельный исследовательский LKB [PR #97](https://github.com/mesava/HFC-HypoFracCalc-/pull/97).
