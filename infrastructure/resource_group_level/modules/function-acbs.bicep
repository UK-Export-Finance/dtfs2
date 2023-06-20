param location string
param environment string
param containerRegistryName string
param appServicePlanEgressSubnetId string
param appServicePlanId string
param privateEndpointsSubnetId string
param storageAccountName string


// These values are taken from GitHub secrets
@secure()
param secureSettings object = {
  MULESOFT_API_KEY: 'test-value'
  MULESOFT_API_SECRET: 'test-value'
  MULESOFT_API_UKEF_TF_EA_URL: 'test-value'
  APIM_MDM_KEY: 'test-value'
  APIM_MDM_URL: 'test-value'
  APIM_MDM_VALUE: 'test-value' // different in staging and dev
}

// These values are taken from an export of Configuration on Dev
// TODO:FN-419 Add to GitHub secrets?
@secure()
param additionalSecureSettings object = {
  DOCKER_REGISTRY_SERVER_PASSWORD: 'test-value'  // different in staging and dev
  MACHINEKEY_DecryptionKey: 'test-value' // different in staging and dev
  MULESOFT_API_UKEF_MDM_EA_KEY: 'test-value'
  MULESOFT_API_UKEF_MDM_EA_SECRET: 'test-value'
  MULESOFT_API_UKEF_MDM_EA_URL: 'test-value' // different in staging and dev
}


var dockerImageName = '${containerRegistryName}.azurecr.io/azure-function-acbs:${environment}'

var dockerRegistryServerUsername = 'tfs${environment}'

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' existing = {
  name: storageAccountName
}

var storageAccountKey = storageAccount.listKeys().keys[0].value

// These values are hardcoded in the CLI scripts
var settings = {
  FUNCTIONS_WORKER_RUNTIME: 'node'
  // TODO:FN-419 consider making this a parameter
  WEBSITE_DNS_SERVER: '168.63.129.16'
  WEBSITE_VNET_ROUTE_ALL: '1'
}

// These values are taken from an export of Configuration on Dev
var additionalSettings = {
  APPINSIGHTS_INSTRUMENTATIONKEY: 'TODO:FN-419 replace with appInsights.properties.InstrumentationKey'
  // TODO:FN-419 - Exported string had "EndpointSuffix=core.windows.net" in it. Check if needed
  AzureWebJobsStorage: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${storageAccountKey}'
  // TODO:FN-419 I think DOCKER_CUSTOM_IMAGE_NAME is overridden by linuxFxVersion
  DOCKER_CUSTOM_IMAGE_NAME: dockerImageName
  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: '${containerRegistryName}.azurecr.io'
  DOCKER_REGISTRY_SERVER_USERNAME: dockerRegistryServerUsername
  FUNCTION_APP_EDIT_MODE: 'readOnly'
  FUNCTIONS_EXTENSION_VERSION: '~3'
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'
  TZ: 'Europe/London'
  WEBSITE_USE_PLACEHOLDER: '0'
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
}

var nodeEnv = environment == 'dev' ? {NODE_ENV: 'development'} : {}
var appSettings = union(settings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv)

var functionAcbsName = 'tfs-${environment}-function-acbs'
var privateEndpointName = 'tfs-${environment}-function-acbs'


// Minimal setup from MS example
// See also https://learn.microsoft.com/en-my/azure/azure-functions/functions-infrastructure-as-code?tabs=bicep

resource functionAcbs 'Microsoft.Web/sites@2022-09-01' = {
  name: functionAcbsName
  location: location
  tags: {
    Environment: 'Preproduction'
  }
  kind: 'functionapp,linux,container'
  properties: {
    httpsOnly: false
    serverFarmId: appServicePlanId
    siteConfig: {
      // TODO:FN-419 These siteConfig values are included in the much more comprehensive config object, produced by the export.
      // Work out the reason for the duplication
      numberOfWorkers: 1
      linuxFxVersion: 'DOCKER|${dockerImageName}'
      acrUseManagedIdentityCreds: false
      alwaysOn: true
      http20Enabled: true
      functionAppScaleLimit: 0
      minimumElasticInstanceCount: 1
    }
    virtualNetworkSubnetId: appServicePlanEgressSubnetId
  }
}

resource functionAcbsAppSettings 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: functionAcbs
  name: 'appsettings'
  properties: appSettings
}


// The private endpoint is taken from the function=acbs/private-endpoint export
resource privateEndpoints_tfs_dev_function_acbs_name_resource 'Microsoft.Network/privateEndpoints@2022-11-01' = {
  name: privateEndpointName
  location: location
  tags: {
    Environment: 'Preproduction'
  }
  properties: {
    privateLinkServiceConnections: [
      {
        name: privateEndpointName
        properties: {
          privateLinkServiceId: functionAcbs.id
          groupIds: [
            'sites'
          ]
          privateLinkServiceConnectionState: {
            status: 'Approved'
            actionsRequired: 'None'
          }
        }
      }
    ]
    manualPrivateLinkServiceConnections: []
    subnet: {
      id: privateEndpointsSubnetId
    }
    ipConfigurations: []
    // Note that the customDnsConfigs array gets created automatically and doesn't need setting here.
  }
}

// TODO:FN-419 Do we need to set up the basicPublishingCredentialsPolicies config?

// TODO:FN-419 Add automatic A Record generation like storage does.
