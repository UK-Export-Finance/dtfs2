const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const redis = require('redis');

const flash = require('connect-flash');
const path = require('path');
const json2csv = require('express-json2csv');
require('./azure-env');

const RedisStore = require('connect-redis')(session);
const routes = require('./routes');
const healthcheck = require('./healthcheck');

const configureNunjucks = require('./nunjucks-configuration');
const sentry = require('./utils/sentry');

const app = express();

app.use(sentry);
const PORT = process.env.PORT || 5006;

if (!process.env.SESSION_SECRET) {
  // eslint-disable-next-line no-console
  console.error('GEF UI server - SESSION_SECRET missing');
}

const sessionOptions = {
  secret: process.env.SESSION_SECRET,
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
app.use(json2csv);

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

app.get('*', (req, res) => res.render('partials/page-not-found.njk', { user: req.session.user }));

// eslint-disable-next-line no-console
console.log(`GITHUB_SHA: ${process.env.GITHUB_SHA}`);

app.listen(PORT, () => console.log(`DTFS2 app listening on port ${PORT}!`)); // eslint-disable-line no-console
