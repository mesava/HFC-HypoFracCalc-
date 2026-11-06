import { expect, test, type Page } from "@playwright/test";

/**
 * P6.5 rc.2: visual acceptance uncovered unreadable dark-teal headings
 * and near-white nested dose/OAR cards in 45 uploaded Playwright screenshots.
 * Unlike screenshot-only capture, fail CI on computed foreground/background
 * contrast and on cards using a light surface in the dark clinical theme.
 */
function parseRgb(css: string): [number, number, number] {
  const values = css.match(/^rgba?\(\s*(\d+(?:\.\d+)?)[, ]+\s*(\d+(?:\.\d+)?)[, ]+\s*(\d+(?:\.\d+)?)/);
  if (!values) throw new Error("Expected sRGB computed color: " + css);
  return [Number(values[1]), Number(values[2]), Number(values[3])];
}
function relativeLuminance(rgb: [number, number, number]): number {
  const c=rgb.map(v => {
    const s=v/255;
    return s<=0.04045 ? s/12.92 : ((s+0.055)/1.055)**2.4;
  });
  return 0.2126*c[0]!+0.7152*c[1]!+0.0722*c[2]!;
}
function contrastRatio(foreground:string,background:string):number {
  const l1=relativeLuminance(parseRgb(foreground));
  const l2=relativeLuminance(parseRgb(background));
  return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
}
async function assertReadableHeading(page:Page,selector:string):Promise<void> {
 const el=page.locator(selector).first();
 await expect(el).toBeVisible();
 const colors=await el.evaluate(node=>({
   foreground:getComputedStyle(node).color,
   background:getComputedStyle(node.parentElement!).backgroundColor
 }));
 expect(contrastRatio(colors.foreground,colors.background),
  selector+" too low-contrast: "+JSON.stringify(colors)).toBeGreaterThanOrEqual(4.5);
}
async function assertDarkCard(page:Page,selector:string):Promise<void> {
 const el=page.locator(selector).first();
 await expect(el).toBeVisible();
 const background=await el.evaluate(node=>getComputedStyle(node).backgroundColor);
 expect(Math.max(...parseRgb(background)),
  selector+" retained light card surface: "+background).toBeLessThan(115);
}
async function gotoDark(page:Page) {
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(()=>{
   localStorage.setItem("hfc-color-theme","dark");
   localStorage.setItem("hfc-design-style","journal");
 });
 await page.goto("/");
 await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
 await expect(page.locator("html")).not.toHaveAttribute("data-design",/.+/);
}
async function navigate(page:Page,tab:"Методология"|"Калькуляторы",subpage?:string) {
 await page.locator(".mobile-nav-trigger").click();
 const menu=page.locator("#mobile-site-menu");
 await expect(menu).toBeVisible();
 await menu.getByRole("button",{name:tab,exact:true}).click();
 await expect(menu).not.toBeVisible();
 if(subpage)await page.getByRole("button",{name:subpage,exact:true}).click();
}

test.describe("Release visual gate: dark clinical science content is readable",()=>{
 test("methodology: 8 evidence statistics are dark and header contrast is accessible",async({page})=>{
  await gotoDark(page);await navigate(page,"Методология");
  await assertReadableHeading(page,".methodology-hero h2");
  expect(await page.locator(".dataset-stat-grid > div").count()).toBeGreaterThanOrEqual(8);
  await assertDarkCard(page,".dataset-stat-grid > div");
  await assertReadableHeading(page,".dataset-stat-grid > div strong");
 });
 test("HyTEC OAR and OutcomeModels: source numbers, scientific notes and headers are not white-on-white",async({page})=>{
  await gotoDark(page);await navigate(page,"Методология","Клинические ограничения");
  await assertReadableHeading(page,".constraints-hero h2");
  await assertDarkCard(page,".constraint-card");
  await assertReadableHeading(page,".constraint-card-top > div:first-child > strong");
  await navigate(page,"Методология","Клинические исходы по данным HyTEC");
  await assertReadableHeading(page,".constraints-hero h2");
  await assertDarkCard(page,".constraint-card");
 });
 test("reirradiation: clinical context, prior cards and numeric units remain readable",async({page})=>{
  await gotoDark(page);await navigate(page,"Калькуляторы","Повторное облучение");
  await assertReadableHeading(page,".reirradiation-hero h2");
  for(const selector of [".reirradiation-checkboxes label",".metric-context-card",".prior-course-card",
    ".secondary-button"]) await assertDarkCard(page,selector);
  await assertReadableHeading(page,".metric-context-card strong");
 });
 test("Compare Regimens: editor backgrounds, OAR cards and buttons do not have bright light-only surfaces",async({page})=>{
  await gotoDark(page);await navigate(page,"Калькуляторы","Сравнение режимов");
  for(const selector of [".regimen-editor",".regimen-editor.reference",
    ".compare-endpoint-editor",".secondary-button",".icon-button"]) await assertDarkCard(page,selector);
 });
});
