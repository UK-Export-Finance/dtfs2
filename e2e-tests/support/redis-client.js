const { createClient } = require('redis');

let connection = null;

/**
 * redisConnect
 * Create and connect to a redis client.
 * @param {object} config: Redis configuration
 * @returns {Promise<import('redis').RedisClientType>}
 */
const redisConnect = async (config) => {
  let redisOptions = {};

  if (config.redisKey) {
    redisOptions = {
      auth_pass: config.redisKey,
      tls: { servername: config.redisHost },
    };
  }
  const redisClient = await createClient(config.redisHost, config.redisPort, redisOptions);
  await redisClient.connect();

  return redisClient;
};

/**
 * set
 * Set the redis connection.
 * @param {string} key: DB storage key
 * @param {object} value: value to store
 * @param {number} maxAge: keep value for
 * @param {object} config: Redis configuration
 */
const set = async ({ key, value, maxAge, config }) => {
  if (!connection) {
    connection = await redisConnect(config);
  }

  await connection.set(key, JSON.stringify(value), { EX: maxAge * 1000 });
};

/**
 * getConnection
 * Get the redis connection.
 * @param {Object} config: Redis configuration
 * @returns {RedisClient}
 */
const getConnection = async (config) => {
  if (!connection) {
    connection = await redisConnect(config);
  }

  return connection;
};

/**
 * close
 * Close the redis connection.
 */
const close = async () => {
  if (connection) {
    await connection.disconnect();
  }
};

module.exports = {
  set,
  getConnection,
  close,
};
