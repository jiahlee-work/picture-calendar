const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const src = path.join(root, "src");
const layers = ["presentation", "application", "infrastructure"];
const rank = new Map(layers.map((layer, index) => [layer, index]));
const importPattern = /(?:import|export)\s+(?:[^'"]*from\s+)?["']([^"']+)["']|require\(["']([^"']+)["']\)/g;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

function layerFor(file) {
  const relative = path.relative(src, file).split(path.sep);
  return layers.includes(relative[0]) ? relative[0] : null;
}

function resolveImport(fromFile, specifier) {
  if (!specifier.startsWith("@/") && !specifier.startsWith(".")) return null;

  const base = specifier.startsWith("@/")
    ? path.join(src, specifier.slice(2))
    : path.resolve(path.dirname(fromFile), specifier);

  const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

const violations = [];

for (const file of walk(src)) {
  const sourceLayer = layerFor(file);
  if (!sourceLayer) continue;

  const contents = fs.readFileSync(file, "utf8");
  for (const match of contents.matchAll(importPattern)) {
    const target = resolveImport(file, match[1] ?? match[2]);
    if (!target) continue;

    const targetLayer = layerFor(target);
    if (!targetLayer) continue;

    if (rank.get(sourceLayer) > rank.get(targetLayer)) {
      violations.push(`${path.relative(root, file)} imports ${path.relative(root, target)}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Architecture boundary violations:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Architecture boundary check passed.");
