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
param azureWebsitesDnsZoneId string
param nodeDeveloperMode bool
param resourceNameFragment string = 'dtfs-central-api'
param settings object
@secure()
param secureSettings object
@secure()
param additionalSecureSettings object
param azureDnsServerIp string
param websiteHttploggingRetentionDays string
param timeZone string
@description('API key required to access the Portal API.')
@secure()
param PORTAL_API_KEY string

@description('Authentication key used by services to call the DTFS Central API.')
@secure()
param DTFS_CENTRAL_API_KEY string

@description('Password used to authenticate with the Audit API.')
@secure()
param AUDIT_API_PASSWORD string

@description('Username used to authenticate with the Audit API.')
@secure()
param AUDIT_API_USERNAME string

@description('API key used by external integrations to call system APIs.')
@secure()
param EXTERNAL_API_KEY string

@description('JWT signing key used to generate authentication tokens.')
@secure()
param JWT_SIGNING_KEY string

@description('JWT validation key used to verify authentication tokens.')
@secure()
param JWT_VALIDATING_KEY string

@description('Name of the SQL database.')
@secure()
param SQL_DB_NAME string

@description('Host of the SQL database.')
@secure()
param SQL_DB_HOST string

@description('Username for the SQL database.')
@secure()
param SQL_DB_USERNAME string

@description('Password for the SQL database.')
@secure()
param SQL_DB_PASSWORD string

@description('Port for the SQL database.')
@secure()
param SQL_DB_PORT string

@description('API key required to access the TFM API.')
@secure()
param TFM_API_KEY string

@description('Email address used for UKEF GEF reporting.')
@secure()
param UKEF_GEF_REPORTING_EMAIL_RECIPIENT string

@description('URL of the Audit API.')
@secure()
param AUDIT_API_URL string


resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: containerRegistryName
}
var containerRegistryLoginServer = containerRegistry.properties.loginServer
var dockerImageName = '${containerRegistryLoginServer}/${resourceNameFragment}:${environment}'
var staticSettings = {
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
var cosmosDbConnectionStrings = cosmosDbAccount.listConnectionStrings().connectionStrings
var mongoDbConnectionString = length(cosmosDbConnectionStrings) > 0 ? replace(cosmosDbConnectionStrings[0].connectionString, '&replicaSet=globaldb', '') : ''
var calculatedSettings = {
  MONGO_INITDB_DATABASE: cosmosDbDatabaseName
  MONGODB_URI: mongoDbConnectionString
}

var keyVaultSecureSettings = {
  PORTAL_API_KEY: PORTAL_API_KEY
  DTFS_CENTRAL_API_KEY: DTFS_CENTRAL_API_KEY
  AUDIT_API_PASSWORD: AUDIT_API_PASSWORD
  AUDIT_API_USERNAME: AUDIT_API_USERNAME
  EXTERNAL_API_KEY: EXTERNAL_API_KEY
  JWT_SIGNING_KEY: JWT_SIGNING_KEY
  JWT_VALIDATING_KEY: JWT_VALIDATING_KEY
  SQL_DB_HOST: SQL_DB_HOST
  SQL_DB_NAME: SQL_DB_NAME
  SQL_DB_PASSWORD: SQL_DB_PASSWORD
  SQL_DB_PORT: SQL_DB_PORT
  SQL_DB_USERNAME: SQL_DB_USERNAME
  TFM_API_KEY: TFM_API_KEY
  UKEF_GEF_REPORTING_EMAIL_RECIPIENT: UKEF_GEF_REPORTING_EMAIL_RECIPIENT
  AUDIT_API_URL: AUDIT_API_URL
}

var appSettings = union(settings, staticSettings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv, calculatedSettings, keyVaultSecureSettings)

var connectionStrings = { }

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' existing = {
  name: cosmosDbAccountName
}

module dtfsCentralApiWebapp 'webapp.bicep' = {
  name: 'dtfsCentralApiWebapp'
  params: {
    appServicePlanEgressSubnetId: appServicePlanEgressSubnetId
    appServicePlanId: appServicePlanId
    appSettings: appSettings
    azureWebsitesDnsZoneId: azureWebsitesDnsZoneId
    connectionStrings: connectionStrings
    deployApplicationInsights: true
    dockerImageName: dockerImageName
    ftpsState: 'Disabled'
    location: location
    product: product
    target: target
    version: version
    logAnalyticsWorkspaceId: logAnalyticsWorkspaceId
    privateEndpointsSubnetId: privateEndpointsSubnetId
    resourceNameFragment: resourceNameFragment
    scmMinTlsVersion: '1.2'
  }
}

output defaultHostName string = dtfsCentralApiWebapp.outputs.defaultHostName
