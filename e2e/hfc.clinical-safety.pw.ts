import { expect, test, type Page } from "@playwright/test";
import { openCalculator } from "./navigation.js";

async function openTreatmentGapWithTimeModel(page: Page) {
  await page.goto("/");
  await openCalculator(page, "Перерывы в лечении");

  const timeModel = page.getByLabel("Оценка временной поправки");
  await timeModel.selectOption({ index: 1 });
  await page.getByLabel("Tk для этого расчёта, дни").fill("21");

  await expect(
    page.getByRole("button", { name: "Скачать аудит JSON" }),
  ).toBeVisible();
}

async function openReirradiation(page: Page) {
  await page.goto("/");
  await openCalculator(page, "Повторное облучение");

  await expect(
    page.getByRole("heading", {
      name: "Кумулятивный EQD₂/BED без скрытых допущений о восстановлении",
    }),
  ).toBeVisible();
}

test.describe("HFC clinical-safety browser acceptance", () => {
  test("Treatment Gap rejects an interruption containing no planned fraction", async ({ page }) => {
    await page.goto("/");
    await openCalculator(page, "Перерывы в лечении");

    await page.getByLabel("План, n").fill("10");
    await page.getByLabel("Начало лечения").fill("2026-10-05");
    await page.getByLabel("Начало перерыва").fill("2026-10-10");
    await page.getByLabel("Конец перерыва").fill("2026-10-11");

    await expect(
      page
        .locator(".inline-alert")
        .filter({
          hasText:
            "В указанном интервале перерыва нет ни одной запланированной лечебной фракции.",
        })
        .first(),
    ).toBeVisible();
  });

  test("Treatment Gap treats BID below 6 h as a hard stop", async ({ page }) => {
    await openTreatmentGapWithTimeModel(page);

    await page
      .getByLabel("BID: интервал между фракциями, ч")
      .fill("5.5");

    await expect(
      page.getByText(
        "Рекомендации RCR требуют интервал не менее 6 ч между двумя фракциями в сутки.",
      ),
    ).toBeVisible();
  });

  test("Treatment Gap warns at a 6 h BID interval", async ({ page }) => {
    await openTreatmentGapWithTimeModel(page);

    await page
      .getByLabel("BID: интервал между фракциями, ч")
      .fill("6");

    await expect(
      page.getByText(
        /RCR допускает минимальный интервал 6 ч.*около 8 ч и более/,
      ),
    ).toBeVisible();
  });

  test("Treatment Gap warns against BID when dose per fraction exceeds 2.2 Gy", async ({ page }) => {
    await openTreatmentGapWithTimeModel(page);

    await page.getByLabel("d, Гр").fill("3");
    await page
      .getByLabel("BID: интервал между фракциями, ч")
      .fill("8");

    await expect(
      page.getByText(
        "RCR не рекомендует компенсацию двумя фракциями в сутки, если доза за фракцию существенно превышает 2,2 Гр.",
      ),
    ).toBeVisible();
  });

  test("Reirradiation requires rationale for a manual recovery assumption", async ({ page }) => {
    await openReirradiation(page);

    await page
      .getByRole("button", {
        name: "Задать восстановление вручную",
        exact: true,
      })
      .click();

    await page
      .getByLabel("Снижение вклада предыдущего EQD₂/BED, %")
      .fill("25");

    await expect(
      page.getByText(
        "Для ручного допущения о восстановлении необходимо указать обоснование.",
      ),
    ).toBeVisible();

    await page
      .getByLabel("Обоснование допущения")
      .fill("Локальное клиническое допущение для QA-теста");

    await expect(
      page.getByText(
        "Для ручного допущения о восстановлении необходимо указать обоснование.",
      ),
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Скачать аудит JSON" }),
    ).toBeVisible();
  });

  test("Reirradiation accepts an explicit zero-percent recovery assumption when rationale is documented", async ({ page }) => {
    await openReirradiation(page);

    await page
      .getByRole("button", {
        name: "Задать восстановление вручную",
        exact: true,
      })
      .click();
    await page
      .getByLabel("Снижение вклада предыдущего EQD₂/BED, %")
      .fill("0");
    await page
      .getByLabel("Обоснование допущения")
      .fill("Нулевое восстановление задано явно");

    await expect(
      page.getByRole("button", { name: "Скачать аудит JSON" }),
    ).toBeVisible();
  });

  test("Reirradiation classification changes from Type I to Type II when overlap is removed but toxicity concern remains", async ({ page }) => {
    await openReirradiation(page);

    await expect(
      page.getByText("Повторное облучение типа I", { exact: true }),
    ).toBeVisible();

    await page
      .getByLabel(
        "Есть геометрическое перекрытие с ранее облучённым объёмом",
      )
      .uncheck();

    await expect(
      page.getByText("Повторное облучение типа II", { exact: true }),
    ).toBeVisible();
  });

  test("Reirradiation rejects a non-positive cumulative EQD2 limit", async ({ page }) => {
    await openReirradiation(page);

    await page
      .getByLabel("Кумулятивная граница EQD₂ для этой же метрики, Гр")
      .fill("0");

    await expect(
      page.getByText(
        "Кумулятивная граница EQD₂ должна быть больше 0 Гр.",
      ),
    ).toBeVisible();
  });

  test("spinal HyTEC requires explicit thecal-sac Dmax confirmation before criteria are assessed", async ({ page }) => {
    await openReirradiation(page);

    await page
      .getByLabel("Клинический исход")
      .selectOption("spinal-cord-radiation-myelopathy");
    await page.getByLabel("Дозовая метрика").selectOption("Dmax");

    await expect(
      page.getByText("HyTEC · повторное облучение позвоночника"),
    ).toBeVisible();
    await expect(
      page.getByText("Проверка HyTEC пока неприменима."),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Необходимо явно подтвердить, что введённый Dmax относится к оболочке спинного мозга.",
      ),
    ).toBeVisible();

    await page
      .getByLabel(
        "Подтверждаю, что введённый Dmax относится к оболочке спинного мозга (thecal sac), как в публикации HyTEC.",
      )
      .check();

    await expect(
      page.getByText("Проверка HyTEC пока неприменима."),
    ).not.toBeVisible();
    await expect(
      page.getByText("Кумулятивный Dmax оболочки спинного мозга"),
    ).toBeVisible();
    await expect(
      page.getByText("Dmax оболочки спинного мозга в текущем SBRT"),
    ).toBeVisible();
    await expect(
      page.getByText("Интервал между курсами", { exact: true }),
    ).toBeVisible();
  });
});
