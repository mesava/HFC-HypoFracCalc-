import { expect, test } from "@playwright/test";
import { openMethodologyTool } from "./navigation.js";

test.describe("HFC expanded HyTEC clinical constraints", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openMethodologyTool(page, "Клинические ограничения");
  });

  test("preserves evidence type, ranges and clinical context", async ({
    page,
  }) => {
    const endpoint = page.getByLabel(
      "Клинический исход",
    );

    await endpoint.selectOption(
      "liver-grade3plus-enzyme-toxicity",
    );
    await page
      .getByLabel("Число фракций")
      .selectOption("3");

    await expect(
      page.getByText(
        "Первичная опухоль печени",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Метастатическое поражение печени",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByText("Dmean ≤ 13,0 Гр", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Dmean ≤ 15,0 Гр", {
        exact: true,
      }),
    ).toBeVisible();

    // Source caveat is visible to users (not hidden only in evidence data).
    await expect(page.locator(".constraint-evidence-note")).toHaveCount(2);
    await expect(
      page.locator(".constraint-evidence-note").first(),
    ).toContainText("p = 0,10");

    await page
      .getByLabel("Число фракций")
      .selectOption("all");

    await expect(
      page.getByText(
        "V≤15 Гр ≥ 700 см³",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        "V≤17 Гр ≥ 700 см³",
        { exact: true },
      ),
    ).toBeVisible();

    await endpoint.selectOption(
      "urethra-prostate-sbrt-late-urinary-toxicity",
    );

    await expect(
      page.getByText(
        "наблюдательный порог",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Dmax < 38,0–42,0 Гр",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByText("4–5 фр.", {
        exact: true,
      }),
    ).toBeVisible();

    await endpoint.selectOption(
      "major-vessel-grade3plus-bleeding",
    );

    await expect(
      page.getByText(
        "D0.5cc < 20,0 Гр",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByText("≈ 12%", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("explains mixed thecal-sac and spinal-cord model risk ranges", async ({ page }) => {
    await page.getByLabel("Клинический исход")
      .selectOption("spinal-cord-radiation-myelopathy");
    await page.getByLabel("Число фракций")
      .selectOption("1");

    await expect(
      page.locator(".constraint-evidence-note"),
    ).toHaveCount(1);
    await expect(
      page.locator(".constraint-evidence-note"),
    ).toContainText("Это не доверительный интервал");

    await page.getByLabel("Число фракций").selectOption("3");
    await expect(page.locator(".constraint-evidence-note"))
      .toContainText("LQ-экстраполяция");
    await expect(page.locator(".constraint-evidence-note"))
      .toContainText("рекомендованные в статье");
  });

  test("surfaces target-inclusive Milano brain V12 and distinct radionecrosis endpoints", async ({ page }) => {
    await page.getByLabel("Клинический исход")
      .selectOption("brain-symptomatic-radionecrosis");

    await expect(page.locator(".constraint-evidence-note")).toHaveCount(3);
    await expect(page.locator(".constraint-evidence-note").first())
      .toContainText("Brain−GTV/PTV");
    await expect(page.locator(".constraint-evidence-note").first())
      .toContainText("разным исходам");
  });

  test("makes optic 10 Gy recommendation distinct from pooled 12.1 Gy and blocks prior RT inference", async ({ page }) => {
    await page.getByLabel("Клинический исход")
      .selectOption("optic-pathway-radiation-neuropathy");

    await expect(page.locator(".constraint-evidence-note")).toHaveCount(3);
    await expect(page.locator(".constraint-evidence-note").first())
      .toContainText("12,1 Гр");
    await expect(page.locator(".constraint-evidence-note").first())
      .toContainText("не заменяет рекомендацию 10 Гр");
    await expect(page.locator(".constraint-evidence-note").first())
      .toContainText("повторном облучении");
  });


  test("Kong lung guidance discloses bilateral GTV/IGTV contours, ILD and nonuniversal G2+ RILT risk", async ({ page }) => {
    await page.getByLabel("Клинический исход")
      .selectOption("lung-symptomatic-rilt");

    await expect(page.getByText(
      "Dmean < 8,0 Гр", {exact:true},
    )).toBeVisible();
    await expect(page.getByText(
      "V20 < 10,0–15,0 %", {exact:true},
    )).toBeVisible();

    const cautions = page.locator(".constraint-evidence-note");
    await expect(cautions).toHaveCount(2);
    await expect(cautions.first()).toContainText("обоих лёгких");
    await expect(cautions.first()).toContainText("IGTV");
    await expect(cautions.first()).toContainText("Lung−PTV");
    await expect(cautions.first()).toContainText("интерстициальном заболевании лёгких");
    await expect(cautions.first()).toContainText("степени ≥2");
  });

});
