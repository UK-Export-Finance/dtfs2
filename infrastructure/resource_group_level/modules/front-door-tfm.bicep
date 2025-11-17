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

resource afdProfile 'Microsoft.Cdn/profiles@2024-02-01' = {
  name: frontDoorTfmName
  location: 'global'
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
  tags: {}
}

resource afdEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2024-02-01' = {
  name: '${afdProfile.name}/${endpointName}'
  location: 'global'
  properties: {
    enabledState: 'Enabled'
  }
}

resource originGroup 'Microsoft.Cdn/profiles/originGroups@2024-02-01' = {
  name: '${afdProfile.name}/${originGroupName}'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 2
      additionalLatencyMilliseconds: 0
    }
    healthProbeSettings: {
      probePath: '/healthcheck?fd-tfm'
      probeRequestType: 'GET'
      probeProtocol: 'Http'
      intervalInSeconds: 30
      isEnabled: false          // matches EnabledState: 'Disabled'
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
    supportedProtocols: [
      'Https'
    ]
    patternsToMatch: [
      '/*'
    ]

    httpsRedirect: 'Disabled' // Because Classic used HttpOnly forwarding

    forwardingProtocol: 'HttpOnly'

    linkToDefaultDomain: 'Enabled'
  }
}

resource routeRedirect 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = {
  name: '${afdProfile.name}/${endpointName}/${routeRedirectName}'
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

resource wafAssociation 'Microsoft.Cdn/profiles/securityPolicies@2024-02-01' = {
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

output defaultHostName string = '${frontDoorTfmName}.azurefd.net'
