param location string
param sku object
param product string
param target string
param version string

var redisName = '${product}-${target}-${version}-redis'

resource redis 'Microsoft.Cache/redis@2024-11-01' = {
  name: redisName
  location: location
  properties: {
    redisVersion: '6.0'
    sku: sku
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
    redisConfiguration: {
      'maxmemory-reserved': '0'
      'maxfragmentationmemory-reserved': '0'
      'maxmemory-policy': 'volatile-lru'
      'maxmemory-delta': '0'
    }
  }
}

output redisName string = redis.name
