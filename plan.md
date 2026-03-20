# Plan: Generative Waveform Plotter

## Iteration Policy
This plan is a living document and must be updated every implementation cycle.

## Milestones

### M0 - Foundation (current)
- [x] Initialize Git project.
- [x] Create baseline docs: `requires.md`, `AGENTS.md`, `plan.md`.
- [x] Create initial runtime scaffold (`package.json`, source folders).

### M1 - Core Generator
- [x] Implement seeded RNG utility.
- [x] Implement waveform strip primitive with controllable parameters.
- [x] Compose multi-row grid with regional variation (nested/contrast blocks).
- [x] Export single SVG output.

### M2 - Control System
- [ ] Add central parameter schema with safe min/max ranges.
- [ ] Add presets for distinct but related visual styles.
- [ ] Add CLI flags for seed and key parameters.

### M3 - Plotter Readiness
- [ ] Add page size and margin configuration.
- [ ] Enforce bounds and clipping safety.
- [ ] Add optional simplification/path complexity guardrails.

### M4 - Batch + Curation
- [ ] Add batch generation across seed ranges.
- [ ] Add contact-sheet style previews (optional raster previews).
- [ ] Add lightweight selection workflow for keeping best outputs.

### M5 - Refinement
- [ ] Improve composition balance heuristics.
- [ ] Add optional multi-layer output strategy.
- [ ] Finalize v1 docs and usage examples.

## Immediate Next Actions
1. Add preset profiles tuned for different visual density/roughness targets.
2. Add batch seed generation command.
3. Add plotter-focused page presets (A4/Letter with mm-first options).
4. Add guardrails for path/point count to keep plotting time manageable.

## Change Log
- 2026-03-20: Initial plan created.
- 2026-03-20: Added runtime scaffold, seeded generator, CLI, and first sample SVG outputs.
