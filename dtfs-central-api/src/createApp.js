const { setupChangeStream } = require('./services/changeStream/setupChangeStream');
const { generateApp } = require('./generateApp');

if (process.env.CHANGE_STREAM_ENABLED === 'true') {
  // This sets up the change stream for the database to send audit events to the audit API
  setupChangeStream();
}

const app = generateApp();

module.exports = app;
