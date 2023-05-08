const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const passport = require('passport');
const compression = require('compression');
const healthcheck = require('./healthcheck');

dotenv.config();
const { CORS_ORIGIN } = process.env;
const configurePassport = require('./v1/users/passport');
const { authRouter, openRouter, authRouterAllowXss } = require('./v1/routes');
const seo = require('./v1/middleware/headers/seo');
const security = require('./v1/middleware/headers/security');

configurePassport(passport);

const app = express();

app.use(seo);
app.use(security);
app.use(healthcheck);
app.use(passport.initialize());
app.use(express.json());
app.use(compression());

app.use(cors({
  origin: CORS_ORIGIN,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/v1', openRouter);
app.use('/v1', authRouterAllowXss);
app.use('/v1', authRouter);

app.use((err) => { console.error(err); });

module.exports = app;
