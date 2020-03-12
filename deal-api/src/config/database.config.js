const dotenv = require('dotenv');
dotenv.config();

const user =          process.env.MONGO_INITDB_ROOT_USERNAME;
const password =      process.env.MONGO_INITDB_ROOT_PASSWORD;
const authMechanism = process.env.MONGO_CLIENT_AUTH_MECHANISM;
const dbName =        process.env.MONGO_INITDB_DATABASE;
const dbHost =        process.env.MONGO_HOST;
const dbPort =        process.env.MONGO_PORT;

module.exports = {
  dbName,
  url: `mongodb://${user}:${password}@${dbHost}:${dbPort}?authMechanism=${authMechanism}`,
  option: {},
};
