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

  test("highlights treatment days in soft green while empty days stay neutral", async ({ page }) => {
    const treated = page.locator(".editable-day.on").first();
    const empty = page.locator(".editable-day.off").first();
    await expect(treated).toBeVisible();
    await expect(empty).toBeVisible();
    const backgrounds = await page.evaluate(() => {
      const treatedNode = document.querySelector(".editable-day.on")!;
      const emptyNode = document.querySelector(".editable-day.off")!;
      return [
        getComputedStyle(treatedNode).backgroundColor,
        getComputedStyle(emptyNode).backgroundColor,
      ];
    });
    expect(backgrounds[0]).toBe("rgb(232, 244, 233)");
    expect(backgrounds[1]).not.toBe(backgrounds[0]);
  });

  test("PDF printing uses actual edited course with parameters and summary", async ({ page }) => {
    await page.getByRole("button", { name: "Построить стандартный курс" }).click();
    await page.getByRole("button", { name: "Увеличить число фракций" }).first().click();
    await expect(page.getByText("36", { exact: true }).first()).toBeVisible();

    await page.evaluate(() => {
      (window as typeof window & { __hfcPrintCalled?: boolean }).__hfcPrintCalled = false;
      window.print = () => {
        (window as typeof window & { __hfcPrintCalled?: boolean }).__hfcPrintCalled = true;
      };
    });
    const action = page.getByRole("button", { name: "Распечатать / сохранить PDF" });
    await expect(action).toBeEnabled();
    await action.click();
    expect(await page.evaluate(() => (window as typeof window & { __hfcPrintCalled?: boolean }).__hfcPrintCalled)).toBe(true);

    await page.emulateMedia({ media: "print" });
    await expect(page.getByRole("heading", { name: "Построенный календарь лучевой терапии" })).toBeVisible();
    await expect(page.locator(".calendar-print-header")).toContainText("Доза за фракцию");
    await expect(page.locator(".calendar-print-header")).toContainText("T½");
    await expect(page.locator(".editable-calendar-grid .editable-day.multi")).toHaveCount(1);
    await expect(page.locator(".calendar-metrics")).toContainText("36");
    const printBackground = await page.locator(".editable-day.on").first().evaluate(el=>getComputedStyle(el).backgroundColor);
    expect(printBackground).toBe("rgb(217, 240, 222)");
    const printControls = await page.locator(".editable-day-controls").first().evaluate(el=>getComputedStyle(el).display);
    expect(printControls).toBe("none");
  });

  test("calendar BID warnings use Russian explanations without English leakage", async ({ page }) => {
    await page.getByRole("button", { name: "Увеличить число фракций" }).first().click();
    const warning = page.locator(".calendar-summary .warning-card");
    await expect(warning).toContainText("Поправка на неполное восстановление");
    await expect(warning).not.toContainText("Incomplete-repair correction");
  });

  test("usage page keeps examples without mentioning the predecessor product", async ({ page }) => {
    await page.getByRole("button", { name: "Как пользоваться?", exact: true }).first().click();
    await expect(page.getByRole("heading", { name: "Опубликованные примеры расчётов по LQ-модели" })).toBeVisible();
    await expect(page.getByText(/hypo-calc/i)).toHaveCount(0);
  });
});
