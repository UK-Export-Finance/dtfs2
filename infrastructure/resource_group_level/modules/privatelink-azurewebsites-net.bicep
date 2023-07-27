param azureWebsitesDnsZoneName string = 'privatelink.azurewebsites.net'
param vnetId string

resource azureWebsitesDnsZone 'Microsoft.Network/privateDnsZones@2018-09-01' = {
  name: azureWebsitesDnsZoneName
  location: 'global'
  tags: {
    Environment: 'Preproduction'
  }
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
// TODO:DTFS-6422 use array of objects and loop over to create all resources.
// Dev included a set of "Demo" values too in the original export. I have not included them
// Test seeems to include a set of "Staging" values too.

// // TODO:DTFS-6422 update for "Feature" values

// // Dev A records

// resource devTfmApi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: azureWebsitesDnsZone
//   name: 'tfs-dev-trade-finance-manager-api'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.9'
//       }
//     ]
//   }
// }

// resource devTfmApiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: azureWebsitesDnsZone
//   name: 'tfs-dev-trade-finance-manager-api.scm'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.9'
//       }
//     ]
//   }
// }

// resource devTfmUi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: azureWebsitesDnsZone
//   name: 'tfs-dev-trade-finance-manager-ui'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.10'
//       }
//     ]
//   }
// }

// resource devTfmUiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: azureWebsitesDnsZone
//   name: 'tfs-dev-trade-finance-manager-ui.scm'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.10'
//       }
//     ]
//   }
// }

output azureWebsitesDnsZoneId string = azureWebsitesDnsZone.id
