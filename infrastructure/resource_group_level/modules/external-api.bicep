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

var dockerImageName = '${containerRegistryName}.azurecr.io/external-api:${environment}'
var dockerRegistryServerUsername = 'tfs${environment}'

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureSettings object = {
  CORS_ORIGIN: 'test-value'
  APIM_TFS_URL: 'test-value'
  APIM_TFS_KEY: 'test-value'
  APIM_TFS_VALUE: 'test-value'
  MULESOFT_API_PARTY_DB_KEY: 'test-value'
  MULESOFT_API_PARTY_DB_SECRET: 'test-value'
  MULESOFT_API_PARTY_DB_URL: 'test-value'
  APIM_MDM_URL: 'test-value'
  APIM_MDM_KEY: 'test-value'
  APIM_MDM_VALUE: 'test-value'
  MULESOFT_API_UKEF_ESTORE_EA_URL: 'test-value'
  MULESOFT_API_UKEF_ESTORE_EA_KEY: 'test-value'
  MULESOFT_API_UKEF_ESTORE_EA_SECRET: 'test-value'
  COMPANIES_HOUSE_API_KEY: 'test-value' // Actually set from an env variable but that's from a secret.
  ORDNANCE_SURVEY_API_KEY: 'test-value'
  GOV_NOTIFY_API_KEY: 'test-value'
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
  GOV_NOTIFY_EMAIL_RECIPIENT: 'test-value'
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

var externalApiName = 'tfs-${environment}-external-api'
var privateEndpointName = 'tfs-${environment}-external-api'
var applicationInsightsName = 'tfs-${environment}-external-api'

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' existing = {
  name: cosmosDbAccountName
}

resource externalApi 'Microsoft.Web/sites@2022-09-01' = {
  name: externalApiName
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
      ftpsState: 'FtpsOnly'
      scmMinTlsVersion: '1.2'
      remoteDebuggingVersion: 'VS2019'
      httpLoggingEnabled: true // false in staging, true in prod
    }
    virtualNetworkSubnetId: appServicePlanEgressSubnetId
  }
}

resource dtfsCentralApiSettings 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: externalApi
  name: 'appsettings'
  properties: appSettings
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
          privateLinkServiceId: externalApi.id
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

// Note that Application Insights is disabled for this resource.
// TODO:DTFS2-6422 enable application insights

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

