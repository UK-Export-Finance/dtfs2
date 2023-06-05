param filesDnsZoneName string = 'privatelink.file.core.windows.net'
param appServicePlanName string

// TODO:DTFS-6422 It doesn't seem quite right to construct the vnet name here as well as in venet.bicep
var vnetName = 'tfs-${appServicePlanName}-vnet'

resource vnet 'Microsoft.Network/virtualNetworks@2022-11-01' existing = {
  name: vnetName
}

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
      id: vnet.id
    }
  }
}

// Demo A records
// TODO:DTFS-6422 update ip values
resource demoStorage 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: filesDnsZone
  name: 'tfsdemostorage'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.4'
      }
    ]
  }
}

// Dev A records

// TODO:DTFS-6422 update ip values
resource devStorage 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: filesDnsZone
  name: 'tfsdevstorage'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.4'
      }
    ]
  }
}
