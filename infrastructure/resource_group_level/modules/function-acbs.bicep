param location string
param environment string

/* @allowed(['Stopped', 'Running'])
param state string */
param containerRegistryName string
param appServicePlanEgressSubnetId string
param appServicePlanId string
param privateEndpointsSubnetId string
param storageAccountName string
param azureWebsitesDnsZoneId string
param nodeDeveloperMode bool
param product string
param target string
param version string

// Note that the name fragment has "azure-" prepended to it when used for the docker image!
param resourceNameFragment string = 'function-acbs'

param settings object

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureSettings object

// These values are taken from an export of Configuration on Dev
@secure()
param additionalSecureSettings object

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: containerRegistryName
}
var containerRegistryLoginServer = containerRegistry.properties.loginServer
// NOTE: this differs from the webapp names as we prepend "azure-" to the image name.
var dockerImageName = '${containerRegistryLoginServer}/azure-${resourceNameFragment}:${environment}'

// This is the IP address Azure uses for its DNS server.
// https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-name-resolution-for-vms-and-role-instances?tabs=redhat#considerations
// https://learn.microsoft.com/en-us/azure/virtual-network/what-is-ip-address-168-63-129-16
var azureDnsServerIp = '168.63.129.16'

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' existing = {
  name: storageAccountName
}

var storageAccountKey = storageAccount.listKeys().keys[0].value

// These values are hardcoded in the CLI scripts, derived in the script or set from normal env variables or vars
var staticSettings = {
  // hard coded
  FUNCTIONS_WORKER_RUNTIME: 'node'
  WEBSITE_DNS_SERVER: azureDnsServerIp
  WEBSITE_VNET_ROUTE_ALL: '1'
}

// These values are taken from an export of Configuration on Dev
var additionalSettings = {
  APPINSIGHTS_INSTRUMENTATIONKEY: applicationInsights.properties.InstrumentationKey
  AzureWebJobsStorage: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${storageAccountKey}'
  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: containerRegistryLoginServer
  DOCKER_REGISTRY_SERVER_USERNAME: containerRegistry.listCredentials().username
  DOCKER_REGISTRY_SERVER_PASSWORD: containerRegistry.listCredentials().passwords[0].value
  FUNCTION_APP_EDIT_MODE: 'readOnly'
  FUNCTIONS_EXTENSION_VERSION: '~3'
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'
  TZ: 'Europe/London'
  WEBSITE_USE_PLACEHOLDER: '0'
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
}

var nodeEnv = nodeDeveloperMode ? { NODE_ENV: 'development' } : {}

var appSettings = union(settings, staticSettings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv)

var functionAcbsName = '${product}-${target}-${version}-${resourceNameFragment}'
var privateEndpointName = '${product}-${target}-${version}-${resourceNameFragment}'
var applicationInsightsName = '${product}-${target}-${version}-${resourceNameFragment}'


// Minimal setup from MS example
// See also https://learn.microsoft.com/en-my/azure/azure-functions/functions-infrastructure-as-code?tabs=bicep

resource functionAcbs 'Microsoft.Web/sites@2024-11-01' = {
  name: functionAcbsName
  location: location
  tags: {}
  kind: 'functionapp,linux,container'
  properties: {
    httpsOnly: false
    serverFarmId: appServicePlanId
    //state: state
    siteConfig: {
      // These siteConfig values appear inline and in a separate 'web' config object when exported. We just set them inline.
      numberOfWorkers: 1
      linuxFxVersion: 'DOCKER|${dockerImageName}'
      acrUseManagedIdentityCreds: false
      alwaysOn: true
      http20Enabled: true
      functionAppScaleLimit: 0
      minimumElasticInstanceCount: 1
      vnetRouteAllEnabled: true
      ftpsState: 'Disabled'
      scmMinTlsVersion: '1.0'
      remoteDebuggingVersion: 'VS2022'
      httpLoggingEnabled: true // false in staging
    }
    virtualNetworkSubnetId: appServicePlanEgressSubnetId
  }
}

resource functionAcbsAppSettings 'Microsoft.Web/sites/config@2024-11-01' = {
  parent: functionAcbs
  name: 'appsettings'
  properties: appSettings
}


// The private endpoint is taken from the function-acbs/private-endpoint export
resource privateEndpoint 'Microsoft.Network/privateEndpoints@2024-10-01' = {
  name: privateEndpointName
  location: location
  tags: {}
  properties: {
    privateLinkServiceConnections: [
      {
        name: privateEndpointName
        properties: {
          privateLinkServiceId: functionAcbs.id
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

resource zoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-10-01' = {
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

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: applicationInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
}

output defaultHostName string = functionAcbs.properties.defaultHostName
