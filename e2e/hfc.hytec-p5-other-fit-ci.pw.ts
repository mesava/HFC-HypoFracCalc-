import { expect, test } from "@playwright/test";
import { openMethodologyTool } from "./navigation.js";

test.describe("HyTEC P5 remaining source fits — uncertainty context",()=>{
  test("Soltys VS distinguishes LQ from LQ-L alpha/beta without changing selector",async({page})=>{
    await page.goto("/");
    await openMethodologyTool(page,"Клинические исходы по данным HyTEC");
    await page.getByLabel("Клинический исход")
      .selectOption("vestibular-schwannoma-tumour-control");
    const details=page.locator("details.hytec-other-fit-review");
    await expect(details).toHaveCount(1);
    await details.locator("summary").click();
    await expect(details).toContainText("LQ-L; альтернативная клеточная модель");
    await expect(details).toContainText("12,4");
    await expect(details).toContainText("2,97");
    await expect(details).toContainText("9 – 19,3");
    await expect(details).toContainText("1,72 – 4,27");
    await expect(details).toContainText("не образуют валидированный прогноз");
  });

  test("spinal metastasis E1 and Vargo genuinely unbounded upper CI stay distinct",async({page})=>{
    await page.goto("/");
    await openMethodologyTool(page,"Клинические исходы по данным HyTEC");
    const sel=page.getByLabel("Клинический исход");
    await sel.selectOption("spinal-metastases-local-control");
    const details=page.locator("details.hytec-other-fit-review");
    await details.locator("summary").click();
    await expect(details.locator(".hytec-fit-variant")).toHaveCount(4);
    await expect(details).toContainText("19,44");
    await expect(details).toContainText("18,07 – 20,53");
    await expect(details).toContainText("2 606");

    await sel.selectOption("head-neck-recurrent-reirradiation-local-control");
    await details.locator("summary").click();
    await expect(details.locator(".hytec-fit-variant")).toHaveCount(3);
    await expect(details).toContainText("верхняя граница не ограничена");
    await expect(details).toContainText(/[-−]0,09/);
  });

  test("Ohri original bootstrap 2yr intervals never replace 3yr LC strata",async({page})=>{
    await page.goto("/");
    await openMethodologyTool(page,"Клинические исходы по данным HyTEC");
    await page.getByLabel("Клинический исход")
      .selectOption("liver-metastases-local-control");
    const details=page.locator("details.hytec-other-fit-review");
    await details.locator("summary").click();
    await expect(details).toContainText("Только опубликованные бутстрэп-оценки двухлетнего контроля");
    await expect(details).toContainText("64–77%");
    await expect(details).toContainText("70–82%");
    await expect(details).toContainText("85–95%");
    await expect(page.locator(".outcome-point-table tbody tr")).toHaveCount(2);
  });

  test("Grimm fit is labelled as current Dmax and not cumulative or D0.5cc",async({page})=>{
    await page.goto("/");
    await openMethodologyTool(page,"Клинические ограничения");
    await page.getByLabel("Клинический исход").selectOption("major-vessel-grade3plus-bleeding");
    const details=page.locator("details.hytec-other-fit-review");
    await details.locator("summary").click();
    await expect(details).toContainText("Объединённая модель кровотечения G3–5, Dmax");
    await expect(details).toContainText("45,7");
    await expect(details).toContainText("39,6 – 64,9");
    await expect(details).toContainText("не накопленная доза");
  });
});
