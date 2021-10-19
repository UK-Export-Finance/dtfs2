const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');
const redis = require('redis');
const helmet = require('helmet');

const flash = require('connect-flash');
const path = require('path');
require('./azure-env');

const RedisStore = require('connect-redis')(session);
const dotenv = require('dotenv');
const routes = require('./routes');
const healthcheck = require('./healthcheck');

const configureNunjucks = require('./nunjucks-configuration');
const sentry = require('./utils/sentry');

const app = express();
app.use(helmet());

app.use(sentry);
app.use(compression());

dotenv.config();
const { validateEnv } = require('./utils/validateEnv');

validateEnv();
const { PORT, SESSION_SECRET } = process.env;

if (!SESSION_SECRET) {
  console.error('GEF UI server - SESSION_SECRET missing');
}

const sessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
};

let redisOptions = {};

if (process.env.REDIS_KEY) {
  redisOptions = {
    auth_pass: process.env.REDIS_KEY,
    tls: { servername: process.env.REDIS_HOSTNAME },
  };
}

const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOSTNAME, redisOptions);

redisClient.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error(`Unable to connect to Redis: ${process.env.REDIS_HOSTNAME}`, { err });
});

redisClient.on('ready', () => {
  // eslint-disable-next-line no-console
  console.log('REDIS ready');
});

redisClient.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('REDIS connected');
});

const sessionStore = new RedisStore({ client: redisClient });

sessionOptions.store = sessionStore;

app.set('trustproxy', true);
app.use(session(sessionOptions));

app.use(flash());

configureNunjucks({
  autoescape: true,
  express: app,
  noCache: true,
  watch: true,
});

app.use(express.urlencoded());

app.use(morgan('dev', {
  skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/main.js'),
}));

app.use(healthcheck);

app.use('/', routes);

app.use('/assets', express.static(path.join(__dirname, '..', 'public')));
// eslint-disable-next-line
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500);
  res.render('partials/problem-with-service.njk', { user: req.session.user, error: err });
});

app.use((req, res) => res.status(404).render('partials/page-not-found.njk', { user: req.session.user }));

console.log(`GITHUB_SHA: ${process.env.GITHUB_SHA}`);

app.listen(PORT, () => console.log(`DTFS2 app listening on port ${PORT}!`)); // eslint-disable-line no-console
