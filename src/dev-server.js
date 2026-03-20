import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateWaveSvg } from "./generator.js";
import { listPresetNames, PRESETS } from "./presets.js";
import { buildConfigFromRaw, PARAM_DEFS } from "./params.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const port = Number(process.env.PORT || 5173);

function buildConfig(params) {
  const presetName = String(params.get("preset") || "balanced");
  return buildConfigFromRaw({
    presetName,
    raw: {
      seed: params.get("seed"),
      mode: params.get("mode"),
      width: params.get("width"),
      height: params.get("height"),
      margin: params.get("margin"),
      rows: params.get("rows"),
      xStep: params.get("xStep"),
      baseAmplitude: params.get("amp"),
      baseFrequency: params.get("freq"),
      regionJitter: params.get("regionJitter"),
      pointJitter: params.get("pointJitter"),
      styleEnergy: params.get("energy"),
      styleContrast: params.get("contrast"),
      styleTexture: params.get("texture"),
      strokeWidth: params.get("strokeWidth"),
      gridCols: params.get("gridCols"),
      gridRows: params.get("gridRows"),
      rowsPerTile: params.get("rowsPerTile"),
      tilePadding: params.get("tilePadding"),
      sparsity: params.get("sparsity"),
      simplicity: params.get("simplicity")
    }
  });
}

async function serveFile(res, filePath, contentType) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || `localhost:${port}`}`);

  if (url.pathname === "/api/presets") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ presets: listPresetNames(), values: PRESETS }));
    return;
  }

  if (url.pathname === "/api/constraints") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ params: PARAM_DEFS }));
    return;
  }

  if (url.pathname === "/api/svg") {
    const config = buildConfig(url.searchParams);
    const svg = generateWaveSvg(config);
    res.writeHead(200, { "Content-Type": "image/svg+xml; charset=utf-8" });
    res.end(svg);
    return;
  }

  if (url.pathname === "/") {
    await serveFile(res, path.join(publicDir, "index.html"), "text/html; charset=utf-8");
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

server.listen(port, () => {
  process.stdout.write(`Waves dev server running at http://localhost:${port}\n`);
});
