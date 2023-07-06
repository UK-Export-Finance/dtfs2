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

var dockerImageName = '${containerRegistryName}.azurecr.io/dtfs-central-api:${environment}'
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
  APPLICATIONINSIGHTS_CONNECTION_STRING: applicationInsights.properties.ConnectionString
  // Note that the config has APPINSIGHTS_INSTRUMENTATIONKEY as a slot setting, though the advice
  // is not to use at the same time as its replacement - APPLICATIONINSIGHTS_CONNECTION_STRING
  // APPINSIGHTS_INSTRUMENTATIONKEY: applicationInsights.properties.InstrumentationKey
  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: '${containerRegistryName}.azurecr.io'
  DOCKER_REGISTRY_SERVER_USERNAME: dockerRegistryServerUsername
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'
  TZ: 'Europe/London'
  WEBSITE_HTTPLOGGING_RETENTION_DAYS: '3'
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
}

var nodeEnv = environment == 'dev' ? { NODE_ENV: 'development' } : {}

var appSettings = union(settings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv)

var dtfsCentralApiName = 'tfs-${environment}-dtfs-central-api'
var privateEndpointName = 'tfs-${environment}-dtfs-central-api'
var applicationInsightsName = 'tfs-${environment}-dtfs-central-api'


// These have come from the CLI scripts
var mongoDbConnectionString = replace(cosmosDbAccount.listConnectionStrings().connectionStrings[0].connectionString, '&replicaSet=globaldb', '')
// Note that in the CLI script, http was used, but the value in the exported config was https.
var externalApiUrl = 'https://${externalApiHostname}'
var connectionStrings = {
  EXTERNAL_API_URL: {
    type: 'Custom'
    value: externalApiUrl
  }
  MONGO_INITDB_DATABASE: {
    type: 'Custom'
    value: cosmosDbDatabaseName
  }
  MONGODB_URI: {
    type: 'Custom'
    value: mongoDbConnectionString
  }
}

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' existing = {
  name: cosmosDbAccountName
}

resource dtfsCentralApi 'Microsoft.Web/sites@2022-09-01' = {
  name: dtfsCentralApiName
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

resource dtfsCentralApiSettings 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: dtfsCentralApi
  name: 'appsettings'
  properties: appSettings
}

resource dtfsCentralApiConnectionStrings 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: dtfsCentralApi
  name: 'connectionstrings'
  properties: connectionStrings
}

// The private endpoint is taken from the cosmosdb/private-endpoint export
resource dtfsCentralApiPrivateEndpoint 'Microsoft.Network/privateEndpoints@2022-11-01' = {
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
          privateLinkServiceId: dtfsCentralApi.id
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

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: applicationInsightsName
  location: location
  tags: {
    Environment: 'Preproduction'
  }
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Flow_Type: 'Redfield'
    Request_Source: 'IbizaAIExtensionEnablementBlade'
    RetentionInDays: 90
    WorkspaceResourceId: logAnalyticsWorkspaceId
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}
