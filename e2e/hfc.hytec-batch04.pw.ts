import { expect, test } from "@playwright/test";
import { openMethodologyTool } from "./navigation.js";

test.describe("HyTEC 06–09 batch 04 source-contour and cohort warnings", () => {
  test("shows target-inclusive contour on each Milano brain Vx card", async ({page}) => {
    await page.goto("/");
    await openMethodologyTool(page,"Клинические ограничения");
    await page.getByLabel("Клинический исход").selectOption("brain-symptomatic-radionecrosis");
    const cards=page.locator(".constraint-card");
    await expect(cards).toHaveCount(3);
    for(const card of await cards.all()){
      await expect(card).toContainText("Структура для Vx");
      await expect(card).toContainText("Весь объём ткани в изодозе, включая мишень");
      await expect(card).toContainText("не Brain−GTV/PTV");
    }
    await page.getByLabel("Клинический исход").selectOption("brain-necrosis-edema-any");
    await expect(page.locator(".constraint-card")).toHaveCount(2);
    await expect(page.getByText("Структура для Vx")).toHaveCount(2);
  });

  test("shows mixed previous RT and dose-prescription bias on Soltys spinal LC model", async ({page}) => {
    await page.goto("/");
    await openMethodologyTool(page,"Клинические исходы по данным HyTEC");
    await page.getByLabel("Клинический исход")
      .selectOption("spinal-metastases-local-control");
    const note=page.locator(".outcome-source-discrepancy");
    await expect(note).toHaveCount(1);
    await expect(note).toContainText("предыдущего облучения и без него");
    await expect(note).toContainText("20 Гр");
    await expect(note).toContainText("18 Гр");
    await expect(note).toContainText("≈88,3%");
    await expect(note).toContainText("D95");
    await expect(page.getByText("смешанная выборка", {exact:true}))
      .toBeVisible();
  });
});
