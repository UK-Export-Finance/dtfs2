param backendPoolIp string
param wafPoliciesId string
param product string
param target string
param version string

var frontDoorTfmName = 'frontdoor-${product}-tfm-${target}-${version}'
var endpointName = 'DefaultFrontendEndpoint'
var originGroupName = 'DefaultBackendPool'
var originName = 'backendOrigin'
var routeForwardName = 'DefaultRoutingRule'
var routeRedirectName = 'RedirectToHttps'

// Create the Front Door profile
resource afdProfile 'Microsoft.Cdn/profiles@2025-06-01' = {
  name: frontDoorTfmName
  location: 'global'
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
  tags: {}
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
      probePath: '/healthcheck?fd-tfm'
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
  dependsOn: [
    origin
  ]
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
  dependsOn: [
    origin
  ]
  properties: {
    originGroup: {
      id: originGroup.id
    }
    patternsToMatch: ['/*']
    supportedProtocols: ['Http']
    httpsRedirect: 'Enabled'
    linkToDefaultDomain: 'Enabled'
  }
}

/*----------------------------------------------
    WAF Policy Association (optional)
  ---------------------------------------------- */
 resource wafAssociation 'Microsoft.Cdn/profiles/securityPolicies@2025-06-01' = if (!empty(wafPoliciesId)) {
  name: 'wafPolicy'
  parent: afdProfile
  properties: {
    parameters: {
      type: 'WebApplicationFirewall'                
      wafPolicy: {
        id: wafPoliciesId                            
      }
      associations: [
        {
          domains: [
            {
              id: afdEndpoint.id
            }
          ]
          patternsToMatch: ['/*']
        }
      ]
    }
  }
}

output defaultHostName string = '${frontDoorTfmName}.azurefd.net'
