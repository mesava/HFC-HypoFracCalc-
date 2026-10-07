import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

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
      page.getByRole("button", { name: "Calculators", exact: true }),
    ).toBeVisible();
  });

  test("How to use guide opens and exposes worked examples", async ({ page }) => {
    await page
      .getByRole("button", { name: "Как пользоваться?", exact: true })
      .first()
      .click();

    await expect(
      page.getByRole("heading", {
        name: "От клинического вопроса к проверяемому расчёту",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Пример: Быстрый EQD" }),
    ).toBeVisible();
    await expect(page.getByText("89.11 Гр", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Примеры из публикации исходного Hypo-Calc",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("≈2,30 Гр/фр.", { exact: false }),
    ).toBeVisible();
  });

  test("Quick EQD calculates, validates bad input, and exports JSON audit", async ({ page }) => {
    await page
      .getByRole("button", { name: "Калькуляторы", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Быстрый BED / EQD₂", exact: true })
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

    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();
    const exported = JSON.parse(
      await readFile(downloadPath!, "utf8"),
    );
    expect(exported.format).toBe("hfc-audit");
    expect(exported.envelopeVersion).toBe("1.0");
    expect(exported.record.module).toBe("quick-eqd");
    expect(exported.record.schemaVersion).toBe("1.1");
    expect(exported.integrity.algorithm).toBe("SHA-256");
    expect(exported.integrity.canonicalization).toBe(
      "hfc-json-v1",
    );
    expect(exported.integrity.digestHex).toMatch(
      /^[0-9a-f]{64}$/,
    );
  });

  test("Treatment Gap requires an explicit time model after evidence v0.10", async ({ page }) => {
    await page
      .getByRole("button", { name: "Калькуляторы", exact: true })
      .click();
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

  test("calculator and methodology hubs expose specialist modules", async ({ page }) => {
    await page
      .getByRole("button", { name: "Калькуляторы", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Сравнение режимов", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Режимы фракционирования" }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Методология", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Клинические ограничения", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Доза, объём и риск — вместе с контекстом",
      }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Калькуляторы", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Повторное облучение", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Кумулятивный EQD₂/BED без скрытых допущений о восстановлении",
      }),
    ).toBeVisible();
  });

  test("new parity calculators reproduce published examples", async ({ page }) => {
    await page.getByRole("button", { name: "Калькуляторы", exact: true }).click();
    await page.getByRole("button", { name: "Коррекция курса / ошибки дозы", exact: true }).click();
    await expect(page.getByText("2,297 Гр", { exact: false })).toBeVisible();

    await page.getByRole("button", { name: "Калькуляторы", exact: true }).click();
    await page.getByRole("button", { name: "Подбор режима по EQD₂", exact: true }).click();
    await expect(page.getByText("17", { exact: true }).first()).toBeVisible();

    await page.getByRole("button", { name: "Калькуляторы", exact: true }).click();
    await page.getByRole("button", { name: "Интерактивный календарь", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Редактируйте курс прямо по дням" }),
    ).toBeVisible();
  });

  test("dark theme and design variants are user-selectable", async ({ page }) => {
    await page.getByLabel("Вариант дизайна").selectOption("journal");
    await expect(page.locator("html")).toHaveAttribute("data-design", "journal");

    await page.getByRole("button", { name: "Включить тёмную тему" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("mobile navigation opens and changes module", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const trigger = page.locator(".mobile-nav-trigger");
    await expect(trigger).toBeVisible();
    await trigger.click();

    const menu = page.locator("#mobile-site-menu");
    await expect(menu).toBeVisible();
    await menu
      .getByRole("button", { name: "Калькуляторы", exact: true })
      .click();

    await expect(menu).not.toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Все расчётные инструменты HFC",
      }),
    ).toBeVisible();
  });
});
