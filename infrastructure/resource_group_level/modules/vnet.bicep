resource tfs_dev_vnet 'Microsoft.Network/virtualNetworks@2022-11-01' = {
  name: 'tfs-dev-vnet'
  location: 'uksouth'
  tags: {
    Environment: 'Preproduction'
  }
  properties: {
    addressSpace: {
      addressPrefixes: [
        '172.16.40.0/22'
        '172.16.60.0/23'
      ]
    }
    dhcpOptions: {
      dnsServers: []
    }
    subnets: [
      {
        name: 'dev-app-service-plan-egress'
        properties: {
          addressPrefix: '172.16.42.0/28'
          serviceEndpoints: [
            {
              service: 'Microsoft.AzureCosmosDB'
              locations: [
                '*'
              ]
            }
            {
              service: 'Microsoft.Storage'
              locations: [
                'uksouth'
                'ukwest'
              ]
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
        name: 'dev-private-endpoints'
        properties: {
          addressPrefix: '172.16.40.0/24'
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
              locations: [
                'uksouth'
                'ukwest'
              ]
            }
          ]
          delegations: []
          privateEndpointNetworkPolicies: 'Disabled'
          privateLinkServiceNetworkPolicies: 'Enabled'
        }
        type: 'Microsoft.Network/virtualNetworks/subnets'
      }
      {
        name: 'demo-gateway'
        properties: {
          addressPrefix: '172.16.61.0/24'
          serviceEndpoints: []
          delegations: []
          privateEndpointNetworkPolicies: 'Enabled'
          privateLinkServiceNetworkPolicies: 'Enabled'
        }
        type: 'Microsoft.Network/virtualNetworks/subnets'
      }
      {
        name: 'demo-private-endpoints'
        properties: {
          addressPrefix: '172.16.60.0/24'
          serviceEndpoints: []
          delegations: []
          privateEndpointNetworkPolicies: 'Enabled'
          privateLinkServiceNetworkPolicies: 'Enabled'
        }
        type: 'Microsoft.Network/virtualNetworks/subnets'
      }
      {
        name: 'dev-gateway'
        properties: {
          addressPrefix: '172.16.41.0/24'
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
              locations: [
                'uksouth'
                'ukwest'
              ]
            }
          ]
          delegations: []
          privateEndpointNetworkPolicies: 'Enabled'
          privateLinkServiceNetworkPolicies: 'Enabled'
        }
        type: 'Microsoft.Network/virtualNetworks/subnets'
      }
      {
        name: 'Digital-Dev-vm'
        properties: {
          addressPrefix: '172.16.43.0/28'
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
              locations: [
                'uksouth'
                'ukwest'
              ]
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
        type: 'Microsoft.Network/virtualNetworks/subnets'
      }
    ]
    virtualNetworkPeerings: [
      {
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
              '10.50.0.0/16'
            ]
          }
          remoteVirtualNetworkAddressSpace: {
            addressPrefixes: [
              '10.50.0.0/16'
            ]
          }
        }
        type: 'Microsoft.Network/virtualNetworks/virtualNetworkPeerings'
      }
    ]
    enableDdosProtection: false
  }
}

resource tfs_dev_vnet_demo_gateway 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  name: 'tfs-dev-vnet/demo-gateway'
  properties: {
    addressPrefix: '172.16.61.0/24'
    serviceEndpoints: []
    delegations: []
    privateEndpointNetworkPolicies: 'Enabled'
    privateLinkServiceNetworkPolicies: 'Enabled'
  }
  dependsOn: [
    tfs_dev_vnet
  ]
}

resource tfs_dev_vnet_demo_private_endpoints 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  name: 'tfs-dev-vnet/demo-private-endpoints'
  properties: {
    addressPrefix: '172.16.60.0/24'
    serviceEndpoints: []
    delegations: []
    privateEndpointNetworkPolicies: 'Enabled'
    privateLinkServiceNetworkPolicies: 'Enabled'
  }
  dependsOn: [
    tfs_dev_vnet
  ]
}

resource tfs_dev_vnet_dev_app_service_plan_egress 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  name: 'tfs-dev-vnet/dev-app-service-plan-egress'
  properties: {
    addressPrefix: '172.16.42.0/28'
    serviceEndpoints: [
      {
        service: 'Microsoft.AzureCosmosDB'
        locations: [
          '*'
        ]
      }
      {
        service: 'Microsoft.Storage'
        locations: [
          'uksouth'
          'ukwest'
        ]
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
  dependsOn: [
    tfs_dev_vnet
  ]
}

resource tfs_dev_vnet_dev_gateway 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  name: 'tfs-dev-vnet/dev-gateway'
  properties: {
    addressPrefix: '172.16.41.0/24'
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
        locations: [
          'uksouth'
          'ukwest'
        ]
      }
    ]
    delegations: []
    privateEndpointNetworkPolicies: 'Enabled'
    privateLinkServiceNetworkPolicies: 'Enabled'
  }
  dependsOn: [
    tfs_dev_vnet
  ]
}

resource tfs_dev_vnet_dev_private_endpoints 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  name: 'tfs-dev-vnet/dev-private-endpoints'
  properties: {
    addressPrefix: '172.16.40.0/24'
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
        locations: [
          'uksouth'
          'ukwest'
        ]
      }
    ]
    delegations: []
    privateEndpointNetworkPolicies: 'Disabled'
    privateLinkServiceNetworkPolicies: 'Enabled'
  }
  dependsOn: [
    tfs_dev_vnet
  ]
}

resource tfs_dev_vnet_Digital_Dev_vm 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  name: 'tfs-dev-vnet/Digital-Dev-vm'
  properties: {
    addressPrefix: '172.16.43.0/28'
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
        locations: [
          'uksouth'
          'ukwest'
        ]
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
  dependsOn: [
    tfs_dev_vnet
  ]
}

resource tfs_dev_vnet_tfs_dev_vnet_vnet_ukef_uks 'Microsoft.Network/virtualNetworks/virtualNetworkPeerings@2022-11-01' = {
  name: 'tfs-dev-vnet/tfs-dev-vnet_vnet-ukef-uks'
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
        '10.50.0.0/16'
      ]
    }
    remoteVirtualNetworkAddressSpace: {
      addressPrefixes: [
        '10.50.0.0/16'
      ]
    }
  }
  dependsOn: [
    tfs_dev_vnet
  ]
}
