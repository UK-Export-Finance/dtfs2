const { cleanEnv, str, num } = require('envalid');
const dotenv = require('dotenv');

dotenv.config();

const validateEnv = () => cleanEnv(process.env, {
  // Redis validation is currently disabled
  // REDIS_HOSTNAME: str(),
  // REDIS_KEY: str(),
  // REDIS_PORT: str(),

  // Other
  PORT: num(),
  DEAL_API_URL: str(),
  SENTRY_DSN: str(),
  SESSION_SECRET: str(),
  // GITHUB_SHA: str()
});

exports.validateEnv = validateEnv;
