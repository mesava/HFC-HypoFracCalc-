# HFC — P6.2c: первичная постраничная сверка 30 α/β записей (Vogelius–Bentzen, Brand, FAST и FAST-Forward)

**Проверено 1 ноября 2026 г.**  
**Объект:** 30/44 `alphaBetaEstimates` из `develop`; 5 полностью загруженных оригинальных PDF (их SHA-256 проверены в P6.2b).  
**Результат:** для всех 30 записей совпали точечные значения α/β и опубликованные 95% интервалы, **включая отсутствие опубликованного CI у FAST breast edema 1.9 Gy**. Ни один численный коэффициент или статус авто-выбора не менялся.

Подтверждение приведено в [30-row первичном source-to-code crosswalk](P6_2C_30_PRIMARY_ALPHA_BETA_SOURCE_CODE_RECONCILIATION_2026-11-01.csv). Там у каждого ID: конкретный исходный файл и SHA-256, **PDF-страница (1-based)**, таблица, исходное значение и CI, endpoint-specific caveat и current auto-select.

## 1. Доказательные источники и оригинальные страницы

| Источник | Оригинальный документ (PDF p.) | α/β записей | Что сравнивали |
|---|---|---:|---|
| Vogelius & Bentzen (2020) | `Vogelius_Bentzen_2020_IJROBP_prostate_alpha-beta.pdf` pp.1 и 3–4 | 1 | 1.6 [1.3, 2.0] Gy; random-effects [0.8,2.4]; trial heterogeneity I²=70%; saturation hypothesis at >80 Gy EQD2 |
| Brand et al. (2021), CHHiP rectum | `Brand_2021_IJROBP_rectal_alpha-beta.pdf`, p.8, Table 3 | 9 | LKB-EQD2 source α/β by toxicity grade; bootstrap CI and better-fit flag |
| Brand et al. (GU), accepted 2022, published 2023 | `Brand_2022_IJROBP_GU_alpha-beta.pdf`, p.6, Table 2 | 10 | LKB-EQD2 source α/β by separate GU endpoints; fit significance/wide intervals |
| Brunt et al. (2020), FAST 10-year | `FAST_10y_JCO2020.pdf`, p.10, Table 4 | 7 | Five *once-weekly* fractions and endpoint-specific α/β; edema lacks 95% CI |
| FAST-Forward main 10-year (2026) | `FAST-Forward_10y_LancetOncol2026_appendix.pdf`, p.21, Table D5 (printed appendix p.20) | 3 | Cox IBR adjusted/unadjusted 3.3/3.4 Gy; GEE composite breast/chest-wall any AE 2.1 Gy |

**Итого:** 1+9+10+7+3=**30/44 live α/β records** have now direct full original-upload identity and *specific original page+numeric result* checked in P6.2c. Остальные **14/44** не входят в этот пакет и не получают автоматически пометку source-verified.

**Никаких оригинальных PDF/таблиц целиком в публичный Github не публикуется**: сохраняется только построчная техническая метаинформация и цитируемые численные результаты.

## 2. Сохранённые ограничения для каждого семейства

- **Vogelius–Bentzen:** 1.6 Gy является pooled estimate, **не patient-specific**; p<0.001 heterogeneity, I²70%, random-effects CI 0.8–2.4 существенно шире основного 1.3–2.0. Это нельзя подменять одним и тем же 95% CI. Эффект дозы выше ~80 Gy EQD2 может насыщаться, объясняя observed drift α/β.
- **Rectum, Brand:** почти все fixed 3 Gy models дают аналогичную или лучшую fit performance; клинически выделенная доказательная база у G1+ bleeding. **Pain α/β=3.6 Gy** имеет 95% CI [0,839.6]: не универсальная α/β прямой кишки и не авто-значение. Источник также приводит frequency-weighted среднее 2.4 Gy для G1+ и 2.3 Gy для G2+ без корректного unified 95% CI; это не самостоятельные endpoint-level значения для HFC.
- **GU, Brand:** χ-коррекция EQD2 существенно улучшала модели лишь для dysuria G1+, hematuria G1+ и G2+. Остальные оценки, включая GU urinary frequency с 95% CI почти 1000 Gy, не должны автоматически использоваться. Источник назван файлом `Brand_2022` по году принятия (2022), публикация 2023.
- **FAST 2020:** 5 фракций **1 раз в неделю за 5 недель**, а не 5 ежедневных фракций за 1 неделю. Table 4 `induration 1.6 (0,4.4)` с нижней границей **обрезанной на 0**, `edema=1.9` без опубликованного CI. IBR-events 11/915 (1.2%) и study not powered to evaluate local control; эти late normal-tissue α/β нельзя назначать опухолевому контролю.
- **FAST-Forward 2026:** 5 фракций **за 1 неделю**, main trial. Source Table D5 IBR 3.4 [1.6–5.2] unadjusted vs 3.3 [1.9–4.9] adjusted, composite AE 2.1 [1.6–2.6]. В той же таблице adjusted/unadjusted EQD2 могут отличаться на 0.1 Gy из-за внутренней точности модели, несмотря на одинаково округлённые α/β — это не доказательство арифметической ошибки.

## 3. Найдено **внутреннее несоответствие публикации**, не numeric error HFC

В оригинальном депонированном NIHMS/PMC авторском манускрипте **Vogelius & Bentzen 2020**, PDF p.1, Abstract утверждает **14 RCT, 13,384 patients**. В **Results, PDF p.3** указаны **9 fractionation trials / 9,146 patients** и **5 dose-escalation trials / 2,238 patients**. Их сумма **11,384**, то есть на 2,000 меньше, чем в аннотации.  

Это **внутренний конфликт двух чисел самого авторского манускрипта**. HFC `supportReason` цитирует значение Abstract (13,384); не следует утверждать, что код «ошибся на 2000», поскольку это тот же первоисточник. Оставить `alpha/beta=1.6 Gy`, `CI=1.3..2.0` как есть. При последующей научной рецензии запросить издательскую окончательную редакцию/уточнение авторов либо разъяснить несовпадение cohort totals в исходной статье. Не вычислять новую weighted α/β из этих чисел.

## 4. Что подтверждено и что не подтверждено

**Подтверждено:** независимое считывание 30 source rows и CI по оригинальным страницам; source SHA256 относится к нынешней загрузке; source-specific sample/endpoints/CI flags не противоречат текущему режиму авто-выбора.

**Не подтверждено:** независимый LKB/GEE/Cox и pooled RCT refit (нужны индивидуальные DVH, события, censoring, bootstrap и исходный likelihood); перенос 1.6/2.1 Gy на любые SBRT extreme dose/fraction; клиническая применимость к индивидуальным пациентам; полный первичный аудит остающихся 14 α/β, 6 repair, 14 repop, 29 OAR, 9 outcome.

**Технический блокер:** 01.11 CI PR #94 red, потому что `npm audit --audit-level=high` обнаружил Vite 8.3.2 vulnerability, **до Vitest/Browser QA**. См. [issue #100](https://github.com/mesava/HFC-HypoFracCalc-/issues/100). Нельзя объявить новый тест CI green до отдельной security-ремедиации.

**Следующий содержательный этап:** P6.2d — 14 оставшихся α/β с BCR2025 и источниками, затем 6 T½ и 14 repop primary source units; P6.2e — source-specific OAR/Outcome/RCR 2024 coverage. Issue #56 оставить открытым до полной сверки корпуса и оставшихся троих документов.
