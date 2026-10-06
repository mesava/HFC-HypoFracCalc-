import type { RepairHalfTimeEstimate } from "../../../domain/evidence.js";

export const repairHalfTimeEstimates = [
  {
    id: "t12-laryngeal-edema-chart1999",
    endpointId: "larynx-edema",
    sourceId: "bentzen-saunders-dische-1999-repair",
    parameter: "repair-half-time",
    valueHours: 4.9,
    ci95: { level: 0.95, low: 3.2, high: 6.4 },
    qualifier: "point",
    status: "preferred",
    defaultEligible: true,
    support: "supported",
    supportReason:
      "Direct CHART morbidity analysis with Monte Carlo propagation of uncertainty in alpha/beta and dose-response slope.",
    applicability: {
      radiationQuality: "photon",
      technique: ["head-and-neck EBRT", "multiple fractions per day"],
      priorRadiotherapy: "none",
    },
  },
  {
    id: "t12-skin-telangiectasia-chart1999",
    endpointId: "skin-telangiectasia",
    sourceId: "bentzen-saunders-dische-1999-repair",
    parameter: "repair-half-time",
    valueHours: 3.8,
    ci95: { level: 0.95, low: 2.5, high: 4.6 },
    qualifier: "point",
    status: "preferred",
    defaultEligible: true,
    support: "supported",
    supportReason:
      "Direct CHART late-morbidity estimate for skin telangiectasia.",
    applicability: {
      radiationQuality: "photon",
      technique: ["head-and-neck EBRT", "multiple fractions per day"],
      priorRadiotherapy: "none",
    },
  },
  {
    id: "t12-subcutis-fibrosis-chart1999",
    endpointId: "subcutis-fibrosis",
    sourceId: "bentzen-saunders-dische-1999-repair",
    parameter: "repair-half-time",
    valueHours: 4.4,
    ci95: { level: 0.95, low: 3.8, high: 4.9 },
    qualifier: "point",
    status: "preferred",
    defaultEligible: true,
    support: "supported",
    supportReason:
      "Direct CHART late-morbidity estimate for subcutaneous fibrosis.",
    applicability: {
      radiationQuality: "photon",
      technique: ["head-and-neck EBRT", "multiple fractions per day"],
      priorRadiotherapy: "none",
    },
  },
  {
    id: "t12-oral-mucositis-bcr2025",
    endpointId: "oral-mucosa-mucositis",
    sourceId: "bentzen-ruifrok-thames-1996-repair",
    parameter: "repair-half-time",
    rangeHours: { low: 2, high: 4 },
    qualifier: "range",
    status: "reviewed",
    defaultEligible: false,
    support: "limited",
    supportReason:
      "The primary 1996 clinical analysis concludes that the human mucosal repair half-time is probably in the range 2-4 h and that the available data do not support a more precise estimate; therefore HFC stores the range and does not create a point default.",
    applicability: {
      radiationQuality: "photon",
      technique: ["head-and-neck EBRT", "multiple fractions per day"],
      priorRadiotherapy: "not-reported",
    },
  },
  {
    id: "t12-spinal-cord-myelopathy-bcr2025",
    endpointId: "spinal-cord-radiation-myelopathy",
    sourceId: "bcr-2025-ch10-tables",
    parameter: "repair-half-time",
    rangeHours: { low: 5 },
    qualifier: "lower-bound",
    status: "reviewed",
    defaultEligible: false,
    support: "limited",
    supportReason:
      "Basic Clinical Radiobiology 2025 reports T1/2 >5 h for radiation myelopathy; no single numerical default is justified.",
    applicability: {
      radiationQuality: "photon",
      priorRadiotherapy: "not-reported",
    },
  },
  {
    id: "t12-temporal-lobe-necrosis-bcr2025",
    endpointId: "temporal-lobe-necrosis",
    sourceId: "bcr-2025-ch10-tables",
    parameter: "repair-half-time",
    rangeHours: { low: 4 },
    qualifier: "lower-bound",
    status: "reviewed",
    defaultEligible: false,
    support: "limited",
    supportReason:
      "Basic Clinical Radiobiology 2025 reports T1/2 >4 h for temporal-lobe necrosis; retained as a bound, not a point default.",
    applicability: {
      radiationQuality: "photon",
      priorRadiotherapy: "not-reported",
    },
  },
] satisfies RepairHalfTimeEstimate[];
