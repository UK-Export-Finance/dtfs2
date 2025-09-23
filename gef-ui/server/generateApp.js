const path = require('path');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');
const redis = require('redis');
const flash = require('connect-flash');
const RedisStore = require('connect-redis')(session);
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const { isHttps, SWAGGER, maintenance } = require('@ukef/dtfs2-common');
const { configure } = require('@ukef/dtfs2-common/backend');
const routes = require('./routes');
const swaggerRouter = require('./routes/swagger.route');
const supportingInformationUploadRoutes = require('./routes/supporting-information-upload');
const healthcheck = require('./healthcheck');
const configureNunjucks = require('./nunjucks-configuration');
const { csrfToken, copyCsrfTokenFromQueryToBody, security, seo, createRateLimit } = require('./middleware');

dotenv.config();

const generateApp = () => {
  const https = isHttps();
  const app = express();

  // Global application configuration
  configure(app);

  const secureCookieName = https ? '__Host-dtfs-session' : 'dtfs-session';

  const cookie = {
    path: '/',
    httpOnly: true,
    secure: https,
    sameSite: 'strict',
    maxAge: 604800000, // 7 days
  };

  app.use(seo);

  // Non-authenticated routes
  app.use(healthcheck);
  app.use(`/v1/${SWAGGER.ENDPOINTS.UI}`, swaggerRouter.default);

  app.use(security);

  app.use(compression());

  if (!process.env.SESSION_SECRET) {
    console.error('GEF UI server - SESSION_SECRET missing');
  }

  const sessionOptions = {
    name: secureCookieName,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie,
  };

  let redisOptions = {};

  if (process.env.REDIS_KEY) {
    redisOptions = {
      auth_pass: process.env.REDIS_KEY,
      tls: { servername: process.env.REDIS_HOSTNAME },
    };
  }

  const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOSTNAME, redisOptions);

  redisClient.on('error', (error) => {
    console.error('Unable to connect to Redis %s %o', process.env.REDIS_HOSTNAME, error);
  });

  redisClient.on('ready', () => {
    console.info('REDIS ready');
  });

  redisClient.on('connect', () => {
    console.info('REDIS connected');
  });

  const sessionStore = new RedisStore({ client: redisClient });

  sessionOptions.store = sessionStore;

  app.use(session(sessionOptions));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // These routes cannot use the csrf check below so must come before it
  // They implement their own separate csrf check
  app.use('/', supportingInformationUploadRoutes);

  app.use(copyCsrfTokenFromQueryToBody());
  app.use(csrf());
  app.use(csrfToken());
  app.use(flash());

  configureNunjucks({
    autoescape: true,
    express: app,
    noCache: true,
    watch: true,
  });

  app.use(
    morgan('dev', {
      skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/main.js'),
    }),
  );

  app.use('/assets', express.static(path.join(__dirname, '..', 'public')));

  /**
   * Scheduled maintenance middleware.
   * Should always be after `seo`, `security` and `assets` middlewares for UI.
   */
  app.use(maintenance);

  app.use(createRateLimit());

  app.use('/', routes);

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    if (error.code === 'EBADCSRFTOKEN') {
      // handle CSRF token errors here
      res.status(error.statusCode || 500);
      res.redirect('/');
    } else {
      res.render('partials/problem-with-service.njk', { user: req.session.user, error });
    }
  });

  app.use((req, res) => res.status(404).render('partials/page-not-found.njk', { user: req.session.user }));
  return app;
};

module.exports = {
  generateApp,
};
