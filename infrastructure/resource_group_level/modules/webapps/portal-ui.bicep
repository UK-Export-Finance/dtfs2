param location string
param environment string
param containerRegistryName string
param appServicePlanEgressSubnetId string
param appServicePlanId string
param privateEndpointsSubnetId string
param logAnalyticsWorkspaceId string
param tfmApiHostname string
param portalApiHostname string
param redisName string
param azureWebsitesDnsZoneId string
param nodeDeveloperMode bool
param clamAvSettings {
  ipAddress: string
  port: int
}
param resourceNameFragment string = 'portal-ui'
param product string
param target string
param version string
param settings object
@secure()
param secureSettings object
@secure()
param additionalSecureSettings object
@secure()
param secureConnectionStrings object
@secure()
param additionalSecureConnectionStrings object
param azureDnsServerIp string
param websiteHttploggingRetentionDays string
param websiteHealthcheckingMax string
@description('Companies House API URL.')
@secure()
param COMPANIES_HOUSE_API_URL string

@description('Portal UI URL.')
@secure()
param PORTAL_UI_URL string

@description('Deal API URL.')
@secure()
param DEAL_API_URL string

@description('Companies House API key.')
@secure()
param COMPANIES_HOUSE_API_KEY string

@description('Session secret for the portal UI.')
@secure()
param SESSION_SECRET string

@description('Portal API key.')
@secure()
param PORTAL_API_KEY string

@description('TFM API key.')
@secure()
param TFM_API_KEY string

@description('TFM API URL.')
@secure()
param TFM_API string

@description('TFM UI URL.')
@secure()
param TFM_UI_URL string

@description('UKEF GEF reporting email recipient.')
@secure()
param UKEF_GEF_REPORTING_EMAIL_RECIPIENT string

@description('DTFS Central API URL.')
@secure()
param DTFS_CENTRAL_API_URL string

@description('DTFS Central API key.')
@secure()
param DTFS_CENTRAL_API string

@description('PDC inputters email recipient.')
@secure()
param PDC_INPUTTERS_EMAIL_RECIPIENT string

@description('CORS origin for the portal UI.')
@secure()
param CORS_ORIGIN string

@description('Azure portal export folder.')
@secure()
param AZURE_PORTAL_EXPORT_FOLDER string

@description('Azure portal file share name.')
@secure()
param AZURE_PORTAL_FILESHARE_NAME string

@description('JWT signing key used to generate authentication tokens.')
@secure()
param JWT_SIGNING_KEY string

@description('JWT validating key used to verify authentication tokens.')
@secure()
param JWT_VALIDATING_KEY string

@description('GOV Notify API key.')
@secure()
param GOV_NOTIFY_API_KEY string

@description('GOV Notify email recipient.')
@secure()
param GOV_NOTIFY_EMAIL_RECIPIENT string

@description('DTFS Central API key.')
@secure()
param DTFS_CENTRAL_API_KEY string

@description('External API key.')
@secure()
param EXTERNAL_API_KEY string

@description('External API URL.')
@secure()
param EXTERNAL_API_URL string

@description('TFM API URL.')
@secure()
param TFM_API_URL string

var containerRegistryLoginServer = containerRegistry.properties.loginServer
var dockerImageName = '${containerRegistryLoginServer}/${resourceNameFragment}:${environment}'
var portalApiUrl = 'https://${portalApiHostname}'
var staticSettings = {
  PORTAL_API_URL: portalApiUrl
  REDIS_HOSTNAME: redis.properties.hostName
  REDIS_PORT: redis.properties.sslPort
  REDIS_KEY: redis.listKeys().primaryKey
  HTTPS: 1
  CLAMAV_HOST: clamAvSettings.ipAddress
  CLAMAV_PORT: clamAvSettings.port
  CLAMAV_DEBUG_MODE_ENABLED: 'true'
  CLAMAV_SCANNING_ENABLED: 'true'
  WEBSITE_DNS_SERVER: azureDnsServerIp
  WEBSITE_VNET_ROUTE_ALL: '1'
  PORT: '5000'
  WEBSITES_PORT: '5000'
}

var tfmApiUrl = 'https://${tfmApiHostname}'
var additionalSettings = {
  DOCKER_ENABLE_CI: 'true'
  DOCKER_REGISTRY_SERVER_URL: containerRegistryLoginServer
  DOCKER_REGISTRY_SERVER_USERNAME: containerRegistry.listCredentials().username
  DOCKER_REGISTRY_SERVER_PASSWORD: containerRegistry.listCredentials().passwords[0].value
  LOG4J_FORMAT_MSG_NO_LOOKUPS: 'true'
  TFM_API_URL: tfmApiUrl
  TZ: 'Europe/London'
  WEBSITE_HEALTHCHECK_MAXPINGFAILURES: websiteHealthcheckingMax
  WEBSITE_HTTPLOGGING_RETENTION_DAYS: websiteHttploggingRetentionDays
  WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
}

var nodeEnv = nodeDeveloperMode ? { NODE_ENV: 'production' } : {}

var keyVaultSecureSettings = {
  PORTAL_API_KEY: PORTAL_API_KEY
  PORTAL_UI_URL: PORTAL_UI_URL
  TFM_API: TFM_API
  TFM_UI_URL: TFM_UI_URL
  UKEF_GEF_REPORTING_EMAIL_RECIPIENT: UKEF_GEF_REPORTING_EMAIL_RECIPIENT
  DTFS_CENTRAL_API_URL: DTFS_CENTRAL_API_URL
  DTFS_CENTRAL_API: DTFS_CENTRAL_API
  PDC_INPUTTERS_EMAIL_RECIPIENT: PDC_INPUTTERS_EMAIL_RECIPIENT
  CORS_ORIGIN: CORS_ORIGIN
  AZURE_PORTAL_EXPORT_FOLDER: AZURE_PORTAL_EXPORT_FOLDER
  AZURE_PORTAL_FILESHARE_NAME: AZURE_PORTAL_FILESHARE_NAME
  JWT_SIGNING_KEY: JWT_SIGNING_KEY
  JWT_VALIDATING_KEY: JWT_VALIDATING_KEY
  GOV_NOTIFY_API_KEY: GOV_NOTIFY_API_KEY
  GOV_NOTIFY_EMAIL_RECIPIENT: GOV_NOTIFY_EMAIL_RECIPIENT
  DTFS_CENTRAL_API_KEY: DTFS_CENTRAL_API_KEY
  EXTERNAL_API_KEY: EXTERNAL_API_KEY
  TFM_API_KEY: TFM_API_KEY
  EXTERNAL_API_URL: EXTERNAL_API_URL
  TFM_API_URL: TFM_API_URL
  COMPANIES_HOUSE_API_URL: COMPANIES_HOUSE_API_URL
  DEAL_API_URL: DEAL_API_URL
  COMPANIES_HOUSE_API_KEY: COMPANIES_HOUSE_API_KEY
  SESSION_SECRET: SESSION_SECRET
}

var appSettings = union(settings, staticSettings, secureSettings, additionalSettings, additionalSecureSettings, nodeEnv, keyVaultSecureSettings)

var connectionStringsList = [for item in items(union(secureConnectionStrings, additionalSecureConnectionStrings)): {
  name: item.key
  value: item.value
} ]

var connectionStringsProperties = toObject(connectionStringsList, item => item.name, item => {
  type: 'Custom'
  value: item.value
} )
var connectionStringsCalculated = { }
var connectionStringsCombined = union(connectionStringsProperties, connectionStringsCalculated)

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: containerRegistryName
}

resource redis 'Microsoft.Cache/redis@2024-11-01' existing = {
  name: redisName
}
module portalUiWebapp 'webapp.bicep' = {
  name: 'portalUiWebapp'
  params: {
    appServicePlanEgressSubnetId: appServicePlanEgressSubnetId
    appServicePlanId: appServicePlanId
    appSettings: appSettings
    azureWebsitesDnsZoneId: azureWebsitesDnsZoneId
    connectionStrings: connectionStringsCombined
    deployApplicationInsights: true
    dockerImageName: dockerImageName
    ftpsState: 'Disabled'
    product: product
    target: target
    version: version
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspaceId
    privateEndpointsSubnetId: privateEndpointsSubnetId
    resourceNameFragment: resourceNameFragment
    scmMinTlsVersion: '1.2'
  }
}

output defaultHostName string = portalUiWebapp.outputs.defaultHostName
