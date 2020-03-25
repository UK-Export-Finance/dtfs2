const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');

const configurePassport = require('./v1/users/passport');
const { authRouter, openRouter } = require('./v1/routes');

configurePassport(passport);

const app = express();
app.use(passport.initialize());
app.use(bodyParser.json({ type: 'application/json' }));

app.use('/v1', openRouter);
app.use('/v1', authRouter);

app.use('/api', openRouter);
app.use('/api', authRouter);

module.exports = app;
