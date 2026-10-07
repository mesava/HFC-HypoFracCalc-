import {
  regimenPresets,
} from "../data/regimens/v0.1/index.js";
import type {
  ClinicalRegimenPreset,
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
