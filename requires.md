# Requires: Generative Waveform Plotter

## Purpose
Create a generative art system that produces waveform fields with controlled randomness and strong visual personality.

## Creative Direction
- Dense grid of small-multiple filled waveform glyphs (primary mode).
- Each glyph is a unique closed filled polygon — not stroked lines.
- Shape vocabulary: plateau drops, spike clusters, smooth swoops, jagged shelves, asymmetric bumps, staircases, sawtooth drifts.
- Focal region boosting gives compositional hierarchy (some cells bolder/larger).
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

## Implemented Decisions (Iteration 2)
- Added preset system for controlled style families:
  - `calm`
  - `balanced`
  - `rough`
- CLI now supports:
  - preset selection via `--preset`
  - batch generation via `--batch --seedStart --count`
  - inline help via `--help`
- Parameter overrides still supported on top of presets, preserving controllability.

## Implemented Decisions (Iteration 3)
- Added lightweight browser preview dev server (`npm run dev`).
- Added live preview UI with interactive controls for:
  - seed
  - preset
  - rows
  - amplitude/frequency
  - jitter controls
  - canvas width/height
- Preview uses API-driven SVG regeneration (`/api/svg`) for fast visual iteration.

## Implemented Decisions (Iteration 4)
- Added centralized parameter schema in `src/params.js`.
- All entry points now use shared normalization + clamping:
  - CLI
  - dev server API
  - generator safety path
  - preview UI constraints
- Guardrails now prevent invalid/unsafe values (for example, non-positive step sizes).

## Implemented Decisions (Iteration 5)
- Added composition `mode` support:
  - `grid` (small-multiples tiles)
  - `rows` (continuous full-width rows)
- Grid mode now includes tunable structure controls:
  - `gridCols`
  - `gridRows`
  - `rowsPerTile`
  - `tilePadding`
- Default interactive workflow now emphasizes grid composition to align with the target reference look/feel.

## Implemented Decisions (Iteration 6)
- Refocused experimental controls toward macro art-direction parameters:
  - `energy`
  - `contrast`
  - `texture`
- Kept low-level frequency/jitter internals in engine, but mapped UI macros to those internals for clearer visual response.
- CLI and dev server now support macro flags/params for reproducible tuning.

## Implemented Decisions (Iteration 7)
- Default preview composition now focuses on single-wave continuous row fields (`rows` mode).
- Rendering style now emphasizes filled, quantized/pixel-like artifacts using vertical fill strokes and square caps.
- Grid-group composition controls were removed from the main preview workflow.
- Pen-plotter constraints are deprioritized for now; visual character is the primary target.

## Implemented Decisions (Iteration 8)
- Increased default canvas size for preview and generation to support larger compositions.
- Fixed slider/value-pill synchronization so numeric value boxes now reflect slider movement live.

## Implemented Decisions (Iteration 9)
- Completely rewrote shape generation engine with 7 distinct contour types:
  plateau-drop, spike-cluster, smooth-swoop, jagged-shelf, asymmetric-bump, staircase, sawtooth-drift.
- Shapes are now closed filled polygons (`fill="black"`) instead of individual stroked vertical lines.
- Rewrote grid mode (`drawGridField`) to use the new contour engine — each cell gets one unique filled glyph.
- Grid is now the default composition mode with UI controls for columns, rows, padding, amplitude.
- Focal region boosting creates compositional hierarchy within the grid.
- Default canvas: 1800×1800, default grid: 16 cols × 24 rows.
- Presets updated: calm (12×18), balanced (16×24), rough (20×30).

## Pen Plotter Constraints (Deferred)
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
- How aggressive block-focus modulation should be in grid mode (subtle vs high-contrast).
