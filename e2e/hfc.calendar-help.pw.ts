import { expect, test } from "@playwright/test";

test.describe("Calendar summary explanations and future module guard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Калькуляторы", exact: true }).click();
    await expect(page.getByText("DICOM / воксельный EQD₂", { exact: true })).toBeVisible();
    await expect(page.getByText("Недоступно", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "DICOM / воксельный EQD₂" }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Интерактивный календарь", exact: true }).click();
  });

  test("offers all six descriptions on hover", async ({ page }) => {
    const cases = [
      ["Фракций", "Суммарное число фракций"],
      ["Физическая доза", "Сумма физической дозы"],
      ["EQD₂", "не учитывает репопуляцию"],
      ["BED", "Биологически эффективная доза"],
      ["OTT", "Общая продолжительность лечения"],
      ["BID / TID", "Количество дней с двумя"],
    ] as const;

    for (const [name, detail] of cases) {
      await page.getByRole("button", { name: `Что означает «${name}»?` }).hover();
      await expect(page.getByRole("tooltip").filter({ hasText: detail })).toBeVisible();
    }
  });

  test("tap opens and closes the explanation on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const trigger = page.getByRole("button", { name: "Что означает «BED»?" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("tooltip").filter({ hasText: "Биологически эффективная доза" })).toBeVisible();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("usage page keeps examples without mentioning the predecessor product", async ({ page }) => {
    await page.getByRole("button", { name: "Как пользоваться?", exact: true }).first().click();
    await expect(page.getByRole("heading", { name: "Опубликованные примеры расчётов по LQ-модели" })).toBeVisible();
    await expect(page.getByText(/hypo-calc/i)).toHaveCount(0);
  });
});
