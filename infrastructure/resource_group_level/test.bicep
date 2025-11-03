param product string = 'app'
param target string = 'core'
param version string = 'v1'

param peeringVnetName string = "vnet-peer-uks-${product}-${target}-${version}"

output name string = peeringVnetName
