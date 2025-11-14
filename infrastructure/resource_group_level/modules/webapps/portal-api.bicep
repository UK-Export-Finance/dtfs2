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

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureSettings object

// These values are taken from an export of Configuration on Dev (& validating with staging).
@secure()
param additionalSecureSettings object

// These values are inlined in the CLI scripts
param connectionStrings object

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureConnectionStrings object

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: containerRegistryName
}
var containerRegistryLoginServer = containerRegistry.properties.loginServer
var dockerImageName = '${containerRegistryLoginServer}/${resourceNameFragment}:${environment}'

// https://learn.microsoft.com/en-us/azure/virtual-network/what-is-ip-address-168-63-129-16
var azureDnsServerIp = '168.63.129.16'

// These values are hardcoded in the CLI scripts, derived in the script or set from normal env variables or vars
var staticSettings = {
  // derived
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

// TODO:FN-741 - access APIs over HTTPS.
var dtfsCentralApiUrl = 'http://${dtfsCentralApiHostname}'
// Note that in the CLI script, http was used, but the value in the exported config was https.
var externalApiUrl = 'https://${externalApiHostname}'
// TODO:FN-741 - access APIs over HTTPS.
var tfmApiUrl = 'https://${tfmApiHostname}'

// These values are taken from an export of Configuration on Dev (& validating with staging).
var additionalSettings = {
  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: containerRegistryLoginServer
  DOCKER_REGISTRY_SERVER_USERNAME: containerRegistry.listCredentials().username
  DOCKER_REGISTRY_SERVER_PASSWORD: containerRegistry.listCredentials().passwords[0].value
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'
  TZ: 'Europe/London'
  WEBSITE_DYNAMIC_CACHE: '0'
  WEBSITE_HTTPLOGGING_RETENTION_DAYS: '3'
  WEBSITE_LOCAL_CACHE_OPTION: 'Never'
  WEBSITE_NODE_DEFAULT_VERSION: '16.14.0' // TODO:DTFS2-6422 consider making parameterisable
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


// Then there are the calculated values.
var mongoDbConnectionString = replace(cosmosDbAccount.listConnectionStrings().connectionStrings[0].connectionString, '&replicaSet=globaldb', '')

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' existing = {
  name: storageAccountName
}
var storageAccountKey = storageAccount.listKeys().keys[0].value

var settingsCalculated = {
  AZURE_PORTAL_STORAGE_ACCESS_KEY: storageAccountKey
  AZURE_PORTAL_STORAGE_ACCOUNT: storageAccountName
  MONGO_INITDB_DATABASE: cosmosDbDatabaseName
  MONGODB_URI: mongoDbConnectionString
}

var appSettings = union(settings, staticSettings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv, settingsCalculated)

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
    deployApplicationInsights: false // TODO:DTFS2-6422 enable application insights
    dockerImageName: dockerImageName
    ftpsState: 'Disabled'
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspaceId
    privateEndpointsSubnetId: privateEndpointsSubnetId
    resourceNameFragment: resourceNameFragment
    scmMinTlsVersion: '1.0'
    product: product
    version: version
    target: target
  }
}

output defaultHostName string = portalApiWebapp.outputs.defaultHostName
