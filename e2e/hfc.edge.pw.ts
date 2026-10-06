import { expect, test } from "@playwright/test";

test.describe("HFC browser acceptance edge cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("HFC — HypoFracCalc");
  });

  test("Quick EQD requires valid manual alpha/beta and positive dose", async ({ page }) => {
    await page
      .getByRole("button", { name: "Быстрый EQD", exact: true })
      .click();

    await page
      .getByRole("button", { name: "Своё значение", exact: true })
      .click();

    const alphaBeta = page.getByLabel("Пользовательское α/β, Гр");
    await alphaBeta.fill("0");
    await expect(
      page.getByText("Пользовательское α/β должно быть больше 0 Гр."),
    ).toBeVisible();

    await alphaBeta.fill("3");
    await expect(
      page.getByText("Пользовательское α/β должно быть больше 0 Гр."),
    ).not.toBeVisible();

    const dosePerFraction = page.getByLabel("Доза / фракцию, Гр");
    await dosePerFraction.fill("-1");
    await expect(
      page.getByText("Доза за фракцию должна быть больше 0 Гр."),
    ).toBeVisible();

    await dosePerFraction.fill("2");
    await expect(
      page.getByRole("button", { name: "Скачать аудит JSON" }),
    ).toBeVisible();
  });

  test("Quick EQD printable report opens in a separate browser page", async ({ page }) => {
    await page
      .getByRole("button", { name: "Быстрый EQD", exact: true })
      .click();

    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: "Печатный отчёт" }).click();
    const report = await popupPromise;

    await report.waitForLoadState();
    await expect(report.locator("body")).toContainText("HFC");
    await report.close();
  });

  test("Treatment Gap manual Dprolif and Tk cannot be silently empty", async ({ page }) => {
    await page
      .getByRole("button", { name: "Перерывы в лечении", exact: true })
      .click();

    await page
      .getByRole("button", { name: "свои Dprolif / Tk", exact: true })
      .click();

    await expect(
      page.getByText(
        "Введите Dprolif и Tk явно или выберите опубликованную модель.",
      ),
    ).toBeVisible();

    await page.getByLabel("Dprolif, Гр EQD₂/день").fill("0.7");
    await page.getByLabel("Tk, дни").fill("21");

    await expect(
      page.getByText(
        "Введите Dprolif и Tk явно или выберите опубликованную модель.",
      ),
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Скачать аудит JSON" }),
    ).toBeVisible();
  });

  test("Reirradiation default scenario renders and manual alpha/beta is validated", async ({ page }) => {
    await page
      .getByRole("button", { name: "Повторное облучение", exact: true })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "Кумулятивный EQD₂/BED без скрытых допущений о восстановлении",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Скачать аудит JSON" }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "своё α/β", exact: true })
      .click();
    const manual = page.getByLabel("Пользовательское α/β, Гр");
    await manual.fill("0");

    await expect(
      page.getByText("Пользовательское α/β должно быть больше 0 Гр."),
    ).toBeVisible();

    await manual.fill("3");
    await expect(
      page.getByText("Пользовательское α/β должно быть больше 0 Гр."),
    ).not.toBeVisible();
  });
});
