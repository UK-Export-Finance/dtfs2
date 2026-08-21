module.exports = {
  // Dependencies are hoisted to the repository root by npm workspaces. Jest
  // resolves presets relative to this package's rootDir, so use absolute
  // package paths to support the hoisted layout.
  preset: require.resolve('ts-jest/jest-preset.js'),
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': require.resolve('babel-jest'),
  },
  transform: {
    '^.+\\.js$': require.resolve('babel-jest'),
    '^.+\\.ts$': require.resolve('ts-jest'),
  },
};
