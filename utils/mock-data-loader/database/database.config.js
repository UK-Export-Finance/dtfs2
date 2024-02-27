const dotenv = require('dotenv');

dotenv.config();

const dbName = process.env.MONGO_INITDB_DATABASE;
// The below is different from the MONGODB_URI env var as mock-data-loader does not run within the container.
const connectionString = 'mongodb://root:r00t@localhost:27017/?authMechanism=DEFAULT&directConnection=true';

module.exports = {
  dbName,
  url: connectionString,
};
