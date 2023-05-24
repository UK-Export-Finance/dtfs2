param location string  = resourceGroup().location
param environment string = 'feature'

param routeTableNextHopIpAddress string = '10.50.0.100'
param mulesoftSubnetCidr string = '172.16.10.0/23'
param productionSubnetCidr string = '10.60.0.0/16'

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

