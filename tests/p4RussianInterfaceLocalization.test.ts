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
  it("translates course-correction warnings and invalid numerical inputs, preserving the English version",()=>{
    const caution="This workflow restores the selected LQ EQD2 target mathematically; it does not prove clinical equivalence or OAR safety.";
    expect(localizeWarning("ru",caution)).toContain("не доказывает клиническую эквивалентность");
    expect(localizeWarning("en",caution)).toBe(caution);
    const raised="The corrected dose per fraction is higher than planned. Reassess normal-tissue dose metrics and clinical acceptability before use.";
    expect(localizeWarning("ru",raised)).toContain("выше плановой");
    expect(localizeWarning("en",raised)).toBe(raised);
    expect(localizeWarning("ru","At least one remaining fraction is required.")).toContain("хотя бы одна фракция");
    expect(localizeWarning("ru","planned fractions must be a positive integer.")).toContain("положительным целым");
    expect(localizeWarning("ru","Delivered biological dose already equals or exceeds the planned EQD2 target.")).toContain("Уже доставленная");
  });
});
