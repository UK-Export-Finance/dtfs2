// We need to add the calculated variables after beacause the value tfmUri comes from the TFM front-door, which would produce a circular dependency.
// See the notes in trade-finance-manager-api-no-calculated-variables.bicep

param environment string
param cosmosDbAccountName string
param cosmosDbDatabaseName string
param containerRegistryName string
param externalApiHostname string
param dtfsCentralApiHostname string
param nodeDeveloperMode bool
param numberGeneratorFunctionDefaultHostName string
param tfmUiUrl string
param storageAccountName string
param settings object

var tfmApiNameFragment = 'trade-finance-manager-api'
var tfmApiName = 'tfs-${environment}-${tfmApiNameFragment}'
var applicationInsightsName = 'tfs-${environment}-${tfmApiNameFragment}'

var deployApplicationInsights = false // TODO:DTFS2-6422 enable application insights
var selfHostnameEnvironmentVariable = ''

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureSettings object
@secure()
param secureConnectionStrings object

// These values are taken from an export of Connection strings on Dev (& validating with staging).
@secure()
param additionalSecureSettings object
@secure()
param additionalSecureConnectionStrings object


resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' existing = {
  name: containerRegistryName
}
var containerRegistryLoginServer = containerRegistry.properties.loginServer

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
// TODO:FN-741 - access APIs over HTTPS.
var dtfsCentralApiUrl = 'http://${dtfsCentralApiHostname}'
// Note that in the CLI script, http was used, but the value in the exported config was https.
var externalApiUrl = 'https://${externalApiHostname}'

var additionalSettings = {
  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: containerRegistryLoginServer
  DOCKER_REGISTRY_SERVER_USERNAME: containerRegistry.listCredentials().username
  DOCKER_REGISTRY_SERVER_PASSWORD: containerRegistry.listCredentials().passwords[0].value
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'
  TZ: 'Europe/London'
  WEBSITE_HTTPLOGGING_RETENTION_DAYS: '3'
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
  
  DTFS_CENTRAL_API_URL: dtfsCentralApiUrl
  EXTERNAL_API_URL: externalApiUrl
}

var connectionStringsList = [for item in items(union(secureConnectionStrings, additionalSecureConnectionStrings)): {
  name: item.key
  value: item.value
} ]

var connectionStringsProperties = toObject(connectionStringsList, item => item.name, item => {
  type: 'Custom'
  value: item.value
} )

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' existing = {
  name: cosmosDbAccountName
}

// Then there are the calculated values.
var mongoDbConnectionString = replace(cosmosDbAccount.listConnectionStrings().connectionStrings[0].connectionString, '&replicaSet=globaldb', '')

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' existing = {
  name: storageAccountName
}
var storageAccountKey = storageAccount.listKeys().keys[0].value

var nodeEnv = nodeDeveloperMode ? { NODE_ENV: 'development' } : {}

var calculatedAppSettings = {
  MONGO_INITDB_DATABASE: cosmosDbDatabaseName
  MONGODB_URI: mongoDbConnectionString
  AZURE_NUMBER_GENERATOR_FUNCTION_URL: 'https://${numberGeneratorFunctionDefaultHostName}'
  TFM_UI_URL: tfmUiUrl
  AZURE_PORTAL_STORAGE_ACCESS_KEY: storageAccountKey
  AZURE_PORTAL_STORAGE_ACCOUNT: storageAccountName
}

var appSettings = union(
  settings, 
  staticSettings, 
  secureSettings, 
  additionalSettings, 
  additionalSecureSettings, 
  nodeEnv, 
  calculatedAppSettings,
  deployApplicationInsights ? {
    APPLICATIONINSIGHTS_CONNECTION_STRING: applicationInsights.properties.ConnectionString
    } : {},
  selfHostnameEnvironmentVariable == '' ? {} : {
      '${selfHostnameEnvironmentVariable}': site.properties.defaultHostName
    }
)

resource site 'Microsoft.Web/sites@2022-09-01' existing = {
  name: tfmApiName
}

resource webappSetting 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: site
  name: 'appsettings'
  properties: appSettings
}

resource webappConnectionStrings 'Microsoft.Web/sites/config@2022-09-01' = if (!empty(connectionStringsList)) {
  parent: site
  name: 'connectionstrings'
  properties: connectionStringsProperties
}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' existing = {
  name: applicationInsightsName
}
