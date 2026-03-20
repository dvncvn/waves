import fs from "node:fs/promises";
import path from "node:path";
import { generateWaveSvg } from "./generator.js";

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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const out = String(args.out || "output/waves.svg");

  const config = {
    seed: numberArg(args, "seed", 1),
    width: numberArg(args, "width", 900),
    height: numberArg(args, "height", 900),
    margin: numberArg(args, "margin", 48),
    rows: numberArg(args, "rows", 42),
    xStep: numberArg(args, "xStep", 3),
    baseAmplitude: numberArg(args, "amp", 4.5),
    baseFrequency: numberArg(args, "freq", 0.065),
    regionJitter: numberArg(args, "regionJitter", 0.45),
    pointJitter: numberArg(args, "pointJitter", 0.65),
    strokeWidth: numberArg(args, "strokeWidth", 1)
  };

  const svg = generateWaveSvg(config);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, svg, "utf8");
  process.stdout.write(`Generated ${out} (seed=${config.seed})\n`);
}

main().catch((error) => {
  process.stderr.write(`${error?.stack || error}\n`);
  process.exit(1);
});
