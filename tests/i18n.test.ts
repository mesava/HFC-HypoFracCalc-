import { describe, expect, it } from "vitest";
import { endpoints } from "../src/data/evidence/v0.1/index.js";
import { localizeWarning } from "../src/ui/i18n.js";
import {
  endpointLabelsRu,
  endpointLabel,
  organLabelsRu,
  organLabel,
} from "../src/ui/labels.js";

describe("Russian UI coverage", () => {
  it("has an explicit Russian label for every current clinical endpoint", () => {
    for (const endpoint of endpoints) {
      expect(
        endpointLabelsRu[endpoint.id],
        `Missing Russian endpoint label: ${endpoint.id}`,
      ).toBeTruthy();

      expect(
        endpointLabel("ru", endpoint.id, endpoint.endpoint),
        `Endpoint falls back to English: ${endpoint.id}`,
      ).toBe(endpointLabelsRu[endpoint.id]);
    }
  });

  it("has an explicit Russian label for every current organ name", () => {
    const organs = [...new Set(endpoints.map((endpoint) => endpoint.organ))];

    for (const organ of organs) {
      expect(
        organLabelsRu[organ],
        `Missing Russian organ label: ${organ}`,
      ).toBeTruthy();

      expect(
        organLabel("ru", organ),
        `Organ falls back to English: ${organ}`,
      ).toBe(organLabelsRu[organ]);
    }
  });
});


describe("Russian safety-message coverage", () => {
  it("localizes Treatment Gap hard-stop messages instead of leaking English core errors", () => {
    expect(
      localizeWarning(
        "ru",
        "RCR guidance requires at least 6 hours between twice-daily fractions.",
      ),
    ).toBe(
      "Рекомендации RCR требуют интервал не менее 6 ч между двумя фракциями в сутки.",
    );

    expect(
      localizeWarning(
        "ru",
        "The interruption interval does not contain any planned treatment fraction.",
      ),
    ).toBe(
      "В указанном интервале перерыва нет ни одной запланированной лечебной фракции.",
    );

    expect(
      localizeWarning(
        "ru",
        "gapEndDate must not precede gapStartDate.",
      ),
    ).toBe(
      "Дата окончания перерыва не может быть раньше даты его начала.",
    );
  });
});


describe("Russian OAR repair-time safety-message coverage", () => {
  it("localizes OAR repair-time safety messages", () => {
    expect(
      localizeWarning(
        "ru",
        "Manual repair half-time must be > 0 hours.",
      ),
    ).toBe("Пользовательское T½ должно быть больше 0 ч.");

    expect(
      localizeWarning(
        "ru",
        "Repair half-time record t12-oral-mucositis-bcr2025 is a range or bound rather than a point estimate. Enter an explicit user value for the calculation.",
      ),
    ).toBe(
      "Выбранная оценка T½ является диапазоном или границей, а не точечным значением. Для расчёта необходимо явно задать численное T½.",
    );
  });
});
