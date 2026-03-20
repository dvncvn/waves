# AGENTS.md

This file defines how AI/human collaborators should work in this project.

## Project Context
- Project: generative waveform art for pen plotter output.
- Goal: controlled randomness, strong visual coherence, reproducible outputs.
- Primary artifact: SVG files.

## Collaboration Rules
- Keep changes small, testable, and seed-reproducible.
- Do not break deterministic output for a fixed seed.
- Prefer adding parameters over hard-coded magic values.
- Preserve plotter constraints (margin safety, manageable path complexity).

## Required Iterative Updates
Every substantive implementation step must include doc maintenance:
- `requires.md`: update requirements/constraints/decisions.
- `plan.md`: mark progress, add/adjust upcoming milestones.
- `AGENTS.md`: refine process rules if workflow changed.

## Standard Build Cycle
1. Clarify objective for current step.
2. Implement smallest useful vertical slice.
3. Validate with at least one fixed seed example.
4. Record what changed in docs (`requires.md`, `plan.md`, `AGENTS.md` if needed).

## Current Runtime Conventions
- Entrypoint: `src/cli.js`.
- Core generator: `src/generator.js`.
- Sample verification command:
  - `npm run generate:sample`
- Generated artifacts should go to `output/` during development.

## Definition of Done (Per Step)
- Code runs locally.
- Output quality aligns with current requirements.
- Seed reproducibility verified.
- Documentation updated.

## Commit Hygiene (When Committing Later)
- One coherent concern per commit.
- Commit message should explain intent and visual/technical impact.
- Include seed(s) used for verification in commit body when relevant.
