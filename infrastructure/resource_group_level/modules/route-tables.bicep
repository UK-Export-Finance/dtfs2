param location string
param nextHopIpAddress string
param mulesoftSubnetCidr string
param productionSubnetCidr string

// TODO:DTFS-6422 consider resource naming convention
var routeTableName = '${resourceGroup().name}-UDR'

resource routeTable 'Microsoft.Network/routeTables@2022-11-01' = {
  name: routeTableName
  location: location
  tags: {
    Environment: 'Preproduction'
  }
  properties: {
    disableBgpRoutePropagation: false
  }

  resource mulesoftSubnet 'routes' = {
    name: 'MulesoftSubnet'
    properties: {
      addressPrefix: mulesoftSubnetCidr
      nextHopType: 'VirtualAppliance'
      nextHopIpAddress: nextHopIpAddress
      hasBgpOverride: false
    }
  }
  
  resource productionSubnet 'routes' = {
    name: 'ProductionSubnet'
    properties: {
      addressPrefix: productionSubnetCidr
      nextHopType: 'VirtualAppliance'
      nextHopIpAddress: nextHopIpAddress
      hasBgpOverride: false
    }
  }  
}

@description('The id of the route table created')
output routeTableId string = routeTable.id
