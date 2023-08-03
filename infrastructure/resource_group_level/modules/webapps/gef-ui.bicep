param location string
param environment string
param containerRegistryName string
param appServicePlanEgressSubnetId string
param appServicePlanId string
param privateEndpointsSubnetId string
param logAnalyticsWorkspaceId string
param externalApiHostname string
param tfmApiHostname string
param portalApiHostname string
param redisName string
param azureWebsitesDnsZoneId string

var dockerImageName = '${containerRegistryName}.azurecr.io/gef-ui:${environment}'
var dockerRegistryServerUsername = 'tfs${environment}'

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureSettings object = {

}

// These values are taken from an export of Configuration on Dev (& validating with staging).
@secure()
param additionalSecureSettings object = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'
  DTFS_CENTRAL_API_KEY: 'test-value'
  EXTERNAL_API_KEY: 'test-value'
  PORTAL_API_KEY: 'test-value'
  TFM_API_KEY: 'test-value'
}

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureConnectionStrings object = {
  // TODO:FN-820 Remove COMPANIES_HOUSE_API_KEY as it is not referenced directly in gef-ui
  COMPANIES_HOUSE_API_KEY : 'test-value'
  SESSION_SECRET: 'test-value'
}

// These values are taken from an export of Connection strings on Dev (& validating with staging).
@secure()
param additionalSecureConnectionStrings object = {
}

resource redis 'Microsoft.Cache/redis@2022-06-01' existing = {
  name: redisName
}

var portalApiUrl = 'https://${portalApiHostname}'
// Note that for externalApiUrl in the CLI script, http was used, but the value in the exported config was https.
var externalApiUrl = 'https://${externalApiHostname}'


// https://learn.microsoft.com/en-us/azure/virtual-network/what-is-ip-address-168-63-129-16
var azureDnsServerIp = '168.63.129.16'

// These values are hardcoded in the CLI scripts, derived in the script or set from normal env variables
var settings = {
  // from env.
  // TODO:FN-820 Remove COMPANIES_HOUSE_API_URL as it is not referenced directly in gef-ui
  COMPANIES_HOUSE_API_URL: 'test-value'

  // derived
  PORTAL_API_URL: portalApiUrl
  REDIS_HOSTNAME: redis.properties.hostName
  REDIS_PORT: redis.properties.sslPort
  REDIS_KEY: redis.listKeys().primaryKey
  EXTERNAL_API_URL: externalApiUrl
  HTTPS: 1

  // hard coded
  WEBSITE_DNS_SERVER: azureDnsServerIp
  WEBSITE_VNET_ROUTE_ALL: '1'
  PORT: '5000'
  WEBSITES_PORT: '5000'
}

// These values are taken from an export of Configuration on Dev (& validating with staging).
var tfmApiUrl = 'https://${tfmApiHostname}'

var additionalSettings = {
  // Note that the dev & staging didn't have AI enabled
  // If enabling, consider using APPLICATIONINSIGHTS_CONNECTION_STRING instead
  // APPINSIGHTS_INSTRUMENTATIONKEY: applicationInsights.properties.InstrumentationKey
  // APPLICATIONINSIGHTS_CONNECTION_STRING: applicationInsights.properties.ConnectionString

  DEAL_API_URL: portalApiUrl // TODO:FN-805 remove DEAL_API_URL

  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: '${containerRegistryName}.azurecr.io'
  DOCKER_REGISTRY_SERVER_USERNAME: dockerRegistryServerUsername
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'
  TFM_API_URL: tfmApiUrl
  TZ: 'Europe/London'
  WEBSITE_HTTPLOGGING_RETENTION_DAYS: '3'
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
}

var nodeEnv = environment == 'dev' ? { NODE_ENV: 'development' } : {}

var appSettings = union(settings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv)

var gefUiName = 'tfs-${environment}-gef-ui'
var privateEndpointName = 'tfs-${environment}-gef-ui'
var applicationInsightsName = 'tfs-${environment}-gef-ui'


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

module gefUi 'webapp.bicep' = {
  name: 'gefUi'
  params: {
    applicationInsightsName: applicationInsightsName
    appName: gefUiName
    appServicePlanEgressSubnetId: appServicePlanEgressSubnetId
    appServicePlanId: appServicePlanId
    appSettings: appSettings
    azureWebsitesDnsZoneId: azureWebsitesDnsZoneId
    connectionStrings: connectionStringsCombined
    deployApplicationInsights: false // TODO:DTFS2-6422 enable application insights
    dockerImageName: dockerImageName
    ftpsState: 'FtpsOnly'
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspaceId
    privateEndpointName: privateEndpointName
    privateEndpointsSubnetId: privateEndpointsSubnetId
    scmMinTlsVersion: '1.2'
  }
}

output defaultHostName string = gefUi.outputs.defaultHostName
