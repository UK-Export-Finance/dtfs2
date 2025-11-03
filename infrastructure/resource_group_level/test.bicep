param product string = 'app'
param target string = 'core'
param version string = 'v1'

param peeringVnetName string = concat('vnet-peer-uks-', product, '-', target, '-', version)
param peeringVnetNameInter string = "vnet-peer-uks-${product}-${target}-${version}"

output name string = peeringVnetName
