const express = require('express');
const compression = require('compression');
const mongoSanitise = require('express-mongo-sanitize');
const seo = require('./v1/routes/middleware/headers/seo');
const security = require('./v1/routes/middleware/headers/security');
const checkApiKey = require('./v1/routes/middleware/headers/check-api-key');
// TODO sr-8: re-enable rate limiter
// const rateLimiter = require('./v1/routes/middleware/rate-limiter');

const {
  BANK_ROUTE, PORTAL_ROUTE, TFM_ROUTE, USER_ROUTE, SWAGGER_ROUTE
} = require('./constants/routes');

const healthcheck = require('./healthcheck');

const {
  bankRoutes, portalRoutes, tfmRoutes, userRoutes, swaggerRoutes
} = require('./v1/routes');
const removeCsrfToken = require('./v1/routes/middleware/remove-csrf-token');

const app = express();

app.use(seo);
app.use(security);
app.use(checkApiKey);
app.use(healthcheck);
// added limit for larger payloads - 500kb
app.use(express.json({ limit: '500kb' }));
app.use(compression());
app.use(removeCsrfToken);
// TODO sr-8: re-enable rate limiter
// app.use(rateLimiter);
// MongoDB sanitisation
app.use(
  mongoSanitise({
    allowDots: true,
  }),
);

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
