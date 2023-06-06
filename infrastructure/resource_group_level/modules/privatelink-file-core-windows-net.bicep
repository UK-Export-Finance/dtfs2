param filesDnsZoneName string = 'privatelink.file.core.windows.net'
param vnetId string

resource filesDnsZone 'Microsoft.Network/privateDnsZones@2018-09-01' = {
  name: filesDnsZoneName
  location: 'global'
  tags: {
    Environment: 'Preproduction'
  }
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
  tags: {
    Environment: 'Preproduction'
  }
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: vnetId
    }
  }
}

// TODO:DTFS-6422 Wire up A record IPs correctly, getting appropriate values.


// // Demo A records
// // TODO:DTFS-6422 update ip values
// resource demoStorage 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: filesDnsZone
//   name: 'tfsdemostorage'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.60.4'
//       }
//     ]
//   }
// }

// // Dev A records

// // TODO:DTFS-6422 update ip values
// resource devStorage 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: filesDnsZone
//   name: 'tfsdevstorage'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.4'
//       }
//     ]
//   }
// }
