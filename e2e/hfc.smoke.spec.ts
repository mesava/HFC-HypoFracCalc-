import { expect, test } from "@playwright/test";

test.describe("HFC browser acceptance smoke tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("HFC — HypoFracCalc");
  });

  test("starts in Russian and switches the interface to English", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(
      page.getByRole("button", { name: "Главная", exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { name: "EN", exact: true }).click();

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("button", { name: "Home", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Quick EQD", exact: true }),
    ).toBeVisible();
  });

  test("Quick EQD calculates, validates bad input, and exports JSON audit", async ({ page }) => {
    await page
      .getByRole("button", { name: "Быстрый EQD", exact: true })
      .click();

    await expect(
      page.getByRole("heading", { name: "Что именно мы моделируем?" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "BED / EQD₂" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Скачать аудит JSON" }),
    ).toBeVisible();

    const fractions = page.getByLabel("Число фракций, n");
    await fractions.fill("0");
    await expect(
      page.getByText("Число фракций должно быть положительным целым числом."),
    ).toBeVisible();

    await fractions.fill("5");
    await expect(
      page.getByText("Число фракций должно быть положительным целым числом."),
    ).not.toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Скачать аудит JSON" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^HFC_quick_eqd_audit_.*\.json$/,
    );
  });

  test("Treatment Gap requires an explicit time model after evidence v0.10", async ({ page }) => {
    await page
      .getByRole("button", { name: "Перерывы в лечении", exact: true })
      .click();

    await expect(
      page.getByRole("heading", { name: "α/β + time-loss model" }),
    ).toBeVisible();
    await expect(
      page.getByText("Выберите опубликованную модель Dprolif/Tk."),
    ).toBeVisible();

    const timeModel = page.getByLabel("Оценка временной поправки");
    await expect(timeModel.locator("option")).toHaveCount(2);
    await timeModel.selectOption({ index: 1 });
    await page.getByLabel("Tk для этого расчёта, дни").fill("21");

    await expect(
      page.getByText("Выберите опубликованную модель Dprolif/Tk."),
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Скачать аудит JSON" }),
    ).toBeVisible();
  });

  test("core modules render from the top navigation", async ({ page }) => {
    await page
      .getByRole("button", { name: "Сравнение режимов", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Режимы фракционирования" }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Клинические ограничения", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Доза, объём и риск — вместе с контекстом",
      }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Повторное облучение", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Кумулятивный EQD₂/BED без скрытых допущений о восстановлении",
      }),
    ).toBeVisible();
  });

  test("mobile navigation opens and changes module", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const trigger = page.locator(".mobile-nav-trigger");
    await expect(trigger).toBeVisible();
    await trigger.click();

    const menu = page.locator("#mobile-site-menu");
    await expect(menu).toBeVisible();
    await menu
      .getByRole("button", { name: "Повторное облучение", exact: true })
      .click();

    await expect(menu).not.toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Кумулятивный EQD₂/BED без скрытых допущений о восстановлении",
      }),
    ).toBeVisible();
  });
});
