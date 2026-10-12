# P3.10 — FAST-Forward 10-year 2026: первичный PDF, Table D5 (3 α/β + 12 EQD₂)

**Дата:** 10 октября 2026 года. **Режим проверки:** пользовательский исходный PDF в Library, текст и изображение таблицы D5 (страница 21 из 147 PDF / напечатанная страница 20). Исходные байты PDF в рабочий контейнер не предоставлены (`files.materialize` вернул отсутствие разрешённого пути), поэтому **нет доказанного SHA-256 или независимой проверки PDF бинарника**. Отсутствуют первичные индивидуальные данные для пересчёта регрессий и клиническое утверждение.

## Оригинальный источник

Brunt AM, Cafferty FH, Kirby AM, et al. *Hypofractionated breast radiotherapy for 1 week versus 3 weeks (FAST-Forward): 10-year efficacy and late normal tissue effects...* *Lancet Oncol.* 2026;27:686–698. DOI **[10.1016/S1470-2045(26)00076-8](https://doi.org/10.1016/S1470-2045(26)00076-8)**, PMID **[42134381](https://pubmed.ncbi.nlm.nih.gov/42134381/)**. Предоставленный ранее исходный файл приложения: `FAST-Forward_10y_LancetOncol2026_appendix.pdf`, **печатная с.20, PDF page 21, Table D5** (сохранены текстовые и визуальные наблюдения инструментом чтения файлов). `4110` включено в исследование, `4087` анализировались в intention-to-treat; режимы 40 Гр/15 фракций за 3 недели, 27 Гр/5 и 26 Гр/5 за 1 неделю.

## Три параметра HFC = первичная таблица D5

| HFC evidence ID | Исход | Модель | α/β (Гр) | 95% ДИ (Гр) |
|---|---|---|---:|---|
| `ab-breast-ibr-fastforward2026-adjusted` | ипсилатеральный рецидив молочной железы | Cox, скорректированная | **3.3** | **1.9–4.9** |
| `ab-breast-ibr-fastforward2026-unadjusted` | ипсилатеральный рецидив молочной железы | Cox, нескорректированная | **3.4** | **1.6–5.2** |
| `ab-breast-chestwall-any-ae-fastforward2026` | любой умеренный/выраженный поздний клинически наблюдаемый эффект молочной железы/грудной стенки | GEE, обе модели | **2.1** | **1.6–2.6** |

**3/3 HFC point+CI records coincide exactly with their source.** Table D5 contains **four model columns** because the same clinician-reported composite endpoint also has adjusted and unadjusted variants; both display α/β=2.1. Adjustment variables: adjuvant chemotherapy, risk category, ER and HER2. Source composite endpoint contains distortion, shrinkage, induration inside/outside tumor bed, telangiectasia, breast/chest-wall oedema. This endpoint must not be interpreted as a **tumour** α/β, nor used as a dose-volume OAR tolerance.

## Independent LQ arithmetic of all 12 source EQD₂ values

```
EQD2(n,d,α/β) = (n × d) × [d + (α/β)]/[2 + (α/β)]
```

The machine-checkable [12-row crosswalk](P3_FAST_FORWARD_2026_TABLE_D5_SOURCE_CROSSWALK_2026-10.csv) contains published Table D5 EQD₂ values, not recomputed replacements:

| Source model | 40 Gy/15 | 27 Gy/5 | 26 Gy/5 |
|---|---:|---:|---:|
| IBR unadjusted (α/β=3.4) | 45.0 | 44.0 | 41.4 |
| IBR adjusted (α/β=3.3) | 45.0 | 44.3 | 41.7 |
| NTE unadjusted (α/β=2.1) | 46.5 | 49.4 | 46.3 |
| NTE adjusted (α/β=2.1) | 46.6 | 49.5 | 46.2 |

Each row was crosschecked independently with the standard LQ formula using **rounded** α/β from the printed table; absolute errors are all **<0.15 Gy**; maximum is about **0.11 Gy**. Unadjusted NTE EQD₂ for 27 Gy/5 = **49.4 Gy**, adjusted **49.5 Gy**; one-digit α/β rounding hides small differences in fitted model parameters, not evidence of a software error. These arithmetic checks do **not** fit Cox/GEE trial models or independently demonstrate clinical dose equivalence.

## Scientific interpretation and deployment blockers

- Trial IBR model α/β controls a tumor recurrence endpoint; clinician-reported breast/chest-wall `any AE` is a distinct composite late-normal-tissue endpoint. Keep adjusted versus unadjusted results explicit.
- The reported **confidence intervals are for fitted model parameters**, not individualized patient outcome intervals. Biological effect of OTT, prior radiation, systemic therapy, boost, regional-node RT and large fractions must not be inferred from these three α/β values alone.
- 40/15 vs 26/5 compared **different overall treatment times**; the fitted LQ model reflects the trial conditions and is not a standalone validation of HFC Treatment Gap repopulation correction.
- 2026 FAST-Forward is **not FAST 2020**: FAST used five **once-weekly** fractions over five weeks; FAST-Forward five **daily** fractions over one week.
- `releaseStatus=draft`; all `clinical_release_approved=false`; original file title/source mapping survives. Need SHA-256 original PDF bytes, full bibliographic provenance and independent Cox/GEE statistical confirmation; no numerical or eligibility changes.

## Scope and progress

Exactly 3 previously pending record IDs advance to `p3_user_original_indexed_pdf_page21_table_D5_coefficients_EQD2_checked_binary_SHA_pending`, with text+page-image confirmation but not raw binary digest. **20 earlier P3 strict records remain separate; 7 FAST 2020 checks remain a separate class.** Remaining **17 quantitative pending =14 alpha/beta +3 repopulation**. Of those, **3** have user-supplied original file flag and **14** have no direct original; overall 73/103 availability unchanged. Source-to-clinical signoff stays OPEN.
