param publicIPAddresses_tfs_dev_ip_name string = 'tfs-dev-ip'


resource publicIPAddresses_tfs_dev_ip_name_resource 'Microsoft.Network/publicIPAddresses@2022-11-01' = {
  name: publicIPAddresses_tfs_dev_ip_name
  location: 'uksouth'
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
    ipAddress: '20.49.219.203'
    publicIPAddressVersion: 'IPv4'
    publicIPAllocationMethod: 'Static'
    idleTimeoutInMinutes: 4
    ipTags: []
  }
}

