// We need to add the connection strings separately beacause the value tfmUri comes from the TFM front-door, which would produce a circulare dependency.

param environment string
param cosmosDbAccountName string
param cosmosDbDatabaseName string
param numberGeneratorFunctionDefaultHostName string
param tfmUiUrl string

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

var connectionStringsCalculated = {  
  MONGO_INITDB_DATABASE: {
    type: 'Custom'
    value: cosmosDbDatabaseName
  }
  MONGODB_URI: {
    type: 'Custom'
    value: mongoDbConnectionString
  }
  AZURE_NUMBER_GENERATOR_FUNCTION_URL: {
    type: 'Custom'
    value: 'https://${numberGeneratorFunctionDefaultHostName}'
  }
  TFM_UI_URL: {
    type: 'Custom'
    value: tfmUiUrl
  }
} 

var connectionStringsCombined = union(connectionStringsProperties, connectionStringsCalculated)

resource site 'Microsoft.Web/sites@2022-09-01' existing = {
  name: tfmApiName
}

resource webappConnectionStrings 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: site
  name: 'connectionstrings'
  properties: connectionStringsCombined
}
