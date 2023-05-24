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

// I probbaly don't need a resource group module and can probably do everything here...
