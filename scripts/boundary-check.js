const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = process.cwd();
const src = path.join(root, "src");
const layers = ["presentation", "application", "infrastructure"];
const layerRank = new Map(layers.map((layer, index) => [layer, index]));
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walk(filePath);
    }

    return sourceExtensions.has(path.extname(entry.name)) ? [filePath] : [];
  });
}

function sourceKindFor(filePath) {
  if (filePath.endsWith(".tsx")) {
    return ts.ScriptKind.TSX;
  }

  if (filePath.endsWith(".jsx")) {
    return ts.ScriptKind.JSX;
  }

  if (filePath.endsWith(".js")) {
    return ts.ScriptKind.JS;
  }

  return ts.ScriptKind.TS;
}

function sourceAreaFor(filePath) {
  return path.relative(src, filePath).split(path.sep)[0] ?? null;
}

function resolveImport(fromFile, specifier) {
  if (!specifier.startsWith("@/") && !specifier.startsWith(".")) {
    return null;
  }

  const basePath = specifier.startsWith("@/")
    ? path.join(src, specifier.slice(2))
    : path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    basePath,
    ...Array.from(sourceExtensions, (extension) => `${basePath}${extension}`),
    ...Array.from(sourceExtensions, (extension) =>
      path.join(basePath, `index${extension}`),
    ),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function importSpecifierFor(node) {
  if (
    (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
    node.moduleSpecifier &&
    ts.isStringLiteralLike(node.moduleSpecifier)
  ) {
    return node.moduleSpecifier;
  }

  if (!ts.isCallExpression(node) || node.arguments.length !== 1) {
    return null;
  }

  const [argument] = node.arguments;

  if (!ts.isStringLiteralLike(argument)) {
    return null;
  }

  if (
    node.expression.kind === ts.SyntaxKind.ImportKeyword ||
    (ts.isIdentifier(node.expression) && node.expression.text === "require")
  ) {
    return argument;
  }

  return null;
}

function isLayerDirectionViolation(sourceArea, targetArea) {
  if (sourceArea === "shared") {
    return layers.includes(targetArea);
  }

  if (sourceArea === "env") {
    return layers.includes(targetArea) || targetArea === "shared";
  }

  if (!layerRank.has(sourceArea) || !layerRank.has(targetArea)) {
    return false;
  }

  return layerRank.get(sourceArea) > layerRank.get(targetArea);
}

function isReusableComponentImportingFeature(sourceFile, targetFile) {
  const componentsRoot = path.join(src, "presentation", "components");
  const featuresRoot = path.join(src, "presentation", "features");

  return (
    sourceFile.startsWith(`${componentsRoot}${path.sep}`) &&
    targetFile.startsWith(`${featuresRoot}${path.sep}`)
  );
}

function locationFor(sourceFile, node) {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart());

  return {
    column: position.character + 1,
    line: position.line + 1,
  };
}

function addViolation(violations, sourceFile, node, message) {
  const { column, line } = locationFor(sourceFile, node);

  violations.push(
    `${path.relative(root, sourceFile.fileName)}:${line}:${column} ${message}`,
  );
}

const violations = [];

for (const filePath of walk(src)) {
  const contents = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    contents,
    ts.ScriptTarget.Latest,
    true,
    sourceKindFor(filePath),
  );
  const sourceArea = sourceAreaFor(filePath);

  if (sourceArea !== "env") {
    const processEnvPattern = /\bprocess\.env\b/g;

    for (const match of contents.matchAll(processEnvPattern)) {
      const node = {
        getStart: () => match.index,
      };

      addViolation(
        violations,
        sourceFile,
        node,
        "must read environment variables through @/env",
      );
    }
  }

  function inspect(node) {
    const specifierNode = importSpecifierFor(node);

    if (specifierNode) {
      const specifier = specifierNode.text;
      const target = resolveImport(filePath, specifier);

      if (specifier.startsWith(".") && target?.startsWith(src)) {
        addViolation(
          violations,
          sourceFile,
          specifierNode,
          `must use the @/ alias instead of "${specifier}"`,
        );
      }

      if (target) {
        const targetArea = sourceAreaFor(target);
        const targetPath = path.relative(root, target);

        if (isLayerDirectionViolation(sourceArea, targetArea)) {
          addViolation(
            violations,
            sourceFile,
            specifierNode,
            `imports forbidden lower-to-higher target "${specifier}" (${targetPath})`,
          );
        }

        if (isReusableComponentImportingFeature(filePath, target)) {
          addViolation(
            violations,
            sourceFile,
            specifierNode,
            `reusable components must not import feature target "${specifier}" (${targetPath})`,
          );
        }
      }
    }

    ts.forEachChild(node, inspect);
  }

  inspect(sourceFile);
}

if (violations.length > 0) {
  console.error("Architecture boundary violations:");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
}

console.log("Architecture boundary check passed.");
