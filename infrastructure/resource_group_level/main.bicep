param location string  = resourceGroup().location
param environment string = 'feature'

param appServicePlanName string = 'feature'
param appServicePlanSku string = 'p2v2'
param appServicePlanKind string = 'linux'


param routeTableNextHopIpAddress string = '10.50.0.100'
param mulesoftSubnetCidr string = '172.16.10.0/23'
param productionSubnetCidr string = '10.60.0.0/16'
param appServicePlanEgressPrefixCidr string = '172.16.42.0/28'
param applicationGatewayCidr string = '172.16.41.0/24'
param vmCidr string = '172.16.43.0/28'
param storageLocations array = [
  'uksouth'
  'ukwest'
]
param demoGatewayPrefixCidr string = '172.16.61.0/24'
param demoPrivateEndpointsPrefixCidr string = '172.16.60.0/24'

// I think these are the "private endpoints" and "demo endpoints"
param vnetAddressPrefixes array = [
  '172.16.40.0/22'
  '172.16.60.0/23'
]
param privateEndpointsCidr string = '172.16.40.0/24'
param peeringAddressSpace string = '10.50.0.0/16'

resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: appServicePlanSku
  }
  kind: appServicePlanKind
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
    vmCidr: vmCidr
    storageLocations: storageLocations
    demoGatewayPrefixCidr: demoGatewayPrefixCidr
    demoPrivateEndpointsPrefixCidr: demoPrivateEndpointsPrefixCidr
    peeringAddressSpace: peeringAddressSpace
  }
}

module natGateway 'modules/nat-gw_nat_ip.bicep' = {
  name: 'natGateway'
  params: {
    appServicePlanName: appServicePlan.name
    location: location
  }
}
