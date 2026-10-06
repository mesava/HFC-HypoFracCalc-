# Приёмка HFC v0.1-dev

## Назначение

Этот документ фиксирует browser-level и ручную пользовательскую приёмку перед подготовкой release candidate.

Автоматические E2E-тесты не заменяют независимую клиническую проверку. Их задача — ловить регрессии интерфейса, навигации, валидации ввода и основных пользовательских сценариев.

## Автоматизированный пакет browser-qa-v0.1

Playwright/Chromium проверяет:

- старт сайта на русском языке;
- переключение RU → EN;
- навигацию по основным модулям;
- Quick EQD с валидным расчётом;
- ошибку при нулевом числе фракций;
- скачивание JSON-аудита Quick EQD;
- safety-поведение Treatment Gap после v0.8/v0.10: отсутствие скрытого H&N Dprolif/Tk и требование явного выбора модели;
- загрузку Compare Regimens;
- загрузку Clinical Constraints;
- загрузку Reirradiation;
- мобильное меню при ширине 390 px.

Запуск локально:

```bash
npm ci
npx playwright install chromium
npm run build
npm run test:e2e
```

## Ручная приёмка — следующий слой

Перед release candidate необходимо отдельно пройти:

- Главная;
- Быстрый EQD;
- Сравнение режимов;
- Перерывы в лечении;
- Клинические ограничения;
- Повторное облучение;
- Методология;
- О сайте.

Для каждого клинического калькулятора проверить:

- пустые поля;
- ноль;
- отрицательные числа;
- дробное число фракций;
- экстремальные дозы за фракцию;
- endpoint без automatic α/β;
- ручной α/β;
- published explicit-only α/β;
- диапазоны 95% ДИ;
- warning при высокой дозе за фракцию;
- JSON audit;
- printable report.

Для Treatment Gap дополнительно:

- неверные даты;
- gap вне курса;
- excluded dates;
- BID <6 ч;
- BID 6–8 ч;
- dose/fraction >2,2 Гр при BID;
- manual Dprolif/Tk;
- evidence Dprolif без Tk;
- несколько OAR;
- T½ range/lower-bound без автоматического превращения в point value.

Для Reirradiation дополнительно:

- Type I / Type II;
- incomplete previous data;
- registration suitability;
- manual recovery = 0%;
- manual recovery >0% без rationale;
- разные dose metrics;
- cumulative EQD₂ budget;
- spinal HyTEC при корректном thecal-sac Dmax;
- spinal HyTEC при неподтверждённой структуре.

## Release gate

Browser QA считается пройденным только если:

1. unit tests зелёные;
2. production build зелёный;
3. Playwright E2E зелёный;
4. ручная приёмка не содержит блокирующих дефектов;
5. evidence dataset остаётся `draft` до отдельного release review.
