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
const seo = require('./routes/middleware/headers/seo');

const app = express();

app.use(seo);

app.use(helmet({ contentSecurityPolicy: false }));

const PORT = process.env.PORT || 5000;

if (!process.env.SESSION_SECRET) {
  console.error('Portal UI server - SESSION_SECRET missing');
}

const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
};

console.info(`Connecting to redis server: redis://${process.env.REDIS_HOSTNAME} `);

let redisOptions = {};

if (process.env.REDIS_KEY) {
  redisOptions = {
    auth_pass: process.env.REDIS_KEY,
    tls: { servername: process.env.REDIS_HOSTNAME },
  };
}

const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOSTNAME, redisOptions);

redisClient.on('error', (err) => {
  console.error(`Unable to connect to Redis: ${process.env.REDIS_HOSTNAME}`, { err });
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

console.info(`GITHUB_SHA: ${process.env.GITHUB_SHA}`);

app.listen(PORT, () => console.info(`BSS app listening on port ${PORT}!`));
