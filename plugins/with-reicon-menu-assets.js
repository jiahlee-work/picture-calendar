const fs = require("node:fs");
const path = require("node:path");
const { IOSConfig, withDangerousMod } = require("expo/config-plugins");

module.exports = function withReiconMenuAssets(config) {
  return withDangerousMod(config, [
    "ios",
    async (iosConfig) => {
      const { projectRoot } = iosConfig.modRequest;
      const sourceDirectory = path.join(
        projectRoot,
        "assets",
        "native-menu-icons",
      );
      const assetCatalogDirectory = path.join(
        IOSConfig.Paths.getSourceRoot(projectRoot),
        "Images.xcassets",
      );
      const menuAssetDirectories = fs
        .readdirSync(sourceDirectory, { withFileTypes: true })
        .filter(
          (entry) => entry.isDirectory() && entry.name.endsWith(".imageset"),
        )
        .map((entry) => entry.name);

      for (const assetDirectoryName of menuAssetDirectories) {
        fs.cpSync(
          path.join(sourceDirectory, assetDirectoryName),
          path.join(assetCatalogDirectory, assetDirectoryName),
          { recursive: true },
        );
      }

      return iosConfig;
    },
  ]);
};
