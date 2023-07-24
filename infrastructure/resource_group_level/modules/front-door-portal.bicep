param location string
param environment string

// TODO:FN-430 WAF wafPoliciesName seems to be `vpn` `vpnStaging` and `vpnProd`
param wafPoliciesName string
param redirectUrl string // dev: 'https://ukexportfinance.gov.uk/', staging: <not set>, 'https://www.gov.uk/government/organisations/uk-export-finance'

@description('IPs which are not blocked/redirected')
@secure()
param allowedIpsString string

@allowed(['Cookies', 'PostArgs', 'QueryString', 'RemoteAddr', 'RequestBody', 'RequestHeader', 'RequestMethod', 'RequestUri', 'SocketAddr'])
// TODO:FN-430 set values correctly
param matchVariable string // dev: SocketAddr, staging: SocketAddr, prod: RemoteAddr

@allowed(['Redirect','Block'])
// TODO:FN-430 set values correctly
param rejectAction string // dev: Block, staging: Block, prod 'Redirect'

param backendPoolIp string

var frontDoorPortalName = 'tfs-${environment}-fd'

var allowedIps = json(allowedIpsString)
var unauthorisedMessageBody = base64('Unathorised access!')

// NOTE: Until the following issue is resolved, we need to self-reference the frontdoor 
// using resourceId() for the various sub-components that need to be created.
// https://github.com/Azure/bicep/issues/1852
// The same issue affects ApplicationGateway
resource frontDoorPortal 'Microsoft.Network/frontdoors@2021-06-01' = {
  name: frontDoorPortalName
  location: 'Global'
  tags: {
    Environment: 'Preproduction'
  }
  properties: {
    routingRules: [
      {
        // id: '${frontdoors_tfs_dev_fd_name_resource.id}/RoutingRules/DefaultRoutingRule'
        name: 'DefaultRoutingRule'
        properties: {
          routeConfiguration: {
            forwardingProtocol: 'HttpOnly'
            backendPool: {
              id: resourceId('Microsoft.Network/frontdoors/backendPools', frontDoorPortalName, 'DefaultBackendPool')
              // id: '${frontDoorPortal.id}/backendPools/DefaultBackendPool'
            }
            '@odata.type': '#Microsoft.Azure.FrontDoor.Models.FrontdoorForwardingConfiguration'
          }
          frontendEndpoints: [
            {
              id: resourceId('Microsoft.Network/frontdoors/frontendEndpoints', frontDoorPortalName, 'DefaultFrontendEndpoint')
              // id: '${frontDoorPortal.id}/frontendEndpoints/DefaultFrontendEndpoint'

              // TODO:FN-430 Prod has 3 endpoints here.
            }
          ]
          acceptedProtocols: [
            'Https'
          ]
          patternsToMatch: [
            '/*'
          ]
          enabledState: 'Enabled'
        }
      }
      {
        // id: '${frontDoorPortal.id}/RoutingRules/RedirectToHttps'
        name: 'RedirectToHttps'
        properties: {
          routeConfiguration: {
            redirectType: 'Moved'
            redirectProtocol: 'HttpsOnly'
            '@odata.type': '#Microsoft.Azure.FrontDoor.Models.FrontdoorRedirectConfiguration'
          }
          frontendEndpoints: [
            {
              id: resourceId('Microsoft.Network/frontdoors/frontendEndpoints', frontDoorPortalName, 'DefaultFrontendEndpoint')
              // id: '${frontDoorPortal.id}/frontendEndpoints/DefaultFrontendEndpoint'
            }
          ]
          acceptedProtocols: [
            'Http'
          ]
          patternsToMatch: [
            '/*'
          ]
          enabledState: 'Enabled'
        }
      }
    ]
    loadBalancingSettings: [
      {
        // id: '${frontDoorPortal.id}/LoadBalancingSettings/DefaultLoadBalancingSettings'
        name: 'DefaultLoadBalancingSettings'
        properties: {
          sampleSize: 4
          successfulSamplesRequired: 2
          additionalLatencyMilliseconds: 0
        }
      }
    ]
    healthProbeSettings: [
      {
        // id: '${frontDoorPortal.id}/HealthProbeSettings/DefaultProbeSettings'
        name: 'DefaultProbeSettings'
        properties: {
          path: '/healthcheck?fd-portal'
          protocol: 'Http'
          intervalInSeconds: 30
          enabledState: 'Disabled'
          healthProbeMethod: 'Get'
        }
      }
    ]
    backendPools: [
      {
        // id: '${frontDoorPortal.id}/BackendPools/DefaultBackendPool'
        name: 'DefaultBackendPool'
        properties: {
          backends: [
            {
              address: backendPoolIp
              httpPort: 80
              httpsPort: 443
              priority: 1
              weight: 50
              backendHostHeader: backendPoolIp
              enabledState: 'Enabled'
            }
          ]
          loadBalancingSettings: {
            id: resourceId('Microsoft.Network/frontdoors/loadBalancingSettings', frontDoorPortalName, 'DefaultLoadBalancingSettings')
            // id: '${frontDoorPortal.id}/loadBalancingSettings/DefaultLoadBalancingSettings'
          }
          healthProbeSettings: {
            id: resourceId('Microsoft.Network/frontdoors/healthProbeSettings', frontDoorPortalName, 'DefaultProbeSettings')
            // id: '${frontDoorPortal.id}/healthProbeSettings/DefaultProbeSettings'
          }
        }
      }
    ]
    frontendEndpoints: [
      {
        // id: '${frontDoorPortal.id}/FrontendEndpoints/DefaultFrontendEndpoint'
        name: 'DefaultFrontendEndpoint'
        properties: {
          hostName: '${frontDoorPortalName}.azurefd.net'
          sessionAffinityEnabledState: 'Disabled'
          sessionAffinityTtlSeconds: 0
          webApplicationFirewallPolicyLink: {
            id: wafPolicies.id
          }
        }
      }
    ]
    backendPoolsSettings: {
      enforceCertificateNameCheck: 'Enabled'
      sendRecvTimeoutSeconds: 30
    }
    enabledState: 'Enabled'
    friendlyName: frontDoorPortalName
  }
}

var devRuleOverrides = environment == 'dev' ? [
  {
    ruleGroupName: 'SQLI'
    rules: [
      {
        ruleId: '942200'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942260'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942340'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942180'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942370'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942430'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942480'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942470'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942450'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942440'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942410'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942400'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942390'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942380'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942361'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942360'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942350'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942330'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942320'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942310'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942300'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942290'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942280'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942270'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942250'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942240'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942230'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942220'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942210'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942190'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942170'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942150'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942160'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942140'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942120'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942110'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
      {
        ruleId: '942100'
        enabledState: 'Disabled'
        action: 'Block'
        exclusions: []
      }
    ]
    exclusions: []
  }
] : []

resource wafPolicies 'Microsoft.Network/frontdoorwebapplicationfirewallpolicies@2022-05-01' = {
  name: wafPoliciesName
  location: 'Global'
  tags: {
    Environment: 'Preproduction'
  }
  sku: {
    name: 'Classic_AzureFrontDoor'
  }
  properties: {
    policySettings: {
      enabledState: 'Enabled'
      mode: 'Prevention'
      redirectUrl: redirectUrl
      customBlockResponseStatusCode: 403
      customBlockResponseBody: unauthorisedMessageBody
      requestBodyCheck: 'Disabled'
    }
    customRules: {
      rules: [
        {
          name: 'vpn'
          enabledState: 'Enabled'
          priority: 100
          ruleType: 'MatchRule'
          rateLimitDurationInMinutes: 1
          rateLimitThreshold: 100
          matchConditions: [
            {
              matchVariable: matchVariable
              operator: 'IPMatch'
              negateCondition: true
              matchValue: allowedIps
              transforms: []
            }
          ]
          action: rejectAction
        }
      ]
    }
    managedRules: {
      managedRuleSets: [
        {
          ruleSetType: 'DefaultRuleSet'
          ruleSetVersion: '1.0'
          ruleGroupOverrides: devRuleOverrides
          exclusions: []
        }
      ]
    }
  }
}
