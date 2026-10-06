import { expect, test, type Page } from "@playwright/test";

async function openTreatmentGapWithTimeModel(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Перерывы в лечении", exact: true })
    .click();

  const timeModel = page.getByLabel("Оценка временной поправки");
  await timeModel.selectOption({ index: 1 });
  await page.getByLabel("Tk для этого расчёта, дни").fill("21");

  await expect(
    page.getByRole("button", { name: "Скачать аудит JSON" }),
  ).toBeVisible();
}

test.describe("HFC Treatment Gap OAR browser acceptance", () => {
  test("does not turn the oral-mucositis 2-4 h evidence range into a point T1/2", async ({ page }) => {
    await openTreatmentGapWithTimeModel(page);

    const card = page.locator(".gap-oar-card").first();

    await card
      .getByLabel("Клинический исход органа риска")
      .selectOption("oral-mucosa-mucositis");

    await card
      .getByRole("button", {
        name: "T½ из доказательной базы",
        exact: true,
      })
      .click();

    await card
      .getByLabel("Время полувосстановления")
      .selectOption("t12-oral-mucositis-bcr2025");

    await expect(
      card.getByText("T½ не задано точечным значением", {
        exact: false,
      }),
    ).toBeVisible();

    await expect(card.locator(".inline-alert")).toContainText(
      "Выбранная оценка T½ является диапазоном или границей, а не точечным значением. Для расчёта необходимо явно задать численное T½.",
    );

    await card
      .getByRole("button", { name: "своё T½", exact: true })
      .click();
    await card.getByLabel("Своё T½, ч").fill("3");

    await expect(
      card.getByText(
        "Выбранная оценка T½ является диапазоном или границей, а не точечным значением.",
        { exact: false },
      ),
    ).not.toBeVisible();
  });

  test("rejects a non-positive manual OAR repair half-time", async ({ page }) => {
    await openTreatmentGapWithTimeModel(page);

    const card = page.locator(".gap-oar-card").first();
    await card
      .getByRole("button", { name: "своё T½", exact: true })
      .click();
    await card.getByLabel("Своё T½, ч").fill("0");

    await expect(card.locator(".inline-alert")).toContainText(
      "Пользовательское T½ должно быть больше 0 ч.",
    );
  });

  test("supports up to five independent OAR cards", async ({ page }) => {
    await openTreatmentGapWithTimeModel(page);

    const addButton = page.getByRole("button", {
      name: "+ добавить орган риска",
      exact: true,
    });

    await expect(page.locator(".gap-oar-card")).toHaveCount(1);

    for (let index = 0; index < 4; index += 1) {
      await addButton.click();
    }

    await expect(page.locator(".gap-oar-card")).toHaveCount(5);
    await expect(addButton).toBeDisabled();
  });

  test("does not offer Vx as a scalar OAR dose metric", async ({ page }) => {
    await openTreatmentGapWithTimeModel(page);

    const metric = page
      .locator(".gap-oar-card")
      .first()
      .getByLabel("Дозовая метрика");

    const values = await metric.locator("option").evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value),
    );

    expect(values).not.toContain("Vx");
    expect(values).toContain("Dmax");
    expect(values).toContain("mean-dose");
  });
});
