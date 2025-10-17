param location string  = resourceGroup().location

// Expected values are 'feature', 'dev', 'staging' & 'prod'
// Note that legacy values of 'test' and 'qa' may be observed in some resources. These are equivalent to 'staging'.
@allowed(['dev', 'feature', 'staging', 'prod'])
param environment string

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

var logAnalyticsWorkspaceName = '${resourceGroup().name}-Logs-Workspace'

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
      addressPrefixes: ['172.16.40.0/22', '172.16.60.0/23']
      applicationGatewayCidr: '172.16.41.0/24'
      appServicePlanEgressPrefixCidr: '172.16.42.0/28'
      acaClamAvCidr: '172.16.42.32/27'
      privateEndpointsCidr: '172.16.40.0/24'
      peeringVnetName: 'tfs-${environment}-vnet_vnet-ukef-uks'
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
      name: 'tfs${environment}acr${uniqueString(resourceGroup().id)}'
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
      addressPrefixes: ['172.16.20.0/22']
      applicationGatewayCidr: '172.16.21.0/24'
      // Note that for appServicePlanEgressPrefixCidr /28 is rather small (16 - 5 reserved = 11 IPs)
      // MS recommend at least /26 (64 - 5 reserved = 59 IPs)
      appServicePlanEgressPrefixCidr: '172.16.22.0/28'
      acaClamAvCidr: '172.16.22.32/27'
      privateEndpointsCidr: '172.16.20.0/24'
      peeringVnetName: 'tfs-${environment}-vnet_vnet-ukef-uks'
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
      addressPrefixes: ['172.16.50.0/23', '172.16.52.0/23', '172.16.70.0/23']
      appServicePlanEgressPrefixCidr: '172.16.52.0/28'
      acaClamAvCidr: '172.16.52.32/27'
      applicationGatewayCidr: '172.16.71.0/24'
      privateEndpointsCidr: '172.16.70.0/24'
      // Note that the peeringVnetName for staging uses the name `test` for the staging environment so we override it here.
      peeringVnetName: 'tfs-test-vnet_vnet-ukef-uks'
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
      addressPrefixes: ['172.16.30.0/23', '172.16.32.0/23']
      appServicePlanEgressPrefixCidr: '172.16.32.0/28'
      acaClamAvCidr: '172.16.32.32/27'
      applicationGatewayCidr: '172.16.31.0/24'
      privateEndpointsCidr: '172.16.30.0/24'
      peeringVnetName: 'tfs-${environment}-vnet_vnet-ukef-uks'
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

resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: parametersMap[environment].asp.name
  location: location
  sku: {
    name: parametersMap[environment].asp.sku
  }
  kind: 'linux'
  properties: {
    // Linux ASPs need to have reserved as true:
    // https://learn.microsoft.com/en-us/azure/templates/microsoft.web/serverfarms?pivots=deployment-language-bicep#appserviceplanproperties
    reserved: true
  }
}

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: parametersMap[environment].acr.name
  location: location
  sku: parametersMap[environment].acr.sku
  properties: {
    // Admin needs to be enabled for App Service continuous deployment
    adminUserEnabled: true
  }
}

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  tags: {}
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    workspaceCapping: {
      dailyQuotaGb: -1
    }
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

module routeTable 'modules/route-tables.bicep' = {
  name: 'routeTable'
  params: {
    location: location
    productionSubnetCidr: productionSubnetCidr
    nextHopIpAddress: routeTableNextHopIpAddress
  }
}

module tfsIp 'modules/tfs-ip.bicep' = {
  name: 'tfsIp'
  params: {
    location: location
    environment: environment
  }
}

module networkSecurityGroup 'modules/gw-nsg.bicep' = {
  name: 'networkSecurityGroup'
  params: {
    location: location
    environment: environment
    frontDoorAccess: frontDoorAccess
    apiPortalAccessPort: parametersMap[environment].apiPortalAccessPort
  }
}

module vnet 'modules/vnet.bicep' = {
  name: 'vnet'
  params: {
    environment: environment
    location: location
    appServicePlanName: appServicePlan.name
    addressPrefixes: parametersMap[environment].vnet.addressPrefixes
    privateEndpointsCidr: parametersMap[environment].vnet.privateEndpointsCidr
    appServicePlanEgressPrefixCidr: parametersMap[environment].vnet.appServicePlanEgressPrefixCidr
    applicationGatewayCidr: parametersMap[environment].vnet.applicationGatewayCidr
    acaClamAvCidr: parametersMap[environment].vnet.acaClamAvCidr
    storageLocations: storageLocations
    peeringVnetName: parametersMap[environment].vnet.peeringVnetName
    peeringRemoteVnetSubscriptionId: peeringRemoteVnetSubscriptionId
    peeringRemoteVnetResourceGroupName: peeringRemoteVnetResourceGroupName
    peeringRemoteVnetName: peeringRemoteVnetName
    peeringAddressSpace: peeringAddressSpace
    networkSecurityGroupId: networkSecurityGroup.outputs.networkSecurityGroupId
  }
}

module websitesDns 'modules/privatelink-azurewebsites-net.bicep' = {
  name: 'websitesDns'
  params: {
    vnetId: vnet.outputs.vnetId
  }
}

module filesDns 'modules/privatelink-file-core-windows-net.bicep' = {
  name: 'filesDns'
  params: {
    vnetId: vnet.outputs.vnetId
  }
}

module mongoDbDns 'modules/privatelink-mongo-cosmos-azure-com.bicep' = {
  name: 'mongoDbDns'
  params: {
    vnetId: vnet.outputs.vnetId
  }
}

module redisCacheDns 'modules/privatelink-redis-cache-windows-net.bicep' = {
  name: 'redisCacheDns'
  params: {
    vnetId: vnet.outputs.vnetId
  }
}

module storage 'modules/storage.bicep' = {
  name: 'storage'
  params: {
    location: location
    environment: environment
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    gatewaySubnetId: vnet.outputs.gatewaySubnetId
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    allowedIpsString: onPremiseNetworkIpsString
    networkAccessDefaultAction: parametersMap[environment].nsg.storageNetworkAccessDefaultAction
    shareDeleteRetentionEnabled: shareDeleteRetentionEnabled
    filesDnsZoneId: filesDns.outputs.filesDnsZoneId
  }
}

module cosmosDb 'modules/cosmosdb.bicep' = {
  name: 'mongoDb'
  params: {
    location: location
    environment: environment
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    mongoDbDnsZoneId: mongoDbDns.outputs.mongoDbDnsZoneId
    databaseName: parametersMap[environment].cosmosDb.databaseName
    allowedIpsString: onPremiseNetworkIpsString
    capacityMode: parametersMap[environment].cosmosDb.capacityMode
    backupPolicyTier: parametersMap[environment].cosmosDb.backupPolicyTier
  }
}

module redis 'modules/redis.bicep' = {
  name: 'redis'
  params: {
    location: location
    environment: environment
    sku: parametersMap[environment].redis.sku
  }
}

module clamAv 'modules/clamav-aca.bicep' = {
  name: 'clamAv'
  params: {
    location: location
    environment: environment
    acaClamAvSubnetId: vnet.outputs.acaClamAvSubnetId
    logAnalyticsWorkspaceName: logAnalyticsWorkspace.name
  }
}

module functionAcbs 'modules/function-acbs.bicep' = {
  name: 'functionAcbs'
  params: {
    environment: environment
    location: location
    state: parametersMap[environment].functionAcbs.state
    containerRegistryName: containerRegistry.name
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    storageAccountName: storage.outputs.storageAccountName
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
    settings: functionSettings
    secureSettings: functionSecureSettings
    additionalSecureSettings: functionAdditionalSecureSettings
  }
}

module functionNumberGenerator 'modules/function-number-generator.bicep' = {
  name: 'functionNumberGenerator'
  params: {
    environment: environment
    location: location
    containerRegistryName: containerRegistry.name
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    storageAccountName: storage.outputs.storageAccountName
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
    settings: functionSettings
    secureSettings: functionSecureSettings
    additionalSecureSettings: functionAdditionalSecureSettings
  }
}

module externalApi 'modules/webapps/external-api.bicep' = {
  name: 'externalApi'
  params: {
    location: location
    environment: environment
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    containerRegistryName: containerRegistry.name
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    cosmosDbAccountName: cosmosDb.outputs.cosmosDbAccountName
    cosmosDbDatabaseName: cosmosDb.outputs.cosmosDbDatabaseName
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    acbsFunctionDefaultHostName: functionAcbs.outputs.defaultHostName
    numberGeneratorFunctionDefaultHostName: functionNumberGenerator.outputs.defaultHostName
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
    settings: externalApiSettings
    secureSettings: externalApiSecureSettings
    additionalSecureSettings: externalApiAdditionalSecureSettings
  }
}

module dtfsCentralApi 'modules/webapps/dtfs-central-api.bicep' = {
  name: 'dtfsCentralApi'
  params: {
    location: location
    environment: environment
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    containerRegistryName: containerRegistry.name
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    cosmosDbAccountName: cosmosDb.outputs.cosmosDbAccountName
    cosmosDbDatabaseName: cosmosDb.outputs.cosmosDbDatabaseName
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
    settings: dtfsCentralApiSettings
    secureSettings: dtfsCentralApiSecureSettings
    additionalSecureSettings: dtfsCentralApiAdditionalSecureSetting
  }
}

module portalApi 'modules/webapps/portal-api.bicep' = {
  name: 'portalApi'
  params: {
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    containerRegistryName: containerRegistry.name
    cosmosDbAccountName: cosmosDb.outputs.cosmosDbAccountName
    cosmosDbDatabaseName: cosmosDb.outputs.cosmosDbDatabaseName
    dtfsCentralApiHostname: dtfsCentralApi.outputs.defaultHostName
    environment: environment
    externalApiHostname: externalApi.outputs.defaultHostName
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    storageAccountName: storage.outputs.storageAccountName
    tfmApiHostname: tfmApi.outputs.defaultHostName
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
    settings: portalApiSettings
    secureSettings: portalApiSecureSettings
    additionalSecureSettings: portalApiAdditionalSecureSetting
    connectionStrings: portalApiConnectionStrings
    secureConnectionStrings: portalApiSecureConnectionStrings
    clamAvSettings: {
      ipAddress: clamAv.outputs.exposedIp
      port: clamAv.outputs.exposedPort
    }
  }
}

module tfmApi 'modules/webapps/trade-finance-manager-api-no-calculated-variables.bicep' = {
  name: 'tfmApi'
  params: {
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    containerRegistryName: containerRegistry.name
    environment: environment
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
  }
}

module portalUi 'modules/webapps/portal-ui.bicep' = {
  name: 'portalUi'
  params: {
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    containerRegistryName: containerRegistry.name
    environment: environment
    externalApiHostname: externalApi.outputs.defaultHostName
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    portalApiHostname: portalApi.outputs.defaultHostName
    redisName: redis.outputs.redisName
    tfmApiHostname: tfmApi.outputs.defaultHostName
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
    settings: portalUiSettings
    secureSettings: portalUiSecureSettings
    additionalSecureSettings: portalUiAdditionalSecureSettings
    secureConnectionStrings: portalUiSecureConnectionStrings
    additionalSecureConnectionStrings: portalUiAdditionalSecureConnectionStrings
    clamAvSettings: {
      ipAddress: clamAv.outputs.exposedIp
      port: clamAv.outputs.exposedPort
    }
  }
}

module tfmUi 'modules/webapps/trade-finance-manager-ui.bicep' = {
  name: 'tfmUi'
  params: {
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    containerRegistryName: containerRegistry.name
    environment: environment
    externalApiHostname: externalApi.outputs.defaultHostName
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    redisName: redis.outputs.redisName
    tfmApiHostname: tfmApi.outputs.defaultHostName
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
    settings: tfmUiSettings
    secureSettings: tfmUiSecureSettings
    additionalSecureSettings: tfmUiAdditionalSecureSettings
    secureConnectionStrings: tfmUiSecureConnectionStrings
    additionalSecureConnectionStrings: tfmUiAdditionalSecureConnectionStrings
  }
}

module gefUi 'modules/webapps/gef-ui.bicep' = {
  name: 'gefUi'
  params: {
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    containerRegistryName: containerRegistry.name
    environment: environment
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    portalApiHostname: portalApi.outputs.defaultHostName
    redisName: redis.outputs.redisName
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
    settings: gefUiSettings
    secureSettings: gefUiSecureSettings
    additionalSecureSettings: gefUiAdditionalSecureSettings
    secureConnectionStrings: gefUiSecureConnectionStrings
    additionalSecureConnectionStrings: gefUiAdditionalSecureConnectionStrings
  }
}

module applicationGatewayPortal 'modules/application-gateway-portal.bicep' = {
  name: 'applicationGatewayPortal'
  params: {
    environment: environment
    location: location
    gatewaySubnetId: vnet.outputs.gatewaySubnetId
    tfsIpId: tfsIp.outputs.tfsIpId
    portalApiHostname: portalApi.outputs.defaultHostName
    portalUiHostname: portalUi.outputs.defaultHostName
    gefUiHostname: gefUi.outputs.defaultHostName
    apiPortalAccessPort: parametersMap[environment].apiPortalAccessPort
  }
}

module applicationGatewayTfm 'modules/application-gateway-tfm.bicep' = {
  name: 'applicationGatewayTfm'
  params: {
    environment: environment
    location: location
    gatewaySubnetId: vnet.outputs.gatewaySubnetId
    tfsTfmIpId: tfsIp.outputs.tfsTfmIpId
    tfmUiHostname: tfmUi.outputs.defaultHostName
  }
}

module wafPoliciesIpRestricted 'modules/waf-policies.bicep' = {
  name: 'wafPoliciesIpRestricted'
  params: {
    allowedIpsString: onPremiseNetworkIpsString
    matchVariable: parametersMap[environment].wafPolicies.matchVariable
    redirectUrl: parametersMap[environment].wafPolicies.redirectUrl
    rejectAction: parametersMap[environment].wafPolicies.rejectAction
    wafPoliciesName: parametersMap[environment].wafPolicies.wafPoliciesName
    applyWafRuleOverrides: parametersMap[environment].wafPolicies.applyWafRuleOverrides
    restrictAccessToUkefIps: true
    ruleSet: {
      ruleSetType: 'DefaultRuleSet'
      ruleSetVersion: '1.0'
    }
  }
}

module wafPoliciesNoIpRestriction 'modules/waf-policies.bicep' = if (!parametersMap[environment].wafPolicies.restrictPortalAccessToUkefIps) {
  name: 'wafPoliciesNoIpRestriction'
  params: {
    allowedIpsString: onPremiseNetworkIpsString
    matchVariable: parametersMap[environment].wafPolicies.matchVariable
    redirectUrl: 'https://ukexportfinance.gov.uk/'
    rejectAction: parametersMap[environment].wafPolicies.rejectAction
    wafPoliciesName:'${parametersMap[environment].wafPolicies.wafPoliciesName}Portal'
    applyWafRuleOverrides: false
    restrictAccessToUkefIps: false
    ruleSet: {
      ruleSetType: 'Microsoft_DefaultRuleSet'
      ruleSetVersion: '1.1'
    }
  }
}

module frontDoorPortal 'modules/front-door-portal.bicep' = {
  name: 'frontDoorPortal'
  params: {
    backendPoolIp: tfsIp.outputs.tfsIpAddress
    environment: environment
    wafPoliciesId: parametersMap[environment].wafPolicies.restrictPortalAccessToUkefIps ? wafPoliciesIpRestricted.outputs.wafPoliciesId : wafPoliciesNoIpRestriction.outputs.wafPoliciesId
  }
  dependsOn: [applicationGatewayPortal]
}

module frontDoorTfm 'modules/front-door-tfm.bicep' = {
  name: 'frontDoorTfm'
  params: {
    backendPoolIp: tfsIp.outputs.tfsTfmIpAddress
    environment: environment
    wafPoliciesId: wafPoliciesIpRestricted.outputs.wafPoliciesId
  }
  dependsOn: [applicationGatewayTfm]
}


var tfmUiUrl = 'https://${frontDoorTfm.outputs.defaultHostName}'

module tfmApiCalculatedVariables 'modules/webapps/trade-finance-manager-api-calculated-variables.bicep' = {
  name: 'tfmApiCalculatedVariables'
  params: {
    cosmosDbAccountName: cosmosDb.outputs.cosmosDbAccountName
    cosmosDbDatabaseName: cosmosDb.outputs.cosmosDbDatabaseName
    environment: environment
    containerRegistryName: containerRegistry.name
    dtfsCentralApiHostname: dtfsCentralApi.outputs.defaultHostName
    externalApiHostname: externalApi.outputs.defaultHostName
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
    numberGeneratorFunctionDefaultHostName: functionNumberGenerator.outputs.defaultHostName
    secureConnectionStrings: tfmApiSecureConnectionStrings
    additionalSecureConnectionStrings: tfmApiAdditionalSecureConnectionStrings
    tfmUiUrl: tfmUiUrl
    storageAccountName: storage.outputs.storageAccountName
    settings: tmfApiSettings
    secureSettings: tfmApiSecureSettings
    additionalSecureSettings: tfmApiAdditionalSecureSettings
  }
}
