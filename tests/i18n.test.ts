import { describe, expect, it } from "vitest";
import { endpoints } from "../src/data/evidence/v0.1/index.js";
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
