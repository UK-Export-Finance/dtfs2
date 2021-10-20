const { cleanEnv, str } = require('envalid');
const dotenv = require('dotenv');

dotenv.config();
const validateEnv = () => cleanEnv(process.env, {
    MULESOFT_API_UKEF_TF_EA_URL: str(),
    MULESOFT_API_KEY: str(),
    MULESOFT_API_SECRET: str(),
    MULESOFT_API_UKEF_MDM_EA_SECRET: str(),
    MULESOFT_API_UKEF_MDM_EA_URL: str(),
});

exports.validateEnv = validateEnv;
