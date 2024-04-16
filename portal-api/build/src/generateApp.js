"use strict";
const tslib_1 = require("tslib");
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const passport = require('passport');
const compression = require('compression');
const mongoSanitise = require('express-mongo-sanitize');
const healthcheck = require('./healthcheck');
dotenv.config();
const { CORS_ORIGIN } = process.env;
const { loginInProgressAuth, loginCompleteAuth } = require('./v1/users/passport');
const { UserService } = require('./v1/users/user.service');
const { authRouter, openRouter } = require('./v1/routes');
const seo = require('./v1/middleware/headers/seo');
const security = require('./v1/middleware/headers/security');
const removeCsrfToken = require('./v1/middleware/remove-csrf-token');
const createRateLimit = require('./v1/middleware/rateLimit');
const userService = new UserService();
const generateApp = () => {
    // Setup for token authentication via Passport
    loginInProgressAuth(passport);
    loginCompleteAuth(passport, userService);
    const app = express();
    app.use(seo);
    app.use(security);
    app.use(createRateLimit());
    app.use(healthcheck);
    app.use(passport.initialize());
    app.use(express.json());
    app.use(compression());
    app.use(removeCsrfToken);
    // MongoDB sanitisation
    app.use(mongoSanitise({
        allowDots: true,
    }));
    app.use(cors({
        origin: CORS_ORIGIN,
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    app.use('/v1', openRouter);
    app.use('/v1', authRouter);
    // Return 200 on get to / to confirm to Azure that
    // the container has started successfully:
    const rootRouter = express.Router();
    rootRouter.get('/', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        res.status(200).send();
    }));
    rootRouter.get('/robots933456.txt', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        res.status(200).send();
    }));
    app.use('/', rootRouter);
    app.use((error) => {
        console.error(error);
    });
    return app;
};
module.exports = {
    generateApp,
};
