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

var dockerImageName = '${containerRegistryName}.azurecr.io/portal-api:${environment}'
var dockerRegistryServerUsername = 'tfs${environment}'

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureSettings object = {

}

// These values are taken from an export of Configuration on Dev (& validating with staging).
@secure()
param additionalSecureSettings object = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'
}

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureConnectionStrings object = {
  // NOTE that CORS_ORIGIN is not present in the variables exported from dev or staging
  CORS_ORIGIN: 'test-value'
  AZURE_PORTAL_EXPORT_FOLDER: 'test-value'
  AZURE_PORTAL_FILESHARE_NAME: 'test-value'
  // TODO:FN-737 *_WORKFLOW_* variables are not needed and can be removed.
  AZURE_WORKFLOW_EXPORT_FOLDER: 'test-value'
  AZURE_WORKFLOW_FILESHARE_NAME: 'test-value'
  AZURE_WORKFLOW_IMPORT_FOLDER: 'test-value'
  AZURE_WORKFLOW_STORAGE_ACCOUNT: 'test-value'
  AZURE_WORKFLOW_STORAGE_ACCESS_KEY: 'test-value'
  JWT_SIGNING_KEY: 'test-value'
  JWT_VALIDATING_KEY: 'test-value'
  GOV_NOTIFY_API_KEY: 'test-value'
  GOV_NOTIFY_EMAIL_RECIPIENT: 'test-value'
  DTFS_PORTAL_SCHEDULER: 'test-value'
  // TODO:FN-737 *_WORKFLOW_* variables are not needed and can be removed.
  FETCH_WORKFLOW_TYPE_B_SCHEDULE: 'test-value'
  COMPANIES_HOUSE_API_URL: 'test-value' // from env
  COMPANIES_HOUSE_API_KEY: 'test-value' // from env but looks a secret
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
var additionalSettings = {
  // Note that the dev & staging didn't have AI enabled
  // If enabling, consider using APPLICATIONINSIGHTS_CONNECTION_STRING instead
  // APPINSIGHTS_INSTRUMENTATIONKEY: applicationInsights.properties.InstrumentationKey
  // APPLICATIONINSIGHTS_CONNECTION_STRING: applicationInsights.properties.ConnectionString

  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: '${containerRegistryName}.azurecr.io'
  DOCKER_REGISTRY_SERVER_USERNAME: dockerRegistryServerUsername
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'
  TZ: 'Europe/London' // Dev only
  WEBSITE_DYNAMIC_CACHE: '0'
  WEBSITE_HTTPLOGGING_RETENTION_DAYS: '3'
  WEBSITE_LOCAL_CACHE_OPTION: 'Never'
  WEBSITE_NODE_DEFAULT_VERSION: '16.14.0' // TODO:DTFS2-6422 consider making parameterisable
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
}

var nodeEnv = environment == 'dev' ? { NODE_ENV: 'development' } : {}

var appSettings = union(settings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv)

var portalApiName = 'tfs-${environment}-portal-api'
var privateEndpointName = 'tfs-${environment}-portal-api'
var applicationInsightsName = 'tfs-${environment}-portal-api'


var connectionStringsList = [for item in items(secureConnectionStrings): {
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

var dtfsCentralApiUrl = 'http://${dtfsCentralApiHostname}'

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
  DTFS_CENTRAL_API: {
    type: 'Custom'
    value: dtfsCentralApiUrl
  }
  TFM_API: {
    type: 'Custom'
    value: 'TODO:FN-424'
  }
}


var connectionStringsCombined = union(connectionStringsProperties, connectionStringsCalculated)


resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' existing = {
  name: cosmosDbAccountName
}

resource portalApi 'Microsoft.Web/sites@2022-09-01' = {
  name: portalApiName
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

resource portalApiSettings 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: portalApi
  name: 'appsettings'
  properties: appSettings
}

resource portalApiConnectionStrings 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: portalApi
  name: 'connectionstrings'
  properties: connectionStringsCombined
}

// The private endpoint is taken from the cosmosdb/private-endpoint export
resource portalApiPrivateEndpoint 'Microsoft.Network/privateEndpoints@2022-11-01' = {
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
          privateLinkServiceId: portalApi.id
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

output defaultHostName string = portalApi.properties.defaultHostName
