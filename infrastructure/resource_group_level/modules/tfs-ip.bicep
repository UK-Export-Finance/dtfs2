param environment string
param location string

var ipNames = [
  'tfs-${environment}-ip'
  'tfs-${environment}-tfm-ip'
]

resource publicIps 'Microsoft.Network/publicIPAddresses@2022-11-01' = [for ipName in ipNames: {
  name: ipName
  location: location
  tags: {
    Environment: 'Preproduction'
  }
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
