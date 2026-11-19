param location string
param environment string
param containerRegistryName string
param appServicePlanEgressSubnetId string
param appServicePlanId string
param privateEndpointsSubnetId string
param cosmosDbAccountName string
param cosmosDbDatabaseName string
param logAnalyticsWorkspaceId string
param storageAccountName string
param azureWebsitesDnsZoneId string
param nodeDeveloperMode bool
param clamAvSettings {
  ipAddress: string
  port: int
}
param product string
param target string
param version string
param resourceNameFragment string = 'portal-api'
param settings object
@secure()
param secureSettings object
@secure()
param additionalSecureSettings object
param connectionStrings object
@secure()
param secureConnectionStrings object
param azureDnsServerIp string
param websiteDynamicCache string
param websiteHttploggingRetentionDays string
param websiteNodeDefaultVersion string
param timeZone string
@description('API key required to access the Portal API.')
@secure()
param PORTAL_API_KEY string

@description('Portal UI URL.')
@secure()
param PORTAL_UI_URL string

@description('TFM API.')
@secure()
param TFM_API string

@description('TFM UI URL.')
@secure()
param TFM_UI_URL string

@description('Email address used for UKEF GEF reporting.')
@secure()
param UKEF_GEF_REPORTING_EMAIL_RECIPIENT string

@description('DTFS Central API URL.')
@secure()
param DTFS_CENTRAL_API_URL string

@description('DTFS Central API.')
@secure()
param DTFS_CENTRAL_API string

@description('Email address used for PDC inputters.')
@secure()
param PDC_INPUTTERS_EMAIL_RECIPIENT string

@description('CORS_ORIGIN for the portal API.')
@secure()
param CORS_ORIGIN string

@description('Azure portal export folder.')
@secure()
param AZURE_PORTAL_EXPORT_FOLDER string

@description('Name of the Azure file share used by the portal.')
@secure()
param AZURE_PORTAL_FILESHARE_NAME string

@description('JWT signing key used to generate authentication tokens.')
@secure()
param JWT_SIGNING_KEY string

@description('JWT validation key used to verify authentication tokens.')
@secure()
param JWT_VALIDATING_KEY string

@description('GOV Notify API key.')
@secure()
param GOV_NOTIFY_API_KEY string

@description('Email address used for GOV Notify notifications.')
@secure()
param GOV_NOTIFY_EMAIL_RECIPIENT string

@description('Authentication key used by services to call the DTFS Central API.')
@secure()
param DTFS_CENTRAL_API_KEY string

@description('API key used by external integrations to call system APIs.')
@secure()
param EXTERNAL_API_KEY string

@description('API key required to access the TFM API.')
@secure()
param TFM_API_KEY string

@description('External API URL.')
@secure()
param EXTERNAL_API_URL string

@description('TFM API URL.')
@secure()
param TFM_API_URL string

var containerRegistryLoginServer = containerRegistry.properties.loginServer
var dockerImageName = '${containerRegistryLoginServer}/${resourceNameFragment}:${environment}'
var staticSettings = {
  CLAMAV_HOST: clamAvSettings.ipAddress
  CLAMAV_PORT: clamAvSettings.port
  CLAMAV_DEBUG_MODE_ENABLED: 'true'
  CLAMAV_SCANNING_ENABLED: 'true'
  WEBSITE_DNS_SERVER: azureDnsServerIp
  WEBSITE_VNET_ROUTE_ALL: '1'
  PORT: '5000'
  WEBSITES_PORT: '5000'
}

var additionalSettings = {
  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: containerRegistryLoginServer
  DOCKER_REGISTRY_SERVER_USERNAME: containerRegistry.listCredentials().username
  DOCKER_REGISTRY_SERVER_PASSWORD: containerRegistry.listCredentials().passwords[0].value
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'
  TZ: timeZone
  WEBSITE_DYNAMIC_CACHE: websiteDynamicCache
  WEBSITE_HTTPLOGGING_RETENTION_DAYS: websiteHttploggingRetentionDays
  WEBSITE_LOCAL_CACHE_OPTION: 'Never'
  WEBSITE_NODE_DEFAULT_VERSION: websiteNodeDefaultVersion
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
}
var nodeEnv = nodeDeveloperMode ? { NODE_ENV: 'production' } : {}
var connectionStringsList = [for item in items(union(connectionStrings, secureConnectionStrings)): {
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

var settingsCalculated = {
  AZURE_PORTAL_STORAGE_ACCESS_KEY: storageAccountKey
  AZURE_PORTAL_STORAGE_ACCOUNT: storageAccountName
  MONGO_INITDB_DATABASE: cosmosDbDatabaseName
  MONGODB_URI: mongoDbConnectionString
}

var keyVaultSecureSettings = {
  PORTAL_API_KEY: PORTAL_API_KEY
  PORTAL_UI_URL: PORTAL_UI_URL
  TFM_API: TFM_API
  TFM_UI_URL: TFM_UI_URL
  UKEF_GEF_REPORTING_EMAIL_RECIPIENT: UKEF_GEF_REPORTING_EMAIL_RECIPIENT
  DTFS_CENTRAL_API_URL: DTFS_CENTRAL_API_URL
  DTFS_CENTRAL_API: DTFS_CENTRAL_API
  PDC_INPUTTERS_EMAIL_RECIPIENT: PDC_INPUTTERS_EMAIL_RECIPIENT
  CORS_ORIGIN: CORS_ORIGIN
  AZURE_PORTAL_EXPORT_FOLDER: AZURE_PORTAL_EXPORT_FOLDER
  AZURE_PORTAL_FILESHARE_NAME: AZURE_PORTAL_FILESHARE_NAME
  JWT_SIGNING_KEY: JWT_SIGNING_KEY
  JWT_VALIDATING_KEY: JWT_VALIDATING_KEY
  GOV_NOTIFY_API_KEY: GOV_NOTIFY_API_KEY
  GOV_NOTIFY_EMAIL_RECIPIENT: GOV_NOTIFY_EMAIL_RECIPIENT
  DTFS_CENTRAL_API_KEY: DTFS_CENTRAL_API_KEY
  EXTERNAL_API_KEY: EXTERNAL_API_KEY
  TFM_API_KEY: TFM_API_KEY
  EXTERNAL_API_URL: EXTERNAL_API_URL
  TFM_API_URL: TFM_API_URL
}

var appSettings = union(settings, staticSettings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv, settingsCalculated, keyVaultSecureSettings)

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: containerRegistryName
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' existing = {
  name: storageAccountName
}
resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' existing = {
  name: cosmosDbAccountName
}

module portalApiWebapp 'webapp.bicep' = {
  name: 'portalApiWebapp'
  params: {
    appServicePlanEgressSubnetId: appServicePlanEgressSubnetId
    appServicePlanId: appServicePlanId
    appSettings: appSettings
    azureWebsitesDnsZoneId: azureWebsitesDnsZoneId
    connectionStrings: connectionStringsProperties
    deployApplicationInsights: true
    dockerImageName: dockerImageName
    ftpsState: 'Disabled'
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspaceId
    privateEndpointsSubnetId: privateEndpointsSubnetId
    resourceNameFragment: resourceNameFragment
    scmMinTlsVersion: '1.2'
    product: product
    version: version
    target: target
  }
}

output defaultHostName string = portalApiWebapp.outputs.defaultHostName
