import { buildConfigFromRaw } from "./params.js";

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

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function buildContour(rng, width, config) {
  const points = [];
  const segmentCount = 3 + Math.floor(rng() * 6);
  const segWidth = width / segmentCount;

  const shapeType = pick(rng, [
    "plateau-drop", "plateau-drop",
    "spike-cluster",
    "smooth-swoop", "smooth-swoop",
    "jagged-shelf",
    "asymmetric-bump",
    "staircase",
    "sawtooth-drift"
  ]);

  let x = 0;
  while (x < width) {
    const remaining = width - x;
    const chunk = Math.min(remaining, segWidth * rangeMap(rng(), 0, 1, 0.4, 1.8));
    if (chunk < 1) break;

    const intensity = config.styleEnergy;
    const maxDeflection = config.baseAmplitude * (0.6 + intensity * 1.4);

    let segPoints;
    switch (shapeType) {
      case "plateau-drop":
        segPoints = genPlateauDrop(rng, x, chunk, maxDeflection, config);
        break;
      case "spike-cluster":
        segPoints = genSpikeCluster(rng, x, chunk, maxDeflection, config);
        break;
      case "smooth-swoop":
        segPoints = genSmoothSwoop(rng, x, chunk, maxDeflection, config);
        break;
      case "jagged-shelf":
        segPoints = genJaggedShelf(rng, x, chunk, maxDeflection, config);
        break;
      case "asymmetric-bump":
        segPoints = genAsymmetricBump(rng, x, chunk, maxDeflection, config);
        break;
      case "staircase":
        segPoints = genStaircase(rng, x, chunk, maxDeflection, config);
        break;
      case "sawtooth-drift":
        segPoints = genSawtoothDrift(rng, x, chunk, maxDeflection, config);
        break;
      default:
        segPoints = genSmoothSwoop(rng, x, chunk, maxDeflection, config);
    }

    points.push(...segPoints);
    x += chunk;
  }

  return applyTexture(rng, points, config);
}

function applyTexture(rng, points, config) {
  const t = config.styleTexture;
  if (points.length < 2 || t < 0.01) return points;

  const amp = config.baseAmplitude;
  const roughScale = t * t * amp * 0.6;
  const quantStep = t > 0.4 ? amp * rangeMap(t, 0.4, 1, 0.15, 0.5) : 0;

  const out = [];
  for (let i = 0; i < points.length; i++) {
    let { x, y } = points[i];

    y += (rng() * 2 - 1) * roughScale;

    if (quantStep > 0.5) {
      y = Math.round(y / quantStep) * quantStep;
    }

    out.push({ x, y });
  }

  if (t > 0.6 && out.length > 4) {
    const skipRate = rangeMap(t, 0.6, 1, 0.02, 0.12);
    return out.filter(() => rng() > skipRate);
  }

  return out;
}

function genPlateauDrop(rng, xStart, width, maxD, config) {
  const pts = [];
  const step = Math.max(1, config.xStep);
  const flatLevel = (rng() * 0.3) * maxD * (rng() < 0.5 ? 1 : -1);
  const dropX = xStart + width * rangeMap(rng(), 0, 1, 0.15, 0.75);
  const dropDepth = maxD * rangeMap(rng(), 0, 1, 0.5, 1.0) * (rng() < 0.5 ? 1 : -1);
  const dropWidth = width * rangeMap(rng(), 0, 1, 0.08, 0.35);
  const edgeNoise = config.styleTexture * maxD * 0.12;

  for (let x = xStart; x < xStart + width; x += step) {
    const distToDrop = Math.abs(x - dropX);
    const inDrop = distToDrop < dropWidth / 2;
    const dropBlend = inDrop ? Math.pow(1 - distToDrop / (dropWidth / 2), 1.8) : 0;
    const noise = (rng() * 2 - 1) * edgeNoise;
    pts.push({ x, y: flatLevel + dropBlend * dropDepth + noise });
  }
  return pts;
}

function genSpikeCluster(rng, xStart, width, maxD, config) {
  const pts = [];
  const step = Math.max(0.8, config.xStep * 0.6);
  const spikeCount = 4 + Math.floor(rng() * 12);
  const spikes = [];
  for (let i = 0; i < spikeCount; i++) {
    spikes.push({
      cx: xStart + rng() * width,
      height: maxD * rangeMap(rng(), 0, 1, 0.15, 0.85) * (rng() < 0.5 ? 1 : -1),
      sharpness: rangeMap(rng(), 0, 1, 1.5, 8)
    });
  }
  const baseNoise = config.styleTexture * maxD * 0.08;

  for (let x = xStart; x < xStart + width; x += step) {
    let y = 0;
    for (const spike of spikes) {
      const dist = Math.abs(x - spike.cx);
      y += spike.height * Math.exp(-dist * spike.sharpness * 0.02);
    }
    y += (rng() * 2 - 1) * baseNoise;
    pts.push({ x, y });
  }
  return pts;
}

function genSmoothSwoop(rng, xStart, width, maxD, config) {
  const pts = [];
  const step = Math.max(1, config.xStep);
  const freq1 = rangeMap(rng(), 0, 1, 0.003, 0.018);
  const freq2 = rangeMap(rng(), 0, 1, 0.008, 0.04);
  const amp1 = maxD * rangeMap(rng(), 0, 1, 0.4, 1.0);
  const amp2 = maxD * rangeMap(rng(), 0, 1, 0.1, 0.4);
  const phase1 = rng() * Math.PI * 2;
  const phase2 = rng() * Math.PI * 2;
  const tilt = (rng() * 2 - 1) * maxD * 0.3 / Math.max(1, width);
  const edgeNoise = config.styleTexture * maxD * 0.06;

  for (let x = xStart; x < xStart + width; x += step) {
    const lx = x - xStart;
    const y = Math.sin(lx * freq1 + phase1) * amp1 +
              Math.sin(lx * freq2 + phase2) * amp2 +
              lx * tilt +
              (rng() * 2 - 1) * edgeNoise;
    pts.push({ x, y });
  }
  return pts;
}

function genJaggedShelf(rng, xStart, width, maxD, config) {
  const pts = [];
  const step = Math.max(0.7, config.xStep * 0.5);
  const shelfY = maxD * rangeMap(rng(), 0, 1, 0.2, 0.6) * (rng() < 0.5 ? 1 : -1);
  const jagFreq = rangeMap(rng(), 0, 1, 0.05, 0.2);
  const jagAmp = maxD * rangeMap(rng(), 0, 1, 0.08, 0.35) * (1 + config.styleTexture);
  const onsetX = xStart + width * rangeMap(rng(), 0, 1, 0.05, 0.3);
  const fadeX = xStart + width * rangeMap(rng(), 0, 1, 0.7, 0.95);

  for (let x = xStart; x < xStart + width; x += step) {
    const t = (x - xStart) / width;
    const envelope = t < 0.1 ? t / 0.1 : t > 0.9 ? (1 - t) / 0.1 : 1;
    const inShelf = x > onsetX && x < fadeX;
    const shelf = inShelf ? shelfY : 0;
    const jag = Math.sin(x * jagFreq) * jagAmp * (inShelf ? 1 : 0.2);
    const noise = (rng() * 2 - 1) * jagAmp * 0.4 * config.styleTexture;
    pts.push({ x, y: (shelf + jag + noise) * envelope });
  }
  return pts;
}

function genAsymmetricBump(rng, xStart, width, maxD, config) {
  const pts = [];
  const step = Math.max(1, config.xStep);
  const peakX = xStart + width * rangeMap(rng(), 0, 1, 0.2, 0.8);
  const peakH = maxD * rangeMap(rng(), 0, 1, 0.5, 1.0) * (rng() < 0.5 ? 1 : -1);
  const riseRate = rangeMap(rng(), 0, 1, 1.5, 6);
  const fallRate = rangeMap(rng(), 0, 1, 1.5, 6);
  const edgeNoise = config.styleTexture * maxD * 0.1;

  for (let x = xStart; x < xStart + width; x += step) {
    const dx = x - peakX;
    const rate = dx < 0 ? riseRate : fallRate;
    const y = peakH * Math.exp(-Math.abs(dx) * rate * 0.008) +
              (rng() * 2 - 1) * edgeNoise;
    pts.push({ x, y });
  }
  return pts;
}

function genStaircase(rng, xStart, width, maxD, config) {
  const pts = [];
  const step = Math.max(0.8, config.xStep * 0.7);
  const stairCount = 2 + Math.floor(rng() * 5);
  const stairs = [];
  let cumX = xStart;
  for (let i = 0; i < stairCount; i++) {
    const sw = (width / stairCount) * rangeMap(rng(), 0, 1, 0.5, 1.5);
    const level = maxD * rangeMap(rng(), 0, 1, -0.8, 0.8);
    stairs.push({ x1: cumX, x2: cumX + sw, level });
    cumX += sw;
  }
  const edgeNoise = config.styleTexture * maxD * 0.08;

  for (let x = xStart; x < xStart + width; x += step) {
    let y = 0;
    for (const s of stairs) {
      if (x >= s.x1 && x < s.x2) { y = s.level; break; }
    }
    y += (rng() * 2 - 1) * edgeNoise;
    pts.push({ x, y });
  }
  return pts;
}

function genSawtoothDrift(rng, xStart, width, maxD, config) {
  const pts = [];
  const step = Math.max(1, config.xStep);
  const teethCount = 2 + Math.floor(rng() * 5);
  const toothWidth = width / teethCount;
  const direction = rng() < 0.5 ? 1 : -1;
  const drift = (rng() * 2 - 1) * maxD * 0.2 / Math.max(1, width);
  const edgeNoise = config.styleTexture * maxD * 0.1;

  for (let x = xStart; x < xStart + width; x += step) {
    const lx = x - xStart;
    const toothPhase = (lx % toothWidth) / toothWidth;
    const sawY = (toothPhase * 2 - 1) * maxD * rangeMap(rng(), 0, 1, 0.2, 0.6) * direction;
    pts.push({ x, y: sawY + lx * drift + (rng() * 2 - 1) * edgeNoise });
  }
  return pts;
}

function drawFilledPixelWaveRows(config, rng, bounds) {
  const shapes = [];
  const rows = config.rows;
  const rowStep = rows > 1 ? bounds.height / (rows + 1) : bounds.height * 0.5;
  const artifactRegions = buildArtifactRegions(rng, bounds.width, bounds.height);
  const maxDeflectionBudget = rowStep * 0.44;

  for (let row = 0; row < rows; row += 1) {
    const yBase = bounds.y + (row + 1) * rowStep;
    const polarity = rng() < 0.5 ? -1 : 1;

    const shapeWidth = bounds.width * rangeMap(rng(), 0, 1, 0.22, 0.55);
    const shapeCenter = bounds.width * rangeMap(rng(), 0, 1, 0.35, 0.65);
    const shapeLeft = Math.max(0, shapeCenter - shapeWidth / 2);
    const shapeRight = Math.min(bounds.width, shapeCenter + shapeWidth / 2);
    const actualWidth = shapeRight - shapeLeft;

    const localConfig = {
      ...config,
      baseAmplitude: Math.min(config.baseAmplitude, maxDeflectionBudget)
    };
    const contour = buildContour(rng, actualWidth, localConfig);

    const edgePoints = [];
    for (const pt of contour) {
      const absX = bounds.x + shapeLeft + pt.x;
      let deflection = pt.y * polarity;

      for (const region of artifactRegions) {
        if (pointInRegion(shapeLeft + pt.x, yBase - bounds.y, region)) {
          deflection *= 1 + 0.4 * config.styleContrast * region.density;
        }
      }

      deflection = Math.max(-maxDeflectionBudget, Math.min(maxDeflectionBudget, deflection));
      edgePoints.push({ x: absX, y: yBase + deflection });
    }

    if (edgePoints.length < 2) continue;

    const x0 = edgePoints[0].x;
    const xN = edgePoints[edgePoints.length - 1].x;

    let d = `M ${x0.toFixed(1)} ${yBase.toFixed(1)}`;
    for (const ep of edgePoints) {
      d += ` L ${ep.x.toFixed(1)} ${ep.y.toFixed(1)}`;
    }
    d += ` L ${xN.toFixed(1)} ${yBase.toFixed(1)} Z`;

    shapes.push(`<path d="${d}" fill="black" />`);
  }

  return shapes;
}

function buildArtifactRegions(rng, width, height) {
  const regions = [];
  const count = 4 + Math.floor(rng() * 4);
  for (let i = 0; i < count; i += 1) {
    const rw = rangeMap(rng(), 0, 1, width * 0.12, width * 0.28);
    const rh = rangeMap(rng(), 0, 1, height * 0.18, height * 0.45);
    const rx = rng() * (width - rw);
    const ry = rng() * (height - rh);
    regions.push({
      x1: rx, y1: ry, x2: rx + rw, y2: ry + rh,
      density: rangeMap(rng(), 0, 1, 0.8, 1.8),
      roughness: rangeMap(rng(), 0, 1, 0.7, 1.7)
    });
  }
  return regions;
}

function pointInRegion(x, y, region) {
  return x >= region.x1 && x <= region.x2 && y >= region.y1 && y <= region.y2;
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
      x1: rx, y1: ry, x2: rx + rw, y2: ry + rh,
      ampBoost: rangeMap(rng(), 0, 1, 1.15, 2.2),
      freqShift: rangeMap(rng(), 0, 1, -0.02, 0.03),
      roughBoost: rangeMap(rng(), 0, 1, 0.2, 0.75)
    });
  }
  return regions;
}

function waveformPath({ yBase, xStart, xEnd, xStep, amplitude, frequency, jitter, phase, rng }) {
  let d = "";
  for (let x = xStart; x <= xEnd; x += xStep) {
    const sine = Math.sin(x * frequency + phase);
    const micro = Math.sin(x * (frequency * 3.8) + phase * 1.9) * 0.3;
    const randomJitter = (rng() * 2 - 1) * jitter;
    const y = yBase + sine * amplitude + micro * amplitude + randomJitter;
    d += x === xStart ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

function drawRowField(config, rng, bounds) {
  const regions = buildRegions(rng, bounds.width, bounds.height, 0);
  const rowStep = bounds.height / Math.max(1, config.rows - 1);
  const lines = [];
  for (let row = 0; row < config.rows; row += 1) {
    const yBase = bounds.y + row * rowStep;
    let amplitude = config.baseAmplitude * rangeMap(rng(), 0, 1, 0.7, 1.35);
    let frequency = config.baseFrequency + rangeMap(rng(), 0, 1, -0.015, 0.018);
    let jitter = config.pointJitter * rangeMap(rng(), 0, 1, 0.35, 1.15);
    for (const region of regions) {
      if (pointInRegion(rng() * bounds.width, yBase - bounds.y, region)) {
        amplitude *= region.ampBoost;
        frequency += region.freqShift;
        jitter += region.roughBoost * config.regionJitter;
      }
    }
    const path = waveformPath({
      yBase, xStart: bounds.x, xEnd: bounds.x + bounds.width, xStep: config.xStep,
      amplitude, frequency: Math.max(0.01, frequency), jitter,
      phase: rng() * Math.PI * 2, rng
    });
    lines.push(`<path d="${path}" />`);
  }
  return lines;
}

function simpleShape(rng, cx, cy, w, h) {
  const kind = Math.floor(rng() * 6);
  const hw = w * rangeMap(rng(), 0, 1, 0.2, 0.7);
  const hh = h * rangeMap(rng(), 0, 1, 0.04, 0.18);

  switch (kind) {
    case 0: {
      const x1 = cx - hw / 2;
      return `<rect x="${x1.toFixed(1)}" y="${(cy - hh / 2).toFixed(1)}" width="${hw.toFixed(1)}" height="${hh.toFixed(1)}" fill="black" />`;
    }
    case 1: {
      const r = Math.min(hw, hh) * rangeMap(rng(), 0, 1, 0.3, 0.8);
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="black" />`;
    }
    case 2: {
      const x1 = cx - hw / 2;
      const x2 = cx + hw / 2;
      const sw = hh * rangeMap(rng(), 0, 1, 0.5, 2);
      return `<line x1="${x1.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${cy.toFixed(1)}" stroke="black" stroke-width="${sw.toFixed(1)}" />`;
    }
    case 3: {
      const th = h * rangeMap(rng(), 0, 1, 0.1, 0.3);
      const tw = w * rangeMap(rng(), 0, 1, 0.15, 0.4);
      const d = rng() < 0.5
        ? `M ${(cx - tw / 2).toFixed(1)} ${cy.toFixed(1)} L ${(cx + tw / 2).toFixed(1)} ${cy.toFixed(1)} L ${cx.toFixed(1)} ${(cy - th).toFixed(1)} Z`
        : `M ${(cx - tw / 2).toFixed(1)} ${cy.toFixed(1)} L ${(cx + tw / 2).toFixed(1)} ${cy.toFixed(1)} L ${cx.toFixed(1)} ${(cy + th).toFixed(1)} Z`;
      return `<path d="${d}" fill="black" />`;
    }
    case 4: {
      const vw = hh * rangeMap(rng(), 0, 1, 0.3, 1.2);
      const vh = h * rangeMap(rng(), 0, 1, 0.15, 0.35);
      return `<rect x="${(cx - vw / 2).toFixed(1)}" y="${(cy - vh / 2).toFixed(1)}" width="${vw.toFixed(1)}" height="${vh.toFixed(1)}" fill="black" />`;
    }
    default: {
      const count = 2 + Math.floor(rng() * 3);
      const gap = hw / count;
      const dotR = Math.min(gap * 0.3, hh * 0.6);
      let svg = "";
      for (let i = 0; i < count; i++) {
        const dx = cx - hw / 2 + gap * (i + 0.5);
        svg += `<circle cx="${dx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${dotR.toFixed(1)}" fill="black" />`;
      }
      return svg;
    }
  }
}

function drawGridField(config, baseSeed) {
  const shapes = [];
  const innerWidth = config.width - config.margin * 2;
  const innerHeight = config.height - config.margin * 2;
  const cols = config.gridCols;
  const rows = config.gridRows;
  const tileWidth = innerWidth / cols;
  const tileHeight = innerHeight / rows;
  const pad = config.tilePadding;

  const focusCx = ((baseSeed * 3) % cols) / cols;
  const focusCy = ((baseSeed * 7) % rows) / rows;
  const focusR = 0.25 + (((baseSeed * 11) % 100) / 100) * 0.2;

  for (let gy = 0; gy < rows; gy += 1) {
    for (let gx = 0; gx < cols; gx += 1) {
      const tileSeed = baseSeed + (gy * cols + gx) * 997;
      const rng = createRng(tileSeed);
      const roll = rng();

      if (roll < config.sparsity) continue;

      const nx = gx / Math.max(1, cols - 1);
      const ny = gy / Math.max(1, rows - 1);
      const distToFocus = Math.sqrt((nx - focusCx) ** 2 + (ny - focusCy) ** 2);
      const focusBoost = distToFocus < focusR ? rangeMap(distToFocus, 0, focusR, 2.2, 1.0) : 1.0;

      const cellX = config.margin + gx * tileWidth + pad * 0.5;
      const cellY = config.margin + gy * tileHeight + pad * 0.5;
      const w = Math.max(4, tileWidth - pad);
      const h = Math.max(4, tileHeight - pad);
      const cx = cellX + w * 0.5;
      const cy = cellY + h * 0.5;

      if (roll < config.sparsity + config.simplicity) {
        shapes.push(simpleShape(rng, cx, cy, w, h));
        continue;
      }

      const yBase = cy;
      const cellAmpBudget = h * 0.3;
      const localAmp = Math.min(cellAmpBudget, config.baseAmplitude * focusBoost * rangeMap(rng(), 0, 1, 0.15, 0.7));

      const localConfig = {
        ...config,
        baseAmplitude: localAmp,
        xStep: Math.max(0.5, config.xStep * rangeMap(rng(), 0, 1, 0.8, 1.4)),
        styleTexture: config.styleTexture * rangeMap(rng(), 0, 1, 0.6, 1.4)
      };

      const contour = buildContour(rng, w, localConfig);
      if (contour.length < 2) continue;

      const polarity = rng() < 0.5 ? -1 : 1;
      const edgePoints = [];
      for (const pt of contour) {
        const deflection = Math.max(-localAmp, Math.min(localAmp, pt.y * polarity));
        edgePoints.push({ x: cellX + pt.x, y: yBase + deflection });
      }

      const x0 = edgePoints[0].x;
      const xN = edgePoints[edgePoints.length - 1].x;
      let d = `M ${x0.toFixed(1)} ${yBase.toFixed(1)}`;
      for (const ep of edgePoints) {
        d += ` L ${ep.x.toFixed(1)} ${ep.y.toFixed(1)}`;
      }
      d += ` L ${xN.toFixed(1)} ${yBase.toFixed(1)} Z`;
      shapes.push(`<path d="${d}" fill="black" />`);
    }
  }
  return shapes;
}

export function generateWaveSvg(userConfig = {}) {
  const config = buildConfigFromRaw({ presetName: "balanced", raw: userConfig });
  const rng = createRng(config.seed ?? 1);
  const lines =
    config.mode === "grid"
      ? drawGridField(config, config.seed)
      : drawFilledPixelWaveRows(config, rng, {
          x: config.margin, y: config.margin,
          width: config.width - config.margin * 2,
          height: config.height - config.margin * 2
        });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${config.width} ${config.height}" width="${config.width}" height="${config.height}">`,
    `  <rect x="0" y="0" width="${config.width}" height="${config.height}" fill="white" />`,
    `  <g fill="black" stroke="none">`,
    ...lines.map((line) => `    ${line}`),
    "  </g>",
    "</svg>"
  ].join("\n");
}
