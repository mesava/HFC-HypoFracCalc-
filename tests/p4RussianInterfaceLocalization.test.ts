import { describe, expect, it } from "vitest";
import { localizeWarning } from "../src/ui/i18n.js";

describe("P4 Russian interface scientific explanation safety", () => {
  it("translates actual English evidence warnings without losing human-cohort scope", () => {
    const english = "Patient-data fit from a pooled animal/human analysis; the result differs materially from other human analyses and from the approximately 2 Gy value often used clinically.";
    const russian = localizeWarning("ru", english);
    expect(russian).toContain("данных животных и пациентов");
    expect(russian).toContain("2 Гр");
    expect(russian).not.toContain("Patient-data");
    expect(localizeWarning("en", english)).toBe(english);
  });
  it("preserves native Russian clinical warnings even when they include Dprolif and Tk symbols", () => {
    const original = "Введите Dprolif и Tk явно или выберите опубликованную модель.";
    expect(localizeWarning("ru", original)).toBe(original);
    expect(localizeWarning("ru", "Выберите опубликованную модель Dprolif/Tk.")).toBe("Выберите опубликованную модель Dprolif/Tk.");
  });
  it("fully localizes Thames BID/TID calendar warning text", () => {
    const warning = "Incomplete-repair correction assumes equally spaced fractions within each treatment day and complete repair before the next daily group.";
    const translated=localizeWarning("ru",warning);
    expect(translated).toContain("неполное восстановление");
    expect(translated).not.toContain("Incomplete-repair");
  });
  it("does not reveal arbitrary English-only error prose in Russian",()=>{
    const unknown="Original study cohort contains unvalidated assumptions.";
    const t=localizeWarning("ru",unknown);
    expect(t).toContain("Ограничение применимости");
    expect(t).not.toContain("Original study");
  });
});
