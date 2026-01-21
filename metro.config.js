// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add resolver to handle Node.js core modules that rss-parser tries to import
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    // Provide empty implementations for Node.js core modules
    // Since we're using axios for HTTP requests, these aren't needed
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    url: require.resolve('url/'),
    stream: require.resolve('readable-stream'),
    buffer: require.resolve('buffer/'),
    timers: require.resolve('timers-browserify'),
  },
};

module.exports = config;
