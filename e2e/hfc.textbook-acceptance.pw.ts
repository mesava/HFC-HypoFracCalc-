import { expect, test } from "@playwright/test";
import { openCalculator } from "./navigation.js";

/** Black-box acceptance values from the TWO original user supplied textbooks:
 * BCR 2025 Ch10 Ex10.1 p106 PDF121 and 10.5 p109 PDF124;
 * Russian "Основы клинической радиобиологии" 2014 Ch9 Ex1 p209.
 * Never interpret matching textbook LQ as approval of a clinical regimen.
 */
test.describe("HFC clinical textbook acceptance (RU interface)", () => {
  test("BCR2025 Ex10.1 1x8 Gy alpha/beta2 -> BED40 and EQD2 20 in Quick EQD",async({page})=>{
    await page.goto("/");
    await openCalculator(page,"Быстрый BED / EQD₂");
    await page.getByLabel("Клинический исход").selectOption("spinal-cord-radiation-myelopathy");
    await page.getByRole("button",{name:"Своё значение",exact:true}).click();
    await page.getByLabel("Пользовательское α/β, Гр").fill("2");
    await page.getByLabel("Число фракций, n").fill("1");
    await page.getByLabel("Доза / фракцию, Гр").fill("8");
    await expect(page.getByText("20,00 Гр",{exact:true})).toBeVisible();
    await expect(page.getByText("40,00 Гр",{exact:true})).toBeVisible();
    await expect(page.getByRole("button",{name:"Скачать аудит JSON"})).toBeVisible();
  });
  test("RU2014 Ch9 Ex1 4x5 Gy alpha/beta2 -> BED70 and EQD2 35 in Quick EQD",async({page})=>{
    await page.goto("/");
    await openCalculator(page,"Быстрый BED / EQD₂");
    await page.getByLabel("Клинический исход").selectOption("spinal-cord-radiation-myelopathy");
    await page.getByRole("button",{name:"Своё значение",exact:true}).click();
    await page.getByLabel("Пользовательское α/β, Гр").fill("2");
    await page.getByLabel("Число фракций, n").fill("4");
    await page.getByLabel("Доза / фракцию, Гр").fill("5");
    await expect(page.getByText("35,00 Гр",{exact:true})).toBeVisible();
    await expect(page.getByText("70,00 Гр",{exact:true})).toBeVisible();
  });
  test("BCR2025 Ex10.5 5x5, delivered2x5, remaining2 alpha/beta10 -> 6.73 Gy in Course Correction",async({page})=>{
    await page.goto("/");
    await openCalculator(page,"Коррекция курса / ошибки дозы");
    await page.getByLabel("План: число фракций").fill("5");
    await page.getByLabel("План: доза / фракцию, Гр").fill("5");
    await page.getByLabel("Уже доставлено фракций").fill("2");
    await page.getByLabel("Фактическая доза / фракцию, Гр").fill("5");
    await page.getByLabel("Оставшихся фракций").fill("2");
    await page.getByLabel("α/β, Гр").fill("10");
    await expect(page.getByText("6,73 Гр",{exact:false})).toBeVisible();
  });
});
