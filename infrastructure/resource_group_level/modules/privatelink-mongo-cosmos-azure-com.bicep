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


// TODO:DTFS-6422 Wire up A record IPs correctly, getting appropriate values.

// Notes from deployment script:
//  We have to add explicit A records so that Mongo names resolve correctly to the private endpoint address
//  https://docs.microsoft.com/en-us/azure/cosmos-db/how-to-configure-private-endpoints#integrate-the-private-endpoint-with-a-private-dns-zone-1
//  NB the zone name needs to be "privatelink.mongo.cosmos.azure.com" rather than "privatelink.documents.azure.com" as per the link above.
//  NB ipConfigurations[0] appears to be the "primary". There's also a property called "requiredMemberName" that *seems* to be the value needed for record-set-name but I can't find any documentation on it, so sticking with [0] and [1] for now:

// // Dev A records
// resource devMongoDb 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: mongoDbDnsZone
//   name: 'tfs-dev-mongo'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.6'
//       }
//     ]
//   }
// }

// resource devMongoDbUkSouth 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: mongoDbDnsZone
//   name: 'tfs-dev-mongo-uksouth'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.7'
//       }
//     ]
//   }
// }
