const { CaptureConsole, ExtraErrorData } = require('@sentry/integrations');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const express = require('express');

const app = express();
const sentry = express.Router();
const { SENTRY_DSN } = process.env;

sentry.use(Sentry.Handlers.requestHandler());

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
    new ExtraErrorData({ depth: 10 }),
    // new ExtraErrorData({ depth: 10 }),
    new CaptureConsole(
      {
        levels: ['error'], // defaults to ['log', 'info', 'warn', 'error', 'debug', 'assert']
      },
    )],
  attachStacktrace: true, // attach stack traces to exceptions and messages
  debug: true, // attempt to print out useful debugging information if something goes wrong
  tracesSampleRate: 1.0, // defaults to 1.0
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
sentry.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
sentry.use(Sentry.Handlers.tracingHandler());

// The error handler must be before any other error middleware and after all controllers
sentry.use(Sentry.Handlers.errorHandler());

module.exports = sentry;
