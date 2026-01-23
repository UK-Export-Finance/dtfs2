param redisDnsZoneName string = 'privatelink.redis.cache.windows.net'
param vnetId string

resource redisDnsZone 'Microsoft.Network/privateDnsZones@2018-09-01' = {
  name: redisDnsZoneName
  location: 'global'
  tags: {}
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
  tags: {}
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: vnetId
    }
  }
}
