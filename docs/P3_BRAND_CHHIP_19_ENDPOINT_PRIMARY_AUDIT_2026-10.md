# P3.1 — аудит 19 endpoint-specific α/β из оригинальных исследований Brand (CHHiP)

**Дата:** 09.10.2026. **Научный статус:** *19/19 published point estimates + 95% percentile bootstrap confidence intervals independently transcribed and crosschecked against HFC*. Это **сверка параметров с опубликованными таблицами**, а не повторная максимизация likelihood на исходных patient DVH, re-bootstrap, клинический commissioning или независимая полная математическая валидация NTCP. Никакие HFC численные коэффициенты/CI или default eligibility не изменены.

## Источники, а не поисковые сниппеты

1. Brand et al., *Estimates of Alpha/Beta Ratios for Individual Late Rectal Toxicity Endpoints: An Analysis of the CHHiP Trial*. **IJROBP 2021;110(2):596–608**, оригинальный пользовательский `Brand_2021_IJROBP_rectal_alpha-beta.pdf`, **PDF page 8 / journal p603 Table 3**, **page 9 / journal p604 Table 4**, and user `Brand_2021_IJROBP_rectal_supplement.docx`, Appendix A/E3. Оригинальные **PDF страницы 6–9 доступны по тексту**, при этом полная визуальная сверка каждого исходного рисунка калибровки из supplement **не завершена**.
2. Brand et al., *Estimates of Alpha/Beta (α/β) Ratios for Individual Late Genitourinary Toxicity Endpoints: An Analysis of the CHHiP Trial*. **IJROBP 2023;115(2):327–336** (предшествующий online release 2022; пользовательское имя `Brand_2022_IJROBP_GU_alpha-beta.pdf`), оригинальная **PDF page 6 / journal p332 Table 2**, p7 Table 3/DMF context. `2022` в имени файла и `2023` в HFC source ID **не противоречие**: online и print years отличаются.

Машиночитаемый crosswalk с **source ID, precise Table, исходом, N, числом, 95% CI, способом отбора**: [P3_BRAND_CHHIP_19_ENDPOINT_PRIMARY_CROSSCHECK_2026-10.csv](P3_BRAND_CHHIP_19_ENDPOINT_PRIMARY_CROSSCHECK_2026-10.csv). [Защитный unit test](../tests/p3BrandChhipAlphaBetaPrimaryAudit.test.ts) проверяет каждое поле значений/границ в исполняемом evidence наборе.

## Ректальные исходы, Brand 2021 — 9/9 совпали

| Моделированный endpoint | N (Table 3–4) | α/β, Гр | 95% bootstrap CI, Гр | Выбор HFC |
|---|---:|---:|---:|---|
| Bleeding G1+ | 2008 | **1,6** | 0,9–2,5 | Автоматический доступен; free α/β превзошёл fixed 4,8 Gy при adjusted **p=0,00032** |
| Bleeding G2+ | 2006 | 1,7 | 0,7–3,0 | Только явный |
| Stool frequency G1+ | 2025 | 2,3 | 0,9–5,3 | Только явный |
| Stool frequency G2+ | 2021 | 2,7 | 0,9–8,5 | Только явный |
| Bowel pain G1+ | 2185 | **3,6** | **0,0–839,6** | Только явный, **poor-fit** |
| Proctitis G1+ | 2147 | 2,7 | 1,5–5,4 | Только явный |
| Proctitis G2+ | 2146 | 2,7 | 1,3–15,1 | Только явный |
| Sphincter control G1+ | 2199 | 3,1 | 1,4–9,1 | Только явный |
| Stricture/ulcer G1+ | 2206 | 2,5 | 0,9–8,2 | Только явный |

**Принцип метода:** опубликованы **LKB-EQD2** модели с bootstrapped α/β, а не девять независимых биологических констант прямой кишки. Все пациенты соответствовали модели CHHiP, облучение 74Gy/37, 60Gy/20, 57Gy/19, подбор endpoint на основании сочетаний RTOG/RMH/LENT-SOM и исключения baseline toxicity и неполного follow-up. Для редких событий точность калибровки слабее.

**Нельзя объявить значимым free-fit для всех девяти:** источником задан adjusted **p<0,001**, и только bleeding G1+ улучшилась относительно fixed 4,8 Gy при adjusted p=0,00032. У ряда endpoints fixed 3Gy модель **не хуже или даже лучше** по .632 bootstrap loglikelihood. Риск >30–1000Гр CI на α/β не может быть "средним нормальным тканевым коэффициентом".

**Нюанс dose-modifying factors:** наличие IBD/diverticular disease значимо изменяло предсказание для stool frequency G2+ (**p=0,00041, DMF1,37**) и proctitis G1+ (**p=0,00046, DMF1,27**), но численно α/β было близко к модели без DMF (2,7 vs 2,5 и 2,7 vs 2,6). Наши фиксированные source α/β **НЕ представляют DMF-corrected patient NTCP**. Supplement специально задаёт композицию нескольких шкал токсичности. **Не делать один общий α/β = 2,4 (G1+) или 2,3 (G2+) автоматически для всех rectal endpoints** — оригинальная работа описывает это как условное взвешенное среднее и сама предупреждает против одного числа.

## GU исходы, Brand 2023 — 10/10 совпали

| Моделированный endpoint | N (Table 2) | α/β, Гр | 95% bootstrap CI, Гр | EQD2 vs NoEQD2 | HFC |
|---|---:|---:|---:|---|---|
| Dysuria G1+ | 2111 | **2,0** | 1,2–3,2 | **p=0,0046** | Доступен автоматически |
| Dysuria G2+ | 2111 | 1,6 | 0,1–36,0 | Хуже penalized fit | Только явный |
| Haematuria G1+ | 2053 | **0,9** | 0,1–2,2 | **p=0,034** | Доступен автоматически |
| Haematuria G2+ | 2050 | **0,6** | 0,1–1,7 | **p=0,015** | Доступен автоматически |
| Incontinence G1+ | 1927 | 1,0 | 0,1–17,6 | Хуже penalized fit | Только явный |
| Incontinence G2+ | 1923 | 1,5 | 0,1–6,2 | p=0,24 | Только явный |
| Reduced flow/stricture G1+ | 1743 | 1,9 | 0,1–424,6 | p=0,35 | Только явный |
| Reduced flow/stricture G2+ | 1743 | 0,7 | 0,1–991,9 | Хуже penalized fit | Только явный |
| Urine frequency G1+ | 654 | 1,9 | 0,1–997,8 | Хуже penalized fit | Только явный |
| Urine frequency G2+ | 647 | 3,3 | 0,1–996,0 | Хуже penalized fit | Только явный |

В Table 2 источник сообщает значение α/β, долю bootstrap likelihood (.632) и P для сравнения **EQD2 против NoEQD2**, это **не P для отдельной гипотезы α/β ≠ 3Гр**. Из 10 late GU endpoint models только **3** улучшили fit при EQD2 correction; эти три HFC доступны по явному endpoint-default. Даже для них не следует использовать один GU α/β на весь мочевой пузырь или применять модель в SBRT 5×7,25–8Гр, повторном облучении или после иной хирургии без внешней validation. Данные CHHiP относятся к умеренной гипофракции 57Gy/19, 60Gy/20 versus 74Gy/37.

GU Table 3 (другая модель с **acute GU G2+ DMF**) сообщает изменённые 1,6/0,1/0,1 и т.п. α/β для другого поднабора n=1611/1576/1574; **это не Table2 и не основания менять опубликованные десять HFC исходных базовых коэффициентов**. Численные исходы с чрезвычайно широкими CI при NoEQD2/DMF остаются explicit-only.

## Вердикт и незакрытые требования

- **19/19** исходных alpha/beta point+95% CI и CHHiP endpoint class source-traced; **4/19** HFC разрешают автоматический выбор (1 rectal + 3 GU), **15/19** — explicit selection only; совпадения не подтверждают полноценную клиническую predictive calibration.
- HFC содержит `supportReason` и `applicability` с CHHiP схемами/популяцией; первоначальные численные клинические значения **не изменены**. Выполнимые unit tests не заменяют полный re-bootstrap и визуальный audit appendix calibration figures.
- Для большего P3 необходимо сверить Vogelius 2020 (14 trials, heterogeneity), FAST/FAST-Forward 2026, отличающиеся late breast endpoint calibration, исходные T½ репарации, Dprolif/Tk, а также **30 records без непосредственно загруженных файлов** из матрицы 103.
- **P1 archival ZIP SHA256 открыт**, **P2 Royce ответы открыты**, независимый второй физик/врач не подписал release. **Данные и версия остаются draft**, PR №60 не сливать.
