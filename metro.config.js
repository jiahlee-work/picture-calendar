// Learn more https://docs.expo.io/guides/customizing-metro
const { withStorybook } = require("@storybook/react-native/withStorybook");

const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

/** @type {import('expo/metro-config').MetroConfig} */
module.exports = withStorybook(config, {
  enabled: process.env.STORYBOOK_ENABLED === "true",
});
