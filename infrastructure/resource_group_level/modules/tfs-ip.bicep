param environment string
param location string

var ipNames = [
  'tfs-${environment}-ip'
  'tfs-${environment}-tfm-ip'
]

resource publicIps 'Microsoft.Network/publicIPAddresses@2022-11-01' = [for ipName in ipNames: {
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
