param privateDnsZones_privatelink_redis_cache_windows_net_name string = 'privatelink.redis.cache.windows.net'
param virtualNetworks_tfs_dev_vnet_externalid string = '/subscriptions/8beaa40a-2fb6-49d1-b080-ff1871b6276f/resourceGroups/Digital-Dev/providers/Microsoft.Network/virtualNetworks/tfs-dev-vnet'

resource privateDnsZones_privatelink_redis_cache_windows_net_name_resource 'Microsoft.Network/privateDnsZones@2018-09-01' = {
  name: privateDnsZones_privatelink_redis_cache_windows_net_name
  location: 'global'
  tags: {
    Environment: 'Preproduction'
  }
}

resource Microsoft_Network_privateDnsZones_SOA_privateDnsZones_privatelink_redis_cache_windows_net_name 'Microsoft.Network/privateDnsZones/SOA@2018-09-01' = {
  parent: privateDnsZones_privatelink_redis_cache_windows_net_name_resource
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

resource privateDnsZones_privatelink_redis_cache_windows_net_name_storage_dns 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2018-09-01' = {
  parent: privateDnsZones_privatelink_redis_cache_windows_net_name_resource
  name: 'storage-dns'
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
