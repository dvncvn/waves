import { resolvePreset } from "./presets.js";

export const PARAM_DEFS = {
  seed: { default: 1, min: 1, max: 2147483647, integer: true, step: 1 },
  width: { default: 900, min: 240, max: 4000, integer: true, step: 1 },
  height: { default: 900, min: 240, max: 4000, integer: true, step: 1 },
  margin: { default: 48, min: 0, max: 320, integer: false, step: 1 },
  rows: { default: 6, min: 1, max: 40, integer: true, step: 1 },
  xStep: { default: 2, min: 0.25, max: 12, integer: false, step: 0.05 },
  baseAmplitude: { default: 80, min: 2, max: 400, integer: false, step: 1 },
  baseFrequency: { default: 0.008, min: 0.001, max: 0.06, integer: false, step: 0.001 },
  regionJitter: { default: 0.45, min: 0, max: 2, integer: false, step: 0.01 },
  pointJitter: { default: 0.65, min: 0, max: 2, integer: false, step: 0.01 },
  styleEnergy: { default: 0.6, min: 0, max: 1, integer: false, step: 0.01 },
  styleContrast: { default: 0.6, min: 0, max: 1, integer: false, step: 0.01 },
  styleTexture: { default: 0.5, min: 0, max: 1, integer: false, step: 0.01 },
  strokeWidth: { default: 1.2, min: 0.1, max: 4, integer: false, step: 0.05 },
  gridCols: { default: 16, min: 1, max: 40, integer: true, step: 1 },
  gridRows: { default: 24, min: 1, max: 60, integer: true, step: 1 },
  rowsPerTile: { default: 1, min: 1, max: 20, integer: true, step: 1 },
  tilePadding: { default: 4, min: 0, max: 60, integer: false, step: 1 },
  sparsity: { default: 0.1, min: 0, max: 0.8, integer: false, step: 0.01 },
  simplicity: { default: 0.15, min: 0, max: 0.8, integer: false, step: 0.01 }
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toFiniteNumber(raw) {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function normalizeValue(key, rawValue) {
  const def = PARAM_DEFS[key];
  const candidate = toFiniteNumber(rawValue);
  const fallback = def.default;
  if (candidate === undefined) return fallback;
  const clamped = clamp(candidate, def.min, def.max);
  return def.integer ? Math.round(clamped) : clamped;
}

export function buildConfigFromRaw({ presetName = "balanced", raw = {} } = {}) {
  const preset = resolvePreset(presetName);
  const mode = raw.mode === "rows" ? "rows" : "grid";
  const merged = {
    ...preset,
    mode,
    seed: raw.seed ?? PARAM_DEFS.seed.default,
    width: raw.width ?? PARAM_DEFS.width.default,
    height: raw.height ?? PARAM_DEFS.height.default,
    margin: raw.margin ?? PARAM_DEFS.margin.default,
    rows: raw.rows ?? preset.rows,
    xStep: raw.xStep ?? preset.xStep,
    baseAmplitude: raw.baseAmplitude ?? preset.baseAmplitude,
    baseFrequency: raw.baseFrequency ?? preset.baseFrequency,
    regionJitter: raw.regionJitter ?? preset.regionJitter,
    pointJitter: raw.pointJitter ?? preset.pointJitter,
    styleEnergy: raw.styleEnergy ?? preset.styleEnergy ?? PARAM_DEFS.styleEnergy.default,
    styleContrast: raw.styleContrast ?? preset.styleContrast ?? PARAM_DEFS.styleContrast.default,
    styleTexture: raw.styleTexture ?? preset.styleTexture ?? PARAM_DEFS.styleTexture.default,
    strokeWidth: raw.strokeWidth ?? preset.strokeWidth,
    gridCols: raw.gridCols ?? preset.gridCols ?? PARAM_DEFS.gridCols.default,
    gridRows: raw.gridRows ?? preset.gridRows ?? PARAM_DEFS.gridRows.default,
    rowsPerTile: raw.rowsPerTile ?? preset.rowsPerTile ?? PARAM_DEFS.rowsPerTile.default,
    tilePadding: raw.tilePadding ?? preset.tilePadding ?? PARAM_DEFS.tilePadding.default,
    sparsity: raw.sparsity ?? preset.sparsity ?? PARAM_DEFS.sparsity.default,
    simplicity: raw.simplicity ?? preset.simplicity ?? PARAM_DEFS.simplicity.default
  };

  const config = {};
  for (const key of Object.keys(PARAM_DEFS)) {
    config[key] = normalizeValue(key, merged[key]);
  }

  const safeMarginMax = Math.max(0, Math.min(config.width, config.height) / 2 - 1);
  config.margin = clamp(config.margin, PARAM_DEFS.margin.min, Math.min(PARAM_DEFS.margin.max, safeMarginMax));
  config.mode = mode;

  config.baseFrequency = clamp(
    config.baseFrequency * (0.72 + config.styleEnergy * 1.08),
    PARAM_DEFS.baseFrequency.min,
    PARAM_DEFS.baseFrequency.max
  );
  config.baseAmplitude = clamp(
    config.baseAmplitude * (0.6 + config.styleEnergy * 0.9),
    PARAM_DEFS.baseAmplitude.min,
    PARAM_DEFS.baseAmplitude.max
  );
  config.regionJitter = clamp(
    config.regionJitter * (0.6 + config.styleContrast * 1.4),
    PARAM_DEFS.regionJitter.min,
    PARAM_DEFS.regionJitter.max
  );
  config.pointJitter = clamp(
    config.pointJitter * (0.45 + config.styleTexture * 1.75),
    PARAM_DEFS.pointJitter.min,
    PARAM_DEFS.pointJitter.max
  );

  return config;
}
