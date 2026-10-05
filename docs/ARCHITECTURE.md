# HFC architecture v0.1

## 1. Architectural principle

HFC separates five concerns that are often mixed in simple online BED/EQD calculators:

```
physical schedule
      |
      v
mathematical model  <--- model assumptions
      |
      v
biological quantity (BED / EQDx)
      |
      +---- evidence parameters (alpha/beta, T1/2, Dprolif, Tk, ...)
      |
      v
clinical workflow (comparison / gap / reirradiation)
      |
      v
result + uncertainty + provenance + warnings
```

A parameter value must never be embedded directly in a UI component or calculation function.

## 2. Layer boundaries

### 2.1 Core mathematics

Location: `src/core/`

Pure functions only. No DOM, React, network, database or clinical presets.

Initial modules:

- `lq.ts` — BED, EQDx and inverse calculations.
- `repopulation.ts` — time corrections with an explicit dose basis.
- `repair.ts` — incomplete repair for equally spaced fractions.
- `validation.ts` — numeric input validation.

The same core should later be reusable from a web UI, CLI, Telegram bot or API.

### 2.2 Domain/evidence

Location: `src/domain/`

Stores **what a number means**, not how the equation is evaluated.

Examples:

- endpoint identity;
- alpha/beta estimate and confidence interval;
- recovery half-time;
- proliferation rate and whether it is in EQD2 or BED units;
- `Tk` / delayed-repopulation assumption;
- clinical high-dose constraint;
- prior-radiotherapy status;
- source DOI and evidence status;
- validity/applicability notes.

### 2.3 Clinical workflows

Future location: `src/workflows/`

Planned workflows:

- Quick EQD/BED;
- Compare regimens;
- Treatment timeline;
- Gap compensation;
- Multi-fraction-per-day analysis;
- Reirradiation.

Workflow code composes the mathematical core and evidence records. It must not invent biological parameters.

### 2.4 UI

The UI will be added only after the core and evidence schema are stable.

Recommended stack: React + TypeScript + Vite, deployed as a static site.

For endpoint-linked biological parameters, the default interaction will be:

1. HFC selects the curated `preferred` estimate for the selected endpoint.
2. The value, confidence interval, source and applicability notes remain visible.
3. The user may choose an alternative curated estimate.
4. The user may enable **manual override** and enter a custom value.

A manual override never changes the evidence database. It is stored only with that calculation and must be clearly labelled in the audit/report as `user-specified`, together with an optional rationale.

### 2.5 Audit/reporting

Every clinical calculation should ultimately emit a machine-readable audit object containing:

- all input schedules;
- parameter values and source IDs;
- whether each parameter was evidence-selected or manually overridden;
- any manual-override rationale;
- model version;
- dataset version;
- assumptions;
- warnings;
- intermediate BED/EQD values;
- final result;
- timestamp.

This is a first-class feature, not an afterthought.

## 3. Important modelling decisions

### 3.1 EQD2 is the primary clinical comparison quantity

BED is retained because it is mathematically useful and remains common in clinical guidance. EQD2 is more directly interpretable clinically.

### 3.2 No universal alpha/beta defaults

The database is endpoint-specific. Generic values such as 3 Gy for late effects or 10 Gy for tumours may be exposed only as explicitly labelled exploratory fallbacks, never as silent defaults.

### 3.3 Evidence default + user override

HFC may automatically select a curated `preferred` parameter for a chosen endpoint, but it must never hide that selection.

The user can always:

- inspect the source and uncertainty;
- switch to another curated estimate;
- enter a custom value.

Custom values are calculation inputs, not evidence records. They must not silently become defaults for future users.

### 3.4 Dprolif and K are not synonyms

Two common time-correction quantities use similar units but different biological dose bases:

- **Dprolif**: loss in EQD2 per day.
- **K**: loss in BED per day.

HFC stores the basis explicitly and refuses ambiguous repopulation-rate records.

### 3.5 Tk belongs to the evidence record

There is no global “after 21 days” switch. Delayed proliferation is tied to the disease/endpoint and source.

### 3.6 Incomplete repair is endpoint-specific

No universal T1/2 default. The v0.1 repair model assumes equally spaced fractions and complete overnight repair. A future timeline model will support arbitrary timestamps and residual repair across days.

### 3.7 High-dose evidence is not reduced to one EQD2 number

HyTEC-style evidence often depends on volume metric, fraction number, prior irradiation and endpoint. Those values belong in a separate clinical-constraint/outcome layer.

### 3.8 Reirradiation is a strategy, not a scalar addition

Future cumulative-dose evaluation will support explicit strategies:

1. direct point-dose summation;
2. point-dose summation in overlap;
3. 3D registration-based equieffective dose accumulation.

Physical 3D dose distributions will not be quantitatively summed as if they were biologically equivalent.

## 4. Model applicability

The core returns warnings rather than automatically switching models.

Initial LQ applicability messaging:

- approximately 1–10 Gy/fraction: standard clinical evidence domain;
- <1 Gy/fraction: caution;
- >10 Gy/fraction: high-dose caution;
- >15 Gy/fraction: strong extrapolation warning.

These are warnings, not hard mathematical cut-offs.

## 5. Versioning

Calculation code and evidence data are versioned independently.

Example:

```
HFC engine:        0.4.0
Evidence dataset:  2026.10-r1
Clinical presets:  RCR-DF4-2024-r1
```

A historical calculation must remain reproducible after the evidence database is updated.
