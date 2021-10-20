const { cleanEnv, str } = require('envalid');
const dotenv = require('dotenv');

dotenv.config();

const validateEnv = () => cleanEnv(process.env, {
  // Redis - checks disabled
  // REDIS_HOSTNAME: str(),
  // REDIS_KEY: str(),
  // REDIS_PORT: str(),

  // Other
  UKEF_TFM_API_SYSTEM_KEY: str(),
  TRADE_FINANCE_MANAGER_API_URL: str(),
  ESTORE_URL: str(),
//   SESSION_SECRET: str(),
});

exports.validateEnv = validateEnv;
