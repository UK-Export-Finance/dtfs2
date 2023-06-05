param azureWebsitesDnsZoneName string = 'privatelink.azurewebsites.net'
param appServicePlanName string

// TODO:DTFS-6422 It doesn't seem quite right to construct the vnet name here as well as in venet.bicep
var vnetName = 'tfs-${appServicePlanName}-vnet'

resource vnet 'Microsoft.Network/virtualNetworks@2022-11-01' existing = {
  name: vnetName
}

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
      id: vnet.id
    }
  }
}


// TODO:DTFS-6422 use array of objects and loop over to create all resources.
// Dev seems to include a set of "Demo" values too
// Test seeems to include a set of "Staging" values too.


// Demo A records

resource demoCentralApi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-dtfs-central-api'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.9'
      }
    ]
  }
}

resource demoCentralApiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-dtfs-central-api.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.9'
      }
    ]
  }
}

resource demoFunctionAcbs 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-function-acbs'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.6'
      }
    ]
  }
}

resource demoFunctionAcbsScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-function-acbs.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.6'
      }
    ]
  }
}

resource demoFunctionNumberGenerator 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-function-number-generator'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.16'
      }
    ]
  }
}

resource demoFunctionNumberGeneratorScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-function-number-generator.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.16'
      }
    ]
  }
}

resource demoGefUi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-gef-ui'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.14'
      }
    ]
  }
}

resource demoGefUiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-gef-ui.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.14'
      }
    ]
  }
}

resource demoPortalApi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-portal-api'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.12'
      }
    ]
  }
}

resource demoPortalApiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-portal-api.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.12'
      }
    ]
  }
}

resource demoPortalUi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-portal-ui'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.13'
      }
    ]
  }
}

resource demoPortalUiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-portal-ui.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.13'
      }
    ]
  }
}

resource demoReferenceDataProxy 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-reference-data-proxy'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.5'
      }
    ]
  }
}

resource demoReferenceDataProxyScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-reference-data-proxy.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.5'
      }
    ]
  }
}

resource demoTfmApi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-trade-finance-manager-api'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.10'
      }
    ]
  }
}

resource demoTfmApiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-trade-finance-manager-api.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.10'
      }
    ]
  }
}

resource demoTfmUi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-trade-finance-manager-ui'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.11'
      }
    ]
  }
}

resource demoTfmUiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-demo-trade-finance-manager-ui.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.11'
      }
    ]
  }
}

// Dev A records

resource devCentralApi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-dtfs-central-api'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.8'
      }
    ]
  }
}

resource devCentralApiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-dtfs-central-api.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.8'
      }
    ]
  }
}

resource devFunctionAcbs 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-function-acbs'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.14'
      }
    ]
  }
}

resource devFunctionAcbsScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-function-acbs.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.14'
      }
    ]
  }
}

resource devFunctionNumberGenerator 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-function-number-generator'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.16'
      }
    ]
  }
}

resource devFunctionNumberGeneratorScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-function-number-generator.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.16'
      }
    ]
  }
}

resource devGefUi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-gef-ui'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.12'
      }
    ]
  }
}

resource devGefUiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-gef-ui.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.12'
      }
    ]
  }
}

resource devPortalApi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-portal-api'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.11'
      }
    ]
  }
}

resource devPortalApiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-portal-api.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.11'
      }
    ]
  }
}

resource devPortalUi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-portal-ui'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.13'
      }
    ]
  }
}

resource devPortalUiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-portal-ui.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.13'
      }
    ]
  }
}

resource devReferenceDataProxy 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-reference-data-proxy'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.5'
      }
    ]
  }
}

resource devReferenceDataProxyScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-reference-data-proxy.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.5'
      }
    ]
  }
}

resource devTfmApi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-trade-finance-manager-api'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.9'
      }
    ]
  }
}

resource devTfmApiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-trade-finance-manager-api.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.9'
      }
    ]
  }
}

resource devTfmUi 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-trade-finance-manager-ui'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.10'
      }
    ]
  }
}

resource devTfmUiScm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: azureWebsitesDnsZone
  name: 'tfs-dev-trade-finance-manager-ui.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.10'
      }
    ]
  }
}
