param location string
@allowed(['Allow', 'Deny'])
param frontDoorAccess string
param apiPortalAccessPort int
param product string
param target string
param version string

var nsgName = '${product}-${target}-${version}-gw-nsg'
var staticRules = [
  {
    name: 'gateway-manager'
    type: 'Microsoft.Network/networkSecurityGroups/securityRules'
    properties: {
      protocol: '*'
      sourcePortRange: '*'
      destinationPortRange: '65200-65535'
      sourceAddressPrefix: 'GatewayManager'
      destinationAddressPrefix: '*'
      access: 'Allow'
      priority: 100
      direction: 'Inbound'
      sourcePortRanges: []
      destinationPortRanges: []
      sourceAddressPrefixes: []
      destinationAddressPrefixes: []
    }
  }
  {
    name: 'front-door'
    type: 'Microsoft.Network/networkSecurityGroups/securityRules'
    properties: {
      protocol: '*'
      sourcePortRange: '*'
      destinationPortRange: '*'
      sourceAddressPrefix: 'AzureFrontDoor.Backend'
      destinationAddressPrefix: '*'
      access: frontDoorAccess
      priority: 200
      direction: 'Inbound'
      sourcePortRanges: []
      destinationPortRanges: []
      sourceAddressPrefixes: []
      destinationAddressPrefixes: []
    }
  }
  {
    name: 'vm-ips-dev'
    type: 'Microsoft.Network/networkSecurityGroups/securityRules'
    properties: {
      protocol: '*'
      sourcePortRange: '*'
      destinationPortRange: '*'
      sourceAddressPrefix: '51.104.202.42'
      destinationAddressPrefix: '*'
      access: 'Allow'
      priority: 997
      direction: 'Inbound'
      sourcePortRanges: []
      destinationPortRanges: []
      sourceAddressPrefixes: []
      destinationAddressPrefixes: []
    }
  }
  {
    name: 'vm-ips-test'
    type: 'Microsoft.Network/networkSecurityGroups/securityRules'
    properties: {
      protocol: '*'
      sourcePortRange: '*'
      destinationPortRange: '*'
      sourceAddressPrefix: '51.11.144.7'
      destinationAddressPrefix: '*'
      access: 'Allow'
      priority: 998
      direction: 'Inbound'
      sourcePortRanges: []
      destinationPortRanges: []
      sourceAddressPrefixes: []
      destinationAddressPrefixes: []
    }
  }
  {
    name: 'vm-ips-prod'
    type: 'Microsoft.Network/networkSecurityGroups/securityRules'
    properties: {
      protocol: '*'
      sourcePortRange: '*'
      destinationPortRange: '*'
      sourceAddressPrefix: '51.145.36.44'
      destinationAddressPrefix: '*'
      access: 'Allow'
      priority: 999
      direction: 'Inbound'
      sourcePortRanges: []
      destinationPortRanges: []
      sourceAddressPrefixes: []
      destinationAddressPrefixes: []
    }
  }
  {
    name: 'team-ips-ukef'
    type: 'Microsoft.Network/networkSecurityGroups/securityRules'
    properties: {
      protocol: '*'
      sourcePortRange: '*'
      destinationPortRange: '*'
      sourceAddressPrefix: '51.140.76.208'
      destinationAddressPrefix: '*'
      access: 'Allow'
      priority: 3000
      direction: 'Inbound'
      sourcePortRanges: []
      destinationPortRanges: []
      sourceAddressPrefixes: []
      destinationAddressPrefixes: []
    }
  }
]

var optionalRules = apiPortalAccessPort != 0 ? [
  {
    name: 'api-port'
    type: 'Microsoft.Network/networkSecurityGroups/securityRules'
    properties: {
      protocol: '*'
      sourcePortRange: '*'
      destinationPortRange: string(apiPortalAccessPort)
      sourceAddressPrefix: 'Internet'
      destinationAddressPrefix: '*'
      access: 'Allow'
      priority: 300
      direction: 'Inbound'
      sourcePortRanges: []
      destinationPortRanges: []
      sourceAddressPrefixes: []
      destinationAddressPrefixes: []
    }
  }
] : []

var securityRulesCombined = concat(staticRules, optionalRules)

resource networkSecurityGroup 'Microsoft.Network/networkSecurityGroups@2024-10-01' = {
  name: nsgName
  location: location
  tags: {}
  properties: {
    securityRules: securityRulesCombined
  }
}

output networkSecurityGroupId string = networkSecurityGroup.id
