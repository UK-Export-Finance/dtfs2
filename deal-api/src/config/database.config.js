const dotenv = require('dotenv');

dotenv.config();

const database = process.env.MONGO_INITDB_DATABASE;
const connectionString = process.env.MONGODB_URI;

console.log(`all environment variables that we have access to at startup: ${Object.keys(process.env)}`)
console.log(`database.config.js providing config from environmnet variables  - BOB  == ${process.env.BOB}`);

module.exports = {
  database,
  url: connectionString,
  option: {},
};
