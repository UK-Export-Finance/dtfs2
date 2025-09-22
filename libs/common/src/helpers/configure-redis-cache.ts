import dotenv from 'dotenv';
import redis from 'redis';
import connectRedis from 'connect-redis';
import session from 'express-session';
import { REDIS } from '../constants';
import { InvalidEnvironmentVariableError } from '../errors';

dotenv.config();

/**
 * Initializes and configures a Redis-backed session store for use with Express sessions.
 *
 * This function reads Redis connection details from environment variables and creates a Redis client.
 * It supports optional authentication and TLS configuration if a `REDIS_KEY` is provided.
 * The function throws an error if the required `REDIS_HOSTNAME` environment variable is missing.
 *
 * @returns An instance of the Redis session store.
 * @throws If `REDIS_HOSTNAME` is not defined in the environment.
 *
 * @example
 * const sessionStore = redisStore();
 * app.use(session({ store: sessionStore, ... }));
 */
export const redisStore = (): connectRedis.RedisStore => {
  const { REDIS_PORT, REDIS_HOSTNAME, REDIS_KEY } = process.env;

  let options;
  const port = parseInt(REDIS_PORT || REDIS.PORT, 10);

  if (!REDIS_HOSTNAME) {
    console.error('Invalid environment variable `REDIS_HOSTNAME` value supplied %s', REDIS_HOSTNAME);
    throw new InvalidEnvironmentVariableError('Invalid environment variable `REDIS_HOSTNAME`');
  }

  const Store: connectRedis.RedisStore = connectRedis(session);

  if (REDIS_KEY) {
    options = {
      auth_pass: REDIS_KEY,
      tls: { servername: REDIS_HOSTNAME },
    };
  }

  const client = redis.createClient(port, REDIS_HOSTNAME, options);
  const sessionStore = new Store({ client });

  client.on('error', (error) => {
    console.error('❌ Unable to initiate redis://%s %o', REDIS_HOSTNAME, error);
  });

  client.on('connect', () => {
    console.info('✅ Redis has been initialised at redis://%s', REDIS_HOSTNAME);
  });

  return sessionStore;
};
