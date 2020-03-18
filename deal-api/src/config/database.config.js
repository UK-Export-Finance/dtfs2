const dotenv = require('dotenv');

dotenv.config();

const database = process.env.MONGO_INITDB_DATABASE;
const connectionString = process.env.MONGODB_URI;

module.exports = {
  database,
  url: connectionString,
  option: {},
};
