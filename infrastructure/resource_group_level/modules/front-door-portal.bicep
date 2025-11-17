param backendPoolIp string
param wafPoliciesId string = ''
param product string
param target string
param version string

var frontDoorPortalName = 'frontdoor-${product}-portal-${target}-${version}'
var endpointName = 'DefaultFrontendEndpoint'
var originGroupName = 'DefaultBackendPool'
var originName = 'backendOrigin'
var routeForwardName = 'DefaultRoutingRule'
var routeRedirectName = 'RedirectToHttps'

resource afdProfile 'Microsoft.Cdn/profiles@2024-02-01' = {
  name: frontDoorPortalName
  location: 'global'
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
  tags: {}
}

resource afdEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2024-02-01' = {
  name: endpointName
  parent: afdProfile
  location: 'global'
  properties: {
    enabledState: 'Enabled'
  }
}

resource originGroup 'Microsoft.Cdn/profiles/originGroups@2024-02-01' = {
  name: originGroupName
  parent: afdProfile
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 2
      additionalLatencyMilliseconds: 0
    }
    healthProbeSettings: {
      probePath: '/healthcheck?fd-portal'
      probeRequestType: 'GET'
      probeProtocol: 'Http'
      intervalInSeconds: 30
      isEnabled: false       // matches Classic's enabledState: 'Disabled'
    }
  }
}

resource origin 'Microsoft.Cdn/profiles/originGroups/origins@2024-02-01' = {
  name: '${afdProfile.name}/${originGroupName}/${originName}'
  properties: {
    hostName: backendPoolIp
    httpPort: 80
    httpsPort: 443
    priority: 1
    weight: 50
    enabledState: 'Enabled'
  }
}

resource routeForward 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = {
  name: '${afdProfile.name}/${endpointName}/${routeForwardName}'
  properties: {
    originGroup: {
      id: originGroup.id
    }
    patternsToMatch: [
      '/*'
    ]
    supportedProtocols: [
      'Https'
    ]
    httpsRedirect: 'Disabled'     // HTTPS should *not* redirect → forward
    forwardingProtocol: 'HttpOnly'
    linkToDefaultDomain: 'Enabled'
  }
}

resource routeRedirect 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = {
  name: '${afdProfile.name}/${endpointName}/${routeRedirectName}'
  properties: {
    originGroup: null
    patternsToMatch: [
      '/*'
    ]
    supportedProtocols: [
      'Http'
    ]
    httpsRedirect: 'Enabled'
    linkToDefaultDomain: 'Enabled'
  }
}

resource wafAssoc 'Microsoft.Cdn/profiles/securityPolicies@2024-02-01' = if (!empty(wafPoliciesId)) {
  name: '${afdProfile.name}/wafPolicy'
  properties: {
    associations: [
      {
        domains: [
          afdEndpoint.id
        ]
        wafPolicy: {
          id: wafPoliciesId
        }
      }
    ]
  }
}
