import { expect, test, type Page } from "@playwright/test";
import { openMethodologyTool } from "./navigation.js";
import { Buffer } from "node:buffer";
import {
  buildCompareRegimensAuditRecord,
} from "../src/audit/compareRegimensAudit.js";
import {
  buildTreatmentGapAuditRecord,
} from "../src/audit/treatmentGapAudit.js";
import {
  buildReirradiationAuditRecord,
} from "../src/audit/reirradiationAudit.js";
import {
  serializeAuditEnvelope,
} from "../src/audit/envelope.js";
import {
  compareRegimens,
} from "../src/workflows/compareRegimens.js";
import {
  buildTreatmentGapBaseline,
  evaluatePreserveTimeStrategy,
  solveDoseCompensationStrategy,
} from "../src/workflows/treatmentGap.js";
import {
  evaluateEvidenceReirradiationScenario,
} from "../src/workflows/evidenceReirradiation.js";
import type {
  ReirradiationCourse,
  ReirradiationScenarioContext,
} from "../src/domain/reirradiation.js";

const timestamp = "2026-10-07T07:00:00.000Z";

async function openAuditReplay(page: Page) {
  await page.goto("/");
  await openMethodologyTool(
    page,
    "Проверка сохранённого расчёта",
  );
  await expect(
    page.getByRole("heading", {
      name: "Проверка и воспроизведение audit JSON",
    }),
  ).toBeVisible();
}

async function uploadAudit(
  page: Page,
  name: string,
  record: unknown,
) {
  const content = await serializeAuditEnvelope(record);
  await page.getByLabel("Audit JSON").setInputFiles({
    name,
    mimeType: "application/json",
    buffer: Buffer.from(content, "utf8"),
  });
}

function compareAudit() {
  const result = compareRegimens(
    [
      {
        id: "r1",
        label: "Reference",
        schedule: {
          fractions: 30,
          dosePerFractionGy: 2,
        },
      },
      {
        id: "r2",
        label: "Test",
        schedule: {
          fractions: 20,
          dosePerFractionGy: 3,
        },
      },
    ],
    [
      {
        endpointId:
          "prostate-biochemical-control",
      },
    ],
    "r1",
  );

  return buildCompareRegimensAuditRecord(
    timestamp,
    result,
  );
}

function treatmentGapAudit() {
  const alphaSelection = {
    selectionMode: "manual" as const,
    parameter: "alpha-beta" as const,
    value: 10,
    unit: "Gy" as const,
    rationale: "Browser replay regression",
  };
  const repopulationSelection = {
    selectionMode: "manual" as const,
    rateGyPerDay: 0.8,
    kickOffDays: 21,
    rationale: "Browser replay regression",
  };

  const manualDurationInput = {
    plannedOverallTreatmentDays: 46,
    deliveredFractionsBeforeGap: 20,
    gapDays: 5,
  };

  const baseline = buildTreatmentGapBaseline({
    endpointId: "head-neck-tumour-control",
    plannedSchedule: {
      fractions: 35,
      dosePerFractionGy: 2,
    },
    ...manualDurationInput,
    alphaBetaSelection: alphaSelection,
    repopulationSelection,
  });

  const weekend = evaluatePreserveTimeStrategy(
    baseline,
    "weekend",
  );
  const bid = evaluatePreserveTimeStrategy(
    baseline,
    "bid",
    { bidInterfractionHours: 8 },
  );
  const doseCompensationInput = {
    remainingFractionsToDeliver:
      baseline.remainingFractions,
    actualOverallTreatmentDays: 51,
  };
  const doseCompensation =
    solveDoseCompensationStrategy(
      baseline,
      doseCompensationInput,
    );

  return buildTreatmentGapAuditRecord({
    generatedAtIso: timestamp,
    endpointId: "head-neck-tumour-control",
    courseInputMode: "manual",
    alphaSelection,
    repopulationSelection,
    baseline,
    weekend,
    bid,
    doseCompensation,
    bidInterfractionHours: 8,
    doseCompensationInput,
    manualDurationInput,
    oars: [],
  });
}

function reirradiationAudit() {
  const courses: ReirradiationCourse[] = [
    {
      id: "prior",
      label: "Prior course",
      role: "previous",
      schedule: {
        fractions: 10,
        dosePerFractionGy: 2,
      },
      metric: { kind: "D0.1cc" },
      intervalToCurrentMonths: 18,
      recovery: { mode: "none" },
    },
    {
      id: "current",
      label: "Current course",
      role: "current",
      schedule: {
        fractions: 5,
        dosePerFractionGy: 3,
      },
      metric: { kind: "D0.1cc" },
    },
  ];

  const context: ReirradiationScenarioContext = {
    geometricOverlap: true,
    cumulativeDoseToxicityConcern: true,
    previousDoseData: "summary-only",
    registrationSuitability: "uncertain",
    strategy: "conservative-near-max",
  };

  const result =
    evaluateEvidenceReirradiationScenario(
      "subcutis-fibrosis",
      courses,
      context,
      {
        selectionMode: "manual",
        parameter: "alpha-beta",
        value: 3,
        unit: "Gy",
        rationale: "Browser replay regression",
      },
    );

  return buildReirradiationAuditRecord({
    generatedAtIso: timestamp,
    endpointId: "subcutis-fibrosis",
    courses,
    context,
    result,
  });
}

const replayScenarios = [
  {
    name: "compare-audit.json",
    moduleLabel: "Сравнение режимов",
    build: compareAudit,
  },
  {
    name: "treatment-gap-audit.json",
    moduleLabel: "Перерывы в лечении",
    build: treatmentGapAudit,
  },
  {
    name: "reirradiation-audit.json",
    moduleLabel: "Повторное облучение",
    build: reirradiationAudit,
  },
];

test.describe("HFC audit replay for all current modules", () => {
  for (const scenario of replayScenarios) {
    test(
      `verifies and replays ${scenario.moduleLabel}`,
      async ({ page }) => {
        await openAuditReplay(page);
        await uploadAudit(
          page,
          scenario.name,
          scenario.build(),
        );

        await expect(
          page.getByText(
            "SHA-256: целостность подтверждена",
          ),
        ).toBeVisible();
        await expect(
          page
            .getByRole("main")
            .getByText(scenario.moduleLabel, {
              exact: true,
            }),
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
      },
    );
  }
});

test.describe("P4 backward-compatible historical audit inspection", () => {
  for (const [sourceId, reason] of [
    ["dprolif-hn-various-bcr2025", "историческая запись"],
    ["dprolif-hn-larynx-bcr2025", "историческая запись"],
    ["dprolif-medulloblastoma-bcr2025", "Hinata"],
    ["dprolif-medulloblastoma-tk21-hinata2001", "Hinata"],
  ] as const) {
    test(`opens valid signed old audit ${sourceId} but never replays its unsafe source`, async ({ page }) => {
    await openAuditReplay(page);
    const old = treatmentGapAudit();
    old.inputs.repopulationSelection = {
      selectionMode: "evidence",
      parameterRecordId: sourceId,
    };
    await uploadAudit(page, "old-treatment-gap-"+sourceId+".json", old);

    await expect(page.getByText("SHA-256: целостность подтверждена")).toBeVisible();
    const alert = page.getByTestId("audit-replay-blocked");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(sourceId);
    await expect(alert).toContainText(reason);
    await expect(page.getByTestId("archived-audit-results")).toContainText("Архивные значения");
    await expect(page.getByTestId("archived-audit-results")).toContainText("НЕ пересчитаны");
    await expect(page.getByRole("heading",{name:"Сохранённый расчёт воспроизведён"})).not.toBeVisible();
    await expect(page.getByText("Файл не принят")).not.toBeVisible();
    });
  }

  test("shows legacy raw JSON as intact data without claiming a verified digest", async ({page})=>{
    await openAuditReplay(page);
    const raw=treatmentGapAudit();
    raw.inputs.repopulationSelection={
      selectionMode:"evidence",
      parameterRecordId:"dprolif-hn-various-bcr2025",
    };
    await page.getByLabel("Audit JSON").setInputFiles({
      name:"old-unsigned-treatment-gap.json",
      mimeType:"application/json",
      buffer:Buffer.from(JSON.stringify(raw),"utf8"),
    });
    await expect(page.getByText("Legacy audit: целостность не подтверждена")).toBeVisible();
    await expect(page.getByTestId("audit-replay-blocked")).toContainText("dprolif-hn-various-bcr2025");
    await expect(page.getByTestId("archived-audit-results")).toBeVisible();
    await expect(page.getByRole("heading",{name:"Сохранённый расчёт воспроизведён"})).not.toBeVisible();
  });

  test("rejects SHA-tampered old audit before source policy check", async ({page})=>{
    await openAuditReplay(page);
    const old=treatmentGapAudit();
    old.inputs.repopulationSelection={
      selectionMode:"evidence",
      parameterRecordId:"dprolif-medulloblastoma-bcr2025",
    };
    const envelope=JSON.parse(await serializeAuditEnvelope(old));
    envelope.record.baseline.plannedEffectiveEqd2Gy+=1;
    await page.getByLabel("Audit JSON").setInputFiles({
      name:"modified-old-signed-audit.json",
      mimeType:"application/json",
      buffer:Buffer.from(JSON.stringify(envelope),"utf8"),
    });
    await expect(page.getByRole("alert")).toContainText("Проверка SHA-256 не пройдена");
    await expect(page.getByTestId("audit-replay-blocked")).not.toBeVisible();
  });
});
