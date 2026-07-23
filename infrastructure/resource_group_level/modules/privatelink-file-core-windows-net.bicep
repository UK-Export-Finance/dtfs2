param filesDnsZoneName string = 'privatelink.file.${environment().suffixes.storage}'
param vnetId string

resource filesDnsZone 'Microsoft.Network/privateDnsZones@2018-09-01' = {
  name: filesDnsZoneName
  location: 'global'
  tags: {}
}

resource azureDnsSoaRecord 'Microsoft.Network/privateDnsZones/SOA@2018-09-01' = {
  parent: filesDnsZone
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

resource filesVnetLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2018-09-01' = {
  parent: filesDnsZone
  name: 'storage-dns'
  location: 'global'
  tags: {}
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: vnetId
    }
  }
}

output filesDnsZoneId string = filesDnsZone.id
