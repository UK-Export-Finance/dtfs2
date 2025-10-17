targetScope = 'subscription'

param location string = 'uksouth'
param resourceGroupName string = 'Digital-Feature'

// I probably don't need a resource group module and can probably do everything here...

module resourceGroup 'modules/resourceGroup.bicep' = {
  scope: subscription()
  name: 'resourceGroup'
  params: {
    resourceGroupLocation: location
    resourceGroupName: resourceGroupName
  }
}
