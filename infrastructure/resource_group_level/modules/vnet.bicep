param location string
param environment string
param addressPrefixes array
param privateEndpointsCidr string
param appServicePlanEgressPrefixCidr string
param applicationGatewayCidr string
param aciCidr string

param appServicePlanName string

param networkSecurityGroupId string

// Note that the staging name is: "tfs-test-vnet_vnet-ukef-uks", so we accept a parameter to set it.
param peeringVnetName string = 'tfs-${environment}-vnet_vnet-ukef-uks'
@secure()
param peeringRemoteVnetSubscriptionId string
param peeringRemoteVnetResourceGroupName string
param peeringRemoteVnetName string
param peeringAddressSpace string

param storageLocations array

var natGatewayName = 'tfs-${appServicePlanName}-nat-gw'
var natGatewayIpAddressesName = 'tfs-${appServicePlanName}-nat-ip'

var vnetName = 'tfs-${appServicePlanName}-vnet'

var appServicePlanEgressSubnetName = '${appServicePlanName}-app-service-plan-egress'
var gatewaySubnetName = '${environment}-gateway'
var privateEndpointsSubnetName = '${environment}-private-endpoints'

var aciSubnetName = '${environment}-aci'

resource natGatewayIpAddresses 'Microsoft.Network/publicIPAddresses@2022-11-01' = {
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

resource natGateway 'Microsoft.Network/natGateways@2022-11-01' = {
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

resource vnet 'Microsoft.Network/virtualNetworks@2022-11-01' = {
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
        name: aciSubnetName
        properties: {
          addressPrefix: aciCidr
          networkSecurityGroup: {
            id: networkSecurityGroupId
          }
          delegations: [
            {
              name: 'DelegationService'
              properties: {
                serviceName: 'Microsoft.ContainerInstance/containerGroups'
              }
            }
          ]
        }
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

resource appServicePlanEgressSubnet 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' existing = {
  parent: vnet
  name: appServicePlanEgressSubnetName
}

resource gatewaySubnet 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' existing = {
  parent: vnet
  name: gatewaySubnetName
}

resource privateEndpointsSubnet 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' existing = {
  parent: vnet
  name: privateEndpointsSubnetName
}

resource aciSubnet 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' existing = {
  parent: vnet
  name: aciSubnetName
}

output appServicePlanEgressSubnetId string = appServicePlanEgressSubnet.id
output gatewaySubnetId string = gatewaySubnet.id
output privateEndpointsSubnetId string = privateEndpointsSubnet.id
output vnetId string = vnet.id
output aciSubnetId string = aciSubnet.id
