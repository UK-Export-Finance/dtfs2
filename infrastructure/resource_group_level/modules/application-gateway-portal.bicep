param location string
param gatewaySubnetId string
param tfsIpId string
param portalApiHostname string
param portalUiHostname string
param gefUiHostname string
param apiPortalAccessPort int = 0
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

var applicationGatewayName = '${product}-${target}-${version}-gw'

var tfsPortApi = '${product}-${target}-${version}-port-api'

var frontendPorts = concat([
  {
    name: 'appGatewayFrontendPort'
    properties: {
      port: 80
    }
  }],
  apiPortalAccessPort != 0 ? [{
    name: tfsPortApi
    properties: {
      port: apiPortalAccessPort
    }
  }] : []
)

var backendPools = concat([
  {
    name: 'appGatewayBackendPool'
    properties: {
      backendAddresses: [
        {
          fqdn: portalUiHostname
        }
      ]
    }
  }
  {
    name: 'gefGatewayBackendPool'
    properties: {
      backendAddresses: [
        {
          fqdn: gefUiHostname
        }
      ]
    }
  }
],
apiPortalAccessPort != 0 ? [{
    name: 'apiGatewayBackendPool'
    properties: {
      backendAddresses: [
        {
          fqdn: portalApiHostname
        }
      ]
    }
  }] : []
)

var httpListeners = concat([
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
      hostNames: []
      requireServerNameIndication: false
    }
  }
],
apiPortalAccessPort != 0 ? [{
  name: 'apiGatewayHttpListener'
  properties: {
    frontendIPConfiguration: {
      id: resourceId('Microsoft.Network/applicationGateways/frontendIPConfigurations', applicationGatewayName, 'appGatewayFrontendIP')
    }
    frontendPort: {
      id: resourceId('Microsoft.Network/applicationGateways/frontendPorts', applicationGatewayName, tfsPortApi)
    }
    protocol: 'Http'
    hostNames: []
    requireServerNameIndication: false
  }
}] : []
)

var requestRoutingRules = concat([
  {
    name: 'rule1'
    properties: {
      ruleType: 'PathBasedRouting'
      priority: 10010
      httpListener: {
        id: resourceId('Microsoft.Network/applicationGateways/httpListeners', applicationGatewayName, 'appGatewayHttpListener')
      }
      urlPathMap: {
        id: resourceId('Microsoft.Network/applicationGateways/urlPathMaps', applicationGatewayName, 'gef-url-path-map')
      }
    }
  }],
  apiPortalAccessPort != 0 ? [{
    name: 'api-rule'
    properties: {
      ruleType: 'Basic'
      priority: 10020
      httpListener: {
        id: resourceId('Microsoft.Network/applicationGateways/httpListeners', applicationGatewayName, 'apiGatewayHttpListener')
      }
      backendAddressPool: {
        id: resourceId('Microsoft.Network/applicationGateways/backendAddressPools', applicationGatewayName, 'apiGatewayBackendPool')
      }
      backendHttpSettings: {
        id: resourceId('Microsoft.Network/applicationGateways/backendHttpSettingsCollection', applicationGatewayName, 'appGatewayBackendHttpSettings')
      }
    }
  }] : []
)

/* NOTE: Until the following issue is resolved, we need to self-reference the applicationGateway
using resourceId() for the various sub-components that need to be created.
https://github.com/Azure/bicep/issues/1852
See the following for example usage.
https://github.com/Azure/azure-quickstart-templates/blob/master/demos/ag-docs-qs/main.bicep */

resource applicationGateway 'Microsoft.Network/applicationGateways@2024-10-01' = {
  name: applicationGatewayName
  location: location
  tags: {
    Environment: 'Preproduction'
    Product: 'exip, dtfs'
  }
  properties: {
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
            id: tfsIpId
          }
        }
      }
    ]
    frontendPorts: frontendPorts
    backendAddressPools: backendPools
    loadDistributionPolicies: []
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
      {
        name: 'gefGatewayBackendHttpSettings'
        properties: {
          port: 443
          protocol: 'Https'
          cookieBasedAffinity: 'Disabled'
          pickHostNameFromBackendAddress: true
          path: '/'
          requestTimeout: 30
          probe: {
            id: resourceId('Microsoft.Network/applicationGateways/probes', applicationGatewayName, 'gef-healthcheck')
          }
        }
      }
    ]
    backendSettingsCollection: []
    httpListeners: httpListeners
    listeners: []
    urlPathMaps: [
      {
        name: 'gef-url-path-map'
        properties: {
          defaultBackendAddressPool: {
            id: resourceId('Microsoft.Network/applicationGateways/backendAddressPools', applicationGatewayName, 'appGatewayBackendPool')
          }
          defaultBackendHttpSettings: {
            id: resourceId('Microsoft.Network/applicationGateways/backendHttpSettingsCollection', applicationGatewayName, 'appGatewayBackendHttpSettings')
          }
          pathRules: [
            {
              name: 'gef-url-rule'
              properties: {
                paths: [
                  '/gef/*'
                ]
                backendAddressPool: {
                  id: resourceId('Microsoft.Network/applicationGateways/backendAddressPools', applicationGatewayName, 'gefGatewayBackendPool')
                }
                backendHttpSettings: {
                  id: resourceId('Microsoft.Network/applicationGateways/backendHttpSettingsCollection', applicationGatewayName, 'gefGatewayBackendHttpSettings')
                }
              }
            }
          ]
        }
      }
    ]
    requestRoutingRules: requestRoutingRules
    routingRules: []
    probes: [
      {
        name: 'healthcheck'
        properties: {
          protocol: 'Https'
          path: '/healthcheck?ag-portal'
          interval: 30
          timeout: 120
          unhealthyThreshold: 8
          pickHostNameFromBackendHttpSettings: true
          minServers: 0
          match: {}
        }
      }
      {
        name: 'gef-healthcheck'
        properties: {
          protocol: 'Https'
          path: '/healthcheck?ag-gef'
          interval: 30
          timeout: 120
          unhealthyThreshold: 8
          pickHostNameFromBackendHttpSettings: true
          minServers: 0
          match: {}
        }
      }
    ]
    rewriteRuleSets: []
    redirectConfigurations: []
    privateLinkConfigurations: []
    webApplicationFirewallConfiguration: {
      enabled: true
      firewallMode: 'Prevention'
      ruleSetType: 'OWASP'
      ruleSetVersion: '3.2'
      disabledRuleGroups: []
      exclusions: []
      requestBodyCheck: false
      maxRequestBodySizeInKb: 128
      fileUploadLimitInMb: 100
    }
    autoscaleConfiguration: autoscaleConfiguration
  }
}
