import type { Page } from "@playwright/test";

export async function openCalculator(
  page: Page,
  label: string,
): Promise<void> {
  await page
    .getByRole("button", { name: "Калькуляторы", exact: true })
    .click();
  await page
    .getByRole("button", { name: label, exact: true })
    .click();
}

export async function openMethodologyTool(
  page: Page,
  label: string,
): Promise<void> {
  await page
    .getByRole("button", { name: "Методология", exact: true })
    .click();
  await page
    .getByRole("button", { name: label, exact: true })
    .click();
}
