param location string  = resourceGroup().location
@allowed(['dev', 'feature', 'staging', 'prod'])
param environment string
@description('The product name for resource naming')
param product string
@description('The target environment for resource naming')
param target string
@description('The version for resource naming')
param version string
var frontDoorAccess = 'Allow'
@description('CIDR range used for the production subnet within the virtual network.')
param productionSubnetCidr string

@description('IP address of the next hop (typically firewall or NVA) used in the route table for outbound traffic.')
param routeTableNextHopIpAddress string

@description('Subscription ID containing the remote VNet used for VPN or peering.')
@secure()
param peeringRemoteVnetSubscriptionId string

@description('Resource group containing the remote VNet used for VNet peering.')
param peeringRemoteVnetResourceGroupName string = 'UKEF-Firewall-Appliance-UKS'

@description('Name of the remote virtual network that this VNet will peer with.')
param peeringRemoteVnetName string = 'VNET_UKEF_UKS'

@description('Address space of the remote VNet used for VNet peering.')
param peeringAddressSpace string

@description('Primary CIDR address space assigned to the main virtual network.')
param vnetAddressPrefix string

@description('CIDR range used for the Application Gateway subnet.')
param applicationGatewayCidr string

@description('CIDR range used for the App Service Plan egress subnet.')
param appServicePlanEgressPrefixCidr string

@description('CIDR range allocated to the Azure Container Apps subnet hosting the ClamAV service.')
param acaClamAvCidr string

@description('CIDR range used for the subnet hosting Private Endpoints.')
param privateEndpointsCidr string

@description('IPs allowed to access restricted services, represented as JSON array string (UKEF_VPN_IPS).')
@secure()
param onPremiseNetworkIpsString string

@description('Network IPs permitted to access Cosmos DB from the Azure Portal (AZ_PORTAL_IPS).')
@secure()
param azurePortalIpsString string

@description('Enable 7-day soft deletes on file shares.')
var shareDeleteRetentionEnabled = false

@description('Rate limit threshold used by the API management layer.')
@secure()
param RATE_LIMIT_THRESHOLD string

@description('API Management subscription key used to access the TFS API.')
@secure()
param APIM_TFS_KEY string

@description('API Management subscription value associated with the TFS API.')
@secure()
param APIM_TFS_VALUE string

@description('Base URL for the APIM endpoint exposing the TFS API.')
@secure()
param APIM_TFS_URL string

@description('API Management subscription key used to access the MDM API.')
@secure()
param APIM_MDM_KEY string

@description('Base URL for the APIM endpoint exposing the MDM API.')
@secure()
param APIM_MDM_URL string

@description('API Management subscription value for the MDM API (varies between dev/staging environments).')
@secure()
param APIM_MDM_VALUE string

@description('CRON schedule controlling when utilisation reports for banks are generated.')
param UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE string = '0 2 * * 1'

@description('Authentication key used by services to call the DTFS Central API.')
@secure()
param DTFS_CENTRAL_API_KEY string

@description('Allowed CORS origin used by frontend applications when calling APIs.')
@secure()
param CORS_ORIGIN string

@description('Base URL for the Companies House API.')
@secure()
param COMPANIES_HOUSE_API_URL string

@description('Base URL for the Ordnance Survey API.')
@secure()
param ORDNANCE_SURVEY_API_URL string

@description('Base URL for the APIM eStore integration.')
@secure()
param APIM_ESTORE_URL string

@description('Subscription key used to access the APIM eStore API.')
@secure()
param APIM_ESTORE_KEY string

@description('Subscription value used when calling the APIM eStore API.')
@secure()
param APIM_ESTORE_VALUE string

@description('API key used when calling the Companies House API.')
@secure()
param COMPANIES_HOUSE_API_KEY string

@description('API key used when calling the Ordnance Survey API.')
@secure()
param ORDNANCE_SURVEY_API_KEY string

@description('API key used to authenticate with the GOV.UK Notify service.')
@secure()
param GOV_NOTIFY_API_KEY string

@description('Email address used as the default recipient for GOV.UK Notify emails.')
@secure()
param GOV_NOTIFY_EMAIL_RECIPIENT string

@description('API key used by external integrations to call system APIs.')
@secure()
param EXTERNAL_API_KEY string

@description('Maximum allowed size for utilisation report uploads (in bytes).')
param UTILISATION_REPORT_MAX_FILE_SIZE_BYTES string

@description('Public URL of the DTFS portal UI.')
param PORTAL_UI_URL string

@description('Number of business days from the start of the month when utilisation reports become due.')
param UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH string

@description('Number of business days from the start of the month when overdue utilisation report reminders are sent.')
param UTILISATION_REPORT_OVERDUE_CHASER_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH string

@description('CRON schedule controlling when utilisation reporting period start emails are sent.')
param UTILISATION_REPORT_REPORTING_PERIOD_START_EMAIL_SCHEDULE string

@description('CRON schedule controlling when utilisation report due reminder emails are sent.')
param UTILISATION_REPORT_DUE_EMAIL_SCHEDULE string

@description('CRON schedule controlling when overdue utilisation report emails are sent.')
param UTILISATION_REPORT_OVERDUE_EMAIL_SCHEDULE string

@description('Azure File Share name used to store utilisation reports.')
param AZURE_UTILISATION_REPORTS_FILESHARE_NAME string

@description('Folder within the Azure storage file share used for portal export files.')
@secure()
param AZURE_PORTAL_EXPORT_FOLDER string

@description('Azure File Share name used for portal export storage.')
@secure()
param AZURE_PORTAL_FILESHARE_NAME string

@description('JWT signing key used to generate authentication tokens.')
@secure()
param JWT_SIGNING_KEY string

@description('JWT validation key used to verify authentication tokens.')
@secure()
param JWT_VALIDATING_KEY string

@description('API key required to access the Portal API.')
@secure()
param PORTAL_API_KEY string

@description('API key required to access the TFM API.')
@secure()
param TFM_API_KEY string

@description('Secret used for session encryption and authentication.')
@secure()
param SESSION_SECRET string

@description('Base URL used for the eStore integration.')
@secure()
param ESTORE_URL string

@description('System authentication key used for calls to the UKEF TFM API.')
@secure()
param UKEF_TFM_API_SYSTEM_KEY string

@description('API key used for retrieving reports from the UKEF TFM API.')
@secure()
param UKEF_TFM_API_REPORTS_KEY string

@description('CRON schedule controlling when the Azure number generator function runs.')
@secure()
param AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE string

@description('Email address used for PDC inputter notifications.')
@secure()
param PDC_INPUTTERS_EMAIL_RECIPIENT string

@description('Internal UKEF notification email or identifier used for internal alerts.')
@secure()
param UKEF_INTERNAL_NOTIFICATION string

@description('Email address used for contacting the team.')
param CONTACT_US_EMAIL_ADDRESS string

@description('Flag to enable or disable the fee record correction feature in the application.')
param FF_FEE_RECORD_CORRECTION_ENABLED string

@description('Flag to enable or disable 2FA for the portal.')
param FF_PORTAL_2FA_ENABLED string

@description('Flag to enable or disable amendments to facilities within the portal.')
param FF_PORTAL_FACILITY_AMENDMENTS_ENABLED string

@description('Flag to enable or disable cancellation of deals within the portal.')
param FF_TFM_DEAL_CANCELLATION_ENABLED string

@description('Flag to enable or disable the use of the new TFM API for deal data retrieval in the portal.')
param MAINTENANCE_ACTIVE string

@description('Timestamp indicating when the next maintenance window will occur')
param MAINTENANCE_TIMESTAMP string

@description('The URL of the Deal API, used for retrieving deal information.')
param DEAL_API_URL string

@description('Flag to enable or disable Azure Cosmos DB change feed processing for the application.')
param CHANGE_STREAM_ENABLED string

@description('Version identifier for GEF deal functionality, used to control feature rollout and compatibility.')
param GEF_DEAL_VERSION string

@description('The URL of the TFM API, used for retrieving TFM data.')
param TFM_API string

@description('The URL of the Portal UI, used for redirecting users when access is blocked by WAF rules.')
param TFM_UI_URL string

@description('Time to live (TTL) in seconds for deletion audit logs, controlling how long these logs are retained before automatic deletion.')
param DELETION_AUDIT_LOGS_TTL_SECONDS string

@description('CRON schedule controlling when the eStore cron manager function runs.')
param ESTORE_CRON_MANAGER_SCHEDULE string

@description('API key used to authenticate with the Companies House API.')
@secure()
param AUDIT_API_PASSWORD string

@description('CRON schedule controlling when durable functions logs are deleted.')
param ACBS_DURABLE_FUNCTIONS_LOG_DELETION_SCHEDULE string

@description('Base URL for the audit API, used for recording significant actions and events within the system.')
@secure()
param AUDIT_API_URL string

@description('Username used to authenticate with the audit API.')
@secure()
param AUDIT_API_USERNAME string

@description('CRON schedule controlling when the Azure number generator function runs.')
param DEAL_CANCELLATION_SCHEDULE string

@description('The URL of the DTFS Central API, used for retrieving data from or sending data to the API.')
param DTFS_CENTRAL_API_URL string

@description('The URL of the external API, used for retrieving data from or sending data to external systems.')
@secure()
param EXTERNAL_API_URL string

@description('The URL of the portal API, used for retrieving data from or sending data to the portal.')
param PORTAL_API_URL string

@description('The email address of the recipient for UKEF GEF reporting emails.')
param RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE string

@description('The email address of the recipient for UKEF GEF reporting emails.')
@secure()
param SQL_DB_HOST string

@description('The name of the SQL database to connect to.')
param SQL_DB_LOGGING_ENABLED string

@description('The username for authenticating with the SQL database.')
@secure()
param SQL_DB_NAME string

@description('The username for authenticating with the SQL database.')
@secure()
param SQL_DB_USERNAME string

@description('The port number for connecting to the SQL database.')
param SQL_DB_PORT string

@description('The password for authenticating with the SQL database.')
@secure()
param SQL_DB_PASSWORD string

@description('The email address of the recipient for UKEF GEF reporting emails.')
param UKEF_GEF_REPORTING_EMAIL_RECIPIENT string

@description('The URL of the TFM API, used for retrieving TFM data.')
param TFM_API_URL string

@description('The URL of the Azure ACBS function, used for interacting with the ACBS service.')
param AZURE_ACBS_FUNCTION_URL string

@description('The percentage of available cash that has been utilized.')
param CASH_UTILISATION_PERCENTAGE string

@description('The percentage of available contingent liabilities.')
param CONTINGENT_UTILISATION_PERCENTAGE string

@description('The client ID for the Azure AD application used for authentication.')
@secure()
param ENTRA_ID_CLIENT_ID string

@description('The client secret for the Azure AD application used for authentication.')
@secure()
param ENTRA_ID_CLIENT_SECRET string

@description('The tenant ID for the Azure AD application used for authentication.')
param ENTRA_ID_CLOUD_INSTANCE string

@description('The tenant ID for the Azure AD application used for authentication.')
param ENTRA_ID_REDIRECT_URL string

@description('The tenant ID for the Azure AD application used for authentication.')
@secure()
param ENTRA_ID_TENANT_ID string

@description('Flag to enable or disable the Salesforce customer creation feature.')
param FF_SALESFORCE_CUSTOMER_CREATION_ENABLED string

@description('Flag to enable or disable the TFM facility end date feature.')
param FF_TFM_FACILITY_END_DATE_ENABLED string

@description('Flag to enable or disable the TFM payment reconciliation feature.')
param CONTACT_US_SELF_SERVICE_PORTAL_URL string

@description('Flag to enable or disable the TFM payment reconciliation feature.')
param FF_TFM_PAYMENT_RECONCILIATION_ENABLED string

@description('Azure DNS server IP address used for custom DNS resolution within the VNet.')
param azureDnsServerIp string

@description('Source IP prefix allowed by the NSG to access restricted resources.')
param nsgSourceAddressPrefix string 

@description('UKEF network source IP prefix permitted by network security rules.')
param ukefSourceAddressPrefix string 

@description('Test network source IP prefix used for development or validation access.')
param testSourceAddressPrefix string 

@description('Number of days to retain HTTP logs for App Service.')
param websiteHttploggingRetentionDays string

@description('Maximum number of health check failures allowed before App Service instance recycling.')
param websiteHealthcheckingMax string

@description('Dynamic cache configuration value for the web application.')
param websiteDynamicCache string

@description('Default Node.js runtime version used by the web applications.')
param websiteNodeDefaultVersion string

@description('Time zone used by application services and scheduled tasks.')
param timeZone string

@description('The URL to redirect traffic to when a request is blocked or rejected by WAF rules')
param redirectUrl string

@description('The SKU (pricing tier) of the App Service Plan')
param aspSku string

var storageLocations = [
  'uksouth'
]

var logAnalyticsWorkspaceName ='log-workspace-${ product }-${ target }-${ version }'
var peeringVnetName = 'vnet-peer-uks-${product}-${target}-${version}'

var commonRedis = {
  sku: {
    name: 'Basic'
    family: 'C'
    capacity: 0
  }
}

var commonCosmos = {
  databaseName: 'dtfs-submissions'
}

var commonVnet = {
  addressPrefixes: [vnetAddressPrefix]
  applicationGatewayCidr: applicationGatewayCidr
  appServicePlanEgressPrefixCidr: appServicePlanEgressPrefixCidr
  acaClamAvCidr: acaClamAvCidr
  privateEndpointsCidr: privateEndpointsCidr
  peeringVnetName: peeringVnetName
}

var commonWaf = {
  matchVariable: 'SocketAddr'
  rejectAction: 'Block'
  applyWafRuleOverrides: true
  restrictPortalAccessToUkefIps: true
}

var parametersMap = {
  dev: {
    cr: {
      name: 'dev'
      sku: { name: 'Standard' }
    }
    asp: { 
      name: 'dev'
      sku: aspSku 
    }
    cosmosDb: union(commonCosmos, {
      capacityMode: 'Provisioned Throughput'
      backupPolicyTier: 'Continuous30Days'
    })
    nodeDeveloperMode: true
    nsg: { storageNetworkAccessDefaultAction: 'Allow' }
    apiPortalAccessPort: 44232
    redis: commonRedis
    vnet: commonVnet
    wafPolicies: union(commonWaf, {
      redirectUrl: redirectUrl
      wafPoliciesName: 'vpn'
    })
  }

  feature: {
    cr: {
      name: 'feature'
      sku: { name: 'Basic' }
    }
    asp: {
      name: 'feature'
      sku: aspSku
    }
    cosmosDb: union(commonCosmos, {
      capacityMode: 'Serverless'
      backupPolicyTier: 'Continuous7Days'
    })
    nodeDeveloperMode: true
    nsg: { storageNetworkAccessDefaultAction: 'Allow' }
    apiPortalAccessPort: 44232
    redis: commonRedis
    vnet: commonVnet
    wafPolicies: union(commonWaf, {
      redirectUrl: redirectUrl
      wafPoliciesName: 'vpnFeature'
    })
  }

  staging: {
    cr: {
      name: 'tfsstaging'
      sku: { name: 'Standard' }
    }
    asp: {
      name: 'test'
      sku: aspSku
    }
    cosmosDb: union(commonCosmos, {
      capacityMode: 'Provisioned Throughput'
      backupPolicyTier: 'Continuous30Days'
    })
    nodeDeveloperMode: false
    nsg: { storageNetworkAccessDefaultAction: 'Deny' }
    apiPortalAccessPort: 0
    redis: commonRedis
    vnet: commonVnet
    wafPolicies: union(commonWaf, {
      redirectUrl: ''
      wafPoliciesName: 'vpnStaging'
      applyWafRuleOverrides: false
    })
  }

  prod: {
    cr: {
      name: 'tfsproduction'
      sku: { name: 'Standard' }
    }
    asp: {
      name: 'prod'
      sku: aspSku
    }
    cosmosDb: union(commonCosmos, {
      capacityMode: 'Provisioned Throughput'
      backupPolicyTier: 'Continuous30Days'
    })
    functionAcbs: {
      state: 'Running'
    }
    nodeDeveloperMode: false
    nsg: { storageNetworkAccessDefaultAction: 'Allow' }
    apiPortalAccessPort: 0
    redis: commonRedis
    vnet: commonVnet
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

var functionSettings = {
 RATE_LIMIT_THRESHOLD : RATE_LIMIT_THRESHOLD
}

var functionSecureSettings = {
  APIM_TFS_KEY: APIM_TFS_KEY
  APIM_TFS_VALUE: APIM_TFS_VALUE
  APIM_TFS_URL: APIM_TFS_URL
  APIM_MDM_KEY: APIM_MDM_KEY
  APIM_MDM_URL: APIM_MDM_URL
  APIM_MDM_VALUE: APIM_MDM_VALUE
}

var functionAdditionalSecureSettings = { }

var dtfsCentralApiSettings = {
  RATE_LIMIT_THRESHOLD: RATE_LIMIT_THRESHOLD
  UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE: UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE
  AUDIT_API_PASSWORD: AUDIT_API_PASSWORD
  ACBS_DURABLE_FUNCTIONS_LOG_DELETION_SCHEDULE: ACBS_DURABLE_FUNCTIONS_LOG_DELETION_SCHEDULE
  AUDIT_API_URL: AUDIT_API_URL
  AUDIT_API_USERNAME: AUDIT_API_USERNAME
  CHANGE_STREAM_ENABLED: CHANGE_STREAM_ENABLED
  DEAL_CANCELLATION_SCHEDULE: DEAL_CANCELLATION_SCHEDULE
  DELETION_AUDIT_LOGS_TTL_SECONDS: DELETION_AUDIT_LOGS_TTL_SECONDS
  DTFS_CENTRAL_API_URL  : DTFS_CENTRAL_API_URL
  EXTERNAL_API_KEY: EXTERNAL_API_KEY
  EXTERNAL_API_URL: EXTERNAL_API_URL
  FF_PORTAL_2FA_ENABLED: FF_PORTAL_2FA_ENABLED
  FF_PORTAL_FACILITY_AMENDMENTS_ENABLED : FF_PORTAL_FACILITY_AMENDMENTS_ENABLED
  FF_TFM_DEAL_CANCELLATION_ENABLED: FF_TFM_DEAL_CANCELLATION_ENABLED
  MAINTENANCE_ACTIVE: MAINTENANCE_ACTIVE
  MAINTENANCE_TIMESTAMP: MAINTENANCE_TIMESTAMP
  JWT_SIGNING_KEY: JWT_SIGNING_KEY
  JWT_VALIDATING_KEY: JWT_VALIDATING_KEY
  PORTAL_API_KEY: PORTAL_API_KEY
  PORTAL_API_URL: PORTAL_API_URL
  RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE: RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE
  SQL_DB_HOST: SQL_DB_HOST
  SQL_DB_LOGGING_ENABLED: SQL_DB_LOGGING_ENABLED
  SQL_DB_NAME: SQL_DB_NAME
  SQL_DB_PASSWORD: SQL_DB_PASSWORD
  SQL_DB_PORT: SQL_DB_PORT
  SQL_DB_USERNAME: SQL_DB_USERNAME
  TFM_API_KEY: TFM_API_KEY
  TFM_API_URL: TFM_API_URL
  TFM_UI_URL: TFM_UI_URL
  UKEF_GEF_REPORTING_EMAIL_RECIPIENT: UKEF_GEF_REPORTING_EMAIL_RECIPIENT
}
var dtfsCentralApiSecureSettings = {}
var dtfsCentralApiAdditionalSecureSetting = {
  DTFS_CENTRAL_API_KEY: DTFS_CENTRAL_API_KEY
}

var externalApiSettings = {
    RATE_LIMIT_THRESHOLD: RATE_LIMIT_THRESHOLD
    COMPANIES_HOUSE_API_URL: COMPANIES_HOUSE_API_URL
    ORDNANCE_SURVEY_API_URL: ORDNANCE_SURVEY_API_URL
    DELETION_AUDIT_LOGS_TTL_SECONDS: DELETION_AUDIT_LOGS_TTL_SECONDS
    ESTORE_CRON_MANAGER_SCHEDULE: ESTORE_CRON_MANAGER_SCHEDULE
    MAINTENANCE_ACTIVE: MAINTENANCE_ACTIVE
    MAINTENANCE_TIMESTAMP: MAINTENANCE_TIMESTAMP
    UKEF_INTERNAL_NOTIFICATION: UKEF_INTERNAL_NOTIFICATION
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
  COMPANIES_HOUSE_API_KEY: COMPANIES_HOUSE_API_KEY
  ORDNANCE_SURVEY_API_KEY: ORDNANCE_SURVEY_API_KEY
  GOV_NOTIFY_API_KEY: GOV_NOTIFY_API_KEY
  GOV_NOTIFY_EMAIL_RECIPIENT: GOV_NOTIFY_EMAIL_RECIPIENT
}

var externalApiAdditionalSecureSettings = {
  EXTERNAL_API_KEY: EXTERNAL_API_KEY
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
  CHANGE_STREAM_ENABLED: CHANGE_STREAM_ENABLED
  FF_PORTAL_2FA_ENABLED: FF_PORTAL_2FA_ENABLED
  FF_PORTAL_FACILITY_AMENDMENTS_ENABLED : FF_PORTAL_FACILITY_AMENDMENTS_ENABLED
  GEF_DEAL_VERSION: GEF_DEAL_VERSION
  MAINTENANCE_ACTIVE: MAINTENANCE_ACTIVE
  MAINTENANCE_TIMESTAMP: MAINTENANCE_TIMESTAMP
  TFM_API: TFM_API
  TFM_UI_URL: TFM_UI_URL
  UKEF_GEF_REPORTING_EMAIL_RECIPIENT: UKEF_GEF_REPORTING_EMAIL_RECIPIENT
  DTFS_CENTRAL_API_URL: DTFS_CENTRAL_API_URL
  DTFS_CENTRAL_API: DTFS_CENTRAL_API_URL
}

var portalApiSecureSettings = {
  PDC_INPUTTERS_EMAIL_RECIPIENT: PDC_INPUTTERS_EMAIL_RECIPIENT
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

var portalUISettings = {
  RATE_LIMIT_THRESHOLD: RATE_LIMIT_THRESHOLD 
  COMPANIES_HOUSE_API_URL: COMPANIES_HOUSE_API_URL
  UTILISATION_REPORT_MAX_FILE_SIZE_BYTES: UTILISATION_REPORT_MAX_FILE_SIZE_BYTES
  PORTAL_UI_URL: PORTAL_UI_URL
  CONTACT_US_EMAIL_ADDRESS: CONTACT_US_EMAIL_ADDRESS
  DEAL_API_URL: DEAL_API_URL
  FF_FEE_RECORD_CORRECTION_ENABLED: FF_FEE_RECORD_CORRECTION_ENABLED
  FF_PORTAL_2FA_ENABLED: FF_PORTAL_2FA_ENABLED
  FF_PORTAL_FACILITY_AMENDMENTS_ENABLED : FF_PORTAL_FACILITY_AMENDMENTS_ENABLED
  FF_TFM_DEAL_CANCELLATION_ENABLED: FF_TFM_DEAL_CANCELLATION_ENABLED
  MAINTENANCE_ACTIVE: MAINTENANCE_ACTIVE
  MAINTENANCE_TIMESTAMP: MAINTENANCE_TIMESTAMP
}

var portalUISecureSettings = {
  COMPANIES_HOUSE_API_KEY: COMPANIES_HOUSE_API_KEY
  SESSION_SECRET: SESSION_SECRET
}

var portalUIAdditionalSecureSettings = {
  PORTAL_API_KEY: PORTAL_API_KEY
  TFM_API_KEY: TFM_API_KEY
}

var portalUISecureConnectionStrings = { }
var portalUIAdditionalSecureConnectionStrings = { }

var tfmUISettings = {
  RATE_LIMIT_THRESHOLD: RATE_LIMIT_THRESHOLD
  UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH: UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH
  CONTACT_US_EMAIL_ADDRESS: CONTACT_US_EMAIL_ADDRESS
  CONTACT_US_SELF_SERVICE_PORTAL_URL: CONTACT_US_SELF_SERVICE_PORTAL_URL
  FF_FEE_RECORD_CORRECTION_ENABLED: FF_FEE_RECORD_CORRECTION_ENABLED
  FF_PORTAL_FACILITY_AMENDMENTS_ENABLED : FF_PORTAL_FACILITY_AMENDMENTS_ENABLED
  FF_TFM_DEAL_CANCELLATION_ENABLED: FF_TFM_DEAL_CANCELLATION_ENABLED
  FF_TFM_FACILITY_END_DATE_ENABLED: FF_TFM_FACILITY_END_DATE_ENABLED
  FF_TFM_PAYMENT_RECONCILIATION_ENABLED: FF_TFM_PAYMENT_RECONCILIATION_ENABLED
  MAINTENANCE_ACTIVE: MAINTENANCE_ACTIVE
  MAINTENANCE_TIMESTAMP: MAINTENANCE_TIMESTAMP
}

var tfmUISecureSettings = {
  UKEF_TFM_API_SYSTEM_KEY: UKEF_TFM_API_SYSTEM_KEY
  ESTORE_URL: ESTORE_URL
  SESSION_SECRET: SESSION_SECRET
}

var tfmUIAdditionalSecureSettings = {
  TFM_API_KEY: TFM_API_KEY
}

var tfmUISecureConnectionStrings = { }
var tfmUIAdditionalSecureConnectionStrings = { }

var gefUISettings = {
    RATE_LIMIT_THRESHOLD: RATE_LIMIT_THRESHOLD
    FF_PORTAL_FACILITY_AMENDMENTS_ENABLED : FF_PORTAL_FACILITY_AMENDMENTS_ENABLED
    GEF_DEAL_VERSION: GEF_DEAL_VERSION
    MAINTENANCE_ACTIVE: MAINTENANCE_ACTIVE
    MAINTENANCE_TIMESTAMP: MAINTENANCE_TIMESTAMP
}

var gefUISecureSettings = {
  SESSION_SECRET: SESSION_SECRET
}

var gefUIAdditionalSecureSettings = {
  PORTAL_API_KEY: PORTAL_API_KEY
  FF_PORTAL_FACILITY_AMENDMENTS_ENABLED : FF_PORTAL_FACILITY_AMENDMENTS_ENABLED
}

var gefUISecureConnectionStrings = { }
var gefUIAdditionalSecureConnectionStrings = { }

var tfmApiSettings = {
  RATE_LIMIT_THRESHOLD: RATE_LIMIT_THRESHOLD
  AZURE_UTILISATION_REPORTS_FILESHARE_NAME: AZURE_UTILISATION_REPORTS_FILESHARE_NAME
  AZURE_ACBS_FUNCTION_URL: AZURE_ACBS_FUNCTION_URL
  CASH_UTILISATION_PERCENTAGE: CASH_UTILISATION_PERCENTAGE
  DELETION_AUDIT_LOGS_TTL_SECONDS: DELETION_AUDIT_LOGS_TTL_SECONDS
  CHANGE_STREAM_ENABLED: CHANGE_STREAM_ENABLED
  CONTINGENT_UTILISATION_PERCENTAGE: CONTINGENT_UTILISATION_PERCENTAGE
  ENTRA_ID_CLIENT_ID: ENTRA_ID_CLIENT_ID
  ENTRA_ID_CLIENT_SECRET: ENTRA_ID_CLIENT_SECRET
  ENTRA_ID_CLOUD_INSTANCE: ENTRA_ID_CLOUD_INSTANCE
  ENTRA_ID_REDIRECT_URL: ENTRA_ID_REDIRECT_URL
  ENTRA_ID_TENANT_ID: ENTRA_ID_TENANT_ID
  FF_PORTAL_FACILITY_AMENDMENTS_ENABLED : FF_PORTAL_FACILITY_AMENDMENTS_ENABLED
  FF_SALESFORCE_CUSTOMER_CREATION_ENABLED: FF_SALESFORCE_CUSTOMER_CREATION_ENABLED
  FF_TFM_DEAL_CANCELLATION_ENABLED : FF_TFM_DEAL_CANCELLATION_ENABLED
  FF_TFM_FACILITY_END_DATE_ENABLED: FF_TFM_FACILITY_END_DATE_ENABLED
  JWT_SIGNING_KEY: JWT_SIGNING_KEY
  MAINTENANCE_ACTIVE: MAINTENANCE_ACTIVE
  MAINTENANCE_TIMESTAMP: MAINTENANCE_TIMESTAMP
  DTFS_CENTRAL_API_URL: DTFS_CENTRAL_API_URL
  DTFS_CENTRAL_API: DTFS_CENTRAL_API_URL
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
  TFM_UI_URL: TFM_UI_URL
}

var tfmApiSecureConnectionStrings = { }
var tfmApiAdditionalSecureConnectionStrings = { }

module networkSecurityGroup 'modules/gw-nsg.bicep' = {
  name: 'networkSecurityGroup'
  params: {
    location: location
    product: product
    version: version
    target: target
    frontDoorAccess: frontDoorAccess
    apiPortalAccessPort: parametersMap[environment].apiPortalAccessPort
    nsgSourceAddressPrefix: nsgSourceAddressPrefix  
    ukefSourceAddressPrefix: ukefSourceAddressPrefix  
    testSourceAddressPrefix: testSourceAddressPrefix
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

resource appServicePlan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: 'appservice-plan-${product}-${target}-${version}'
  location: location
  sku: {
    name: parametersMap[environment].asp.sku
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' = {
  name: 'cr${product}${target}${version}${uniqueString(resourceGroup().id)}'
  location: location
  sku: parametersMap[environment].cr.sku
  properties: {
    adminUserEnabled: true //Admin is enabled for optional Azure portal functionality
  }
}

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2025-02-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    workspaceCapping: {
      dailyQuotaGb: 1
    }
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

module routeTable 'modules/route-tables.bicep' = {
  name: 'routeTable'
  params: {
    location: location
    product: product
    version: version
    target: target
    productionSubnetCidr: productionSubnetCidr
    nextHopIpAddress: routeTableNextHopIpAddress
  }
}

module tfsIp 'modules/tfs-ip.bicep' = {
  name: 'tfsIp'
  params: {
    location: location
    product: product
    version: version
    target: target
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
    product: product
    version: version
    target: target
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    gatewaySubnetId: vnet.outputs.gatewaySubnetId
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    onPremiseNetworkIpsString: onPremiseNetworkIpsString
    networkAccessDefaultAction: parametersMap[environment].nsg.storageNetworkAccessDefaultAction
    shareDeleteRetentionEnabled: shareDeleteRetentionEnabled
    filesDnsZoneId: filesDns.outputs.filesDnsZoneId
  }
}

  module cosmosDb 'modules/cosmosdb.bicep' = {
  name: 'mongoDb'
  params: {
    location: location
    product: product
    target: target
    version: version
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    mongoDbDnsZoneId: mongoDbDns.outputs.mongoDbDnsZoneId
    databaseName: parametersMap[environment].cosmosDb.databaseName
    allowedIpsString: onPremiseNetworkIpsString
    azurePortalIpsString: azurePortalIpsString
    capacityMode: parametersMap[environment].cosmosDb.capacityMode
    backupPolicyTier: parametersMap[environment].cosmosDb.backupPolicyTier
  }
}

module redis 'modules/redis.bicep' = {
  name: 'redis'
  params: {
    location: location
    product: product
    version: version
    target: target
    sku: parametersMap[environment].redis.sku
  }
}

module clamAv 'modules/clamav-aca.bicep' = {
  name: 'clamAv'
  params: {
    location: location
    product: product
    version: version
    target: target
    acaClamAvSubnetId: vnet.outputs.acaClamAvSubnetId
    logAnalyticsWorkspaceName: logAnalyticsWorkspace.name
    containerRegistryName: containerRegistry.name
  }
}

module functionAcbs 'modules/function-acbs.bicep' = {
  name: 'functionAcbs'
  params: {
    environment: environment
    product: product
    version: version
    target: target
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
    azureDnsServerIp: azureDnsServerIp
    timeZone: timeZone
  }
}

module functionNumberGenerator 'modules/function-number-generator.bicep' = {
  name: 'functionNumberGenerator'
  params: {
    environment: environment
    location: location
    product: product
    version: version
    target: target
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
    azureDnsServerIp: azureDnsServerIp
    timeZone: timeZone
  }
}

module externalApi 'modules/webapps/external-api.bicep' = {
  name: 'externalApi'
  params: {
    location: location
    environment: environment
    product: product
    version: version
    target: target
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
    azureDnsServerIp: azureDnsServerIp
    timeZone: timeZone
    websiteHttploggingRetentionDays: websiteHttploggingRetentionDays
  }
}

module dtfsCentralApi 'modules/webapps/dtfs-central-api.bicep' = {
  name: 'dtfsCentralApi'
  params: {
    location: location
    environment: environment
    product: product
    version: version
    target: target
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
    azureDnsServerIp: azureDnsServerIp
    timeZone: timeZone
    websiteHttploggingRetentionDays: websiteHttploggingRetentionDays
  }
}

module portalApi 'modules/webapps/portal-api.bicep' = {
  name: 'portalApi'
  params: {
    product: product
    version: version
    target: target
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
    azureDnsServerIp: azureDnsServerIp
    websiteHttploggingRetentionDays: websiteHttploggingRetentionDays
    websiteDynamicCache: websiteDynamicCache
    websiteNodeDefaultVersion: websiteNodeDefaultVersion
    timeZone: timeZone
  }
}

module tfmApi 'modules/webapps/trade-finance-manager-api-no-calculated-variables.bicep' = {
  name: 'tfmApi'
  params: {
    product: product
    version: version
    target: target
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

module portalUI 'modules/webapps/portal-ui.bicep' = {
  name: 'portalUI'
  params: {
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    containerRegistryName: containerRegistry.name
    location: location
    product: product
    version: version
    target: target
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    portalApiHostname: portalApi.outputs.defaultHostName
    redisName: redis.outputs.redisName
    tfmApiHostname: tfmApi.outputs.defaultHostName
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
    settings: portalUISettings
    secureSettings: portalUISecureSettings
    additionalSecureSettings: portalUIAdditionalSecureSettings
    secureConnectionStrings: portalUISecureConnectionStrings
    additionalSecureConnectionStrings: portalUIAdditionalSecureConnectionStrings
    clamAvSettings: {
      ipAddress: clamAv.outputs.exposedIp
      port: clamAv.outputs.exposedPort
    }
    azureDnsServerIp: azureDnsServerIp
    websiteHttploggingRetentionDays: websiteHttploggingRetentionDays
    websiteHealthcheckingMax: websiteHealthcheckingMax
  }
}

module tfmUI 'modules/webapps/trade-finance-manager-ui.bicep' = {
  name: 'tfmUI'
  params: {
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    containerRegistryName: containerRegistry.name
    environment: environment
    location: location
    product: product
    version: version
    target: target
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    redisName: redis.outputs.redisName
    tfmApiHostname: tfmApi.outputs.defaultHostName
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
    settings: tfmUISettings
    secureSettings: tfmUISecureSettings
    additionalSecureSettings: tfmUIAdditionalSecureSettings
    secureConnectionStrings: tfmUISecureConnectionStrings
    additionalSecureConnectionStrings: tfmUIAdditionalSecureConnectionStrings
    azureDnsServerIp: azureDnsServerIp
    timeZone: timeZone
    websiteHttploggingRetentionDays: websiteHttploggingRetentionDays
  }
}

module gefUI 'modules/webapps/gef-ui.bicep' = {
  name: 'gefUI'
  params: {
    appServicePlanEgressSubnetId: vnet.outputs.appServicePlanEgressSubnetId
    appServicePlanId: appServicePlan.id
    containerRegistryName: containerRegistry.name
    environment: environment
    location: location
    product: product
    version: version
    target: target
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.id
    privateEndpointsSubnetId: vnet.outputs.privateEndpointsSubnetId
    portalApiHostname: portalApi.outputs.defaultHostName
    redisName: redis.outputs.redisName
    azureWebsitesDnsZoneId: websitesDns.outputs.azureWebsitesDnsZoneId
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
    settings: gefUISettings
    secureSettings: gefUISecureSettings
    additionalSecureSettings: gefUIAdditionalSecureSettings
    secureConnectionStrings: gefUISecureConnectionStrings
    additionalSecureConnectionStrings: gefUIAdditionalSecureConnectionStrings
    azureDnsServerIp: azureDnsServerIp
    timeZone: timeZone
    websiteHttploggingRetentionDays: websiteHttploggingRetentionDays
  }
}

module applicationGatewayPortal 'modules/application-gateway-portal.bicep' = {
  name: 'applicationGatewayPortal'
  params: {
    location: location
    product: product
    version: version
    target: target
    gatewaySubnetId: vnet.outputs.gatewaySubnetId
    tfsIpId: tfsIp.outputs.tfsIpId
    portalApiHostname: portalApi.outputs.defaultHostName
    portalUIHostname: portalUI.outputs.defaultHostName
    gefUIHostname: gefUI.outputs.defaultHostName
    apiPortalAccessPort: parametersMap[environment].apiPortalAccessPort
  }
}

module applicationGatewayTfm 'modules/application-gateway-tfm.bicep' = {
  name: 'applicationGatewayTfm'
  params: {
    location: location
    product: product
    version: version
    target: target
    gatewaySubnetId: vnet.outputs.gatewaySubnetId
    tfsTfmIpId: tfsIp.outputs.tfsTfmIpId
    tfmUIHostname: tfmUI.outputs.defaultHostName
  }
}

module wafPoliciesIpRestricted 'modules/waf-policies.bicep' = {
  name: 'wafPoliciesIpRestricted'
  params: {
    product: product
    version: version
    target: target
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

module wafPoliciesNoIpRestriction 'modules/waf-policies.bicep' = {
  name: 'wafPoliciesNoIpRestriction'
  params: {
    product: product
    version: version
    target: target
    allowedIpsString: onPremiseNetworkIpsString
    matchVariable: parametersMap[environment].wafPolicies.matchVariable
    redirectUrl: redirectUrl
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
    product: product
    version: version
    target: target
    wafPoliciesId: parametersMap[environment].wafPolicies.restrictPortalAccessToUkefIps ? wafPoliciesIpRestricted.outputs.wafPoliciesId : wafPoliciesNoIpRestriction.outputs.wafPoliciesId
  }
  dependsOn: [applicationGatewayPortal]
}

module frontDoorTfm 'modules/front-door-tfm.bicep' = {
  name: 'frontDoorTfm'
  params: {
    backendPoolIp: tfsIp.outputs.tfsTfmIpAddress
    product: product
    version: version
    target: target
    wafPoliciesId: wafPoliciesIpRestricted.outputs.wafPoliciesId
  }
  dependsOn: [applicationGatewayTfm]
}

var tfmUIUrl = 'https://${frontDoorTfm.outputs.defaultHostName}'

module tfmApiCalculatedVariables 'modules/webapps/trade-finance-manager-api-calculated-variables.bicep' = {
  name: 'tfmApiCalculatedVariables'
  params: {
    cosmosDbAccountName: cosmosDb.outputs.cosmosDbAccountName
    cosmosDbDatabaseName: cosmosDb.outputs.cosmosDbDatabaseName
    product: product
    version: version
    target: target
    containerRegistryName: containerRegistry.name
    dtfsCentralApiHostname: dtfsCentralApi.outputs.defaultHostName
    externalApiHostname: externalApi.outputs.defaultHostName
    nodeDeveloperMode: parametersMap[environment].nodeDeveloperMode
    numberGeneratorFunctionDefaultHostName: functionNumberGenerator.outputs.defaultHostName
    secureConnectionStrings: tfmApiSecureConnectionStrings
    additionalSecureConnectionStrings: tfmApiAdditionalSecureConnectionStrings
    tfmUIUrl: tfmUIUrl
    storageAccountName: storage.outputs.storageAccountName
    settings: tfmApiSettings
    secureSettings: tfmApiSecureSettings
    additionalSecureSettings: tfmApiAdditionalSecureSettings
    azureDnsServerIp: azureDnsServerIp
    timeZone: timeZone
    websiteHttploggingRetentionDays: websiteHttploggingRetentionDays
  }
}
