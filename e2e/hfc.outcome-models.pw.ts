import { expect, test } from "@playwright/test";
import { openMethodologyTool } from "./navigation.js";

test.describe("HFC HyTEC outcome models", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openMethodologyTool(
      page,
      "Клинические исходы по данным HyTEC",
    );
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
      }).first(),
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


  test("labels low-dose Royce prostate TCP as explicit extrapolation", async ({ page }) => {
    // Primary: Royce et al. HyTEC 2021, Figure 1: no observed EQD2 <~80 Gy.
    await page.getByLabel("Клинический исход")
      .selectOption("prostate-biochemical-control");

    await expect(
      page.getByText("экстраполяция", { exact: true }),
    ).toHaveCount(1);
    await expect(
      page.locator(".outcome-evidence-warning"),
    ).toContainText("не воспроизводят заявленные 90% и 95%");

    await expect(
      page.getByText("≈ 90%", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.locator(".outcome-source-discrepancy"),
    ).toHaveCount(1);
    await expect(
      page.locator(".outcome-source-discrepancy"),
    ).toContainText("не воспроизводятся из уравнения (2)");

  });

  test("discloses Soltys LQ vestibular model alternatives and 10Gy source extrapolation", async ({ page }) => {
    await page.getByLabel("Клинический исход")
      .selectOption("vestibular-schwannoma-tumour-control");

    await expect(page.getByText("экстраполяция", { exact: true }))
      .toHaveCount(1);
    await expect(page.locator(".outcome-source-discrepancy"))
      .toHaveCount(1);
    await expect(page.locator(".outcome-source-discrepancy"))
      .toContainText("LQ-L");
    await expect(page.locator(".outcome-source-discrepancy"))
      .toContainText("NF2");
    await expect(page.locator(".outcome-source-discrepancy"))
      .toContainText("12,4 Гр");
  });

  test("separates Mahadevan R0 source-averaged LC from unresected logistic TCP in UI", async ({ page }) => {
    await page.getByLabel("Клинический исход").selectOption("pancreas-local-control");
    const note = page.locator(".outcome-source-discrepancy");
    await expect(note).toHaveCount(1);
    await expect(note).toContainText("НЕ на этой кривой");
    await expect(note).toContainText("Table 2");
    await expect(note).toContainText("R0");
    await expect(page.getByText("> 90%",{exact:true})).toBeVisible();
  });

});
