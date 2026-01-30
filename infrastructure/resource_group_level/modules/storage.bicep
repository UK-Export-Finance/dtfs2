param location string
param product string
param target string
param version string

// TODO:FN-931 Add access from external accounts if appropriate.

param appServicePlanEgressSubnetId string
param gatewaySubnetId string
param privateEndpointsSubnetId string

@description('IPs or CIDRs still allowed to access the storage if the default action is Deny')
@secure()
param onPremiseNetworkIpsString string

@description('Is public access to the storage account allowed or denied for evertone')
@allowed(['Allow', 'Deny'])
param networkAccessDefaultAction string

param shareDeleteRetentionEnabled bool

param filesDnsZoneId string

var storageAccountName = '${product}${target}${version}storage'

var allowedIps = json(onPremiseNetworkIpsString)

var queueNames = [
  'acbs-control-00'
  'acbs-control-01'
  'acbs-control-02'
  'acbs-control-03'
  'acbs-workitems'
  'durablefunctionshub-control-00'
  'durablefunctionshub-control-01'
  'durablefunctionshub-control-02'
  'durablefunctionshub-control-03'
  'durablefunctionshub-workitems'
  'numbergenerator-control-00'
  'numbergenerator-control-01'
  'numbergenerator-control-02'
  'numbergenerator-control-03'
  'numbergenerator-workitems'
]

var tableNames = [
  'acbsHistory'
  'acbsInstances'
  // TODO:FN-417 Is this needed? It seems rather transitory.
  'AzureFunctionsDiagnosticEvents202304'
  'DurableFunctionsHubHistory'
  'DurableFunctionsHubInstances'
  'numbergeneratorHistory'
  'numbergeneratorInstances'
]

var blobContainerNames = [
  'acbs-largemessages'
  'acbs-leases'
  'azure-webjobs-hosts'
  'azure-webjobs-secrets'
  'numbergenerator-leases'
]

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  tags: {}
  sku: {
    name: 'Standard_ZRS'
  }
  kind: 'StorageV2'
  properties: {
    defaultToOAuthAuthentication: false
    publicNetworkAccess: 'Enabled'
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    networkAcls: {
      resourceAccessRules: []
      bypass: 'AzureServices'
      virtualNetworkRules: [
        {
          id: appServicePlanEgressSubnetId
          action: 'Allow'
        }
        {
          id: gatewaySubnetId
          action: 'Allow'
        }
        {
          id: privateEndpointsSubnetId
          action: 'Allow'
        }
      ]
      ipRules: [for ip in allowedIps: {
        action: 'Allow'
        value: ip
      }]
      defaultAction: networkAccessDefaultAction
    }
    supportsHttpsTrafficOnly: true
    encryption: {
      services: {
        file: {
          keyType: 'Account'
          enabled: true
        }
        blob: {
          keyType: 'Account'
          enabled: true
        }
      }
      keySource: 'Microsoft.Storage'
    }
    accessTier: 'Hot'
  }
}

resource defaultBlobService 'Microsoft.Storage/storageAccounts/blobServices@2025-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    containerDeleteRetentionPolicy: {
      enabled: true
      days: 3
    }
    deleteRetentionPolicy: {
      allowPermanentDelete: false
      enabled: true
      days: 3
    }
  }
}

resource defaultFileService 'Microsoft.Storage/storageAccounts/fileServices@2025-01-01' = {
  parent: storageAccount
  name: 'default'
  // TODO:FN-693 Note that the extant environments don't have
  // 7 day soft deletes enabled. We may want to enable this functionality.
  properties: {
    shareDeleteRetentionPolicy: {
      enabled: shareDeleteRetentionEnabled
      days: 7
    }
  }
}

resource queueService 'Microsoft.Storage/storageAccounts/queueServices@2025-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2025-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource blobContainers 'Microsoft.Storage/storageAccounts/blobServices/containers@2025-01-01' = [for blobContainerName in blobContainerNames: {
  parent: defaultBlobService
  name: blobContainerName
  properties: {
    immutableStorageWithVersioning: {
      enabled: false
    }
    defaultEncryptionScope: '$account-encryption-key'
    denyEncryptionScopeOverride: false
    publicAccess: 'None'
  }
}]

resource fileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2025-01-01' = {
  parent: defaultFileService
  name: 'files'
  properties: {
    accessTier: 'TransactionOptimized'
    shareQuota: 5120
    enabledProtocols: 'SMB'
  }
}

resource portalFileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2025-01-01' = {
  parent: defaultFileService
  name: 'portal'
  properties: {
    accessTier: 'TransactionOptimized'
    shareQuota: 5120
    enabledProtocols: 'SMB'
  }
}

resource utilisationReportsFileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2025-01-01' = {
  parent: defaultFileService
  name: 'utilisation-reports'
  properties: {
    accessTier: 'TransactionOptimized'
    shareQuota: 5120
    enabledProtocols: 'SMB'
  }
}

resource queues 'Microsoft.Storage/storageAccounts/queueServices/queues@2025-01-01' = [for queueName in queueNames: {
  parent: queueService
  name: queueName
}]


resource tables 'Microsoft.Storage/storageAccounts/tableServices/tables@2025-01-01' = [for tableName in tableNames: {
  parent: tableService
  name: tableName
}]

// This resource definition is taken from the storage-private-endpoint export
resource storagePrivateEndpoint 'Microsoft.Network/privateEndpoints@2024-10-01' = {
  name: storageAccountName
  location: location
  tags: {}
  properties: {
    privateLinkServiceConnections: [
      {
        name: storageAccountName
        properties: {
          privateLinkServiceId: storageAccount.id
          groupIds: [
            'file'
          ]
        }
      }
    ]
    manualPrivateLinkServiceConnections: []
    subnet: {
      id: privateEndpointsSubnetId
    }
    ipConfigurations: []
    // Note that the customDnsConfigs array gets created automatically and doesn't need setting here.
  }
}

// We add this config in the "zone group" to trigger automatic CNAME (A Record) generation in the
// Private DNS Zone in the private link.
// https://stackoverflow.com/questions/69810938/what-is-azure-private-dns-zone-group
// https://learn.microsoft.com/en-us/azure/private-link/create-private-endpoint-bicep?tabs=CLI
// https://bhabalajinkya.medium.com/azure-bicep-private-communication-between-azure-resources-f4a17c171cfb
resource zoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-10-01' = {
  parent: storagePrivateEndpoint
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'zoneConfig'
        properties: {
          privateDnsZoneId: filesDnsZoneId
        }
      }
    ]
  }
}


output storageAccountName string = storageAccount.name
