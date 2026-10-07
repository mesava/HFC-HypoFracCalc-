import { expect, test } from "@playwright/test";

test.describe("HFC HyTEC outcome models", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("button", {
        name: "Модели исходов",
        exact: true,
      })
      .click();
  });

  test("shows source-backed brain-metastasis outcome points without interpolation", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", {
        name: "Доза → вероятность исхода без подмены клинической рекомендации",
      }),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Максимальный диаметр опухоли 21–30 мм",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByText("≈ 75%", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Redmond KJ, Gui C, Benedict S",
        { exact: false },
      ),
    ).toBeVisible();

    await page
      .getByLabel("Клинический исход")
      .selectOption(
        "spinal-metastases-local-control",
      );

    await expect(
      page.getByText("экстраполяция", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("≈ 90%", {
        exact: true,
      }).last(),
    ).toBeVisible();
  });
});
