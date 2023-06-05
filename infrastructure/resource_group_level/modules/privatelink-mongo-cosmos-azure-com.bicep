param privateDnsZones_privatelink_mongo_cosmos_azure_com_name string = 'privatelink.mongo.cosmos.azure.com'
param virtualNetworks_tfs_dev_vnet_externalid string = '/subscriptions/8beaa40a-2fb6-49d1-b080-ff1871b6276f/resourceGroups/Digital-Dev/providers/Microsoft.Network/virtualNetworks/tfs-dev-vnet'

resource privateDnsZones_privatelink_mongo_cosmos_azure_com_name_resource 'Microsoft.Network/privateDnsZones@2018-09-01' = {
  name: privateDnsZones_privatelink_mongo_cosmos_azure_com_name
  location: 'global'
  tags: {
    Environment: 'Preproduction'
  }
}

resource privateDnsZones_privatelink_mongo_cosmos_azure_com_name_tfs_demo_mongo 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_mongo_cosmos_azure_com_name_resource
  name: 'tfs-demo-mongo'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.7'
      }
    ]
  }
}

resource privateDnsZones_privatelink_mongo_cosmos_azure_com_name_tfs_demo_mongo_uksouth 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_mongo_cosmos_azure_com_name_resource
  name: 'tfs-demo-mongo-uksouth'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.8'
      }
    ]
  }
}

resource privateDnsZones_privatelink_mongo_cosmos_azure_com_name_tfs_dev_mongo 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_mongo_cosmos_azure_com_name_resource
  name: 'tfs-dev-mongo'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.6'
      }
    ]
  }
}

resource privateDnsZones_privatelink_mongo_cosmos_azure_com_name_tfs_dev_mongo_uksouth 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_mongo_cosmos_azure_com_name_resource
  name: 'tfs-dev-mongo-uksouth'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.7'
      }
    ]
  }
}

resource Microsoft_Network_privateDnsZones_SOA_privateDnsZones_privatelink_mongo_cosmos_azure_com_name 'Microsoft.Network/privateDnsZones/SOA@2018-09-01' = {
  parent: privateDnsZones_privatelink_mongo_cosmos_azure_com_name_resource
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

resource privateDnsZones_privatelink_mongo_cosmos_azure_com_name_mongo_dns 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2018-09-01' = {
  parent: privateDnsZones_privatelink_mongo_cosmos_azure_com_name_resource
  name: 'mongo-dns'
  location: 'global'
  tags: {
    Environment: 'Preproduction'
  }
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: virtualNetworks_tfs_dev_vnet_externalid
    }
  }
}
