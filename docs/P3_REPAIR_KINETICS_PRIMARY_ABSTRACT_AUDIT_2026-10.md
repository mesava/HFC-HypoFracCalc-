# P3.4 — репарация: проверка 4/6 T½-записей по оригинальным опубликованным аннотациям

**Дата сверки: 09.10.2026. Статус: external primary author ABSTRACT source check, NOT full-PDF independent quantitative QA.**

В ходе P3.4 выполнена конкретная сверка опубликованных результатов первичных работ с `src/data/evidence/v0.1/repairHalfTime.ts`. Для четырёх записей исходного пользовательского комплекта из 69 документов **нет**, однако доступны официальные публикационные аннотации PubMed, содержащие искомые значения. В реестре 103 записей `user_file_supplied=false` оставлено **без изменения**. Нельзя приравнивать такую проверку к полному аудиту страниц оригинального PDF, таблиц, всех моделей и clinical commissioning.

## 1. Primary-source locator и сопоставление

1. Bentzen SM, Saunders MI, Dische S. *Repair halftimes estimated from observations of treatment-related morbidity after CHART or conventional radiotherapy in head and neck cancer*. Radiother Oncol. 1999;53(3):219–226. **DOI `10.1016/S0167-8140(99)00151-6`**, PMID **10660202**, официальный [PubMed original author abstract](https://pubmed.ncbi.nlm.nih.gov/10660202/) (**Abstract, Methods and Results**). В первоисточнике сравниваются CHART и conventionally fractionated RT с prospectively scored late normal-tissue morbidity. Cox hazard ratios converted to repair half-time with propagation of `α/β` and `γ50` assumptions by **1000 Monte Carlo samples**.
2. Bentzen SM, Ruifrok ACC, Thames HD. *Repair capacity and kinetics for human mucosa and epithelial tumors in the head and neck*. Radiother Oncol. 1996;38(2):89–101. **DOI `10.1016/0167-8140(95)01689-9`**, PMID **8966232**, официальный [PubMed original author abstract](https://pubmed.ncbi.nlm.nih.gov/8966232/) (**Abstract, last 3 sentences**). Сопоставлены четыре ранее опубликованных clinical interval studies; авторы называют только **вероятный диапазон 2–4 h** и отмечают недостаточную статистическую разрешающую способность для более точной оценки.

| HFC record | Окончательный endpoint | Опубликовано | Источник | Проверка |
|---|---|---|---|---|
| `t12-laryngeal-edema-chart1999` | Laryngeal oedema | **4.9 h; 95% CI 3.2–6.4 h** | 1999 PubMed Abstract Results | Число и обе CI границы совпали |
| `t12-skin-telangiectasia-chart1999` | Skin telangiectasia | **3.8 h; 95% CI 2.5–4.6 h** | 1999 PubMed Abstract Results | Число и обе CI границы совпали |
| `t12-subcutis-fibrosis-chart1999` | Subcutaneous fibrosis | **4.4 h; 95% CI 3.8–4.9 h** | 1999 PubMed Abstract Results | Число и обе CI границы совпали |
| `t12-oral-mucositis-bcr2025` | Early human oral mucositis | **probably 2–4 h** | 1996 PubMed Abstract | Диапазон совпал; **95% CI отсутствует** |

Подробная машинная таблица по id, DOI, PMID, publication abstract locator, оценке, интервалу и полноте provenance: [P3_REPAIR_KINETICS_PRIMARY_CROSSCHECK_2026-10.csv](P3_REPAIR_KINETICS_PRIMARY_CROSSCHECK_2026-10.csv).

## 2. Принципиальные научные различия

- **CHART 1999**: `4.9/3.8/4.4 h` — *endpoint-specific means* из Монте-Карло-пропагации исходных клинических оценок (1000 выборок); `95% CI` — интервалы соответствующих распределений T½. Это **не** измерение собственной скорости репарации отдельного пациента или независимо восстановленный original-data Cox fit.
- **Mucosa 1996**: `2–4 h` — оценённый вероятный диапазон из нескольких клинических сравнений. `3.2 h` из той же аннотации — значение, при котором **теоретически максимальна разница dose-equivalent repair при интервалах 4 и 6 h**, а не опубликованная `3.2 h ± CI` для пациента. Не ставить точечное `valueHours=3.2` и не объявлять интервал 2–4 статистическим CI.
- Для CHART исходно характерны интервалы около 6–6–12 h; это не доказательство переносимости T½ на произвольные BID/TID схемы и органы. Выбор `defaultEligible` (3 старых записи) **не изменён** в текущей научной ветке; дальнейшая клиническая проверка и UI ограничители остаются обязательными.
- **Учет неполной репарации** при одном экспоненциальном компоненте использует `r(Δt)=2^(−Δt/T½)` как долю незавершённых повреждений (без клинического TCP/NTCP). Для иллюстративного 6-часового интервала при T½ 4.9/3.8/4.4 h получается соответственно `0.42795 / 0.33473 / 0.38860`; при 12 h — `0.18314 / 0.11204 / 0.15101`. Это **самостоятельный физико-математический check**, не публикационные исходы и не границы безопасности. Он не подменяет полную модель нескольких фракций с overnight carry-over.

## 3. Что изменено и что остаётся открытым

- 4/103 evidence rows в `P3_103_EVIDENCE_SOURCE_AUDIT_STATUS_2026-10.csv` получили **новые ограниченные статусы**: 3 `p3_external_primary_abstract_MC_parameter_CI_checked_full_pdf_pending` и 1 `p3_external_primary_abstract_qualitative_range_checked_full_pdf_pending`. Это **НЕ** `p3_primary_table_parameter_and_95pct_ci_checked` из полнотекстового P3 Brand/Vogelius, и все 4 `user_file_supplied=false`.
- `repairHalfTime.ts`: только пояснения о методе получения 95% CI и `3.2h` у mucosa; численные параметры `valueHours`, `rangeHours`, `ci95`, `status`, `defaultEligible`, `support` и клинический двигатель **не изменены**.
- Два теста проверяют 103-record ledger, source values/CI vs implementation, недопустимость превращения mucosal 3.2 h в point estimate, 6h/12h одноэкспоненциальные иллюстративные расчёты и отсутствие ложных approval flags.
- Открыты: **full-publisher-PDF table/figure/equation QA, original CHART cohort methods and covariance audit, independent repair-model parameters verification against clinical schedules, second medical physicist and oncologist review**. Для **2 других** T½ в HFC (spinal cord / temporal lobe) первичные значения не подтверждены; они остаются `deprecated`, а научный статус `pending`.
- Текущее `2026.10-v0.2` остаётся `draft`; никаких P4 клинических численных исправлений.
