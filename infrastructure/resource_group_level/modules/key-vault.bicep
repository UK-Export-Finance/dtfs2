param keyVaultName string
param location string = resourceGroup().location

resource keyVault 'Microsoft.KeyVault/vaults@2024-11-01' = {
  name: keyVaultName
  location: location

  properties: {
    tenantId: tenant().tenantId

    sku: {
      family: 'A'
      name: 'standard'
    }

    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true

    // Required if ARM/Bicep will retrieve secrets during deployment
    enabledForTemplateDeployment: true

    publicNetworkAccess: 'Disabled'
  }
}

output keyVaultName string = keyVault.name
output keyVaultId string = keyVault.id
output keyVaultUri string = keyVault.properties.vaultUri
