param redisDnsZoneName string = 'privatelink.redis.cache.windows.net'
param appServicePlanName string

// TODO:DTFS-6422 It doesn't seem quite right to construct the vnet name here as well as in venet.bicep
var vnetName = 'tfs-${appServicePlanName}-vnet'

resource vnet 'Microsoft.Network/virtualNetworks@2022-11-01' existing = {
  name: vnetName
}

resource redisDnsZone 'Microsoft.Network/privateDnsZones@2018-09-01' = {
  name: redisDnsZoneName
  location: 'global'
  tags: {
    Environment: 'Preproduction'
  }
}

resource redisSoaRecord 'Microsoft.Network/privateDnsZones/SOA@2018-09-01' = {
  parent: redisDnsZone
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

resource redisStorageVnetLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2018-09-01' = {
  parent: redisDnsZone
  name: 'storage-dns'
  location: 'global'
  tags: {
    Environment: 'Preproduction'
  }
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: vnet.id
    }
  }
}
