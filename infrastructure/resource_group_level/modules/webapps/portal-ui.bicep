param location string
param environment string
param containerRegistryName string
param appServicePlanEgressSubnetId string
param appServicePlanId string
param privateEndpointsSubnetId string
param logAnalyticsWorkspaceId string
//param externalApiHostname string
param tfmApiHostname string
param portalApiHostname string
param redisName string
param azureWebsitesDnsZoneId string
param nodeDeveloperMode bool
param clamAvSettings {
  ipAddress: string
  port: int
}

param resourceNameFragment string = 'portal-ui'
param product string
param target string
param version string

param settings object

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureSettings object

// These values are taken from an export of Configuration on Dev (& validating with staging).
@secure()
param additionalSecureSettings object
// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureConnectionStrings object
// These values are taken from an export of Connection strings on Dev (& validating with staging).
@secure()
param additionalSecureConnectionStrings object

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: containerRegistryName
}
var containerRegistryLoginServer = containerRegistry.properties.loginServer
var dockerImageName = '${containerRegistryLoginServer}/${resourceNameFragment}:${environment}'

resource redis 'Microsoft.Cache/redis@2024-11-01' existing = {
  name: redisName
}

var portalApiUrl = 'https://${portalApiHostname}'

// https://learn.microsoft.com/en-us/azure/virtual-network/what-is-ip-address-168-63-129-16
var azureDnsServerIp = '168.63.129.16'

// These values are hardcoded in the CLI scripts, derived in the script or set from normal env variables
var staticSettings = {
  // derived
  PORTAL_API_URL: portalApiUrl
  REDIS_HOSTNAME: redis.properties.hostName
  REDIS_PORT: redis.properties.sslPort
  REDIS_KEY: redis.listKeys().primaryKey
  HTTPS: 1

  CLAMAV_HOST: clamAvSettings.ipAddress
  CLAMAV_PORT: clamAvSettings.port
  CLAMAV_DEBUG_MODE_ENABLED: 'true'
  CLAMAV_SCANNING_ENABLED: 'true'

  // hard coded
  WEBSITE_DNS_SERVER: azureDnsServerIp
  WEBSITE_VNET_ROUTE_ALL: '1'
  PORT: '5000'
  WEBSITES_PORT: '5000'
}

// These values are taken from an export of Configuration on Dev (& validating with staging).
var tfmApiUrl = 'https://${tfmApiHostname}'

var additionalSettings = {
  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: containerRegistryLoginServer
  DOCKER_REGISTRY_SERVER_USERNAME: containerRegistry.listCredentials().username
  DOCKER_REGISTRY_SERVER_PASSWORD: containerRegistry.listCredentials().passwords[0].value
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'
  TFM_API_URL: tfmApiUrl
  TZ: 'Europe/London'
  WEBSITE_HEALTHCHECK_MAXPINGFAILURES: 10
  WEBSITE_HTTPLOGGING_RETENTION_DAYS: '3'
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
}

var nodeEnv = nodeDeveloperMode ? { NODE_ENV: 'development' } : {}

var appSettings = union(settings, staticSettings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv)

var connectionStringsList = [for item in items(union(secureConnectionStrings, additionalSecureConnectionStrings)): {
  name: item.key
  value: item.value
} ]

var connectionStringsProperties = toObject(connectionStringsList, item => item.name, item => {
  type: 'Custom'
  value: item.value
} )


// Then there are the calculated values.
var connectionStringsCalculated = { }
var connectionStringsCombined = union(connectionStringsProperties, connectionStringsCalculated)

module portalUiWebapp 'webapp.bicep' = {
  name: 'portalUiWebapp'
  params: {
    appServicePlanEgressSubnetId: appServicePlanEgressSubnetId
    appServicePlanId: appServicePlanId
    appSettings: appSettings
    azureWebsitesDnsZoneId: azureWebsitesDnsZoneId
    connectionStrings: connectionStringsCombined
    deployApplicationInsights: false // TODO:DTFS2-6422 enable application insights
    dockerImageName: dockerImageName
    ftpsState: 'Disabled'
    product: product
    target: target
    version: version
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspaceId
    privateEndpointsSubnetId: privateEndpointsSubnetId
    resourceNameFragment: resourceNameFragment
    scmMinTlsVersion: '1.0'
  }
}

output defaultHostName string = portalUiWebapp.outputs.defaultHostName
