param location string
param environment string
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

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureSettings object

// These values are taken from an export of Configuration on Dev (& validating with staging),
// that look like they need to be kept secure.
@secure()
param additionalSecureSettings object

var dockerImageName = '${containerRegistryName}.azurecr.io/${resourceNameFragment}:${environment}'
var dockerRegistryServerUsername = 'tfs${environment}'

// https://learn.microsoft.com/en-us/azure/virtual-network/what-is-ip-address-168-63-129-16
var azureDnsServerIp = '168.63.129.16'

var mongoDbConnectionString = replace(cosmosDbAccount.listConnectionStrings().connectionStrings[0].connectionString, '&replicaSet=globaldb', '')

// These values are hardcoded in the CLI scripts, derived in the script or set from normal env variables or vars
var staticSettings = {
    // derived
  MONGO_INITDB_DATABASE: cosmosDbDatabaseName
  MONGODB_URI: mongoDbConnectionString
  AZURE_ACBS_FUNCTION_URL: 'https://${acbsFunctionDefaultHostName}'
  AZURE_NUMBER_GENERATOR_FUNCTION_URL: 'https://${numberGeneratorFunctionDefaultHostName}'

  // hard coded
  WEBSITE_DNS_SERVER: azureDnsServerIp
  WEBSITE_VNET_ROUTE_ALL: '1'
  PORT: '5000'
  WEBSITES_PORT: '5000'
}

// These values are taken from an export of Configuration on Dev (& validating with staging).
var additionalSettings = {
  // Note that the config didn't have AI enabled
  // APPLICATIONINSIGHTS_CONNECTION_STRING: applicationInsights.properties.ConnectionString

  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: '${containerRegistryName}.azurecr.io'
  DOCKER_REGISTRY_SERVER_USERNAME: dockerRegistryServerUsername
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'

  WEBSITE_HTTPLOGGING_RETENTION_DAYS: '3'
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
}

var nodeEnv = nodeDeveloperMode ? { NODE_ENV: 'development' } : {}

var appSettings = union(settings, staticSettings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv)

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' existing = {
  name: cosmosDbAccountName
}


module externalApi 'webapp.bicep' = {
  name: 'externalApi'
  params: {
    appServicePlanEgressSubnetId: appServicePlanEgressSubnetId
    appServicePlanId: appServicePlanId
    appSettings: appSettings
    azureWebsitesDnsZoneId: azureWebsitesDnsZoneId
    connectionStrings: {}
    deployApplicationInsights: false // TODO:DTFS2-6422 enable application insights
    dockerImageName: dockerImageName
    environment: environment
    ftpsState: 'FtpsOnly'
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspaceId
    privateEndpointsSubnetId: privateEndpointsSubnetId
    resourceNameFragment: resourceNameFragment
    scmMinTlsVersion: '1.2'
  }
}

output defaultHostName string = externalApi.outputs.defaultHostName
