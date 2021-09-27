const { CaptureConsole } = require('@sentry/integrations');
const Sentry = require('@sentry/node');
const express = require('express');

const sentry = express.Router();
const { SENTRY_DSN } = process.env;

sentry.use(Sentry.Handlers.requestHandler());

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [new CaptureConsole(
    {
      // array of methods that should be captured
      // defaults to ['log', 'info', 'warn', 'error', 'debug', 'assert']
      levels: ['log', 'error'],
    },
  )],
  tracesSampleRate: 1.0,
});

sentry.use(Sentry.Handlers.errorHandler());

module.exports = sentry;
