import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

type ModuleCase = {
  id: string;
  section: "top" | "calculator" | "methodology";
  label: string;
  landmark: string;
};

const modules: ModuleCase[] = [
  {
    id: "home",
    section: "top",
    label: "Главная",
    landmark: "Проверяемая радиобиология для сравнения режимов фракционирования.",
  },
  {
    id: "guide",
    section: "top",
    label: "Как пользоваться?",
    landmark: "От клинического вопроса к проверяемому расчёту",
  },
  {
    id: "calculators",
    section: "top",
    label: "Калькуляторы",
    landmark: "Все расчётные инструменты HFC",
  },
  {
    id: "quick",
    section: "calculator",
    label: "Быстрый BED / EQD₂",
    landmark: "Что именно мы моделируем?",
  },
  {
    id: "compare",
    section: "calculator",
    label: "Сравнение режимов",
    landmark: "Режимы фракционирования",
  },
  {
    id: "target-eqd",
    section: "calculator",
    label: "Подбор режима по EQD₂",
    landmark: "Подбор режима по целевому EQD₂",
  },
  {
    id: "course-correction",
    section: "calculator",
    label: "Коррекция курса / ошибки дозы",
    landmark: "Если часть курса уже доставлена иначе, чем планировалось",
  },
  {
    id: "calendar",
    section: "calculator",
    label: "Интерактивный календарь",
    landmark: "Редактируйте курс прямо по дням",
  },
  {
    id: "gap",
    section: "calculator",
    label: "Перерывы в лечении",
    landmark: "α/β + time-loss model",
  },
  {
    id: "reirradiation",
    section: "calculator",
    label: "Повторное облучение",
    landmark: "Кумулятивный EQD₂/BED без скрытых допущений о восстановлении",
  },
  {
    id: "methodology",
    section: "top",
    label: "Методология",
    landmark: "Как HFC получает и использует радиобиологические параметры",
  },
  {
    id: "constraints",
    section: "methodology",
    label: "Клинические ограничения",
    landmark: "Доза, объём и риск — вместе с контекстом",
  },
  {
    id: "outcomes",
    section: "methodology",
    label: "Клинические исходы по данным HyTEC",
    landmark: "Доза → вероятность исхода без подмены клинической рекомендации",
  },
  {
    id: "audit",
    section: "methodology",
    label: "Проверка сохранённого расчёта",
    landmark: "Проверка и воспроизведение audit JSON",
  },
  {
    id: "about",
    section: "top",
    label: "О сайте",
    landmark: "Зачем создан HFC",
  },
];

async function topNavigate(page: Page, label: string) {
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

async function navigate(page: Page, module: ModuleCase) {
  if (module.id === "home") return;

  if (module.section === "top") {
    await topNavigate(page, module.label);
    return;
  }

  if (module.section === "calculator") {
    await topNavigate(page, "Калькуляторы");
    await page.getByRole("button", { name: module.label, exact: true }).click();
    return;
  }

  await topNavigate(page, "Методология");
  await page.getByRole("button", { name: module.label, exact: true }).click();
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
    await navigate(page, module);

    await expect(
      page.getByText(module.landmark, { exact: false }).first(),
    ).toBeVisible();
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
