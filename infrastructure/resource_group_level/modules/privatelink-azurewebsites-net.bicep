param azureWebsitesDnsZoneName string = 'privatelink.azurewebsites.net'
param vnetId string

resource azureWebsitesDnsZone 'Microsoft.Network/privateDnsZones@2018-09-01' = {
  name: azureWebsitesDnsZoneName
  location: 'global'
  tags: {}
}

resource azureDnsSoaRecord 'Microsoft.Network/privateDnsZones/SOA@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: '@'
  properties: {
    ttl: 3600
    soaRecord: {
      email: 'azureprivatedns-host.microsoft.com'
      expireTime: 2419200
      host: 'azureprivatedns.net'
      minimumTtl: 10
      refreshTime: 3600
      retryTime: 300
      serialNumber: 1
    }
  }
}

resource appServiceVnetLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'app-service-dns'
  location: 'global'
  tags: {}
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: vnetId
    }
  }
}

output azureWebsitesDnsZoneId string = azureWebsitesDnsZone.id
