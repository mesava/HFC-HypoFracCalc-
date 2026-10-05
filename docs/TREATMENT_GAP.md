# Treatment Gap v0.1

## Purpose

Treatment Gap is a clinical decision-support workflow for modelling the radiobiological consequences of an unscheduled interruption in **photon EBRT**.

It is deliberately structured around the priority order used in RCR guidance:

1. preserve the original overall treatment time and dose per fraction where possible;
2. use weekend treatment where operationally feasible;
3. use twice-daily treatment only when clinically appropriate and with adequate interfraction spacing;
4. use biological dose modification only when accelerated compensation cannot be achieved.

The module does **not** automatically recommend a treatment change.

## Evidence basis

### RCR — The timely delivery of radical radiotherapy, 4th edition (2019)

The current v0.1 workflow follows these points from the supplied RCR guidance:

- missed weekday fractions should preferentially be recovered at weekends when possible;
- BID treatment may be used with a **minimum 6-hour** interval;
- BID is not recommended when the individual fraction size is significantly greater than **2.2 Gy**;
- biological BED-based compensation is intended for situations where accelerated recovery of the schedule is not feasible;
- increasing fraction size to restore tumour effect can worsen the therapeutic index and increase late-normal-tissue effect.

RCR expresses tumour repopulation in its worked biological-compensation framework using a **BED-based K factor**. HFC keeps this concept separate from EQD2-based Dprolif.

### Basic Clinical Radiobiology, 6th ed. (2025)

Treatment Gap v0.1 currently uses the alternative **EQD2-based Dprolif/Tk** formalism from Chapter 10:

```
time penalty = Dprolif × max(0, OTT − Tk)
```

For comparing two overall treatment times:

```
Δtime penalty =
Dprolif × [
  max(0, OTT_actual − Tk)
  − max(0, OTT_planned − Tk)
]
```

Important limitations retained in HFC:

- Dprolif is a pragmatic local approximation, not a complete mechanistic model of repopulation;
- a time difference of about one week may be a reasonable domain for a linear approximation, whereas extrapolation over three to four weeks is specifically cautioned against;
- many tumour types have poorly established Dprolif and/or Tk;
- for HNSCC, Tk is of the order of 21–24 days;
- when BID treatment is used, BCR recommends the maximum practical interfraction interval, **at least about 8 hours and preferably more**.

HFC therefore distinguishes:
- **RCR minimum:** 6 h;
- **BCR 2025 preferred practical interval:** about 8 h or more.

It does not silently merge them into a single threshold.

## Current HNSCC default

The draft evidence dataset currently provides an automatic Treatment Gap default only for the general HNSCC tumour-control endpoint:

```
Dprolif = 0.80 Gy EQD2/day
95% CI  = 0.50–1.10
Tk      = 21 days
```

Other published time-loss estimates remain available but are not automatically applied.

## Baseline calculation

For a planned schedule:

```
planned raw EQD2 = LQ_EQD2(planned schedule)

planned effective EQD2 =
planned raw EQD2
− Dprolif × max(0, OTT_planned − Tk)
```

If all planned fractions are ultimately delivered unchanged but treatment is prolonged by a gap:

```
uncompensated effective EQD2 =
planned raw EQD2
− Dprolif × max(0, OTT_actual − Tk)
```

The difference from the planned effective dose is the modelled tumour loss from prolongation.

## Preserve-time strategies

### Weekend recovery

If all planned fractions can be delivered with the original dose per fraction and original finish date:

- raw EQD2 is unchanged;
- planned OTT is restored;
- modelled tumour effective EQD2 is unchanged.

Operational feasibility and local QA remain outside the mathematical model.

### BID recovery

The same tumour-equivalence statement applies if all original fractions are delivered by the original finish date.

However:

- <6 h is rejected under the current RCR rule;
- 6–8 h produces a caution;
- >2.2 Gy/fraction produces an RCR caution;
- late-tissue incomplete repair must be evaluated separately.

Selective BID-day incomplete-repair modelling for OAR endpoints is planned for the next Treatment Gap iteration.

## Biological dose-compensation solver

When the user supplies:

- number of post-gap fractions to deliver;
- actual final OTT;

HFC solves the post-gap fraction size required to restore the **planned tumour effective EQD2**.

The target remaining raw EQD2 is:

```
required remaining EQD2 =
planned effective EQD2
+ final time penalty
− already-delivered raw EQD2
```

The standard inverse LQ quadratic is then solved for the remaining dose per fraction.

This is a **tumour-equivalence calculation only**. It is not a statement of OAR safety.

## OAR handling

Treatment Gap v0.1 intentionally does not infer OAR dose from prescription dose.

Increasing target dose per fraction does not uniquely determine:
- spinal-cord dose per fraction;
- bowel dose;
- rectal DVH;
- optic-pathway Dmax;
- other organ-specific dose-volume metrics.

A future OAR-aware module will require explicit OAR dose/fraction or DVH-derived inputs rather than silently assuming that OAR dose scales one-to-one with prescription dose.

## Audit requirements

A Treatment Gap calculation should ultimately record:

- planned and actual OTT;
- delivered fractions before the gap;
- gap duration;
- alpha/beta record or manual override;
- Dprolif record or manual override;
- Tk and whether it was evidence-derived or user-specified;
- compensation strategy;
- BID interval when used;
- solved post-gap fraction size when used;
- warnings and model limitations;
- engine and dataset versions.
