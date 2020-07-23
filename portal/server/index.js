import express from 'express';
import morgan from 'morgan';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import path from 'path';
import routes from './routes';

import configureNunjucks from './nunjucks-configuration';
import crypto from 'crypto';

const app = express();

const PORT = process.env.PORT || 5000;

// Fail-safe fallback to a 256-bit random value:
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(256 / 8).toString('hex');

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(cookieParser()); // could optionally use a secret here
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

app.use('/', routes);

app.use(express.static('dist'));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('*', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));

app.listen(PORT, () => console.log(`DTFS2 app listening on port ${PORT}!`)); // eslint-disable-line no-console
