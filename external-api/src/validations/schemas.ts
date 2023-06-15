import Joi from 'joi';

export const schemas = {
  environments: Joi.object({
    // Internal

    // 1. ACBS
    AZURE_ACBS_FUNCTION_URL: Joi.string().required(),
    MULESOFT_API_SECRET: Joi.string().required(),
    MULESOFT_API_KEY: Joi.string().required(),
    MULESOFT_API_ACBS_FACILITY_URL: Joi.string().required(),
    MULESOFT_API_ACBS_DEAL_URL: Joi.string().required(),

    // 2. PORT
    PORT: Joi.number().default(5002),

    // 3. MongoDB
    MONGO_INITDB_DATABASE: Joi.string().required(),
    MONGODB_URI: Joi.string().required(),

    // External

    // 1. APIM
    APIM_MDM_URL: Joi.string().required(),
    APIM_MDM_KEY: Joi.string().required(),
    APIM_MDM_VALUE: Joi.string().required(),

    // 2. GOV NOTIFY
    GOV_NOTIFY_API_KEY: Joi.string().required(),

    // 3. ESTORE
    MULESOFT_API_UKEF_ESTORE_EA_URL: Joi.string().required(),
    MULESOFT_API_UKEF_ESTORE_EA_KEY: Joi.string().required(),
    MULESOFT_API_UKEF_ESTORE_EA_SECRET: Joi.string().required(),

    // 4. ORDNANCE SURVEY
    ORDNANCE_SURVEY_API_URL: Joi.string().required(),
    ORDNANCE_SURVEY_API_KEY: Joi.string().required(),

    // 5. PARTY DB
    MULESOFT_API_PARTY_DB_URL: Joi.string().required(),
    MULESOFT_API_PARTY_DB_KEY: Joi.string().required(),
    MULESOFT_API_PARTY_DB_SECRET: Joi.string().required(),

    // 6. COMPANIES HOUSE
    COMPANIES_HOUSE_API_KEY: Joi.string().required(),
    COMPANIES_HOUSE_API_URL: Joi.string().required(),
  }).unknown(),
};
