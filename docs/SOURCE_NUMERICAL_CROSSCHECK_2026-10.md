# Научная сверка исходных документов HFC — 2026-10-08

**Статус:** первый проход, не полная независимая валидация всех evidence records. Пользователь загрузил 69 отдельных документов; 61 источник зарегистрирован в `sources.ts`. Проверены только перечисленные ниже численные фрагменты; для других значений статус остаётся непроверенным в данном проходе. Evidence releaseStatus по-прежнему `draft`.

## Сверено с первичными файлами

| Источник, место | Числа и контекст из публикации | Запись HFC | Заключение |
|---|---|---|---|
| Vogelius & Bentzen 2020, Results | Простатический биохимический контроль: α/β = 1.6 Gy, 95% ДИ 1.3–2.0; I²=70%, значимая гетерогенность | `ab-prostate-biochemical-control-vb2020` | Совпадает; caveat сохранён |
| FAST-Forward 2026, исправленный supplement 24.08.2026, Table D5 (p. 20) | IBR: скорректированный α/β 3.3 (1.9–4.9), нескорректированный 3.4 (1.6–5.2); любой clinician-reported breast/chest wall AE: 2.1 (1.6–2.6) Gy | `ab-breast-ibr-fastforward2026-*`, `ab-breast-chestwall-any-ae-fastforward2026` | Совпадает; composite endpoint не смешивается с IBR |
| HyTEC Milano 2021, optic pathways, Abstract | Без prior RT: рекомендованные максимальные точечные дозы 10 Gy/1 fx, 20 Gy/3 fx, 25 Gy/5 fx; при prior RT модель неприменима | `hytec-optic-dmax-*` | Совпадает; условие prior RT сохранено |
| HyTEC Sahgal 2021, spinal cord, Abstract | Lower-risk-associated factors: cumulative thecal sac Dmax EQD2(α/β=2) ≤70 Gy, current SBRT ≤25 Gy, ratio ≤0.5, интервал ≥5 мес | `hytec-spinal-cord-reirradiation-lower-risk-factors` | Совпадает; не абсолютная толерантность и не автоматический recovery |
| HyTEC Vargo 2021, Table 4 | D50 2y LC = 45.1 Gy (95% CI 39.1–71.5), 3y LC = 49.8 Gy (43.7–72.8), 5-fraction-equivalent | `hytec-hn-reirradiation-local-control` | Центральные точки совпадают; ДИ модели пока не отображаются как поля HFC |
| HyTEC Mahadevan 2021, Abstract & section 8 | 33 Gy/5 соответствует 28.2 Gy/3-equivalent при α/β 10; 1y LC без операции 77%, после R0 >90% | `hytec-pancreas-1y-local-control` | Совпадает; R0 и unresected разделены |
| Источник опубликованных клинических примеров Batyan et al., section 3.7, pp. 9–11 | Ошибка дозы: первые 20×1.8 Gy вместо плановых 20×2.0 Gy при 33×2 Gy; остаточные 13 фракций ≈2.3 Gy по EQD2 при α/β=10 | Сценарий correction/calendar | Пример годится для регрессионного теста; отдельный исполняемый полный интеграционный прогон ещё требуется |
| RCR Timely Delivery 2019, section 5 | При BID рекомендован минимальный интервал между фракциями 6 часов | Treatment Gap | Содержательно согласуется с используемым ограничением; требует отдельного UI-теста |

| HyTEC Redmond 2021, Abstract/Results | Для мозговых метастазов 1-летний LC: ≤20 мм при 18 Гр/1 фр. >85%, при 24 Гр/1 фр. ≈95%; 21–30 мм при 18 Гр ≈75%; 31–40 мм при 15 Гр ≈69% | `hytec-brain-mets-1y-local-control` | Совпадает. **Не путать с 2-летними** modelled actuarial values из Table 3 той же статьи |
| HyTEC Soltys 2021, vestibular schwannoma, Abstract/Results | LQ-модель TCP через 3–5 лет: 10/11/12/13 Гр в 1 фр. → 85.0/88.4/91.2/93.5%; 18 Гр/3 → 93.6%; 25 Гр/5 → 97.2%. Для доз **<11 Гр/1 фр. нет пригодных данных для обучения модели** | `hytec-vestibular-schwannoma-3to5y-tcp` | Числа совпадают; для 10 Гр добавлен маркер `extrapolated: true`, без изменения самой вероятности. Отдельная LQ-L-модель в статье даёт иные значения, автоматически не смешивается с LQ |
| HyTEC Milano brain SRS 2021, Abstract | При SRS в 1 фракцию V12=5/10/>15 см³ (включая объём мишени) соответствует примерно 10/15/20% симптоматического радионекроза | `hytec-brain-v12-*` | Совпадает; это риск-точки, не дозовые лимиты |
| HyTEC Ohri liver 2021, Abstract/section 5 | Метастазы печени: BED10 >100 Gy → 3-летний LC 93%, BED10 ≤100 → 65%; первичные опухоли печени отдельно | `hytec-liver-metastases-bed10-local-control` | Совпадает; сравнение категорий, не непрерывная TCP-кривая |
| HyTEC Stumpf adrenal 2021, Abstract | BED10 около 116.4 Gy → >95% 1-летний LC метастазов надпочечника | `hytec-adrenal-metastases-1y-tcp` | Совпадает; символ «>» сохранён |
| HyTEC Royce prostate 2021, Abstract | Low/intermediate risk: EQD2(α/β=1.5) 71/90 Gy → 90/95% 5-летний биохимический контроль. High risk: 97/102 Gy → 90/95% | `hytec-prostate-sbrt-5y-tcp` | Совпадает; risk groups не объединены, source-specific α/β не становится универсальным default |

| Brand 2021, *IJROBP* vol. 110, Table 3, LKB-EQD2 (all patients) | Девять ректальных endpoint-specific α/β: bleeding G1+/G2+, stool frequency G1+/G2+, pain G1+, proctitis G1+/G2+, sphincter G1+, stricture/ulcer G1+ — все центральные значения и обе границы 95% CI | `alphaBeta.ts`, 9 records | **9/9** чисел и CI совпадают; очень широкие CI у отдельных endpoints сохранены |
| Brand online 2022 / print 2023, *IJROBP* vol. 115, Table 2, LKB-EQD2 | Десять GU endpoints: dysuria, haematuria, incontinence, reduced flow/stricture, urine frequency (каждый G1+/G2+) — все центральные α/β и обе границы 95% CI | `alphaBeta.ts`, 10 records | **10/10** чисел и CI совпадают; лишь dysuria G1+ и haematuria G1+/G2+ имели значимое улучшение модели при EQD2 correction, поэтому не следует трактовать остальные как надёжные defaults |

| HyTEC Grimm major vessels 2021, section 8 | После повторного SBRT головы/шеи: стараться держать D0.5cc крупных сосудов <20 Gy при 5 fx и минимизировать объём >20–30 Gy; logistic Dmax ≈2% при 20 Gy и ≈12% при 30 Gy | `hytec-major-vessel-*` | Совпадает; не делать «жёсткую» универсальную толерантность |
| HyTEC Kong lung 2021, Abstract | При 3–5 fx в большинстве серий симптоматическая лёгочная токсичность <10–15% при combined MLD <8 Gy и V20 <10–15%; общий порог толерантности не установлен | `hytec-lung-rilt-*` | Совпадает; учитывается исключительная чувствительность при ILD |
| HyTEC Miften liver 2021, section 8 | MLD primary liver 13 Gy/3 fx и 18 Gy/6 fx; metastases 15 Gy/3 fx и 20 Gy/6 fx, заимствовано из QUANTEC и контекстуализировано HyTEC | `hytec-liver-*-mld-*` | Совпадает; необходимо сохранять разницу primary/metastases |
| HyTEC Wang prostate toxicity 2021, Conclusions | Bladder V(Rx Dose) <5–10 cc, urethra Dmax <38–42 Gy, rectum Dmax <35–38 Gy; явная оговорка «не дают твёрдых tolerance doses» | `hytec-prostate-sbrt-*` | Совпадает; диапазоны не превращены в универсальные клинические ограничения |

## Важные границы переноса

1. ReCOG Zhang 2026 использует **институциональные** ограничения, α/β=2.5 Gy и tissue recovery factors; авторы явно не называют α/β=2.5 универсальным. Приведённые TRF и OAR constraints нельзя вводить как автоматические значения HFC.
2. ESTRO–EORTC 2022 Tables S20 отмечают ограниченность доказательств о tissue recovery; регистровая/скалярная сумма EQD2 не равна проверенной пространственной аккумуляции дозы.
3. Значение числа из статьи без диапазона, определения endpoint и типа дозовой метрики — недостаточное основание для `validated`.
4. Полностью не сверены все HyTEC supplements, 103 evidence records, последовательность репопуляции/репарации и вся библиотека RCR — поэтому результат не обозначается как полный независимый scientific audit.
5. Исходные работы `Paradis 2026 ReCOG consensus`, `Ohri 2012 NSCLC size effect`, `Samai & Berremdani 2026 systematic review` и ряд исторических работ представлены в registry, но отдельные исходные PDF в загруженной группе отсутствуют. Для их проверки следует сохранить отдельный статус `not supplied in this batch`.

## Следующие проверяемые этапы

- **Выполнено:** реестр 69 файлов с именами, родительскими статьями и статусом доступности; добавлена матрица [103 evidence records по первичным файлам](EVIDENCE_103_SOURCE_FILE_MATRIX_2026-10.md).
- Сверить каждую переносимую численную запись с таблицей/формулой и её supplementary; проверять не только значения, но и ДИ, популяцию, dose metric, prior RT, follow-up, treatment technique.
- Закрывать evidence-validation только с независимой второй проверкой, без скрытого обновления defaults.
- **Выполнено (выборочно):** регрессионные тесты на опубликованные численные точки и сценарии, включая Redmond и Soltys. Следующий этап — source-labeled checks для остальных результатов и независимая вторая проверка.
