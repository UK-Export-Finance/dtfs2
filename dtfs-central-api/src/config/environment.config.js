const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config();

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development'),
    PORT: Joi.number().default(5005),
    MONGODB_URI: Joi.string().required().description('Mongo DB url'),
    MONGO_INITDB_DATABASE: Joi.string().required().description('Mongo DB database name'),
    REFERENCE_DATA_PROXY_URL: Joi.string().required().description('Reference Data Proxy API endpoint'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  MONGODB_URI: envVars.MONGODB_URI,
  MONGO_INITDB_DATABASE: envVars.MONGO_INITDB_DATABASE,
  REFERENCE_DATA_PROXY_URL: envVars.REFERENCE_DATA_PROXY_URL,
  TFM_API: envVars.TFM_API,
};
