const dotenv = require('dotenv');
const express = require('express');
const compression = require('compression');

const sentry = require('./utils/sentry');
const healthcheck = require('./healthcheck');

dotenv.config();

const { openRouter } = require('./v1/routes');
const swaggerRoutes = require('./v1/swagger-routes');

const app = express();
app.use(express.json());
app.use(compression());

app.use(sentry);
app.use(healthcheck);
app.use('', openRouter);

// Return 200 on get to / to confirm to Azure that
// the container has started successfully:
const rootRouter = express.Router();
rootRouter.get('/', async (req, res) => {
  res.status(200).send();
});

app.use('/', rootRouter);
app.use('/api-docs', swaggerRoutes);

module.exports = app;
