import { expect, test } from "@playwright/test";
import {
  openCalculator,
  openMethodologyTool,
} from "./navigation.js";

test.describe("Batch 03 ReCOG / HyTEC source presentation", () => {
  test("ReCOG worked example clearly separates OAR arithmetic and 3D", async ({ page }) => {
    await page.goto("/");
    await openCalculator(page, "Повторное облучение");

    const summary = page.getByText(
      "Разобранный пример ReCOG 2026",
      { exact: false },
    );
    await expect(summary).toBeVisible();
    await summary.click();

    const example = page.locator("details").filter({
      hasText: "Zhang et al., 2026",
    });
    await expect(example).toContainText("26,4");
    await expect(example).toContainText("27,9");
    await expect(example).toContainText("29,7");
    await expect(example).toContainText("Dmax");
    await expect(example).toContainText("не воспроизводит");
    await expect(example).toContainText("не являются универсальными");
  });

  test("Redmond warnings are visible in Russian for 1-year local-control model", async ({ page }) => {
    await page.goto("/");
    await openMethodologyTool(page, "Клинические исходы по данным HyTEC");

    await page.getByLabel("Клинический исход")
      .selectOption("brain-metastases-local-control");
    const warning = page.locator(".outcome-source-discrepancy");
    await expect(warning).toHaveCount(1);
    await expect(warning).toContainText("12,44");
    await expect(warning).toContainText("0,188");
    await expect(warning).toContainText("SFED₂₀");
    await expect(warning).toContainText("не подтверждённая индивидуальная");
  });
});
