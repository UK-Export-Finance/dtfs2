param location string
param addressPrefixes array
param privateEndpointsCidr string
param appServicePlanEgressPrefixCidr string
param applicationGatewayCidr string
param acaClamAvCidr string
param product string
param target string
param version string

param networkSecurityGroupId string

// Note that the staging name is: "tfs-test-vnet_vnet-ukef-uks", so we accept a parameter to set it.
param peeringVnetName string = 'vnet-peer-uks-${product}-${target}-${version}'
@secure()
param peeringRemoteVnetSubscriptionId string
param peeringRemoteVnetResourceGroupName string
param peeringRemoteVnetName string
param peeringAddressSpace string

param storageLocations array

var natGatewayName = '${product}-${target}-${version}-nat-gw'
var natGatewayIpAddressesName = '${product}-${target}-${version}-nat-ip'

var vnetName = '${product}-${target}-${version}-vnet'

var appServicePlanEgressSubnetName = '${product}-${target}-${version}-app-service-plan-egress'
var gatewaySubnetName = '${product}-${target}-${version}-gateway'
var privateEndpointsSubnetName = '${product}-${target}-${version}-private-endpoints'

var acaClamAvSubnetName = '${product}-${target}-${version}-aca-clamav'

resource natGatewayIpAddresses 'Microsoft.Network/publicIPAddresses@2024-10-01' = {
  name: natGatewayIpAddressesName
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
    // the ipAddress value is assigned by Azure
    publicIPAddressVersion: 'IPv4'
    publicIPAllocationMethod: 'Static'
    idleTimeoutInMinutes: 4
    ipTags: []
  }
}

resource natGateway 'Microsoft.Network/natGateways@2024-10-01' = {
  name: natGatewayName
  location: location
  tags: {}
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

resource vnet 'Microsoft.Network/virtualNetworks@2024-10-01' = {
  name: vnetName
  location: location
  tags: {}
  properties: {
    addressSpace: {
      addressPrefixes: addressPrefixes
    }
    dhcpOptions: {
      dnsServers: []
    }
    // We define the subnets inline to avoid https://github.com/Azure/bicep/issues/4653
    subnets: [
      {
        name: appServicePlanEgressSubnetName
        properties: {
          // TODO:DTFS-6422 if using test / prod as our template, this should be linked with the following nat gateway.
          // It isn't clear why dev does not have this and links with sub-prototypekit-dev-001 in the
          // rg-prototypekit-dev-001 RG instead
          natGateway: {
            id: natGateway.id
          }
          addressPrefix: appServicePlanEgressPrefixCidr
          serviceEndpoints: [
            {
              service: 'Microsoft.AzureCosmosDB'
              locations: [
                '*'
              ]
            }
            {
              service: 'Microsoft.Storage'
              locations: storageLocations
            }
          ]
          delegations: [
            {
              name: '0'
              properties: {
                serviceName: 'Microsoft.Web/serverFarms'
              }
              type: 'Microsoft.Network/virtualNetworks/subnets/delegations'
            }
          ]
          privateEndpointNetworkPolicies: 'Enabled'
          privateLinkServiceNetworkPolicies: 'Enabled'
        }
        type: 'Microsoft.Network/virtualNetworks/subnets'
      }
      {
        name: privateEndpointsSubnetName
        properties: {
          addressPrefix: privateEndpointsCidr
          networkSecurityGroup: {
            id: networkSecurityGroupId
          }
          serviceEndpoints: [
            {
              service: 'Microsoft.AzureCosmosDB'
              locations: [
                '*'
              ]
            }
            {
              service: 'Microsoft.Storage'
              locations: storageLocations
            }
          ]
          delegations: []
          privateEndpointNetworkPolicies: 'Disabled'
          privateLinkServiceNetworkPolicies: 'Enabled'
        }
        type: 'Microsoft.Network/virtualNetworks/subnets'
      }
      {
        name: gatewaySubnetName
        properties: {
          addressPrefix: applicationGatewayCidr
          networkSecurityGroup: {
            id: networkSecurityGroupId
          }
          // Note that applicationGatewayIPConfigurations that appear here get populated when setting up the Application Gateway
          serviceEndpoints: [
            {
              service: 'Microsoft.Storage'
              locations: storageLocations
            }
          ]
          delegations: []
          privateEndpointNetworkPolicies: 'Enabled'
          privateLinkServiceNetworkPolicies: 'Enabled'
        }
        type: 'Microsoft.Network/virtualNetworks/subnets'
      }
      {
        // We need to define a subnet for the ClamAV Azure Container App to live in.
        name: acaClamAvSubnetName
        properties: {
          addressPrefix: acaClamAvCidr
          networkSecurityGroup: {
            id: networkSecurityGroupId
          }
          delegations: [
            {
              name: 'Microsoft.App.environments'
              properties: {
                serviceName: 'Microsoft.App/environments'
              }
              type: 'Microsoft.Network/virtualNetworks/subnets/delegations'
            }
          ]
          privateEndpointNetworkPolicies: 'Disabled'
          privateLinkServiceNetworkPolicies: 'Enabled'
        }
        type: 'Microsoft.Network/virtualNetworks/subnets'
      }
    ]
    virtualNetworkPeerings: [
      // Note that we only set up our side of the peering.
      {
        name: peeringVnetName
        properties: {
          remoteVirtualNetwork: {
            id: resourceId(peeringRemoteVnetSubscriptionId, peeringRemoteVnetResourceGroupName, 'Microsoft.Network/virtualNetworks', peeringRemoteVnetName)
          }
          allowVirtualNetworkAccess: true
          allowForwardedTraffic: true
          allowGatewayTransit: false
          useRemoteGateways: false
          doNotVerifyRemoteGateways: false
          remoteAddressSpace: {
            addressPrefixes: [
              peeringAddressSpace
            ]
          }
          remoteVirtualNetworkAddressSpace: {
            addressPrefixes: [
              peeringAddressSpace
            ]
          }
        }
        type: 'Microsoft.Network/virtualNetworks/virtualNetworkPeerings'
      }
    ]
    enableDdosProtection: false
  }
}

resource appServicePlanEgressSubnet 'Microsoft.Network/virtualNetworks/subnets@2024-10-01' existing = {
  parent: vnet
  name: appServicePlanEgressSubnetName
}

resource gatewaySubnet 'Microsoft.Network/virtualNetworks/subnets@2024-10-01' existing = {
  parent: vnet
  name: gatewaySubnetName
}

resource privateEndpointsSubnet 'Microsoft.Network/virtualNetworks/subnets@2024-10-01' existing = {
  parent: vnet
  name: privateEndpointsSubnetName
}

resource acaClamAvSubnet 'Microsoft.Network/virtualNetworks/subnets@2024-10-01' existing = {
  parent: vnet
  name: acaClamAvSubnetName
}

output appServicePlanEgressSubnetId string = appServicePlanEgressSubnet.id
output gatewaySubnetId string = gatewaySubnet.id
output privateEndpointsSubnetId string = privateEndpointsSubnet.id
output vnetId string = vnet.id
output acaClamAvSubnetId string = acaClamAvSubnet.id
