const dotenv = require('dotenv');
const { asString } = require('@ukef/dtfs2-common');

dotenv.config();

const dbName = asString(process.env.MONGO_INITDB_DATABASE, 'MONGO_INITDB_DATABASE');
// The below is different from the MONGODB_URI env var as mock-data-loader does not run within the container.
const connectionString = 'mongodb://root:r00t@localhost:27017/?authMechanism=DEFAULT&directConnection=true';

module.exports = {
  dbName,
  url: connectionString,
};
