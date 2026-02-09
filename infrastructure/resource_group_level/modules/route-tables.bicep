param location string
param nextHopIpAddress string
param productionSubnetCidr string
param product string
param target string
param version string

var routeTableName = 'rt-ukef-uks-${product}-${target}-${version}'

resource routeTable 'Microsoft.Network/routeTables@2024-10-01' = {
  name: routeTableName
  location: location
  properties: {
    disableBgpRoutePropagation: false
  }

  resource productionSubnet 'routes' = {
    name: 'ProductionSubnet'
    properties: {
      addressPrefix: productionSubnetCidr
      nextHopType: 'VirtualAppliance'
      nextHopIpAddress: nextHopIpAddress
      //hasBgpOverride: false
    }
  }
}

@description('The id of the route table created')
output routeTableId string = routeTable.id
