param environment string

param wafPoliciesName string
param redirectUrl string

@description('IPs which are not blocked/redirected')
@secure()
param allowedIpsString string

@allowed(['Cookies', 'PostArgs', 'QueryString', 'RemoteAddr', 'RequestBody', 'RequestHeader', 'RequestMethod', 'RequestUri', 'SocketAddr'])
param matchVariable string

@allowed(['Redirect','Block'])
param rejectAction string

param backendPoolIp string
param applyWafRuleOverrides bool = false
param restrictAccessToUkefIps bool

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
        name: 'DefaultRoutingRule'
        properties: {
          routeConfiguration: {
            // TODO:FN-741 Connect via HTTPS
            forwardingProtocol: 'HttpOnly'
            backendPool: {
              id: resourceId('Microsoft.Network/frontdoors/backendPools', frontDoorPortalName, 'DefaultBackendPool')
            }
            '@odata.type': '#Microsoft.Azure.FrontDoor.Models.FrontdoorForwardingConfiguration'
          }
          frontendEndpoints: [
            {
              id: resourceId('Microsoft.Network/frontdoors/frontendEndpoints', frontDoorPortalName, 'DefaultFrontendEndpoint')

              // TODO:FN-852 set up routing for custom domains 
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
          }
          healthProbeSettings: {
            id: resourceId('Microsoft.Network/frontdoors/healthProbeSettings', frontDoorPortalName, 'DefaultProbeSettings')
          }
        }
      }
    ]
    frontendEndpoints: [
      // TODO:FN-852 set up routing for custom domains 
      {
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

var devRuleOverrides = applyWafRuleOverrides ? [
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


var wafCustomRules = restrictAccessToUkefIps ? [
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
      rules: wafCustomRules
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
