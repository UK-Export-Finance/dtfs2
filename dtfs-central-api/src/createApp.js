const { setupChangeStream } = require('./services/changeStream/setupChangeStream');
const { generateApp } = require('./generateApp');

if (process.env.CHANGE_STREAM_ENABLED === 'true') {
  setupChangeStream();
}

const app = generateApp();

module.exports = app;
