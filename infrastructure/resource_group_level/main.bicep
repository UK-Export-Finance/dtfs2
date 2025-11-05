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
param onPremiseNetworkIpsString string

param vnetAddressPrefix string
param applicationGatewayCidr string
param appServicePlanEgressPrefixCidr string
param acaClamAvCidr string
param privateEndpointsCidr string


///////////////////////////////////////////////////////////////////////////////
// We have a lot of application secrets that are passed in from GitHub
// We define them here.
///////////////////////////////////////////////////////////////////////////////
@secure()
param APIM_TFS_KEY string
@secure()
param APIM_TFS_VALUE string
@secure()
param APIM_TFS_URL string
@secure()
param APIM_MDM_KEY string
@secure()
param APIM_MDM_URL string
@secure()
param APIM_MDM_VALUE string // different in staging and dev
@secure()
param CORS_ORIGIN string
@secure()
param APIM_ESTORE_URL string
@secure()
param APIM_ESTORE_KEY string
@secure()
param APIM_ESTORE_VALUE string
@secure()
param COMPANIES_HOUSE_API_KEY string // Actually set from an env variable but that's from a secret.
@secure()
param ORDNANCE_SURVEY_API_KEY string
@secure()
param GOV_NOTIFY_API_KEY string
@secure()
param GOV_NOTIFY_EMAIL_RECIPIENT string
@secure()
param AZURE_PORTAL_EXPORT_FOLDER string
@secure()
param AZURE_PORTAL_FILESHARE_NAME string
@secure()
param JWT_SIGNING_KEY string
@secure()
param JWT_VALIDATING_KEY string
@secure()
param UKEF_INTERNAL_NOTIFICATION string
@secure()
param DTFS_CENTRAL_API_KEY string
@secure()
param EXTERNAL_API_KEY string
@secure()
param PORTAL_API_KEY string
@secure()
param TFM_API_KEY string
@secure()
param UKEF_TFM_API_SYSTEM_KEY string
@secure()
param UKEF_TFM_API_REPORTS_KEY string
@secure()
param AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE string
@secure()
param SESSION_SECRET string
@secure()
param ESTORE_URL string
@secure()
param PDC_INPUTTERS_EMAIL_RECIPIENT string

// The following parameters come from GH vars, rather than secrets.
param RATE_LIMIT_THRESHOLD string
param UTILISATION_REPORT_MAX_FILE_SIZE_BYTES string
param PORTAL_UI_URL string
param UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH string
param UTILISATION_REPORT_OVERDUE_CHASER_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH string
param UTILISATION_REPORT_REPORTING_PERIOD_START_EMAIL_SCHEDULE string
param UTILISATION_REPORT_DUE_EMAIL_SCHEDULE string
param UTILISATION_REPORT_OVERDUE_EMAIL_SCHEDULE string
param AZURE_UTILISATION_REPORTS_FILESHARE_NAME string
param UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE string

///////////////////////////////////////////////////////////////////////////////
// Having read all the parameters, we set up the values that are needed for the
// app services here.
///////////////////////////////////////////////////////////////////////////////

// The values for both functions are identical
var functionSettings = {
  RATE_LIMIT_THRESHOLD: RATE_LIMIT_THRESHOLD
}
var functionSecureSettings = {
  APIM_TFS_KEY: APIM_TFS_KEY
  APIM_TFS_VALUE: APIM_TFS_VALUE
  APIM_TFS_URL: APIM_TFS_URL
  APIM_MDM_KEY: APIM_MDM_KEY
  APIM_MDM_URL: APIM_MDM_URL
  APIM_MDM_VALUE: APIM_MDM_VALUE // different in staging and dev
}
// These values are taken from an export of Configuration on Dev
// Note that we don't need to add MACHINEKEY_DecryptionKey as that is auto-generated if needed.
var functionAdditionalSecureSettings = { }

var externalApiSettings = {
    RATE_LIMIT_THRESHOLD: RATE_LIMIT_THRESHOLD
    COMPANIES_HOUSE_API_URL: COMPANIES_HOUSE_API_URL
    ORDNANCE_SURVEY_API_URL: ORDNANCE_SURVEY_API_URL
}
var externalApiSecureSettings = {
  CORS_ORIGIN: CORS_ORIGIN
  APIM_TFS_URL: APIM_TFS_URL
  APIM_TFS_KEY: APIM_TFS_KEY
  APIM_TFS_VALUE: APIM_TFS_VALUE
  APIM_MDM_URL: APIM_MDM_URL
  APIM_MDM_KEY: APIM_MDM_KEY
  APIM_MDM_VALUE: APIM_MDM_VALUE
  APIM_ESTORE_URL: APIM_ESTORE_URL
  APIM_ESTORE_KEY: APIM_ESTORE_KEY
  APIM_ESTORE_VALUE: APIM_ESTORE_VALUE
  COMPANIES_HOUSE_API_KEY: COMPANIES_HOUSE_API_KEY // Actually set from an env variable but that's from a secret.
  ORDNANCE_SURVEY_API_KEY: ORDNANCE_SURVEY_API_KEY
  GOV_NOTIFY_API_KEY: GOV_NOTIFY_API_KEY
  GOV_NOTIFY_EMAIL_RECIPIENT: GOV_NOTIFY_EMAIL_RECIPIENT
}
var externalApiAdditionalSecureSettings = {
  EXTERNAL_API_KEY: EXTERNAL_API_KEY
  // Note that EXTERNAL_API_URL is not set from GitHub, but derived.
}

var dtfsCentralApiSettings = {
  RATE_LIMIT_THRESHOLD: RATE_LIMIT_THRESHOLD
  UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE: UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE
}
var dtfsCentralApiSecureSettings = {}
var dtfsCentralApiAdditionalSecureSetting = {
  DTFS_CENTRAL_API_KEY: DTFS_CENTRAL_API_KEY
}

var portalApiSettings = {
  RATE_LIMIT_THRESHOLD: RATE_LIMIT_THRESHOLD
  PORTAL_UI_URL: PORTAL_UI_URL
  UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH: UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH
  UTILISATION_REPORT_OVERDUE_CHASER_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH: UTILISATION_REPORT_OVERDUE_CHASER_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH
  UTILISATION_REPORT_REPORTING_PERIOD_START_EMAIL_SCHEDULE: UTILISATION_REPORT_REPORTING_PERIOD_START_EMAIL_SCHEDULE
  UTILISATION_REPORT_DUE_EMAIL_SCHEDULE: UTILISATION_REPORT_DUE_EMAIL_SCHEDULE
  UTILISATION_REPORT_OVERDUE_EMAIL_SCHEDULE: UTILISATION_REPORT_OVERDUE_EMAIL_SCHEDULE
  AZURE_UTILISATION_REPORTS_FILESHARE_NAME: AZURE_UTILISATION_REPORTS_FILESHARE_NAME
}
var portalApiSecureSettings = {
  PDC_INPUTTERS_EMAIL_RECIPIENT: PDC_INPUTTERS_EMAIL_RECIPIENT
  // NOTE that CORS_ORIGIN is not present in the variables exported from dev or staging but is used in application code
  CORS_ORIGIN: CORS_ORIGIN
  AZURE_PORTAL_EXPORT_FOLDER: AZURE_PORTAL_EXPORT_FOLDER
  AZURE_PORTAL_FILESHARE_NAME: AZURE_PORTAL_FILESHARE_NAME
  JWT_SIGNING_KEY: JWT_SIGNING_KEY
  JWT_VALIDATING_KEY: JWT_VALIDATING_KEY
  GOV_NOTIFY_API_KEY: GOV_NOTIFY_API_KEY
  GOV_NOTIFY_EMAIL_RECIPIENT: GOV_NOTIFY_EMAIL_RECIPIENT
}
var portalApiAdditionalSecureSetting = {
  DTFS_CENTRAL_API_KEY: DTFS_CENTRAL_API_KEY
  EXTERNAL_API_KEY: EXTERNAL_API_KEY
  PORTAL_API_KEY: PORTAL_API_KEY
  TFM_API_KEY: TFM_API_KEY
}
var portalApiConnectionStrings = { }
var portalApiSecureConnectionStrings = { }

var tmfApiSettings = {
  RATE_LIMIT_THRESHOLD: RATE_LIMIT_THRESHOLD
  AZURE_UTILISATION_REPORTS_FILESHARE_NAME: AZURE_UTILISATION_REPORTS_FILESHARE_NAME
}
var tfmApiSecureSettings = {
  UKEF_TFM_API_SYSTEM_KEY: UKEF_TFM_API_SYSTEM_KEY
  UKEF_TFM_API_REPORTS_KEY: UKEF_TFM_API_REPORTS_KEY
  AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE: AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE
  JWT_SIGNING_KEY: JWT_SIGNING_KEY
}
var tfmApiAdditionalSecureSettings = {
  UKEF_INTERNAL_NOTIFICATION: UKEF_INTERNAL_NOTIFICATION
  DTFS_CENTRAL_API_KEY: DTFS_CENTRAL_API_KEY
  EXTERNAL_API_KEY: EXTERNAL_API_KEY
  JWT_VALIDATING_KEY: JWT_VALIDATING_KEY
  TFM_API_KEY: TFM_API_KEY
  GOV_NOTIFY_EMAIL_RECIPIENT: GOV_NOTIFY_EMAIL_RECIPIENT
}
var tfmApiSecureConnectionStrings = { }
var tfmApiAdditionalSecureConnectionStrings = { }

var portalUiSettings = {
  RATE_LIMIT_THRESHOLD: RATE_LIMIT_THRESHOLD // TODO:FN-1086 30 on dev, 10000 on feature
  COMPANIES_HOUSE_API_URL: COMPANIES_HOUSE_API_URL
  UTILISATION_REPORT_MAX_FILE_SIZE_BYTES: UTILISATION_REPORT_MAX_FILE_SIZE_BYTES
}
var portalUiSecureSettings = {
  COMPANIES_HOUSE_API_KEY: COMPANIES_HOUSE_API_KEY
  SESSION_SECRET: SESSION_SECRET
}
var portalUiAdditionalSecureSettings = {
  PORTAL_API_KEY: PORTAL_API_KEY
  TFM_API_KEY: TFM_API_KEY
}
var portalUiSecureConnectionStrings = { }
var portalUiAdditionalSecureConnectionStrings = { }

var tfmUiSettings = {
  RATE_LIMIT_THRESHOLD: RATE_LIMIT_THRESHOLD
  UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH: UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH
}
var tfmUiSecureSettings = {
  UKEF_TFM_API_SYSTEM_KEY: UKEF_TFM_API_SYSTEM_KEY
  ESTORE_URL: ESTORE_URL
  SESSION_SECRET: SESSION_SECRET
}
var tfmUiAdditionalSecureSettings = {
  TFM_API_KEY: TFM_API_KEY
}
var tfmUiSecureConnectionStrings = { }
var tfmUiAdditionalSecureConnectionStrings = { }

var gefUiSettings = {
    // from vars.
    RATE_LIMIT_THRESHOLD: RATE_LIMIT_THRESHOLD
}
var gefUiSecureSettings = {
  SESSION_SECRET: SESSION_SECRET
}
var gefUiAdditionalSecureSettings = {
  PORTAL_API_KEY: PORTAL_API_KEY
}
var gefUiSecureConnectionStrings = { }
var gefUiAdditionalSecureConnectionStrings = { }


///////////////////////////////////////////////////////////////////////////////
// We have some non-secret parameters, which we can keep in the code here.
// - values that vary based on the environment are managed with a map
// - values that aren't that likely to change are just simple variables.
///////////////////////////////////////////////////////////////////////////////

// The following settings have not been made part of the parameters map
// as they are the same for all environments and don't look like they will change.
// The following parameters come from GH environment variables, rather than secrets
var COMPANIES_HOUSE_API_URL = 'https://api.companieshouse.gov.uk'
var ORDNANCE_SURVEY_API_URL = 'https://api.os.co.uk'

// routeTableNextHopIpAddress Listed as palo_alto_next_hop in CLI scripts.
var routeTableNextHopIpAddress = '10.50.0.100'
// Allowed frontDoorAccess values: 'Allow', 'Deny'
var frontDoorAccess = 'Allow'
var productionSubnetCidr = '10.60.0.0/16'

// TODO:FN-938 check is ukwest is used anywhere
var storageLocations = [
  'uksouth'
  'ukwest'
]

// TODO:FN-693 considering enabling 7 day soft deletes on some or all environments
@description('Enable 7-day soft deletes on file shares')
var shareDeleteRetentionEnabled = false

var logAnalyticsWorkspaceName ='log-workspace-${ product }-${ target }-${ version }'
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

module vnet 'modules/vnet.bicep' = {
  name: 'vnet'
  params: {
    environment: environment
    location: location
    product: product
    version: version
    location: location
    appServicePlanName: appServicePlan.name
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


