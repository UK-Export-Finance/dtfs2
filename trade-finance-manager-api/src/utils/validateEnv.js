const { cleanEnv, str } = require('envalid');
const dotenv = require('dotenv');

dotenv.config();
const validateEnv = () => cleanEnv(process.env, {
  // MongoDB
  MONGODB_URI: str(),
  MONGO_INITDB_DATABASE: str(),

  // Schedulers
  AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE: str(),
  AZURE_NUMBER_GENERATOR_FUNCTION_URL: str(),

  // ACBS
  AZURE_ACBS_FUNCTION_SCHEDULE: str(),
  AZURE_ACBS_FUNCTION_URL: str(),

  // Other
  SENTRY_DSN: str(),
  DTFS_CENTRAL_API: str(),
  REFERENCE_DATA_PROXY_URL: str(),
  TFM_URI: str(),
  UKEF_TFM_API_SYSTEM_KEY: str(),
  UKEF_TFM_API_REPORTS_KEY: str(),
  // GITHUB_SHA: str(),
});

exports.validateEnv = validateEnv;
