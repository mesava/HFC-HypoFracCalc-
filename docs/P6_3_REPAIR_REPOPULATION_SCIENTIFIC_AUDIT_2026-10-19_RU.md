# HFC — P6.3: 6 параметров репарации, 14 параметров репопуляции и научный gate дозовой основы

**Дата:** 19 октября 2026. **Базовая ветка:** `develop` (при создании `ef4138ef03fa`).  
**Статус:** проверка численных полей текущего каталога, опубликованных авторских аннотаций и действующей логики выбора, **НЕ** full-text source/model commissioning и **НЕ** изменение клинической дозы. Библиотека `2026.10-v0.2` остаётся `draft`.

## 1. Что проверено

Сопоставлены все записи `repairHalfTime.ts` (6) и `repopulation.ts` (14) с первоначальными P3-реестрами, `repairRegistry.ts`, `repopulationRegistry.ts`, `core/repopulation.ts` и `workflows/treatmentGap.ts`. Дополнительно напрямую проверены открытые **официальные первичные PubMed Abstract**: Bentzen 1999 [PMID 10660202](https://pubmed.ncbi.nlm.nih.gov/10660202/), Bentzen/Ruifrok/Thames 1996 [PMID 8966232](https://pubmed.ncbi.nlm.nih.gov/8966232/), CHART Bentzen 2001 [PMID 11439207](https://pubmed.ncbi.nlm.nih.gov/11439207/), Roberts 1994 [PMID 8087485](https://pubmed.ncbi.nlm.nih.gov/8087485/), Withers 1995 [PMID 7558943](https://pubmed.ncbi.nlm.nih.gov/7558943/), Hinata 2001 [PMID 11383644](https://pubmed.ncbi.nlm.nih.gov/11383644/), Thames 2010 [PMID 20400191](https://pubmed.ncbi.nlm.nih.gov/20400191/), Haviland 2016 [PMID 27666929](https://pubmed.ncbi.nlm.nih.gov/27666929/).

[Машиночитаемая матрица 20 ID](P6_3_REPAIR_REPOPULATION_20_RECORD_GATE_2026-10-19.csv) фиксирует значения текущего кода, source ID, endpoint, CI, сроки, источник точности, степень подтверждения и действующий технический блокер. `tests/p6_3RepairRepopulationScientificGate.test.ts` сверяет живые значения/неопределённости, режимы выбора и независимые размерностные toy-вычисления. **Измеренные пациентские данные или исходные fit covariance не использовались.**

## 2. T½: полная инвентаризация 6 из 6

| Endpoint | HFC value/qualifier | Провенанс и судьба |
|---|---|---|
| CHART laryngeal edema | **4.9 h**, 95% CI **3.2–6.4** | 1999 официальный Abstract, MC 1000 draws; `preferred`, defaultEligible only for exact endpoint |
| CHART skin telangiectasia | **3.8 h**, 95% CI **2.5–4.6** | 1999 официальный Abstract, MC 1000 draws; `preferred` |
| CHART subcutis fibrosis | **4.4 h**, 95% CI **3.8–4.9** | 1999 официальный Abstract, MC 1000 draws; `preferred` |
| Early oral mucositis | **probable 2–4 h** | 1996 официальный Abstract; качественный диапазон, нет CI или пригодной автоматической точки. Упомянутые 3.2 h — максимум теоретической разницы между интервалами 4/6h, **не** fitted point |
| Spinal-cord myelopathy | historical **>5h** lower bound | `deprecated`; Bender 2012 4.1 h with 0–8h statistical range не подтверждает старый secondary bound |
| Temporal-lobe necrosis | historical **>4h** lower bound | `deprecated`; нет первичного подтверждения строгой границы для конкретного endpoint |

**Принципиальная оговорка:** CHART оценивала late morbidity из Cox и распределений α/β/γ50, а не измеряла `T½` каждого пациента. Полные издательские PDF и covariance/re-fit не проверялись. Никакие значения не распространять на общую «T½ для всего органа».

**Независимая математическая проверка**, а не клинические outcomes: остаточная доля повреждения после паузы `r(Δt)=exp(-ln2·Δt/T½)`; для `T½ = 4.9/3.8/4.4h` через 6 ч: `0.42794883 / 0.33472603 / 0.38860157`, через 12 ч: `0.18314020 / 0.11204151 / 0.15101118`. Это не самостоятельная clinical safety boundary для BID.

## 3. Dprolif/Tk: 14 из 14

**Текущий runtime:** 14 source estimates; 2 `deprecated`, 2 source-incompatible Hinata (`tBEDmax`) — блокируются и в выдаче списка, и при выборе по explicit ID; **10 остаются доступны только как сознательно выбранные evidence-сценарии**, и **0** автоматически назначаемых. `TreatmentGap` требует явный `Tk`, если оригинал его не задаёт. Исходный `basis: EQD2` для всех 14 — сохранённая структура HFC, а **не независимое подтверждение EQD2-нормировки всех 14 первоисточников**.

| Запись и источник | Значение, Гр/сут (95% ДИ если опубликован) | Решение / блокер |
|---|---|---|
| CHART mucositis 2001 | 0.80 [0.70,1.10] | Ранняя нормальная ткань; publisher Abstract численно сверено, EQD2-normalization/Tk требует исходного model equation |
| CHART skin erythema | 0.12 [-0.12,0.22] | CI пересекает 0; это не tumour time loss |
| Roberts 1994 node-negative larynx | 0.80 [0.50,1.10]; best Tk21 [0,27]d | Extra physical compensating dose/day; lag не статистически значим; EQD2 source-equivalence не доказана |
| Withers 1995 tonsil | 0.73 при `Tk≈30` vs 0.53 при onset до 9d | Две модельные предпосылки, не одна бесконтекстная скорость |
| Hendry 1996 pooled | 0.64 [0.42,0.86] | BCR2025 Table10.3 отдельно подтверждает EQD2 convention, оригинальная модель Hendry/CI не воспроизведена |
| Lung pneumonitis Bentzen/QUANTEC | 0.54 (QUANTEC: ±0.21 **SE**) | Не создавать 95% CI из 1 SE, непереносимо на фиброз |
| Geh 2006 oesophageal pCR | 0.59 [0.18,0.99] | Предоперационная CRT, а не общий TCP пищевода; EQD2 derivation open |
| Koukourakis 1996 NSCLC | 0.45 (all); 0.20 (no mediastinal disease) | NTD-T, нет универсального Tk, не stage-I-only |
| Thames 2010 prostate | 0.24 | 52 d — analytical cut point, не биологическое Tk |
| Haviland 2016 breast | 0.60 [0.10,1.18] | START-B-driven, hypothesis-generating; endpoint local-regional relapse |
| BCR generalized H&N 0.80/Tk21 | 0.80 [0.50,1.10] | `deprecated`: нельзя переносить Roberts larynx на любой HNSCC |
| BCR larynx | 0.74 [0.30,1.20] | `deprecated`: не согласовано с primary Robertson 0.89 [0.35,1.43] |
| Hinata 2001 tBEDmax Tk0 | 0.52 [0.29,0.75] | `incompatible-dose-basis`, **BLOCKED** |
| Hinata 2001 tBEDmax Tk21 | 0.55 [0.30,0.80] | `incompatible-dose-basis`, **BLOCKED** |

**Научный gate:** HFC называет эти rates `EQD2`, хотя часть оригинальных авторов сообщает extra **physical** dose/day, нормированные дозы `NTD-T` или `gamma/alpha` в `BED`. Нельзя утверждать, что десять доступных временных скоростей *эквивалентны Gy_EQD2/day* только из совпадения числа. Текущие предупреждения и отсутствие автоматического выбора уменьшают риск, но **не являются независимой source-dose-basis validation**.

## 4. Hinata: демонстрация размерностной несовместимости, не клинический пересчёт

При фиксированных иллюстративных `n=30`, `d=2 Gy`, `α/β=10 Gy`, `OTT=45d` (не предлагаемая лечебная схема):

`BED_raw=72 Gy_BED`, `EQD2_raw=60 Gy_EQD2`. `K_BED` и `K_EQD2` нельзя численно отождествлять; при справочном 2 Gy/fx `K_EQD2 = K_BED/(1+2/10)` **только как размерностная операция**.

| Источник | Активных дней | Потеря BED | Формальная потеря EQD₂ | Ошибка прямой подстановки K_BED в EQD₂ |
|---|---:|---:|---:|---:|
| Hinata 0.52, Tk=0 | 45 | 23.4 | 19.5 | 3.9 Gy_EQD₂ |
| Hinata 0.55, Tk=21 | 24 | 13.2 | 11.0 | 2.2 Gy_EQD₂ |

**Это не независимое восстановление `tBEDmax`** (максимум дозо-временного эффекта может быть до последней фракции), не одобренные новые коэффициенты 0.433/0.458 и не решение для клинической компенсации. В HFC уже активна блокировка двух исходных записей; её нельзя снять на основании этих toy calculations.

## 5. Исправление исторической документации

Старый P3.7 отчёт описывает техническую уязвимость: `deprecated` repop records якобы могут разрешаться по ручному ID. **В текущем коде это уже исправлено:** `getRepopulationSourceBlocker` проверяет статус `deprecated` первым, `resolveRepopulationSelection` вызывает `assertRuntimeRepopulationSourceUsable`. Новый регрессионный тест защищает это свойство для всех четырёх заблокированных ID. Исторический документ P3 не переписывается задним числом; P6 фиксирует разницу между **старой находкой и текущей реализацией**.

## 6. Результат и следующий научный gate

1. 20/20 live records полностью сопоставлены с исходными P3 и текущей реализацией; клиническая независимая source-dose validation **не выполнена**.
2. Все исходные коэффициенты, CI, статус выбора и `draft` **без изменений**.
3. Получение full primary texts наиболее важно для `CHART 1999/2001`, `Hinata tBEDmax`, `Roberts/Withers/Thames/Haviland`, `Hendry/Robertson` (первичные dose-normalization/fit).
4. Для следующих клинических правок потребуется сначала отдельная научная модель `source reported basis → supported dose basis → permitted runtime`, explicit dose/time/endpoint/αβ, независимые unit/reference tests и approval. Нельзя «исправлять» репопуляцию только переименованием `basis` или пересчётом коэффициентов везде.

**Рекомендация для следующего шага:** P6.3b — единый источник-специфический `dose-basis qualification gate` с отдельными решениями для оставшихся 10 explicit-only; затем P6.4 models/constraints только после обсуждения границ применимости. Никаких клинических расчетных изменений не выполнять без согласования.
