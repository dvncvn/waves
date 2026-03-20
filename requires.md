# Requires: Generative Waveform Plotter

## Purpose
Create a generative art system that produces many small waveform strips with controlled randomness, suitable for pen plotters.

## Creative Direction
- Dense field of horizontal waveform slices.
- Nested regions or blocks with contrasting rhythm/density.
- Visual feel: organic variation, but constrained enough to avoid chaotic noise.
- Output should read well in black ink on white paper.

## Technical Requirements (Initial)
- Language/runtime: JavaScript (Node.js) for deterministic generation and easy SVG output.
- Primary output format: SVG (vector-first for plotting).
- Optional preview: PNG export for quick visual checks.
- Reproducibility via explicit random seed.
- Tunable parameter ranges for:
  - waveform frequency
  - amplitude
  - jitter/noise amount
  - row spacing
  - region-based modulation
- Ability to generate:
  - single composition from a seed
  - batch compositions across a seed range

## Implemented Decisions (Iteration 1)
- Runtime: Node.js ES modules.
- Deterministic RNG: seeded linear congruential generator (LCG).
- Generator strategy:
  - row-based waveform strips
  - micro-variation via layered sine terms
  - controlled random jitter
  - region modulation blocks that locally boost amplitude/frequency/roughness
- CLI entrypoint supports seed and core tuning parameters.
- SVG export implemented via direct string output (no external library in v1).

## Pen Plotter Constraints
- Single-stroke friendly geometry where possible.
- Avoid excessive micro-segments that cause long plotting times.
- Keep margins and page aspect configurable (A4 / Letter / square).
- Include scale controls for plotter-friendly units.
- Support monochrome layer output first; color/layer separation later.

## Quality/Validation
- Same seed must produce identical output.
- Different seeds should produce meaningful variation within style bounds.
- No clipping outside art bounds.
- Reasonable node count for plotting (target thresholds to be defined in implementation).

## Operational Requirements
- Git-first project layout with clean commit boundaries.
- Documentation updated each milestone:
  - update `requires.md` when requirements shift
  - update `plan.md` when roadmap changes
  - update `AGENTS.md` when agent workflow/process changes

## Open Questions (To Resolve Iteratively)
- Preferred SVG tooling (custom writer vs lightweight library).
- Preferred noise model (Perlin/Simplex/value noise/custom).
- Exact paper defaults and units (mm vs px workflow).
- Whether to optimize path ordering in v1 or defer.
