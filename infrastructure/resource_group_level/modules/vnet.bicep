param location string
param addressPrefixes array
param privateEndpointsCidr string
param appServicePlanEgressPrefixCidr string
param applicationGatewatCidr string
param vmCidr string

// TODO:DTFS-6422 Note that none of these parameters/values seem to appear in the old IaC scripts
param demoGatewayPrefixCidr string
param demoPrivateEndpointsPrefixCidr string
param peeringAddressSpace string
param storageLocations array

resource tfs_dev_vnet 'Microsoft.Network/virtualNetworks@2022-11-01' = {
  name: 'tfs-dev-vnet'
  location: location
  tags: {
    Environment: 'Preproduction'
  }
  properties: {
    addressSpace: {
      addressPrefixes: addressPrefixes
    }
    dhcpOptions: {
      dnsServers: []
    }
    enableDdosProtection: false
  }
}

resource tfs_dev_vnet_demo_gateway 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  parent: tfs_dev_vnet
  name: 'demo-gateway'
  properties: {
    addressPrefix: demoGatewayPrefixCidr
    serviceEndpoints: []
    delegations: []
    privateEndpointNetworkPolicies: 'Enabled'
    privateLinkServiceNetworkPolicies: 'Enabled'
  }
}

resource tfs_dev_vnet_demo_private_endpoints 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  parent: tfs_dev_vnet
  name: 'demo-private-endpoints'
  properties: {
    addressPrefix: demoPrivateEndpointsPrefixCidr
    serviceEndpoints: []
    delegations: []
    privateEndpointNetworkPolicies: 'Enabled'
    privateLinkServiceNetworkPolicies: 'Enabled'
  }
}

resource tfs_dev_vnet_dev_app_service_plan_egress 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  parent: tfs_dev_vnet
  name: 'dev-app-service-plan-egress'
  properties: {
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
}

resource tfs_dev_vnet_dev_gateway 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  parent: tfs_dev_vnet
  name: 'dev-gateway'
  properties: {
    addressPrefix: applicationGatewatCidr
    networkSecurityGroup: {
      id: '/subscriptions/8beaa40a-2fb6-49d1-b080-ff1871b6276f/resourceGroups/Digital-Dev/providers/Microsoft.Network/networkSecurityGroups/tfs-dev-gw-nsg'
    }
    applicationGatewayIPConfigurations: [
      {
        id: '/subscriptions/8beaa40a-2fb6-49d1-b080-ff1871b6276f/resourceGroups/Digital-Dev/providers/Microsoft.Network/applicationGateways/tfs-dev-tfm-gw/gatewayIPConfigurations/appGatewayFrontendIP'
      }
      {
        id: '/subscriptions/8beaa40a-2fb6-49d1-b080-ff1871b6276f/resourceGroups/Digital-Dev/providers/Microsoft.Network/applicationGateways/tfs-dev-gw/gatewayIPConfigurations/appGatewayFrontendIP'
      }
    ]
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
}

resource tfs_dev_vnet_dev_private_endpoints 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  parent: tfs_dev_vnet
  name: 'dev-private-endpoints'
  properties: {
    addressPrefix: privateEndpointsCidr
    networkSecurityGroup: {
      id: '/subscriptions/8beaa40a-2fb6-49d1-b080-ff1871b6276f/resourceGroups/Digital-Dev/providers/Microsoft.Network/networkSecurityGroups/tfs-dev-gw-nsg'
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
}

resource tfs_dev_vnet_Digital_Dev_vm 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  parent: tfs_dev_vnet
  name: 'Digital-Dev-vm'
  properties: {
    addressPrefix: vmCidr
    routeTable: {
      id: '/subscriptions/8beaa40a-2fb6-49d1-b080-ff1871b6276f/resourceGroups/Digital-Dev/providers/Microsoft.Network/routeTables/Digital-Dev-UDR'
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
    delegations: [
      {
        name: 'delegation'
        properties: {
          serviceName: 'Microsoft.Web/serverfarms'
        }
        type: 'Microsoft.Network/virtualNetworks/subnets/delegations'
      }
    ]
    privateEndpointNetworkPolicies: 'Enabled'
    privateLinkServiceNetworkPolicies: 'Enabled'
  }
}

resource tfs_dev_vnet_tfs_dev_vnet_vnet_ukef_uks 'Microsoft.Network/virtualNetworks/virtualNetworkPeerings@2022-11-01' = {
  parent: tfs_dev_vnet
  name: 'tfs-dev-vnet_vnet-ukef-uks'
  properties: {
    peeringState: 'Connected'
    peeringSyncLevel: 'FullyInSync'
    remoteVirtualNetwork: {
      id: '/subscriptions/08887298-3821-49f0-8303-f88859c12b9b/resourceGroups/UKEF-Firewall-Appliance-UKS/providers/Microsoft.Network/virtualNetworks/VNET_UKEF_UKS'
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
}
