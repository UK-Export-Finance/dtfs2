targetScope = 'subscription'

param resourceGroupName string
param resourceGroupLocation string

resource resourceGroup 'Microsoft.Resources/resourceGroups@2022-09-01' = {
  name: resourceGroupName
  location: resourceGroupLocation
}
