const { cleanEnv, str } = require('envalid');
const dotenv = require('dotenv');

dotenv.config();
const validateEnv = () => cleanEnv(process.env, {
  // MongoDB
  MONGO_INITDB_DATABASE: str(),
  MONGODB_URI: str(),

  // Other
  GITHUB_SHA: str(),
});

exports.validateEnv = validateEnv;
