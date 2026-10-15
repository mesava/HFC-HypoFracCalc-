import { expect, test } from "@playwright/test";
import { openMethodologyTool } from "./navigation.js";

test.describe("HyTEC P5 Royce/Wang source-verification gates", () => {
  test("Royce low/intermediate FFBR rows explicitly carry failed-reproduction flags", async ({ page }) => {
    await page.goto("/");
    await openMethodologyTool(page, "Клинические исходы по данным HyTEC");
    await page.getByLabel("Клинический исход")
      .selectOption("prostate-biochemical-control");

    await expect(page.getByText("Не воспроизведено из опубликованных параметров"))
      .toHaveCount(2);
    const sourceWarning = page.locator(".outcome-source-discrepancy");
    await expect(sourceWarning).toContainText("уравнения (2)");
    await expect(sourceWarning).toContainText("Table 3");
    // Only the two low/intermediate rows carry numeric verification flags.
    await expect(page.locator(".outcome-point-table tbody tr")).toHaveCount(4);
  });

  test("Wang constraints disclose 4-fraction cohort versus LQ 5-fraction source model", async ({ page }) => {
    await page.goto("/");
    await openMethodologyTool(page, "Клинические ограничения");
    await page.getByLabel("Клинический исход")
      .selectOption("urethra-prostate-sbrt-late-urinary-toxicity");
    const note = page.locator(".constraint-evidence-note").filter({
      hasText: "HyTEC Wang",
    });
    await expect(note).toBeVisible();
    await expect(note).toContainText("38 Гр/4 фракции");
    await expect(note).toContainText("α/β=3 Гр");
    await expect(note).toContainText("Figure 1B");
    await expect(note).toContainText("NTCP");
  });
});
