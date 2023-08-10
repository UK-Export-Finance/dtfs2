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

param resourceNameFragment string = 'portal-api'

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureSettings object = {

}

// These values are taken from an export of Configuration on Dev (& validating with staging).
@secure()
param additionalSecureSettings object = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'
}

// These values are inlined in the CLI scripts
param connectionStrings object = {
  COMPANIES_HOUSE_API_URL: 'test-value' // from env
}

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureConnectionStrings object = {
  // NOTE that CORS_ORIGIN is not present in the variables exported from dev or staging
  CORS_ORIGIN: 'test-value'
  AZURE_PORTAL_EXPORT_FOLDER: 'test-value'
  AZURE_PORTAL_FILESHARE_NAME: 'test-value'
  JWT_SIGNING_KEY: 'test-value'
  JWT_VALIDATING_KEY: 'test-value'
  GOV_NOTIFY_API_KEY: 'test-value'
  GOV_NOTIFY_EMAIL_RECIPIENT: 'test-value'
  COMPANIES_HOUSE_API_KEY: 'test-value' // from env but looks a secret
}

var dockerImageName = '${containerRegistryName}.azurecr.io/${resourceNameFragment}:${environment}'
var dockerRegistryServerUsername = 'tfs${environment}'

// https://learn.microsoft.com/en-us/azure/virtual-network/what-is-ip-address-168-63-129-16
var azureDnsServerIp = '168.63.129.16'

// These values are hardcoded in the CLI scripts, derived in the script or set from normal env variables or vars
var settings = {
  // from vars.
  RATE_LIMIT_THRESHOLD: 'test-value'

  // hard coded
  WEBSITE_DNS_SERVER: azureDnsServerIp
  WEBSITE_VNET_ROUTE_ALL: '1'
  PORT: '5000'
  WEBSITES_PORT: '5000'
}

// These values are taken from an export of Configuration on Dev (& validating with staging).
var additionalSettings = {
  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: '${containerRegistryName}.azurecr.io'
  DOCKER_REGISTRY_SERVER_USERNAME: dockerRegistryServerUsername
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'
  TZ: 'Europe/London'
  WEBSITE_DYNAMIC_CACHE: '0'
  WEBSITE_HTTPLOGGING_RETENTION_DAYS: '3'
  WEBSITE_LOCAL_CACHE_OPTION: 'Never'
  WEBSITE_NODE_DEFAULT_VERSION: '16.14.0' // TODO:DTFS2-6422 consider making parameterisable
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
}

var nodeEnv = nodeDeveloperMode ? { NODE_ENV: 'development' } : {}

var appSettings = union(settings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv)

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

// Note that in the CLI script, http was used, but the value in the exported config was https.
var externalApiUrl = 'https://${externalApiHostname}'

// TODO:FN-741 - access APIs over HTTPS.
var dtfsCentralApiUrl = 'http://${dtfsCentralApiHostname}'
// TODO:FN-741 - access APIs over HTTPS.
var tfmApiUrl = 'https://${tfmApiHostname}'

var connectionStringsCalculated = {
  AZURE_PORTAL_STORAGE_ACCESS_KEY: {
    type: 'Custom'
    value: storageAccountKey
  }
  AZURE_PORTAL_STORAGE_ACCOUNT: {
    type: 'Custom'
    value: storageAccountName
  }
  MONGO_INITDB_DATABASE: {
    type: 'Custom'
    value: cosmosDbDatabaseName
  }
  MONGODB_URI: {
    type: 'Custom'
    value: mongoDbConnectionString
  }
  EXTERNAL_API_URL: {
    type: 'Custom'
    value: externalApiUrl
  }
  DTFS_CENTRAL_API_URL: {
    type: 'Custom'
    value: dtfsCentralApiUrl
  }
  TFM_API_URL: {
    type: 'Custom'
    value: tfmApiUrl
  }
}

var connectionStringsCombined = union(connectionStringsProperties, connectionStringsCalculated)

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' existing = {
  name: cosmosDbAccountName
}

module portalApi 'webapp.bicep' = {
  name: 'portalApi'
  params: {
    appServicePlanEgressSubnetId: appServicePlanEgressSubnetId
    appServicePlanId: appServicePlanId
    appSettings: appSettings
    azureWebsitesDnsZoneId: azureWebsitesDnsZoneId
    connectionStrings: connectionStringsCombined
    deployApplicationInsights: false // TODO:DTFS2-6422 enable application insights
    dockerImageName: dockerImageName
    environment: environment
    ftpsState: 'Disabled'
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspaceId
    privateEndpointsSubnetId: privateEndpointsSubnetId
    resourceNameFragment: resourceNameFragment
    scmMinTlsVersion: '1.0'
  }
}

output defaultHostName string = portalApi.outputs.defaultHostName
