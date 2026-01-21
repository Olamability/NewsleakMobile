// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Helper function to safely resolve modules
function safeResolve(moduleName) {
  try {
    return require.resolve(moduleName);
  } catch (error) {
    console.warn(`Warning: Could not resolve module '${moduleName}'. Please run 'npm install' to install dependencies.`);
    return undefined;
  }
}

// Add resolver to handle Node.js core modules that rss-parser tries to import
const extraNodeModules = {
  // Provide empty implementations for Node.js core modules
  // Since we're using axios for HTTP requests, these aren't needed
  http: safeResolve('stream-http'),
  https: safeResolve('https-browserify'),
  url: safeResolve('url/'),
  stream: safeResolve('readable-stream'),
  buffer: safeResolve('buffer/'),
  timers: safeResolve('timers-browserify'),
};

// Filter out undefined values (modules that couldn't be resolved)
const resolvedModules = Object.fromEntries(
  Object.entries(extraNodeModules).filter(([, value]) => value !== undefined)
);

config.resolver = {
  ...config.resolver,
  extraNodeModules: resolvedModules,
};

module.exports = config;
