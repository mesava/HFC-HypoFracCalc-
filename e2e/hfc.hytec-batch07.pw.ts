import { expect, test } from "@playwright/test";

test("HyTEC 24–25 methodologic caveat: 10 Gy/fraction is not a hard LQ cutoff", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Методология и доказательная база", exact: true }).click();
  const lq = page.locator(".methodology-card").filter({has:page.getByRole("heading",{name:"LQ / BED / EQD₂"})});
  await expect(lq).toBeVisible();
  await expect(lq).toContainText("10 Гр за фракцию");
  await expect(lq).toContainText("не жёсткий запрет");
  await expect(lq).toContainText("Grimm");
  await expect(lq).toContainText("2021.02.021");
  await expect(lq).toContainText("клиническую взаимозаменяемость");
});
