param cosmosDbAccountName string
param cosmosDbDatabaseName string
param containerRegistryName string
param externalApiHostname string
param dtfsCentralApiHostname string
param nodeDeveloperMode bool
param numberGeneratorFunctionDefaultHostName string
param tfmUIUrl string
param storageAccountName string
param settings object
param product string
param target string
param version string

var tfmApiNameFragment = 'trade-finance-manager-api'
var tfmApiName = '${product}-${target}-${version}-${tfmApiNameFragment}'
var applicationInsightsName = '${product}-${target}-${version}-${tfmApiNameFragment}'

var deployApplicationInsights = true
var selfHostnameEnvironmentVariable = ''
@secure()
param secureSettings object
@secure()
param secureConnectionStrings object
@secure()
param additionalSecureSettings object
@secure()
param additionalSecureConnectionStrings object
param azureDnsServerIp string
param websiteHttploggingRetentionDays string
param timeZone string
@description('AZURE ACBS Function URL.')
@secure()
param AZURE_ACBS_FUNCTION_URL string

@description('AZURE NUMBER GENERATOR FUNCTION SCHEDULE.')
@secure()
param AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE string

@description('AZURE PORTAL STORAGE ACCESS KEY.')
@secure()
param AZURE_PORTAL_STORAGE_ACCESS_KEY string

@description('AZURE PORTAL STORAGE ACCOUNT.')
@secure()
param AZURE_PORTAL_STORAGE_ACCOUNT string

@description('Authentication key used by services to call the DTFS Central API.')
@secure()
param DTFS_CENTRAL_API_KEY string

@description('DTFS Central API URL.')
@secure()
param DTFS_CENTRAL_API_URL string

@description('ENTRA ID Client ID.')
@secure()
param ENTRA_ID_CLIENT_ID string

@description('ENTRA ID Client Secret.')
@secure()
param ENTRA_ID_CLIENT_SECRET string

@description('ENTRA ID Cloud Instance.')
@secure()
param ENTRA_ID_CLOUD_INSTANCE string

@description('ENTRA ID Redirect URL.')
@secure()
param ENTRA_ID_REDIRECT_URL string

@description('ENTRA ID Tenant ID.')
@secure()
param ENTRA_ID_TENANT_ID string

@description('External API key.')
@secure()
param EXTERNAL_API_KEY string

@description('GOV Notify email recipient.')
@secure()
param GOV_NOTIFY_EMAIL_RECIPIENT string

@description('JWT signing key used to generate authentication tokens.')
@secure()
param JWT_SIGNING_KEY string

@description('JWT validation key used to verify authentication tokens.')
@secure()
param JWT_VALIDATING_KEY string

@description('TFM API key.')
@secure()
param TFM_API_KEY string

@description('UKEF internal notification email.')
@secure()
param UKEF_INTERNAL_NOTIFICATION_EMAIL string

@description('UKEF TFM API reports key.')
@secure()
param UKEF_TFM_API_REPORTS_KEY string

@description('UKEF TFM API system key.')
@secure()
param UKEF_TFM_API_SYSTEM_KEY string

var containerRegistryLoginServer = containerRegistry.properties.loginServer
var staticSettings = {
  WEBSITE_DNS_SERVER: azureDnsServerIp
  WEBSITE_VNET_ROUTE_ALL: '1'
  PORT: '5000'
  WEBSITES_PORT: '5000'
}
var dtfsCentralApiUrl = 'https://${dtfsCentralApiHostname}'
var externalApiUrl = 'https://${externalApiHostname}'
var additionalSettings = {
  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: containerRegistryLoginServer
  DOCKER_REGISTRY_SERVER_USERNAME: containerRegistry.listCredentials().username
  DOCKER_REGISTRY_SERVER_PASSWORD: containerRegistry.listCredentials().passwords[0].value
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'
  TZ: timeZone
  WEBSITE_HTTPLOGGING_RETENTION_DAYS: websiteHttploggingRetentionDays
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
  DTFS_CENTRAL_API_URL: dtfsCentralApiUrl
  EXTERNAL_API_URL: externalApiUrl
}
var connectionStringsList = [for item in items(union(secureConnectionStrings, additionalSecureConnectionStrings)): {
  name: item.key
  value: item.value
} ]
var connectionStringsProperties = toObject(connectionStringsList, item => item.name, item => {
  type: 'Custom'
  value: item.value
} )
var cosmosDbConnectionStrings = cosmosDbAccount.listConnectionStrings().connectionStrings
var mongoDbConnectionString = length(cosmosDbConnectionStrings) > 0 ? replace(cosmosDbConnectionStrings[0].connectionString, '&replicaSet=globaldb', '') : ''
var storageAccountKey = storageAccount.listKeys().keys[0].value
var nodeEnv = nodeDeveloperMode ? { NODE_ENV: 'production' } : {}

var keyVaultSecureSettings = {
  AZURE_ACBS_FUNCTION_URL: AZURE_ACBS_FUNCTION_URL
  AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE: AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE
  AZURE_PORTAL_STORAGE_ACCESS_KEY: AZURE_PORTAL_STORAGE_ACCESS_KEY
  AZURE_PORTAL_STORAGE_ACCOUNT: AZURE_PORTAL_STORAGE_ACCOUNT
  DTFS_CENTRAL_API_KEY: DTFS_CENTRAL_API_KEY
  DTFS_CENTRAL_API_URL: DTFS_CENTRAL_API_URL
  ENTRA_ID_CLIENT_ID: ENTRA_ID_CLIENT_ID
  ENTRA_ID_CLIENT_SECRET: ENTRA_ID_CLIENT_SECRET
  ENTRA_ID_CLOUD_INSTANCE: ENTRA_ID_CLOUD_INSTANCE
  ENTRA_ID_REDIRECT_URL: ENTRA_ID_REDIRECT_URL
  ENTRA_ID_TENANT_ID: ENTRA_ID_TENANT_ID
  EXTERNAL_API_KEY: EXTERNAL_API_KEY
  GOV_NOTIFY_EMAIL_RECIPIENT: GOV_NOTIFY_EMAIL_RECIPIENT
  JWT_SIGNING_KEY: JWT_SIGNING_KEY
  JWT_VALIDATING_KEY: JWT_VALIDATING_KEY
  TFM_API_KEY: TFM_API_KEY
  UKEF_INTERNAL_NOTIFICATION_EMAIL: UKEF_INTERNAL_NOTIFICATION_EMAIL
  UKEF_TFM_API_REPORTS_KEY: UKEF_TFM_API_REPORTS_KEY
  UKEF_TFM_API_SYSTEM_KEY: UKEF_TFM_API_SYSTEM_KEY
}

var calculatedAppSettings = {
  MONGO_INITDB_DATABASE: cosmosDbDatabaseName
  MONGODB_URI: mongoDbConnectionString
  AZURE_NUMBER_GENERATOR_FUNCTION_URL: 'https://${numberGeneratorFunctionDefaultHostName}'
  TFM_UI_URL: tfmUIUrl
  AZURE_PORTAL_STORAGE_ACCESS_KEY: storageAccountKey
  AZURE_PORTAL_STORAGE_ACCOUNT: storageAccountName
}

var appSettings = union(
  settings,
  staticSettings,
  secureSettings,
  additionalSettings,
  additionalSecureSettings,
  nodeEnv,
  keyVaultSecureSettings,
  calculatedAppSettings,
  deployApplicationInsights ? {
    APPLICATIONINSIGHTS_CONNECTION_STRING: applicationInsights.properties.ConnectionString
    } : {},
  selfHostnameEnvironmentVariable == '' ? {} : {
      '${selfHostnameEnvironmentVariable}': site.properties.defaultHostName
    }
)

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: containerRegistryName
}
resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' existing = {
  name: cosmosDbAccountName
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' existing = {
  name: storageAccountName
}

resource site 'Microsoft.Web/sites@2024-04-01' existing = {
  name: tfmApiName
}

resource webappSetting 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: site
  name: 'appsettings'
  properties: appSettings
}

resource webappConnectionStrings 'Microsoft.Web/sites/config@2022-09-01' = if (!empty(connectionStringsList)) {
  parent: site
  name: 'connectionstrings'
  properties: connectionStringsProperties
}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' existing = {
  name: applicationInsightsName
}
