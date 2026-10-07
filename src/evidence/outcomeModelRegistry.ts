import type {
  OutcomeModel,
} from "../domain/outcomeModels.js";
import {
  endpoints,
  hytecOutcomeModels,
  sources,
} from "../data/evidence/v0.1/index.js";

export interface OutcomeModelQuery {
  endpointId?: string;
  outcomeKind?: OutcomeModel["outcomeKind"];
  evidenceForm?: OutcomeModel["evidenceForm"];
}

export interface ResolvedOutcomeModel {
  model: OutcomeModel;
  endpoint: (typeof endpoints)[number];
  source: (typeof sources)[number];
}

export function queryOutcomeModels(
  query: OutcomeModelQuery = {},
): OutcomeModel[] {
  return hytecOutcomeModels.filter((model) => {
    if (
      query.endpointId !== undefined &&
      model.endpointId !== query.endpointId
    ) {
      return false;
    }
    if (
      query.outcomeKind !== undefined &&
      model.outcomeKind !== query.outcomeKind
    ) {
      return false;
    }
    if (
      query.evidenceForm !== undefined &&
      model.evidenceForm !== query.evidenceForm
    ) {
      return false;
    }
    return true;
  });
}

export function resolveOutcomeModel(
  modelId: string,
): ResolvedOutcomeModel {
  const model = hytecOutcomeModels.find(
    (candidate) => candidate.id === modelId,
  );
  if (!model) {
    throw new Error(
      `Unknown outcome model: ${modelId}`,
    );
  }

  const endpoint = endpoints.find(
    (candidate) => candidate.id === model.endpointId,
  );
  if (!endpoint) {
    throw new Error(
      `Outcome model dataset error: missing endpoint ${model.endpointId}.`,
    );
  }

  const source = sources.find(
    (candidate) => candidate.id === model.sourceId,
  );
  if (!source) {
    throw new Error(
      `Outcome model dataset error: missing source ${model.sourceId}.`,
    );
  }

  if (model.points.length < 1) {
    throw new Error(
      `Outcome model dataset error: ${model.id} has no outcome points.`,
    );
  }

  const pointIds = new Set<string>();
  for (const point of model.points) {
    if (pointIds.has(point.id)) {
      throw new Error(
        `Outcome model dataset error: duplicate point id ${point.id} in ${model.id}.`,
      );
    }
    pointIds.add(point.id);

    if (
      !Number.isFinite(point.probability) ||
      point.probability < 0 ||
      point.probability > 1
    ) {
      throw new Error(
        `Outcome model dataset error: invalid probability in ${point.id}.`,
      );
    }

    const schedule = point.dose.schedule;
    if (
      schedule &&
      (!Number.isInteger(schedule.fractions) ||
        schedule.fractions <= 0 ||
        !Number.isFinite(schedule.dosePerFractionGy) ||
        schedule.dosePerFractionGy <= 0)
    ) {
      throw new Error(
        `Outcome model dataset error: invalid schedule in ${point.id}.`,
      );
    }

    const biologicalDose = point.dose.biologicalDose;
    if (
      biologicalDose &&
      (!Number.isFinite(biologicalDose.valueGy) ||
        biologicalDose.valueGy <= 0 ||
        !Number.isFinite(biologicalDose.alphaBetaGy) ||
        biologicalDose.alphaBetaGy <= 0)
    ) {
      throw new Error(
        `Outcome model dataset error: invalid biological dose in ${point.id}.`,
      );
    }
  }

  return { model, endpoint, source };
}

export function validateOutcomeModelDataset(): void {
  const ids = new Set<string>();
  for (const model of hytecOutcomeModels) {
    if (ids.has(model.id)) {
      throw new Error(
        `Outcome model dataset error: duplicate id ${model.id}.`,
      );
    }
    ids.add(model.id);
    resolveOutcomeModel(model.id);
  }
}
