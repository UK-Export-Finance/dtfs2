const { cleanEnv, str } = require('envalid');
const dotenv = require('dotenv');

dotenv.config();

const validateEnv = () => cleanEnv(process.env, {
  // MongoDB
  MONGO_INITDB_DATABASE: str(),
  MONGODB_URI: str(),

  // Mulesoft
  MULESOFT_API_ACBS_DEAL_URL: str(),
  MULESOFT_API_ACBS_FACILITY_URL: str(),
  MULESOFT_API_CURRENCY_EXCHANGE_RATE_URL: str(),
  MULESOFT_API_EXPOSURE_PERIOD_URL: str(),
  MULESOFT_API_UKEF_ESTORE_EA_URL: str(),
  MULESOFT_API_UKEF_ESTORE_EA_KEY: str(),
  MULESOFT_API_UKEF_ESTORE_EA_SECRET: str(),
  MULESOFT_API_UKEF_MDM_EA_URL: str(),
  MULESOFT_API_CURRENCY_EXCHANGE_RATE_KEY: str(),
  MULESOFT_API_CURRENCY_EXCHANGE_RATE_SECRET: str(),
  MULESOFT_API_KEY: str(),
  MULESOFT_API_SECRET: str(),
  MULESOFT_API_PARTY_DB_URL: str(),
  MULESOFT_API_PARTY_DB_KEY: str(),
  MULESOFT_API_PARTY_DB_SECRET: str(),
  MULESOFT_API_UKEF_MDM_EA_KEY: str(),
  MULESOFT_API_UKEF_MDM_EA_SECRET: str(),

  // Companies house
  COMPANIES_HOUSE_API_URL: str(),
  COMPANIES_HOUSE_API_KEY: str(),

  // Ordnance survey
  ORDNANCE_SURVEY_API_URL: str(),
  ORDNANCE_SURVEY_API_KEY: str(),

  // Other
  GOV_NOTIFY_API_KEY: str(),
  AZURE_ACBS_FUNCTION_URL: str(),
  AZURE_NUMBER_GENERATOR_FUNCTION_URL: str(),
  SENTRY_DSN: str(),
  // GITHUB_SHA: str(),
});

exports.validateEnv = validateEnv;
