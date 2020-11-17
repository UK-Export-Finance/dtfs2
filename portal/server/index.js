import express from 'express';
import morgan from 'morgan';
import session from 'express-session';
import redis from 'redis';

import flash from 'connect-flash';
import path from 'path';
import crypto from 'crypto';
import json2csv from 'express-json2csv';
import './azure-env';

import routes from './routes';
import healthcheck from './healthcheck';
import uploadTest from './upload-test';

import configureNunjucks from './nunjucks-configuration';

const RedisStore = require('connect-redis')(session);

const app = express();

const PORT = process.env.PORT || 5000;

// Fail-safe fallback to a 256-bit random value:
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(256 / 8).toString('hex');

const sessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
};

console.log(`REDIS_URI: ${process.env.REDIS_URI}`);
if (process.env.REDIS_URI) {
  console.log(`Connecting to redis server: rediss://${process.env.REDIS_URI} `);

  const redisClient = redis.createClient(`rediss://${process.env.REDIS_URI}`);
  redisClient.on('error', (err) => {
    console.log(`Unable to connect to Redis: ${process.env.REDIS_URI}`, { err });
  });

  redisClient.on('ready', () => {
    console.log('REDIS ready');
  });

  redisClient.on('connect', () => {
    console.log('REDIS connected');
  });

  const sessionStore = new RedisStore({ client: redisClient });

  console.log({ sessionStore });
  sessionOptions.store = sessionStore;
}


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
app.use(uploadTest);

app.use('/', routes);

app.use(express.static('dist'));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('*', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));

console.log(`GITHUB_SHA: ${process.env.GITHUB_SHA}`);

app.listen(PORT, () => console.log(`DTFS2 app listening on port ${PORT}!`)); // eslint-disable-line no-console
