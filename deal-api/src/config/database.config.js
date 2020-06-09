const dotenv = require('dotenv');

dotenv.config();

const database = process.env.MONGO_INITDB_DATABASE || process.env.CUSTOMCONNSTR_MONGO_INITDB_DATABASE;
const connectionString = process.env.MONGODB_URI || process.env.CUSTOMCONNSTR_MONGODB_URI;

module.exports = {
  database,
  url: connectionString,
  option: {},
};
