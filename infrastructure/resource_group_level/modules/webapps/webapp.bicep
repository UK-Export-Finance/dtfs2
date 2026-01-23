param resourceNameFragment string
param location string

param appServicePlanId string
param dockerImageName string
param ftpsState string // TODO:DTFS2-6422 make consistent?
param scmMinTlsVersion string // TODO:FN-829 require 1.2
param appServicePlanEgressSubnetId string

@secure()
param appSettings object

@secure()
param connectionStrings object
@description('The product name for resource naming')
param product string

@description('The target environment for resource naming')
param target string

@description('The version for resource naming')
param version string

param privateEndpointsSubnetId string
param azureWebsitesDnsZoneId string

param logAnalyticsWorkspaceId string
param deployApplicationInsights bool

param selfHostnameEnvironmentVariable string = ''

var appName = '${product}-${target}-${version}-${resourceNameFragment}'
var privateEndpointName = '${product}-${target}-${version}-${resourceNameFragment}'
var applicationInsightsName = '${product}-${target}-${version}-${resourceNameFragment}'

// Application Insights configuration - only include if enabled
var appInsightsConfig = deployApplicationInsights ? {
  APPLICATIONINSIGHTS_CONNECTION_STRING: applicationInsights!.properties.ConnectionString
} : {}

// Self hostname configuration - only include if specified
var selfHostnameConfig = selfHostnameEnvironmentVariable == '' ? {} : {
  '${selfHostnameEnvironmentVariable}': site.properties.defaultHostName
}

var appSettingsWithAppInsights = union(
  appSettings,
  appInsightsConfig,
  selfHostnameConfig
)

resource site 'Microsoft.Web/sites@2024-04-01' = {
  name: appName
  location: location
  tags: {}
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
      ftpsState: ftpsState
      scmMinTlsVersion: scmMinTlsVersion
      remoteDebuggingVersion: 'VS2022'
      httpLoggingEnabled: true // false in staging, true in prod
      healthCheckPath: '/healthcheck'
    }
    virtualNetworkSubnetId: appServicePlanEgressSubnetId
  }
}

resource webappSetting 'Microsoft.Web/sites/config@2022-09-01' = if (!empty(appSettings)) {
  parent: site
  name: 'appsettings'
  properties: appSettingsWithAppInsights
}

resource webappConnectionStrings 'Microsoft.Web/sites/config@2022-09-01' = if (!empty(connectionStrings)) {
  parent: site
  name: 'connectionstrings'
  properties: connectionStrings
}

resource privateEndpoint 'Microsoft.Network/privateEndpoints@2024-05-01' = {
  name: privateEndpointName
  location: location
  tags: {}
  properties: {
    privateLinkServiceConnections: [
      {
        name: privateEndpointName
        properties: {
          privateLinkServiceId: site.id
          groupIds: [
            'sites'
          ]
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

// Adding the Zone group sets up automatic DNS for the private link.
resource zoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-05-01' = {
  parent: privateEndpoint
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

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = if (deployApplicationInsights) {
  name: applicationInsightsName
  location: location
  tags: {}
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

output defaultHostName string = site.properties.defaultHostName
