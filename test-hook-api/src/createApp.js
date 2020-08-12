const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');

dotenv.config();

const { CORS_ORIGIN } = process.env;

const routes = require('./routes');

const app = express();
app.use(bodyParser.json({ type: 'application/json' }));

app.use(cors({
  origin: CORS_ORIGIN,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/test-hooks', routes);

const errorHandler = (err) => {
  console.log(err);
};

app.use(errorHandler);

module.exports = app;
