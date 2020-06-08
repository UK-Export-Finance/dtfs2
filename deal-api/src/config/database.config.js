const dotenv = require('dotenv');

dotenv.config();

const database = process.env.MONGO_INITDB_DATABASE || process.env.CUSTOMCONNSTR_MONGO_INITDB_DATABASE;
const connectionString = process.env.MONGODB_URI || process.env.CUSTOMCONNSTR_MONGODB_URI;

console.log(`all environment variables that we have access to at startup: ${Object.keys(process.env)}`)
console.log(`database  == ${database}`);

module.exports = {
  database,
  url: connectionString,
  option: {},
};
