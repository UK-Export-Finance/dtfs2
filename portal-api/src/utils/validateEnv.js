const { cleanEnv, str, bool } = require('envalid');

const validateEnv = (dotenv) => cleanEnv(dotenv, {
  // MongoDB
  MONGO_INITDB_DATABASE: str(),
  MONGODB_URI: str(),

  // Azure Workflow
  AZURE_WORKFLOW_FILESHARE_NAME: str(),
  AZURE_WORKFLOW_EXPORT_FOLDER: str(),
  AZURE_WORKFLOW_IMPORT_FOLDER: str(),
  AZURE_WORKFLOW_STORAGE_ACCOUNT: str(),
  AZURE_WORKFLOW_STORAGE_ACCESS_KEY: str(),
  FETCH_WORKFLOW_TYPE_B_SCHEDULE: str(),

  // Azure Portal
  AZURE_PORTAL_FILESHARE_NAME: str(),
  AZURE_PORTAL_EXPORT_FOLDER: str(),
  AZURE_PORTAL_STORAGE_ACCOUNT: str(),
  AZURE_PORTAL_STORAGE_ACCESS_KEY: str(),
  // AZURE_LOG_LEVEL: str(),

  // GOV Notify
  GOV_NOTIFY_EMAIL_RECIPIENT: str(),
  GOV_NOTIFY_API_KEY: str(),

  // Other
  TFM_API: str(),
  DTFS_CENTRAL_API: str(),
  REFERENCE_DATA_PROXY_URL: str(),
  JWT_SIGNING_KEY: str(),
  DTFS_PORTAL_SCHEDULER: bool(),
  CORS_ORIGIN: str(),
  SENTRY_DSN: str(),
  GITHUB_SHA: str(),
});

exports.validateEnv = validateEnv;
