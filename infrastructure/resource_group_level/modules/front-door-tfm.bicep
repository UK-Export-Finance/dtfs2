param backendPoolIp string
param wafPoliciesId string = ''
param product string
param target string
param version string

var frontDoorTfmName = 'frontdoor-${product}-tfm-${target}-${version}'
var endpointName = 'DefaultFrontendEndpoint'
var originGroupName = 'DefaultBackendPool'
var originName = 'backendOrigin'
var routeForwardName = 'DefaultRoutingRule'
var routeRedirectName = 'RedirectToHttps'

resource afdProfile 'Microsoft.Cdn/profiles@2025-06-01' = {
  name: frontDoorTfmName
  location: 'global'
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
  tags: {}
}

resource afdEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2025-06-01' = {
  name: endpointName
  parent: afdProfile
  location: 'global'
  properties: {
    enabledState: 'Enabled'
  }
}

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
      //isEnabled: false // matches Classic EnabledState: 'Disabled'
    }
  }
}

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

resource routeForward 'Microsoft.Cdn/profiles/originGroups/routes@2025-06-01' = {
  name: routeForwardName
  parent: afdEndpoint
  properties: {
    originGroup: {
      id: originGroup.id
    }
    patternsToMatch: ['/*']
    supportedProtocols: ['Https']
    httpsRedirect: 'Disabled'       // Classic used HttpOnly forwarding
    forwardingProtocol: 'HttpOnly'
    linkToDefaultDomain: 'Enabled'
  }
}

resource routeRedirect 'Microsoft.Cdn/profiles/originGroups/routes@2025-06-01' = {
  name: routeRedirectName
  parent: afdEndpoint
  properties: {
    originGroup: null
    patternsToMatch: ['/*']
    supportedProtocols: ['Http']
    httpsRedirect: 'Enabled'
    linkToDefaultDomain: 'Enabled'
  }
}

resource wafAssociation 'Microsoft.Cdn/profiles/securityPolicies@2025-06-01' = if (!empty(wafPoliciesId)) {
  name: 'wafPolicy'
  parent: afdProfile
  properties: {
    associations: [
      {
        domains: [afdEndpoint.id]
        wafPolicy: {
          id: wafPoliciesId
        }
      }
    ]
  }
}

output defaultHostName string = '${frontDoorTfmName}.azurefd.net'
