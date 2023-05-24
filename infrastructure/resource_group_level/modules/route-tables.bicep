param location string
// TODO:DTFS-6422 consider naming
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
      addressPrefix: '172.16.10.0/23'
      nextHopType: 'VirtualAppliance'
      nextHopIpAddress: '10.50.0.100'
      hasBgpOverride: false
    }
  }
  
  resource productionSubnet 'routes' = {
    name: 'ProductionSubnet'
    properties: {
      addressPrefix: '10.60.0.0/16'
      nextHopType: 'VirtualAppliance'
      nextHopIpAddress: '10.50.0.100'
      hasBgpOverride: false
    }
  }  
}
