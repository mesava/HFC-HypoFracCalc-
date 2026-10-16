import {expect, test} from "@playwright/test";
import {openMethodologyTool} from "./navigation.js";

test.describe("P5 Redmond/Milano uncertainty: parameter CI are not clinical risk bands",()=>{
  test("Redmond displays all 3 EA4 model-group CI and Fisher p without altering source LC",async({page})=>{
    await page.goto("/");
    await openMethodologyTool(page,"Клинические исходы по данным HyTEC");
    await page.getByLabel("Клинический исход").selectOption("brain-metastases-local-control");
    const details=page.locator("details.hytec-published-fit-review");
    await expect(details).toHaveCount(1);
    await details.locator("summary").click();
    await expect(details.locator("tbody tr")).toHaveCount(3);
    await expect(details).toContainText("11,21");
    await expect(details).toContainText("10,43–11,9");
    await expect(details).toContainText("12,44");
    await expect(details).toContainText("5,67–14,63");
    await expect(details).toContainText("0,188");
    await expect(details).toContainText("4,69×10⁻¹⁰");
    await expect(details).toContainText("НЕ 95% интервалы вероятности");
    await expect(details).toContainText("по медиане");
    const rows=page.locator(".outcome-point-table tbody tr");
    await expect(rows).toHaveCount(4);
  });

  test("Milano only shows the fitting cohort relevant to the selected endpoint",async({page})=>{
    await page.goto("/");
    await openMethodologyTool(page,"Клинические ограничения");
    const selector=page.getByLabel("Клинический исход");
    await selector.selectOption("brain-symptomatic-radionecrosis");
    await expect(page.locator("details.hytec-published-fit-review")).toHaveCount(0);
    await expect(page.locator(".constraint-card")).toHaveCount(3);

    await selector.selectOption("brain-necrosis-edema-any");
    const detail=page.locator("details.hytec-published-fit-review");
    await expect(detail).toHaveCount(1);
    await detail.locator("summary").click();
    await expect(detail.locator("tbody tr")).toHaveCount(2);
    await expect(detail).toContainText("Рис. 5, V12");
    await expect(detail).toContainText("Рис. 6A, V14");
    await expect(detail).toContainText("68% биномиальные интервалы");
    await expect(detail).toContainText("95% ДИ параметров");

    await selector.selectOption("brain-radionecrosis-resection");
    await expect(detail.locator("tbody tr")).toHaveCount(1);
    await detail.locator("summary").click();
    await expect(detail).toContainText("Рис. 6B, V14");
    await expect(detail).toContainText("42,6");
    await expect(detail).toContainText("33,8–75,5");
  });
});
