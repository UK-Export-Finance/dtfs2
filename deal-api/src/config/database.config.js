const dotenv = require('dotenv');
dotenv.config();

const database = process.env.MONGO_INITDB_DATABASE;
const connectionString = process.env.MONGO_CONNECTION_STRING

module.exports = {
  database,
  url: connectionString,
  option: {},
};
