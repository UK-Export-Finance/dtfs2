@description('The product name for resource naming')
param product string

@description('The target environment for resource naming')
param target string

@description('The version for resource naming')
param version string
param wafPoliciesName string = 'waf${product}${target}${version}'
param redirectUrl string

@description('IPs which are not blocked/redirected')
@secure()
param allowedIpsString string

@allowed(['Cookies', 'PostArgs', 'QueryString', 'RemoteAddr', 'RequestBody', 'RequestHeader', 'RequestMethod', 'RequestUri', 'SocketAddr'])
param matchVariable string

@allowed(['Redirect','Block'])
param rejectAction string
param applyWafRuleOverrides bool = false
param restrictAccessToUkefIps bool

@allowed(['Standard_AzureFrontDoor', 'Premium_AzureFrontDoor'])
param wafSku string = 'Standard_AzureFrontDoor'

type RuleSetType = 'DefaultRuleSet' | 'Microsoft_DefaultRuleSet'
type RuleSet = {
  ruleSetType: RuleSetType
  ruleSetVersion: string
}
param ruleSet RuleSet

var cleanIpsString = trim(allowedIpsString)
var looksLikeJsonArray = !empty(cleanIpsString) && startsWith(cleanIpsString, '[') && endsWith(cleanIpsString, ']')
var allowedIps = looksLikeJsonArray ? json(cleanIpsString) : []
var unauthorisedMessageBody = base64('Unauthorised access!')

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

resource wafPolicies 'Microsoft.Network/frontdoorwebapplicationfirewallpolicies@2024-02-01' = {
  name: wafPoliciesName
  location: 'Global'
  sku: {
    name: wafSku
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
    managedRules: wafSku == 'Premium_AzureFrontDoor' ? {
      managedRuleSets: [
        {
          ruleSetType: ruleSet.ruleSetType
          ruleSetVersion: ruleSet.ruleSetVersion
          ruleGroupOverrides: devRuleOverrides
          exclusions: []
        }
      ]
    } : {
      managedRuleSets: []
    }
  }
}


output wafPoliciesId string = wafPolicies.id
