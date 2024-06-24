import Joi from 'joi';

export const schemas = {
  environments: Joi.object({
    // Internal

    // 1. ACBS
    AZURE_ACBS_FUNCTION_URL: Joi.string().required(),

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
    APIM_TFS_URL: Joi.string().required(),
    APIM_TFS_VALUE: Joi.string().required(),
    APIM_TFS_KEY: Joi.string().required(),
    APIM_ESTORE_URL: Joi.string().required(),
    APIM_ESTORE_KEY: Joi.string().required(),
    APIM_ESTORE_VALUE: Joi.string().required(),

    // 2. GOV NOTIFY
    GOV_NOTIFY_API_KEY: Joi.string().required(),
  }).unknown(),
};
