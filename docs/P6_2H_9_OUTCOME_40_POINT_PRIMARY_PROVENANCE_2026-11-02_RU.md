# HFC P6.2h — source-of-truth для 9 HyTEC/Ohri OutcomeModel и 40 опубликованных точек

**Дата:** 02.11.2026. **Материалы:** восемь оригинальных HyTEC PDF из пользовательского `liter(1).zip`, SHA-256 каждого проверены; девятый источник `Ohri et al. 2012, stage I NSCLC size-adjusted` **отсутствует как отдельный документ в текущем загруженном архиве** и ранее изучался отдельно по открытому первичному тексту. Ни один PDF/полный текст не публикуется в GitHub.  
**Scope:** исходные числовые точки, dose basis, endpoint/follow-up и выявленные несовместимости; **не** повторное ML refitting и не patient TCP.

## 1. Полнота и проверка против живой базы

**9/9** действующих OutcomeModel групп и **40/40** их `point_id` связаны с опубликованным HFC P2 реестром `HYTEC_P2_RECORD_LEVEL_LEDGER_2026-10.csv`. Проверены тождество `point ID`, `source ID`, `endpoint ID`, `model ID` и процент (исторически внесённое опубликованное значение против `probability` текущего кода); все **40/40 согласованы**. Это **проверка воспроизводимости переноса и provenance**, а не утверждение о независимой репликации авторских статистических модели и не новая клиническая валидация.

[40-строчная новая матрица](P6_2H_ALL_40_OUTCOME_POINTS_9_MODELS_PRIMARY_PROVENANCE_2026-11-02.csv) помечает source SHA256, original PDF locator, dose convention, historical review status, отдельно publication/formula conflicts, external primary source missing in this upload.

| Группа / оригинальный источник | Точек | Оригинал в ZIP | Суть, которую нельзя терять |
|---|---:|---|---|
| Redmond 2021 brain metastases | 4 | Да, `HyTEC_05` PDF pp2,7,12 | Local control в 1 год; размер опухоли; PTV-margin prescription; SFED20 только для source model |
| Soltys 2021 vestibular schwannoma | 6 | Да, `HyTEC_08` PDF pp2,4,7 | 3–5-year tumour control; source-specific EQD2 and Poisson fit; **не** универсальный tumour TCP |
| Soltys 2021 spinal metastases | 8 | Да, `HyTEC_09` PDF pp2,6,7 | 2-year LC, logistic fit, 1–5fx; 3fx equivalent model and volume uncertainty |
| Ohri 2021 liver metastases | 2 | Да, `HyTEC_15` PDF pp2,3,5 | **Stratified observational 3-year LC**: BED10>100Gy ≈93% против ≤100Gy ≈65% для liver metastases; **не** HCC continuous TCP |
| Stumpf 2021 adrenal | 1 | Да, `HyTEC_18` PDF pp2,7 | 1-year LC at BED10 model point, wide clinical heterogeneity |
| Royce 2021 prostate SBRT | 4 | Да, `HyTEC_19` PDF pp2,6,7 | 5y FFBR, risk-group-specific model, EQD2(α/β1.5); **2/4 low/intermediate published table-vs-equation conflicts** (P6.1/#93). No coefficient re-fit or invented correction |
| Vargo 2021 head/neck re-RT | 6 | Да, `HyTEC_11` PDF pp2,6,7 | Published 1/2/3y LC and **5fx-equivalent dose with α/β10**, not 5 physically delivered fractions; prior irradiated population |
| Mahadevan 2021 pancreas | 3 | Да, `HyTEC_17` PDF pp2,5,6 | Unresected dose-response vs highly selected R0-resected data **must remain stratified**; R0 96% weighted aggregate not generic dose-fitted TCP |
| Ohri 2012 NSCLC stage I | 6 | **Нет** в текущей загрузке | Source author text prints 50Gy/5fx 1cm 93%; independently reconstructed sBED model ≈94.8%. Remains unresolved [issue #59](https://github.com/mesava/HFC-HypoFracCalc-/issues/59). Do not substitute 94.8% for published 93%. |

**Источниковые дефекты не устранены автоматически:**
1. **Royce et al. (2021)**: для low/intermediate FFBR 5y модель `D50=20.6, gamma50=0.15` даёт при EQD2 71/90Gy ≈77.44%/83.90%, хотя в тексте заявлено 90%/95%; две точки `sourceReproducibility="unresolved-equation-table-mismatch"` остаются. Для high risk при D50 84.2, gamma50 4.5 eq↔table согласуется с округлением. По P6.1 нужны полные 2025 author correspondence и source erratum, не подмена gamma.
2. **Ohri et al. (2012)**: в `Discussion` авторское `50Gy/5fx`, диаметр 1/3/5 см даёт 93/90/83%; исходная `sBED=BED10−10·diameter` логистическая формула при 1cm даёт ≈94.8%, но числа 3cm/5cm ближе к опубликованным. Сохранена исходная печатная цифра, источниковый discrepancy открыт.
3. **Pancreas R0**: 96% — weighted average группы с хирургическим отбором, не universal predicted LC от fSRS дозы; исходные endpoints и sample sizes не однородны.
4. **Vargo**: нормировка к пяти фракциям для сопоставления (source mathematical dose convention) не равна автоматической рекомендации лечить пациента 5 фракциями.
5. **Brain**: prescription PTV margin, не GTV mean / isocenter; а/β 20 для source SFED — не универсальная характеристика всех метастазов.

## 2. Научный статус и запреты

- Source-specific **probability transcription 40/40** и **source ID/evidence point linkage 40/40** подтверждены новым ledger тестом.
- Физический оригинал **8/9 publication groups** имеется в текущей загрузке, **1/9 external-only for this upload**. Нельзя объявлять 9/9 по загруженным оригиналам.
- Проверенные ранее PDF источники P2/P5 включают independent reproduction отдельных формул (по сериям Redmond/Soltys/Milano и др.) — **это не full cohort fit**, нельзя сообщать о 40 независимых patient-level refit.
- Не повышать точку из `stratified-observation` в модель, не интерполировать вне опубликованных дозовых диапазонов, не смешивать разные группы риска, дозовую основу или follow-up, не подменять original reported 93/90/83%.
- Никаких изменений `src/data/evidence`, `src/core`, `src/workflows`, `dataset draft` и UX этим этапом не внесено.

## 3. Дальнейшее действие

**P6.2i:** первичная постраничная сверка 25 фиксированных + 4 сложных схем RCR2024 по оригинальному 4-му изданию (если исходный полный документ присутствует в загруженном архиве), с проверкой tumour-site, simultaneous integrated boost / sequential и follow-up. Отдельно провести интеграционную review draft PR #93–97 и issue #56 (3 отсутствующих оригинала, модели и external source). Все publication-table flags и ограничения оставить открытыми до доказательства.
