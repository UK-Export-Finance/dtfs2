const redis = require('redis');

let connection = null;

const redisConnect = async (config) => {
  let redisOptions = {};

  if (config.redisKey) {
    redisOptions = {
      auth_pass: config.redisKey,
      tls: { servername: config.redisHost },
    };
  }
  const redisClient = await redis.createClient(config.redisHost, config.redisPort, redisOptions);
  await redisClient.connect();

  return redisClient;
};

module.exports.set = async (key, value, maxAge, config) => {
  if (!connection) {
    connection = await redisConnect(config);
  }

  await connection.set(key, JSON.stringify(value), { EX: maxAge * 1000 });
};

module.exports.getConnection = async (config) => {
  if (!connection) {
    connection = await redisConnect(config);
  }

  return connection;
};

module.exports.close = async () => {
  if (connection) {
    await connection.disconnect();
  }
};
