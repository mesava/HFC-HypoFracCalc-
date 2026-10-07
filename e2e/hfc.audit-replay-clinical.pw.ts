import { expect, test, type Page } from "@playwright/test";
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
  await page
    .getByRole("contentinfo")
    .getByRole("button", {
      name: "Проверка аудита",
      exact: true,
    })
    .click();
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
