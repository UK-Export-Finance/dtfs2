const crypto = require('crypto');
const session = require('express-session');
const redis = require('redis');

const RedisStore = require('connect-redis')(session);

const https = Boolean(process.env.HTTPS || 0);
const secureCookieName = https ? '__Host-dtfs-session' : 'dtfs-session';

const sessionConfig = () => {
  const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(256 / 8).toString('hex');
  const sessionOptions = {
    name: secureCookieName,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  };

  if (process.env.REDIS_HOSTNAME) {
    let redisOptions = {};

    if (process.env.REDIS_KEY) {
      redisOptions = {
        auth_pass: process.env.REDIS_KEY,
        tls: { servername: process.env.REDIS_HOSTNAME },
      };
    }

    const url = `redis://${process.env.REDIS_HOSTNAME}:${process.env.REDIS_PORT}`;
    const client = redis.createClient({
      ...redisOptions,
      legacyMode: true,
      url,
    });

    console.info(`GEF UI: Connecting to redis server: ${url}`);
    client.connect();

    client.on('error', (err) => console.error('GEF UI: Redis Client Error', err));
    client.on('ready', () => {
      console.info('GEF UI: REDIS ready');
    });
    client.on('connect', () => {
      console.info('GEF UI: REDIS connected');
    });

    const sessionStore = new RedisStore({ client });
    sessionOptions.store = sessionStore;
  } else {
    console.error('No REDIS configured, using default MemoryStore');
  }

  return sessionOptions;
};

module.exports = sessionConfig;
