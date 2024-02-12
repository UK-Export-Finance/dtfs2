import path from 'path';
import express, { ErrorRequestHandler } from 'express';
import morgan from 'morgan';
import session from 'express-session';
import redis from 'redis';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import flash from 'connect-flash';
import connectRedis from 'connect-redis';
import routes from './routes';
import healthcheck from './healthcheck';
import configureNunjucks from './nunjucks-configuration';
import {
  csrfToken,
  copyCsrfTokenFromQueryToBody,
  seo,
  security,
  createRateLimit,
} from './routes/middleware';
import InvalidEnvironmentVariableError from './errors/invalid-environment-variable.error';

const RedisStore = connectRedis(session);

export const generateApp = () => {
  const app = express();
  const https = Boolean(process.env.HTTPS || 0);
  const secureCookieName = https ? '__Host-dtfs-session' : 'dtfs-session';

  if (https) {
    app.set('trust proxy', 1);
  }

  const cookie: session.CookieOptions & csrf.CookieOptions = {
    path: '/',
    httpOnly: true,
    secure: https,
    sameSite: 'strict',
    maxAge: 604800000, // 7 days
  };

  app.use(seo);
  app.use(security);

  if (!process.env.SESSION_SECRET) {
    console.error('Portal UI server - SESSION_SECRET missing');
    throw new InvalidEnvironmentVariableError('Missing session secret value.');
  }

  const sessionOptions: session.SessionOptions = {
    name: secureCookieName,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie,
    store: undefined,
  };

  console.info('Connecting to redis server: redis://%s ', process.env.REDIS_HOSTNAME);

  let redisOptions = {};

  if (process.env.REDIS_KEY) {
    redisOptions = {
      auth_pass: process.env.REDIS_KEY,
      tls: { servername: process.env.REDIS_HOSTNAME },
    };
  }

  const redisClient = redis.createClient(
    parseInt(process.env.REDIS_PORT ?? '6379', 10),
    process.env.REDIS_HOSTNAME,
    redisOptions,
  );

  redisClient.on('error', (error) => {
    console.error('Unable to connect to Redis: %s %O', process.env.REDIS_HOSTNAME, error);
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

  app.use(copyCsrfTokenFromQueryToBody());
  app.use(csrf({
    cookie: {
      ...cookie,
      maxAge: 43200, // 12 hours
    },
  }));
  app.use(csrfToken());

  app.use(morgan('dev', {
    skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/main.js'),
  }));

  app.use(
    '/assets',
    express.static(path.join(__dirname, '..', 'node_modules', 'govuk-frontend', 'govuk', 'assets')),
    express.static(path.join(__dirname, '..', 'public')),
  );

  app.use(createRateLimit());

  app.use(healthcheck);

  app.use('/', routes);

  app.get('*', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));

  const errorHandler: ErrorRequestHandler = (
    error: {code: string; statusCode: number} | undefined,
    _req,
    res,
    next,
  ) => {
    if (error?.code === 'EBADCSRFTOKEN') {
      console.error('The user\'s CSRF token is incorrect, redirecting the user to /.');
      // handle CSRF token errors here
      res.status(error.statusCode || 500);
      res.redirect('/');
    } else {
      next(error);
    }
  };
  app.use(errorHandler);

  return app;
};
