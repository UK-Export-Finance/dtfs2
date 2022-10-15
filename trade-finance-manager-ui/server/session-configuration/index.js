// Fail-safe fallback to a 256-bit random value:

const crypto = require('crypto');
const session = require('express-session');
const redis = require('redis');

const RedisStore = require('connect-redis')(session);

const sessionConfig = () => {
  const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(256 / 8).toString('hex');
  const sessionOptions = {
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

    console.info(`TFM UI: connecting to redis server: ${process.env.REDIS_HOSTNAME}:${process.env.REDIS_PORT}`);
    const client = redis.createClient({ url: `${process.env.REDIS_HOSTNAME}:${process.env.REDIS_PORT}`, legacyMode: true, ...redisOptions });

    client.on('error', (err) => console.error('TFM UI: Redis Client Error', err));
    client.on('ready', () => { console.info('TFM UI: REDIS ready'); });
    client.on('connect', () => { console.info('TFM UI: REDIS connected'); });

    client.connect();
    const sessionStore = new RedisStore({ client });
    sessionOptions.store = sessionStore;
  } else {
    console.error('No REDIS configured, using default MemoryStore');
  }

  return sessionOptions;
};

module.exports = sessionConfig;
