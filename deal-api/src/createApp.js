const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');

const configurePassport = require('./users/passport');
const routes = require('./routes');

configurePassport(passport);

const app = express();
app.use(passport.initialize());
app.use(bodyParser.json({ type: 'application/json' }));
app.use(routes);

module.exports = app;
