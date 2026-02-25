param location string
param environment string
param containerRegistryName string
param appServicePlanEgressSubnetId string
param appServicePlanId string
param privateEndpointsSubnetId string
param cosmosDbAccountName string
param cosmosDbDatabaseName string
param logAnalyticsWorkspaceId string
param externalApiHostname string
param dtfsCentralApiHostname string
param tfmApiHostname string
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
param port string
param websitesPort string
param websiteDynamicCache string
param websiteHttploggingRetentionDays string
param websiteNodeDefaultVersion string
param timeZone string

var containerRegistryLoginServer = containerRegistry.properties.loginServer
var dockerImageName = '${containerRegistryLoginServer}/${resourceNameFragment}:${environment}'
var staticSettings = {
  CLAMAV_HOST: clamAvSettings.ipAddress
  CLAMAV_PORT: clamAvSettings.port
  CLAMAV_DEBUG_MODE_ENABLED: 'true'
  CLAMAV_SCANNING_ENABLED: 'true'
  WEBSITE_DNS_SERVER: azureDnsServerIp
  WEBSITE_VNET_ROUTE_ALL: '1'
  PORT: port
  WEBSITES_PORT: websitesPort
}
var dtfsCentralApiUrl = 'https://${dtfsCentralApiHostname}'
var externalApiUrl = 'https://${externalApiHostname}'
var tfmApiUrl = 'https://${tfmApiHostname}'

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
  DTFS_CENTRAL_API_URL: dtfsCentralApiUrl
  EXTERNAL_API_URL: externalApiUrl
  TFM_API_URL: tfmApiUrl
}
var nodeEnv = nodeDeveloperMode ? { NODE_ENV: 'development' } : {}
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
var appSettings = union(settings, staticSettings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv, settingsCalculated)

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
    deployApplicationInsights: false 
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
