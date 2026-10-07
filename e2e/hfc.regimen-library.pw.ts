import { expect, test } from "@playwright/test";

test.describe("HFC RCR 2024 regimen library", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("button", {
        name: "Сравнение режимов",
        exact: true,
      })
      .click();
  });

  test("loads an RCR preset without selecting alpha/beta and clears provenance after schedule editing", async ({
    page,
  }) => {
    const picker = page.getByLabel(
      "Добавить режим из библиотеки RCR 2024",
    );

    await picker.selectOption(
      "rcr2024-prostate-only-60gy-20fx",
    );
    await page
      .getByRole("button", {
        name: "+ из библиотеки",
      })
      .click();

    const cards = page.locator(
      ".regimen-editor",
    );
    await expect(cards).toHaveCount(4);

    const card = cards.last();
    await expect(
      card.getByLabel("Название"),
    ).toHaveValue("Простата 60 Гр / 20");
    await expect(
      card.getByLabel("n", { exact: true }),
    ).toHaveValue("20");
    await expect(
      card.getByLabel("d, Гр", { exact: true }),
    ).toHaveValue("3");
    await expect(
      card.getByText(
        "RCR 2024 · Grade A",
        { exact: true },
      ),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Пресет переносит только опубликованную схему фракционирования и её источник.",
        { exact: false },
      ),
    ).toBeVisible();

    await card
      .getByLabel("d, Гр", { exact: true })
      .fill("3.1");

    await expect(
      card.getByText(
        "RCR 2024 · Grade A",
        { exact: true },
      ),
    ).not.toBeVisible();

    // Endpoint/evidence selection remains independent of the regimen preset.
    await expect(
      page.getByText(
        "α/β из доказательной базы",
        { exact: false },
      ).first(),
    ).toBeVisible();
  });
});
