# HFC 0.1.0-rc.2 — технический исследовательский кандидат (проект выпуска)

**Подготовлен:** 6 ноября 2026 года. **Статус:** STAGING, не опубликован в `main`, **не клинический выпуск**.

## 1. Что войдёт после отдельного решения о публикации

Ветку `release/0.1.0-rc.2-staging-20261106` создано из интегрированной `develop` после успешного CI P6. Документ зафиксирован отдельно от [DRAFT PR #106 — develop→main](https://github.com/mesava/HFC-HypoFracCalc-/pull/106). Создание/мерж подготовительной версии **не** подразумевает публикацию на основном сайте.

1. Прежнее проверенное расчётное ядро BED/EQD2/Thames/reirradiation v0.2-dev, **без изменения клинических параметров и расчётных алгоритмов**.
2. P6 независимые библиографические и источниковые аудиты: [P6 Integration Readiness](P6_INTEGRATION_RC_READINESS_2026-11-06_RU.md); старые и новые публикации, их оценка применимости и научные ограничения.
3. ReCOG 2026 full original Paradis–Appelt–Bentzen, [первичная проверка 25 требований](P6_RECOG_2026_APPELT_PARADIS_PRIMARY_PDF_AUDIT_2026-11-06_RU.md), DOI `10.1016/S1470-2045(25)00562-5`; поддержка **6 present, 11 partial, 8 missing** — это не formal ReCOG clinical compliance.
4. RCR 2024: 25 fixed + 4 complex prescriptions validated as source-transcribed, 11 gaps remaining and no auto patient eligibility.
5. Runtime preview includes previous clinical-only UI cleanup; independent release-page visual acceptance required in RU/EN, mobile, light/dark.
6. Security: Vite 8.3.3 after PR #101, high/critical audit blocking CI.

### Технические изменения, вносимые **только этим staging PR**

- `package.json` version: `0.1.0-rc.1 → 0.1.0-rc.2`;
- `package-lock.json` root and installed root version: synchronized to `0.1.0-rc.2`;
- `src/version.ts` `HFC_ENGINE_VERSION`: `0.1.0-rc.2`, `HFC_AUDIT_SCHEMA_VERSION` остаётся `1.1`;
- новый текст этого draft release note;
- **не изменяются** `src/core`, `src/data/evidence`, `src/workflows`, OAR constraints, TCP/NTCP source fit parameters or `reirradiation` math.

## 2. Блокировки и ограничения

| Gate | Фактический статус |
|---|---|
| Source bytes | 66/69 исторических файлов есть; 3 **других** отсутствуют, #56 открыт; новое ReCOG подтверждено SHA, но не заменяет эти файлы |
| Публикационная воспроизводимость | #59 Ohri printed 93% vs formula ~94.8%; #104 Royce 2021 subgroup discrepancy — открыты |
| Reirradiation reporting | #107: Figure 2 ReCOG requires treatment dates, plan/modality, uncertainty, consent, true OAR 3D dose DVHs; сейчас лишь скалярный research workflow |
| Clinical reviewers | `evidenceManifest.reviewers=[]`, `releaseStatus=draft`; independent medical-physics/oncology clinical commissioning not performed |
| Research LKB/NTCP | [PR #97](https://github.com/mesava/HFC-HypoFracCalc-/pull/97) remains separate draft, excluded |
| CI staging | MUST pass npm audit, TypeScript, Vitest, production build and Playwright |
| Main release | **НЕ РАЗРЕШЁН** этим staging PR; [PR #106](https://github.com/mesava/HFC-HypoFracCalc-/pull/106) remains DRAFT |

Существующие `research-only` предупреждения должны оставаться видимы. Нельзя переименовывать научный статус `draft` в `validated` только из-за прохождения CI.

## 3. Приёмка перед rc.2

- Подтвердить совпадение метаданных версии в 3 файлах.
- Проверить полноту и результат интегрированных научных tests, включая ReCOG 25 пунктов, Royale/Ohri unresolved statuses, 29 OAR, 40 OutcomeModel points, 29 RCR presets.
- Проверить стабильность экспорта/реплея аудита после обновления `HFC_ENGINE_VERSION`, сохранить schema 1.1.
- Отдельно убедиться, что `main` и `develop` не потеряли security backport при merge, который GitHub показывает mergeable, несмотря на diverged history.
- Провести независимую проверку сайта и научную/релизную рецензию. Только потом принять решение о публикации исследовательского RC.

**Никаких решений по лечению пациентов не автоматизировать и не предлагать по одному результату HFC.**
