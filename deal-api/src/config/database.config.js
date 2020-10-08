const dotenv = require('dotenv');

dotenv.config();

const dbName = process.env.MONGO_INITDB_DATABASE;
const connectionString = process.env.MONGODB_URI;
const options = {
  ssl: Boolean(process.env.MONGODB_OPTIONS_SSL),
  appname: process.env.MONGODB_OPTIONS_APPNAME,
};

module.exports = {
  dbName,
  url: connectionString,
  options,
};
