import { expect, test } from "@playwright/test";
import { openMethodologyTool } from "./navigation.js";

test("Sahgal de novo spine model pairs never appear as interchangeable cord dose ranges", async ({page}) => {
  await page.goto("/");
  await openMethodologyTool(page, "Клинические ограничения");
  await page.getByLabel("Клинический исход")
    .selectOption("spinal-cord-radiation-myelopathy");

  const cards = page.locator(".constraint-card");
  await expect(cards).toHaveCount(5);

  const single = cards.first();
  await expect(single).toContainText("Sahgal (дуральный мешок)");
  await expect(single).toContainText("Katsoulakis–Gibbs (собственно спинной мозг)");
  await expect(single).toContainText("12,4 Гр");
  await expect(single).toContainText("14 Гр");
  await expect(single).toContainText("не доверительный интервал");
  await expect(single).toContainText("однофракционная клиническая модель");

  await page.getByLabel("Число фракций").selectOption("3");
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("20,3 Гр");
  await expect(cards.first()).toContainText("23,1 Гр");
  await expect(cards.first()).toContainText("LQ-экстраполяция из однофракционной модели");
  await expect(cards.first()).toContainText("не самостоятельный клинический предел");
});
