const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add additional asset extensions
config.resolver.assetExts.push("cjs");

// Platform-specific module resolution
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle react-native-maps for web platform
  if (platform === "web" && moduleName.includes("react-native-maps")) {
    return {
      filePath: require.resolve("react-native-web-maps"),
      type: "sourceFile",
    };
  }

  // Handle native-only modules for web platform
  if (
    platform === "web" &&
    moduleName.includes(
      "react-native/Libraries/Utilities/codegenNativeCommands"
    )
  ) {
    return {
      filePath: require.resolve("./empty-module.js"),
      type: "sourceFile",
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
