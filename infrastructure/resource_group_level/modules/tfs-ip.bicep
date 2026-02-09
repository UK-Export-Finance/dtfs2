param location string
@description('The product name for resource naming')
param product string
@description('The target environment for resource naming')
param target string
@description('The version for resource naming')
param version string

var ipNames = [
  '${product}-${target}-${version}-ip'
  '${product}-${target}-${version}-tfm-ip'
]

resource publicIps 'Microsoft.Network/publicIPAddresses@2024-10-01' = [for ipName in ipNames: {
  name: ipName
  location: location
  sku: {
    name: 'Standard'
    tier: 'Regional'
  }
  zones: [
    '1'
    '2'
    '3'
  ]
  properties: {
    publicIPAddressVersion: 'IPv4'
    publicIPAllocationMethod: 'Static'
  }
}]

output tfsIpId string = publicIps[0].id
output tfsIpAddress string = publicIps[0].properties.ipAddress

output tfsTfmIpId string = publicIps[1].id
output tfsTfmIpAddress string = publicIps[1].properties.ipAddress
