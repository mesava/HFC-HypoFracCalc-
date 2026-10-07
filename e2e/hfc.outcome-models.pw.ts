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

  test("shows NSCLC HN reirradiation and pancreas v0.2 models without hiding transformed dose semantics", async ({
    page,
  }) => {
    const endpoint = page.getByLabel("Клинический исход");

    await endpoint.selectOption("nsclc-stage-i-local-control");
    await expect(
      page.getByText("Максимальный диаметр опухоли 3 см", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("≈ 90%", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Ohri N, Werner-Wasik M", {
        exact: false,
      }),
    ).toBeVisible();

    await endpoint.selectOption(
      "head-neck-recurrent-reirradiation-local-control",
    );
    await expect(
      page.getByText("5-фр эквивалент = 45,1 Гр", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Vargo JA, Moiseenko V", {
        exact: false,
      }),
    ).toBeVisible();

    await endpoint.selectOption("pancreas-local-control");
    await expect(
      page.getByText("Без хирургического удаления", {
        exact: true,
      }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("3-фр эквивалент = 28,2 Гр", {
        exact: false,
      }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("≈ 77%", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Mahadevan A, Moningi S", {
        exact: false,
      }),
    ).toBeVisible();
  });

});