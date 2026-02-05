param location string
param gatewaySubnetId string
param tfsTfmIpId string
param tfmUiHostname string
param product string
param target string
param version string


param applicationGatewaySku object = {
  name: 'WAF_v2'
  tier: 'WAF_v2'
}

param autoscaleConfiguration object = {
  minCapacity: 1
  maxCapacity: 5
}

var applicationGatewayName = '${product}-${target}-${version}-tfm-gw'

var frontendPorts = [
  {
    name: 'appGatewayFrontendPort'
    properties: {
      port: 80
    }
  }]

var backendPools = [
  {
    name: 'appGatewayBackendPool'
    properties: {
      backendAddresses: [
        {
          fqdn: tfmUiHostname
        }
      ]
    }
  }]

var httpListeners = [
  {
    name: 'appGatewayHttpListener'
    properties: {
      frontendIPConfiguration: {
        id: resourceId('Microsoft.Network/applicationGateways/frontendIPConfigurations', applicationGatewayName, 'appGatewayFrontendIP')
      }
      frontendPort: {
        id: resourceId('Microsoft.Network/applicationGateways/frontendPorts', applicationGatewayName, 'appGatewayFrontendPort')
      }
      protocol: 'Http'
      requireServerNameIndication: false
    }
  }
]

var requestRoutingRules = [
  {
    name: 'rule1'
    properties: {
      ruleType: 'Basic'
      priority: 10010
      httpListener: {
        id: resourceId('Microsoft.Network/applicationGateways/httpListeners', applicationGatewayName, 'appGatewayHttpListener')
      }
      backendAddressPool: {
        id:  resourceId('Microsoft.Network/applicationGateways/backendAddressPools',applicationGatewayName, 'appGatewayBackendPool')
      }
      backendHttpSettings: {
        id: resourceId('Microsoft.Network/applicationGateways/backendHttpSettingsCollection', applicationGatewayName, 'appGatewayBackendHttpSettings')
      }
    }
  }]


// NOTE: Until the following issue is resolved, we need to self-reference the applicationGateway
// using resourceId() for the various sub-components that need to be created.
// https://github.com/Azure/bicep/issues/1852
// See the following for example usage.
// https://github.com/Azure/azure-quickstart-templates/blob/master/demos/ag-docs-qs/main.bicep

resource applicationGateway 'Microsoft.Network/applicationGateways@2024-10-01' = {
  name: applicationGatewayName
  location: location
  properties: { // NOSONAR – accepted risk, managed by platform team
    sku: applicationGatewaySku
    gatewayIPConfigurations: [
      {
        name: 'appGatewayFrontendIP'
        properties: {
          subnet: {
            id: gatewaySubnetId
          }
        }
      }
    ]
    frontendIPConfigurations: [
      {
        name: 'appGatewayFrontendIP'
        properties: {
          privateIPAllocationMethod: 'Dynamic'
          publicIPAddress: {
            id: tfsTfmIpId
          }
        }
      }
    ]
    frontendPorts: frontendPorts
    backendAddressPools: backendPools
    backendHttpSettingsCollection: [
      {
        name: 'appGatewayBackendHttpSettings'
        properties: {
          port: 443
          protocol: 'Https'
          cookieBasedAffinity: 'Disabled'
          pickHostNameFromBackendAddress: true
          requestTimeout: 30
          probe: {
            id: resourceId('Microsoft.Network/applicationGateways/probes', applicationGatewayName, 'healthcheck')
          }
        }
      }
    ]
    httpListeners: httpListeners
    requestRoutingRules: requestRoutingRules
    probes: [
      {
        name: 'healthcheck'
        properties: {
          protocol: 'Https'
          path: '/healthcheck?ag-tfm'
          interval: 30
          timeout: 120
          unhealthyThreshold: 8
          pickHostNameFromBackendHttpSettings: true
          minServers: 0
        }
      }
    ]
    webApplicationFirewallConfiguration: {
      enabled: true
      firewallMode: 'Prevention'
      ruleSetType: 'OWASP'
      ruleSetVersion: '3.2'
      requestBodyCheck: false
      maxRequestBodySizeInKb: 128
      fileUploadLimitInMb: 100
    }
    autoscaleConfiguration: autoscaleConfiguration
  }
}
