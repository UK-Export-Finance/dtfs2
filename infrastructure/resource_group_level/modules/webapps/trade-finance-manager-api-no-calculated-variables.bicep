// Note that we don't set the app settings & connection strings when creating the tfm-api webapp.
// This is because we need to include the TFM front door hostname which would set
// up a circular dependency. We avoid this by calculating and setting the variables
// separately later.
// The alternative is to set them as normal and union the extra setting later.
// See: https://stackoverflow.com/questions/72940236/is-there-a-workaround-to-keep-app-settings-which-not-defined-in-bicep-template
// However, I encountered issues with the type of the fetched connection strings
// then not matching the object type needed to set them.

param location string
param environment string
param containerRegistryName string
param appServicePlanEgressSubnetId string
param appServicePlanId string
param privateEndpointsSubnetId string
param logAnalyticsWorkspaceId string

param azureWebsitesDnsZoneId string
param product string
param target string
param version string

param resourceNameFragment string = 'trade-finance-manager-api'

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2025-04-01' existing = {
  name: containerRegistryName
}
var containerRegistryLoginServer = containerRegistry.properties.loginServer
var dockerImageName = '${containerRegistryLoginServer}/${resourceNameFragment}:${environment}'


module tfmApiWebapp 'webapp.bicep' = {
  name: 'tfmApiWebapp'
  params: {
    appServicePlanEgressSubnetId: appServicePlanEgressSubnetId
    appServicePlanId: appServicePlanId
    appSettings: {}
    azureWebsitesDnsZoneId: azureWebsitesDnsZoneId
    connectionStrings: {}
    deployApplicationInsights: false // TODO:DTFS2-6422 enable application insights
    dockerImageName: dockerImageName
    ftpsState: 'Disabled'
    product: product
    target: target
    version: version
    location: location
    logAnalyticsWorkspaceId: logAnalyticsWorkspaceId
    privateEndpointsSubnetId: privateEndpointsSubnetId
    resourceNameFragment: resourceNameFragment
    scmMinTlsVersion: '1.0'
  }
}

output defaultHostName string = tfmApiWebapp.outputs.defaultHostName
