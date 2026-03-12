param location string
@allowed(['Allow', 'Deny'])
param frontDoorAccess string
param apiPortalAccessPort int
param product string
param target string
param version string
param nsgSourceAddressPrefix string 
param ukefSourceAddressPrefix string 
param testSourceAddressPrefix string 

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
    }
  }
  {
    name: 'vm-ips-test'
    type: 'Microsoft.Network/networkSecurityGroups/securityRules'
    properties: {
      protocol: '*'
      sourcePortRange: '*'
      destinationPortRange: '*'
      sourceAddressPrefix: testSourceAddressPrefix
      destinationAddressPrefix: '*'
      access: 'Allow'
      priority: 998
      direction: 'Inbound'
    }
  }
  {
    name: 'team-ips-ukef'
    type: 'Microsoft.Network/networkSecurityGroups/securityRules'
    properties: {
      protocol: '*'
      sourcePortRange: '*'
      destinationPortRange: '*'
      sourceAddressPrefix: ukefSourceAddressPrefix
      destinationAddressPrefix: '*'
      access: 'Allow'
      priority: 3000
      direction: 'Inbound'
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
    }
  }
] : []

var securityRulesCombined = concat(staticRules, optionalRules)

resource networkSecurityGroup 'Microsoft.Network/networkSecurityGroups@2024-10-01' = {
  name: nsgName
  location: location
  properties: {
    securityRules: securityRulesCombined
  }
}

output networkSecurityGroupId string = networkSecurityGroup.id
