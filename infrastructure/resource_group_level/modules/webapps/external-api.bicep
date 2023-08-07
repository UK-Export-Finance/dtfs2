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

var resourceNameFragment = 'external-api'
var dockerImageName = '${containerRegistryName}.azurecr.io/external-api:${environment}'
var dockerRegistryServerUsername = 'tfs${environment}'

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureSettings object = {
  CORS_ORIGIN: 'test-value'
  APIM_TFS_URL: 'test-value'
  APIM_TFS_KEY: 'test-value'
  APIM_TFS_VALUE: 'test-value'
  APIM_MDM_URL: 'test-value'
  APIM_MDM_KEY: 'test-value'
  APIM_MDM_VALUE: 'test-value'
  // TODO:FN-750 remove any remaining MULESOFT_API variables.
  MULESOFT_API_UKEF_ESTORE_EA_URL: 'test-value'
  MULESOFT_API_UKEF_ESTORE_EA_KEY: 'test-value'
  MULESOFT_API_UKEF_ESTORE_EA_SECRET: 'test-value'
  COMPANIES_HOUSE_API_KEY: 'test-value' // Actually set from an env variable but that's from a secret.
  ORDNANCE_SURVEY_API_KEY: 'test-value'
  GOV_NOTIFY_API_KEY: 'test-value'
  GOV_NOTIFY_EMAIL_RECIPIENT: 'test-value'
}

// These values are taken from an export of Configuration on Dev (& validating with staging),
// that look like they need to be kept secure.
@secure()
param additionalSecureSettings object = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'
}

// https://learn.microsoft.com/en-us/azure/virtual-network/what-is-ip-address-168-63-129-16
var azureDnsServerIp = '168.63.129.16'

var mongoDbConnectionString = replace(cosmosDbAccount.listConnectionStrings().connectionStrings[0].connectionString, '&replicaSet=globaldb', '')

// These values are hardcoded in the CLI scripts, derived in the script or set from normal env variables
var settings = {
  // from env.
  COMPANIES_HOUSE_API_URL: 'test-value'
  ORDNANCE_SURVEY_API_URL: 'test-value'
  MONGO_INITDB_DATABASE: cosmosDbDatabaseName

  // derived
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

var nodeEnv = environment == 'dev' ? { NODE_ENV: 'development' } : {}

var appSettings = union(settings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv)

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
