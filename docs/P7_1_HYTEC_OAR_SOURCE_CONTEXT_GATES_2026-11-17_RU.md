# HFC P7.1 — научная применимость ограничений HyTEC: контур, DVH, фракционирование

**Дата:** 17.11.2026. **Статус:** самостоятельный исследовательский PR (не клинический выпуск), исходные 29 OAR записей и коэффициенты **не изменены**. Научный набор `2026.10-v0.2`, `releaseStatus=draft`.

## 1. Цель и существующая база

P6.2g уже связал **29/29 HyTEC OAR records** с семью оригинальными PDF, их SHA-256, страницами, дозовой метрикой, фракционированием и смыслом: `planning-limit`, `risk-point`, `observational-threshold`. Это проверка переноса исходных данных, **не** автоматический clinical pass/fail и **не** пациент-специфический NTCP. Источниковая матрица: [P6.2g](P6_2G_ALL_29_HYTEC_OAR_PRIMARY_PDF_CROSSWALK_2026-11-02.csv), [отчёт](P6_2G_29_HYTEC_OAR_PRIMARY_SOURCE_AUDIT_2026-11-02_RU.md).

Следующий риск — сравнить корректное опубликованное число **с некорректным DVH-контекстом**, например `brain-minus-PTV` вместо tissue-inclusive `V12`, `Dmax` вместо `D0.5cc` или автоматически выдать model-derived myelopathy dose range за допустимый предел.

## 2. Что добавлено в P7.1

`src/research/constraintSourceContext.ts` — изолированная исследовательская функция, **не импортируется из пользовательского интерфейса**, не сравнивает значение DVH с порогом и ничего не рассчитывает для конкретного пациента. Принимает явный контекст: dose metric + единицу, radiation quality, number of fractions, prior RT, technique, contour/volume basis, source model contour, Rx dose при `V(Rx dose)`, ручное подтверждение популяции.

Возвращает одно из трёх:

- `incompatible` — известное прямое противоречие контексту первоисточника.
- `indeterminate` — недостаточно информации / в реестре нет структурированных source-метаданных / использована LQ-экстраполяция.
- `source-metadata-compatible` — только совпадение **некоторых явно структурированных** предпосылок, **не** утверждение clinical eligibility, валидности модели или выполнения дозового критерия.

При **любом** ответе `clinicalUseApproved=false`, `canAutoEnforce=false`, `patientRiskCalculated=false`. Даже `source-metadata-compatible` не означает «безопасно», «рекомендовано» или «ограничение пройдено». Значения из `src/data/evidence` не меняются.

## 3. Обязательные научные контрпримеры

| Источник / записи | Нельзя делать | Текущий P7 guard |
|---|---|---|
| Milano, brain `V12`, `V20`, `V24` | Подменять tissue-inclusive объём на brain-minus-target; трактовать risk point как универсальный tolerance | Проверка метрики, дозового порога в названии метрики, фракций и `volumeBasis`; только research |
| Sahgal, spinal cord 1–5fx | Смешивать `thecal-sac` нижний Sahgal и `true-spinal-cord` верхний Katsoulakis–Gibbs; считать интервал CI; автоматически применять LQ-extrapolated upper 2–5fx | Требуется model-contour; upper 2–5fx -> `indeterminate` |
| Milano, optic apparatus | Применять Dmax 10/20/25 Gy при предшествующем облучении или неверном числе фракций | `prior-rt-mismatch`, `fraction-count-mismatch` |
| Grimm, major vessels | Переносить оценку bleeding probability по `Dmax` на ограничение `D0.5cc` | `metric-mismatch` + сохранён `guidanceKind` |
| Kong, lung | Подменять bilateral lungs minus GTV/IGTV на ипсилатеральное лёгкое; переводить `V20 %` в `cc` | `volumeBasis`, `unit`, fraction range |
| Miften, liver | Подменять spared normal liver `VleX` на `Vx`; использовать D700cc вместо >=700cc при дозе <=15/17 Gy | `VleX` + `cc` + normal-liver-minus-GTV; остаётся observation |
| Miften, mean liver dose | Делать MLD сравнение без доказанной normal-liver-minus-GTV сегментации; смешивать первичную опухоль и метастазы | Отсутствующий structured `volumeBasis` помечается `indeterminate`, не угадывается из free-text notes |
| Wang, prostate SBRT | Читать `V(Rx dose) <5–10 cc` как `V5Gy` или `V10Gy`; считать Dmax interchangeable with D0.1cc | Строгая метрика, требование явной Rx dose; роль observation |

**Особенно важно для spinal cord:** Sahgal et al., DOI `10.1016/j.ijrobp.2019.09.038`, Table 3 (издание 2021; PDF p8), разделяет две модели и контуры; *курсив* верхней Katsoulakis–Gibbs колонки 2–5fx означает LQ-based extrapolation из single fraction. Это **не** формальная confidence interval и не самостоятельно валидированный patient-specific tolerance.

**Особенно важно для brain:** Milano et al., DOI `10.1016/j.ijrobp.2020.08.013`, abstract / PDF p2: tissue V12 включает target; V20/3fx и V24/5fx относятся к combined brain+target. Публикации гетерогенны по контурам, endpoint и определению симптоматического радионекроза.

## 4. Что именно проверяют тесты

`tests/p7ConstraintSourceApplicabilityGate.test.ts` фиксирует статус `draft` для всех 29 записей, отсутствие автоматического clinical permission, 10 сценариев-сторожей для optic, brain, spine, carotid, lung, liver, prostate и незаполненных контекстных полей. Синтетическая проверка только контекстная; **нет** обработки клинических DICOM/DVH и расчёта осложнений.

## 5. Следующие этапы и release gates

1. **P7.2 — структура данных для DVH source-context**: по исходным страницам добавить `volumeBasis` в MLD (normal liver minus GTV, bilateral lungs minus GTV/IGTV), явно отделить `population`, risk endpoint, schedule/time-pattern и `Dmax` / near-max. Сначала source audit и code-review; численные значения неизменны.
2. **P7.3 — оценка применимости OAR**: матрица per-record `source-context-comparable / unknown / incompatible`, требования к рецепту, contour provenance, dimension/unit, treatment technique, prior RT; результаты только информационные, *not clinical pass/fail*. При DVH импорте предпочтительнее отдельный валидированный слой BioRT.
3. **P7.4 — ReCOG 2026**: issue [#107](https://github.com/mesava/HFC-HypoFracCalc-/issues/107), разделить планы/фазы, physical и EQD2, 3D registration/uncertainty и отдельные значения с/без TRF. Никаких вымышленных 3D доз, TRF или clinical compliance.
4. **P7.5 — NTCP**: draft [PR #97](https://github.com/mesava/HFC-HypoFracCalc-/pull/97) остаётся изолирован; независимые DVH, contour, TD50/m/n, covariance и external validation требуются до интеграции.
5. **Не закрывать научные блокировки:** [#56](https://github.com/mesava/HFC-HypoFracCalc-/issues/56), [#59](https://github.com/mesava/HFC-HypoFracCalc-/issues/59), [#104](https://github.com/mesava/HFC-HypoFracCalc-/issues/104). Публикация исследовательского RC2 в main не устраняет эти несоответствия.

**Запрет:** P7.1 не меняет `src/core`, `src/workflows`, `src/data/evidence`, UI, α/β, OAR numbers, BED/EQD2, releaseStatus, package version или GitHub Pages. Отдельные unit/browser/visual/source QA и независимая клиническая приёмка требуются перед будущим clinical workflow.
