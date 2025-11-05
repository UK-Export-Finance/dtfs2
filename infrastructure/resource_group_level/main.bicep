param location string  = resourceGroup().location

// Expected values are 'feature', 'dev', 'staging' & 'prod'
// Note that legacy values of 'test' and 'qa' may be observed in some resources. These are equivalent to 'staging'.
@allowed(['dev', 'feature', 'staging', 'prod'])
param environment string
@description('The product name for resource naming')
param product string

@description('The target environment for resource naming')
param target string

@description('The version for resource naming')
param version string
// Allowed frontDoorAccess values: 'Allow', 'Deny'
var frontDoorAccess = 'Allow'

// Enable network access from an external subscription.
@secure()
// REMOTE_VNET_SUBSCRIPTION_VPN
param peeringRemoteVnetSubscriptionId string
// REMOTE_VNET_RESOURCE_GROUP_VPN
param peeringRemoteVnetResourceGroupName string = 'UKEF-Firewall-Appliance-UKS'
// REMOTE_VNET_NAME_VPN
param peeringRemoteVnetName string = 'VNET_UKEF_UKS'
// VNET_ADDRESS_PREFIX
param peeringAddressSpace string = '10.50.0.0/16'

@description('IPs allowed to access restricted services, represented as Json array string')
@secure()
// UKEF_VPN_IPS

param vnetAddressPrefix string
param applicationGatewayCidr string
param appServicePlanEgressPrefixCidr string
param acaClamAvCidr string
param privateEndpointsCidr string


///////////////////////////////////////////////////////////////////////////////
// We have some non-secret parameters, which we can keep in the code here.
// - values that vary based on the environment are managed with a map
// - values that aren't that likely to change are just simple variables.
///////////////////////////////////////////////////////////////////////////////

// The following settings have not been made part of the parameters map
// as they are the same for all environments and don't look like they will change.
// The following parameters come from GH environment variables, rather than secrets
// TODO:FN-938 check is ukwest is used anywhere
var storageLocations = [
  'uksouth'
  'ukwest'
]

// var logAnalyticsWorkspaceName ='log-workspace-${ product }-${ target }-${ version }'
var peeringVnetName ='vnet-peer-uks-${target}-${product}-${version}'

// This parameters map holds the per-environment settings.
// Some notes from initial networking conversations:
// Dev uses 172.16.4x.xx
// Demo (legacy?) uses 172.16.6x.xx
// Test uses 172.16.5x.xx & Staging uses 172.16.7x.xx, though these appear to be combined.
// Feature can use 172.16.2x.xx
var parametersMap = {
  dev: {
    acr: {
      name: 'tfsdev'
      sku: {
        name: 'Standard'
      }
    }
    asp: {
      name: 'dev'
      sku: 'p2v2'
    }
    cosmosDb: {
      databaseName: 'dtfs-submissions'
      capacityMode: 'Provisioned Throughput'
      backupPolicyTier: 'Continuous30Days'
    }
    functionAcbs: {
      state: 'Stopped'
    }
    nodeDeveloperMode: true
    nsg: {
      storageNetworkAccessDefaultAction: 'Allow'
    }
    apiPortalAccessPort: 44232
    redis: {
      sku:{
        name: 'Basic'
        family: 'C'
        capacity: 0
      }
    }
    vnet: {
      // TODO:DTFS2-6422 Note that 172.16.60.0/23 is probably the "demo" subnet so isn't needed.
      addressPrefixes: vnetAddressPrefix
      applicationGatewayCidr: applicationGatewayCidr
      appServicePlanEgressPrefixCidr: appServicePlanEgressPrefixCidr
      acaClamAvCidr: acaClamAvCidr
      privateEndpointsCidr: privateEndpointsCidr
      peeringVnetName: peeringVnetName
    }
    wafPolicies: {
      matchVariable: 'SocketAddr'
      redirectUrl: 'https://ukexportfinance.gov.uk/'
      rejectAction: 'Block'
      wafPoliciesName: 'vpn'
      applyWafRuleOverrides: true
      restrictPortalAccessToUkefIps: true
    }
  }
  feature: {
    acr: {
      // Note that containerRegistryName needs to be globally unique. However,
      // the existing environments have bagged `tfsdev`, `tfsstaging` & `tfsproduction`.
      name: 'cr${product}${target}${version}${uniqueString(resourceGroup().id)}'
      sku: {
        name: 'Basic'
      }
    }
    asp: {
      name: 'feature'
      sku: 'p2v2'
    }
    cosmosDb: {
      databaseName: 'dtfs-submissions'
      capacityMode: 'Serverless'
      backupPolicyTier: 'Continuous7Days'
    }
    functionAcbs: {
      state: 'Stopped'
    }
    nodeDeveloperMode: true
    nsg: {
      storageNetworkAccessDefaultAction: 'Allow'
    }
    apiPortalAccessPort: 44232
    redis: {
      sku:{
        name: 'Basic'
        family: 'C'
        capacity: 0
      }
    }
    vnet: {
      addressPrefixes: vnetAddressPrefix
      applicationGatewayCidr: applicationGatewayCidr
      // Note that for appServicePlanEgressPrefixCidr /28 is rather small (16 - 5 reserved = 11 IPs)
      // MS recommend at least /26 (64 - 5 reserved = 59 IPs)
      appServicePlanEgressPrefixCidr: appServicePlanEgressPrefixCidr
      acaClamAvCidr: acaClamAvCidr
      privateEndpointsCidr: privateEndpointsCidr
      peeringVnetName: peeringVnetName
    }
    wafPolicies: {
      matchVariable: 'SocketAddr'
      redirectUrl: 'https://ukexportfinance.gov.uk/'
      rejectAction: 'Block'
      wafPoliciesName: 'vpnFeature'
      applyWafRuleOverrides: true
      restrictPortalAccessToUkefIps: true
    }
  }
  staging: {
    acr: {
      name: 'tfsstaging'
      sku: {
        name: 'Standard'
      }
    }
    asp: {
      name: 'test'
      // Note that the CLI scripts used p2v2 for staging/test, but the deployed sku is p3v2
      sku: 'p3v2'
    }
    cosmosDb: {
      databaseName: 'dtfs-submissions'
      capacityMode: 'Provisioned Throughput'
      backupPolicyTier: 'Continuous30Days'
    }
    functionAcbs: {
      state: 'Stopped'
    }
    nodeDeveloperMode: false
    nsg: {
      // TODO:DTFS2-6422 Note that Staging (and only Staging) has the default as Deny, corresponding to "Enabled from selected virtual networks and IP addresses".
      storageNetworkAccessDefaultAction: 'Deny'
    }
    apiPortalAccessPort: 0
    redis: {
      sku:{
        name: 'Basic'
        family: 'C'
        capacity: 0
      }
    }
    vnet: {
      // TODO:DTFS2-6422 check if all the addressPrefixes are needed
      addressPrefixes: vnetAddressPrefix
      appServicePlanEgressPrefixCidr: appServicePlanEgressPrefixCidr
      acaClamAvCidr: acaClamAvCidr
      applicationGatewayCidr: applicationGatewayCidr
      privateEndpointsCidr: privateEndpointsCidr
      // Note that the peeringVnetName for staging uses the name `test` for the staging environment so we override it here.
      peeringVnetName: peeringVnetName
    }
    wafPolicies: {
      matchVariable: 'SocketAddr'
      redirectUrl: ''
      rejectAction: 'Block'
      wafPoliciesName: 'vpnStaging'
      applyWafRuleOverrides: false
      restrictPortalAccessToUkefIps: true
    }
  }
  prod: {
    acr: {
      name: 'tfsproduction'
      sku: {
        name: 'Standard'
      }
    }
    asp: {
      name: 'prod'
      sku: 'p3v2'
    }
    cosmosDb: {
      databaseName: 'dtfs-submissions'
      capacityMode: 'Provisioned Throughput'
      backupPolicyTier: 'Continuous30Days'
    }
    functionAcbs: {
      state: 'Running'
    }
    nodeDeveloperMode: false
    nsg: {
      storageNetworkAccessDefaultAction: 'Allow'
    }
    apiPortalAccessPort: 0
    redis: {
      // TODO:FN-504 decide what sku to use.
      // Note that it isn't recommended to use Basic or C0 in production
      // See https://learn.microsoft.com/en-gb/azure/azure-cache-for-redis/cache-best-practices-development
      sku:{
        name: 'Basic'
        family: 'C'
        capacity: 0
      }
    }
    vnet: {
      // TODO:DTFS2-6422 check if all the addressPrefixes are needed
      addressPrefixes: vnetAddressPrefix
      appServicePlanEgressPrefixCidr: appServicePlanEgressPrefixCidr
      acaClamAvCidr: acaClamAvCidr
      applicationGatewayCidr: applicationGatewayCidr
      privateEndpointsCidr: privateEndpointsCidr
      peeringVnetName: peeringVnetName
    }
    wafPolicies: {
      matchVariable: 'RemoteAddr'
      redirectUrl: 'https://www.gov.uk/government/organisations/uk-export-finance'
      rejectAction: 'Redirect'
      wafPoliciesName: 'vpnProd'
      applyWafRuleOverrides: false
      restrictPortalAccessToUkefIps: false
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// We now define the resources, mostly via modules but some are simple enough
// not to need their own module.
///////////////////////////////////////////////////////////////////////////////
module networkSecurityGroup 'modules/gw-nsg.bicep' = {
  name: 'networkSecurityGroup'
  params: {
    location: location
    product: product
    version: version
    target: target
    frontDoorAccess: frontDoorAccess
    apiPortalAccessPort: parametersMap[environment].apiPortalAccessPort
  }
}

module vnet 'modules/vnet.bicep' = {
  name: 'vnet'
  params: {
    location: location
    product: product
    version: version
    target: target
    addressPrefixes: parametersMap[environment].vnet.addressPrefixes
    privateEndpointsCidr: parametersMap[environment].vnet.privateEndpointsCidr
    appServicePlanEgressPrefixCidr: parametersMap[environment].vnet.appServicePlanEgressPrefixCidr
    applicationGatewayCidr: parametersMap[environment].vnet.applicationGatewayCidr
    acaClamAvCidr: parametersMap[environment].vnet.acaClamAvCidr
    storageLocations: storageLocations
    peeringVnetName: peeringVnetName
    peeringRemoteVnetSubscriptionId: peeringRemoteVnetSubscriptionId
    peeringRemoteVnetResourceGroupName: peeringRemoteVnetResourceGroupName
    peeringRemoteVnetName: peeringRemoteVnetName
    peeringAddressSpace: peeringAddressSpace
    networkSecurityGroupId: networkSecurityGroup.outputs.networkSecurityGroupId
  }
}


