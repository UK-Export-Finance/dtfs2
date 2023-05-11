import Joi from 'joi';

export const schemas = {
  environments: Joi.object({
    // Notify API
    GOV_NOTIFY_API_KEY: Joi.string().required(),

    // ACBS
    AZURE_ACBS_FUNCTION_URL: Joi.string().required(),
    MULESOFT_API_SECRET: Joi.string().required(),
    MULESOFT_API_KEY: Joi.string().required(),
    // ACBS facility
    MULESOFT_API_ACBS_FACILITY_URL: Joi.string().required(),
    // ACBS deal
    MULESOFT_API_ACBS_DEAL_URL: Joi.string().required(),

    // eStore
    MULESOFT_API_UKEF_ESTORE_EA_URL: Joi.string().required(),
    MULESOFT_API_UKEF_ESTORE_EA_KEY: Joi.string().required(),
    MULESOFT_API_UKEF_ESTORE_EA_SECRET: Joi.string().required(),

    // Exposure period
    MULESOFT_API_EXPOSURE_PERIOD_URL: Joi.string().required(),

    // PORT - defaults to 5002
    PORT: Joi.number().default(5002),

    // MongoDB
    MONGO_INITDB_DATABASE: Joi.string().required(),
    MONGODB_URI: Joi.string().required(),

    // Currency exchange
    APIM_MDM_URL: Joi.string().required(),
    APIM_MDM_KEY: Joi.string().required(),
    APIM_MDM_VALUE: Joi.string().required(),

    // Ordnance Survey
    ORDNANCE_SURVEY_API_URL: Joi.string().required(),
    ORDNANCE_SURVEY_API_KEY: Joi.string().required(),

    // Party DB
    MULESOFT_API_PARTY_DB_URL: Joi.string().required(),
    MULESOFT_API_PARTY_DB_KEY: Joi.string().required(),
    MULESOFT_API_PARTY_DB_SECRET: Joi.string().required(),

    // Premium schedule
    APIM_MDM_URL: Joi.string().required(),
    APIM_MDM_KEY: Joi.string().required(),
    APIM_MDM_VALUE: Joi.string().required(),

    // Companies House
    COMPANIES_HOUSE_API_KEY: Joi.string().required(),
    COMPANIES_HOUSE_API_URL: Joi.string().required(),
  }).unknown(),
};
