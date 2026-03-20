import fs from "node:fs/promises";
import path from "node:path";
import { generateWaveSvg } from "./generator.js";
import { listPresetNames } from "./presets.js";
import { buildConfigFromRaw } from "./params.js";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function numberArg(args, key, fallback) {
  const raw = args[key];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function outputName(baseOut, seed) {
  const parsed = path.parse(baseOut);
  const file = parsed.ext ? `${parsed.name}-seed-${seed}${parsed.ext}` : `${parsed.base}-seed-${seed}.svg`;
  return path.join(parsed.dir || ".", file);
}

async function writeOne(args, seed, outPath) {
  const presetName = String(args.preset || "balanced");
  const config = buildConfigFromRaw({
    presetName,
    raw: {
      seed,
      mode: args.mode,
      width: args.width,
      height: args.height,
      margin: args.margin,
      rows: args.rows,
      xStep: args.xStep,
      baseAmplitude: args.amp,
      baseFrequency: args.freq,
      regionJitter: args.regionJitter,
      pointJitter: args.pointJitter,
      styleEnergy: args.energy,
      styleContrast: args.contrast,
      styleTexture: args.texture,
      strokeWidth: args.strokeWidth,
      gridCols: args.gridCols,
      gridRows: args.gridRows,
      rowsPerTile: args.rowsPerTile,
      tilePadding: args.tilePadding
    }
  });
  const svg = generateWaveSvg(config);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, svg, "utf8");
  return { seed: config.seed, outPath, presetName };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(
      [
        "Usage: node src/cli.js [options]",
        "",
        "Options:",
        "  --seed <n>           Single seed (default: 1)",
        "  --mode <name>        grid | rows (default: grid)",
        "  --preset <name>      calm | balanced | rough (default: balanced)",
        "  --gridCols <n>       Grid columns in grid mode",
        "  --gridRows <n>       Grid rows in grid mode",
        "  --rowsPerTile <n>    Row count inside each tile",
        "  --tilePadding <n>    Gap between tiles",
        "  --energy <0..1>      Macro: waveform intensity",
        "  --contrast <0..1>    Macro: block contrast strength",
        "  --texture <0..1>     Macro: fine-grain roughness",
        "  --batch              Enable seed range generation",
        "  --seedStart <n>      First seed for batch (default: --seed or 1)",
        "  --count <n>          Number of outputs in batch (default: 8)",
        "  --out <path>         Output path (single) or batch base name",
        "  --help               Show this message",
        "",
        `Available presets: ${listPresetNames().join(", ")}`
      ].join("\n") + "\n"
    );
    return;
  }

  const out = String(args.out || "output/waves.svg");
  if (args.batch) {
    const startSeed = numberArg(args, "seedStart", numberArg(args, "seed", 1));
    const count = Math.max(1, Math.floor(numberArg(args, "count", 8)));
    for (let i = 0; i < count; i += 1) {
      const seed = startSeed + i;
      const outPath = outputName(out, seed);
      const result = await writeOne(args, seed, outPath);
      process.stdout.write(`Generated ${result.outPath} (seed=${result.seed}, preset=${result.presetName})\n`);
    }
    return;
  }

  const seed = numberArg(args, "seed", 1);
  const result = await writeOne(args, seed, out);
  process.stdout.write(`Generated ${result.outPath} (seed=${result.seed}, preset=${result.presetName})\n`);
}

main().catch((error) => {
  process.stderr.write(`${error?.stack || error}\n`);
  process.exit(1);
});
