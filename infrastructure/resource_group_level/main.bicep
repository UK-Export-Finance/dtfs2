param location string  = resourceGroup().location
// Expected values are 'feature', 'dev', 'staging' & 'prod'
// Note that legacy values of 'test' and 'qa' may be observed in some resources. These are equivalent to 'staging'.
param environment string = 'feature'

param appServicePlanName string = 'feature'
param appServicePlanSku string = 'p2v2'
param appServicePlanKind string = 'linux'

@minLength(5)
@maxLength(50)
@description('Provide a globally unique name of your Azure Container Registry')
// Note that the existing environments have: tfsdev, tfsstaging & tfsproduction
param containerRegistryName string = 'tfsfeatureacr${uniqueString(resourceGroup().id)}'
@description('Provide a tier of your Azure Container Registry.')
// Dev uses 'Standard'
param acrSku string = 'Basic'


// Dev uses 172.16.4x.xx
// Demo (legacy?) uses 172.16.6x.xx

// Test uses 172.16.5x.xx
// Staging uses 172.16.7x.xx

// Feature can use 172.16.2x.xx

param routeTableNextHopIpAddress string = '10.50.0.100'
param mulesoftSubnetCidr string = '172.16.10.0/23'
param productionSubnetCidr string = '10.60.0.0/16'
param appServicePlanEgressPrefixCidr string = '172.16.22.0/28'
param applicationGatewayCidr string = '172.16.21.0/24'
param storageLocations array = [
  'uksouth'
  'ukwest'
]

// These are the "private endpoints"
param vnetAddressPrefixes array = [
  '172.16.20.0/22'
]

param privateEndpointsCidr string = '172.16.20.0/24'
param peeringAddressSpace string = '10.50.0.0/16'

@allowed(['Allow', 'Deny'])
param frontDoorAccess string = 'Allow'
param apiPortalAccessPort string = '44232' // not set in staging / prod

@secure()
param onPremiseNetworkIpsString string

// For public access to storage, Dev has the default as 'Allow' but we may want to update this to Deny.
// Staging has the default as Deny, corresponding to "Enabled from selected virtual networks and IP addresses".
@allowed(['Allow', 'Deny'])
param storageNetworkAccessDefaultAction string = 'Allow'

@description('Enable 7-day soft deletes on file shares')
param shareDeleteRetentionEnabled bool = false

param cosmosDbDatabaseName string = 'dtfs-submissions'
// All current environments use 'Provisioned Throughput'
// TODO:DTFS-6422 Ensure we use 'Provisioned Throughput' for extant environments, but consider changing.
@allowed(['Provisioned Throughput', 'Serverless'])
param cosmosDbCapacityMode string = 'Serverless'

// TODO:DTFS-6422 Note that all extant environments currently use Continuous30Days.
// Consider changing non-prod environments to Continuous7Days.
@allowed(['Continuous7Days', 'Continuous30Days'])
param cosmosDbBackupPolicyTier string = 'Continuous7Days'

var logAnalyticsWorkspaceName = '${resourceGroup().name}-Logs-Workspace'

resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: appServicePlanSku
  }
  kind: appServicePlanKind
  properties: {
    // Linux ASPs need to have reserved as true:
    // https://learn.microsoft.com/en-us/azure/templates/microsoft.web/serverfarms?pivots=deployment-language-bicep#appserviceplanproperties
    reserved: appServicePlanKind == 'linux'
  }
}

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: containerRegistryName
  location: location
  sku: {
    name: acrSku
  }
  properties: {
    // Admin needs to be enabled for App Service continuous deployment
    adminUserEnabled: true
  }
}

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  tags: {
    Environment: 'Preproduction'
  }
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    workspaceCapping: {
      dailyQuotaGb: -1
    }
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

module routeTable 'modules/route-tables.bicep' = {
  name: 'routeTable'
  params: {
    location: location
    mulesoftSubnetCidr: mulesoftSubnetCidr
    productionSubnetCidr: productionSubnetCidr
    nextHopIpAddress: routeTableNextHopIpAddress
  }
}

module tfsIp 'modules/tfs-ip.bicep' = {
  name: 'tfsIp'
  params: {
    location: location
    environment: environment
  }
}

module networkSecurityGroup 'modules/gw-nsg.bicep' = {
  name: 'networkSecurityGroup'
  params: {
    location: location
    environment: environment
    frontDoorAccess: frontDoorAccess
    apiPortalAccessPort: apiPortalAccessPort
  }
}

module vnet 'modules/vnet.bicep' = {
  name: 'vnet'
  params: {
    environment: environment
    location: location
    appServicePlanName: appServicePlan.name
    addressPrefixes: vnetAddressPrefixes
    privateEndpointsCidr: privateEndpointsCidr
    appServicePlanEgressPrefixCidr: appServicePlanEgressPrefixCidr
    applicationGatewayCidr: applicationGatewayCidr
    storageLocations: storageLocations
    peeringAddressSpace: peeringAddressSpace
    routeTableId: routeTable.outputs.routeTableId
    networkSecurityGroupId: networkSecurityGroup.outputs.networkSecurityGroupId
  }
}

module websitesDns 'modules/privatelink-azurewebsites-net.bicep' = {
  name: 'websitesDns'
  params: {
    vnetId: vnet.outputs.vnetId
  }
}

module filesDns 'modules/privatelink-file-core-windows-net.bicep' = {
  name: 'filesDns'
  params: {
    vnetId: vnet.outputs.vnetId
  }
}

module mongoDbDns 'modules/privatelink-mongo-cosmos-azure-com.bicep' = {
  name: 'mongoDbDns'
  params: {
    vnetId: vnet.outputs.vnetId
  }
}

module redisCacheDns 'modules/privatelink-redis-cache-windows-net.bicep' = {
  name: 'redisCacheDns'
  params: {
    vnetId: vnet.outputs.vnetId
  }
}

module storage 'modules/storage.bicep' = {
  name: 'storage'
  params: {
    location: location
    environment: environment
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    gatewaySubnetId: vnet.outputs.gatewaySubnetId
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    allowedIpsString: onPremiseNetworkIpsString
    networkAccessDefaultAction: storageNetworkAccessDefaultAction
    shareDeleteRetentionEnabled: shareDeleteRetentionEnabled
    filesDnsZoneId: filesDns.outputs.filesDnsZoneId
  }
}

module cosmosDb 'modules/cosmosdb.bicep' = {
  name: 'mongoDb'
  params: {
    location: location
    environment: environment
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    databaseName: cosmosDbDatabaseName
    allowedIpsString: onPremiseNetworkIpsString
    capacityMode: cosmosDbCapacityMode
    backupPolicyTier: cosmosDbBackupPolicyTier
  }
}

module redis 'modules/redis.bicep' = {
  name: 'redis'
  params: {
    location: location
    environment: environment
  }
}

module functionAcbs 'modules/function-acbs.bicep' = {
  name: 'functionAcbs'
  params: {
    environment: environment
    location: location
    containerRegistryName: containerRegistry.name
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    storageAccountName: storage.outputs.storageAccountName
  }
}

module externalApi 'modules/external-api.bicep' = {
  name: 'externalApi'
  params: {
    location: location
    environment: environment
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    containerRegistryName: containerRegistry.name
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    cosmosDbAccountName: cosmosDb.outputs.cosmosDbAccountName
    cosmosDbDatabaseName: cosmosDbDatabaseName
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    acbsFunctionDefaultHostName: functionAcbs.outputs.defaultHostName
    numberGeneratorFunctionDefaultHostName: 'TODO:FN-420'
  }
}

module dtfsCentralApi 'modules/dtfs-central-api.bicep' = {
  name: 'dtfsCentralApi'
  params: {
    location: location
    environment: environment
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    containerRegistryName: containerRegistry.name
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    cosmosDbAccountName: cosmosDb.outputs.cosmosDbAccountName
    cosmosDbDatabaseName: cosmosDbDatabaseName
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    externalApiHostname: externalApi.outputs.defaultHostName
  }
}

module portalApi 'modules/portal-api.bicep' = {
  name: 'portalApi'
  params: {
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    containerRegistryName: containerRegistry.name
    cosmosDbAccountName: cosmosDb.outputs.cosmosDbAccountName
    cosmosDbDatabaseName: cosmosDbDatabaseName
    dtfsCentralApiHostname: dtfsCentralApi.outputs.defaultHostName
    environment: environment
    externalApiHostname: externalApi.outputs.defaultHostName
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    storageAccountName: storage.outputs.storageAccountName
  }
}

module tfmApi 'modules/trade-finance-manager-api.bicep' = {
  name: 'tfmApi'
  params: {
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    containerRegistryName: containerRegistry.name
    cosmosDbAccountName: cosmosDb.outputs.cosmosDbAccountName
    cosmosDbDatabaseName: cosmosDbDatabaseName
    dtfsCentralApiHostname: dtfsCentralApi.outputs.defaultHostName
    portalApiHostname: portalApi.outputs.defaultHostName
    environment: environment
    externalApiHostname: externalApi.outputs.defaultHostName
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    storageAccountName: storage.outputs.storageAccountName
  }
}
