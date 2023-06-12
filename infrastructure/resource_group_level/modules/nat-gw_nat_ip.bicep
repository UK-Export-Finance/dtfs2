param location string
param appServicePlanName string

var natGatewayName = 'tfs-${appServicePlanName}-nat-gw'
var natGatewayIpAddressesName = 'tfs-${appServicePlanName}-nat-ip'

// TODO:DTFS-6422 The NAT Gateway won't be functional until it is linked with a subnet.
// The tfs-dev-nat-gw Gateway is associated with the sub-prototypekit-dev-001 subnet in
// the rg-prototypekit-dev-001 resource group (with tfs-dev-gw-nsg Network Security Group).
// This doesn't get produced in the Nat GW template export - hopefully it will appear elsewhere.
// Test uses test-app-service-plan-egress, which seems more reasonable. (prod uses prod-app-service-plan-egress)
// It isn't clear what we should use yet.

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
    publicIpAddresses: [
      {
        id: natGatewayIpAddresses.id
      }
    ]
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
    // the ipAddress value is assigned by Azure
    publicIPAddressVersion: 'IPv4'
    publicIPAllocationMethod: 'Static'
    idleTimeoutInMinutes: 4
    ipTags: []
  }
}
