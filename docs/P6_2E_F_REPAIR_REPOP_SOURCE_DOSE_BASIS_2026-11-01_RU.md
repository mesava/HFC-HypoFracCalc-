# HFC P6.2e–f — постраничный аудит 6 T½ и 14 Dprolif/Tk по BCR 2025

**Дата:** 01.11.2026. **Только научная документация и регрессионные тесты.** Численные коэффициенты, `src/core`, `src/data/evidence`, выбор автоматических значений и статус `draft` не менялись.

## 1. Основание и точная область

- Оригинал, загруженный пользователем: `Basic Clinical Radiobiology 2025(1).pdf`, 6-е издание, 360 PDF-страниц.
- **PDF p.122 / printed p.107:** `Table 10.2 Recovery half-time (T1/2)`. Опубликованы MFD, FLDR, HDR/LDR, point/range/bound и доверительные интервалы, многие строки без CI.
- **PDF p.123 / printed p.108:** `Table 10.3 Values for Dprolif from clinical studies`, **раздел 10.6 и Eq.(10.2)**. `Dprolif` описывается в книге как изменение **EQD₂ в Gy/day**, ограниченное Tk/OTT/endpoint.
- **PDF p.124 / printed p.109:** Example 10.4 (`(47−40)×0.7 = 4.9 Gy_EQD2`); обсуждение минимального межфракционного интервала **желательно 8 ч или более**.
- `bfco191_radiotherapy-treatment-interruptions(1).pdf`, RCR 2019, **PDF p.27–28**: минимум 6 ч при BID и example `K=0.9 Gy_BED10/day`, не значение `EQD2/day`.

[Полный 20-строчный исходный реестр](P6_2E_F_ALL_20_REPAIR_REPOP_BCR2025_TABLE10_2_10_3_2026-11-01.csv) связывает `record_id` с точной страницей, типом исходного значения, кодовым статусом, сохранённым CI, обозначениями `Tk` и научными предупреждениями. **19/20 соответствуют численно строкам учебника** (с учётом соответствия одного пункта Roberts одной обобщённой строке), **1/20** `Hinata Tk21 0.55` приведён в первичном авторском abstract, но **не** выделен отдельной строкой BCR Table 10.3 (в книге записано 0.52 при «0 or 21»). Не трактовать это как опровержение первичного значения, либо как пройденную проверку единиц!

## 2. Шесть T½

| Endpoint / published scenario | T½ (hours) | 95% CL | Status HFC | Решение |
|---|---|---|---|---|
| CHART laryngeal edema MFD | 4.9 | 3.2–6.4 | preferred, exact endpoint auto | Сходится с BCR Table10.2 и авторским Abstract Bentzen 1999; полная source-fit reproduction не проведена |
| CHART skin telangiectasia MFD | 3.8 | 2.5–4.6 | preferred, exact endpoint auto | Не путать с двухкомпонентной скоростью восстановления `0.4 / 3.5 h` Turesson |
| CHART subcutaneous fibrosis MFD | 4.4 | 3.8–4.9 | preferred, exact endpoint auto | Не универсальный фиброз всего организма |
| Oral mucositis MFD Bentzen 1996 | 2–4 | Не приведён | reviewed, manual range | Не создавать фиктивную точку `3.2 h` или 95% CI |
| Spinal cord myelopathy MFD (Dische/Saunders) | строго >5 | Нет | deprecated | Архивная нижняя граница, не выбранный клинический параметр |
| Temporal lobe necrosis MFD (Lee) | строго >4 | Нет | deprecated | Архивная нижняя граница, не выбранный клинический параметр |

В той же Table10.2 дополнительно представлены двухфазная skin erythema `0.35 + 1.2 h`, двухфазная telangiectasia `0.4 + 3.5 h`, mucosal FLDR `0.3–0.7 h` и pelvic HDR/LDR `1.5–2.5 h`: они **не являются «пропущенными шестью»** и не взаимозаменяемы с одноэкспоненциальной `Thames Hm` для EBRT без другой модели или модели источников. Не создавать новые defaults.

## 3. Четырнадцать Dprolif

**Результат из исходной Table10.3:**
- `mucositis 0.8 [0.7,1.1], Tk<12` и `skin erythema 0.12 [-0.12,0.22], Tk<12` — **early normal-tissue endpoints**. В HFC нет ложного численного `Tk=12`.
- `H&N various 0.80 [0.50,1.10], Tk21` — BCR указывает «Robers et al (1994)». Это вторичная **scope/generalization issue**: primary Roberts node-negative **larynx**, а не все H&N опухоли. В HFC generic variety запись deprecated, отдельная larynx `0.80` остается explicit-only; lag `21d` по original data не статистически значим.
- `H&N various 0.64 [0.42,0.86]` — pooled Hendry 1996, в Table10.3 указано; HFC не назначает Tk автоматически.
- `Larynx 0.74 [0.30,1.20]` — secondary Robertson 1998, HFC deprecated из-за контекстного исходного рассогласования.
- `Tonsils 0.73/Tk30` — условный вариант Withers 1995: альтернативная схема репопуляции даёт `0.53` при раннем предполагаемом onset; два варианта нельзя считать одним неизменным K/Tk.
- `Lung pneumonitis 0.54 [0.13,0.95]` — **учебник печатает 95% CL**, но HFC пока хранит `0.54` **без CI**. В предыдущей QUANTEC публикации источник часто представлен `0.54 ±0.21 SE`, что после нормального приближения даёт ≈0.13–0.95. Добавление CI в live HFC потребует явного обозначения `secondary-derived` и независимой проверки оригинального fit; *не внесено*.
- `Oesophagus 0.59 [0.18,0.99]` — в книге цитируется Geh (2005), HFC source ID Geh 2006 (год publication); endpoint **neoadjuvant CRT pathologic complete response**, не RT-alone TCP.
- `NSCLC 0.45` без CI/Tk — оригинал описывает `NTD-T`, а не универсальную компенсацию EQD₂.
- `Medulloblastoma 0.52 [0.29,0.75], Tk0 or21` — так печатает secondary BCR; первичная Hinata `tBEDmax`, **не EQD2/day**. HFC дополнительно хранит primary-fit alternative `0.55 [0.30,0.80]/Tk21`, **не отдельная строка Table10.3**. Обе записи имеют несовместимость source dose-basis и уже блокируются в runtime.
- `Prostate 0.24 [0.03,0.44], Tk52` — secondary BCR печатает CI и Tk. В HFC **намеренно не записаны CI и численный Tk**, поскольку primary Thames 2010 не доказывает, что аналитический порог 52 дня равен биологическому `Tk`. Не восстанавливать его «для полноты таблицы» без original likelihood.
- `Breast 0.60 [0.10,1.18]` — Haviland 2016 START-B derived local-regional relapse scenario, а не ко всем молочным железам.

### 3.1 Единицы дозы и Eq.(10.2)

Источник BCR2025 использует `EQD2_T = EQD2_t − (T−t) Dprolif` и biphasic extension `[(max(T,Tk)−max(t,Tk)) × Dprolif]`. Это **модельная формула учебника**: она не является доказательством, что каждая первичная публикация использовала identical `EQD2/day` normalization.

RCR2019 использует `BED_10` для time penalty: например `0.9 Gy_BED10/day` при `α/β=10 Gy`. Чисто математический перевод относительно 2 Gy reference fraction даёт `0.9/(1+2/10)=0.75 Gy_EQD2/day`. **Это не повод заменять HFC коэффициент без source-specific endpoint и assumptions.**

Учебник прямо ограничивает простую OTT-коррекцию относительно **малых изменений общего времени**; нельзя без независимой модели растягивать закон на десятки дней и переносить между различными outcome endpoints.

### 3.2 Проверка текущих ограничений HFC

`repopulationRegistry.ts` помечает **2 deprecated + 2 Hinata incompatible** как непригодные для explicit selection; остальные **10 explicit-only**, `defaultEligible=false` у всех 14. Отсутствующие `Tk` требуют явного выбора (8/10). Это важно сохранять в новых CI.

**Дозовая основа десяти selectable records не получила полного original-equation signoff**: см. [P6.3b primary qualification report](P6_3B_PRIMARY_DOSE_BASIS_QUALIFICATION_2026-10-19_RU.md) в отдельном draft PR #96. Совпадение с BCR Table10.3 удостоверяет только корректную вторичную транскрипцию; не даёт clinical commissioning.

## 4. Открытые вопросы и дальнейшее решение

1. Для `lung pneumonitis`: review оригинал Bentzen2000 и QUANTEC derivation; решать добавление secondary-derived CI только после явного confidence-type и provenance update.
2. Для `prostate`: manuscript/Thames original time thresholds vs BCR Tk52; не назначать Tk автоматически.
3. Для `Hinata`: primary tBEDmax formula/maximum time point and separate Tk0/Tk21 parameter origin; обе записи оставить blocked.
4. Для `Roberts`: source original physical additional dose/day vs textbook EQD2/day and label `various`; generic H&N blocked.
5. Для CHART: original fit/covariance и MFD vs FLDR/BID-Hm различия. BCR author CI не равен «измеренной у пациента» T½.

**Итог P6.2e–f:** верифицирована транскрипция из загруженного BCR2025 по **20/20 source-to-code records**, при этом **один** из 20 primary alternative coefficients отсутствует как отдельная строка учебника; полноценная первичная дозовая нормализация и клиническое утверждение **не выполнены**. Старые P6.3 и P6.3b продолжают действовать; данные не изменялись.

**CI:** первичная блокировка Vite устранена PR #101 на `develop`; научная ветка PR #94 должна пройти обязательный CI с новой merge-base до объединения. Issue #56 остаётся открытым по трём отсутствующим документам и неполному page-by-page review.
