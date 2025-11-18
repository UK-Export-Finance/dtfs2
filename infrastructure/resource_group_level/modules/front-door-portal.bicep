param backendPoolIp string
param wafPoliciesId string = ''
param product string
param target string
param version string

var frontDoorName     = 'frontdoor-${product}-portal-${target}-${version}'
var endpointName      = 'default-endpoint'
var originGroupName   = 'default-origin-group'
var originName        = 'backend-origin'
var routeForwardName  = 'forward-route'
var routeRedirectName = 'redirect-route'

// -------------------------------------------
// AFD Profile
// -------------------------------------------
resource afdProfile 'Microsoft.Cdn/profiles@2024-02-01' = {
  name: frontDoorName
  location: 'global'
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
}

// -------------------------------------------
// Endpoint
// -------------------------------------------
resource afdEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2024-02-01' = {
  name: endpointName
  parent: afdProfile
  location: 'global'
  properties: {
    enabledState: 'Enabled'
  }
}

// -------------------------------------------
// Origin Group
// -------------------------------------------
resource originGroup 'Microsoft.Cdn/profiles/originGroups@2024-02-01' = {
  name: originGroupName
  parent: afdProfile
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 2
      additionalLatencyInMilliseconds: 0
    }
    healthProbeSettings: {
      probePath: '/healthcheck?fd-portal'
      probeRequestType: 'GET'
      probeProtocol: 'Http'
      probeIntervalInSeconds: 30
    }
  }
}

// -------------------------------------------
// Origin inside Origin Group
// -------------------------------------------
resource origin 'Microsoft.Cdn/profiles/originGroups/origins@2024-02-01' = {
  name: originName
  parent: originGroup
  properties: {
    hostName: backendPoolIp
    httpPort: 80
    httpsPort: 443
    priority: 1
    weight: 50
    enabledState: 'Enabled'
  }
}

// -------------------------------------------
// Forward Route (HTTPS → HTTP backend)
// -------------------------------------------
resource routeForward 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = {
  name: routeForwardName
  parent: afdEndpoint
  properties: {
    originGroup: {
      id: originGroup.id
    }
    supportedProtocols: [
      'Https'
    ]
    patternsToMatch: [
      '/*'
    ]
    forwardingProtocol: 'HttpOnly'
    httpsRedirect: 'Disabled' // matches Classic FWD behaviour
    linkToDefaultDomain: 'Enabled'
  }
}

// -------------------------------------------
// Redirect Route (HTTP → HTTPS)
// -------------------------------------------
resource routeRedirect 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = {
  name: routeRedirectName
  parent: afdEndpoint
  properties: {
    originGroup: null
    supportedProtocols: [
      'Http'
    ]
    patternsToMatch: [
      '/*'
    ]
    httpsRedirect: 'Enabled'
    linkToDefaultDomain: 'Enabled'
  }
}

// -------------------------------------------
// WAF Policy Association (optional)
// -------------------------------------------
resource wafAssoc 'Microsoft.Cdn/profiles/securityPolicies@2024-02-01' = if (!empty(wafPoliciesId)) {
  name: 'waf-policy'
  parent: afdProfile
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

output endpointHostName string = afdEndpoint.properties.hostName
