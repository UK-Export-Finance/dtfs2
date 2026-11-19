param location string
param environment string
param product string
param target string
param version string
param containerRegistryName string
param appServicePlanEgressSubnetId string
param appServicePlanId string
param privateEndpointsSubnetId string
param cosmosDbAccountName string
param cosmosDbDatabaseName string
param logAnalyticsWorkspaceId string
param acbsFunctionDefaultHostName string
param numberGeneratorFunctionDefaultHostName string
param azureWebsitesDnsZoneId string
param nodeDeveloperMode bool
param resourceNameFragment string = 'external-api'
param settings object
@secure()
param secureSettings object
@secure()
param additionalSecureSettings object
param azureDnsServerIp string
param websiteHttploggingRetentionDays string
param timeZone string
@description('Companies House API URL.')
@secure()
param COMPANIES_HOUSE_API_URL string

@description('Ordnance Survey API URL.')
@secure()
param ORDNANCE_SURVEY_API_URL string

@description('CORS origin for the external API.')
@secure()
param CORS_ORIGIN string

@description('APIM TFS URL.')
@secure()
param APIM_TFS_URL string

@description('APIM TFS key.')
@secure()
param APIM_TFS_KEY string

@description('APIM TFS value.')
@secure()
param APIM_TFS_VALUE string

@description('APIM MDM URL.')
@secure()
param APIM_MDM_URL string

@description('APIM MDM key.')
@secure()
param APIM_MDM_KEY string

@description('APIM MDM value.')
@secure()
param APIM_MDM_VALUE string

@description('APIM E-Store URL.')
@secure()
param APIM_ESTORE_URL string

@description('APIM E-Store key.')
@secure()
param APIM_ESTORE_KEY string

@description('APIM E-Store value.')
@secure()
param APIM_ESTORE_VALUE string

@description('Companies House API key.')
@secure()
param COMPANIES_HOUSE_API_KEY string

@description('Ordnance Survey API key.')
@secure()
param ORDNANCE_SURVEY_API_KEY string

@description('GOV Notify API key.')
@secure()
param GOV_NOTIFY_API_KEY string

@description('GOV Notify email recipient.')
@secure()
param GOV_NOTIFY_EMAIL_RECIPIENT string

@description('UKEF internal notification email.')
@secure()
param UKEF_INTERNAL_NOTIFICATION_EMAIL string

@description('External API key.')
@secure()
param EXTERNAL_API_KEY string


var containerRegistryLoginServer = containerRegistry.properties.loginServer
var dockerImageName = '${containerRegistryLoginServer}/${resourceNameFragment}:${environment}'
var cosmosDbConnectionStrings = cosmosDbAccount.listConnectionStrings().connectionStrings
var mongoDbConnectionString = length(cosmosDbConnectionStrings) > 0 ? replace(cosmosDbConnectionStrings[0].connectionString, '&replicaSet=globaldb', '') : ''

var staticSettings = {
  MONGO_INITDB_DATABASE: cosmosDbDatabaseName
  MONGODB_URI: mongoDbConnectionString
  AZURE_ACBS_FUNCTION_URL: 'https://${acbsFunctionDefaultHostName}'
  AZURE_NUMBER_GENERATOR_FUNCTION_URL: 'https://${numberGeneratorFunctionDefaultHostName}'
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
  WEBSITE_HTTPLOGGING_RETENTION_DAYS: websiteHttploggingRetentionDays
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
}

var nodeEnv = nodeDeveloperMode ? { NODE_ENV: 'production' } : {}

var keyVaultSecureSettings = {
  COMPANIES_HOUSE_API_URL: COMPANIES_HOUSE_API_URL
  ORDNANCE_SURVEY_API_URL: ORDNANCE_SURVEY_API_URL
  CORS_ORIGIN: CORS_ORIGIN
  APIM_TFS_URL: APIM_TFS_URL
  APIM_TFS_KEY: APIM_TFS_KEY
  APIM_TFS_VALUE: APIM_TFS_VALUE
  APIM_MDM_URL: APIM_MDM_URL
  APIM_MDM_KEY: APIM_MDM_KEY
  APIM_MDM_VALUE: APIM_MDM_VALUE
  APIM_ESTORE_URL: APIM_ESTORE_URL
  APIM_ESTORE_KEY: APIM_ESTORE_KEY
  APIM_ESTORE_VALUE: APIM_ESTORE_VALUE
  COMPANIES_HOUSE_API_KEY: COMPANIES_HOUSE_API_KEY
  ORDNANCE_SURVEY_API_KEY: ORDNANCE_SURVEY_API_KEY
  GOV_NOTIFY_API_KEY: GOV_NOTIFY_API_KEY
  GOV_NOTIFY_EMAIL_RECIPIENT: GOV_NOTIFY_EMAIL_RECIPIENT
  UKEF_INTERNAL_NOTIFICATION_EMAIL: UKEF_INTERNAL_NOTIFICATION_EMAIL
  EXTERNAL_API_KEY: EXTERNAL_API_KEY
}

var appSettings = union(settings, staticSettings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv, keyVaultSecureSettings)

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: containerRegistryName
}

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' existing = {
  name: cosmosDbAccountName
}

module externalApiWebapp 'webapp.bicep' = {
  name: 'externalApiWebapp'
  params: {
    appServicePlanEgressSubnetId: appServicePlanEgressSubnetId
    appServicePlanId: appServicePlanId
    appSettings: appSettings
    azureWebsitesDnsZoneId: azureWebsitesDnsZoneId
    connectionStrings: {}
    deployApplicationInsights: true
    dockerImageName: dockerImageName
    ftpsState: 'FtpsOnly'
    location: location
    product: product
    target: target
    version: version
    logAnalyticsWorkspaceId: logAnalyticsWorkspaceId
    privateEndpointsSubnetId: privateEndpointsSubnetId
    resourceNameFragment: resourceNameFragment
    scmMinTlsVersion: '1.2'
    selfHostnameEnvironmentVariable: 'EXTERNAL_API_URL'
  }
}

output defaultHostName string = externalApiWebapp.outputs.defaultHostName
