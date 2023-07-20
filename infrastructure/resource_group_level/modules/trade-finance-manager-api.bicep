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
param storageAccountName string

var dockerImageName = '${containerRegistryName}.azurecr.io/trade-finance-manager-api:${environment}'
var dockerRegistryServerUsername = 'tfs${environment}'

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
  // TODO:FN-429 Note that this has a value like https://tfs-dev-tfm-fd.azurefd.net 
  // while in the CLI it is injected as a secret, we can probably calculate it from the Front Door component.
  TFM_URI: 'test-value'
  AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE: 'test-value'
  JWT_SIGNING_KEY: 'test-value' // NOTE - in the export this appears to be a slot setting. However, we don't need to replicate that.
}

// These values are taken from an export of Connection strings on Dev (& validating with staging).
@secure()
param additionalSecureConnectionStrings object = {
  GOV_NOTIFY_EMAIL_RECIPIENT: 'test-value'
}


// https://learn.microsoft.com/en-us/azure/virtual-network/what-is-ip-address-168-63-129-16
var azureDnsServerIp = '168.63.129.16'

// These values are hardcoded in the CLI scripts
var settings = {
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
  // Note that the dev & staging didn't have AI enabled
  // If enabling, consider using APPLICATIONINSIGHTS_CONNECTION_STRING instead
  // APPINSIGHTS_INSTRUMENTATIONKEY: applicationInsights.properties.InstrumentationKey
  // APPLICATIONINSIGHTS_CONNECTION_STRING: applicationInsights.properties.ConnectionString
  
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

var nodeEnv = environment == 'dev' ? { NODE_ENV: 'development' } : {}

var appSettings = union(settings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv)

var tfmApiName = 'tfs-${environment}-trade-finance-manager-api'
var privateEndpointName = 'tfs-${environment}-trade-finance-manager-api'
var applicationInsightsName = 'tfs-${environment}-trade-finance-manager-api'


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
    value: 'TODO:FN-420'
  }
} 


var connectionStringsCombined = union(connectionStringsProperties, connectionStringsCalculated)


resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' existing = {
  name: cosmosDbAccountName
}

resource tfmApi 'Microsoft.Web/sites@2022-09-01' = {
  name: tfmApiName
  location: location
  tags: {
    Environment: 'Preproduction'
  }
  kind: 'app,linux,container'
  properties: {
    httpsOnly: false
    serverFarmId: appServicePlanId
    siteConfig: {
      numberOfWorkers: 1
      linuxFxVersion: 'DOCKER|${dockerImageName}'
      acrUseManagedIdentityCreds: false
      alwaysOn: true
      http20Enabled: true
      functionAppScaleLimit: 0
      // non-default parameter
      logsDirectorySizeLimit: 100 // default is 35
      // The following Fields have been added after comparing with dev
      vnetRouteAllEnabled: true
      ftpsState: 'Disabled'
      scmMinTlsVersion: '1.0'
      remoteDebuggingVersion: 'VS2019'
      httpLoggingEnabled: true // false in staging, true in prod
    }
    virtualNetworkSubnetId: appServicePlanEgressSubnetId
  }
}

resource tfmApiSettings 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: tfmApi
  name: 'appsettings'
  properties: appSettings
}

resource tfmApiConnectionStrings 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: tfmApi
  name: 'connectionstrings'
  properties: connectionStringsCombined
}

// The private endpoint is taken from the cosmosdb/private-endpoint export
resource tfmApiPrivateEndpoint 'Microsoft.Network/privateEndpoints@2022-11-01' = {
  name: privateEndpointName
  location: location
  tags: {
    Environment: 'Preproduction'
  }
  properties: {
    privateLinkServiceConnections: [
      {
        name: privateEndpointName
        properties: {
          privateLinkServiceId: tfmApi.id
          groupIds: [
            'sites'
          ]
          privateLinkServiceConnectionState: {
            status: 'Approved'
            actionsRequired: 'None'
          }
        }
      }
    ]
    manualPrivateLinkServiceConnections: []
    subnet: {
      id: privateEndpointsSubnetId
    }
    ipConfigurations: []
    // Note that the customDnsConfigs array gets created automatically and doesn't need setting here.
  }
}

// Application insights isn't enabled in Dev or staging, but is in prod.
// resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
//   name: applicationInsightsName
//   location: location
//   tags: {
//     Environment: 'Preproduction'
//   }
//   kind: 'web'
//   properties: {
//     Application_Type: 'web'
//     Flow_Type: 'Redfield'
//     Request_Source: 'IbizaAIExtensionEnablementBlade'
//     RetentionInDays: 90
//     WorkspaceResourceId: logAnalyticsWorkspaceId
//     IngestionMode: 'LogAnalytics'
//     publicNetworkAccessForIngestion: 'Enabled'
//     publicNetworkAccessForQuery: 'Enabled'
//   }
// }

output defaultHostName string = tfmApi.properties.defaultHostName
