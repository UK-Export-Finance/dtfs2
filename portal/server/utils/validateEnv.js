const { cleanEnv, str } = require('envalid');

const dotenv = require('dotenv');

dotenv.config();
const validateEnv = () => cleanEnv(process.env, {
  // Redis
  REDIS_HOSTNAME: str(),
  // REDIS_KEY: str(),
  // REDIS_PORT: str(),

  // Companies house
  COMPANIES_HOUSE_API_URL: str(),
  COMPANIES_HOUSE_API_KEY: str(),

  // Other
  DEAL_API_URL: str(),
  SENTRY_DSN: str(),
  PORT: str(),
  SESSION_SECRET: str(),
  // GITHUB_SHA: str()
});

exports.validateEnv = validateEnv;
