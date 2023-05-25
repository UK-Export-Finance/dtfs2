param location string  = resourceGroup().location
param environment string = 'feature'

param routeTableNextHopIpAddress string = '10.50.0.100'
param mulesoftSubnetCidr string = '172.16.10.0/23'
param productionSubnetCidr string = '10.60.0.0/16'
param appServicePlanEgressPrefixCidr string = '172.16.42.0/28'
param applicationGatewatCidr string = '172.16.41.0/24'
param vmCidr string = '172.16.43.0/28'
param storageLocations array = [
  'uksouth'
  'ukwest'
]
param demoGatewayPrefixCidr string = '172.16.61.0/24'
param demoPrivateEndpointsPrefixCidr string = '172.16.60.0/24'

param vnetAddressPrefixes array = [
  '172.16.40.0/22'
   '172.16.60.0/23'
]
param privateEndpointsCidr string = '172.16.40.0/24'
param peeringAddressSpace string = '10.50.0.0/16'


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
    location: location
    addressPrefixes: vnetAddressPrefixes
    privateEndpointsCidr: privateEndpointsCidr
    appServicePlanEgressPrefixCidr: appServicePlanEgressPrefixCidr
    applicationGatewatCidr: applicationGatewatCidr
    vmCidr: vmCidr
    storageLocations: storageLocations
    demoGatewayPrefixCidr: demoGatewayPrefixCidr
    demoPrivateEndpointsPrefixCidr: demoPrivateEndpointsPrefixCidr
    peeringAddressSpace: peeringAddressSpace
  }
}
