import { useState } from "react";
import {
  inspectAuditDocument,
  type AuditImportInspection,
} from "../audit/replay.js";
import { tx } from "./i18n.js";
import type { Language } from "./labels.js";

type ImportState =
  | { kind: "idle" }
  | { kind: "loading"; fileName: string }
  | {
      kind: "ready";
      fileName: string;
      inspection: AuditImportInspection;
    }
  | {
      kind: "error";
      fileName?: string;
      message: string;
    };

function moduleLabel(
  language: Language,
  module: string,
): string {
  switch (module) {
    case "quick-eqd":
      return tx(language, "Быстрый EQD", "Quick EQD");
    case "compare-regimens":
      return tx(
        language,
        "Сравнение режимов",
        "Compare Regimens",
      );
    case "treatment-gap":
      return tx(
        language,
        "Перерывы в лечении",
        "Treatment Gap",
      );
    case "reirradiation":
      return tx(
        language,
        "Повторное облучение",
        "Reirradiation",
      );
    default:
      return module;
  }
}

function renderDifferenceValue(value: unknown): string {
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  try {
    const serialized = JSON.stringify(value);
    return serialized.length > 160
      ? serialized.slice(0, 157) + "…"
      : serialized;
  } catch {
    return String(value);
  }
}

export function AuditReplayView({
  language,
}: {
  language: Language;
}) {
  const [state, setState] =
    useState<ImportState>({ kind: "idle" });

  async function handleFile(
    file: File | undefined,
  ) {
    if (!file) {
      setState({ kind: "idle" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setState({
        kind: "error",
        fileName: file.name,
        message: tx(
          language,
          "Файл аудита больше 5 МБ. Такой размер не ожидается для audit JSON HFC.",
          "The audit file is larger than 5 MB. HFC audit JSON is not expected to be this large.",
        ),
      });
      return;
    }

    setState({
      kind: "loading",
      fileName: file.name,
    });

    try {
      const text = await file.text();
      const inspection =
        await inspectAuditDocument(text);

      setState({
        kind: "ready",
        fileName: file.name,
        inspection,
      });
    } catch (error) {
      setState({
        kind: "error",
        fileName: file.name,
        message:
          error instanceof Error
            ? error.message
            : tx(
                language,
                "Не удалось проверить audit JSON.",
                "The audit JSON could not be inspected.",
              ),
      });
    }
  }

  const inspection =
    state.kind === "ready"
      ? state.inspection
      : undefined;
  const replay = inspection?.replay;

  return (
    <main className="methodology-page">
      <section className="panel methodology-hero">
        <span className="eyebrow">
          {tx(
            language,
            "audit import / replay",
            "audit import / replay",
          )}
        </span>
        <h2>
          {tx(
            language,
            "Проверка и воспроизведение audit JSON",
            "Verify and replay an audit JSON",
          )}
        </h2>
        <p>
          {tx(
            language,
            "HFC читает файл локально в браузере: данные не отправляются на внешний сервер. Для новых audit envelope сначала проверяется SHA-256, и только затем выполняется повторный расчёт.",
            "HFC reads the file locally in the browser: no data is sent to an external server. New audit envelopes are SHA-256 verified before replay.",
          )}
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {tx(language, "импорт", "import")}
            </span>
            <h2>
              {tx(
                language,
                "Выберите JSON-аудит HFC",
                "Choose an HFC audit JSON",
              )}
            </h2>
          </div>
        </div>

        <label className="field">
          <span>
            {tx(
              language,
              "Audit JSON",
              "Audit JSON",
            )}
          </span>
          <input
            type="file"
            accept=".json,application/json"
            onChange={(event) =>
              void handleFile(
                event.target.files?.[0],
              )
            }
          />
          <small>
            {tx(
              language,
              "Поддерживаются новый HFC audit envelope и старые raw audit records schema 1.0.",
              "Both the new HFC audit envelope and legacy raw schema 1.0 records are supported.",
            )}
          </small>
        </label>

        {state.kind === "loading" ? (
          <div className="audit-preview" role="status">
            {tx(
              language,
              "Проверка файла…",
              "Inspecting file…",
            )}{" "}
            {state.fileName}
          </div>
        ) : null}

        {state.kind === "error" ? (
          <div className="inline-alert" role="alert">
            <strong>
              {tx(
                language,
                "Файл не принят",
                "File rejected",
              )}
            </strong>
            <p>{state.message}</p>
          </div>
        ) : null}

        {inspection ? (
          <>
            <div
              className={
                inspection.integrityStatus === "verified"
                  ? "ok-card"
                  : "warning-card"
              }
              role="status"
            >
              <strong>
                {inspection.integrityStatus === "verified"
                  ? tx(
                      language,
                      "SHA-256: целостность подтверждена",
                      "SHA-256: integrity verified",
                    )
                  : tx(
                      language,
                      "Legacy audit: целостность не подтверждена",
                      "Legacy audit: integrity is unverified",
                    )}
              </strong>
              <p>
                {inspection.integrityStatus === "verified"
                  ? tx(
                      language,
                      "Содержимое record соответствует digest в audit envelope.",
                      "The record matches the digest stored in the audit envelope.",
                    )
                  : tx(
                      language,
                      "Файл schema 1.0 можно воспроизводить, но он был создан без криптографического контроля целостности.",
                      "The schema 1.0 record can be replayed, but it was created without cryptographic integrity protection.",
                    )}
              </p>
            </div>

            <div className="audit-preview">
              <span className="eyebrow">
                {tx(
                  language,
                  "метаданные",
                  "metadata",
                )}
              </span>
              <dl>
                <div>
                  <dt>
                    {tx(language, "Модуль", "Module")}
                  </dt>
                  <dd>
                    {moduleLabel(
                      language,
                      inspection.header.module,
                    )}
                  </dd>
                </div>
                <div>
                  <dt>schemaVersion</dt>
                  <dd>
                    {inspection.header.schemaVersion}
                  </dd>
                </div>
                <div>
                  <dt>engineVersion</dt>
                  <dd>
                    {inspection.header.engineVersion}
                  </dd>
                </div>
                <div>
                  <dt>
                    {tx(
                      language,
                      "Evidence dataset",
                      "Evidence dataset",
                    )}
                  </dt>
                  <dd>
                    {
                      inspection.header.evidence
                        .datasetVersion
                    }
                  </dd>
                </div>
                <div>
                  <dt>generatedAtIso</dt>
                  <dd>
                    {inspection.header.generatedAtIso}
                  </dd>
                </div>
              </dl>
            </div>
          </>
        ) : null}
      </section>

      {inspection && !inspection.replaySupported ? (
        <section className="panel">
          <div className="warning-card">
            <strong>
              {tx(
                language,
                "Целостность проверена, replay пока не включён",
                "Integrity checked; replay is not enabled yet",
              )}
            </strong>
            <p>
              {tx(
                language,
                "В audit replay v0.1 повторный расчёт реализован для Quick EQD и Compare Regimens. Treatment Gap и Reirradiation уже можно проверить по envelope/hash, но их replay будет добавлен следующим пакетом.",
                "Audit replay v0.1 recalculates Quick EQD and Compare Regimens. Treatment Gap and Reirradiation can already be integrity-checked, but their replay will be added in the next package.",
              )}
            </p>
          </div>
        </section>
      ) : null}

      {replay ? (
        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {tx(
                  language,
                  "повторный расчёт",
                  "replay",
                )}
              </span>
              <h2>
                {replay.matches
                  ? tx(
                      language,
                      "Сохранённый расчёт воспроизведён",
                      "Saved calculation reproduced",
                    )
                  : tx(
                      language,
                      "Обнаружены расхождения",
                      "Replay differences detected",
                    )}
              </h2>
            </div>
          </div>

          <div
            className={
              replay.matches
                ? "ok-card"
                : "warning-card"
            }
            role="status"
          >
            <strong>
              {replay.matches
                ? tx(
                    language,
                    "Клинически значимые поля совпадают",
                    "Clinically relevant fields match",
                  )
                : tx(
                    language,
                    "Сохранённые и пересчитанные данные отличаются",
                    "Saved and replayed data differ",
                  )}
            </strong>
            <p>
              {tx(
                language,
                "Replay использует текущий расчётный движок и текущую evidence-базу, но исходные параметры берёт из импортированного аудита.",
                "Replay uses the current engine and evidence dataset while restoring inputs from the imported audit.",
              )}
            </p>
          </div>

          <div className="audit-preview">
            <span className="eyebrow">
              {tx(
                language,
                "контекст версий",
                "version context",
              )}
            </span>
            <dl>
              <div>
                <dt>
                  {tx(
                    language,
                    "Движок: сохранён",
                    "Engine: saved",
                  )}
                </dt>
                <dd>{replay.savedEngineVersion}</dd>
              </div>
              <div>
                <dt>
                  {tx(
                    language,
                    "Движок: сейчас",
                    "Engine: current",
                  )}
                </dt>
                <dd>{replay.currentEngineVersion}</dd>
              </div>
              <div>
                <dt>
                  {tx(
                    language,
                    "Evidence: сохранено",
                    "Evidence: saved",
                  )}
                </dt>
                <dd>
                  {replay.savedEvidenceDatasetVersion}
                </dd>
              </div>
              <div>
                <dt>
                  {tx(
                    language,
                    "Evidence: сейчас",
                    "Evidence: current",
                  )}
                </dt>
                <dd>
                  {replay.currentEvidenceDatasetVersion}
                </dd>
              </div>
            </dl>
          </div>

          {replay.engineVersionChanged ||
          replay.evidenceDatasetChanged ? (
            <div className="inline-alert">
              {tx(
                language,
                "Версия движка или evidence dataset отличается от версии при первоначальном экспорте. Совпадение результата в этом случае является фактическим результатом replay, а не предположением о совместимости.",
                "The engine or evidence dataset version differs from the original export. Any matching result is therefore an observed replay result, not an assumption of compatibility.",
              )}
            </div>
          ) : null}

          {!replay.matches ? (
            <div className="constraint-card-list">
              {replay.differences
                .slice(0, 20)
                .map((difference) => (
                  <article
                    className="constraint-card"
                    key={difference.path}
                  >
                    <strong>{difference.path}</strong>
                    <p>
                      {tx(
                        language,
                        "Сохранено",
                        "Saved",
                      )}
                      :{" "}
                      {renderDifferenceValue(
                        difference.saved,
                      )}
                    </p>
                    <p>
                      {tx(
                        language,
                        "Пересчитано",
                        "Replayed",
                      )}
                      :{" "}
                      {renderDifferenceValue(
                        difference.replayed,
                      )}
                    </p>
                  </article>
                ))}
              {replay.differences.length > 20 ? (
                <small>
                  {tx(
                    language,
                    "Показаны первые 20 расхождений.",
                    "Only the first 20 differences are shown.",
                  )}
                </small>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="panel safety-note">
        <strong>
          {tx(
            language,
            "Replay не является повторной клинической валидацией.",
            "Replay is not a new clinical validation.",
          )}
        </strong>
        <p>
          {tx(
            language,
            "Совпадение означает, что текущий HFC воспроизвёл сохранённый расчёт из тех же входных данных. Оно не доказывает клиническую допустимость режима.",
            "A match means the current HFC reproduced the saved calculation from the recorded inputs. It does not establish clinical acceptability.",
          )}
        </p>
      </section>
    </main>
  );
}
