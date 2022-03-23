const express = require('express');
const compression = require('compression');
// const helmet = require('helmet');

const {
  BANK_ROUTE,
  PORTAL_ROUTE,
  TFM_ROUTE,
  USER_ROUTE,
  SWAGGER_ROUTE,
} = require('./constants/routes');

const healthcheck = require('./healthcheck');

const {
  bankRoutes,
  portalRoutes,
  tfmRoutes,
  userRoutes,
  swaggerRoutes,
} = require('./v1/routes');

const app = express();

// Global middleware set headers
app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, noimageindex, nosnippet');
  next();
});

app.use(healthcheck);
app.use(express.json());
app.use(compression());

app.use(`/v1/${BANK_ROUTE}`, bankRoutes);
app.use(`/v1/${PORTAL_ROUTE}`, portalRoutes);
app.use(`/v1/${TFM_ROUTE}`, tfmRoutes);
app.use(`/v1/${USER_ROUTE}`, userRoutes);
app.use(`/v1/${SWAGGER_ROUTE}`, swaggerRoutes);

// Return 200 on get to / to confirm to Azure that
// the container has started successfully:
const rootRouter = express.Router();
rootRouter.get('/', async (req, res) => {
  res.status(200).send();
});

app.use('/', rootRouter);

module.exports = app;
