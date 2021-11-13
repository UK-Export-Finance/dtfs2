const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const redis = require('redis');
const helmet = require('helmet');

const flash = require('connect-flash');
const path = require('path');
require('./azure-env');

const RedisStore = require('connect-redis')(session);
const routes = require('./routes');
const healthcheck = require('./healthcheck');
const uploadTest = require('./upload-test');

const configureNunjucks = require('./nunjucks-configuration');
const sentry = require('./utils/sentry');

const app = express();
app.use(helmet());

app.use(sentry);
require('dotenv').config();
const { validateEnv } = require('./utils/validateEnv');

const { SESSION_SECRET, REDIS_HOSTNAME, PORT } = validateEnv(process.env);

if (!SESSION_SECRET) {
  console.error('Portal UI server - SESSION_SECRET missing');
}

const sessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
};

console.log(`Connecting to redis server: redis://${process.env.REDIS_HOSTNAME} `);

let redisOptions = {};

if (process.env.REDIS_KEY) {
  redisOptions = {
    auth_pass: process.env.REDIS_KEY,
    tls: { servername: process.env.REDIS_HOSTNAME },
  };
}

const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOSTNAME, redisOptions);

redisClient.on('error', (err) => {
  console.error(`Unable to connect to Redis: ${REDIS_HOSTNAME}`, { err });
});

redisClient.on('ready', () => {
  console.log('REDIS ready');
});

redisClient.on('connect', () => {
  console.log('REDIS connected');
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

app.use(morgan('dev', {
  skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/main.js'),
}));

app.use(healthcheck);
app.use(uploadTest);

app.use('/', routes);

app.use(
  '/assets',
  express.static(path.join(__dirname, '..', 'node_modules', 'govuk-frontend', 'govuk', 'assets')),
  express.static(path.join(__dirname, '..', 'public')),
);

app.get('*', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));

console.log(`GITHUB_SHA: ${process.env.GITHUB_SHA}`);

app.listen(PORT, () => console.log(`DTFS2 app listening on port ${PORT}!`)); // eslint-disable-line no-console
