const dotenv = require('dotenv');

dotenv.config();

const dbName = process.env.MONGO_INITDB_DATABASE;
const connectionString = process.env.MONGODB_URI;

console.log({ connectionString });

module.exports = {
  dbName,
  url: connectionString,
};
