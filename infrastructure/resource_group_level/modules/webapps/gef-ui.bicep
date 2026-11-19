param location string
param environment string
param containerRegistryName string

@description('Portal API key.')
@secure()
param PORTAL_API_KEY string

param appServicePlanEgressSubnetId string
param appServicePlanId string
param privateEndpointsSubnetId string
param logAnalyticsWorkspaceId string
param portalApiHostname string
param redisName string
param azureWebsitesDnsZoneId string
param nodeDeveloperMode bool
param product string
param target string
param version string
param resourceNameFragment string = 'gef-ui'
param settings object
@secure()
param secureSettings object
@secure()
param additionalSecureSettings object
@secure()
param secureConnectionStrings object
@secure()
param additionalSecureConnectionStrings object
param azureDnsServerIp string
param websiteHttploggingRetentionDays string
param timeZone string

@description('Session secret for the portal UI.')
@secure()
param SESSION_SECRET string

var containerRegistryLoginServer = containerRegistry.properties.loginServer
var dockerImageName = '${containerRegistryLoginServer}/${resourceNameFragment}:${environment}'
var portalApiUrl = 'https://${portalApiHostname}'
var staticSettings = {
  PORTAL_API_URL: portalApiUrl
  REDIS_HOSTNAME: redis.properties.hostName
  REDIS_PORT: redis.properties.sslPort
  REDIS_KEY: redis.listKeys().primaryKey
  HTTPS: 1
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
var connectionStringsCalculated = { }
var connectionStringsCombined = union(connectionStringsProperties, connectionStringsCalculated)
var nodeEnv = nodeDeveloperMode ? { NODE_ENV: 'production' } : {}

var keyVaultSecureSettings = {
  PORTAL_API_KEY: PORTAL_API_KEY
  SESSION_SECRET: SESSION_SECRET
}

var appSettings = union(settings, staticSettings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv, keyVaultSecureSettings)
var connectionStringsList = [for item in items(union(secureConnectionStrings, additionalSecureConnectionStrings)): {
  name: item.key
  value: item.value
} ]

var connectionStringsProperties = toObject(connectionStringsList, item => item.name, item => {
  type: 'Custom'
  value: item.value
} )


resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: containerRegistryName
}

resource redis 'Microsoft.Cache/redis@2024-11-01' existing = {
  name: redisName
}

module gefUiWebapp 'webapp.bicep' = {
  name: 'gefUiWebapp'
  params: {
    appServicePlanEgressSubnetId: appServicePlanEgressSubnetId
    appServicePlanId: appServicePlanId
    appSettings: appSettings
    azureWebsitesDnsZoneId: azureWebsitesDnsZoneId
    connectionStrings: connectionStringsCombined
    deployApplicationInsights: true
    dockerImageName: dockerImageName
    ftpsState: 'FtpsOnly'
    location: location
    product: product
    version: version
    target: target
    logAnalyticsWorkspaceId: logAnalyticsWorkspaceId
    privateEndpointsSubnetId: privateEndpointsSubnetId
    resourceNameFragment: resourceNameFragment
    scmMinTlsVersion: '1.2'
  }
}

output defaultHostName string = gefUiWebapp.outputs.defaultHostName
