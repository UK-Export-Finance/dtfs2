const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const fileshare = require('./fileshare');
dotenv.config();

const app = express();

app.use(express.json());

const { CORS_ORIGIN } = process.env;
app.use(cors({
  origin: CORS_ORIGIN,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/fileshare', fileshare);

const errorHandler = (err) => {
  console.log(err);
};

app.use(errorHandler);

module.exports = app;
