const DEFAULTS = {
  width: 900,
  height: 900,
  margin: 48,
  rows: 42,
  xStep: 3,
  baseAmplitude: 4.5,
  baseFrequency: 0.065,
  regionJitter: 0.45,
  pointJitter: 0.65,
  strokeWidth: 1
};

function createRng(seedInput) {
  let seed = Number(seedInput);
  if (!Number.isFinite(seed)) {
    seed = 1;
  }
  let state = (seed >>> 0) || 1;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function rangeMap(value, inMin, inMax, outMin, outMax) {
  const t = (value - inMin) / (inMax - inMin || 1);
  return outMin + t * (outMax - outMin);
}

function buildRegions(rng, width, height, margin) {
  const drawableWidth = width - margin * 2;
  const drawableHeight = height - margin * 2;
  const regionCount = 3 + Math.floor(rng() * 4);
  const regions = [];

  for (let i = 0; i < regionCount; i += 1) {
    const rw = rangeMap(rng(), 0, 1, drawableWidth * 0.25, drawableWidth * 0.7);
    const rh = rangeMap(rng(), 0, 1, drawableHeight * 0.2, drawableHeight * 0.6);
    const rx = margin + rng() * (drawableWidth - rw);
    const ry = margin + rng() * (drawableHeight - rh);
    regions.push({
      x1: rx,
      y1: ry,
      x2: rx + rw,
      y2: ry + rh,
      ampBoost: rangeMap(rng(), 0, 1, 1.15, 2.2),
      freqShift: rangeMap(rng(), 0, 1, -0.02, 0.03),
      roughBoost: rangeMap(rng(), 0, 1, 0.2, 0.75)
    });
  }
  return regions;
}

function pointInRegion(x, y, region) {
  return x >= region.x1 && x <= region.x2 && y >= region.y1 && y <= region.y2;
}

function waveformPath({
  yBase,
  width,
  margin,
  xStep,
  amplitude,
  frequency,
  jitter,
  phase,
  rng
}) {
  const left = margin;
  const right = width - margin;
  let d = "";

  for (let x = left; x <= right; x += xStep) {
    const sine = Math.sin(x * frequency + phase);
    const micro = Math.sin(x * (frequency * 3.8) + phase * 1.9) * 0.3;
    const randomJitter = (rng() * 2 - 1) * jitter;
    const y = yBase + sine * amplitude + micro * amplitude + randomJitter;
    d += x === left ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

export function generateWaveSvg(userConfig = {}) {
  const config = { ...DEFAULTS, ...userConfig };
  const rng = createRng(config.seed ?? 1);
  const regions = buildRegions(rng, config.width, config.height, config.margin);
  const innerHeight = config.height - config.margin * 2;
  const rowStep = innerHeight / Math.max(1, config.rows - 1);
  const lines = [];

  for (let row = 0; row < config.rows; row += 1) {
    const yBase = config.margin + row * rowStep;
    let amplitude = config.baseAmplitude * rangeMap(rng(), 0, 1, 0.7, 1.35);
    let frequency = config.baseFrequency + rangeMap(rng(), 0, 1, -0.015, 0.018);
    let jitter = config.pointJitter * rangeMap(rng(), 0, 1, 0.4, 1.15);

    for (const region of regions) {
      const probeX = config.margin + rng() * (config.width - config.margin * 2);
      if (pointInRegion(probeX, yBase, region)) {
        amplitude *= region.ampBoost;
        frequency += region.freqShift;
        jitter += region.roughBoost * config.regionJitter;
      }
    }

    const path = waveformPath({
      yBase,
      width: config.width,
      margin: config.margin,
      xStep: config.xStep,
      amplitude,
      frequency: Math.max(0.01, frequency),
      jitter,
      phase: rng() * Math.PI * 2,
      rng
    });

    lines.push(`<path d="${path}" />`);
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${config.width} ${config.height}" width="${config.width}" height="${config.height}">`,
    `  <rect x="0" y="0" width="${config.width}" height="${config.height}" fill="white" />`,
    `  <g fill="none" stroke="black" stroke-width="${config.strokeWidth}" stroke-linecap="round" stroke-linejoin="round">`,
    ...lines.map((line) => `    ${line}`),
    "  </g>",
    "</svg>"
  ].join("\n");
}
