const { withEntitlementsPlist } = require("@expo/config-plugins");

/**
 * Local notifications do not require the remote push entitlement.
 * Removing it allows development builds to be signed by a Personal Team.
 */
module.exports = function withRemoveIosPushEntitlement(config) {
  return withEntitlementsPlist(config, (modConfig) => {
    delete modConfig.modResults["aps-environment"];
    return modConfig;
  });
};
