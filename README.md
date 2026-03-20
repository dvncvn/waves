# Waves

Generative waveform-based pen-plotter art with controlled randomness and seed reproducibility.

## Current State
- Git repository initialized.
- Planning, process docs, and runnable scaffold in place:
  - `requires.md`
  - `AGENTS.md`
  - `plan.md`
  - `package.json`
  - `src/generator.js`
  - `src/cli.js`

## Quick Start
- Run: `npm run generate`
- Sample fixed-seed run: `npm run generate:sample`
- Custom run example:
  - `node src/cli.js --seed 12345 --rows 56 --amp 5.2 --freq 0.07 --out output/seed-12345.svg`
