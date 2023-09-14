const redis = require('redis');
const { generateUserSession } = require('../user-session-generator');

const connect = () => {
  let redisOptions = {};

  if (process.env.REDIS_KEY) {
    redisOptions = {
      auth_pass: process.env.REDIS_KEY,
      tls: { servername: process.env.REDIS_HOSTNAME },
    };
  }
  const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOSTNAME, redisOptions);
  return redisClient;
};

export const saveData = (key, value) => {
  const redisClient = connect();
  redisClient.set(key, value);
  redisClient.quit();
};

export const saveUserSession = async (roles) => {
  const { sessionCookie, sessionKey, data } = generateUserSession(roles);
  const dataToSave = JSON.stringify(data).toString();

  saveData(sessionKey, dataToSave);
  return { sessionCookie, sessionKey, data };
};

export const flush = async () => {
  const redisClient = connect();
  await redisClient.flushall();
  redisClient.quit();
};

module.exports = {
  saveData,
  saveUserSession,
  flush,
};
