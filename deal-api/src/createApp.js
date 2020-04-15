const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const passport = require('passport');

dotenv.config();

const { CORS_ORIGIN } = process.env;

const configurePassport = require('./v1/users/passport');
const { authRouter, openRouter } = require('./v1/routes');

configurePassport(passport);

const app = express();
app.use(passport.initialize());
app.use(bodyParser.json({ type: 'application/json' }));

app.use(cors({
  origin: CORS_ORIGIN,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use('/v1', openRouter);
app.use('/v1', authRouter);

const errorHandler = (err, req, res) => {
  console.log(err.stack);
  res.sendStatus(500);
};

app.use(errorHandler);

module.exports = app;
