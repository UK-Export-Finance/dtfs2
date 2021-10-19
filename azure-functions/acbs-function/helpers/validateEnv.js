const { cleanEnv, str } = require('envalid');
const dotenv = require('dotenv');

dotenv.config();
const validateEnv = () => cleanEnv(process.env, {
    MULESOFT_API_UKEF_TF_EA_URL: str(),
    MULESOFT_API_KEY: str(),
    MULESOFT_API_SECRET: str(),
});

exports.validateEnv = validateEnv;
