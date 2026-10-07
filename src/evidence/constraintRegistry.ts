import type {
  ClinicalConstraint,
  DoseMetric,
} from "../domain/constraints.js";
import {
  endpoints,
  hytecClinicalConstraints,
  sources,
} from "../data/evidence/v0.1/index.js";

export interface ConstraintQuery {
  endpointId?: string;
  fractions?: number;
  metricKind?: DoseMetric["kind"];
  priorRadiotherapy?: ClinicalConstraint["priorRadiotherapy"];
}

export interface ResolvedClinicalConstraint {
  constraint: ClinicalConstraint;
  endpoint: (typeof endpoints)[number];
  source: (typeof sources)[number];
}

function sameMetricKind(
  constraint: ClinicalConstraint,
  metricKind: DoseMetric["kind"] | undefined,
): boolean {
  return metricKind === undefined || constraint.metric.kind === metricKind;
}

export function queryClinicalConstraints(
  query: ConstraintQuery = {},
): ClinicalConstraint[] {
  return hytecClinicalConstraints.filter((constraint) => {
    if (
      query.endpointId !== undefined &&
      constraint.endpointId !== query.endpointId
    ) {
      return false;
    }

    if (
      query.fractions !== undefined &&
      constraint.fractionation?.fractions !== query.fractions
    ) {
      return false;
    }

    if (!sameMetricKind(constraint, query.metricKind)) {
      return false;
    }

    if (
      query.priorRadiotherapy !== undefined &&
      constraint.priorRadiotherapy !== query.priorRadiotherapy
    ) {
      return false;
    }

    return true;
  });
}

export function resolveClinicalConstraint(
  constraintId: string,
): ResolvedClinicalConstraint {
  const constraint = hytecClinicalConstraints.find(
    (candidate) => candidate.id === constraintId,
  );
  if (!constraint) {
    throw new Error(`Unknown clinical constraint: ${constraintId}`);
  }

  const endpoint = endpoints.find(
    (candidate) => candidate.id === constraint.endpointId,
  );
  if (!endpoint) {
    throw new Error(
      `Constraint dataset error: missing endpoint ${constraint.endpointId}.`,
    );
  }

  const source = sources.find(
    (candidate) => candidate.id === constraint.sourceId,
  );
  if (!source) {
    throw new Error(
      `Constraint dataset error: missing source ${constraint.sourceId}.`,
    );
  }

  if (
    (constraint.value === undefined) ===
    (constraint.valueRange === undefined)
  ) {
    throw new Error(
      `Constraint dataset error: ${constraint.id} must define exactly one of value or valueRange.`,
    );
  }

  if (
    constraint.metric.kind === "Vx" &&
    (constraint.metric.xGy === undefined ||
      constraint.metric.xGy <= 0)
  ) {
    throw new Error(
      `Constraint dataset error: ${constraint.id} uses Vx without a positive xGy.`,
    );
  }

  if (
    constraint.metric.kind === "custom" &&
    (!constraint.metric.customLabel ||
      constraint.metric.customLabel.trim() === "")
  ) {
    throw new Error(
      `Constraint dataset error: ${constraint.id} uses a custom metric without a label.`,
    );
  }

  if (
    constraint.valueRange &&
    (!Number.isFinite(constraint.valueRange.low) ||
      !Number.isFinite(constraint.valueRange.high) ||
      constraint.valueRange.low >
        constraint.valueRange.high)
  ) {
    throw new Error(
      `Constraint dataset error: invalid value range in ${constraint.id}.`,
    );
  }

  return { constraint, endpoint, source };
}

export function validateConstraintDataset(): void {
  const ids = new Set<string>();

  for (const constraint of hytecClinicalConstraints) {
    if (ids.has(constraint.id)) {
      throw new Error(
        `Constraint dataset error: duplicate id ${constraint.id}.`,
      );
    }
    ids.add(constraint.id);
    resolveClinicalConstraint(constraint.id);
  }
}
