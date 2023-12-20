// We need to add the calculated variables separately beacause the value tfmUri comes from the TFM front-door, which would produce a circular dependency.
// See the notes in trade-finance-manager-api-no-calculated-variables.bicep

param environment string
param cosmosDbAccountName string
param cosmosDbDatabaseName string
param numberGeneratorFunctionDefaultHostName string
param tfmUiUrl string
param appSettings object

var tfmApiNameFragment = 'trade-finance-manager-api'
var tfmApiName = 'tfs-${environment}-${tfmApiNameFragment}'

// These values are taken from GitHub secrets injected in the GHA Action
@secure()
param secureConnectionStrings object

// These values are taken from an export of Connection strings on Dev (& validating with staging).
@secure()
param additionalSecureConnectionStrings object


var connectionStringsList = [for item in items(union(secureConnectionStrings, additionalSecureConnectionStrings)): {
  name: item.key
  value: item.value
} ]

var connectionStringsProperties = toObject(connectionStringsList, item => item.name, item => {
  type: 'Custom'
  value: item.value
} )

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' existing = {
  name: cosmosDbAccountName
}

// Then there are the calculated values.
var mongoDbConnectionString = replace(cosmosDbAccount.listConnectionStrings().connectionStrings[0].connectionString, '&replicaSet=globaldb', '')

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' existing = {
  name: storageAccountName
}
var storageAccountKey = storageAccount.listKeys().keys[0].value

var calculatedAppSettings = {
  MONGO_INITDB_DATABASE: cosmosDbDatabaseName
  MONGODB_URI: mongoDbConnectionString
  AZURE_NUMBER_GENERATOR_FUNCTION_URL: 'https://${numberGeneratorFunctionDefaultHostName}'
  TFM_UI_URL: tfmUiUrl
  AZURE_PORTAL_STORAGE_ACCESS_KEY: storageAccountKey
  AZURE_PORTAL_STORAGE_ACCOUNT: storageAccountName
}

var appSettingsCombined = union(appSettings, calculatedAppSettings)

resource site 'Microsoft.Web/sites@2022-09-01' existing = {
  name: tfmApiName
}

resource webappSetting 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: site
  name: 'appsettings'
  properties: appSettingsCombined
}

resource webappConnectionStrings 'Microsoft.Web/sites/config@2022-09-01' = if (!empty(connectionStringsList)) {
  parent: site
  name: 'connectionstrings'
  properties: connectionStringsProperties
}
