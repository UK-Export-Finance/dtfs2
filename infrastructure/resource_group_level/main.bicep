param location string  = resourceGroup().location


module tfsIp 'modules/tfs-ip.bicep' = {
  name: 'tfsIp'
}
