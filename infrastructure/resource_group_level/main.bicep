param location string  = resourceGroup().location
param environment string = 'feature'


module routeTable 'modules/route-tables.bicep' = {
  name: 'routeTable'
  params: {
    location: location
  }
}

module tfsIp 'modules/tfs-ip.bicep' = {
  name: 'tfsIp'
  params: {
    location: location
    environment: environment
  }
}

