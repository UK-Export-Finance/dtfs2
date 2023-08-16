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
param numberGeneratorFunctionDefaultHostName string
param azureWebsitesDnsZoneId string
param nodeDeveloperMode bool

param resourceNameFragment string = 'trade-finance-manager-api'

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureSettings object = {

}

// These values are taken from an export of Configuration on Dev (& validating with staging).
@secure()
param additionalSecureSettings object = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'
  UKEF_INTERNAL_NOTIFICATION: 'test-value'
  DTFS_CENTRAL_API_KEY: 'test-value'
  EXTERNAL_API_KEY: 'test-value'
  JWT_VALIDATING_KEY: 'test-value'
  PORTAL_API_KEY: 'test-value'
  TFM_API_KEY: 'test-value'
}

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureConnectionStrings object = {
  // NOTE that CORS_ORIGIN is not present in the variables exported from dev or staging
  CORS_ORIGIN: 'test-value'
  UKEF_TFM_API_SYSTEM_KEY: 'test-value'
  UKEF_TFM_API_REPORTS_KEY: 'test-value'
  // TODO:FN-429 Note that TFM_UI_URL (renamed from TFM_URI) has a value like https://tfs-dev-tfm-fd.azurefd.net 
  // while in the CLI it is injected as a secret, we can probably calculate it from the Front Door component.
  TFM_UI_URL: 'test-value'
  AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE: 'test-value'
  JWT_SIGNING_KEY: 'test-value' // NOTE - in the export this appears to be a slot setting. However, we don't need to replicate that.
}

// These values are taken from an export of Connection strings on Dev (& validating with staging).
@secure()
param additionalSecureConnectionStrings object = {
  GOV_NOTIFY_EMAIL_RECIPIENT: 'test-value'
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
// TODO:FN-741 - access APIs over HTTPS.
var dtfsCentralApiUrl = 'http://${dtfsCentralApiHostname}'
// Note that in the CLI script, http was used, but the value in the exported config was https.
var externalApiUrl = 'https://${externalApiHostname}'

var additionalSettings = {
  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: '${containerRegistryName}.azurecr.io'
  DOCKER_REGISTRY_SERVER_USERNAME: dockerRegistryServerUsername
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'
  TZ: 'Europe/London'
  WEBSITE_HTTPLOGGING_RETENTION_DAYS: '3'
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
  
  // TODO:DTFS2-6422 Note that DTFS_CENTRAL_API_URL & EXTERNAL_API_URL are also in Connection Strings! (via CLI)
  // We may want to remove one set.
  DTFS_CENTRAL_API_URL: dtfsCentralApiUrl
  EXTERNAL_API_URL: externalApiUrl
}

var nodeEnv = nodeDeveloperMode ? { NODE_ENV: 'development' } : {}

var appSettings = union(settings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv)

var connectionStringsList = [for item in items(union(secureConnectionStrings, additionalSecureConnectionStrings)): {
  name: item.key
  value: item.value
} ]

var connectionStringsProperties = toObject(connectionStringsList, item => item.name, item => {
  type: 'Custom'
  value: item.value
} )


// Then there are the calculated values. 
var mongoDbConnectionString = replace(cosmosDbAccount.listConnectionStrings().connectionStrings[0].connectionString, '&replicaSet=globaldb', '')

var connectionStringsCalculated = {  
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
  AZURE_NUMBER_GENERATOR_FUNCTION_URL: {
    type: 'Custom'
    value: 'https://${numberGeneratorFunctionDefaultHostName}'
  }
} 

var connectionStringsCombined = union(connectionStringsProperties, connectionStringsCalculated)

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' existing = {
  name: cosmosDbAccountName
}

module tfmApi 'webapp.bicep' = {
  name: 'tfmApi'
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

output defaultHostName string = tfmApi.outputs.defaultHostName
