param location string
param environment string
param addressPrefixes array
param privateEndpointsCidr string
param appServicePlanEgressPrefixCidr string
param applicationGatewatCidr string
param vmCidr string

param appServicePlanName string

// TODO:DTFS-6422 Note that none of these parameters/values seem to appear in the old IaC scripts
param demoGatewayPrefixCidr string
param demoPrivateEndpointsPrefixCidr string
param peeringAddressSpace string
param storageLocations array

var vnetName = 'tfs-${appServicePlanName}-vnet'
var maintenanceVmSubnetName = '${resourceGroup().name}-vm'

var appServicePlanEgressSubnetName = '${appServicePlanName}-app-service-plan-egress'
var gatewaySubnetName = '${environment}-gateway'
var privateEndpointsSubnetName = '${environment}-private-endpoints'

// TODO:DTFS-6422 - I don't think this is explicitly named in the scripts. We should come up with a better name.
var vnetPeeringName = 'tfs-dev-vnet_vnet-ukef-uks'

// We import resources rather than pass them around to get their ids
// TODO:DTFS-6422 see route-table.bicep and possibly make a parameter?
var routeTableName = '${resourceGroup().name}-UDR'

resource vnet 'Microsoft.Network/virtualNetworks@2022-11-01' = {
  name: vnetName
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

// TODO:DTFS-6422 Work out what these demo resources are for.
resource demoGatewaySubnet 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  parent: vnet
  name: 'demo-gateway'
  properties: {
    addressPrefix: demoGatewayPrefixCidr
    serviceEndpoints: []
    delegations: []
    privateEndpointNetworkPolicies: 'Enabled'
    privateLinkServiceNetworkPolicies: 'Enabled'
  }
}

resource demoPrivateEndpointsSubnet 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  parent: vnet
  name: 'demo-private-endpoints'
  properties: {
    addressPrefix: demoPrivateEndpointsPrefixCidr
    serviceEndpoints: []
    delegations: []
    privateEndpointNetworkPolicies: 'Enabled'
    privateLinkServiceNetworkPolicies: 'Enabled'
  }
}

resource appServicePlanEgressSubnet 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  parent: vnet
  name: appServicePlanEgressSubnetName
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

resource gatewaySubnet 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  parent: vnet
  name: gatewaySubnetName
  properties: {
    addressPrefix: applicationGatewatCidr
    // TODO:DTFS-6422 add nsg when included 
    // networkSecurityGroup: {
    //   id: '/subscriptions/8beaa40a-2fb6-49d1-b080-ff1871b6276f/resourceGroups/Digital-Dev/providers/Microsoft.Network/networkSecurityGroups/tfs-dev-gw-nsg'
    // }
    // TODO:DTFS-6422 add app gateways when included 
    // applicationGatewayIPConfigurations: [
    //   {
    //     id: '/subscriptions/8beaa40a-2fb6-49d1-b080-ff1871b6276f/resourceGroups/Digital-Dev/providers/Microsoft.Network/applicationGateways/tfs-dev-tfm-gw/gatewayIPConfigurations/appGatewayFrontendIP'
    //   }
    //   {
    //     id: '/subscriptions/8beaa40a-2fb6-49d1-b080-ff1871b6276f/resourceGroups/Digital-Dev/providers/Microsoft.Network/applicationGateways/tfs-dev-gw/gatewayIPConfigurations/appGatewayFrontendIP'
    //   }
    // ]
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

resource privateEndpointsSubnet 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  parent: vnet
  name: privateEndpointsSubnetName
  properties: {
    addressPrefix: privateEndpointsCidr
    // TODO:DTFS-6422 add nsg when included 
    // networkSecurityGroup: {
    //   id: '/subscriptions/8beaa40a-2fb6-49d1-b080-ff1871b6276f/resourceGroups/Digital-Dev/providers/Microsoft.Network/networkSecurityGroups/tfs-dev-gw-nsg'
    // }
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

resource routeTable 'Microsoft.Network/routeTables@2022-11-01' existing = {
  name: routeTableName
}

resource maintenanceVmSubnet 'Microsoft.Network/virtualNetworks/subnets@2022-11-01' = {
  parent: vnet
  name: maintenanceVmSubnetName
  properties: {
    addressPrefix: vmCidr
    routeTable: {
      id: routeTable.id
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

resource vnetPeering 'Microsoft.Network/virtualNetworks/virtualNetworkPeerings@2022-11-01' = {
  parent: vnet
  name: vnetPeeringName
  properties: {
    peeringState: 'Connected'
    peeringSyncLevel: 'FullyInSync'
    // TODO:DTFS-6422 add virtual network when included 
    // remoteVirtualNetwork: {
    //   id: '/subscriptions/08887298-3821-49f0-8303-f88859c12b9b/resourceGroups/UKEF-Firewall-Appliance-UKS/providers/Microsoft.Network/virtualNetworks/VNET_UKEF_UKS'
    // }
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
