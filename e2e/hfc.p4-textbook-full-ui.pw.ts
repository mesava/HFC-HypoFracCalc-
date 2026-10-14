import { expect, test, type Page } from "@playwright/test";
import { openCalculator } from "./navigation.js";

/**
 * P4 independent *published* textbook reference values; full UI entry path.
 * BCR 2025 chapter 10: Ex 10.2 RAPID BID, Ex 10.4 ACC timing,
 * Ex 10.5 missed fraction and OAR sensitivity, Ex 10.6 dose error.
 * Основы клинической радиобиологии 2014 ch. 9 Ex. 2: 50 Gy+20 Gy BID.
 *
 * Reproducible black-box acceptance: each case edits actual UI fields and
 * checks what the user sees. Clinical safety is NOT inferred from equivalence.
 */
async function open(page: Page, name: string) {
  await page.goto("/");
  await openCalculator(page, name);
}
async function calendarDay(page: Page, date: string) {
  return page.locator(".editable-day").filter({
    has: page.locator(".editable-day-head strong", { hasText: date }),
  });
}
async function changeDay(page: Page, date: string, action: "Увеличить число фракций" | "Уменьшить число фракций", expected: string) {
  const day = await calendarDay(page,date);
  await expect(day).toHaveCount(1);
  await day.getByRole("button",{name:action}).click();
  await expect(day.locator(".editable-day-dose strong")).toHaveText(expected);
}
async function capture(page: Page, name: string, css: string) {
  await test.info().attach(name,{
    body:await page.locator(css).screenshot(),
    contentType:"image/png",
  });
}
const metric=(page: Page,index: number)=>page.locator(".calendar-metrics .metric").nth(index);

test.describe("P4 published textbook cases: complete browser workflows",()=>{
  test("F-03 BCR2025 RAPID 10x3.85 Gy: edit five BID and remove next five, EQD2 62.36 vs 51.69",async({page})=>{
    await open(page,"Интерактивный календарь");
    await page.getByLabel("Дата начала").fill("2026-10-05");
    await page.getByLabel("Плановое число фракций").fill("10");
    await page.getByLabel("Доза / фракцию, Гр").fill("3.85");
    await page.getByLabel("α/β, Гр").fill("3.4");
    await page.getByLabel("T½, ч").fill("4.4");
    await page.getByLabel("Δt, ч").fill("6");
    await page.getByRole("button",{name:"Построить стандартный курс"}).click();
    await expect(metric(page,0)).toContainText("10");
    await expect(metric(page,2)).toContainText("51,69");
    for(const date of ["05.10","06.10","07.10","08.10","09.10"]){
      await changeDay(page,date,"Увеличить число фракций","2");
    }
    for(const date of ["12.10","13.10","14.10","15.10","16.10"]){
      await changeDay(page,date,"Уменьшить число фракций","0");
    }
    await expect(page.locator(".editable-day.multi")).toHaveCount(5);
    await expect(metric(page,0)).toContainText("10");
    await expect(metric(page,1)).toContainText("38,50");
    await expect(metric(page,2)).toContainText("62,36");
    await expect(metric(page,3)).toContainText("99,04");
    await expect(metric(page,5)).toContainText("5 / 0");
    await capture(page,"F03-calendar-five-BID-62.36-EQD2",".calendar-page");
  });

  test("F-04 RU2014 25 daily + 5 BID: 6h EQD2 74.20, 8h EQD2 73.07 without rebuilding course",async({page})=>{
    await open(page,"Интерактивный календарь");
    await page.getByLabel("Дата начала").fill("2026-10-05");
    await page.getByLabel("Плановое число фракций").fill("35");
    await page.getByLabel("Доза / фракцию, Гр").fill("2");
    await page.getByLabel("α/β, Гр").fill("1.7");
    await page.getByLabel("T½, ч").fill("4.4");
    await page.getByLabel("Δt, ч").fill("6");
    await page.getByRole("button",{name:"Построить стандартный курс"}).click();
    for(const date of ["09.11","10.11","11.11","12.11","13.11"]){
      await changeDay(page,date,"Увеличить число фракций","2");
    }
    for(const date of ["16.11","17.11","18.11","19.11","20.11"]){
      await changeDay(page,date,"Уменьшить число фракций","0");
    }
    await expect(metric(page,0)).toContainText("35");
    await expect(metric(page,1)).toContainText("70,00");
    await expect(metric(page,2)).toContainText("74,20");
    await expect(metric(page,5)).toContainText("5 / 0");
    await capture(page,"F04-6h-calendar-EQD2-74.20",".calendar-page");
    await page.getByLabel("Δt, ч").fill("8");
    await expect(metric(page,2)).toContainText("73,07");
    await expect(metric(page,0)).toContainText("35");
    await expect(page.locator(".editable-day.multi")).toHaveCount(5);
    await capture(page,"F04-8h-same-calendar-EQD2-73.07",".calendar-page");
  });

  test("F-05 BCR2025 ACC 40→47d: explicit manual Dprolif=0.7, Tk=21 yields ΔEQD2 −4.90",async({page})=>{
    await open(page,"Перерывы в лечении");
    await page.getByRole("button",{name:"Ввести длительность вручную"}).click();
    await page.getByLabel("План, n").fill("35");
    await page.getByLabel("d, Гр").fill("2");
    await page.getByLabel("Плановая общая продолжительность лечения, дни").fill("40");
    await page.getByLabel("Фракций проведено до перерыва").fill("20");
    await page.getByLabel("Продолжительность перерыва, дни").fill("7");
    await page.getByRole("button",{name:"своё α/β"}).click();
    await page.getByLabel("Своё α/β, Гр").fill("10");
    await page.getByRole("button",{name:"свои Dprolif / Tk"}).click();
    await page.getByLabel("Dprolif, Гр EQD₂/день").fill("0.7");
    await page.getByLabel("Tk, дни").fill("21");
    const cell=page.locator(".gap-summary-card.alert");
    await expect(cell).toContainText(/[-−]4,90/);
    await expect(cell).toContainText("47");
    await capture(page,"F05-ACC-manual-OTT-loss-4.90",".gap-workspace");
  });

  test("F-06 BCR2025 bowel OAR: separate 5x5, 2x5 and 2x6.7 UI calculations",async({page})=>{
    await open(page,"Быстрый BED / EQD₂");
    await page.getByLabel("Клинический исход").selectOption("bowel-stricture-perforation");
    await page.getByRole("button",{name:"Своё значение",exact:true}).click();
    await page.getByLabel("Пользовательское α/β, Гр").fill("4");
    const n=page.getByLabel("Число фракций, n"),d=page.getByLabel("Доза / фракцию, Гр");
    await n.fill("5");await d.fill("5");
    await expect(page.getByText("37,50 Гр",{exact:true})).toBeVisible();
    await capture(page,"F06-bowel-original-37.50",".workspace");
    await n.fill("2");await d.fill("5");
    await expect(page.getByText("15,00 Гр",{exact:true})).toBeVisible();
    await capture(page,"F06-bowel-segment-2x5-15.00",".workspace");
    await d.fill("6.7");
    await expect(page.getByText("23,90 Гр",{exact:true})).toBeVisible();
    await capture(page,"F06-bowel-segment-2x6.7-23.90",".workspace");
    const independent=(2*5*(5+4)+2*6.7*(6.7+4))/(2+4);
    expect(independent).toBeCloseTo(38.8966666667,8);
    expect(independent).toBeGreaterThan(37.5);
  });

  test("F-06 BCR2025 subcutis fibrosis OAR: separate 5x5, 2x5, 2x6.7 and sum 48.53",async({page})=>{
    await open(page,"Быстрый BED / EQD₂");
    await page.getByLabel("Клинический исход").selectOption("subcutis-fibrosis");
    await page.getByRole("button",{name:"Своё значение",exact:true}).click();
    await page.getByLabel("Пользовательское α/β, Гр").fill("1.7");
    const n=page.getByLabel("Число фракций, n"),d=page.getByLabel("Доза / фракцию, Гр");
    await n.fill("5");await d.fill("5");
    await expect(page.getByText("45,27 Гр",{exact:true})).toBeVisible();
    await capture(page,"F06-fibrosis-original-45.27",".workspace");
    await n.fill("2");await d.fill("5");
    await expect(page.getByText("18,11 Гр",{exact:true})).toBeVisible();
    await capture(page,"F06-fibrosis-segment-2x5-18.11",".workspace");
    await d.fill("6.7");
    await expect(page.getByText("30,42 Гр",{exact:true})).toBeVisible();
    await capture(page,"F06-fibrosis-segment-2x6.7-30.42",".workspace");
    const independent=(2*5*(5+1.7)+2*6.7*(6.7+1.7))/(2+1.7);
    expect(independent).toBeCloseTo(48.5297297297,8);
    expect(independent).toBeGreaterThan(45.27);
  });

  test("F-07 BCR2025 over-dose: 35x2 planned, 2x4 delivered, 36 remaining -> 1.725 Gy and Russian caveat",async({page})=>{
    await open(page,"Коррекция курса / ошибки дозы");
    await page.getByLabel("План: число фракций").fill("35");
    await page.getByLabel("План: доза / фракцию, Гр").fill("2");
    await page.getByLabel("Уже доставлено фракций").fill("2");
    await page.getByLabel("Фактическая доза / фракцию, Гр").fill("4");
    await page.getByLabel("Оставшихся фракций").fill("36");
    await page.getByLabel("α/β, Гр").fill("10");
    await expect(page.getByText("1,725 Гр",{exact:true})).toBeVisible();
    await expect(page.locator(".warning-card")).toContainText("не доказывает клиническую эквивалентность");
    await expect(page.locator(".warning-card")).not.toContainText("This workflow restores");
    await capture(page,"F07-overdose-correction-1.725",".correction-workspace");
  });

  test("Russian correction safety warnings and invalid input errors, English mode unchanged",async({page})=>{
    await open(page,"Коррекция курса / ошибки дозы");
    await page.getByRole("button",{name:"Пример: пропущена 1 из 5 фракций"}).click();
    await expect(page.locator(".warning-card")).toContainText("Скорректированная доза за фракцию выше плановой");
    await expect(page.locator(".warning-card")).not.toContainText("The corrected dose");
    await page.getByLabel("Оставшихся фракций").fill("0");
    await expect(page.locator(".inline-alert")).toContainText("Должна оставаться хотя бы одна фракция");
    await page.getByRole("button",{name:"EN",exact:true}).click();
    await expect(page.locator(".inline-alert")).toContainText("At least one remaining fraction is required");
  });
});
