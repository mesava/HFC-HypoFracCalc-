import { useMemo, useState } from "react";
import {
  solveDosePerFractionForTargetEqd2,
  solveFractionCountForTargetEqd2,
} from "../workflows/targetEqdSolver.js";
import { tx } from "./i18n.js";
import { formatUiNumber, type Language } from "./labels.js";

export function TargetEqdSolverView({ language }: { language: Language }) {
  const [targetEqd, setTargetEqd] = useState("50");
  const [dosePerFraction, setDosePerFraction] = useState("2.67");
  const [alphaBeta, setAlphaBeta] = useState("4.6");
  const [fixedFractions, setFixedFractions] = useState("18");

  const fractionSolution = useMemo(() => {
    try {
      return {
        result: solveFractionCountForTargetEqd2(
          Number(targetEqd),
          Number(dosePerFraction),
          Number(alphaBeta),
        ),
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Calculation failed." };
    }
  }, [targetEqd, dosePerFraction, alphaBeta]);

  const fixedDose = useMemo(() => {
    try {
      return {
        result: solveDosePerFractionForTargetEqd2(
          Number(targetEqd),
          Number(fixedFractions),
          Number(alphaBeta),
        ),
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Calculation failed." };
    }
  }, [targetEqd, fixedFractions, alphaBeta]);

  const gy = language === "ru" ? "Гр" : "Gy";

  return (
    <main className="solver-page">
      <section className="panel solver-hero">
        <span className="eyebrow">{tx(language, "обратный расчёт", "inverse solve")}</span>
        <h2>{tx(language, "Подбор режима по целевому EQD₂", "Target EQD₂ regimen solver")}</h2>
        <p>
          {tx(
            language,
            "Вместо ручного перебора HFC аналитически находит число фракций или дозу за фракцию, а для целого n показывает ближайшие варианты снизу и сверху.",
            "Instead of manual trial-and-error, HFC analytically solves fraction count or dose per fraction and shows the nearest integer schedules.",
          )}
        </p>
      </section>

      <section className="solver-grid">
        <article className="panel solver-card">
          <h3>{tx(language, "1. Сколько фракций?", "1. How many fractions?")}</h3>
          <div className="two-columns">
            <label className="field">
              <span>{tx(language, "Целевой EQD₂, Гр", "Target EQD₂, Gy")}</span>
              <input type="number" min="0.01" step="0.1" value={targetEqd} onChange={(e) => setTargetEqd(e.target.value)} />
            </label>
            <label className="field">
              <span>{tx(language, "Доза / фракцию, Гр", "Dose / fraction, Gy")}</span>
              <input type="number" min="0.01" step="0.01" value={dosePerFraction} onChange={(e) => setDosePerFraction(e.target.value)} />
            </label>
            <label className="field">
              <span>α/β, {gy}</span>
              <input type="number" min="0.01" step="0.1" value={alphaBeta} onChange={(e) => setAlphaBeta(e.target.value)} />
            </label>
          </div>

          {"error" in fractionSolution ? (
            <div className="inline-alert">{fractionSolution.error}</div>
          ) : (
            <>
              <div className="solver-answer">
                <span>{tx(language, "Точное математическое n", "Exact mathematical n")}</span>
                <strong>{formatUiNumber(language, fractionSolution.result.exactFractions, 3)}</strong>
              </div>
              <div className="solver-options">
                {[fractionSolution.result.lower, fractionSolution.result.upper].map((candidate) => (
                  <div className={candidate.fractions === fractionSolution.result.nearest.fractions ? "recommended" : ""} key={candidate.fractions}>
                    <strong>{candidate.fractions} {tx(language, "фр.", "fx")}</strong>
                    <span>{formatUiNumber(language, candidate.totalDoseGy, 2)} {gy}</span>
                    <small>EQD₂ {formatUiNumber(language, candidate.achievedEqd2Gy, 2)} {gy}</small>
                  </div>
                ))}
              </div>
            </>
          )}
        </article>

        <article className="panel solver-card">
          <h3>{tx(language, "2. Какая доза за фракцию?", "2. What dose per fraction?")}</h3>
          <label className="field">
            <span>{tx(language, "Число фракций", "Fractions")}</span>
            <input type="number" min="1" step="1" value={fixedFractions} onChange={(e) => setFixedFractions(e.target.value)} />
          </label>
          {"error" in fixedDose ? (
            <div className="inline-alert">{fixedDose.error}</div>
          ) : (
            <div className="solver-answer primary">
              <span>{tx(language, "Требуемая доза / фракцию", "Required dose / fraction")}</span>
              <strong>{formatUiNumber(language, fixedDose.result, 3)} {gy}</strong>
            </div>
          )}

          <div className="example-pills solver-presets">
            <button type="button" onClick={() => { setTargetEqd("50"); setDosePerFraction("2.67"); setAlphaBeta("4.6"); }}>
              {tx(language, "Breast α/β 4,6", "Breast α/β 4.6")}
            </button>
            <button type="button" onClick={() => { setTargetEqd("50"); setDosePerFraction("2.67"); setAlphaBeta("8.8"); }}>
              {tx(language, "Кожа α/β 8,8", "Skin α/β 8.8")}
            </button>
            <button type="button" onClick={() => { setTargetEqd("60"); setFixedFractions("18"); setAlphaBeta("3"); }}>
              {tx(language, "30×2 → 18 фр.", "30×2 → 18 fx")}
            </button>
          </div>
        </article>
      </section>

      <section className="panel site-safety">
        <strong>{tx(language, "Математический подбор ≠ клиническая эквивалентность", "Mathematical solve ≠ clinical equivalence")}</strong>
        <p>
          {tx(
            language,
            "После подбора режима проверяйте доказательную применимость α/β, величину дозы за фракцию, органы риска и наличие клинических данных для выбранной схемы.",
            "After solving a regimen, check alpha/beta applicability, fraction size, OARs, and clinical evidence for the proposed schedule.",
          )}
        </p>
      </section>
    </main>
  );
}
