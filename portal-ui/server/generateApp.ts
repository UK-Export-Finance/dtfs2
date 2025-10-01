import path from 'path';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import { SWAGGER, create as createCsrf, verify as verifyCsrf, maintenance, notFound, errors } from '@ukef/dtfs2-common';
import { configure, expressSession } from '@ukef/dtfs2-common/backend';
import { HttpStatusCode } from 'axios';
import routes from './routes';
import swaggerRouter from './routes/swagger.route';
import healthcheck from './healthcheck';
import configureNunjucks from './nunjucks-configuration';
import { seo, security, createRateLimit } from './routes/middleware';
import { asLoggedInUserSession, withUnknownLoginStatusUserSession } from './helpers/express-session';

export const generateApp = () => {
  const app = express();

  // Global application configuration
  configure(app);

  app.use(seo);

  // Non-authenticated routes
  app.use(healthcheck);
  app.use(`/v1/${SWAGGER.ENDPOINTS.UI}`, swaggerRouter);

  app.use(security);
  app.use(expressSession());
  app.use(createCsrf);

  app.use(flash());

  configureNunjucks({
    autoescape: true,
    express: app,
    noCache: true,
    watch: true,
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    morgan('dev', {
      skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/main.js'),
    }),
  );

  app.use('/assets', express.static('node_modules/govuk-frontend/dist/govuk/assets'), express.static(path.join(__dirname, '..', 'public')));

  /**
   * Scheduled maintenance middleware.
   * Should always be after `seo`, `security` and `assets` middlewares for UI.
   */
  app.use(maintenance);
  app.use(createRateLimit());
  app.use(verifyCsrf);
  app.use('/', routes);

  app.get('*', (req, res) => {
    // This checks the session cookie for a login status & if it's `Valid 2FA`.
    // If so, the user property can be accessed on the session & passed into the template
    const userIsFullyLoggedIn = 'loginStatus' in req.session && withUnknownLoginStatusUserSession(req.session).loginStatus === 'Valid 2FA';
    const user = userIsFullyLoggedIn ? asLoggedInUserSession(req.session).user : undefined;
    return res.status(HttpStatusCode.Ok).render('page-not-found.njk', { user });
  });

  /**
   * Global middlewares for edge cases
   * and gracefully handling exceptions.
   */
  // Handles all invalid URLs
  app.use(notFound('page-not-found.njk'));
  // Handles all errors and exceptions
  app.use(errors('_partials/problem-with-service.njk'));

  return app;
};
