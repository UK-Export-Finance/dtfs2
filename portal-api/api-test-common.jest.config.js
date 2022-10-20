module.exports = {
  testTimeout: 10000,
  setupFilesAfterEnv: ['./api-test-setup.jest.config.js'],
  // reporters: ['default', ['jest-slow-test-reporter', { numTests: 8, warnOnSlowerThan: 600, color: true }]],
};
