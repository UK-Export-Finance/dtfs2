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

// resource devGefUi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: azureWebsitesDnsZone
//   name: 'tfs-dev-gef-ui'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.12'
//       }
//     ]
//   }
// }

// resource devGefUiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: azureWebsitesDnsZone
//   name: 'tfs-dev-gef-ui.scm'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.12'
//       }
//     ]
//   }
// }

// resource devPortalApi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: azureWebsitesDnsZone
//   name: 'tfs-dev-portal-api'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.11'
//       }
//     ]
//   }
// }

// resource devPortalApiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: azureWebsitesDnsZone
//   name: 'tfs-dev-portal-api.scm'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.11'
//       }
//     ]
//   }
// }

// resource devPortalUi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: azureWebsitesDnsZone
//   name: 'tfs-dev-portal-ui'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.13'
//       }
//     ]
//   }
// }

// resource devPortalUiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: azureWebsitesDnsZone
//   name: 'tfs-dev-portal-ui.scm'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.13'
//       }
//     ]
//   }
// }

// resource devReferenceDataProxy 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: azureWebsitesDnsZone
//   name: 'tfs-dev-reference-data-proxy'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.5'
//       }
//     ]
//   }
// }

// resource devReferenceDataProxyScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
//   parent: azureWebsitesDnsZone
//   name: 'tfs-dev-reference-data-proxy.scm'
//   properties: {
//     ttl: 3600
//     aRecords: [
//       {
//         ipv4Address: '172.16.40.5'
//       }
//     ]
//   }
// }

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
