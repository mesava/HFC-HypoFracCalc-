import { expect, test } from "@playwright/test";
import { openMethodologyTool } from "./navigation.js";

test.describe("HyTEC P5 Redmond/Milano original dose and contour source scope",()=>{
  test("Redmond brain LC shows PTV-margin prescription and source-specific SFED20",async({page})=>{
    await page.goto("/");
    await openMethodologyTool(page,"Клинические исходы по данным HyTEC");
    await page.getByLabel("Клинический исход").selectOption("brain-metastases-local-control");
    const warning=page.locator(".outcome-source-discrepancy").filter({hasText:"HyTEC Redmond"});
    await expect(warning).toHaveCount(1);
    await expect(warning).toContainText("границе PTV");
    await expect(warning).toContainText("SFED₂₀");
    await expect(warning).toContainText("α/β = 20 Гр");
    await expect(warning).toContainText("через 1 год");
    await expect(warning).toContainText("WBRT");
  });

  test("Milano symptomatic V12 discloses original reconstructed, not direct brain volume",async({page})=>{
    await page.goto("/");
    await openMethodologyTool(page,"Клинические ограничения");
    await page.getByLabel("Клинический исход").selectOption("brain-symptomatic-radionecrosis");
    const cards=page.locator(".constraint-card");
    await expect(cards).toHaveCount(3);
    for(const card of await cards.all()){
      await expect(card).toContainText("Структура для Vx");
      await expect(card).toContainText("Весь объём ткани в изодозе, включая мишень");
      await expect(card).toContainText("Происхождение объёма V12");
      await expect(card).toContainText("оценённого медианного GTV");
      await expect(card).toContainText("не прямое измерение");
    }
    await page.getByLabel("Клинический исход").selectOption("brain-necrosis-edema-any");
    await expect(cards).toHaveCount(2);
    await expect(cards.first()).not.toContainText("Происхождение объёма V12");
    await expect(cards.first()).toContainText("не являются индивидуальным NTCP");
  });
});
