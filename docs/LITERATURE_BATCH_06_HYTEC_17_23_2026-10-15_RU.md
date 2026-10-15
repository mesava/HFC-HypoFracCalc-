# HFC — партия 06: HyTEC №17–20 и корреспонденция №21–23

**Дата:** 15 октября 2026 г. **Статус:** независимая воспроизводимость *выбранных опубликованных точек* + семантический аудит по **10 вновь загруженным оригиналам**. **Не** полный постраничный аудит всех PDF/рисунков, не повторная maximum-likelihood подгонка пациентских данных, не clinical commissioning.

Все файлы прочитаны по локальным байтам: PDF через PyMuPDF, DOC через antiword, DOCX через OOXML/python-docx; вычислены хэши SHA-256. [Проверяемый реестр точных файлов](HYTEC_BATCH06_UPLOADED_ORIGINAL_SHA256_2026-10-15.csv). Из PDF отрисованы и отдельно осмотрены ключевые визуальные страницы: Mahadevan p7 Table 2, Stumpf p7 Eq.1/Fig.1, Royce pp6–7 Eq.2/Table 3/Fig.1, Wang pp7–8 Fig.1 и исходные таблицы. В приложении Wang рассмотрены Fig. E1–E3, в приложении Mahadevan — Table A1/Fig A1–A2; оригинальные DOI проверены по первым страницам. **Не заявляется**, что все клинические наблюдения, confidence bands и сложные изображения были независимо оцифрованы и воспроизведены.

## 1. Матрица 10 исходных файлов

| № | Источник | Что сравнивалось | Статус для HFC |
|---|---|---|---|
| 17 | Mahadevan et al. 2021, `10.1016/j.ijrobp.2020.11.017` | Unresected 1y LC, 3fx-equivalent с `α/β10`; отдельно R0 average | 2 fitted + 1 observational already present; числа не изменены |
| 17a | Mahadevan DOC, Appendix Table A1/Fig A1–A2 | Перекрытие BRPC/LAPC/neoadjuvant, разные KM-starts, невозможность независимых fits всех семи групп | Только applicability / source limitations |
| 18 | Stumpf et al. 2021, `10.1016/j.ijrobp.2020.05.062` | 1y adrenal metastasis LC, Poisson Eq(1) `EQD2₁₀`; 1y OS отдельная модель | Один BED10=116.4 point сохранён |
| 19 | Royce et al. 2021, `10.1016/j.ijrobp.2020.08.014` | 5y prostate `FFBR`, Poisson Eq(2), Table 3, Figure 1 | **BLOCKED** low/intermediate fitted parameters mismatch; high-risk reproduction passes |
| 19a | Royce DOCX, 25 cohorts / 27 строк Table E1 | Различные изодозы (70–90%), PTV / seminal-vesicle coverage, центр vs краевая доза | Не принимать source Rx как идентичное prostate DVH |
| 20 | Wang et al. 2021, `10.1016/j.ijrobp.2020.09.054` | GU/GI/QOL endpoints, Table 1–4, Fig1, 3 suggested OAR guides | 3 suggested limits ≠ источник fitted NTCP |
| 20a | Wang DOCX, Fig E1–E3 | Фактические 4fx urethra DVH, rectal wall и circumferential dose, bladder mean dose/EPIC MID | Уточнение несовпадающих геометрий и исходов |
| 21 | Klement et al., `10.1016/j.ijrobp.2018.02.012` | Критика dichotomized BED100, Bayesian logistic vs constant fit для **primary liver** | Scientific correspondence, не численный коэффициент |
| 22 | Ohri et al., `10.1016/j.ijrobp.2018.02.013` | Ответ: ограничения агрегирования, R²=.99 для BED10 vs BED28 в их наборе режимов | Не доказывает universal `α/β=10` |
| 23 | Brown & Carlson `10.1016/j.ijrobp.2020.06.075` и на следующей странице Song & Cho `10.1016/j.ijrobp.2020.06.074` | Спор LQ vs indirect vascular/cell death | Не вводить недоказанный BED/TCP multiplicative factor |

### Примечание к письмам: частично повторяющиеся журнальные страницы

Файлы **21–23 не имеют неперекрывающегося двухстраничного содержания**: издание IJROBP выгружено последовательными оконными парами страниц **249–250, 250–251, 251–252**. При сравнении извлечённого текста page 2 у №21 и page 1 у №22 совпадают **в точности**; page 2 №22 и page 1 №23 имеют сходство **99.93%** (минимальные различия экстракции). Следовательно, 6 PDF-страниц содержат примерно **4 разных журнальных страницы**, а не 6 независимых страниц научных данных. Письмо Brown содержит *продолжение своего текста на следующей странице*, где также опубликован ответ Song & Cho. Не дублировать citations, numerators, study cohorts или дополнительные коэффициенты на основании соседних PDF.

## 2. Mahadevan: pancreatic local control

**Оригинальные PDF p7, Table 2 / Eq; supplement Fig A1–A2.** Публикация агрегирует семь частично перекрывающихся типов клинических данных. Модель **unresected** построена по **8 когортным точкам** с >=80% нерезецированных пациентов; `R0 resected` — **среднее по 3 другим когортам**, не тот же fit. KM onset в агрегированном пуле: примерно 42% отсчитывают от SBRT, 32% от диагноза и остальные от других моментов.

Формулы (источник использует `α/β=10 Gy`):
```
BED10(D,n) = D * (1 + D/(10*n))
D3eq = (-30 + sqrt(900 + 120*BED10))/2
TCP_unresected(D3eq) = 1/(1 + (17.6 / D3eq)^(4*0.64))
```
`D50=17.6 Gy` [95% CI 8.8–21.5], `γ50=0.64` [95% CI 0.27–1.02], source `P=.002` (reported test, not patient-level calibration).

| Source physical regimen | Computed `D3eq` | Independently computed 1y LC | HFC |
|---|---:|---:|---:|
| 33 Gy / 5fx | 28.2249927704 Gy | 77.01416% | ≈77% |
| 36 Gy / 3fx | 36 Gy | 86.19983% | ≈86% |

R0 Table2 rounds both 33/5 and 36/3 outcomes to **90%**. Abstract / clinical wording **>90%** at sufficient doses is not a strict confidence lower bound; HFC preserved `0.90, relation >` only as authored source narrative. **No R0 continuous model can be reconstructed from this.**

## 3. Stumpf: adrenal 1-year LC ≠ OS

**Original PDF p7 Equation (1), Fig1; Fig2 separately fits OS.** `D50(EQD2_10)=34.6 Gy` [95% CI 27.1–45.4], `γ50=.4996` [95% CI .248–.814]. Source fit P<.0001 tests positive dose slope against a horizontal null; **not** confirmation of individual model calibration or narrow uncertainty. Authors approximate median **tumour-encompassing dose** using source prescription and isodose, not DVH for each patient.

```
TCP_1y_LC(EQD2_10) =
  2^[-exp((2*gamma50 / ln(2))*(1-EQD2_10/D50))]
BED10 = EQD2_10 * (1+2/10)
```

At `BED10=116.4 Gy`, `EQD2_10=97 Gy`, printed Eq1 gives `94.9809158%`, rounding to 95%. Publication text uses `>95%` near that *approximate* threshold. This sub-0.02 percentage-point precision distinction **does not warrant changing the reported source point or claiming exact threshold**.

## 4. Royce: explicit BLOCKER for LOW/intermediate-risk fit

**Original PDF p6 Eq(2), Table3 and p7 Figure1, DOCX Table E1.**

```
FFBR_5y(D) = 2^[-exp(e*gamma*(1-D/D50))], D = EQD2_(alpha/beta 1.5)
```

| Risk group | Published D50 (95% CI) | γ (95% CI) | EQD2 | Eq(2)+Table3 | Printed narrative |
|---|---|---|---:|---:|---:|
| Low/int | 20.6 (18.9–22.3) Gy | .15 (.13–.17) | 71 | **77.4443%** | ~90% |
| Low/int | same | same | 90 | **83.9045%** | ~95% |
| High | 84.2 (81.4–86.8) Gy | 4.5 (2.82–6.53) | 97 | **89.7669%** | ~90% |
| High | same | same | 102 | **94.9127%** | ~95% |

**Уже зарегистрированная проблема воспроизведена непосредственно по загруженному PDF**, а не исправлена предположением о перепутанном `γ`. Исходный Fig1 **визуально** следует нарративным значениям около 90/95 для low/int, а *напечатанные Eq2/Table3* нет. Истинная причина неизвестна. Cohorts с 5y follow-up в Fig1: примерно **1069 low/intermediate и 85 high-risk**, хотя всё исследование охватывает **4821 пациентов** в 25 когортных публикациях; интерпретация ширины доверительной области особенно критична для high-risk. Источник самостоятельно предупреждает не делать выводов при EQD2 **<~80 Gy**, поэтому точка 71Gy отмечена extrapolated в HFC. Документированный 2025 ответ авторов не поставлен с этой партией; его содержание **не предполагается**. Не создавать corrected gamma или patient-level FFBR на основании двух округлённых процентов.

## 5. Wang: OAR objectives НЕ равны исходным fitted risk curves

**Оригинальные PDF pp6–9, Figure1, supplement Fig E1–E3.** В source Conclusions перечислены **suggested** ориентиры (преимущественно 35–40Gy/4–5fx): мочевой пузырь `V(Rx)<5–10cc` (абсолютный объём при **Rx dose**, не 5–10 Gy), уретра `Dmax<38–42Gy`, прямая кишка `Dmax<35–38Gy`. Авторы прямо отмечают недостаточные данные для **firm tolerance doses**.

Исследовательские модели в том же источнике **содержат разные клинические исходы и определения дозы**:

| Набор | Первичная метрика и клинический endpoint | Source fitted parameters, не HFC prescription |
|---|---|---|
| Kole, n216 | bladder EUD; позднее обострение мочевых симптомов по IPSS | LKB `TD50 38.7 Gy, m .19, n .13`, **95% CI** |
| Zhang, n78 / 4fx | urethra D1cc/D0.1cc/Dmax; late CTCAE `G≥2 GU` | Probit `TD50 48.6/52.6/53.5 Gy`, `m .14/.18/.18`, **68% CI**, AUC .60/.62/.61 |
| Kim, n91 | rectal circumference C24/C39 и rectal wall V50; late `G≥3` bowel toxicity | Probit `TD50 123.8%/51.9%/5.9cc`, `m .29/.22/.32`, **68% CI**, AUC .79/.83/.93 |
| Qi, n86 | physical bladder mean dose / EPIC QOL 12-month urinary-incontinence MID | Probit `TD50 18.6Gy, m .79`, **68% CI**; other QOL models not significant |

**Отдельное требующее уточнения обозначение:** на source **Figure 1B (PDF p8)** оси прямо подписаны *Four Fraction Urethra D1cc/D0.1cc/Dmax*, тогда как в сопровождающем разделе указано преобразование к пятифракционному эквиваленту и авторы приводят `20% risk` соответствующих 5fx доз. Без установленного преобразования **не следует механически применять TD50/m к 5fx Dmax** либо приравнивать этот 20%-risk к рекомендуемым 38–42Gy уретры. Проверка на уровне независимых исходных данных и dose convention остаётся открытой. Это не объявление ошибочности source: возможны разные дозовые оси в разных частях отчёта.

**Решение:** 3 existing observational constraints не превратились в continuous `NTCP`, не получили `estimatedRisk`, и численно сохранены.

## 6. Scientific correspondence: не склеивать конкурирующие интерпретации

### Klement / Ohri (2021 published; DOI 2018.02.012/013)

Klement возражает против заключения *не обнаружена дозозависимость primary liver*, указывает на более поздние крупные наборы данных, влияние histology/size/предшествующей системной терапии и на то, что BED100 бинаризация недостаточна для проверки непрерывной зависимости. Его Bayesian logistic fit оказался предпочтительнее constant-intercept по deviance information criterion. Это отдельный статистический результат, не готовая validated HFC clinical TCP.

Ohri отвечает, что в диапазоне режимов именно **своей исследованной выборки** BED(α/β=10) и BED(α/β=28) сильно коррелировали (R²=.99), и сообщает об отсутствии статистической ассоциации в агрегированных когортах даже при других cutoffs BED 60–180. При этом авторы **согласились** с ограниченностью BED100 как универсального клинического порога и с возможностью влияния size/histology/treatment. Нельзя делать из спора вывод, что `α/β=28` «официально заменяет» 10 Gy или что универсальная дозозависимость доказана/опровергнута.

### Brown/Carlson vs Song/Cho (DOI 2020.06.075/074)

Brown/Carlson утверждают, что доступные данные совместимы с объяснением SBRT через обычный LQ/dose escalation, и что сосудистое indirect cell kill само по себе не доказано как главный механизм. Song/Cho возражают: дополнительные 1 log клеточной гибели могут проявляться спустя время, а LQ при больших дозах может завышать прямую гибель. **Обе стороны обсуждают биологический механизм, не коэффициент для автоматического изменения BED.** Song reply уже присутствует на второй странице файла №23; №24 следует рассматривать без повторного начисления `1 new independent model`.

## 7. Реализация партии 06

1. `src/data/evidence/v0.1/sources.ts` дополнен provenance/source limitations без замены математических или клинических значений.
2. `tests/hytecBatch06OriginalLiteratureSemantics.test.ts` независимо вычисляет source formula examples Mahadevan, Stumpf, Royce и закрепляет различие `Wang suggested vs fitted`.
3. [Исходные SHA256](HYTEC_BATCH06_UPLOADED_ORIGINAL_SHA256_2026-10-15.csv) связывают этот проход с десятью конкретными байтовыми экземплярами.
4. **Не изменялись** поля `probability`, `value`, `D50`, `gamma`, `alphaBeta`, BED/EQD2 runtime, patient-facing clinical signoff. Не добавлена новая непрерывная `OutcomeModel`/NTCP. Тесты по исходным формулам не заменяют независимую повторную подгонку, figure covariance и валидацию на внешних пациентах.

## 8. Открытые научные вопросы

- **Высший приоритет Royce 19:** получить полный текст письма Quan Chen и ответа Mavroidis/Royce/Chen 2025 с подтверждением Eq(2)/Table3/исправленных коэффициентов (если они есть), а не угадывать их. До этого оставить `UNRESOLVED`.
- **Wang 20:** устранить неопределённость единиц и 4fx-versus-5fx осей до любой попытки source-fit import; показать отдельные исходы IPSS/CTCAE/EPIC, а не общий GU NTCP.
- **Mahadevan 17:** source R0 estimate (Table 2 rounded `90%`, narrative `>90%`) не объявлять независимым прогнозом для отдельного пациента.
- **Stumpf 18:** верифицировать dose prescription/isodose adjustment и outer CI по исходным cohort-level данным; математическое совпадение одиночной точки недостаточно.
- **Клинический gate:** нужны все 40 исходных файлов HyTEC с полным локаторным постраничным QA, приоритетное unresolved review, прослеживаемость source, независимое второе рецензирование. Наличие библиографии и green CI не является клиническим commissioning.

**Итог:** основной численный массив HFC подтверждён в выбранных опубликованных точках. Наиболее существенное противоречие Royce **не закрыто**; у Wang верификация непрерывных индивидуальных моделей дополнительно требует независимого исследования dose axis. Статус доказательной базы остаётся `draft`.
