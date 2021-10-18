const { cleanEnv, str } = require('envalid');

const validateEnv = (dotenv) => cleanEnv(dotenv, {
  GITHUB_SHA: str(),
  MONGO_INITDB_DATABASE: str(),
  MONGODB_URI: str(),
});

exports.validateEnv = validateEnv;
