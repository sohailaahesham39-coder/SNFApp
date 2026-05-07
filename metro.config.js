const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Windows + Node 22 can intermittently crash in jest-worker IPC with
// "Error: write UNKNOWN (errno -4094)". Using a single worker avoids it.
config.maxWorkers = 1;

module.exports = config;

