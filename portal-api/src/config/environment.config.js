const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config();

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development'),
    PORT: Joi.number().default(5001),
    MONGODB_URI: Joi.string().required().description('Mongo DB url'),
    MONGO_INITDB_DATABASE: Joi.string().required().description('Mongo DB url'),
    DTFS_CENTRAL_API: Joi.string().required().description('Central API endpoint'),
    REFERENCE_DATA_PROXY_URL: Joi.string().required().description('Reference Data Proxy API endpoint'),
    TFM_API: Joi.string().required().description('TFM API endpoint'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  MONGODB_URI: envVars.MONGO_INITDB_DATABASE,
  MONGO_INITDB_DATABASE: envVars.MONGO_INITDB_DATABASE,
  CENTRAL_API: envVars.DTFS_CENTRAL_API,
  REFERENCE_DATA_PROXY_URL: envVars.TFM_API,
  TFM_API: envVars.TFM_API,
};
