import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const reiconRoot = fs.realpathSync(
  path.join(projectRoot, "node_modules", "reicon-react-native"),
);
const androidAssetDirectory = path.join(
  projectRoot,
  "src",
  "presentation",
  "assets",
  "reicon-menu-icons",
);
const iosAssetDirectory = path.join(projectRoot, "assets", "native-menu-icons");

const menuIcons = [
  {
    assetName: "PicalAlignCenter",
    fileName: "align-center",
    sourceFile: path.join(reiconRoot, "icons", "TextalignCenter.js"),
  },
  {
    assetName: "PicalAlignLeft",
    fileName: "align-left",
    sourceFile: path.join(reiconRoot, "icons", "TextalignLeft.js"),
  },
  {
    assetName: "PicalAlignRight",
    fileName: "align-right",
    sourceFile: path.join(reiconRoot, "icons", "TextalignRight.js"),
  },
  {
    assetName: "PicalBold",
    fileName: "bold",
    sourceFile: path.join(reiconRoot, "icons", "Bold.js"),
  },
  {
    assetName: "PicalClipboard",
    fileName: "clipboard",
    sourceFile: path.join(reiconRoot, "icons", "Clipboard.js"),
  },
  {
    assetName: "PicalGallery",
    fileName: "gallery",
    sourceFile: path.join(reiconRoot, "icons", "Gallery.js"),
  },
  {
    assetName: "PicalItalic",
    fileName: "italic",
    sourceFile: path.join(reiconRoot, "icons", "Italic.js"),
  },
  {
    assetName: "PicalLayersArrowDown",
    fileName: "layers-arrow-down",
    sourceFile: path.join(
      projectRoot,
      "src",
      "presentation",
      "components",
      "atoms",
      "reicon-icons",
      "layers-arrow-down.ts",
    ),
  },
  {
    assetName: "PicalLayersArrowUp",
    fileName: "layers-arrow-up",
    sourceFile: path.join(
      projectRoot,
      "src",
      "presentation",
      "components",
      "atoms",
      "reicon-icons",
      "layers-arrow-up.ts",
    ),
  },
  {
    assetName: "PicalUnderline",
    fileName: "underline",
    sourceFile: path.join(reiconRoot, "icons", "Underline.js"),
  },
];

fs.mkdirSync(androidAssetDirectory, { recursive: true });
fs.mkdirSync(iosAssetDirectory, { recursive: true });

for (const icon of menuIcons) {
  const markup = readOutlineMarkup(icon.sourceFile);

  writeAndroidVectorDrawable(icon.fileName, markup);
  writeIosImageSet(icon.assetName, icon.fileName, markup);
  fs.rmSync(path.join(androidAssetDirectory, `${icon.fileName}.png`), {
    force: true,
  });
}

console.log(`Generated ${menuIcons.length} native menu icon pairs.`);

function readOutlineMarkup(sourceFile) {
  const source = fs.readFileSync(sourceFile, "utf8");
  const match = source.match(/\bO:\s*`([\s\S]*?)`/);

  if (!match) {
    throw new Error(
      `Could not find the Reicon outline markup in ${sourceFile}`,
    );
  }

  return match[1];
}

function writeAndroidVectorDrawable(fileName, markup) {
  const paths = Array.from(markup.matchAll(/<path\s+([^>]*?)\s*\/>/g));

  if (paths.length === 0) {
    throw new Error(`Could not find an SVG path for ${fileName}`);
  }

  const pathElements = paths.map(([, rawAttributes]) => {
    const attributes = Object.fromEntries(
      Array.from(rawAttributes.matchAll(/([\w-]+)="([^"]*)"/g), (match) => [
        match[1],
        match[2],
      ]),
    );
    const vectorAttributes = [
      `android:pathData="${attributes.d}"`,
      attributes.fill === "none"
        ? 'android:fillColor="#00000000"'
        : 'android:fillColor="#FF000000"',
    ];

    if (attributes["fill-rule"] === "evenodd") {
      vectorAttributes.push('android:fillType="evenOdd"');
    }
    if (attributes.stroke && attributes.stroke !== "none") {
      vectorAttributes.push('android:strokeColor="#FF000000"');
    }
    if (attributes["stroke-width"]) {
      vectorAttributes.push(
        `android:strokeWidth="${attributes["stroke-width"]}"`,
      );
    }
    if (attributes["stroke-linecap"]) {
      vectorAttributes.push(
        `android:strokeLineCap="${attributes["stroke-linecap"]}"`,
      );
    }
    if (attributes["stroke-linejoin"]) {
      vectorAttributes.push(
        `android:strokeLineJoin="${attributes["stroke-linejoin"]}"`,
      );
    }

    return `  <path\n    ${vectorAttributes.join("\n    ")} />`;
  });
  const vectorDrawable = [
    '<vector xmlns:android="http://schemas.android.com/apk/res/android"',
    '  android:width="24dp"',
    '  android:height="24dp"',
    '  android:viewportWidth="24"',
    '  android:viewportHeight="24">',
    ...pathElements,
    "</vector>",
    "",
  ].join("\n");

  fs.writeFileSync(
    path.join(androidAssetDirectory, `${fileName}.xml`),
    vectorDrawable,
  );
}

function writeIosImageSet(assetName, fileName, markup) {
  const imageSetDirectory = path.join(
    iosAssetDirectory,
    `${assetName}.imageset`,
  );
  const svgFileName = `${fileName}.svg`;
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">',
    markup.replaceAll("currentColor", "#000000"),
    "</svg>",
    "",
  ].join("\n");
  const contents = {
    images: [{ filename: svgFileName, idiom: "universal" }],
    info: { author: "xcode", version: 1 },
    properties: {
      "preserves-vector-representation": true,
      "template-rendering-intent": "template",
    },
  };

  fs.rmSync(imageSetDirectory, { force: true, recursive: true });
  fs.mkdirSync(imageSetDirectory, { recursive: true });
  fs.writeFileSync(path.join(imageSetDirectory, svgFileName), svg);
  fs.writeFileSync(
    path.join(imageSetDirectory, "Contents.json"),
    `${JSON.stringify(contents, null, 2)}\n`,
  );
}
