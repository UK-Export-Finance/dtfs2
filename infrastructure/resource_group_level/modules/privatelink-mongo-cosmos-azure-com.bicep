param vnetId string

// Note that the zone name needs to be 'privatelink.mongo.cosmos.azure.com' as we're using MongoDB.
// See: https://learn.microsoft.com/en-us/azure/cosmos-db/how-to-configure-private-endpoints#private-zone-name-mapping
var privateDnsZoneName = 'privatelink.mongo.cosmos.azure.com'

resource mongoDbDnsZone 'Microsoft.Network/privateDnsZones@2018-09-01' = {
  name: privateDnsZoneName
  location: 'global'
  tags: {}
}

resource mongoDbDnsSoaRecord 'Microsoft.Network/privateDnsZones/SOA@2018-09-01' = {
  parent: mongoDbDnsZone
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

resource mongoDbVnetLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2018-09-01' = {
  parent: mongoDbDnsZone
  name: 'mongo-dns'
  location: 'global'
  tags: {}
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: vnetId
    }
  }
}

output mongoDbDnsZoneId string = mongoDbDnsZone.id
