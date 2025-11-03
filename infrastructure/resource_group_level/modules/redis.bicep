param location string
param environment string
param sku object

var redisName = "${product}-${target}-${version}-redis"

// See https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/cache-redis-cache-bicep-provision?tabs=CLI
// for an example Bicep file

// TODO:FN-504 Configure private link.
// See line 718 in developmentinfrastructure.yml
// and https://docs.microsoft.com/en-us/azure/azure-cache-for-redis/cache-private-link

resource redis 'Microsoft.Cache/redis@2024-02-15' = {
  name: redisName
  location: location
  tags: {}
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

output redisName string = redis.name
