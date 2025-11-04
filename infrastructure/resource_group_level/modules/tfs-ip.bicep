param environment string
param location string

var ipNames = [
  '${product}-${target}-${version}-ip'
  '${product}-${target}-${version}-tfm-ip'
]

resource publicIps 'Microsoft.Network/publicIPAddresses@2024-02-15' = [for ipName in ipNames: {
  name: ipName
  location: location
  tags: {}
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
