param location string
param appServicePlanName string

var natGatewayName = 'tfs-${appServicePlanName}-nat-gw'
var natGatewayIpAddressesName = 'tfs-${appServicePlanName}-nat-ip'

// TODO:DTFS-6422 It looks like this is duplicated by the natGatewayIpAddresses below. Remove if all is ok.
// param publicIPAddresses_tfs_dev_nat_ip_externalid string = '/subscriptions/8beaa40a-2fb6-49d1-b080-ff1871b6276f/resourceGroups/Digital-Dev/providers/Microsoft.Network/publicIPAddresses/tfs-dev-nat-ip'

resource natGateway 'Microsoft.Network/natGateways@2022-11-01' = {
  name: natGatewayName
  location: location
  tags: {
    Environment: 'Preproduction'
  }
  sku: {
    name: 'Standard'
  }
  properties: {
    idleTimeoutInMinutes: 4
// TODO:DTFS-6422 It looks like this is duplicated by the natGatewayIpAddresses below. Remove if all is ok.
    // publicIpAddresses: [
    //   {
    //     id: publicIPAddresses_tfs_dev_nat_ip_externalid
    //   }
    // ]
  }
}

resource natGatewayIpAddresses 'Microsoft.Network/publicIPAddresses@2022-11-01' = {
  name: natGatewayIpAddressesName
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
    natGateway: {
      id: natGateway.id
    }
// TODO:DTFS-6422 I'm not sure where the following ip address comes from. Is us Azure assigned?
//    ipAddress: '51.132.155.239'
    publicIPAddressVersion: 'IPv4'
    publicIPAllocationMethod: 'Static'
    idleTimeoutInMinutes: 4
    ipTags: []
  }
}
