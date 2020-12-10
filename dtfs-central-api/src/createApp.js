const bodyParser = require('body-parser');
// const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');


const healthcheck = require('./healthcheck');

dotenv.config();

const { openRouter } = require('./v1/routes');

// const { CORS_ORIGIN } = process.env;

const app = express();
app.use(bodyParser.json({ type: 'application/json' }));
app.use(healthcheck);

app.use('/v1', openRouter);

// app.use(cors({
//   origin: CORS_ORIGIN,
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// Return 200 on get to / to confirm to Azure that
// the container has started successfully:
const rootRouter = express.Router();
rootRouter.get('/', async (req, res) => {
  res.status(200).send();
});

app.use('/', rootRouter);

module.exports = app;
