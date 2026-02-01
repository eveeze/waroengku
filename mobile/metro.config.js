const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Fix for web bundling - ensure proper resolution
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Add polyfill for import.meta on web
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer?.minifierConfig,
    keep_fnames: true,
  },
};

// Ensure web-specific configuration
config.resolver.resolverMainFields = ['browser', 'main', 'module'];

module.exports = withNativeWind(config, { input: './global.css' });
