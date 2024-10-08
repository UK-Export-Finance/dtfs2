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
    const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOSTNAME, redisOptions);

    redisClient.on('error', (error) => {
      console.info('Unable to connect to Redis %s %o', process.env.REDIS_HOSTNAME, error);
    });

    redisClient.on('ready', () => {
      console.info('REDIS ready');
    });

    redisClient.on('connect', () => {
      console.info('REDIS connected');
    });

    const sessionStore = new RedisStore({ client: redisClient });

    sessionOptions.store = sessionStore;
  } else {
    console.error('REDIS is not configured, using default MemoryStore');
  }

  return sessionOptions;
};

module.exports = sessionConfig;
