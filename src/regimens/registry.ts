import {
  regimenPresets,
} from "../data/regimens/v0.1/index.js";
import {
  complexRegimenPresets,
} from "../data/regimens/v0.2/index.js";
import type {
  ClinicalRegimenPreset,
  ComplexClinicalRegimenPreset,
  ComplexRegimenPrescription,
  RegimenIntent,
} from "../domain/regimen.js";

export function getRegimenPresets(): ClinicalRegimenPreset[] {
  return [...regimenPresets];
}

export function getRegimenPresetById(
  id: string,
): ClinicalRegimenPreset | undefined {
  return regimenPresets.find(
    (preset) => preset.id === id,
  );
}

export function getRegimenPresetsBySite(
  site: string,
): ClinicalRegimenPreset[] {
  return regimenPresets.filter(
    (preset) => preset.site === site,
  );
}

export function getRegimenPresetsByIntent(
  intent: RegimenIntent,
): ClinicalRegimenPreset[] {
  return regimenPresets.filter(
    (preset) => preset.intent === intent,
  );
}

export function getComplexRegimenPresets(): ComplexClinicalRegimenPreset[] {
  return [...complexRegimenPresets];
}

export function getComplexRegimenPresetById(
  id: string,
): ComplexClinicalRegimenPreset | undefined {
  return complexRegimenPresets.find(
    (preset) => preset.id === id,
  );
}

export function getComplexRegimenPresetsBySite(
  site: string,
): ComplexClinicalRegimenPreset[] {
  return complexRegimenPresets.filter(
    (preset) => preset.site === site,
  );
}

export function getComplexRegimenPresetsByIntent(
  intent: RegimenIntent,
): ComplexClinicalRegimenPreset[] {
  return complexRegimenPresets.filter(
    (preset) => preset.intent === intent,
  );
}

export function getComplexRegimenPresetsByKind(
  kind: ComplexRegimenPrescription["kind"],
): ComplexClinicalRegimenPreset[] {
  return complexRegimenPresets.filter(
    (preset) => preset.prescription.kind === kind,
  );
}
