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

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureSettings object
// These values are taken from an export of Configuration on Dev (& validating with staging).
@secure()
param additionalSecureSettings object

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: containerRegistryName
}
var containerRegistryLoginServer = containerRegistry.properties.loginServer
var dockerImageName = '${containerRegistryLoginServer}/${resourceNameFragment}:${environment}'

// https://learn.microsoft.com/en-us/azure/virtual-network/what-is-ip-address-168-63-129-16
var azureDnsServerIp = '168.63.129.16'

// These values are hardcoded in the CLI scripts, derived in the script or set from normal env variables or vars
var staticSettings = {
  // hard coded
  WEBSITE_DNS_SERVER: azureDnsServerIp
  WEBSITE_VNET_ROUTE_ALL: '1'
  PORT: '5000'
  WEBSITES_PORT: '5000'
}

// These values are taken from an export of Configuration on Dev (& validating with staging).
var additionalSettings = {
  // Note that the `webapp` module will add:
  // APPLICATIONINSIGHTS_CONNECTION_STRING: applicationInsights.properties.ConnectionString
  // Note that the config has APPINSIGHTS_INSTRUMENTATIONKEY as a slot setting, though the advice
  // is not to use at the same time as its replacement - APPLICATIONINSIGHTS_CONNECTION_STRING
  // APPINSIGHTS_INSTRUMENTATIONKEY: applicationInsights.properties.InstrumentationKey
  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: containerRegistryLoginServer
  DOCKER_REGISTRY_SERVER_USERNAME: containerRegistry.listCredentials().username
  DOCKER_REGISTRY_SERVER_PASSWORD: containerRegistry.listCredentials().passwords[0].value
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'
  TZ: 'Europe/London'
  WEBSITE_HTTPLOGGING_RETENTION_DAYS: '3'
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
}

var nodeEnv = nodeDeveloperMode ? { NODE_ENV: 'development' } : {}

// These have come from the CLI scripts
var mongoDbConnectionString = replace(cosmosDbAccount.listConnectionStrings().connectionStrings[0].connectionString, '&replicaSet=globaldb', '')
var calculatedSettings = {
  MONGO_INITDB_DATABASE: cosmosDbDatabaseName
  MONGODB_URI: mongoDbConnectionString
}

var appSettings = union(settings, staticSettings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv, calculatedSettings)

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
    scmMinTlsVersion: '1.0'
  }
}

output defaultHostName string = dtfsCentralApiWebapp.outputs.defaultHostName
