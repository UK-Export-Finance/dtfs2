const dotenv = require('dotenv');

dotenv.config();

const dbName = process.env.MONGO_INITDB_DATABASE;
// The below is different from the MONGODB_URI env var to allow for this to be run both outside of the docker container and inside the docker container.
const connectionString = process.env.TEST_HELPER_MONGODB_URI || process.env.MONGODB_URI;

module.exports = {
  dbName,
  url: connectionString,
};
