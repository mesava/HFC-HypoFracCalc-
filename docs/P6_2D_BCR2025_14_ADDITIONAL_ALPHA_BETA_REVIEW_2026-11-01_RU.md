# HFC — P6.2d: оставшиеся 14 α/β и граница BCR2025 Table10.1 как вторичного источника

**Дата:** 01.11.2026. **Проверяемое издание:** Joiner & van der Kogel (eds.), *Basic Clinical Radiobiology*, 6th ed., 2025, **PDF p.120 / printed p.105, Table 10.1**; файл `Basic Clinical Radiobiology 2025(1).pdf`, SHA-256 `a697a0e920c83e3f097cdbc2ab6aec1a906afb8825ea510edf8fd9498aaf6d5b`. Таблица проверена как PDF текст **и визуально отрендеренная страница**.

## Результаты

Оставшиеся **14** HFC source records живут в `src/data/evidence/v0.1/alphaBetaAdditional.ts`. **12/14** имеют прямую соответствующую строку в учебной Table10.1, где **все 12 point estimates + обе границы 95% CL совпадают** с HFC. **2/14 spinal myelopathy (Jin 2015, Schultheiss 2008)** не имеют точной строки того же первоисточника в учебнике и не были среди нынешних загруженных оригиналов; BCR Table10.1 содержит лишь **иной** исторический human bound `<3.3 Gy` (Dische 1981), который **не** является численным опровержением Jin 3.7 или Schultheiss 0.87 — это разные популяции/модели/источники.

[14-row crosswalk, including exact source status](P6_2D_14_ADDITIONAL_ALPHA_BETA_BCR2025_SOURCE_GATES_2026-11-01.csv) гарантирует, что не выданы ложные `primary-original-verified` статусы.

### 12 строк из BCR 2025

| Клинический исход | α/β, Гр | 95% CL, Гр | Оригинал в текущем архиве |
|---|---:|---:|---|
| Oral mucosa mucositis (Denham 1995) | 9.3 | 5.8–17.9 | Нет |
| Skin erythema (Turesson/Thames 1989) | 8.8 | 6.9–11.6 | Нет |
| Skin telangiectasia (Bentzen 1990) | 2.6 | 2.2–3.3 | Нет |
| Subcutis fibrosis (Bentzen/Overgaard 1991) | 1.7 | 0.6–2.6 | Нет |
| Bowel stricture/perforation (Deore 1993) | 3.9 | 2.5–5.3 | Нет |
| Bowel various late effects (Dische 1999) | 4.3 | 2.2–9.6 | Нет |
| Lung pneumonitis (Bentzen 2000) | 4.0 | 2.2–5.8 | Нет |
| Radiological lung fibrosis (Dubray 1995) | 3.1 | −0.2–8.5 | Нет |
| H&N various late effects (Stuschke/Thames 1999) | 4.0 | 3.3–5.0 | Нет |
| H&N tumour control (Stuschke/Thames 1999) | 10.5 | 6.5–29 | Нет |
| Early NSCLC (Stuschke/Pöttgen 2010) | 8.2 | 7.0–9.4 | Нет |
| Esophageal pCR (Geh 2006) | 4.9 | 1.5–17 | Нет |

**Принципиально:** 12 числовых совпадений относятся к **верности переноса из BCR2025**, не к независимой проверке авторских первичных моделей, подборов параметров, CI bootstrap или исходных clinical DVH.

Для пяти из 12 записей в P3.14 утверждено, что вторичная Table10.1 достаточна для evidence-source provenance, в том числе для некоторых exact endpoint auto defaults. Этим новым аудитом это решение **не отменяется**. Разница между прочими `defaultEligible` из source-verified BCR и clinical commissioning остаётся: `autoEligible` не является клиническим утверждением и не превращает `draft` в production.

## Важные научные предупреждения

- У `lung fibrosis 3.1` доверительный интервал **пересекает ноль**, нельзя утверждать точную радиобиологическую чувствительность.
- `H&N late effects 4.0` — составной исход и не структура-специфическая α/β (нерв/слюнная железа/слизистая).
- `H&N tumour control 10.5` имеет широкий 95% CL 6.5–29; не переносить на любую H&N гистологию.
- `Esophagus pCR 4.9` выведено на preoperative chemoradiotherapy population, не general definitive RT tumour-control.
- `spinal cord` BCR ограничение `<3.3` относится к Dische 1981, а не к оригинальным Jin/Schultheiss; в HFC оба альтернативных значения **без auto**.

## Сводка P6.2c+d

- **30/44** α/β — 5 первичных загруженных научных PDF, страничные оригинальные оценки/CI сопоставлены с HFC.
- **12/44** α/β — BCR2025 Table10.1 точечные данные/95% CL сопоставлены; **secondary source**.
- **2/44** α/β — нет точных primary PDF среди данного корпуса, нет точной строки из BCR2025 Table10.1; нужен независимый оригинал.
- **44/44** HFC α/β записей охвачены техническим source-tier crosswalk. **Это не 44/44 первичных model reproductions и не clinical approval**.

Существующий блокер CI — Vite vulnerability [issue #100](https://github.com/mesava/HFC-HypoFracCalc-/issues/100). Все расчётные значения, `status`, `defaultEligible`, `clinical_release_approved` и `draft` остаются неизменными.

**Следующий этап:** P6.2e: 6 T½ и 14 Dprolif, источник, Eq.10.2, Table10.2, Table10.3 в BCR; сопоставление с опубликованными первичными источниками и одновременная проверка BED↔EQD2 ошибок. Затем 29 OAR constraints / 9 outcome sets / RCR2024.
