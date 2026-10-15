import { expect, test } from "@playwright/test";
import { openMethodologyTool } from "./navigation.js";

test.describe("HyTEC batch 05 source OAR contour provenance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openMethodologyTool(page, "Клинические ограничения");
  });

  test("explicitly shows reverse 700cc liver V≤15/V≤17 with liver-minus-GTV", async ({page}) => {
    await page.getByLabel("Клинический исход")
      .selectOption("liver-grade3plus-enzyme-toxicity");
    const spared=page.locator(".constraint-card").filter({
      has:page.locator("strong").filter({hasText:"700 см³"})
    });
    await expect(spared).toHaveCount(2);
    for(const card of await spared.all()){
      await expect(card).toContainText("Структура для Vx");
      await expect(card).toContainText("Нормальная печень за вычетом GTV");
      await expect(card).toContainText("≥ 700 см³");
    }
  });

  test("warns bilateral GTV/IGTV-subtracted V20 is not Lung-minus-PTV", async ({page}) => {
    await page.getByLabel("Клинический исход").selectOption("lung-symptomatic-rilt");
    const v20=page.locator(".constraint-card").filter({
      has:page.locator("strong").filter({hasText:"V20"})
    });
    await expect(v20).toHaveCount(1);
    await expect(v20).toContainText("Структура для Vx");
    await expect(v20).toContainText("Оба лёгких суммарно");
    await expect(v20).toContainText("IGTV");
    await expect(v20).toContainText("не Lung−PTV");
  });
});
