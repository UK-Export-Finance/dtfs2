param location string
param environment string
param gatewaySubnetId string
param tfsIpId string
param portalApiHostname string
param portalUiHostname string
param gefUiHostname string

var applicationGatewayName = 'tfs-${environment}-gw'

var tfsPortApi = 'tfs-${environment}-port-api'

// NOTE: Until the following issue is resolved, we need to self-reference the applicationGateway 
// using resourceId() for the various sub-components that need to be created.
// https://github.com/Azure/bicep/issues/1852
// See the following for example usage.
// https://github.com/Azure/azure-quickstart-templates/blob/master/demos/ag-docs-qs/main.bicep

resource applicationGateway 'Microsoft.Network/applicationGateways@2022-11-01' = {
  name: applicationGatewayName
  location: location
  tags: {
    Environment: 'Preproduction'
    Product: 'exip, dtfs'
  }
  properties: {
    sku: {
      name: 'WAF_v2'
      tier: 'WAF_v2'
    }
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
    sslCertificates: []
    trustedRootCertificates: []
    trustedClientCertificates: []
    sslProfiles: []
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
    frontendPorts: [
      {
        name: 'appGatewayFrontendPort'
        properties: {
          port: 80
        }
      }
      {
        name: tfsPortApi
        properties: {
          port: 44232
        }
      }
    ]
    backendAddressPools: [
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
      {
        name: 'apiGatewayBackendPool'
        properties: {
          backendAddresses: [
            {
              fqdn: portalApiHostname
            }
          ]
        }
      }
    ]
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
            // id: '${applicationGateway.id}/probes/healthcheck'
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
            // id: '${applicationGateway.id}/probes/gef-healthcheck'
          }
        }
      }
    ]
    backendSettingsCollection: []
    httpListeners: [
      {
        name: 'appGatewayHttpListener'
        properties: {
          frontendIPConfiguration: {
            id: resourceId('Microsoft.Network/applicationGateways/frontendIPConfigurations', applicationGatewayName, 'appGatewayFrontendIP')
            // id: '${applicationGateway.id}/frontendIPConfigurations/appGatewayFrontendIP'
          }
          frontendPort: {
            id: resourceId('Microsoft.Network/applicationGateways/frontendPorts', applicationGatewayName, 'appGatewayFrontendPort')
            // id: '${applicationGateway.id}/frontendPorts/appGatewayFrontendPort'
          }
          protocol: 'Http'
          hostNames: []
          requireServerNameIndication: false
        }
      }
      {
        name: 'apiGatewayHttpListener'
        properties: {
          frontendIPConfiguration: {
            id: resourceId('Microsoft.Network/applicationGateways/frontendIPConfigurations', applicationGatewayName, 'appGatewayFrontendIP')
            // id: '${applicationGateway.id}/frontendIPConfigurations/appGatewayFrontendIP'
          }
          frontendPort: {
            id: resourceId('Microsoft.Network/applicationGateways/frontendPorts', applicationGatewayName, tfsPortApi)
            // id: '${applicationGateway.id}/frontendPorts/tfs-dev-port-api'
          }
          protocol: 'Http'
          hostNames: []
          requireServerNameIndication: false
        }
      }
    ]
    listeners: []
    urlPathMaps: [
      {
        name: 'gef-url-path-map'
        properties: {
          defaultBackendAddressPool: {
            id: resourceId('Microsoft.Network/applicationGateways/backendAddressPools', applicationGatewayName, 'appGatewayBackendPool')
            // id: '${applicationGateway.id}/backendAddressPools/appGatewayBackendPool'
          }
          defaultBackendHttpSettings: {
            id: resourceId('Microsoft.Network/applicationGateways/backendHttpSettingsCollection', applicationGatewayName, 'appGatewayBackendHttpSettings')
            // id: '${applicationGateway.id}/backendHttpSettingsCollection/appGatewayBackendHttpSettings'
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
                  // id: '${applicationGateway.id}/backendAddressPools/gefGatewayBackendPool'
                }
                backendHttpSettings: {
                  id: resourceId('Microsoft.Network/applicationGateways/backendHttpSettingsCollection', applicationGatewayName, 'gefGatewayBackendHttpSettings')
                  // id: '${applicationGateway.id}/backendHttpSettingsCollection/gefGatewayBackendHttpSettings'
                }
              }
            }
          ]
        }
      }
    ]
    requestRoutingRules: [
      {
        name: 'rule1'
        properties: {
          ruleType: 'PathBasedRouting'
          priority: 10010
          httpListener: {
            id: resourceId('Microsoft.Network/applicationGateways/httpListeners', applicationGatewayName, 'appGatewayHttpListener')
            // id: '${applicationGateway.id}/httpListeners/appGatewayHttpListener'
          }
          urlPathMap: {
            id: resourceId('Microsoft.Network/applicationGateways/urlPathMaps', applicationGatewayName, 'gef-url-path-map') //QQ:GRM name?
            // id: '${applicationGateway.id}/urlPathMaps/gef-url-path-map'
          }
        }
      }
      {
        name: 'api-rule'
        properties: {
          ruleType: 'Basic'
          priority: 10020
          httpListener: {
            id: resourceId('Microsoft.Network/applicationGateways/httpListeners', applicationGatewayName, 'apiGatewayHttpListener')
            // id: '${applicationGateway.id}/httpListeners/apiGatewayHttpListener'
          }
          backendAddressPool: {
            id: resourceId('Microsoft.Network/applicationGateways/backendAddressPools', applicationGatewayName, 'apiGatewayBackendPool')
            // id: '${applicationGateway.id}/backendAddressPools/apiGatewayBackendPool'
          }
          backendHttpSettings: {
            id: resourceId('Microsoft.Network/applicationGateways/backendHttpSettingsCollection', applicationGatewayName, 'appGatewayBackendHttpSettings')
            // id: '${applicationGateway.id}/backendHttpSettingsCollection/appGatewayBackendHttpSettings'
          }
        }
      }
    ]
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
    autoscaleConfiguration: {
      minCapacity: 1
      maxCapacity: 5
    }
  }
}
