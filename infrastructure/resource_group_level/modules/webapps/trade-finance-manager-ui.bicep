param location string
param environment string
param containerRegistryName string
param appServicePlanEgressSubnetId string
param appServicePlanId string
param privateEndpointsSubnetId string
param logAnalyticsWorkspaceId string
param externalApiHostname string
param tfmApiHostname string
param redisName string
param azureWebsitesDnsZoneId string

var dockerImageName = '${containerRegistryName}.azurecr.io/trade-finance-manager-ui:${environment}'
var dockerRegistryServerUsername = 'tfs${environment}'

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureSettings object = {
  UKEF_TFM_API_SYSTEM_KEY: 'test-value'
  ESTORE_URL: 'test-value'
}

// These values are taken from an export of Configuration on Dev (& validating with staging).
@secure()
param additionalSecureSettings object = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'
  DTFS_CENTRAL_API_KEY: 'test-value'
  EXTERNAL_API_KEY: 'test-value'
  PORTAL_API_KEY: 'test-value'
  TFM_API_KEY: 'test-value'
}

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureConnectionStrings object = {
  SESSION_SECRET: 'test-value'
}

// These values are taken from an export of Connection strings on Dev (& validating with staging).
@secure()
param additionalSecureConnectionStrings object = {
}

resource redis 'Microsoft.Cache/redis@2022-06-01' existing = {
  name: redisName
}

var tfmApiUrl = 'https://${tfmApiHostname}'
// Note that for externalApiUrl in the CLI script, http was used, but the value in the exported config was https.
var externalApiUrl = 'https://${externalApiHostname}'


// https://learn.microsoft.com/en-us/azure/virtual-network/what-is-ip-address-168-63-129-16
var azureDnsServerIp = '168.63.129.16'

// These values are hardcoded in the CLI scripts, derived in the script or set from normal env variables
var settings = {
  // from env.

  // derived
  TFM_API_URL: tfmApiUrl
  REDIS_HOSTNAME: redis.properties.hostName
  REDIS_PORT: redis.properties.sslPort
  REDIS_KEY: redis.listKeys().primaryKey
  EXTERNAL_API_URL: externalApiUrl
  HTTPS: 1

  // hard coded
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
  TZ: 'Europe/London'
  WEBSITE_HEALTHCHECK_MAXPINGFAILURES: 10
  WEBSITE_HTTPLOGGING_RETENTION_DAYS: '3'
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
}

var nodeEnv = environment == 'dev' ? { NODE_ENV: 'development' } : {}

var appSettings = union(settings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv)

var tfmUiName = 'tfs-${environment}-trade-finance-manager-ui'
var privateEndpointName = 'tfs-${environment}-trade-finance-manager-ui'
var applicationInsightsName = 'tfs-${environment}-trade-finance-manager-ui'


var connectionStringsList = [for item in items(union(secureConnectionStrings, additionalSecureConnectionStrings)): {
  name: item.key
  value: item.value
} ]

var connectionStringsProperties = toObject(connectionStringsList, item => item.name, item => {
  type: 'Custom'
  value: item.value
} )


// Then there are the calculated values.

var connectionStringsCalculated = { }

var connectionStringsCombined = union(connectionStringsProperties, connectionStringsCalculated)

resource tfmUi 'Microsoft.Web/sites@2022-09-01' = {
  name: tfmUiName
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

resource tfmUiSettings 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: tfmUi
  name: 'appsettings'
  properties: appSettings
}

resource tfmUiConnectionStrings 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: tfmUi
  name: 'connectionstrings'
  properties: connectionStringsCombined
}

// The private endpoint is taken from the cosmosdb/private-endpoint export
resource tfmUiPrivateEndpoint 'Microsoft.Network/privateEndpoints@2022-11-01' = {
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
          privateLinkServiceId: tfmUi.id
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

resource zoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2022-11-01' = {
  parent: tfmUiPrivateEndpoint
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'zoneConfig'
        properties: {
          privateDnsZoneId: azureWebsitesDnsZoneId
        }
      }
    ]
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

output defaultHostName string = tfmUi.properties.defaultHostName
