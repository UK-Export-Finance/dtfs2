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
const { getFrontEndErrorHandler } = require('@ukef/dtfs2-common');
const routes = require('./routes');
const supportingInformationUploadRoutes = require('./routes/supporting-information-upload');
const healthcheck = require('./healthcheck');
const configureNunjucks = require('./nunjucks-configuration');
const { csrfToken, copyCsrfTokenFromQueryToBody, security, seo, createRateLimit } = require('./middleware');

dotenv.config();

const generateApp = () => {
  const app = express();
  const https = Boolean(process.env.HTTPS || 0);
  const secureCookieName = https ? '__Host-dtfs-session' : 'dtfs-session';

  if (https) {
    app.set('trust proxy', 1);
  }

  const cookie = {
    path: '/',
    httpOnly: true,
    secure: https,
    sameSite: 'strict',
    maxAge: 604800000, // 7 days
  };

  app.use(seo);
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

  app.set('trustproxy', true);
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

  app.use(createRateLimit());

  app.use(healthcheck);

  app.use('/', routes);

  app.get('*', (req, res) => res.status(404).render('_partials/page-not-found.njk', { user: req.session.user }));

  app.use(getFrontEndErrorHandler());

  return app;
};

module.exports = {
  generateApp,
};
