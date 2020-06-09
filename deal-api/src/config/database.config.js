const dotenv = require('dotenv');

dotenv.config();
console.log(`deal-api getting database config, available environment keys: ${Object.keys(process.env)}`)

const database = process.env.MONGO_INITDB_DATABASE || process.env.CUSTOMCONNSTR_MONGO_INITDB_DATABASE;
const connectionString = process.env.MONGODB_URI || process.env.CUSTOMCONNSTR_MONGODB_URI;


module.exports = {
  database,
  url: connectionString,
  option: {},
};
