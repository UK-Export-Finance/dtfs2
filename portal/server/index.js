const path = require('path');
const express = require('express');
const https = require('https');
const morgan = require('morgan');
const session = require('express-session');
const redis = require('redis');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const flash = require('connect-flash');
const RedisStore = require('connect-redis')(session);
const routes = require('./routes');
const healthcheck = require('./healthcheck');
const configureNunjucks = require('./nunjucks-configuration');
const { isProduction, sanitiseEnvironment } = require('./helpers');
const {
  csrfToken,
  copyCsrfTokenFromQueryToBody,
  seo,
  security,
  createRateLimit,
} = require('./routes/middleware');

const {
  TLS_KEY,
  TLS_CERTIFICATE,
  PORT,
  SESSION_SECRET,
  REDIS_KEY,
  REDIS_HOSTNAME,
  REDIS_PORT,
} = process.env;

const port = PORT || 5000;
const service = 'Portal-UI';
const serverOptions = {
  key: sanitiseEnvironment(TLS_KEY),
  cert: sanitiseEnvironment(TLS_CERTIFICATE),
};

const http = express();

/**
 * Production only services:
 * 1. Trust proxy (X-Forwarded-Proto)
 * Express will have knowledge that it's sitting behind a proxy and that the X-Forwarded-*
 * header fields may be trusted.
 */
if (isProduction()) {
  http.set('trust proxy', 1);
}

const cookie = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 604800000, // 7 days
};

http.use(seo);
http.use(security);
http.use(createRateLimit(service));

// TODO: Move to middleware
if (!SESSION_SECRET) {
  console.error('Portal UI server - SESSION_SECRET missing');
}

const sessionOptions = {
  name: '__Host-DTFS-SID',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie,
};

// TODO: Move to middleware
let redisOptions = {};

if (REDIS_KEY) {
  redisOptions = {
    auth_pass: REDIS_KEY,
    tls: { servername: REDIS_HOSTNAME },
  };
}

const redisClient = redis.createClient(REDIS_PORT, REDIS_HOSTNAME, redisOptions);
redisClient.on('error', (error) => console.error('❌ REDIS %s connection error %s', service, error));
redisClient.on('connect', () => console.info('📁 REDIS %s serving on redis://%s', service, REDIS_HOSTNAME));

const sessionStore = new RedisStore({ client: redisClient });
sessionOptions.store = sessionStore;
http.use(session(sessionOptions));

http.use(flash());

// TODO: Move to middleware
configureNunjucks({
  autoescape: true,
  express: http,
  noCache: true,
  watch: true,
});

http.use(express.json());
http.use(express.urlencoded({ extended: true }));
http.use(cookieParser());

// TODO: Move to middleware
http.use(copyCsrfTokenFromQueryToBody());
http.use(csrf({
  cookie: {
    ...cookie,
    key: '__Host-DTFS-CSRF',
    maxAge: 43200, // 12 hours
  },
}));
http.use(csrfToken());

// TODO: Move to middleware
http.use(morgan('dev', {
  skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/main.js'),
}));

http.use(
  '/assets',
  express.static(path.join(__dirname, '..', 'node_modules', 'govuk-frontend', 'govuk', 'assets')),
  express.static(path.join(__dirname, '..', 'public')),
);
http.use('/', routes);
http.get('*', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));

http.use(healthcheck);

// TODO: Move to middleware
http.use((error, req, res, next) => {
  if (error.code === 'EBADCSRFTOKEN') {
    // handle CSRF token errors here
    res.status(error.statusCode || 500);
    res.redirect('/');
  } else {
    next(error);
  }
});

/**
 * Azure WebApp will strip TLS before reaching the express server.
 * Due to above constraint one can only run HTTP server on Azure,
 * however it is proxied behind a HTTPS connection therefore
 * `trust proxy` has been enabled.
 *
 * However for localhost and GHA a HTTPS server with a self-signed
 * certificate will be spawned to allow creation of `__Host-` prefixed
 * cookies and a uniform environment.
 */
if (isProduction()) {
  http.listen(port, () => console.info('🌐 HTTP %s serving on :%d', service, port));
} else {
  https
    .createServer(serverOptions, http)
    .listen(port, () => console.info('🔐 HTTPS %s serving on :%d', service, port));
}
