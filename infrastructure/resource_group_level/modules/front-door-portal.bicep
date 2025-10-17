param environment string
param backendPoolIp string
param wafPoliciesId string = ''

var frontDoorPortalName = 'tfs-${environment}-fd'

var defaultFrontendProperties = {
  hostName: '${frontDoorPortalName}.azurefd.net'
  sessionAffinityEnabledState: 'Disabled'
  sessionAffinityTtlSeconds: 0
  webApplicationFirewallPolicyLink: {
    id: wafPoliciesId
    }
}

// NOTE: Until the following issue is resolved, we need to self-reference the frontdoor 
// using resourceId() for the various sub-components that need to be created.
// https://github.com/Azure/bicep/issues/1852
// The same issue affects ApplicationGateway
resource frontDoorPortal 'Microsoft.Network/frontdoors@2021-06-01' = {
  name: frontDoorPortalName
  location: 'Global'
  tags: {}
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
      {
        name: 'DefaultFrontendEndpoint'
        properties: defaultFrontendProperties
      }
      // TODO:FN-852 set up routing for custom domains 
    ]
    backendPoolsSettings: {
      enforceCertificateNameCheck: 'Enabled'
      sendRecvTimeoutSeconds: 30
    }
    enabledState: 'Enabled'
    friendlyName: frontDoorPortalName
  }
}

