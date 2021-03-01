// Fail-safe fallback to a 256-bit random value:

import crypto from 'crypto';
import session from 'express-session';
import redis from 'redis';

const RedisStore = require('connect-redis')(session);

const sessionConfig = () => {
  const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(256 / 8).toString('hex');

  const sessionOptions = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  };

  if (process.env.REDIS_HOSTNAME) {
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
      console.log(`Unable to connect to Redis: ${process.env.REDIS_HOSTNAME}`, { err });
    });

    redisClient.on('ready', () => {
      console.log('REDIS ready');
    });

    redisClient.on('connect', () => {
      console.log('REDIS connected');
    });

    const sessionStore = new RedisStore({ client: redisClient });

    sessionOptions.store = sessionStore;
  } else {
    console.log('No REDIS configured, using default MemoryStore');
  }

  return sessionOptions;
};

export default sessionConfig;
