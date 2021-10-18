const { cleanEnv, str, num } = require('envalid');

const validateEnv = (dotenv) => cleanEnv(dotenv, {
  // Redis
  REDIS_HOSTNAME: str(),
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
