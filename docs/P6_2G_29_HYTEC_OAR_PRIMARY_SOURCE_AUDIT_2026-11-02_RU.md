# HFC P6.2g — первоисточниковый аудит 29 HyTEC OAR constraints

**Дата: 02.11.2026.** Все семь оригинальных PDF распакованы из загруженного пользователем `liter(1).zip` и идентифицированы по SHA-256; ни один PDF не публикуется в GitHub. Проверен исходный код `src/data/evidence/v0.1/constraintsHytec.ts` ветки `develop`. Этот проход **дополняет**, а не аннулирует ранее проведённые P2/P5 исходниковые, табличные и расчётные проверки.

## Результат

**29/29** действующих OAR записей получили source-specific per-ID crosswalk с фактическим SHA-256 оригинала, PDF-страницами, дозовой метрикой, числовым ориентиром, числом фракций и *семантическим типом* (planning-limit/risk-point/observational-threshold). Все 29 проверены по тем же четырём полям в коде; **никаких ошибок чисел, типа метрики, числа фракций и роли записи при данной проверке не обнаружено**. Это не является повторным независимым фиттингом и не гарантирует пригодность опубликованных средних рисков для индивидуального DVH.

Артефакт: [P6_2G_ALL_29_HYTEC_OAR_PRIMARY_PDF_CROSSWALK_2026-11-02.csv](P6_2G_ALL_29_HYTEC_OAR_PRIMARY_PDF_CROSSWALK_2026-11-02.csv).

| Оригинальная статья из ZIP | PDF страницы | Записей | Ключевой первичный смысл |
|---|---|---:|---|
| HyTEC_07 Milano, optic pathways | 2, 10 | 3 | Dmax 10 Gy/1fx, 20 Gy/3fx, 25 Gy/5fx, no prior RT; near 1% RION *only in reported population* |
| HyTEC_06 Milano, brain | 2, 10, 12 | 7 | Target-inclusive tissue V12=5,10,>15 cc ~10%,15%,20% symptomatic RN; V20/3fx, V24/5fx <20cc associated with <10% any necrosis/edema, <4% resection |
| HyTEC_10 Sahgal, spinal cord | 8, 11 | 5 | Table 3: *lower* thecal-sac model 12.4/17/20.3/23/25.3 Gy; *upper* true-cord model 14/19.3/23.1/26.2/28.8 Gy |
| HyTEC_12 Grimm, carotid/vessels | 7, 8 | 3 | D0.5cc<20Gy/5fx clinical *try-to-keep* guidance vs Dmax20/30Gy pooled estimates ~2%/~12% bleeding |
| HyTEC_14 Kong, lung | 2, 5, 14 | 2 | Both lungs minus GTV/IGTV; MLD<8Gy, V20<10–15%; ILD modifies risk, 3–5fx small peripheral SBRT |
| HyTEC_16 Miften, liver | 8, 9 | 6 | QUANTEC MLD 13/18 Gy (primary HCC 3/6fx) vs 15/20 Gy (metastases); >=700cc of healthy liver receives <=15 or <=17 Gy (not D700cc) |
| HyTEC_20 Wang, prostate | 2, 9 | 3 | Bladder **V(Rx dose)** <5–10cc, urethra Dmax<38–42Gy, rectum Dmax<35–38Gy; suggested ranges, not established tolerances |

## Непреодолимые ограничения без исходных пациентов

- **Разные контуры не взаимозаменяемы.** Milano V12 в синтезе включает target volume; Sahgal `thecal sac` и Katsoulakis–Gibbs `true spinal cord` требуют отдельных контуров. При сравнении DVH нельзя трактовать цифры как `brain minus PTV` либо обычный `spinal cord` без корректного контура и исходной модели.
- **Два значения диапазона — не 95% CI.** Sahgal Table 3 объединяет результаты разных моделей, в том числе `19.3/23.1/26.2/28.8 Gy` LQ-extrapolation true cord при 2–5fx, которые авторы прямо **не рекомендуют** как независимо подтверждённые пределы. Нельзя создать generic upper tolerance из этих оценок.
- **Планировочный ориентир ≠ NTCP.** Grimm D0.5cc<20Gy/5fx — рекомендация при повторной SBRT с лечением через день. Отдельная кривая Dmax имеет 2% при 20Gy и 12% при 30Gy; перенос этих рисков на D0.5cc математически неверен. В Fig. 3 отдельная 0.5cc/20Gy ситуация даёт ~10% в иной когорте, ещё один повод не смешивать модели.
- **Нормальная печень и тип осложнения.** Miften сообщает, что данных **недостаточно** для формального анализа критерия 700cc. Observational 11/118 (9.3%) — grade≥3 *general gastrointestinal toxicity* в выбранных исследованиях, **не** grade≥3 liver enzyme risk от VleX. Если использовать этот показатель в инструменте DVH, нужна явная подпись об исторической планировочной практике, а не индивидуальной вероятности осложнения.
- **Kong lung**: GTV/IGTV subtraction in bilateral combined lung; ipsilateral lung или `lungs minus PTV` не являются равнозначными выборками. Интерстициальное заболевание лёгких повышает риск; study-level <10–15% not transferable patient NTCP.
- **Wang bladder:** значение 5–10 указано в **кубических сантиметрах для объёма мочевого пузыря, получающего dose of prescription** (`V(Rx dose)`), не `V5/V10 Gy`. Автор отдельно пишет, что данных недостаточно для *firm tolerance doses*.
- **Оптические пути**: Milano no-prior-RT 10/20/25 Gy можно трактовать лишь в контексте SRS/fSRS; published 1% risks model-derived и их неопределённость не заменена patient-specific калибровкой.

## Решение по HFC

**Сохранять без численных изменений** все 29 записей. Не переводить `risk-point` и `observational-threshold` в `planning-limit`. Сохранить `volumeBasis`, `priorRadiotherapy`, `fractionation` и `custom V(Rx dose)`. Все записи всё ещё `reviewed` в **research dataset `draft`**, а не clinical commissioning.

Первичные PDF проверены по текстовому слою, ключевые источниковые страницы Sahgal, Grimm, Miften, Milano optic также визуально. Для многих уравнений исходные supplementary datasets и individual-patient models ранее рассмотрены в P2/P5; **повторный full model/refit 29/29 не заявляется**.

**Дальше:** P6.2h — 9 OutcomeModel sets / 40 точек, отдельно сохраняя unresolved Royce и Ohri, не приравнивая published TCP points к patient-predictive validated curves.
