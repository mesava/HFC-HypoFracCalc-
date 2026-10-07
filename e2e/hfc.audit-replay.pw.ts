import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";
import { buildQuickEqdAuditRecord } from "../src/audit/quickEqdAudit.js";
import { serializeAuditEnvelope } from "../src/audit/envelope.js";
import { calculateEvidenceLq } from "../src/workflows/evidenceLq.js";

function quickAudit() {
  const result = calculateEvidenceLq(
    "prostate-biochemical-control",
    {
      fractions: 5,
      dosePerFractionGy: 7.25,
    },
  );

  return buildQuickEqdAuditRecord(
    "2026-10-07T06:00:00.000Z",
    result,
  );
}

async function openAuditReplay(page: Parameters<typeof test>[0] extends never ? never : any) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Проверка аудита", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Проверка и воспроизведение audit JSON",
    }),
  ).toBeVisible();
}

test.describe("HFC audit import and replay", () => {
  test("verifies and replays a Quick EQD audit envelope", async ({ page }) => {
    await openAuditReplay(page);

    const content = await serializeAuditEnvelope(
      quickAudit(),
    );

    await page.getByLabel("Audit JSON").setInputFiles({
      name: "quick-eqd-audit.json",
      mimeType: "application/json",
      buffer: Buffer.from(content, "utf8"),
    });

    await expect(
      page.getByText(
        "SHA-256: целостность подтверждена",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Сохранённый расчёт воспроизведён",
      }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Клинически значимые поля совпадают",
      ),
    ).toBeVisible();
  });

  test("rejects a tampered audit envelope before replay", async ({ page }) => {
    await openAuditReplay(page);

    const envelope = JSON.parse(
      await serializeAuditEnvelope(quickAudit()),
    );
    envelope.record.result.eqd2Gy += 1;

    await page.getByLabel("Audit JSON").setInputFiles({
      name: "tampered-audit.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify(envelope),
        "utf8",
      ),
    });

    await expect(page.getByRole("alert")).toContainText(
      "Проверка SHA-256 не пройдена",
    );
    await expect(
      page.getByRole("heading", {
        name: "Сохранённый расчёт воспроизведён",
      }),
    ).not.toBeVisible();
  });

  test("replays a legacy raw schema 1.0 audit as unverified", async ({ page }) => {
    await openAuditReplay(page);

    await page.getByLabel("Audit JSON").setInputFiles({
      name: "legacy-audit.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify(quickAudit()),
        "utf8",
      ),
    });

    await expect(
      page.getByText(
        "Legacy audit: целостность не подтверждена",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Сохранённый расчёт воспроизведён",
      }),
    ).toBeVisible();
  });
});
