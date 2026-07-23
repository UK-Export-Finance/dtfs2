targetScope = 'subscription'

param location string = 'uksouth'
param resourceGroupName string = 'Digital-Feature'

module resourceGroup 'modules/resourceGroup.bicep' = {
  scope: subscription()
  name: 'resourceGroup'
  params: {
    resourceGroupLocation: location
    resourceGroupName: resourceGroupName
  }
}
