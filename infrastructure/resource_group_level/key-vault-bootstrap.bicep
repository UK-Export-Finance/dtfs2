param product string
param environment string
param version string
param location string
param deploymentPrincipalObjectId string

var keyVaultName = 'kv-${product}-${environment}-${version}'

module keyVault './modules/key-vault.bicep' = {
  name: 'key-vault'
  params: {
    keyVaultName: keyVaultName
    location: location
    deploymentPrincipalObjectId: deploymentPrincipalObjectId
  }
}
