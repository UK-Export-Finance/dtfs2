const dotenv = require('dotenv');

dotenv.config();

const dbName = process.env.MONGO_INITDB_DATABASE;
// The below is different than MONGOD_URI env var as mock-data-loader does not run within the container
const connectionString = process.env.MONGODB_URI;

module.exports = {
  dbName,
  url: connectionString,
};
