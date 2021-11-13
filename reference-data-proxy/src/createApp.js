const dotenv = require('dotenv');
const express = require('express');
const compression = require('compression');
const { CaptureConsole } = require('@sentry/integrations');
const Sentry = require('@sentry/node');
const helmet = require('helmet');

const healthcheck = require('./healthcheck');

dotenv.config();

const { openRouter } = require('./v1/routes');
const swaggerRoutes = require('./v1/swagger-routes');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(compression());

app.use(healthcheck);
app.use('', openRouter);

// Return 200 on get to / to confirm to Azure that
// the container has started successfully:
const rootRouter = express.Router();
rootRouter.get('/', async (req, res) => {
  res.status(200).send();
});

rootRouter.use(Sentry.Handlers.requestHandler());

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new CaptureConsole(
    {
      // array of methods that should be captured
      // defaults to ['log', 'info', 'warn', 'error', 'debug', 'assert']
      levels: ['error'],
    },
  )],
  tracesSampleRate: 1.0,
});

rootRouter.use(Sentry.Handlers.errorHandler());

app.use('/', rootRouter);
app.use('/api-docs', swaggerRoutes);

module.exports = app;
