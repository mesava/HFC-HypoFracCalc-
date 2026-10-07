import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

type ModuleCase = {
  id: string;
  label: string;
  landmark: string;
};

const modules: ModuleCase[] = [
  {
    id: "home",
    label: "Главная",
    landmark: "Проверяемая радиобиология для сравнения режимов фракционирования.",
  },
  {
    id: "quick",
    label: "Быстрый EQD",
    landmark: "Что именно мы моделируем?",
  },
  {
    id: "compare",
    label: "Сравнение режимов",
    landmark: "Режимы фракционирования",
  },
  {
    id: "gap",
    label: "Перерывы в лечении",
    landmark: "α/β + time-loss model",
  },
  {
    id: "constraints",
    label: "Клинические ограничения",
    landmark: "Доза, объём и риск — вместе с контекстом",
  },
  {
    id: "reirradiation",
    label: "Повторное облучение",
    landmark: "Кумулятивный EQD₂/BED без скрытых допущений о восстановлении",
  },
  {
    id: "audit",
    label: "Проверка аудита",
    landmark: "Проверка и воспроизведение audit JSON",
  },
  {
    id: "methodology",
    label: "Методология",
    landmark: "Как HFC получает и использует радиобиологические параметры",
  },
  {
    id: "about",
    label: "О сайте",
    landmark: "Зачем создан HFC",
  },
];

async function navigate(page: Page, label: string) {
  if (label === "Проверка аудита") {
    await page
      .getByRole("button", {
        name: "Проверка аудита",
        exact: true,
      })
      .click();
    return;
  }

  const desktopNav = page.locator(".site-nav");
  if (await desktopNav.isVisible()) {
    await desktopNav.getByRole("button", { name: label, exact: true }).click();
    return;
  }

  const trigger = page.locator(".mobile-nav-trigger");
  await expect(trigger).toBeVisible();
  await trigger.click();
  const menu = page.locator("#mobile-site-menu");
  await expect(menu).toBeVisible();
  await menu.getByRole("button", { name: label, exact: true }).click();
  await expect(menu).not.toBeVisible();
}

async function assertNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(
    dimensions.scrollWidth,
    `horizontal overflow: scrollWidth=${dimensions.scrollWidth}, clientWidth=${dimensions.clientWidth}`,
  ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

async function captureViewport(
  page: Page,
  viewportName: "desktop" | "mobile",
  width: number,
  height: number,
) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page).toHaveTitle("HFC — HypoFracCalc");
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");

  const directory = `test-results/visual/${viewportName}`;
  await mkdir(directory, { recursive: true });

  for (const module of modules) {
    if (module.id !== "home") {
      await navigate(page, module.label);
    }

    await expect(page.getByText(module.landmark, { exact: false }).first()).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.screenshot({
      path: `${directory}/${module.id}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }

  expect(pageErrors, `page errors on ${viewportName}`).toEqual([]);
  expect(consoleErrors, `console errors on ${viewportName}`).toEqual([]);
}

test.describe("HFC visual acceptance capture", () => {
  test("captures all main modules at desktop width without horizontal overflow", async ({ page }) => {
    await captureViewport(page, "desktop", 1440, 1000);
  });

  test("captures all main modules at mobile width without horizontal overflow", async ({ page }) => {
    await captureViewport(page, "mobile", 390, 844);
  });
});
