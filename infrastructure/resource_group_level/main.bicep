param location string  = resourceGroup().location

// Expected values are 'feature', 'dev', 'staging' & 'prod'
// Note that legacy values of 'test' and 'qa' may be observed in some resources. These are equivalent to 'staging'.
@allowed(['dev', 'feature', 'staging', 'prod'])
param environment string

@minLength(5)
@maxLength(50)
@description('Provide a globally unique name of your Azure Container Registry')
// Note that the existing environments have: tfsdev, tfsstaging & tfsproduction
param containerRegistryName string = 'tfs${environment}acr${uniqueString(resourceGroup().id)}'

// Enable network access from an external subscription.
@secure()
param peeringRemoteVnetSubscriptionId string
param peeringRemoteVnetResourceGroupName string = 'UKEF-Firewall-Appliance-UKS'
param peeringRemoteVnetName string = 'VNET_UKEF_UKS'
param peeringAddressSpace string = '10.50.0.0/16'

@description('IPs allowed to access restricted services, represented as Json array string')
@secure()
param onPremiseNetworkIpsString string

// Secrets sent in from GHA

// These values are taken from GitHub secrets injected in the GHA Action
// The values for both functions are identical
var functionSecureSettings = {
  APIM_TFS_KEY: 'test-value'
  APIM_TFS_VALUE: 'test-value'
  APIM_TFS_URL: 'test-value'
  APIM_MDM_KEY: 'test-value'
  APIM_MDM_URL: 'test-value'
  APIM_MDM_VALUE: 'test-value' // different in staging and dev
}
// These values are taken from an export of Configuration on Dev
var functionAdditionalSecureSettings = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'  // different in staging and dev
  MACHINEKEY_DecryptionKey: 'test-value' // different in staging and dev
}

var externalApiSecureSettings = {
  CORS_ORIGIN: 'test-value'
  APIM_TFS_URL: 'test-value'
  APIM_TFS_KEY: 'test-value'
  APIM_TFS_VALUE: 'test-value'
  APIM_MDM_URL: 'test-value'
  APIM_MDM_KEY: 'test-value'
  APIM_MDM_VALUE: 'test-value'
  APIM_ESTORE_URL: 'test-value'
  APIM_ESTORE_KEY: 'test-value'
  APIM_ESTORE_VALUE: 'test-value'
  COMPANIES_HOUSE_API_KEY: 'test-value' // Actually set from an env variable but that's from a secret.
  ORDNANCE_SURVEY_API_KEY: 'test-value'
  GOV_NOTIFY_API_KEY: 'test-value'
  GOV_NOTIFY_EMAIL_RECIPIENT: 'test-value'
}
var externalApiAdditionalSecureSettings = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'
}

var dtfsCentralApiSecureSettings = {}
var dtfsCentralApiAdditionalSecureSetting = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'
}

var portalApiSecureSettings = {}
var portalApiAdditionalSecureSetting = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'
}
var portalApiConnectionStrings = {
  COMPANIES_HOUSE_API_URL: 'test-value' // from env
}
var portalApiSecureConnectionStrings = {
  // NOTE that CORS_ORIGIN is not present in the variables exported from dev or staging
  CORS_ORIGIN: 'test-value'
  AZURE_PORTAL_EXPORT_FOLDER: 'test-value'
  AZURE_PORTAL_FILESHARE_NAME: 'test-value'
  JWT_SIGNING_KEY: 'test-value'
  JWT_VALIDATING_KEY: 'test-value'
  GOV_NOTIFY_API_KEY: 'test-value'
  GOV_NOTIFY_EMAIL_RECIPIENT: 'test-value'
  COMPANIES_HOUSE_API_KEY: 'test-value' // from env but looks a secret
}

var tfmApiSecureSettings = {}
var tfmApiAdditionalSecureSettings = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'
  UKEF_INTERNAL_NOTIFICATION: 'test-value'
  DTFS_CENTRAL_API_KEY: 'test-value'
  EXTERNAL_API_KEY: 'test-value'
  JWT_VALIDATING_KEY: 'test-value'
  PORTAL_API_KEY: 'test-value'
  TFM_API_KEY: 'test-value'
}
var tfmApiSecureConnectionStrings = {
  // NOTE that CORS_ORIGIN is not present in the variables exported from dev or staging
  CORS_ORIGIN: 'test-value'
  UKEF_TFM_API_SYSTEM_KEY: 'test-value'
  UKEF_TFM_API_REPORTS_KEY: 'test-value'
  // TODO:FN-429 Note that TFM_UI_URL (renamed from TFM_URI) has a value like https://tfs-dev-tfm-fd.azurefd.net
  // while in the CLI it is injected as a secret, we can probably calculate it from the Front Door component.
  TFM_UI_URL: 'test-value'
  AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE: 'test-value'
  JWT_SIGNING_KEY: 'test-value' // NOTE - in the export this appears to be a slot setting. However, we don't need to replicate that.
}
var tfmApiAdditionalSecureConnectionStrings = {
  GOV_NOTIFY_EMAIL_RECIPIENT: 'test-value'
}

var portalUiSecureSettings = {}
var portalUiAdditionalSecureSettings = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'
  DTFS_CENTRAL_API_KEY: 'test-value'
  EXTERNAL_API_KEY: 'test-value'
  PORTAL_API_KEY: 'test-value'
  TFM_API_KEY: 'test-value'
}
var portalUiSecureConnectionStrings = {
  COMPANIES_HOUSE_API_KEY : 'test-value'
  SESSION_SECRET: 'test-value'
}
var portalUiAdditionalSecureConnectionStrings = {}

var tfmUiSecureSettings = {
  UKEF_TFM_API_SYSTEM_KEY: 'test-value'
  ESTORE_URL: 'test-value'
}
var tfmUiAdditionalSecureSettings = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'
  DTFS_CENTRAL_API_KEY: 'test-value'
  EXTERNAL_API_KEY: 'test-value'
  PORTAL_API_KEY: 'test-value'
  TFM_API_KEY: 'test-value'
}
var tfmUiSecureConnectionStrings = {
  SESSION_SECRET: 'test-value'
}
var tfmUiAdditionalSecureConnectionStrings = {}

var gefUiSecureSettings = {}
var gefUiAdditionalSecureSettings = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'
  DTFS_CENTRAL_API_KEY: 'test-value'
  EXTERNAL_API_KEY: 'test-value'
  PORTAL_API_KEY: 'test-value'
  TFM_API_KEY: 'test-value'
}
var gefUiSecureConnectionStrings = {
  // TODO:FN-820 Remove COMPANIES_HOUSE_API_KEY as it is not referenced directly in gef-ui
  COMPANIES_HOUSE_API_KEY : 'test-value'
  SESSION_SECRET: 'test-value'
}
var gefUiAdditionalSecureConnectionStrings = {}

// The following settings have not been made part of the parameters map
// as they are the same for all environments and don't look like they will change.

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

// This parameters map holds the per-environment settings.
// Some notes from initial networking conversations:
// Dev uses 172.16.4x.xx
// Demo (legacy?) uses 172.16.6x.xx
// Test uses 172.16.5x.xx & Staging uses 172.16.7x.xx, though these appear to be combined.
// Feature can use 172.16.2x.xx

var parametersMap = {
  dev: {
    acrSku: {
      name: 'Standard'
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
    nodeDeveloperMode: true
    nsg: {
      storageNetworkAccessDefaultAction: 'Allow'
    }
    apiPortalAccessPort: 44232
    vnet: {
      // TODO:DTFS2-6422 Note that 172.16.60.0/23 is probably the "demo" subnet so isn't needed.
      addressPrefixes: ['172.16.40.0/22', '172.16.60.0/23']
      applicationGatewayCidr: '172.16.41.0/24'
      appServicePlanEgressPrefixCidr: '172.16.42.0/28'
      privateEndpointsCidr: '172.16.40.0/24'
    }
    wafPolicies: {
      applyToPortal: true
      matchVariable: 'SocketAddr'
      redirectUrl: 'https://ukexportfinance.gov.uk/'
      rejectAction: 'Block'
      wafPoliciesName: 'vpn'
      applyWafRuleOverrides: true
      restrictAccessToUkefIps: true
    }
  }
  feature: {
    acrSku: {
      name: 'Basic'
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
    nodeDeveloperMode: true
    nsg: {
      storageNetworkAccessDefaultAction: 'Allow'
    }
    apiPortalAccessPort: 44232
    vnet: {
      addressPrefixes: ['172.16.20.0/22']
      applicationGatewayCidr: '172.16.21.0/24'
      appServicePlanEgressPrefixCidr: '172.16.22.0/28'
      privateEndpointsCidr: '172.16.20.0/24'
    }
    wafPolicies: {
      applyToPortal: true
      matchVariable: 'SocketAddr'
      redirectUrl: 'https://ukexportfinance.gov.uk/'
      rejectAction: 'Block'
      wafPoliciesName: 'vpnFeature'
      applyWafRuleOverrides: true
      restrictAccessToUkefIps: true
    }
  }
  staging: {
    acrSku: {
      name: 'Standard'
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
    nodeDeveloperMode: false
    nsg: {
      // TODO:DTFS2-6422 Note that Staging (and only Staging) has the default as Deny, corresponding to "Enabled from selected virtual networks and IP addresses".
      storageNetworkAccessDefaultAction: 'Deny'
    }
    apiPortalAccessPort: 0
    vnet: {
      // TODO:DTFS2-6422 check if all the addressPrefixes are needed
      addressPrefixes: ['172.16.50.0/23', '172.16.52.0/23', '172.16.70.0/23']
      appServicePlanEgressPrefixCidr: '172.16.52.0/28'
      applicationGatewayCidr: '172.16.71.0/24'
      privateEndpointsCidr: '172.16.70.0/24'
    }
    wafPolicies: {
      applyToPortal: true
      matchVariable: 'SocketAddr'
      redirectUrl: ''
      rejectAction: 'Block'
      wafPoliciesName: 'vpnStaging'
      applyWafRuleOverrides: false
      restrictAccessToUkefIps: true
    }
  }
  prod: {
    acrSku: {
      name: 'Standard'
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
    nodeDeveloperMode: false
    nsg: {
      storageNetworkAccessDefaultAction: 'Allow'
    }
    apiPortalAccessPort: 0
    vnet: {
      // TODO:DTFS2-6422 check if all the addressPrefixes are needed
      addressPrefixes: ['172.16.30.0/23', '172.16.32.0/23']
      appServicePlanEgressPrefixCidr: '172.16.32.0/28'
      applicationGatewayCidr: '172.16.31.0/24'
      privateEndpointsCidr: '172.16.30.0/24'
    }
    wafPolicies: {
      // TODO:DTFS2-6422 Confirm this surprising setting.
      applyToPortal: false
      matchVariable: 'RemoteAddr'
      redirectUrl: 'https://www.gov.uk/government/organisations/uk-export-finance'
      rejectAction: 'Redirect'
      wafPoliciesName: 'vpnProd'
      applyWafRuleOverrides: false
      // TODO:FN-857 Currently the wafPolicies are shared with the TFM front door distribution
      // so we don't toggle the restrictAccessToUkefIps value, but simply don't link up the WAF Policies!
      restrictAccessToUkefIps: true
    }
  }
}

var logAnalyticsWorkspaceName = '${resourceGroup().name}-Logs-Workspace'


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
  name: containerRegistryName
  location: location
  sku: parametersMap[environment].acrSku
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
    storageLocations: storageLocations
    peeringRemoteVnetSubscriptionId: peeringRemoteVnetSubscriptionId
    peeringRemoteVnetResourceGroupName: peeringRemoteVnetResourceGroupName
    peeringRemoteVnetName: peeringRemoteVnetName
    peeringAddressSpace: peeringAddressSpace
    routeTableId: routeTable.outputs.routeTableId
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
  }
}

module functionAcbs 'modules/function-acbs.bicep' = {
  name: 'functionAcbs'
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
    externalApiHostname: externalApi.outputs.defaultHostName
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
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
    secureSettings: portalApiSecureSettings
    additionalSecureSettings: portalApiAdditionalSecureSetting
    connectionStrings: portalApiConnectionStrings
    secureConnectionStrings: portalApiSecureConnectionStrings
  }
}

module tfmApi 'modules/webapps/trade-finance-manager-api.bicep' = {
  name: 'tfmApi'
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
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
    numberGeneratorFunctionDefaultHostName: functionNumberGenerator.outputs.defaultHostName
    secureSettings: tfmApiSecureSettings
    additionalSecureSettings: tfmApiAdditionalSecureSettings
    secureConnectionStrings: tfmApiSecureConnectionStrings
    additionalSecureConnectionStrings: tfmApiAdditionalSecureConnectionStrings
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
    secureSettings: portalUiSecureSettings
    additionalSecureSettings: portalUiAdditionalSecureSettings
    secureConnectionStrings: portalUiSecureConnectionStrings
    additionalSecureConnectionStrings: portalUiAdditionalSecureConnectionStrings
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
    externalApiHostname: externalApi.outputs.defaultHostName
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    portalApiHostname: portalApi.outputs.defaultHostName
    redisName: redis.outputs.redisName
    tfmApiHostname: tfmApi.outputs.defaultHostName
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
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

module wafPoliciesPortal 'modules/waf-policies.bicep' = {
  name: 'wafPoliciesPortal'
  params: {
    allowedIpsString: onPremiseNetworkIpsString
    matchVariable: parametersMap[environment].wafPolicies.matchVariable
    redirectUrl: parametersMap[environment].wafPolicies.redirectUrl
    rejectAction: parametersMap[environment].wafPolicies.rejectAction
    wafPoliciesName: parametersMap[environment].wafPolicies.wafPoliciesName
    applyWafRuleOverrides: parametersMap[environment].wafPolicies.applyWafRuleOverrides
    restrictAccessToUkefIps: parametersMap[environment].wafPolicies.restrictAccessToUkefIps
  }
}

module frontDoorPortal 'modules/front-door-portal.bicep' = {
  name: 'frontDoorPortal'
  params: {
    backendPoolIp: tfsIp.outputs.tfsIpAddress
    environment: environment
    wafPoliciesId: parametersMap[environment].wafPolicies.applyToPortal ? wafPoliciesPortal.outputs.wafPoliciesId : ''
  }
  dependsOn: [applicationGatewayPortal]
}

module frontDoorTfm 'modules/front-door-tfm.bicep' = {
  name: 'frontDoorTfm'
  params: {
    backendPoolIp: tfsIp.outputs.tfsTfmIpAddress
    environment: environment
    wafPoliciesId: wafPoliciesPortal.outputs.wafPoliciesId
  }
  dependsOn: [applicationGatewayTfm]
}
