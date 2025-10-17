param environment string
param backendPoolIp string
param wafPoliciesId string

var frontDoorTfmName = 'tfs-${environment}-tfm-fd'

var defaultFrontendProperties = {
    hostName: '${frontDoorTfmName}.azurefd.net'
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
resource frontDoorTfm 'Microsoft.Network/frontdoors@2021-06-01' = {
  name: frontDoorTfmName
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
              id: resourceId('Microsoft.Network/frontdoors/backendPools', frontDoorTfmName, 'DefaultBackendPool')
            }
            '@odata.type': '#Microsoft.Azure.FrontDoor.Models.FrontdoorForwardingConfiguration'
          }
          frontendEndpoints: [
            {
              id: resourceId('Microsoft.Network/frontdoors/frontendEndpoints', frontDoorTfmName, 'DefaultFrontendEndpoint')

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
              id: resourceId('Microsoft.Network/frontdoors/frontendEndpoints', frontDoorTfmName, 'DefaultFrontendEndpoint')
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
          path: '/healthcheck?fd-tfm'
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
            id: resourceId('Microsoft.Network/frontdoors/loadBalancingSettings', frontDoorTfmName, 'DefaultLoadBalancingSettings')
          }
          healthProbeSettings: {
            id: resourceId('Microsoft.Network/frontdoors/healthProbeSettings', frontDoorTfmName, 'DefaultProbeSettings')
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
    friendlyName: frontDoorTfmName
  }
}

output defaultHostName string = frontDoorTfm.properties.frontendEndpoints[0].properties.hostName
