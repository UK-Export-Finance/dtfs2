param location string
param environment string

// TODO:FN-504 decide what sku to use.
// Note that it isn't recommended to use Basic or C0 in production
// See https://learn.microsoft.com/en-gb/azure/azure-cache-for-redis/cache-best-practices-development
param sku object = {
  name: 'Basic'
  family: 'C'
  capacity: 0
}

var redisName = 'tfs-${environment}-redis'

// See https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/cache-redis-cache-bicep-provision?tabs=CLI
// for an example Bicep file

// TODO:FN-504 Configure private link.
// See line 718 in developmentinfrastructure.yml
// and https://docs.microsoft.com/en-us/azure/azure-cache-for-redis/cache-private-link

resource redis 'Microsoft.Cache/redis@2022-06-01' = {
  name: redisName
  location: location
  tags: {
    Environment: 'Preproduction'
  }
  properties: {
    redisVersion: '6.0'
    sku: sku
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
    tenantSettings: {}
    redisConfiguration: {
      'maxmemory-reserved': '0'
      'maxfragmentationmemory-reserved': '0'
      'maxmemory-policy': 'volatile-lru'
      'maxmemory-delta': '0'
    }
  }
}
