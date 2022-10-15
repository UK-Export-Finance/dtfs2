const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');
const redis = require('redis');
const flash = require('connect-flash');
const path = require('path');
const RedisStore = require('connect-redis')(session);
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
require('./azure-env');
const routes = require('./routes');
const supportingDocuments = require('./routes/supporting-documents.route');
const healthcheck = require('./healthcheck');
const configureNunjucks = require('./nunjucks-configuration');
const { csrf: csrfToken, security, seo } = require('./middleware');

const app = express();

const PORT = process.env.PORT || 5006;
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
app.use(compression());
dotenv.config();

if (!process.env.SESSION_SECRET) {
  console.error('GEF UI server - SESSION_SECRET missing');
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

console.info(`GEF UI: Connecting to redis server: ${process.env.REDIS_HOSTNAME}:${process.env.REDIS_PORT}`);
const client = redis.createClient({ url: `${process.env.REDIS_HOSTNAME}:${process.env.REDIS_PORT}`, legacyMode: true, ...redisOptions });

client.on('error', (err) => console.error('GEF UI: Redis Client Error', err));
client.on('ready', () => { console.info('GEF UI: REDIS ready'); });
client.on('connect', () => { console.info('GEF UI: REDIS connected'); });

client.connect();
const sessionStore = new RedisStore({ client });
sessionOptions.store = sessionStore;

app.set('trustproxy', true);
app.use(session(sessionOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/', supportingDocuments);
app.use(csrf());
app.use(csrfToken());
app.use(flash());

configureNunjucks({
  autoescape: true,
  express: app,
  noCache: true,
  watch: true,
});

app.use(morgan('dev', {
  skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/main.js'),
}));

app.use(healthcheck);

app.use('/', routes);

app.use('/assets', express.static(path.join(__dirname, '..', 'public')));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // handle CSRF token errors here
    res.status(err.statusCode || 500);
    res.redirect('/');
  } else {
    res.render('partials/problem-with-service.njk', { user: req.session.user, error: err });
  }
});

app.use((req, res) => res.status(404).render('partials/page-not-found.njk', { user: req.session.user }));

app.listen(PORT, () => console.info(`GEF UI listening on port ${PORT}!`));
