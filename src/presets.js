export const PRESETS = {
  calm: {
    rows: 3,
    xStep: 2,
    baseAmplitude: 60,
    baseFrequency: 0.005,
    regionJitter: 0.2,
    pointJitter: 0.25,
    styleEnergy: 0.3,
    styleContrast: 0.3,
    styleTexture: 0.2,
    strokeWidth: 1.2,
    gridCols: 12,
    gridRows: 18,
    rowsPerTile: 1,
    tilePadding: 6,
    sparsity: 0.2,
    simplicity: 0.25
  },
  balanced: {
    rows: 6,
    xStep: 1.5,
    baseAmplitude: 80,
    baseFrequency: 0.008,
    regionJitter: 0.45,
    pointJitter: 0.6,
    styleEnergy: 0.55,
    styleContrast: 0.6,
    styleTexture: 0.5,
    strokeWidth: 1.2,
    gridCols: 16,
    gridRows: 24,
    rowsPerTile: 1,
    tilePadding: 4,
    sparsity: 0.1,
    simplicity: 0.15
  },
  rough: {
    rows: 10,
    xStep: 1,
    baseAmplitude: 120,
    baseFrequency: 0.012,
    regionJitter: 0.7,
    pointJitter: 0.9,
    styleEnergy: 0.8,
    styleContrast: 0.8,
    styleTexture: 0.85,
    strokeWidth: 1.0,
    gridCols: 20,
    gridRows: 30,
    rowsPerTile: 1,
    tilePadding: 2,
    sparsity: 0.05,
    simplicity: 0.08
  }
};

export function resolvePreset(name) {
  if (!name) return PRESETS.balanced;
  const key = String(name).toLowerCase();
  return PRESETS[key] || PRESETS.balanced;
}

export function listPresetNames() {
  return Object.keys(PRESETS);
}
