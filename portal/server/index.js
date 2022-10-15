const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const redis = require('redis');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const flash = require('connect-flash');
const path = require('path');
require('./azure-env');
const RedisStore = require('connect-redis')(session);
const routes = require('./routes');
const eligibilityRoutes = require('./routes/contract/eligibility');
const healthcheck = require('./healthcheck');
const configureNunjucks = require('./nunjucks-configuration');
const { csrf: csrfToken, seo, security } = require('./routes/middleware');

const app = express();
const PORT = process.env.PORT || 5000;
const https = Boolean(process.env.HTTPS || 0);

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

if (!process.env.SESSION_SECRET) {
  console.error('Portal UI server - SESSION_SECRET missing');
}

const sessionOptions = {
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

console.info(`BSS: Connecting to redis server: ${process.env.REDIS_HOSTNAME}:${process.env.REDIS_PORT}`);
const client = redis.createClient({ url: `${process.env.REDIS_HOSTNAME}:${process.env.REDIS_PORT}`, legacyMode: true, ...redisOptions });

client.on('error', (err) => console.error('BSS: Redis Client Error', err));
client.on('ready', () => { console.info('BSS: REDIS ready'); });
client.on('connect', () => { console.info('BSS: REDIS connected'); });

client.connect();
const sessionStore = new RedisStore({ client });
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
app.use('/', eligibilityRoutes);
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

app.use(healthcheck);

app.use('/', routes);

app.use(
  '/assets',
  express.static(path.join(__dirname, '..', 'node_modules', 'govuk-frontend', 'govuk', 'assets')),
  express.static(path.join(__dirname, '..', 'public')),
);

app.get('*', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));

// error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // handle CSRF token errors here
    res.status(err.statusCode || 500);
    res.redirect('/');
  } else {
    next(err);
  }
});

app.listen(PORT, () => console.info(`BSS: Listening on port ${PORT}!`));
