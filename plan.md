# Plan: Generative Waveform Plotter

## Iteration Policy
This plan is a living document and must be updated every implementation cycle.
Reference remote for eventual/published history: [https://github.com/dvncvn/waves.git](https://github.com/dvncvn/waves.git)

## Milestones

### M0 - Foundation (current)
- [x] Initialize Git project.
- [x] Create baseline docs: `requires.md`, `AGENTS.md`, `plan.md`.
- [x] Create initial runtime scaffold (`package.json`, source folders).
- [ ] Configure/push GitHub remote (`origin`) to `https://github.com/dvncvn/waves.git`.

### M1 - Core Generator
- [x] Implement seeded RNG utility.
- [x] Implement waveform strip primitive with controllable parameters.
- [x] Compose multi-row grid with regional variation (nested/contrast blocks).
- [x] Export single SVG output.

### M2 - Control System
- [x] Add central parameter schema with safe min/max ranges.
- [x] Add presets for distinct but related visual styles.
- [x] Add CLI flags for seed and key parameters.

### M3 - Plotter Readiness
- [ ] Add page size and margin configuration.
- [ ] Enforce bounds and clipping safety.
- [ ] Add optional simplification/path complexity guardrails.

### M4 - Batch + Curation
- [x] Add batch generation across seed ranges.
- [ ] Add contact-sheet style previews (optional raster previews).
- [ ] Add lightweight selection workflow for keeping best outputs.

### M5 - Refinement
- [ ] Improve composition balance heuristics.
- [ ] Add optional multi-layer output strategy.
- [ ] Finalize v1 docs and usage examples.

### M6 - Preview Experience
- [x] Add local dev server for live visual iteration.
- [x] Add interactive browser controls for key parameters.
- [ ] Add side-by-side seed compare mode.

### M7 - Small Multiples Grid
- [x] Add grid composition mode (tile-based small multiples, not only row stacks).
- [x] Add tile controls (`cols`, `rowsPerTile`, `tilePadding`, per-tile seed offsets).
- [x] Add preview toggle between `rows` mode and `grid` mode.

## Immediate Next Actions
1. Tune focal-region boost contrast for stronger compositional hierarchy.
2. Add side-by-side seed compare mode in preview UI.
3. Explore additional contour types and shape mixing within single glyphs.
4. Add SVG download button to preview UI.
5. Revisit plotter optimization (crosshatch fills) as a separate pass.

## Change Log
- 2026-03-20: Initial plan created.
- 2026-03-20: Added runtime scaffold, seeded generator, CLI, and first sample SVG outputs.
- 2026-03-20: Added preset styles and batch seed generation CLI flow.
- 2026-03-20: Added live dev server and preview UI for rapid visual feedback.
- 2026-03-20: Added centralized parameter schema with clamping across CLI/server/generator/UI.
- 2026-03-20: Added true small-multiples grid mode with tile controls and preview mode toggle.
- 2026-03-20: Shifted UI toward macro controls (energy/contrast/texture) for better experimentation.
- 2026-03-20: Pivoted to single-wave filled pixel-artifact look and de-emphasized plotter-first constraints.
- 2026-03-20: Increased default canvas size and fixed slider/value display sync in preview UI.
- 2026-03-20: Rewrote shape engine with 7 contour types, switched to filled polygons, restored grid mode as default with dense small-multiples layout.
