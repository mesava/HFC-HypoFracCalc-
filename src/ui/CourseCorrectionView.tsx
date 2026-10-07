import { useMemo, useState } from "react";
import { solveCourseCorrection } from "../workflows/courseCorrection.js";
import { tx } from "./i18n.js";
import { formatUiNumber, type Language } from "./labels.js";

type ExampleKey = "dose-error" | "missed-fraction";

export function CourseCorrectionView({ language }: { language: Language }) {
  const [plannedFractions, setPlannedFractions] = useState("33");
  const [plannedDose, setPlannedDose] = useState("2");
  const [deliveredFractions, setDeliveredFractions] = useState("20");
  const [deliveredDose, setDeliveredDose] = useState("1.8");
  const [remainingFractions, setRemainingFractions] = useState("13");
  const [alphaBeta, setAlphaBeta] = useState("10");

  function loadExample(key: ExampleKey) {
    if (key === "dose-error") {
      setPlannedFractions("33");
      setPlannedDose("2");
      setDeliveredFractions("20");
      setDeliveredDose("1.8");
      setRemainingFractions("13");
      setAlphaBeta("10");
    } else {
      setPlannedFractions("5");
      setPlannedDose("5");
      setDeliveredFractions("2");
      setDeliveredDose("5");
      setRemainingFractions("2");
      setAlphaBeta("10");
    }
  }

  const calculation = useMemo(() => {
    try {
      return {
        result: solveCourseCorrection({
          plannedSchedule: {
            fractions: Number(plannedFractions),
            dosePerFractionGy: Number(plannedDose),
          },
          deliveredFractions: Number(deliveredFractions),
          deliveredDosePerFractionGy: Number(deliveredDose),
          remainingFractions: Number(remainingFractions),
          alphaBetaGy: Number(alphaBeta),
        }),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Calculation failed.",
      };
    }
  }, [
    plannedFractions,
    plannedDose,
    deliveredFractions,
    deliveredDose,
    remainingFractions,
    alphaBeta,
  ]);

  const result = "result" in calculation ? calculation.result : undefined;
  const gy = language === "ru" ? "Гр" : "Gy";

  return (
    <main className="workspace correction-workspace">
      <section className="panel input-panel">
        <span className="eyebrow">{tx(language, "коррекция курса", "course correction")}</span>
        <h2>
          {tx(
            language,
            "Если часть курса уже доставлена иначе, чем планировалось",
            "When part of the course was delivered differently from plan",
          )}
        </h2>
        <p className="module-lead">
          {tx(
            language,
            "HFC рассчитывает, какой должна быть доза оставшихся фракций, чтобы математически восстановить исходный EQD₂. Это не автоматическое разрешение на изменение назначения.",
            "HFC solves the remaining fraction dose required to restore the planned EQD₂ mathematically. It is not automatic authorization to alter a prescription.",
          )}
        </p>

        <div className="example-pills">
          <button type="button" onClick={() => loadExample("dose-error")}>
            {tx(language, "Пример: 20×1,8 вместо 20×2", "Example: 20×1.8 instead of 20×2")}
          </button>
          <button type="button" onClick={() => loadExample("missed-fraction")}>
            {tx(language, "Пример: пропущена 1 из 5 фракций", "Example: 1 of 5 fractions missed")}
          </button>
        </div>

        <div className="two-columns">
          <label className="field">
            <span>{tx(language, "План: число фракций", "Plan: fractions")}</span>
            <input type="number" min="1" value={plannedFractions} onChange={(e) => setPlannedFractions(e.target.value)} />
          </label>
          <label className="field">
            <span>{tx(language, "План: доза / фракцию, Гр", "Plan: dose / fraction, Gy")}</span>
            <input type="number" min="0.01" step="0.01" value={plannedDose} onChange={(e) => setPlannedDose(e.target.value)} />
          </label>
          <label className="field">
            <span>{tx(language, "Уже доставлено фракций", "Fractions already delivered")}</span>
            <input type="number" min="0" value={deliveredFractions} onChange={(e) => setDeliveredFractions(e.target.value)} />
          </label>
          <label className="field">
            <span>{tx(language, "Фактическая доза / фракцию, Гр", "Actual delivered dose / fraction, Gy")}</span>
            <input type="number" min="0.01" step="0.01" value={deliveredDose} onChange={(e) => setDeliveredDose(e.target.value)} />
          </label>
          <label className="field">
            <span>{tx(language, "Оставшихся фракций", "Remaining fractions")}</span>
            <input type="number" min="1" value={remainingFractions} onChange={(e) => setRemainingFractions(e.target.value)} />
          </label>
          <label className="field">
            <span>α/β, {gy}</span>
            <input type="number" min="0.01" step="0.1" value={alphaBeta} onChange={(e) => setAlphaBeta(e.target.value)} />
          </label>
        </div>

        <div className="safety-note">
          <strong>{tx(language, "α/β здесь задаётся вручную", "Alpha/beta is manual here")}</strong>
          <p>
            {tx(
              language,
              "Выбирайте значение для нужного клинического исхода по доказательной базе HFC; этот инструмент предназначен для прозрачного воспроизведения сценариев коррекции.",
              "Use an endpoint-appropriate value from the HFC evidence database; this tool is intended for transparent course-correction scenarios.",
            )}
          </p>
        </div>
      </section>

      <section className="panel results-panel">
        <span className="eyebrow">{tx(language, "результат", "result")}</span>
        <h2>{tx(language, "Оставшаяся часть курса", "Remaining course")}</h2>
        {"error" in calculation ? (
          <div className="inline-alert">{calculation.error}</div>
        ) : result ? (
          <>
            <div className="metric-grid">
              <div className="metric">
                <span>{tx(language, "Плановый EQD₂", "Planned EQD₂")}</span>
                <strong>{formatUiNumber(language, result.plannedEqd2Gy, 2)} {gy}</strong>
              </div>
              <div className="metric">
                <span>{tx(language, "Уже доставленный EQD₂", "Delivered EQD₂")}</span>
                <strong>{formatUiNumber(language, result.deliveredEqd2Gy, 2)} {gy}</strong>
              </div>
              <div className="metric primary">
                <span>{tx(language, "Новая доза / фракцию", "New dose / fraction")}</span>
                <strong>{formatUiNumber(language, result.requiredDosePerFractionGy, 3)} {gy}</strong>
              </div>
            </div>
            <div className="audit-preview">
              <dl>
                <div><dt>{tx(language, "Нужно добрать EQD₂", "Remaining EQD₂")}</dt><dd>{formatUiNumber(language, result.requiredRemainingEqd2Gy, 2)} {gy}</dd></div>
                <div><dt>{tx(language, "Финальный EQD₂", "Final EQD₂")}</dt><dd>{formatUiNumber(language, result.correctedFinalEqd2Gy, 2)} {gy}</dd></div>
                <div><dt>{tx(language, "Физическая доза", "Physical dose")}</dt><dd>{formatUiNumber(language, result.correctedFinalPhysicalDoseGy, 2)} {gy}</dd></div>
              </dl>
            </div>
            <div className="warning-card">
              <strong>{tx(language, "Проверить перед применением", "Check before use")}</strong>
              <ul>{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
