// Fail-safe fallback to a 256-bit random value:

const crypto = require('crypto');
const session = require('express-session');
const redis = require('redis');

const RedisStore = require('connect-redis')(session);

const sessionConfig = () => {
  const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(256 / 8).toString('hex');
  const cookie = {
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 604800000, // 7 days
  };

  const sessionOptions = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie,
  };

  if (process.env.REDIS_HOSTNAME) {
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
      console.info(`Unable to connect to Redis: ${process.env.REDIS_HOSTNAME}`, { err });
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
    console.error('No REDIS configured, using default MemoryStore');
  }

  return sessionOptions;
};

module.exports = sessionConfig;
