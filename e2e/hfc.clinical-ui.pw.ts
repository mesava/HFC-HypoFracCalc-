import { expect, test, type Page } from "@playwright/test";

async function useTheme(page: Page, theme: "light" | "dark") {
  await page.addInitScript((chosenTheme: "light" | "dark") => {
    localStorage.setItem("hfc-color-theme", chosenTheme);
    // Emulates someone opening the new version with a retired style saved.
    localStorage.setItem("hfc-design-style", "journal");
  }, theme);
}

async function assertShellColors(page: Page, mobile: boolean, dark: boolean) {
  const values = await page.evaluate((isMobile) => {
    const nav = document.querySelector(isMobile ? ".mobile-nav" : ".site-nav");
    const trigger = document.querySelector(isMobile ? ".mobile-nav-trigger" : ".site-nav .module:not(.active)");
    const chip = document.querySelector(".dataset-chip");
    if (!nav || !trigger || !chip) throw new Error("Clinical shell missing");
    const body = getComputedStyle(document.body);
    const navStyle = getComputedStyle(nav);
    // Active navigation uses a deliberate teal accent; inspect an inactive tab instead.
    const triggerStyle = getComputedStyle(trigger);
    const chipStyle = getComputedStyle(chip);
    return {
      pageBackground: body.backgroundColor,
      navBackground: navStyle.backgroundColor,
      navBorderWidth: navStyle.borderTopWidth,
      triggerBorderColor: triggerStyle.borderTopColor,
      chipBorderColor: chipStyle.borderTopColor,
      pageWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      designAttribute: document.documentElement.getAttribute("data-design"),
      savedStyle: localStorage.getItem("hfc-design-style"),
    };
  }, mobile);
  expect(values.navBackground).toBe(values.pageBackground);
  expect(values.documentWidth).toBeLessThanOrEqual(values.pageWidth + 1);
  expect(values.designAttribute).toBeNull();
  expect(values.savedStyle).toBeNull();
  if (mobile) expect(values.navBorderWidth).toBe("0px");
  if (dark) {
    for (const color of [values.navBackground, values.triggerBorderColor, values.chipBorderColor]) {
      const components = color.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
      expect(components).toHaveLength(3);
      expect(Math.max(...components), `unexpected bright dark-shell color: ${color}`).toBeLessThan(125);
    }
  }
}

test.describe("P6.5 clinical-only design and accessible color themes", () => {
  test("dark mobile 390px has no light navigation frame or document overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await useTheme(page, "dark");
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await assertShellColors(page, true, true);
    await expect(page.getByLabel("Вариант дизайна")).toHaveCount(0);
    const mobileNav = page.locator(".mobile-nav-trigger");
    await expect(mobileNav).toBeVisible();
    await mobileNav.click();
    await expect(page.locator("#mobile-site-menu")).toBeVisible();
    await page.locator("#mobile-site-menu").getByRole("button", { name: "Методология", exact: true }).click();
    await expect(page.locator("#mobile-site-menu")).not.toBeVisible();
    await assertShellColors(page, true, true);
  });

  test("light mobile and desktop 1440px share a single clinical appearance", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await useTheme(page, "light");
    await page.goto("/");
    await assertShellColors(page, true, false);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(page.locator(".site-nav")).toBeVisible();
    await assertShellColors(page, false, false);
    await expect(page.getByLabel("Design variant")).toHaveCount(0);
  });

  test("desktop dark shell uses dark theme borders, not legacy light tokens", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await useTheme(page, "dark");
    await page.goto("/");
    await assertShellColors(page, false, true);
    const appearance = page.locator(".theme-toggle");
    await expect(appearance).toBeVisible();
    await appearance.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});
