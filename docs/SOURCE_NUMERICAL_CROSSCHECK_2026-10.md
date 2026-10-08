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

## Важные границы переноса

1. ReCOG Zhang 2026 использует **институциональные** ограничения, α/β=2.5 Gy и tissue recovery factors; авторы явно не называют α/β=2.5 универсальным. Приведённые TRF и OAR constraints нельзя вводить как автоматические значения HFC.
2. ESTRO–EORTC 2022 Tables S20 отмечают ограниченность доказательств о tissue recovery; регистровая/скалярная сумма EQD2 не равна проверенной пространственной аккумуляции дозы.
3. Значение числа из статьи без диапазона, определения endpoint и типа дозовой метрики — недостаточное основание для `validated`.
4. Полностью не сверены все HyTEC supplements, 103 evidence records, последовательность репопуляции/репарации и вся библиотека RCR — поэтому результат не обозначается как полный независимый scientific audit.
5. Исходные работы `Paradis 2026 ReCOG consensus`, `Ohri 2012 NSCLC size effect`, `Samai & Berremdani 2026 systematic review` и ряд исторических работ представлены в registry, но отдельные исходные PDF в загруженной группе отсутствуют. Для их проверки следует сохранить отдельный статус `not supplied in this batch`.

## Следующие проверяемые этапы

- Добавить полный manifest 69 файлов: имя, родительская статья, тип, статус проверки.
- Сверить каждую переносимую численную запись с таблицей/формулой и её supplementary; проверять не только значения, но и ДИ, популяцию, dose metric, prior RT, follow-up, treatment technique.
- Закрывать evidence-validation только с независимой второй проверкой, без скрытого обновления defaults.
- Создать регрессионные тесты на клинические опубликованные примеры и выпустить отдельный evidence-only PR после QA.
