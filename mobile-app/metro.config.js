const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// 1. Watch the shared directory
config.watchFolders = [
  path.resolve(__dirname, '../shared')
];

// 2. Add aliases if needed, though Babel usually handles it
// But for some environments, this helps Metro find the files
config.resolver.extraNodeModules = {
  '@shared': path.resolve(__dirname, '../shared'),
};

module.exports = config;
