param resourceNameFragment string
param location string
param environment string

param appServicePlanId string
param dockerImageName string
param ftpsState string // TODO:DTFS2-6422 make consistent?
param scmMinTlsVersion string // TODON:FN-829 require 1.2
param appServicePlanEgressSubnetId string

@secure()
param appSettings object

@secure()
param connectionStrings object

param privateEndpointsSubnetId string
param azureWebsitesDnsZoneId string

param logAnalyticsWorkspaceId string
param deployApplicationInsights bool

var appName = 'tfs-${environment}-${resourceNameFragment}'
var privateEndpointName = 'tfs-${environment}-${resourceNameFragment}'
var applicationInsightsName = 'tfs-${environment}-${resourceNameFragment}'

var appSettingsWithAppInsights = union(appSettings, deployApplicationInsights ? {
  APPLICATIONINSIGHTS_CONNECTION_STRING: applicationInsights.properties.ConnectionString
} : {})

resource site 'Microsoft.Web/sites@2022-09-01' = {
  name: appName
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
      ftpsState: ftpsState
      scmMinTlsVersion: scmMinTlsVersion
      remoteDebuggingVersion: 'VS2019'
      httpLoggingEnabled: true // false in staging, true in prod
    }
    virtualNetworkSubnetId: appServicePlanEgressSubnetId
  }
}

resource dtfsCentralApiSettings 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: site
  name: 'appsettings'
  properties: appSettingsWithAppInsights
}

resource dtfsCentralApiConnectionStrings 'Microsoft.Web/sites/config@2022-09-01' = if (!empty(connectionStrings)) {
  parent: site
  name: 'connectionstrings'
  properties: connectionStrings
}

resource privateEndpoint 'Microsoft.Network/privateEndpoints@2022-11-01' = {
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
          privateLinkServiceId: site.id
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

// Adding the Zone group sets up automatic DNS for the private link. 
resource zoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2022-11-01' = {
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

output defaultHostName string = site.properties.defaultHostName
