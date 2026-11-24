param location string
param product string
param target string
param version string

var wafPolicyName = 'waf-appgw-${product}-${target}-${version}'

resource applicationGatewayWafPolicy 'Microsoft.Network/ApplicationGatewayWebApplicationFirewallPolicies@2024-05-01' = {
  name: wafPolicyName
  location: location
  tags: {
    Environment: target
    Product: product
  }
  properties: {
    policySettings: {
      state: 'Enabled'
      mode: 'Prevention'
      requestBodyCheck: false
      maxRequestBodySizeInKb: 128
      fileUploadLimitInMb: 100
    }
    managedRules: {
      managedRuleSets: [
        {
          ruleSetType: 'OWASP'
          ruleSetVersion: '3.2'
        }
      ]
      exclusions: []
    }
  }
}

output wafPolicyId string = applicationGatewayWafPolicy.id
