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
resource afdProfile 'Microsoft.Cdn/profiles@2025-06-01' = {
  name: frontDoorName
  location: 'global'
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
}

// -------------------------------------------
// Endpoint
// -------------------------------------------
resource afdEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2025-06-01' = {
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
resource originGroup 'Microsoft.Cdn/profiles/originGroups@2025-06-01' = {
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
resource origin 'Microsoft.Cdn/profiles/originGroups/origins@2025-06-01' = {
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
resource routeForward 'Microsoft.Cdn/profiles/afdEndpoints/routes@2025-06-01' = {
  name: routeForwardName
  parent: afdEndpoint
  properties: {
    originGroup: {
      id: originGroup.id
    }
    patternsToMatch: ['/*']
    supportedProtocols: ['Https']
    httpsRedirect: 'Disabled'
    forwardingProtocol: 'HttpOnly'
    linkToDefaultDomain: 'Enabled'
  }
}


// -------------------------------------------
// Redirect Route (HTTP → HTTPS)
// -------------------------------------------
resource routeRedirect 'Microsoft.Cdn/profiles/afdEndpoints/routes@2025-06-01' = {
  name: routeRedirectName
  parent: afdEndpoint
  properties: {
    originGroup: {
      id: ''
    }
    patternsToMatch: ['/*']
    supportedProtocols: ['Http']
    httpsRedirect: 'Enabled'
    linkToDefaultDomain: 'Enabled'
  }
}


// -------------------------------------------
// WAF Policy Association (optional)
// -------------------------------------------
resource wafAssociation 'Microsoft.Cdn/profiles/securityPolicies@2025-06-01' = if (!empty(wafPoliciesId)) {
  name: 'wafPolicy'
  parent: afdProfile
  properties: {
    parameters: {
      associations: [
        {
          domains: [
            {
              id: afdEndpoint.id
            }
          ]
          patternsToMatch: ['/*']
          policyLink: {
            id: wafPoliciesId
          }
        }
      ]
    }
  }
}

output endpointHostName string = afdEndpoint.properties.hostName
